import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useFirebaseApp } from '../couple/FirebaseAppContext.jsx'
import { useCouple } from '../couple/CoupleProvider.jsx'
import { activityRegistry } from './activityRegistry.jsx'
import {
  buildActivityJournalEntry,
  buildAnniversaryJournalEntry,
  buildDuelJournalEntry,
  buildFinaleJournalEntry,
  buildProgressJournalEntries,
  buildPromiseGrantedJournalEntry,
  buildSkippedActivityJournalEntry,
  buildVibeSetupJournalEntry,
} from './journalHelpers.js'
import { KEEPSAKES } from './boardConfig.js'
import { duelRegistry } from './duelRegistry.jsx'
import { WAVELENGTH_DUEL_ID } from './wavelengthDuelData.js'
import {
  advanceAfterDuel,
  applyMoodSeedToWeights,
  applyRollToSession,
  beginRoundDuel,
  buildFinalSummary,
  buildInitialSession,
  choosePendingActivity,
  ensureSessionArcState,
  evaluateDuelRound,
  finalizeVibeSetup,
  resolveActivityCompletion,
  resolveKeepsakeDecision,
  resolveSkippedActivity,
} from './sessionLogic.js'
import {
  abandonSession,
  appendJournalEntry,
  applyCoupleBoardReward,
  claimSessionHost as claimSessionHostDocument,
  createActivityRecord,
  ensureActiveSession,
  finalizeActivity,
  submitMoodVote as persistMoodVote,
  submitVibeVote as persistVibeVote,
  subscribeToActivity,
  subscribeToJournal,
  subscribeToSession,
  updateSessionState,
  updateSessionStateWithJournal,
} from './sessionService.js'
import { getSessionPreset } from './sessionPresets.js'
import {
  ensureCoupleProgress,
  grantKoupon,
  localDateStr,
  nextAnniversaryCountdown,
  recordNightComplete,
} from '../couple/progressService.js'
import {
  averageVibeVotes,
  buildBoardRewardPatch,
  createDefaultBoardState,
  DEFAULT_VIBE_WEIGHTS,
  pickWeightedActivityId,
  pickWeightedActivityOptions,
  pickWeightedDuelId,
} from './sessionWiring.js'

const SessionContext = createContext(null)
const SESSION_STALE_MS = 1000 * 60 * 15

export function resolveSessionHostId(session, couple) {
  return session?.hostId || session?.players?.[0]?.uid || couple?.players?.[0]?.uid || null
}

function toDateValue(value) {
  if (!value) {
    return null
  }

  if (typeof value.toDate === 'function') {
    return value.toDate()
  }

  const resolved = value instanceof Date ? value : new Date(value)
  return Number.isNaN(resolved.getTime()) ? null : resolved
}

function createPreviewPartnerVote(vote) {
  return {
    tender: vote.tender,
    playful: vote.playful,
    spicy: vote.spicy,
  }
}

function buildPreviewJournalRecord(entry, prefix, index) {
  return {
    ...entry,
    id: `preview-${prefix}-${index}`,
  }
}

function createActivityState(entry, session, random = Math.random) {
  return entry.createInitialState(session.players, {
    activePlayerIndex: session.activePlayerIndex,
    random,
  })
}

function buildSkippedDuelRepick(session) {
  const duelId = pickWeightedDuelId(
    session.vibeWeights || DEFAULT_VIBE_WEIGHTS,
    session.usedDuelIds,
  )

  return {
    ...session,
    actionText: 'That duel got skipped. One more pick, then the round moves on.',
    currentDuel: {
      ...session.currentDuel,
      attempt: session.currentDuel.attempt + 1,
      id: duelId,
      // A fresh duel gets a fresh reveal gate.
      revealAcks: {},
      revealForce: false,
    },
    duelResults: {},
    usedDuelIds: [...session.usedDuelIds, duelId],
  }
}

function getSkippedDuelOutcome(session) {
  const results = Object.values(session.duelResults || {})
  if (results.length < session.players.length) {
    return null
  }

  if (!results.some((result) => result?.skipped)) {
    return null
  }

  if ((session.currentDuel?.attempt ?? 1) >= 2) {
    return { status: 'noContest' }
  }

  return { status: 'repick' }
}

export function SessionProvider({ children }) {
  const { couple, hasPartner } = useCouple()
  const { db, enabled, ready, userId } = useFirebaseApp()
  const [session, setSession] = useState(null)
  const [activity, setActivity] = useState(null)
  const [journalEntries, setJournalEntries] = useState([])
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  const [boardState, setBoardState] = useState(createDefaultBoardState())
  const [connectionState, setConnectionState] = useState(enabled ? 'connecting' : 'local-preview')
  const resolvingDuelRef = useRef(false)
  const previewDuelContinueRef = useRef(null)
  const previewActivityStartedRef = useRef(false)
  const progressRecordedRef = useRef(false)

  const playerIndex = useMemo(() => {
    if (!enabled && session) {
      if (session.phase === 'activity' && activity) {
        return activity.state.turnIndex
      }
      return session.activePlayerIndex
    }

    return couple?.players?.findIndex((player) => player.uid === userId) ?? -1
  }, [activity, couple, enabled, session, userId])

  const localUserId = enabled ? userId : couple?.players?.[playerIndex]?.uid
  const sessionHostId = resolveSessionHostId(session, couple)
  const isHost = localUserId ? sessionHostId === localUserId : playerIndex === 0
  const canRoll = session?.phase === 'turn' && session.activePlayerIndex === playerIndex
  const canSpinDuel = isHost && session?.phase === 'duelWheel'
  const myDuelResult = useMemo(
    () => (localUserId ? session?.duelResults?.[localUserId] ?? null : null),
    [localUserId, session?.duelResults],
  )
  const myVibeVote = useMemo(
    () => (localUserId ? session?.vibeVotes?.[localUserId] ?? null : null),
    [localUserId, session?.vibeVotes],
  )
  const myMoodVote = useMemo(
    () => (localUserId ? session?.moodVotes?.[localUserId] ?? null : null),
    [localUserId, session?.moodVotes],
  )

  useEffect(() => {
    setBoardState(couple?.boardState || createDefaultBoardState())
  }, [couple?.boardState])

  useEffect(() => {
    if (!enabled && couple && hasPartner) {
      setSession((current) => {
        if (current) {
          return current
        }
        const initial = buildInitialSession(couple)
        return {
          ...initial,
          id: initial.id || 'preview-session',
        }
      })
      setConnectionState('local-preview')
      return undefined
    }

    if (!enabled || !db || !couple || !hasPartner || !isHost || couple.activeSessionId) {
      return undefined
    }

    ensureActiveSession(db, couple).catch((nextError) => setError(nextError.message))
    return undefined
  }, [couple, db, enabled, hasPartner, isHost])

  useEffect(() => {
    if (
      !import.meta.env.DEV ||
      enabled ||
      !session ||
      activity ||
      previewActivityStartedRef.current
    ) {
      return
    }

    const activityType = new URLSearchParams(window.location.search)
      .get('previewActivity')
    const entry = activityRegistry[activityType]
    if (!entry) {
      return
    }

    previewActivityStartedRef.current = true
    setSession({
      ...session,
      actionText: `${entry.label} preview is ready.`,
      pendingActivityType: activityType,
      phase: 'activity',
      usedActivityIds: Array.from(new Set([
        ...(session.usedActivityIds || []),
        activityType,
      ])),
    })
    setActivity({
      id: `preview-${activityType}`,
      state: createActivityState(entry, session, () => 0),
      type: activityType,
      vibe: entry.vibe,
    })
  }, [activity, enabled, session])

  useEffect(() => {
    if (!db || !couple?.activeSessionId) {
      if (enabled) {
        setSession(null)
        setConnectionState('connecting')
      }
      return undefined
    }

    return subscribeToSession(
      db,
      couple.activeSessionId,
      (nextSession, metadata) => {
        setSession(ensureSessionArcState(nextSession))
        setConnectionState(metadata?.fromCache ? 'syncing' : 'live')
      },
      (nextError) => setError(nextError.message),
    )
  }, [couple?.activeSessionId, db, enabled])

  // When a live night closes out, bank it into the couple's lifetime
  // progress exactly once: hearts, streaks, freeze tokens, trophies, and
  // milestone journal entries for the scrapbook. The transaction is
  // idempotent per session, so a retry or a second phone can never
  // double-bank the night or duplicate the journal entries.
  useEffect(() => {
    if (
      !enabled ||
      !db ||
      !couple ||
      session?.phase !== 'finale' ||
      session.progressRecorded ||
      progressRecordedRef.current
    ) {
      return undefined
    }

    progressRecordedRef.current = true
    let cancelled = false

    ;(async () => {
      try {
        // Anniversary nights earn bonus hearts with love. Computed before
        // banking so the bonus lands in heartsEarned.
        let anniversaryBonus = 0
        try {
          const progressDoc = await ensureCoupleProgress(db, couple.id)
          if (nextAnniversaryCountdown(progressDoc?.anniversary)?.days === 0) {
            anniversaryBonus = 8
          }
        } catch {
          anniversaryBonus = 0
        }

        const banked = await recordNightComplete(db, couple.id, {
          buildEntries: (events) =>
            [
              ...buildProgressJournalEntries({
                coupleId: couple.id,
                events,
                sessionId: session.id,
              }),
              anniversaryBonus > 0
                ? buildAnniversaryJournalEntry({
                    bonusHearts: anniversaryBonus,
                    coupleId: couple.id,
                    sessionId: session.id,
                  })
                : null,
            ].filter(Boolean),
          dateStr: localDateStr(),
          heartsEarned: (session.hearts || 0) + anniversaryBonus,
          sessionId: session.id,
          stats: {
            keepsakes: session.keepsakes?.length || 0,
            mutualYesMatches: session.mutualYesMatches || 0,
            preset: session.preset,
            sealedMatches: session.sealedMatches || 0,
            sharedDuelWins: session.sharedDuelWins || 0,
          },
        })

        // Only the phone that actually banks the night deals a promise from
        // the deck — the idempotency marker inside recordNightComplete keeps
        // both phones from dealing one each.
        if (!banked.alreadyRecorded) {
          try {
            const grant = await grantKoupon(db, couple.id)
            if (grant?.granted) {
              await appendJournalEntry(
                db,
                buildPromiseGrantedJournalEntry({
                  coupleId: couple.id,
                  detail: grant.granted.detail,
                  label: grant.granted.label,
                  sessionId: session.id,
                }),
              )
            }
          } catch {
            // A missing promise never fails the night.
          }
        }

        if (cancelled) {
          progressRecordedRef.current = false
        }
      } catch (nextError) {
        if (!cancelled) {
          progressRecordedRef.current = false
          setError(nextError.message)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [couple, db, enabled, session])

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    if (!db || !session?.pendingActivityId) {
      setActivity(null)
      return undefined
    }

    return subscribeToActivity(
      db,
      session.pendingActivityId,
      setActivity,
      (nextError) => setError(nextError.message),
    )
  }, [db, enabled, session?.pendingActivityId])

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    if (!db || !couple?.id) {
      setJournalEntries([])
      return undefined
    }

    return subscribeToJournal(
      db,
      couple.id,
      setJournalEntries,
      (nextError) => setError(nextError.message),
    )
  }, [couple?.id, db, enabled])

  const sessionPreset = useMemo(
    () => getSessionPreset(session?.preset),
    [session?.preset],
  )
  const lastActionAt = toDateValue(session?.lastActionAt)
  const isSessionStale = Boolean(
    enabled &&
    session &&
    session.status === 'active' &&
    lastActionAt &&
    Date.now() - lastActionAt.getTime() > SESSION_STALE_MS,
  )
  const canRecoverSession = Boolean(enabled && session && (isHost || isSessionStale))

  const sessionStatusMessage = useMemo(() => {
    if (!session) {
      return ''
    }

    if (!enabled) {
      return 'Local preview only. Firebase pairing and resume are disabled here.'
    }

    if (connectionState === 'syncing') {
      return 'Sync is catching up on this phone.'
    }

    if (isSessionStale) {
      return 'This night looks stalled. Resume or start a fresh run from here.'
    }

    if (session.phase === 'turn') {
      return canRoll
        ? 'Your turn. Roll when you are ready.'
        : `${session.players[session.activePlayerIndex]?.displayName || 'Your partner'} is taking their turn.`
    }

    if (session.phase === 'duelWheel' && !canSpinDuel) {
      return `${session.players[0]?.displayName || 'The host'} is lining up the duel spin.`
    }

    if (session.phase === 'activityChoice') {
      return session.activePlayerIndex === playerIndex
        ? 'Pick the next connection beat.'
        : `${session.players[session.activePlayerIndex]?.displayName || 'Your partner'} is choosing the next beat.`
    }

    return session.actionText
  }, [canRoll, canSpinDuel, connectionState, enabled, isSessionStale, session])

  useEffect(() => {
    if (
      !enabled ||
      !db ||
      !isHost ||
      !session ||
      session.phase !== 'duel' ||
      !session.currentDuel ||
      resolvingDuelRef.current
    ) {
      return
    }

    const skippedOutcome = getSkippedDuelOutcome(session)
    const bothSubmittedOutcome = skippedOutcome || evaluateDuelRound(session, duelRegistry)
    if (bothSubmittedOutcome.status === 'pending') {
      return
    }

    // The reveal overlay holds the duel until both partners acknowledge it
    // (or the host forces the advance after the waiting window).
    const revealAcks = session.currentDuel.revealAcks || {}
    const bothAcked = session.players.every((player) => revealAcks[player.uid] === true)
    if (!bothAcked && session.currentDuel.revealForce !== true) {
      return
    }

    if (skippedOutcome?.status === 'repick') {
      resolvingDuelRef.current = true
      const duel = duelRegistry[session.currentDuel.id]
      const duelJournalEntry = buildDuelJournalEntry({
        coupleId: couple.id,
        duel,
        duelResults: session.duelResults,
        heartBonus: session.currentDuel.heartBonus,
        outcome: skippedOutcome,
        players: session.players,
        session,
        sessionId: session.id,
      })
      Promise.resolve()
        .then(async () => {
          await updateSessionStateWithJournal(
            db,
            session.id,
            buildSkippedDuelRepick(session),
            [duelJournalEntry],
          )
        })
        .catch((nextError) => setError(nextError.message))
        .finally(() => {
          resolvingDuelRef.current = false
        })
      return
    }

    const outcome = bothSubmittedOutcome
    resolvingDuelRef.current = true

    const duel = duelRegistry[session.currentDuel.id]
    // Duels like Wavelength award hearts from the scored result (matches),
    // not from the fixed wheel bonus.
    const heartBonus =
      duel?.resolveHearts && (outcome.status === 'shared' || outcome.status === 'resolved')
        ? duel.resolveHearts(
            session.duelResults[session.players[0]?.uid],
            session.duelResults[session.players[1]?.uid],
          )
        : session.currentDuel.heartBonus
    const nextSession = advanceAfterDuel(
      {
        ...session,
        currentDuel: { ...session.currentDuel, heartBonus },
      },
      outcome,
      duel,
    )
    const duelJournalEntry = buildDuelJournalEntry({
      coupleId: couple.id,
      duel,
      duelResults: session.duelResults,
      heartBonus,
      outcome,
      players: session.players,
      session,
      sessionId: session.id,
    })
    const finaleJournalEntry =
      nextSession.phase === 'finale'
        ? buildFinaleJournalEntry({
            coupleId: couple.id,
            journalEntries: duelJournalEntry ? [duelJournalEntry, ...journalEntries] : journalEntries,
            session: nextSession,
            sessionId: session.id,
          })
        : null

    Promise.resolve()
      .then(async () => {
        await updateSessionStateWithJournal(
          db,
          session.id,
          nextSession,
          [duelJournalEntry, finaleJournalEntry],
        )

        if (outcome.status !== 'noContest') {
          await applyCoupleBoardReward(db, couple.id, duel.vibe, duel.id)
          setBoardState((current) => buildBoardRewardPatch(current, duel.vibe, duel.id))
        }
      })
      .catch((nextError) => setError(nextError.message))
      .finally(() => {
        resolvingDuelRef.current = false
      })
  }, [couple?.id, db, enabled, isHost, journalEntries.length, session])

  async function rollTurn() {
    if (!session || !canRoll || working) {
      return
    }

    setWorking(true)
    setError('')

    try {
      const roll = Math.floor(Math.random() * 6) + 1
      // The night's first roll is seeded by the couple's combined mood pulse:
      // the opening activity leans into how they actually arrived tonight.
      const isFirstRoll = session.lastRoll == null
      const pickWeights = isFirstRoll
        ? applyMoodSeedToWeights(session.vibeWeights || DEFAULT_VIBE_WEIGHTS, session.moodVotes)
        : session.vibeWeights || DEFAULT_VIBE_WEIGHTS
      const activityType = pickWeightedActivityId(
        pickWeights,
        session.usedActivityIds,
        Math.random,
        { preset: session.preset },
      )
      const activityOptions = pickWeightedActivityOptions(
        pickWeights,
        session.usedActivityIds,
        2,
        Math.random,
        { preset: session.preset },
      )
      const keepsakeId = KEEPSAKES[Math.floor(Math.random() * KEEPSAKES.length)].id
      const nextSession = applyRollToSession(session, {
        activityOptions,
        activityType,
        keepsakeId,
        roll,
      })

      if (!enabled) {
        setSession(nextSession)
        if (nextSession.phase === 'activity') {
          const entry = activityRegistry[nextSession.pendingActivityType]
          setActivity({
            id: 'preview-activity',
            type: nextSession.pendingActivityType,
            vibe: entry.vibe,
            state: createActivityState(entry, session),
          })
        }
        return
      }

      await updateSessionState(db, session.id, nextSession)

      if (nextSession.phase === 'activity') {
        const entry = activityRegistry[nextSession.pendingActivityType]
        await createActivityRecord(
          db,
          session,
          nextSession.pendingActivityType,
          createActivityState(entry, session),
        )
      }
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  async function selectActivityOption(activityType) {
    if (!session || session.phase !== 'activityChoice' || working) {
      return
    }

    setWorking(true)
    setError('')

    try {
      const nextSession = choosePendingActivity(session, activityType)

      if (!enabled) {
        const entry = activityRegistry[activityType]
        setSession(nextSession)
        setActivity({
          id: 'preview-activity',
          type: activityType,
          vibe: entry.vibe,
          state: createActivityState(entry, session),
        })
        return
      }

      await updateSessionState(db, session.id, nextSession)
      const entry = activityRegistry[activityType]
      await createActivityRecord(
        db,
        session,
        activityType,
        createActivityState(entry, session),
      )
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  async function chooseKeepsake(shouldBuy) {
    if (!session || session.phase !== 'keepsake') {
      return
    }

    setWorking(true)
    try {
      const nextSession = resolveKeepsakeDecision(session, shouldBuy)
      if (!enabled) {
        setSession(nextSession)
        if (shouldBuy && session.pendingKeepsake && session.hearts >= session.pendingKeepsake.cost) {
          setJournalEntries((current) => [
            buildPreviewJournalRecord(
              {
                payload: session.pendingKeepsake,
                summary: `You spent ${session.pendingKeepsake.cost} hearts on ${session.pendingKeepsake.label}.`,
                text: session.pendingKeepsake.blurb,
                title: session.pendingKeepsake.label,
                type: 'keepsake',
                vibe: 'tender',
              },
              'keep',
              current.length,
            ),
            ...current,
          ])
        }
        return
      }

      await updateSessionState(db, session.id, nextSession)

      if (shouldBuy && session.pendingKeepsake && session.hearts >= session.pendingKeepsake.cost) {
        await appendJournalEntry(db, {
          coupleId: couple.id,
          payload: session.pendingKeepsake,
          summary: `You spent ${session.pendingKeepsake.cost} hearts on ${session.pendingKeepsake.label}.`,
          text: session.pendingKeepsake.blurb,
          title: session.pendingKeepsake.label,
          type: 'keepsake',
          vibe: 'tender',
        })
      }
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  async function spinDuelWheel() {
    if (!session || !canSpinDuel) {
      return
    }

    const duelId = pickWeightedDuelId(
      session.vibeWeights || DEFAULT_VIBE_WEIGHTS,
      session.usedDuelIds,
      Math.random,
      { preset: session.preset },
    )
    const nextSession = beginRoundDuel(session, duelId)
    if (!enabled) {
      setSession(nextSession)
      return
    }

    await updateSessionState(db, session.id, nextSession)
  }

  async function submitVibeVote(vote) {
    if (!session || session.phase !== 'vibeSetup' || working || myVibeVote) {
      return
    }

    setWorking(true)
    setError('')

    try {
      if (!enabled) {
        const selfId = session.players[playerIndex]?.uid || 'preview-you'
        const partnerId = session.players[playerIndex === 0 ? 1 : 0]?.uid || 'preview-echo'
        const vibeVotes = {
          [selfId]: vote,
          [partnerId]: createPreviewPartnerVote(vote),
        }
        const vibeWeights = averageVibeVotes(vibeVotes)
        const journalEntry = buildVibeSetupJournalEntry({
          coupleId: couple.id,
          moodVotes: session.moodVotes,
          players: session.players,
          sessionId: session.id,
          vibeVotes,
          vibeWeights,
        })
        setJournalEntries((current) => [
          buildPreviewJournalRecord(journalEntry, 'vibe-setup', current.length),
          ...current,
        ])
        setSession(finalizeVibeSetup({ ...session, vibeVotes }, vibeWeights))
        return
      }

      await persistVibeVote(db, session.id, userId, vote)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  async function submitMoodVote(mood) {
    if (!session || working || myMoodVote) {
      return
    }

    setWorking(true)
    setError('')

    try {
      if (!enabled) {
        const selfId = session.players[playerIndex]?.uid || 'preview-you'
        setSession({
          ...session,
          moodVotes: {
            ...session.moodVotes,
            [selfId]: mood,
          },
        })
        return
      }

      await persistMoodVote(db, session.id, userId, mood)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  async function submitActivityTurn(input) {
    if (!activity || !session || playerIndex < 0 || working) {
      return
    }

    const entry = activityRegistry[activity.type]
    const advanced = entry.advance(activity.state, {
      input,
      playerIndex,
    })

    setWorking(true)

    try {
      if (!enabled) {
        if (!advanced.completed) {
          setActivity((current) => ({ ...current, state: advanced.state }))
          return
        }

        const result = entry.resolve(advanced.state, session.players)
        const nextSession = resolveActivityCompletion(session, result)
        const journalEntry = buildActivityJournalEntry({
          coupleId: couple.id,
          result,
          sessionId: session.id,
        })

        if (journalEntry) {
          setJournalEntries((current) => [
            buildPreviewJournalRecord(journalEntry, 'activity', current.length),
            ...current,
          ])
        }

        setBoardState((current) => buildBoardRewardPatch(current, result.vibe, activity.type))
        setSession(nextSession)
        setActivity(null)
        return
      }

      if (!advanced.completed) {
        await updateDoc(doc(db, 'activities', activity.id), {
          state: advanced.state,
          updatedAt: serverTimestamp(),
        })
        return
      }

      const result = entry.resolve(advanced.state, session.players)
      const nextSession = resolveActivityCompletion(session, result)
      const journalEntry = buildActivityJournalEntry({
        coupleId: couple.id,
        result,
        sessionId: session.id,
      })

      await finalizeActivity({
        activityId: activity.id,
        activityResult: result,
        db,
        journalEntry,
        nextSession,
        sessionId: session.id,
        state: advanced.state,
      })
      await applyCoupleBoardReward(db, couple.id, result.vibe, activity.type)
      setBoardState((current) => buildBoardRewardPatch(current, result.vibe, activity.type))
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  async function skipActivity() {
    if (!activity || !session || working) {
      return
    }

    setWorking(true)
    setError('')

    const nextSession = resolveSkippedActivity(session, activityRegistry[activity.type].label)
    const usedPocketLoveNote =
      !session.usedKeepsakePerks?.includes('pocket-love-note') &&
      nextSession.usedKeepsakePerks?.includes('pocket-love-note')
    const skipJournalEntry =
      buildSkippedActivityJournalEntry({
        activity: {
          ...activity,
          label: activityRegistry[activity.type].label,
          vibe: activityRegistry[activity.type].vibe,
        },
        coupleId: couple.id,
        sessionId: session.id,
        usedPocketLoveNote,
      })

    try {
      if (!enabled) {
        if (skipJournalEntry) {
          setJournalEntries((current) => [
            buildPreviewJournalRecord(skipJournalEntry, 'skip', current.length),
            ...current,
          ])
        }
        setSession(nextSession)
        setActivity(null)
        return
      }

      await finalizeActivity({
        activityId: activity.id,
        activityResult: {
          skipped: true,
          title: activityRegistry[activity.type].label,
        },
        db,
        journalEntry: skipJournalEntry,
        nextSession,
        sessionId: session.id,
        state: activity.state,
        status: 'skipped',
      })
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  async function ackDuelReveal() {
    if (!enabled || !session?.currentDuel || !userId) {
      return
    }

    try {
      await updateDoc(doc(db, 'sessions', session.id), {
        [`currentDuel.revealAcks.${userId}`]: true,
        updatedAt: serverTimestamp(),
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function forceDuelReveal() {
    if (!enabled || !session?.currentDuel || !isHost) {
      return
    }

    try {
      await updateDoc(doc(db, 'sessions', session.id), {
        'currentDuel.revealForce': true,
        updatedAt: serverTimestamp(),
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  function continuePreviewDuel() {
    const continueDuel = previewDuelContinueRef.current
    previewDuelContinueRef.current = null
    continueDuel?.()
  }

  async function submitDuelResult(result) {
    if (!session || !session.currentDuel || playerIndex < 0 || working) {
      return
    }

    if (!enabled) {
      const opponentIndex = playerIndex === 0 ? 1 : 0
      const opponentUid = session.players[opponentIndex].uid
      const duel = duelRegistry[session.currentDuel.id]
      const randomWavelengthExcerpt = () => {
        const pick = () => 'abcd'[Math.floor(Math.random() * 4)]
        const sequence = () => Array.from({ length: 5 }, pick).join('')
        return `a=${sequence()};g=${sequence()}`
      }
      const opponentResult = result.skipped
        ? {
            highlight: 'skipped the duel too',
            skipped: true,
            time: 99,
            won: false,
          }
        : duel?.id === WAVELENGTH_DUEL_ID
          ? {
              excerpt: randomWavelengthExcerpt(),
              highlight: 'locked in 5 answers and 5 guesses',
              score: 0,
              time: Number((0.75 + Math.random() * 0.8).toFixed(2)),
              won: true,
            }
          : {
              highlight: 'stayed close in the preview duel',
              score: Math.floor(40 + Math.random() * 40),
              time: Number((0.75 + Math.random() * 0.8).toFixed(2)),
              value: Math.floor(4 + Math.random() * 4),
              won: Math.random() > 0.25,
            }
      const previewSession = {
        ...session,
        duelResults: {
          [session.players[playerIndex].uid]: result,
          [opponentUid]: opponentResult,
        },
      }
      const skippedOutcome = getSkippedDuelOutcome(previewSession)
      const outcome = skippedOutcome || evaluateDuelRound(previewSession, duelRegistry)
      const previewHeartBonus =
        duel?.resolveHearts && (outcome.status === 'shared' || outcome.status === 'resolved')
          ? duel.resolveHearts(
              previewSession.duelResults[session.players[0]?.uid],
              previewSession.duelResults[session.players[1]?.uid],
            )
          : session.currentDuel.heartBonus
      const journalEntry = buildDuelJournalEntry({
        coupleId: couple.id,
        duel,
        duelResults: previewSession.duelResults,
        heartBonus: previewHeartBonus,
        outcome,
        players: session.players,
        sessionId: session.id,
      })

      // Preview mode shows the same reveal overlay; the single Continue tap
      // finishes the duel locally.
      previewDuelContinueRef.current = () => {
        if (outcome.status === 'repick') {
          setSession(buildSkippedDuelRepick(previewSession))
          setJournalEntries((current) => [
            buildPreviewJournalRecord(journalEntry, 'duel-pass', current.length),
            ...current,
          ])
          return
        }

        const nextSession = advanceAfterDuel(
          {
            ...previewSession,
            currentDuel: { ...previewSession.currentDuel, heartBonus: previewHeartBonus },
          },
          outcome,
          duel,
        )

        if (outcome.status !== 'noContest') {
          setBoardState((current) => buildBoardRewardPatch(current, duel.vibe, duel.id))
        }

        setSession(nextSession)

        if (journalEntry) {
          setJournalEntries((current) => [
            buildPreviewJournalRecord(journalEntry, 'duel', current.length),
            ...current,
          ])
        }

        if (nextSession.phase === 'finale') {
          const finaleEntry = buildFinaleJournalEntry({
            coupleId: couple.id,
            journalEntries: journalEntry ? [journalEntry, ...journalEntries] : journalEntries,
            session: nextSession,
            sessionId: session.id,
          })
          setJournalEntries((current) => [
            buildPreviewJournalRecord(finaleEntry, 'finale', current.length),
            ...current,
          ])
        }
      }

      setSession(previewSession)
      return
    }

    setWorking(true)
    try {
      await updateDoc(doc(db, 'sessions', session.id), {
        [`duelResults.${userId}`]: result,
        updatedAt: serverTimestamp(),
      })
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  function skipDuel() {
    return submitDuelResult({
      highlight: 'skipped the duel',
      skipped: true,
      time: 99,
      won: false,
    })
  }

  async function claimSessionHost() {
    if (!enabled || !db || !session?.id || !localUserId || working) {
      return
    }

    setWorking(true)
    setError('')
    try {
      await claimSessionHostDocument(db, session.id, localUserId)
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  async function startFreshSession() {
    if (!enabled || !db || !couple?.id || !session?.id || working || !canRecoverSession) {
      return
    }

    setWorking(true)
    setError('')
    try {
      await abandonSession(db, {
        coupleId: couple.id,
        sessionId: session.id,
      })
      await ensureActiveSession(db, {
        ...couple,
        activeSessionId: null,
      })
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  function resumeSession() {
    setError('')
    if (enabled) {
      setConnectionState('live')
    }
  }

  const finalSummary = useMemo(
    () =>
      session?.phase === 'finale'
        ? buildFinalSummary(session, journalEntries)
        : null,
    [journalEntries, session],
  )

  const value = useMemo(
    () => ({
      ackDuelReveal,
      activity,
      boardState,
      canRecoverSession,
      canRoll,
      canSpinDuel,
      claimSessionHost,
      chooseKeepsake,
      connectionState,
      continuePreviewDuel,
      error,
      enabled,
      finalSummary,
      forceDuelReveal,
      hasLiveSession: Boolean(session),
      isHost,
      isSessionStale,
      journalEntries,
      myDuelResult,
      myMoodVote,
      myVibeVote,
      playerIndex,
      readyToPlay: (!enabled || ready) && hasPartner && Boolean(session),
      resumeSession,
      rollTurn,
      session,
      sessionPreset,
      sessionStatusMessage,
      selectActivityOption,
      skipActivity,
      skipDuel,
      spinDuelWheel,
      startFreshSession,
      submitActivityTurn,
      submitDuelResult,
      submitMoodVote,
      submitVibeVote,
      working,
    }),
    [
      ackDuelReveal,
      activity,
      boardState,
      canRecoverSession,
      canRoll,
      canSpinDuel,
      connectionState,
      continuePreviewDuel,
      enabled,
      error,
      finalSummary,
      forceDuelReveal,
      hasPartner,
      isHost,
      isSessionStale,
      journalEntries,
      myDuelResult,
      myMoodVote,
      myVibeVote,
      playerIndex,
      ready,
      session,
      sessionPreset,
      sessionStatusMessage,
      working,
    ],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}
