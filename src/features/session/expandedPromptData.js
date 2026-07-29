export const ACTIVITY_PROMPT_VARIANTS = {
  'comfort-menu': [
    'When I go quiet after a hard day, the kindest first move is...',
    'Build me a three-item comfort menu for a low-energy night: one thing to say, one thing to do, and one thing to bring.',
  ],
  'small-mercies': [
    'What ordinary thing did I make easier for you lately without realizing it?',
    'Name one quiet way I showed up for us this week that deserves a tiny celebration.',
  ],
  'weather-report': [
    'If your inner weather had a forecast for tomorrow, what would it predict and what might change it?',
    'Describe today as a season, a temperature, and one thing moving through the sky.',
  ],
  receipts: [
    'Find a photo of an ordinary day together. Why did that small moment become worth keeping?',
    'Choose a shared photo you would place in a tiny museum. What would its exhibit card say?',
  ],
  'future-artifact': [
    'Choose three objects from your life now that future-you should never throw away. Why those three?',
    'What object from the next chapter of your relationship do you hope exists one year from now?',
  ],
  translation: [
    'A small action from you that always translates to “I am on your side” is...',
    'What do I do that means “I missed you” even when I never say those words?',
  ],
  'director-commentary': [
    'Give the director commentary for one tiny moment when you first realized this relationship mattered.',
    'If this week were one scene in your love story, what detail would the camera linger on?',
  ],
  'growth-ring': [
    'What is one way the two of you handle hard conversations better than you used to?',
    'Which version of your relationship would be proudest of the way you work together now?',
  ],
  'anchor-memory': [
    'Which shared memory can still calm your nervous system when you replay it slowly?',
    'Choose a memory that feels like a safe room. What is the first detail you notice when you enter it?',
  ],
  'gratitude-snapshot': [
    'Take a photo of one ordinary thing near you that you wish your partner could see right now, then explain why.',
    'Photograph the light where you are and caption it with one thing your partner brought into your day.',
  ],

  'cursed-date-12': [
    'Plan a date using only things found in a grocery store and a parking lot. Make it weirdly excellent.',
    'You have fifteen dollars, one hour, and terrible weather. Build the date anyway.',
  ],
  'yelp-review': [
    'Review your partner as if they were a five-star roadside attraction. Be extremely specific.',
    'Write a glowing review of your relationship as if it were a tiny neighborhood café.',
  ],
  'lore-drop': [
    'Turn one completely normal couple habit into an ancient prophecy.',
    'Explain the secret mythology behind an object the two of you see every day.',
  ],
  'two-truths-one-dream': [
    'Share two real future plans and one impossible dream date. Let your partner find the impossible one.',
    'Offer two accurate memories and one detail you wish had happened. Which detail is the beautiful fake?',
  ],
  'alternate-job': [
    'Give your partner a highly specific job in a fantasy kingdom and defend the appointment.',
    'What oddly niche competition would your partner secretly dominate on television?',
  ],
  'apocalypse-role': [
    'The power is out for a week. Assign each of you one useful role and one deeply unnecessary role.',
    'Your train is stranded overnight. Who handles logistics and who becomes entertainment director?',
  ],
  'pet-peeve-love-letter': [
    'Deliver a dramatic acceptance speech thanking your partner for their most lovable annoying habit.',
    'Turn one tiny pet peeve into a luxury feature you would proudly advertise.',
  ],
  'wikipedia-us': [
    'Write the section heading for the most chaotic era of your relationship and summarize it in one sentence.',
    'What oddly specific fact belongs in the “Legacy” section of your shared encyclopedia page?',
  ],
  'theme-song': [
    'Choose the song that should play when the two of you enter a room this week. Explain the choreography.',
    'What three sounds belong in the opening five seconds of your current couple theme?',
  ],
  'villain-origin': [
    'Invent the minor inconvenience that turns your partner into a glamorous supervillain.',
    'Design your shared villain lair, including the one domestic feature neither of you would compromise on.',
  ],

  'replay-favorite-kiss': [
    'Which almost-kiss or quick goodbye kiss deserves a slower replay, and what made it stay with you?',
    'Describe a kiss you remember mostly because of what happened immediately before or after it.',
  ],
  'wanted-list': [
    'What is one way your partner pays attention that makes you feel unmistakably chosen?',
    'Name one sentence from your partner that can make you feel wanted without being flirty at all.',
  ],
  'slow-morning': [
    'Design a no-alarm morning together using five small details from waking up through breakfast.',
    'What would make a rainy morning together feel luxurious without leaving the house?',
  ],
  'confidence-fit': [
    'Describe the version of your partner who walks into a room already knowing they look incredible.',
    'Which color, texture, or tiny styling detail brings out your partner’s confidence most?',
  ],
  'whisper-line': [
    'You get one sentence in your partner’s ear before a crowded room goes quiet. What do you say?',
    'What six-word message would make your partner blush if it arrived at exactly the right moment?',
  ],
  'scent-memory': [
    'Build the scent of a favorite shared memory from three notes: something warm, something fresh, and something unexpected.',
    'What familiar scent would you bottle as an instant portal back to the two of you?',
  ],
  'favorite-way-held': [
    'What kind of hug do you want when you need courage, and how is it different from a celebration hug?',
    'Describe the exact hand squeeze, shoulder lean, or cuddle position that says “stay here a minute.”',
  ],
  'look-you-love': [
    'What expression crosses your partner’s face right before they laugh for real?',
    'Describe the look your partner gives when the two of you share a thought nobody else caught.',
  ],
  'secret-admiration': [
    'What quality in your partner has become more attractive the longer you have known them?',
    'Name a completely ordinary moment when your partner looked especially beautiful to you.',
  ],
  'rewind-touch': [
    'Replay one tiny touch that made a public moment feel private for a second.',
    'Which small affectionate habit—hand on a shoulder, forehead touch, knee bump—would you never want to lose?',
  ],
}

export function pickActivityPrompt(definition, random = Math.random) {
  const prompts = [
    definition.prompt,
    ...(ACTIVITY_PROMPT_VARIANTS[definition.id] || []),
  ]
  const index = Math.min(
    prompts.length - 1,
    Math.max(0, Math.floor(random() * prompts.length)),
  )
  return prompts[index]
}
