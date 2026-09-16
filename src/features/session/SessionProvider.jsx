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
  buildDuelJournalEntry,
  buildFinaleJournalEntry,
} from './journalHelpers.js'
import { KEEPSAKES } from './boardConfig.js'
import { duelRegistry } from './duelRegistry.jsx'
import {
  advanceAfterDuel,
  applyRollToSession,
  beginRoundDuel,
  buildFinalSummary,
  buildInitialSession,
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
  submitVibeVote as persistVibeVote,
  subscribeToActivity,
  subscribeToJournal,
  subscribeToSession,
  updateSessionState,
} from './sessionService.js'
import { getSessionPreset } from './sessionPresets.js'
import {
  averageVibeVotes,
  buildBoardRewardPatch,
  createDefaultBoardState,
  DEFAULT_VIBE_WEIGHTS,
  pickWeightedActivityId,
  pickWeightedDuelId,
} from './sessionWiring.js'

const SessionContext = createContext(null)
const SESSION_STALE_MS = 1000 * 60 * 15

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
  const sessionHostId = session?.hostId || session?.players?.[0]?.uid || null
  // Local preview represents both phones on one screen, so it must be allowed
  // to perform host-only transitions regardless of whose turn just ended.
  const isHost = !enabled || (localUserId ? sessionHostId === localUserId : playerIndex === 0)
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

  useEffect(() => {
    setBoardState(couple?.boardState || createDefaultBoardState())
  }, [couple?.boardState])

  useEffect(() => {
    if (!enabled && couple && hasPartner) {
      setSession((current) => current ?? buildInitialSession(couple))
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
        setSession(nextSession)
        setConnectionState(metadata?.fromCache ? 'syncing' : 'live')
      },
      (nextError) => setError(nextError.message),
    )
  }, [couple?.activeSessionId, db, enabled])

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
  const canRecoverSession = Boolean(session && (!enabled || isHost || isSessionStale))

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
    if (skippedOutcome?.status === 'repick') {
      resolvingDuelRef.current = true
      updateSessionState(db, session.id, buildSkippedDuelRepick(session))
        .catch((nextError) => setError(nextError.message))
        .finally(() => {
          resolvingDuelRef.current = false
        })
      return
    }

    const outcome = skippedOutcome || evaluateDuelRound(session, duelRegistry)
    if (outcome.status === 'pending') {
      return
    }

    resolvingDuelRef.current = true

    const duel = duelRegistry[session.currentDuel.id]
    const nextSession = advanceAfterDuel(session, outcome)
    const duelJournalEntry = buildDuelJournalEntry({
      coupleId: couple.id,
      duel,
      duelResults: session.duelResults,
      heartBonus: session.currentDuel.heartBonus,
      outcome,
      players: session.players,
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
        await updateSessionState(db, session.id, nextSession)

        if (outcome.status !== 'noContest') {
          await applyCoupleBoardReward(db, couple.id, duel.vibe, duel.id)
          setBoardState((current) => buildBoardRewardPatch(current, duel.vibe, duel.id))
        }

        if (duelJournalEntry) {
          await appendJournalEntry(db, duelJournalEntry)
        }

        if (finaleJournalEntry) {
          await appendJournalEntry(db, finaleJournalEntry)
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
      const activityType = pickWeightedActivityId(
        session.vibeWeights || DEFAULT_VIBE_WEIGHTS,
        session.usedActivityIds,
        Math.random,
        { preset: session.preset },
      )
      const keepsakeId = KEEPSAKES[Math.floor(Math.random() * KEEPSAKES.length)].id
      const nextSession = applyRollToSession(session, {
        activityType,
        keepsakeId,
        roll,
      })

      if (!enabled) {
        setSession(nextSession)
        if (nextSession.phase === 'activity') {
          const entry = activityRegistry[activityType]
          setActivity({
            id: 'preview-activity',
            type: activityType,
            vibe: entry.vibe,
            state: entry.createInitialState(session.players),
          })
        }
        return
      }

      await updateSessionState(db, session.id, nextSession)

      if (nextSession.phase === 'activity') {
        const entry = activityRegistry[activityType]
        await createActivityRecord(db, session, activityType, entry.createInitialState(session.players))
      }
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
        setSession(resolveActivityCompletion(session, result))
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

    try {
      if (!enabled) {
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
        journalEntry: null,
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

  async function submitDuelResult(result) {
    if (!session || !session.currentDuel || playerIndex < 0 || working) {
      return
    }

    if (!enabled) {
      const opponentIndex = playerIndex === 0 ? 1 : 0
      const opponentUid = session.players[opponentIndex].uid
      const opponentResult = result.skipped
        ? {
            highlight: 'skipped the duel too',
            skipped: true,
            time: 99,
            won: false,
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
      if (skippedOutcome?.status === 'repick') {
        setSession(buildSkippedDuelRepick(previewSession))
        return
      }

      const outcome = skippedOutcome || evaluateDuelRound(previewSession, duelRegistry)
      const nextSession = advanceAfterDuel(previewSession, outcome)
      const duel = duelRegistry[session.currentDuel.id]
      const journalEntry = buildDuelJournalEntry({
        coupleId: couple.id,
        duel,
        duelResults: previewSession.duelResults,
        heartBonus: session.currentDuel.heartBonus,
        outcome,
        players: session.players,
        sessionId: session.id,
      })

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
    if (!couple?.id || working || !canRecoverSession) {
      return
    }

    setWorking(true)
    setError('')
    try {
      if (!enabled) {
        setActivity(null)
        setSession(buildInitialSession(couple))
        return
      }

      if (!db || !session?.id) {
        return
      }

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
      activity,
      boardState,
      canRecoverSession,
      canRoll,
      canSpinDuel,
      claimSessionHost,
      chooseKeepsake,
      connectionState,
      error,
      finalSummary,
      hasLiveSession: Boolean(session),
      isHost,
      isSessionStale,
      journalEntries,
      myDuelResult,
      myVibeVote,
      playerIndex,
      readyToPlay: (!enabled || ready) && hasPartner && Boolean(session),
      resumeSession,
      rollTurn,
      session,
      sessionPreset,
      sessionStatusMessage,
      skipActivity,
      skipDuel,
      spinDuelWheel,
      startFreshSession,
      submitActivityTurn,
      submitDuelResult,
      submitVibeVote,
      working,
    }),
    [
      activity,
      boardState,
      canRecoverSession,
      canRoll,
      canSpinDuel,
      connectionState,
      enabled,
      error,
      finalSummary,
      hasPartner,
      isHost,
      isSessionStale,
      journalEntries,
      myDuelResult,
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
