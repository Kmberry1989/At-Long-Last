import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { useFirebaseApp } from '../couple/FirebaseAppContext.jsx'
import { useCouple } from '../couple/CoupleProvider.jsx'
import { activityRegistry, pickRandomActivityId } from './activityRegistry.jsx'
import { pickRandomDuelId, duelRegistry } from './duelRegistry.jsx'
import { KEEPSAKES } from './boardConfig.js'
import {
  advanceAfterDuel,
  applyRollToSession,
  beginRoundDuel,
  buildInitialSession,
  buildFinalSummary,
  evaluateDuelRound,
  resolveActivityCompletion,
  resolveKeepsakeDecision,
} from './sessionLogic.js'
import {
  appendJournalEntry,
  ensureActiveSession,
  finalizeActivity,
  subscribeToActivity,
  subscribeToJournal,
  subscribeToSession,
  updateSessionState,
} from './sessionService.js'

const SessionContext = createContext(null)

export function SessionProvider({ children }) {
  const { couple, hasPartner } = useCouple()
  const { db, enabled, ready, userId } = useFirebaseApp()
  const [session, setSession] = useState(null)
  const [activity, setActivity] = useState(null)
  const [journalEntries, setJournalEntries] = useState([])
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
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

  const isHost = playerIndex === 0
  const canRoll = session?.phase === 'turn' && session.activePlayerIndex === playerIndex
  const canSpinDuel = isHost && session?.phase === 'duelWheel'

  useEffect(() => {
    if (!enabled && couple && hasPartner) {
      setSession((current) => current ?? buildInitialSession(couple))
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
      }
      return undefined
    }

    return subscribeToSession(
      db,
      couple.activeSessionId,
      setSession,
      (nextError) => setError(nextError.message),
    )
  }, [couple?.activeSessionId, db])

  useEffect(() => {
    if (!enabled) {
      return
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
      return
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

    const outcome = evaluateDuelRound(session, duelRegistry)
    if (outcome.status === 'pending') {
      return
    }

    resolvingDuelRef.current = true

    const nextSession = advanceAfterDuel(session, outcome)
    const duel = duelRegistry[session.currentDuel.id]
    const winnerName =
      outcome.status === 'resolved'
        ? session.players[outcome.winnerIndex].displayName
        : null

    Promise.resolve()
      .then(async () => {
        await updateSessionState(db, session.id, nextSession)

        if (outcome.status === 'resolved') {
          await appendJournalEntry(db, {
            coupleId: couple.id,
            payload: {
              duelId: duel.id,
              heartBonus: session.currentDuel.heartBonus,
              results: session.duelResults,
            },
            summary: `${winnerName} won ${duel.label} and banked ${session.currentDuel.heartBonus} shared hearts.`,
            title: duel.label,
            type: 'duel',
          })
        }
      })
      .catch((nextError) => setError(nextError.message))
      .finally(() => {
        resolvingDuelRef.current = false
      })
  }, [couple?.id, db, enabled, isHost, session])

  async function rollTurn() {
    if (!session || !canRoll || working) {
      return
    }

    setWorking(true)
    setError('')

    try {
      const roll = Math.floor(Math.random() * 6) + 1
      const activityType = pickRandomActivityId()
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
            state: entry.createInitialState(session.players),
          })
        }
        return
      }

      await updateSessionState(db, session.id, nextSession)

      if (nextSession.phase === 'activity') {
        const entry = activityRegistry[activityType]
        const activityRef = await addDoc(collection(db, 'activities'), {
          coupleId: couple.id,
          createdAt: serverTimestamp(),
          sessionId: session.id,
          state: entry.createInitialState(session.players),
          status: 'in_progress',
          type: activityType,
          updatedAt: serverTimestamp(),
        })

        await updateDoc(doc(db, 'sessions', session.id), {
          pendingActivityId: activityRef.id,
          updatedAt: serverTimestamp(),
        })
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
            {
              id: `preview-keep-${current.length}`,
              summary: `You spent ${session.pendingKeepsake.cost} hearts on ${session.pendingKeepsake.label}.`,
              title: session.pendingKeepsake.label,
              type: 'keepsake',
            },
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
          title: session.pendingKeepsake.label,
          type: 'keepsake',
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

    const duelId = pickRandomDuelId()
    const nextSession = beginRoundDuel(session, duelId)
    if (!enabled) {
      setSession(nextSession)
      return
    }

    await updateSessionState(db, session.id, nextSession)
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
        setJournalEntries((current) => [
          {
            id: `preview-activity-${current.length}`,
            summary: result.summary,
            title: result.title,
            type: result.type,
          },
          ...current,
        ])
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

      await finalizeActivity({
        activityId: activity.id,
        db,
        journalEntry: {
          coupleId: couple.id,
          payload: result.payload,
          summary: result.summary,
          title: result.title,
          type: result.type,
        },
        nextSession,
        sessionId: session.id,
        state: advanced.state,
      })
    } catch (nextError) {
      setError(nextError.message)
    } finally {
      setWorking(false)
    }
  }

  async function submitDuelResult(result) {
    if (!session || !session.currentDuel || playerIndex < 0) {
      return
    }

    if (!enabled) {
      const opponentIndex = playerIndex === 0 ? 1 : 0
      const opponentResult = {
        highlight: 'stayed close in the preview duel',
        time: Number((0.75 + Math.random() * 0.8).toFixed(2)),
        won: Math.random() > 0.25,
      }
      const duelResults = {
        [session.players[playerIndex].uid]: result,
        [session.players[opponentIndex].uid]: opponentResult,
      }
      const previewSession = { ...session, duelResults }
      const outcome = evaluateDuelRound(previewSession, duelRegistry)
      const nextSession = advanceAfterDuel(previewSession, outcome)
      if (outcome.status === 'resolved') {
        setJournalEntries((current) => [
          {
            id: `preview-duel-${current.length}`,
            summary: `${previewSession.players[outcome.winnerIndex].displayName} won ${duelRegistry[session.currentDuel.id].label} and banked ${session.currentDuel.heartBonus} shared hearts.`,
            title: duelRegistry[session.currentDuel.id].label,
            type: 'duel',
          },
          ...current,
        ])
      }
      setSession(nextSession)
      return
    }

    await updateDoc(doc(db, 'sessions', session.id), {
      [`duelResults.${userId}`]: result,
      updatedAt: serverTimestamp(),
    })
  }

  const finalSummary = useMemo(
    () =>
      session?.phase === 'finale'
        ? buildFinalSummary(session, journalEntries.length)
        : null,
    [journalEntries.length, session],
  )

  const value = useMemo(
    () => ({
      activity,
      canRoll,
      canSpinDuel,
      chooseKeepsake,
      error,
      finalSummary,
      hasLiveSession: Boolean(session),
      isHost,
      journalEntries,
      playerIndex,
      readyToPlay: (!enabled || ready) && hasPartner && Boolean(session),
      rollTurn,
      session,
      spinDuelWheel,
      submitActivityTurn,
      submitDuelResult,
      working,
    }),
    [
      activity,
      canRoll,
      canSpinDuel,
      enabled,
      error,
      finalSummary,
      hasPartner,
      isHost,
      journalEntries,
      playerIndex,
      ready,
      session,
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
