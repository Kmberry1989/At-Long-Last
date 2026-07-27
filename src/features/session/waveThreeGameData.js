export const DUAL_AXIS_MAZES = [
  {
    goal: { x: 4, y: 0 },
    height: 5,
    id: 'garden-path',
    label: 'Garden path',
    obstacles: [
      { x: 0, y: 3 },
      { x: 2, y: 4 },
      { x: 1, y: 2 },
      { x: 3, y: 3 },
      { x: 2, y: 1 },
      { x: 4, y: 2 },
      { x: 3, y: 0 },
    ],
    prompt: 'Guide the pearl from the garden gate to the moonlit table.',
    start: { x: 0, y: 4 },
    width: 5,
  },
  {
    goal: { x: 0, y: 0 },
    height: 5,
    id: 'candle-route',
    label: 'Candle route',
    obstacles: [
      { x: 4, y: 3 },
      { x: 2, y: 4 },
      { x: 3, y: 2 },
      { x: 1, y: 3 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 0 },
    ],
    prompt: 'Pass the little flame through the room without touching the keepsakes.',
    start: { x: 4, y: 4 },
    width: 5,
  },
]

export const BLIND_CANVAS_PROMPTS = [
  {
    id: 'cozy-cabin',
    prompt: 'A cozy cabin in the woods',
  },
  {
    id: 'dream-date',
    prompt: 'Your impossible dream date',
  },
  {
    id: 'relationship-mascot',
    prompt: 'The unofficial mascot of your relationship',
  },
  {
    id: 'tiny-kingdom',
    prompt: 'A tiny kingdom built just for two',
  },
]

export const HARMONIC_LOCK_ROUNDS = [
  {
    id: 'warm-resonance',
    label: 'Warm resonance',
    prompt: 'Find the frequency where the two rings feel calmest.',
    target: 36,
  },
  {
    id: 'bright-resonance',
    label: 'Bright resonance',
    prompt: 'Tune toward the point where the glass seems to glow.',
    target: 68,
  },
  {
    id: 'quiet-resonance',
    label: 'Quiet resonance',
    prompt: 'Settle into the softest shared hum.',
    target: 52,
  },
]

export const WAVE_THREE_ACTIVITY_DEFINITIONS = [
  {
    description: 'One player moves sideways and the other moves vertically through a shared maze.',
    durationSec: 90,
    id: 'dual-axis-maze',
    intensity: 1,
    label: 'Dual-Axis Maze',
    prompt: DUAL_AXIS_MAZES[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['cooperative', 'maze', 'communication', 'featured'],
    title: 'Dual-Axis Maze',
    type: 'maze',
    vibe: 'playful',
  },
  {
    description: 'Draw two unseen halves of one picture, then join them in the scrapbook.',
    durationSec: 120,
    id: 'blind-canvas',
    intensity: 1,
    label: 'Blind Canvas',
    prompt: BLIND_CANVAS_PROMPTS[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['cooperative', 'drawing', 'memory', 'featured'],
    title: 'Blind Canvas',
    type: 'canvas',
    vibe: 'playful',
  },
  {
    description: 'Follow the resonance separately and discover whether both dials found the lock.',
    durationSec: 60,
    id: 'harmonic-lock',
    intensity: 1,
    label: 'Harmonic Lock',
    prompt: HARMONIC_LOCK_ROUNDS[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['cooperative', 'slider', 'haptic', 'featured'],
    title: 'Harmonic Lock',
    type: 'harmonic',
    vibe: 'tender',
  },
]
