import { collection, doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore'
import {
  askCatchMyHeart,
  autoPlaceRadarLoveFleet,
  createCatchMyHeart,
  createMyOneAndOnly,
  createOurLittlePieces,
  createRadarLove,
  drawMyOneAndOnlyCard,
  fireRadarLoveShot,
  keepDrawnMyOneAndOnlyCard,
  moveOurLittlePiece,
  placeRadarLoveShip,
  playMyOneAndOnlyCard,
  readyRadarLoveFleet,
  rotateOurLittlePiece,
} from '../session/coupleArcade.js'

export const COUPLE_ARCADE_IDS = ['my-one-and-only', 'catch-my-heart', 'radar-love', 'say-it-without-saying', 'our-little-pieces']

export function subscribeCoupleArcades(db, coupleId, onNext, onError) {
  return onSnapshot(collection(db, 'coupleArcades', coupleId, 'games'), snapshot => {
    onNext(Object.fromEntries(snapshot.docs.map(record => [record.id, record.data()])))
  }, onError)
}

export function createCoupleArcadeState(gameId, playerUids, random = Math.random) {
  switch (gameId) {
    case 'my-one-and-only': return createMyOneAndOnly(playerUids)
    case 'catch-my-heart': return createCatchMyHeart(playerUids)
    case 'radar-love': return createRadarLove(playerUids)
    case 'our-little-pieces': return createOurLittlePieces(playerUids, random)
    case 'say-it-without-saying': return {
      game: gameId, playerUids: [...playerUids], actorIndex: 0, phase: 'act',
      promptIndex: Math.floor(random() * 16), clips: {}, guesses: {}, scores: [0, 0], status: 'playing', winnerUid: null,
    }
    default: throw new Error('That game is not in the arcade.')
  }
}

export function applyCoupleArcadeAction(state, gameId, playerUid, action) {
  if (!state.playerUids.includes(playerUid)) throw new Error('Only these two players can play this game.')
  if (gameId === 'my-one-and-only') {
    if (action.kind === 'play') return playMyOneAndOnlyCard(state, { playerUid, cardId: action.cardId, color: action.color })
    if (action.kind === 'draw') return drawMyOneAndOnlyCard(state, playerUid)
    if (action.kind === 'keep') return keepDrawnMyOneAndOnlyCard(state, playerUid)
  }
  if (gameId === 'catch-my-heart' && action.kind === 'ask') {
    return askCatchMyHeart(state, { playerUid, targetUid: state.playerUids.find(uid => uid !== playerUid), rank: action.rank })
  }
  if (gameId === 'radar-love' && action.kind === 'place-ship') return placeRadarLoveShip(state, { ...action, playerUid })
  if (gameId === 'radar-love' && action.kind === 'auto-place') return autoPlaceRadarLoveFleet(state, playerUid)
  if (gameId === 'radar-love' && action.kind === 'ready') return readyRadarLoveFleet(state, playerUid)
  if (gameId === 'radar-love' && action.kind === 'shot') return fireRadarLoveShot(state, { playerUid, row: action.row, column: action.column })
  if (gameId === 'our-little-pieces' && action.kind === 'move-piece') return moveOurLittlePiece(state, { ...action, playerUid })
  if (gameId === 'our-little-pieces' && action.kind === 'rotate-piece') return rotateOurLittlePiece(state, { ...action, playerUid })
  if (gameId === 'say-it-without-saying' && action.kind === 'charade') {
    const actorUid = state.playerUids[state.actorIndex]
    if (actorUid !== playerUid || state.phase !== 'act') throw new Error('It is not your turn to act.')
    if (typeof action.clipDataUrl !== 'string' || !action.clipDataUrl.startsWith('data:video/') || action.clipDataUrl.length > 260000) throw new Error('Record a short charade clip before sending it.')
    return { ...state, phase: 'guess', promptIndex: action.promptIndex, clips: { ...state.clips, [playerUid]: action.clipDataUrl } }
  }
  if (gameId === 'say-it-without-saying' && action.kind === 'guess') {
    if (state.phase !== 'guess' || state.playerUids[state.actorIndex] === playerUid) throw new Error('Wait for your person to act.')
    const correct = Number(action.guessId) === state.promptIndex
    const scores = state.scores.map((score, index) => index === state.actorIndex && correct ? score + 1 : score)
    const finished = state.actorIndex === 1
    const winningIndex = scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1
    return {
      ...state, phase: finished ? 'guess' : 'act', actorIndex: finished ? state.actorIndex : (state.actorIndex + 1) % 2,
      promptIndex: finished ? state.promptIndex : (state.promptIndex + 1) % 16,
      guesses: { ...state.guesses, [playerUid]: action.guessId }, scores,
      status: finished ? 'finished' : 'playing', winnerUid: finished && winningIndex !== null ? state.playerUids[winningIndex] : null,
    }
  }
  throw new Error('That move is not available now.')
}

export async function prepareCoupleArcade(db, coupleId, gameId, playerUids) {
  const ref = doc(db, 'coupleArcades', coupleId, 'games', gameId)
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (snapshot.exists()) return snapshot.data()
    const state = createCoupleArcadeState(gameId, playerUids)
    const record = { gameId, playerUids: [...playerUids], state, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }
    transaction.set(ref, record)
    return record
  })
}

export async function resetCoupleArcade(db, coupleId, gameId, playerUids) {
  const ref = doc(db, 'coupleArcades', coupleId, 'games', gameId)
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists() || !snapshot.data().playerUids?.includes(playerUids[0])) throw new Error('Open the game from your couple lobby.')
    const state = createCoupleArcadeState(gameId, playerUids)
    const record = { gameId, playerUids: [...playerUids], state, createdAt: snapshot.data().createdAt, updatedAt: serverTimestamp() }
    transaction.set(ref, record)
    return record
  })
}

export async function runCoupleArcadeAction(db, coupleId, gameId, playerUid, action) {
  const ref = doc(db, 'coupleArcades', coupleId, 'games', gameId)
  return runTransaction(db, async transaction => {
    const snapshot = await transaction.get(ref)
    if (!snapshot.exists()) throw new Error('Start this game again from the lobby.')
    const record = snapshot.data()
    if (!record.playerUids?.includes(playerUid)) throw new Error('Only this couple can play this game.')
    const state = applyCoupleArcadeAction(record.state, gameId, playerUid, action)
    transaction.update(ref, { state, updatedAt: serverTimestamp() })
    return state
  })
}
