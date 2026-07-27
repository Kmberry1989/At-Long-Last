export const BLUFF_BIDDING_TOPICS = [
  {
    id: 'romance-movies',
    prompt: 'Famous romance movies',
  },
  {
    id: 'date-songs',
    prompt: 'Songs that belong on a date-night playlist',
  },
  {
    id: 'dream-trips',
    prompt: 'Places that would make a great couple trip',
  },
  {
    id: 'comfort-foods',
    prompt: 'Foods worthy of a cozy night in',
  },
  {
    id: 'fictional-couples',
    prompt: 'Memorable fictional couples',
  },
]

export const PHOTO_FLASHBACK_PROMPTS = [
  {
    id: 'missing-detail',
    prompt: 'Choose a photo of the two of you. What detail does the picture leave out?',
  },
  {
    id: 'soundtrack',
    prompt: 'Choose a favorite shared photo. What song belongs underneath it?',
  },
  {
    id: 'future-caption',
    prompt: 'Choose an old photo together. Caption it from five years in the future.',
  },
  {
    id: 'tiny-moment',
    prompt: 'Choose a photo from an ordinary day that became important later.',
  },
]

export const WAVE_FOUR_ACTIVITY_DEFINITIONS = [
  {
    description: 'Raise the promise or call the bluff, then see whether the bidder can prove it.',
    durationSec: 90,
    id: 'bluff-bidding',
    intensity: 1,
    label: 'Bluff Bidding',
    prompt: BLUFF_BIDDING_TOPICS[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['head-to-head', 'bidding', 'word', 'featured'],
    title: 'Bluff Bidding',
    type: 'bluff',
    vibe: 'playful',
  },
  {
    description: 'Choose one shared photo and write two captions without seeing the first.',
    durationSec: 120,
    id: 'photo-flashback',
    intensity: 2,
    label: 'Photo Flashback',
    prompt: PHOTO_FLASHBACK_PROMPTS[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['memory', 'photo', 'caption', 'featured'],
    title: 'Photo Flashback',
    type: 'photo',
    vibe: 'tender',
  },
]
