const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
}

const THEME_BLUEPRINTS = {
  'my-one-and-only': {
    name: 'My One and Only!', bpm: 98, root: 62, mode: 'major', voice: 'felt', seed: 1701,
    progression: [0, 4, 5, 3, 0, 2, 3, 4],
    motif: [
      [0, -1, 2, -1, 4, 2, -1, 1], [2, -1, 3, 4, -1, 3, 2, -1],
      [1, -1, 3, -1, 5, 4, 2, -1], [4, -1, 2, 1, -1, 2, 0, -1],
    ],
  },
  'say-it-without-saying': {
    name: 'Say Without Saying', bpm: 112, root: 67, mode: 'major', voice: 'celesta', seed: 2917,
    progression: [0, 3, 4, 0, 5, 3, 2, 4],
    motif: [
      [0, 2, 4, -1, 3, 5, 4, -1], [2, -1, 5, 6, 4, -1, 2, -1],
      [4, 2, 0, 3, 5, 4, 2, -1], [1, -1, 4, 2, 0, 2, 3, -1],
    ],
  },
  'catch-my-heart': {
    name: 'Catch My Heart', bpm: 104, root: 60, mode: 'major', voice: 'waterglass', seed: 3841,
    progression: [0, 5, 3, 4, 0, 2, 3, 4],
    motif: [
      [0, -1, 2, 4, -1, 3, 2, -1], [1, 3, -1, 5, 4, -1, 2, 1],
      [2, -1, 4, 5, 3, 2, -1, 0], [4, -1, 2, -1, 1, 3, 0, -1],
    ],
  },
  'radar-love': {
    name: 'Radar Love', bpm: 92, root: 64, mode: 'minor', voice: 'sonar', seed: 4729,
    progression: [0, 5, 3, 6, 0, 2, 5, 6],
    motif: [
      [0, -1, -1, 3, -1, 4, -1, 2], [1, -1, 4, -1, 5, -1, 3, -1],
      [2, -1, 5, 4, -1, 3, -1, 1], [4, -1, 2, -1, 1, -1, 0, -1],
    ],
  },
  'our-little-pieces': {
    name: 'Our Little Pieces', bpm: 100, root: 65, mode: 'major', voice: 'felt', seed: 5581,
    progression: [0, 3, 0, 4, 5, 3, 2, 4],
    motif: [
      [0, 2, -1, 3, 4, -1, 2, 1], [3, -1, 5, 4, 2, -1, 1, 0],
      [2, 4, 5, -1, 4, 2, 3, -1], [1, -1, 3, 2, 0, -1, 0, -1],
    ],
  },
  'four-ever': {
    name: 'Four Ever', bpm: 106, root: 69, mode: 'major', voice: 'celesta', seed: 6337,
    progression: [0, 4, 3, 5, 0, 2, 4, 5],
    motif: [
      [0, -1, 2, 4, -1, 3, 5, -1], [4, 2, -1, 5, 4, -1, 2, 1],
      [0, 2, 4, -1, 5, 4, 2, -1], [3, -1, 2, 4, -1, 1, 0, -1],
    ],
  },
}

function seededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0
    return value / 4294967296
  }
}

function midiFrequency(note) {
  return 440 * (2 ** ((note - 69) / 12))
}

function pitchAtDegree(root, scale, degree) {
  const octave = Math.floor(degree / scale.length)
  const index = ((degree % scale.length) + scale.length) % scale.length
  return midiFrequency(root + octave * 12 + scale[index])
}

function makeSong(id, blueprint) {
  const random = seededRandom(blueprint.seed)
  const scale = SCALE_INTERVALS[blueprint.mode]
  const secondsPerBar = 240 / blueprint.bpm
  const sectionShifts = [0, 1, 0, -1, 2, 1, -1, 0]
  const bars = Array.from({ length: 32 }, (_, barIndex) => {
    const phrase = Math.floor(barIndex / 4)
    const motif = blueprint.motif[barIndex % 4]
    const chordDegree = blueprint.progression[barIndex % blueprint.progression.length]
    const chordRoot = blueprint.root - 12 + scale[chordDegree % scale.length] + Math.floor(chordDegree / scale.length) * 12
    const chord = [0, 2, 4].map((step) => pitchAtDegree(blueprint.root - 12, scale, chordDegree + step))
    const melody = motif.map((degree, step) => {
      if (degree < 0) return null
      let movedDegree = degree + sectionShifts[phrase]
      if (phrase % 4 === 2) movedDegree = 6 - degree + sectionShifts[phrase]
      // Small, seed-locked ornaments make later phrases answer the opening motif.
      if (step > 0 && step < 7 && random() > 0.91) movedDegree += random() > 0.5 ? 1 : -1
      const octave = phrase === 5 && step >= 4 ? 1 : phrase === 7 && step >= 4 ? -1 : 0
      return {
        at: step * secondsPerBar / 8,
        frequency: pitchAtDegree(blueprint.root + octave * 12, scale, movedDegree),
        length: secondsPerBar / (step % 3 === 0 ? 3.8 : 5.2),
        accent: step === 0 || step === 4,
      }
    })
    const bass = midiFrequency(chordRoot - 12)
    return { chord, bass, melody }
  })
  return Object.freeze({ id, name: blueprint.name, bpm: blueprint.bpm, secondsPerBar, voice: blueprint.voice, bars })
}

export const ARCADE_SONGS = Object.freeze(Object.fromEntries(
  Object.entries(THEME_BLUEPRINTS).map(([id, blueprint]) => [id, makeSong(id, blueprint)]),
))

export const ARCADE_THEME_IDS = Object.freeze(Object.keys(ARCADE_SONGS))
const generatedSongs = new Map()

function hashId(id) {
  let hash = 2166136261
  for (const character of id) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0
  return hash >>> 0
}

function generatedMiniGameSong(id) {
  if (!id) return null
  if (ARCADE_SONGS[id]) return ARCADE_SONGS[id]
  if (!generatedSongs.has(id)) {
    const hash = hashId(id)
    const source = Object.values(THEME_BLUEPRINTS)[hash % Object.keys(THEME_BLUEPRINTS).length]
    const mode = hash & 1 ? 'major' : 'minor'
    const shift = (hash >>> 3) % 7
    const scale = SCALE_INTERVALS[mode]
    const blueprint = {
      ...source,
      name: id.split('-').map((part) => part[0]?.toUpperCase() + part.slice(1)).join(' '),
      bpm: 88 + hash % 31,
      root: 60 + (hash >>> 8) % 12,
      mode,
      seed: hash,
      voice: ['felt', 'celesta', 'waterglass', 'sonar'][hash % 4],
      progression: source.progression.map((degree, index) => (degree + shift + (index % 2 ? 2 : 0)) % scale.length),
      motif: source.motif.map((bar, barIndex) => bar.map((degree, step) => degree < 0 ? -1 : (degree + shift + ((barIndex + step) % 3 === 0 ? 1 : 0)) % scale.length)),
    }
    generatedSongs.set(id, makeSong(id, blueprint))
  }
  return generatedSongs.get(id)
}

export function arcadeStage(gameId) {
  return `arcade:${gameId}`
}

export function arcadeThemeForStage(stage) {
  return stage?.startsWith('arcade:') ? generatedMiniGameSong(stage.slice('arcade:'.length)) : null
}

export function isArcadeStage(stage) {
  return Boolean(arcadeThemeForStage(stage))
}
