export const MIND_MELD_PROMPTS = [
  'If we had a surprise free Saturday, where would we end up?',
  'What snack is the other person craving right now?',
  'What movie would we both happily rewatch tonight?',
  'Where was our best kiss so far?',
  'If we won a weekend trip anywhere, where are we going?',
  'What song instantly reminds you of us?',
  'Describe our perfect lazy Sunday in five words.',
  'What small thing did your partner do lately that you loved?',
]

export const MUTUAL_YES_PROMPTS = [
  'A slow dance in the kitchen — no music needed?',
  'Breakfast in bed this weekend, with your partner picking the menu?',
  'A completely phone-free evening, just the two of us?',
  'A surprise date, planned entirely in secret by your partner?',
  'Sleeping in tomorrow and letting the world wait?',
  'Recreating our first date, as close as we can get it?',
  'A candlelit bath for two tonight?',
  'Finally trying that adventure we keep talking about?',
]

export function pickSealedPrompt(prompts, random = Math.random) {
  return prompts[Math.floor(random() * prompts.length)]
}

export const SEALED_ACTIVITY_DEFINITIONS = [
  {
    description:
      'Answer the same question separately — sealed. Then reveal together and call it: did your minds meld?',
    id: 'same-wavelength',
    intensity: 2,
    label: 'Same Wavelength',
    savesToJournal: true,
    skippable: true,
    type: 'prediction',
    vibe: 'playful',
  },
  {
    description:
      'A double-blind desire card. Both answer sealed — only a mutual yes ever sees the light.',
    id: 'mutual-yes',
    intensity: 3,
    label: 'Mutual Yes',
    savesToJournal: true,
    skippable: true,
    type: 'mutual-yes',
    vibe: 'spicy',
  },
]
