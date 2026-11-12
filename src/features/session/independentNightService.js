import { collection, doc, getDoc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import { advanceNightStep, changeNightTrade, finishIndependentNight, makeRollSteps, stepIds, updateNightTurn } from './independentNight.js'
import { nightKissesCaughtByBothPlayers } from './nightKissService.js'

export function subscribeToNightSteps(db, sessionId, onNext, onError) {
  return onSnapshot(collection(db, 'sessions', sessionId, 'steps'), snapshot => {
    onNext(snapshot.docs.map(record => ({ ...record.data(), id: record.id })).sort((a, b) => a.round - b.round || a.id.localeCompare(b.id)))
  }, onError)
}

/** Every command reads fresh bounded night state before any writes. Retries merge
 * simultaneous rolls/submissions; stable slot IDs make network retries harmless. */
export async function runNightCommand(db, sessionId, userId, command) {
  const sessionRef = doc(db, 'sessions', sessionId)
  let finishPreflight = null
  if (command.kind === 'finish') {
    const preflight = await getDoc(sessionRef)
    const session = preflight.exists() ? { ...preflight.data(), id: preflight.id } : null
    if (session?.status === 'active') {
      const stepSnapshots = await Promise.all(stepIds(session.totalRounds).map(id => getDoc(doc(db, 'sessions', sessionId, 'steps', id))))
      const steps = stepSnapshots.filter(record => record.exists()).map(record => ({ ...record.data(), id: record.id }))
      finishIndependentNight(session, steps)
      finishPreflight = { revision: session.updatedAt, steps }
      if (session.kissBookendVersion === 1) {
        const kisses = await Promise.all(session.players.map(player => getDoc(doc(db, 'sessions', sessionId, 'nightKisses', player.uid))))
        const kissData = Object.fromEntries(kisses.filter(record => record.exists()).map(record => [record.id, record.data()]))
        if (!nightKissesCaughtByBothPlayers(kissData, session.players)) throw new Error('Catch your partner’s kiss before opening the coda.')
      }
    }
  }
  for (let attempt = 0; attempt < 4; attempt++) {
    let observedRevision = null
    try {
      return await runTransaction(db, async transaction => {
        const snapshot = await transaction.get(sessionRef)
        if (!snapshot.exists()) throw new Error('This night no longer exists.')
        const session = { ...snapshot.data(), id: snapshot.id }
        observedRevision = session.updatedAt ?? null
        const playerIndex = session.players.findIndex(player => player.uid === userId)
        if (playerIndex < 0 || session.pacingVersion !== 1) throw new Error('This is not your independent night.')
        if (session.status !== 'active') return
        const ids = command.kind.startsWith('trade') || command.kind === 'finish'
          ? []
          : (command.kind === 'submit' && !command.revealing) || command.kind === 'turn'
            ? [command.stepId]
            : stepIds(session.totalRounds)
        const refs = ids.map(id => doc(db, 'sessions', sessionId, 'steps', id))
        const snapshots = []
        for (const ref of refs) {
          snapshots.push(await transaction.get(ref))
        }
        const steps = command.kind === 'finish'
          ? finishPreflight?.steps || []
          : snapshots.filter(record => record.exists()).map(record => ({ ...record.data(), id: record.id }))
        let nextSession
        let changed = []
        let entries = []
        if (command.kind.startsWith('trade')) {
          nextSession = changeNightTrade(session, playerIndex, command)
        } else if (command.kind === 'roll') {
          // Caller supplies the intended slot, so a duplicate request cannot roll twice.
          if (steps.some(step => step.id === `roll-${command.round}-${playerIndex}`)) return
          const random = import.meta.env.DEV && Number.isFinite(command.selectionSeed) ? () => Math.min(.999, Math.max(0, command.selectionSeed)) : Math.random
          const result = makeRollSteps(session, steps, playerIndex, command.dice, command.history || [], random)
          if (result.created[0].round !== command.round) throw new Error('Your board moved. Try this roll again.')
          nextSession = result.session
          changed = result.created
        } else if (command.kind === 'submit') {
          const result = await advanceNightStep(session, steps, command.stepId, playerIndex, command.input)
          if (!result) return
          nextSession = result.session
          changed = [result.step]
        } else if (command.kind === 'turn') {
          const result = updateNightTurn(session, steps, command.stepId, playerIndex, command.action)
          if (!result) return
          nextSession = result.session
          changed = [result.step]
        } else if (command.kind === 'finish') {
          const sameRevision = session.updatedAt?.isEqual?.(finishPreflight?.revision) || session.updatedAt === finishPreflight?.revision
          if (session.status === 'active' && !sameRevision) throw new Error('The night changed. Try opening tonight’s reveals again.')
          const result = finishIndependentNight(session, steps)
          nextSession = result.session
          entries = result.entries
        } else throw new Error('Unknown night action.')
        for (const step of changed) {
          const { id, ...data } = step
          if (data.state?.race?.crossingPending && !data.state.race.crossedAt) {
            data.state = { ...data.state, race: { ...data.state.race, crossedAt: serverTimestamp(), crossingPending: false } }
          }
          transaction.set(doc(db, 'sessions', sessionId, 'steps', id), { ...data, updatedAt: serverTimestamp() })
        }
        const { id: _id, ...payload } = nextSession
        transaction.update(sessionRef, {
          ...payload, lastActionAt: serverTimestamp(), updatedAt: serverTimestamp(),
          ...(command.kind === 'finish' ? { endedAt: serverTimestamp() } : {}),
        })
        entries.forEach((entry, index) => transaction.set(doc(db, 'journalEntries', `${sessionId}-reveal-${index}`), { ...entry, createdAt: serverTimestamp() }))
        return changed[0] || null
      })
    } catch (error) {
      if (error.code !== 'permission-denied' || attempt === 3) throw error
      // Rules can see the winning write before the SDK detects a transaction
      // conflict. Retry only with evidence that this exact night changed.
      const fresh = await getDoc(sessionRef)
      if (command.kind === 'finish' && fresh.data()?.status === 'completed') return
      if (!fresh.exists() || fresh.data().status !== 'active' ||
          fresh.data().updatedAt?.isEqual?.(observedRevision)) throw error
    }
  }
}
