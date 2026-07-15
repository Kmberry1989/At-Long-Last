export const TOTAL_ROUNDS = 5
export const BASE_DUEL_HEART_BONUS = 3

export const KEEPSAKES = [
  {
    id: 'sparkler-photo',
    label: 'Sparkler Photo',
    cost: 5,
    blurb: 'A flash-lit snapshot worth replaying.',
  },
  {
    id: 'midnight-snack',
    label: 'Midnight Snack',
    cost: 6,
    blurb: 'A sweet little win for the road.',
  },
  {
    id: 'love-note',
    label: 'Pocket Love Note',
    cost: 7,
    blurb: 'Tiny, sincere, impossible to forget.',
  },
  {
    id: 'dance-ticket',
    label: 'Last Dance Ticket',
    cost: 8,
    blurb: 'Saved for the moment the lights go low.',
  },
]

export const BOARD_SPACES = [
  { id: 'starlight-start', label: 'Starlight Start', type: 'heart' },
  { id: 'soft-reset', label: 'Soft Reset', type: 'oops' },
  { id: 'spark-checkin', label: 'Spark Check-In', type: 'connection' },
  { id: 'duel-beat', label: 'Duel Beat', type: 'duel' },
  { id: 'keepsake-kiosk', label: 'Keepsake Kiosk', type: 'keepsake' },
  { id: 'glow-up', label: 'Glow Up', type: 'heart' },
  { id: 'story-chain', label: 'Story Chain', type: 'connection' },
  { id: 'rain-check', label: 'Rain Check', type: 'oops' },
  { id: 'duel-spark', label: 'Duel Spark', type: 'duel' },
  { id: 'glad-you-came', label: 'Glad You Came', type: 'heart' },
  { id: 'gratitude-drop', label: 'Gratitude Drop', type: 'connection' },
  { id: 'souvenir-stop', label: 'Souvenir Stop', type: 'keepsake' },
  { id: 'trip-up', label: 'Trip Up', type: 'oops' },
  { id: 'bonus-beat', label: 'Bonus Beat', type: 'duel' },
  { id: 'heart-burst', label: 'Heart Burst', type: 'heart' },
  { id: 'story-swerve', label: 'Story Swerve', type: 'connection' },
  { id: 'spilled-soda', label: 'Spilled Soda', type: 'oops' },
  { id: 'prize-corner', label: 'Prize Corner', type: 'keepsake' },
  { id: 'crowd-roar', label: 'Crowd Roar', type: 'heart' },
  { id: 'final-glow', label: 'Final Glow', type: 'duel' },
]

export function getBoardSpace(index) {
  return BOARD_SPACES[index % BOARD_SPACES.length]
}
