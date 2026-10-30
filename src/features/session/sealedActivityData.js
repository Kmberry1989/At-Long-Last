import { NIGHT_CHOICE_QUESTIONS } from './nightQuestionBank.js'
import { pickFreshPrompt } from './promptRotation.js'

export const MIND_MELD_PROMPTS = [
  'If we had a surprise free Saturday, where would we end up?',
  'What snack is the other person craving right now?',
  'What movie would we both happily rewatch tonight?',
  'Where was our best kiss so far?',
  'If we won a weekend trip anywhere, where are we going?',
  'What song instantly reminds you of us?',
  'Describe our perfect lazy Sunday in five words.',
  'What small thing did your partner do lately that you loved?',
  ...NIGHT_CHOICE_QUESTIONS.map(question => question.text),
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
  'A short walk with no destination and no phones?',
  'Trading one favorite childhood song tonight?',
  'Making dessert together this week?',
  'A quiet hour with separate books and shared company?',
  'Picking a new café to try together?',
  'A sunset picnic, even if it is on the living-room floor?',
  'Learning one simple dance together?',
  'Writing each other a tiny note for tomorrow?',
  'An evening where neither of us has to make a plan?',
  'Making a playlist for our next trip?',
  'Looking through a few old photos together?',
  'A slow, comfortable hug before the night ends?',
]

export function pickSealedPrompt(prompts, random = Math.random, history = []) {
  return pickFreshPrompt(prompts, random, history)
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
