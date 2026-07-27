export const MIND_MELD_PROMPTS = [
  {
    id: 'movie-trope',
    prompt: 'Which movie trope feels most like the two of you lately?',
    options: [
      { id: 'road-trip', label: 'Unexpected road trip' },
      { id: 'slow-burn', label: 'Slow-burn romance' },
      { id: 'heist', label: 'Chaotic heist team' },
      { id: 'cozy-sequel', label: 'Cozy sequel' },
    ],
  },
  {
    id: 'tiny-luxury',
    prompt: 'Which tiny luxury would improve tonight the most?',
    options: [
      { id: 'dessert', label: 'Excellent dessert' },
      { id: 'blanket', label: 'Fresh warm blanket' },
      { id: 'playlist', label: 'Perfect playlist' },
      { id: 'late-checkout', label: 'No alarm tomorrow' },
    ],
  },
  {
    id: 'zombie-plan',
    prompt: 'The zombie apocalypse starts. What is your first shared move?',
    options: [
      { id: 'fortify', label: 'Fortify the house' },
      { id: 'road', label: 'Hit the road' },
      { id: 'supplies', label: 'Raid the snack aisle' },
      { id: 'nap', label: 'One last nap' },
    ],
  },
  {
    id: 'free-hour',
    prompt: 'A surprise free hour appears. Where do you both hope it goes?',
    options: [
      { id: 'walk', label: 'Aimless walk' },
      { id: 'couch', label: 'Couch and a show' },
      { id: 'food', label: 'Find something delicious' },
      { id: 'project', label: 'Make something together' },
    ],
  },
  {
    id: 'couple-mascot',
    prompt: 'Which unofficial mascot best represents your relationship?',
    options: [
      { id: 'otter', label: 'Hand-holding otter' },
      { id: 'crow', label: 'Gift-bringing crow' },
      { id: 'capybara', label: 'Unbothered capybara' },
      { id: 'raccoon', label: 'Snack-seeking raccoon' },
    ],
  },
  {
    id: 'soundtrack',
    prompt: 'What should play over the closing credits of this week?',
    options: [
      { id: 'ballad', label: 'Tender ballad' },
      { id: 'disco', label: 'Ridiculous disco' },
      { id: 'instrumental', label: 'Dreamy instrumental' },
      { id: 'anthem', label: 'Full-volume anthem' },
    ],
  },
]

export const PREDICTION_BOX_PROMPTS = [
  {
    id: 'surprise-date',
    prompt: 'Which opening would feel most like the perfect surprise date?',
    options: [
      { id: 'reservation', label: 'A secret reservation' },
      { id: 'drive', label: 'Get in, we are going somewhere' },
      { id: 'living-room', label: 'A transformed living room' },
      { id: 'morning-note', label: 'A note waiting in the morning' },
    ],
  },
  {
    id: 'reset-button',
    prompt: 'Which reset button would your partner choose after a hard day?',
    options: [
      { id: 'quiet', label: 'Quiet together' },
      { id: 'laugh', label: 'Make me laugh' },
      { id: 'food', label: 'Bring me food' },
      { id: 'walk', label: 'Take me outside' },
    ],
  },
  {
    id: 'free-saturday',
    prompt: 'What does your partner want most from a completely free Saturday?',
    options: [
      { id: 'adventure', label: 'A small adventure' },
      { id: 'nest', label: 'Do absolutely nothing' },
      { id: 'people', label: 'See favorite people' },
      { id: 'project', label: 'Finish a satisfying project' },
    ],
  },
  {
    id: 'comfort-snack',
    prompt: 'Which comfort-snack category would your partner protect at all costs?',
    options: [
      { id: 'salty', label: 'Salty and crunchy' },
      { id: 'sweet', label: 'Soft and sweet' },
      { id: 'cheese', label: 'Anything with cheese' },
      { id: 'nostalgia', label: 'Childhood nostalgia' },
    ],
  },
  {
    id: 'compliment',
    prompt: 'Which compliment lands deepest for your partner right now?',
    options: [
      { id: 'seen', label: 'You really see me' },
      { id: 'proud', label: 'I am proud of you' },
      { id: 'safe', label: 'I feel safe with you' },
      { id: 'wanted', label: 'I still choose you' },
    ],
  },
]

export const VAULT_PROMPTS = [
  {
    id: 'secret-compliment',
    prompt: 'Seal one compliment you want your partner to discover at the finale.',
  },
  {
    id: 'quiet-wish',
    prompt: 'Seal one small wish for the two of you in the coming month.',
  },
  {
    id: 'memory-light',
    prompt: 'Seal a memory that still lights up when you think about it.',
  },
  {
    id: 'future-thank-you',
    prompt: 'Write a thank-you note to the version of your partner who reaches the finale.',
  },
]

export const CONNECTION_ACTIVITY_DEFINITIONS = [
  {
    description: 'Choose secretly, then reveal whether your instincts landed together.',
    durationSec: 45,
    id: 'mind-meld',
    intensity: 1,
    label: 'Mind Meld',
    prompt: MIND_MELD_PROMPTS[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['match', 'prediction', 'featured'],
    title: 'Mind Meld',
    type: 'match',
    vibe: 'playful',
  },
  {
    description: 'One player predicts the answer before the other chooses honestly.',
    durationSec: 60,
    id: 'prediction-box',
    intensity: 1,
    label: 'The Prediction Box',
    prompt: PREDICTION_BOX_PROMPTS[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['prediction', 'asymmetric', 'featured'],
    title: 'The Prediction Box',
    type: 'prediction',
    vibe: 'playful',
  },
  {
    description: 'Seal two private notes now and open them together at the finale.',
    durationSec: 75,
    id: 'the-vault',
    intensity: 2,
    label: 'The Vault',
    prompt: VAULT_PROMPTS[0].prompt,
    savesToJournal: true,
    skippable: true,
    tags: ['time-capsule', 'finale', 'featured'],
    title: 'The Vault',
    type: 'vault',
    vibe: 'tender',
  },
]
