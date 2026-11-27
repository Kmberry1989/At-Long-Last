const CHOICE_DECKS = {
  care: [
    { id: 'listen', label: 'Listen first, without trying to fix it' },
    { id: 'practical', label: 'Help with one practical thing' },
    { id: 'lighten', label: 'Bring humor or a small distraction' },
    { id: 'space', label: 'Give me quiet company or room to breathe' },
  ],
  appreciation: [
    { id: 'noticed', label: 'You noticed a small detail about me' },
    { id: 'helped', label: 'You made an ordinary task easier' },
    { id: 'encouraged', label: 'You offered kind words at the right time' },
    { id: 'laughed', label: 'You helped an ordinary moment feel lighter' },
  ],
  memory: [
    { id: 'laugh', label: 'A time we laughed together' },
    { id: 'ordinary', label: 'A quiet, ordinary moment' },
    { id: 'first', label: 'A first or a small milestone' },
    { id: 'detour', label: 'A plan that went sideways in a good way' },
  ],
  future: [
    { id: 'cozy', label: 'A relaxed evening at home or online' },
    { id: 'nearby', label: 'A small nearby outing' },
    { id: 'new', label: 'Trying one new thing together' },
    { id: 'open', label: 'Keeping the plan flexible and easy' },
  ],
  imagination: [
    { id: 'cozy-world', label: 'A cozy little world with its own rituals' },
    { id: 'silly-twist', label: 'A ridiculous twist that makes us laugh' },
    { id: 'tiny-adventure', label: 'A small adventure with an unexpected turn' },
    { id: 'dramatic-lore', label: 'A dramatic backstory for an ordinary thing' },
  ],
  affection: [
    { id: 'gentle-touch', label: 'A gentle, welcome touch' },
    { id: 'warm-words', label: 'A sincere compliment or reassurance' },
    { id: 'playful', label: 'Light flirting or a shared joke' },
    { id: 'not-tonight', label: 'Quiet company, or no affection tonight' },
  ],
  music: [
    { id: 'soft', label: 'Something soft and unhurried' },
    { id: 'upbeat', label: 'Something upbeat and playful' },
    { id: 'nostalgic', label: 'A song tied to a memory' },
    { id: 'instrumental', label: 'An instrumental or a soundscape' },
  ],
  sensory: [
    { id: 'sound', label: 'A sound or a voice' },
    { id: 'scent', label: 'A familiar scent' },
    { id: 'texture', label: 'A texture or small physical detail' },
    { id: 'light', label: 'The light, weather, or setting' },
  ],
  confidence: [
    { id: 'comfy', label: 'Comfortable and completely myself' },
    { id: 'color', label: 'A color or detail that feels like me' },
    { id: 'dressed-up', label: 'A look that feels a little special' },
    { id: 'casual', label: 'A familiar favorite I already love wearing' },
  ],
  ritual: [
    { id: 'check-in', label: 'A quick check-in or kind message' },
    { id: 'shared-task', label: 'A small task we do together' },
    { id: 'pause', label: 'A quiet pause with no agenda' },
    { id: 'play', label: 'A tiny game, song, or silly tradition' },
  ],
  everyday: [
    { id: 'food', label: 'Sharing food or a drink' },
    { id: 'walk', label: 'A short walk or change of scenery' },
    { id: 'quiet', label: 'A calm moment with no plans' },
    { id: 'small-win', label: 'Finishing one satisfying little thing' },
  ],
  general: [
    { id: 'tender', label: 'Something gentle and reassuring' },
    { id: 'playful', label: 'Something silly and light' },
    { id: 'practical', label: 'Something useful and down to earth' },
    { id: 'surprising', label: 'Something unexpected or imaginative' },
  ],
}

const TAG_TO_DECK = [
  [['support', 'needs', 'vulnerability', 'emotional', 'repair'], 'care'],
  [['gratitude', 'admiration', 'noticing', 'love-language', 'compliment'], 'appreciation'],
  [['memory', 'photo', 'grounding', 'artifact', 'reunion', 'romantic'], 'memory'],
  [['future', 'date', 'tradition', 'longing', 'fantasy-date', 'anticipation'], 'future'],
  [['funny', 'creativity', 'improv', 'invention', 'story', 'lore', 'role', 'origin', 'game'], 'imagination'],
  [['affection', 'touch', 'flirty', 'intimacy', 'desire', 'chemistry', 'closeness'], 'affection'],
  [['music', 'audio'], 'music'],
  [['sensory'], 'sensory'],
  [['confidence'], 'confidence'],
  [['ritual', 'async', 'daily', 'nightly', 'communication'], 'ritual'],
  [['everyday', 'daily', 'co-care'], 'everyday'],
]

const CONSENT_IDS = new Set(['green-light-tonight', 'mutual-yes'])

export function getActivityChoiceConfig(definition) {
  const tags = new Set(definition?.tags || [])
  const deckId = TAG_TO_DECK.find(([matches]) => matches.some(tag => tags.has(tag)))?.[1] || 'general'
  return {
    mode: CONSENT_IDS.has(definition?.id) || definition?.vibe === 'spicy' ? 'match' : 'prediction',
    options: CHOICE_DECKS[deckId],
  }
}

export function getChoiceLabel(options, id) {
  return options.find(option => option.id === id)?.label || ''
}
