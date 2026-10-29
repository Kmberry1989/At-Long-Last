const reflective = ['the-vault', 'photo-flashback', 'harmonic-lock']
const guessing = ['mind-meld', 'prediction-box', 'same-wavelength']
const timed = ['tempo-tap', 'word-weaver', 'bluff-bidding', 'dual-axis-maze']

export function musicStageFor(session, activity) {
  if (!session) return 'menu'
  if (session.phase === 'finale') return 'finale'
  if (activity?.state?.phase === 'reveal') return 'reveal'
  if (session.phase === 'duel') {
    if (session.players?.length === 2 && session.players.every(p => session.duelResults?.[p.uid] && !session.duelResults[p.uid].excerpt?.startsWith('h='))) return 'reveal'
    return session.currentDuel?.id === 'wavelength-duel' ? 'prediction' : 'timed'
  }
  if (session.phase === 'activity') {
    if (guessing.includes(activity?.type)) return 'prediction'
    if (timed.includes(activity?.type)) return 'timed'
    if (reflective.includes(activity?.type) || activity?.vibe === 'tender') return 'reflective'
    return 'creative'
  }
  return 'board'
}

export const MUSIC_PATTERNS = {
  menu: { piano: [2, -1, 1, -1, 3, -1, 2, -1, 0, -1, 1, -1, 2, -1, 0, -1], bell: [3, -1, 2, -1, 1, -1, 2, -1], pulse: 8, strings: 0.65 },
  board: { piano: [2, 3, -1, 1, 2, -1, 0, 1, 3, -1, 2, 1, -1, 0, 2, -1], bell: [3, 2, 1, 2, 3, 1, 2, 0], pulse: 4, strings: 0.8 },
  prediction: { piano: [0, 2, -1, -1, 1, 3, -1, -1, 2, 1, -1, -1, 3, 0, -1, -1], bell: [-1, -1, 3, 2, -1, -1, 2, 1], pulse: 4, strings: 0.75 },
  reflective: { piano: [0, -1, -1, 2, -1, -1, 1, -1, 2, -1, -1, 3, -1, -1, 0, -1], bell: [-1, 2, -1, -1, -1, 1, -1, -1], pulse: 0, strings: 1.2 },
  creative: { piano: [0, -1, 2, 1, -1, 3, -1, 2, 1, -1, 3, 2, -1, 1, -1, 0], bell: [2, -1, 3, -1, 1, -1, 2, -1], pulse: 4, strings: 0.85 },
  timed: { piano: [0, 1, 2, -1, 1, 2, 3, -1, 2, 1, 0, -1, 1, 2, 0, -1], bell: [3, -1, 2, -1, 3, -1, 1, -1], pulse: 2, strings: 0.65 },
  reveal: { piano: [0, 1, 2, 3, -1, -1, 2, -1, 3, 2, 1, 0, -1, -1, 0, -1], bell: [3, 2, 1, 0, -1, -1, 2, -1], pulse: 0, strings: 1 },
  finale: { piano: [0, 2, 3, -1, 2, 1, 0, -1, 1, 2, 3, -1, 2, 1, 0, -1], bell: [3, 2, 1, 0, 2, 1, 0, -1], pulse: 8, strings: 1.2 },
}
