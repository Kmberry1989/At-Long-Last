const UNO_COLORS = ['coral', 'plum', 'teal', 'gold']
const UNO_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw-two']

export const UNO_COLORS_LIST = UNO_COLORS
export const UNO_CARD_LABELS = { skip: 'Skip', reverse: 'Reverse', 'draw-two': 'Draw 2', wild: 'Wild', 'wild-draw-four': 'Wild Draw 4' }

function shuffled(values, random = Math.random) {
  const result = [...values]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function createMyOneAndOnly(playerUids, random = Math.random) {
  if (!Array.isArray(playerUids) || playerUids.length !== 2 || playerUids[0] === playerUids[1]) throw new Error('Two players are needed.')
  const cards = []
  for (const color of UNO_COLORS) {
    UNO_VALUES.forEach(value => {
      cards.push({ id: `${color}-${value}-0`, color, value })
      if (value !== '0') cards.push({ id: `${color}-${value}-1`, color, value })
    })
  }
  for (let i = 0; i < 4; i += 1) {
    cards.push({ id: `wild-${i}`, color: 'wild', value: 'wild' })
    cards.push({ id: `wild-draw-four-${i}`, color: 'wild', value: 'wild-draw-four' })
  }
  const deck = shuffled(cards, random)
  const hands = Object.fromEntries(playerUids.map(uid => [uid, deck.splice(0, 7)]))
  let first = deck.shift()
  while (first && (['skip', 'reverse', 'draw-two'].includes(first.value) || first.color === 'wild')) {
    deck.push(first)
    first = deck.shift()
  }
  return {
    game: 'my-one-and-only', playerUids: [...playerUids], hands,
    drawPile: deck, discardPile: first ? [first] : [], activeColor: first?.color || UNO_COLORS[0],
    turnIndex: 0, status: 'playing', winnerUid: null, drawnCardId: null, moveCount: 0,
  }
}

export function playMyOneAndOnlyCard(state, { playerUid, cardId, color }) {
  const playerIndex = state.playerUids.indexOf(playerUid)
  if (state.status !== 'playing') throw new Error('This game is finished.')
  if (playerIndex !== state.turnIndex) throw new Error('Wait for your turn.')
  const hand = state.hands[playerUid]
  const cardIndex = hand.findIndex(card => card.id === cardId)
  if (cardIndex < 0) throw new Error('That card is not in your hand.')
  const card = hand[cardIndex]
  const top = state.discardPile[state.discardPile.length - 1]
  if (card.color !== 'wild' && card.color !== state.activeColor && card.value !== top.value) throw new Error('Play a matching color, number, or Wild card.')
  if (card.color === 'wild' && !UNO_COLORS.includes(color)) throw new Error('Choose a color for your Wild card.')
  const hands = Object.fromEntries(Object.entries(state.hands).map(([uid, value]) => [uid, [...value]]))
  const [played] = hands[playerUid].splice(cardIndex, 1)
  const discardPile = [...state.discardPile, played]
  const next = {
    ...state, hands, discardPile, activeColor: card.color === 'wild' ? color : card.color,
    drawnCardId: null, moveCount: state.moveCount + 1,
    status: hands[playerUid].length === 0 ? 'finished' : 'playing',
    winnerUid: hands[playerUid].length === 0 ? playerUid : null,
  }
  if (next.status === 'playing') {
    const skipNext = ['skip', 'reverse', 'draw-two', 'wild-draw-four'].includes(card.value)
    next.turnIndex = skipNext ? playerIndex : (playerIndex + 1) % 2
    if (card.value === 'draw-two' || card.value === 'wild-draw-four') {
      const amount = card.value === 'draw-two' ? 2 : 4
      const drawPile = [...next.drawPile]
      const penaltyCards = drawPile.splice(0, amount)
      next.drawPile = drawPile
    const targetUid = next.playerUids[next.turnIndex]
    next.hands = { ...next.hands, [targetUid]: [...next.hands[targetUid], ...penaltyCards] }
    }
  }
  return next
}

export function drawMyOneAndOnlyCard(state, playerUid, random = Math.random) {
  const playerIndex = state.playerUids.indexOf(playerUid)
  if (state.status !== 'playing' || playerIndex !== state.turnIndex) throw new Error('Wait for your turn.')
  if (state.drawnCardId) throw new Error('Play or keep the card you drew.')
  let drawPile = [...state.drawPile]
  let recycled = false
  if (!drawPile.length && state.discardPile.length > 1) {
    drawPile = shuffled(state.discardPile.slice(0, -1), random)
    recycled = true
  }
  if (!drawPile.length) return { ...state, turnIndex: (playerIndex + 1) % 2 }
  const [card, ...remaining] = drawPile
  const hands = { ...state.hands, [playerUid]: [...state.hands[playerUid], card] }
  const playable = card.color === 'wild' || card.color === state.activeColor || card.value === state.discardPile.at(-1)?.value
  return { ...state, hands, drawPile: remaining, discardPile: recycled ? [state.discardPile.at(-1)] : state.discardPile, drawnCardId: playable ? card.id : null, turnIndex: playable ? playerIndex : (playerIndex + 1) % 2 }
}

export function keepDrawnMyOneAndOnlyCard(state, playerUid) {
  if (state.playerUids[state.turnIndex] !== playerUid || !state.drawnCardId) throw new Error('There is no drawn card to keep.')
  return { ...state, drawnCardId: null, turnIndex: (state.turnIndex + 1) % 2 }
}

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
export const FISH_CARD_SUITS = SUITS

export function createCatchMyHeart(playerUids, random = Math.random) {
  if (!Array.isArray(playerUids) || playerUids.length !== 2 || playerUids[0] === playerUids[1]) throw new Error('Two players are needed.')
  const deck = shuffled(SUITS.flatMap(suit => RANKS.map(rank => ({ id: `${rank}-${suit}`, rank, suit }))), random)
  const hands = Object.fromEntries(playerUids.map(uid => [uid, deck.splice(0, 7)]))
  const books = Object.fromEntries(playerUids.map(uid => [uid, []]))
  for (let playerIndex = 0; playerIndex < 2; playerIndex += 1) {
    for (const rank of RANKS) {
      const uid = playerUids[playerIndex]
      if (hands[uid].filter(card => card.rank === rank).length === 4) {
        hands[uid] = hands[uid].filter(card => card.rank !== rank)
        books[uid].push(rank)
      }
    }
  }
  return { game: 'catch-my-heart', playerUids: [...playerUids], hands, drawPile: deck, books, turnIndex: 0, status: 'playing', winnerUid: null, lastAction: null }
}

export function askCatchMyHeart(state, { playerUid, targetUid, rank }) {
  const playerIndex = state.playerUids.indexOf(playerUid)
  const targetIndex = state.playerUids.indexOf(targetUid)
  if (state.status !== 'playing' || playerIndex !== state.turnIndex || targetIndex === playerIndex || targetIndex < 0) throw new Error('Wait for your turn.')
  if (!RANKS.includes(rank) || !state.hands[playerUid].some(card => card.rank === rank)) throw new Error('Ask for a rank in your hand.')
  const hands = Object.fromEntries(Object.entries(state.hands).map(([uid, hand]) => [uid, [...hand]]))
  const books = Object.fromEntries(Object.entries(state.books).map(([uid, book]) => [uid, [...book]]))
  const recipientUid = state.playerUids[targetIndex]
  const cards = hands[recipientUid].filter(card => card.rank === rank)
  if (cards.length) {
    hands[recipientUid] = hands[recipientUid].filter(card => card.rank !== rank)
    hands[playerUid].push(...cards)
  } else if (state.drawPile.length) {
    hands[playerUid].push(state.drawPile[0])
  }
  for (const candidate of RANKS) {
    if (hands[playerUid].filter(card => card.rank === candidate).length === 4) {
      hands[playerUid] = hands[playerUid].filter(card => card.rank !== candidate)
      books[playerUid].push(candidate)
    }
  }
  const drawPile = cards.length ? state.drawPile : state.drawPile.slice(1)
  if (!hands[playerUid].length && drawPile.length) hands[playerUid].push(drawPile.shift())
  const firstBookCount = books[state.playerUids[0]].length
  const secondBookCount = books[state.playerUids[1]].length
  const finished = firstBookCount + secondBookCount === 13 || (!drawPile.length && (!hands[state.playerUids[0]].length || !hands[state.playerUids[1]].length))
  const winnerIndex = firstBookCount === secondBookCount ? null : firstBookCount > secondBookCount ? 0 : 1
  return {
    ...state, hands, books, drawPile, turnIndex: cards.length ? playerIndex : (playerIndex + 1) % 2,
    status: finished ? 'finished' : 'playing', winnerUid: finished && winnerIndex !== null ? state.playerUids[winnerIndex] : null,
    lastAction: { playerUid, targetUid, rank, found: cards.length > 0, drew: cards.length === 0 && state.drawPile.length > 0 },
  }
}

function randomFleet(random, blocked = new Set()) {
  const placements = [3, 2, 2].map(length => {
    const candidates = []
    for (let row = 0; row < 8; row += 1) for (let column = 0; column < 8; column += 1) {
      for (const [dr, dc] of [[0, 1], [1, 0]]) {
        if (row + dr * (length - 1) >= 8 || column + dc * (length - 1) >= 8) continue
        candidates.push(Array.from({ length }, (_, i) => `${row + dr * i}:${column + dc * i}`))
      }
    }
    return shuffled(candidates, random)
  })
  const ships = []
  function place(index, occupied) {
    if (index === placements.length) return true
    for (const candidate of placements[index]) {
      if (candidate.some(cell => occupied.has(cell) || blocked.has(cell))) continue
      candidate.forEach(cell => occupied.add(cell))
      ships[index] = candidate
      if (place(index + 1, occupied)) return true
      candidate.forEach(cell => occupied.delete(cell))
    }
    return false
  }
  if (!place(0, new Set())) throw new Error('Could not place the fleet. Try again.')
  return ships
}

export function createRadarLove(playerUids, random = Math.random) {
  if (!Array.isArray(playerUids) || playerUids.length !== 2 || playerUids[0] === playerUids[1]) throw new Error('Two players are needed.')
  const firstFleet = randomFleet(random)
  const secondFleet = randomFleet(random, new Set(firstFleet.flat()))
  return {
    game: 'radar-love', playerUids: [...playerUids],
    fleets: Object.fromEntries(playerUids.map((uid, index) => [uid, (index === 0 ? firstFleet : secondFleet).map((cells, shipIndex) => ({ id: shipIndex, cells }))])),
    shots: Object.fromEntries(playerUids.map(uid => [uid, []])),
    hits: Object.fromEntries(playerUids.map(uid => [uid, []])),
    turnIndex: 0, status: 'playing', winnerUid: null, lastShot: null, boardSize: 8,
  }
}

export function fireRadarLoveShot(state, { playerUid, row, column }) {
  const playerIndex = state.playerUids.indexOf(playerUid)
  if (state.status !== 'playing' || playerIndex !== state.turnIndex) throw new Error('Wait for your turn.')
  if (!Number.isInteger(row) || row < 0 || row >= 8 || !Number.isInteger(column) || column < 0 || column >= 8) throw new Error('Choose a spot on the radar.')
  const key = `${row}:${column}`
  if (state.shots[playerUid].includes(key)) throw new Error('You already scanned that spot.')
  const targetIndex = (playerIndex + 1) % 2
  const targetUid = state.playerUids[targetIndex]
  const hit = state.fleets[targetUid].some(ship => ship.cells.includes(key))
  const shots = { ...state.shots, [playerUid]: [...state.shots[playerUid], key] }
  const hits = { ...state.hits, [playerUid]: hit ? [...state.hits[playerUid], key] : [...state.hits[playerUid]] }
  const sunk = state.fleets[targetUid].flatMap(ship => ship.cells).every(cell => shots[playerUid].includes(cell))
  return {
    ...state, shots, hits, turnIndex: sunk ? playerIndex : targetIndex,
    status: sunk ? 'finished' : 'playing', winnerUid: sunk ? playerUid : null,
    lastShot: { playerUid, row, column, hit },
  }
}

export const SAY_IT_WITHOUT_SAYING_PROMPTS = [
  'A surprise picnic', 'Making up after a tiny mix-up', 'A sleepy Sunday morning', 'The first dance at a wedding',
  'Trying to assemble furniture together', 'A dramatic goodbye at the door', 'Finding the perfect dessert', 'A rainy-day blanket fort',
  'A love note delivered by a very fancy pigeon', 'Getting lost on a scenic walk', 'The world’s slowest dance lesson', 'One person stealing the blankets',
  'A grand proposal to adopt a plant', 'Recreating your favorite movie scene', 'A toast to an ordinary Tuesday', 'Two people meeting in a rom-com',
]

export const MAD_LIBS_TEMPLATES = [
  { title: 'The little detour', text: 'On our way to [place], we found a [adjective] [noun]. It began to [verb], so we [verb2], surrounded by [plural noun], under [weather] skies with [food] to share.' },
  { title: 'A very romantic recipe', text: 'In [place], we mixed one [adjective] [noun] with [food]. We [verb] while [plural noun] danced by, then [verb2] in the [weather].' },
  { title: 'The next chapter', text: 'Years from now, in [place], we will remember the [adjective] [noun] that taught us to [verb]. We [verb2], shared [food], and saved room for [plural noun] beneath [weather] skies.' },
  { title: 'Date night forecast', text: 'Tonight in [place]: [weather], [food], and one very [adjective] [noun]. We will [verb], [verb2], and celebrate with [plural noun].' },
]

export const MAD_LIBS_BLANKS = [
  { id: 'place', label: 'Place', choices: ['the seaside', 'a tiny café', 'the garden', 'a moonlit road', 'our kitchen'] },
  { id: 'adjective', label: 'Feeling', choices: ['golden', 'sleepy', 'hopeful', 'unexpected', 'tender'] },
  { id: 'noun', label: 'Something', choices: ['postcard', 'teacup', 'lantern', 'strawberry', 'umbrella'] },
  { id: 'plural noun', label: 'A few things', choices: ['old songs', 'paper stars', 'warm blankets', 'wildflowers', 'love notes'] },
  { id: 'verb', label: 'An action', choices: ['dance', 'wander', 'laugh', 'sing', 'daydream'] },
  { id: 'verb2', label: 'One more action', choices: ['follow the lights', 'take the long way', 'make a wish', 'call it an adventure', 'stay a little longer'] },
  { id: 'weather', label: 'Weather', choices: ['soft rain', 'a pink sunset', 'clear skies', 'a little snow', 'warm evening air'] },
  { id: 'food', label: 'Something to share', choices: ['peach pie', 'late-night toast', 'strawberries', 'pasta', 'hot chocolate'] },
]

export function fillLoveInTheBlanks(template, answers) {
  const order = ['place', 'adjective', 'noun', 'verb', 'verb2', 'plural noun', 'weather', 'food']
  return order.reduce((text, id) => {
    const key = id === 'plural noun' ? 'plural noun' : id
    return text.replace(`[${key}]`, answers[key] || '…')
  }, template?.text || '')
}

export function weaveOurNextLine(wordsOne = [], wordsTwo = []) {
  const words = []
  for (let i = 0; i < Math.max(wordsOne.length, wordsTwo.length); i += 1) {
    if (wordsOne[i]) words.push(wordsOne[i])
    if (wordsTwo[i]) words.push(wordsTwo[i])
  }
  return words.join(' ')
}
