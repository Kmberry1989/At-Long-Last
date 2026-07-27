export const VIBE_CHECK_PROMPTS = [
  {
    id: 'weekend-energy',
    leftLabel: 'Plan every detail',
    prompt: 'What makes a shared weekend feel best right now?',
    rightLabel: 'Follow the mood',
  },
  {
    id: 'social-battery',
    leftLabel: 'Stay in together',
    prompt: 'Where is your shared social battery tonight?',
    rightLabel: 'Work the room',
  },
  {
    id: 'affection-style',
    leftLabel: 'Quiet gestures',
    prompt: 'How do you most want affection to show up this week?',
    rightLabel: 'Big declarations',
  },
  {
    id: 'adventure-setting',
    leftLabel: 'Comfort zone',
    prompt: 'How adventurous should your next date feel?',
    rightLabel: 'Thrill seeker',
  },
  {
    id: 'conversation-mode',
    leftLabel: 'Soft and reflective',
    prompt: 'What kind of conversation sounds best tonight?',
    rightLabel: 'Silly and chaotic',
  },
]

export const TEMPO_TAP_ROUNDS = [
  {
    id: 'easy-pulse',
    label: 'Easy pulse',
    prompt: 'Find the calm beat and keep it steady for five taps.',
    targetIntervalMs: 800,
  },
  {
    id: 'slow-dance',
    label: 'Slow dance',
    prompt: 'Hold a slow, close rhythm for five taps.',
    targetIntervalMs: 920,
  },
  {
    id: 'bright-spark',
    label: 'Bright spark',
    prompt: 'Catch the quick pulse without rushing it.',
    targetIntervalMs: 680,
  },
]

export const WORD_WEAVER_PUZZLES = [
  {
    allowedWords: [
      'art', 'arts', 'ear', 'earth', 'east', 'eat', 'hare', 'has', 'hat',
      'hear', 'heart', 'hearts', 'heat', 'her', 'rat', 'rate', 'rest', 'sat',
      'sea', 'seat', 'set', 'share', 'she', 'star', 'tare', 'tea', 'tear',
      'tears',
    ],
    id: 'hearts',
    letters: ['H', 'E', 'A', 'R', 'T', 'S'],
    prompt: 'Weave as many words as you can from the same six letters.',
  },
  {
    allowedWords: [
      'dear', 'dare', 'date', 'deal', 'ear', 'eat', 'late', 'lead', 'read',
      'real', 'red', 'tale', 'tea', 'teal', 'trade', 'tread',
    ],
    id: 'related',
    letters: ['R', 'E', 'L', 'A', 'T', 'D'],
    prompt: 'Turn this shared tray into a tiny love-letter dictionary.',
  },
  {
    allowedWords: [
      'calm', 'came', 'clan', 'clean', 'lace', 'lane', 'lean', 'male', 'meal',
      'mean', 'name', 'once', 'one', 'ocean',
    ],
    id: 'ocean',
    letters: ['O', 'C', 'E', 'A', 'N', 'L', 'M'],
    prompt: 'Make something surprising from this calm little letter tray.',
  },
]

export const WAVE_TWO_ACTIVITY_DEFINITIONS = [
  {
    description: 'Place two secret markers on the same continuum and reveal the distance.',
    durationSec: 50,
    id: 'vibe-check',
    intensity: 1,
    label: 'Vibe Check',
    prompt: VIBE_CHECK_PROMPTS[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['slider', 'sync', 'featured'],
    title: 'Vibe Check',
    type: 'vibe-sync',
    vibe: 'playful',
  },
  {
    description: 'Tap a five-beat pulse, then compare how steadily you both held the rhythm.',
    durationSec: 45,
    id: 'tempo-tap',
    intensity: 1,
    label: 'Tempo Tap',
    prompt: TEMPO_TAP_ROUNDS[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['rhythm', 'timing', 'featured'],
    title: 'Tempo Tap',
    type: 'tempo',
    vibe: 'playful',
  },
  {
    description: 'Race the same letter tray and save the words only each of you found.',
    durationSec: 75,
    id: 'word-weaver',
    intensity: 1,
    label: 'Word Weaver',
    prompt: WORD_WEAVER_PUZZLES[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['word', 'timed', 'featured'],
    title: 'Word Weaver',
    type: 'word',
    vibe: 'playful',
  },
]
