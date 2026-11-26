// expandedNewActivities.js — 12 new board activities (76 → 88)
// At Long Last — Expanded Edition (Nov 26, 2026)
// ADDITIVE ONLY: this file adds new content. It does not delete or rewrite
// any existing prompt. Merge with the existing registry via the helpers in
// expandedActivityRegistry.js / index.js. See README_EXPANDED_IMPLEMENTATION.md.
// Guardrails: no explicit content, no scoring/leaderboards, no therapy,
// no new moods, no lifetime-scale prompts. Every new prompt is small,
// recent, and specific. Spicy stays at tiny, specific, opt-in closeness.


export const NEW_BOARD_ACTIVITIES = [
  {
    "id": "repair-kit",
    "title": "Repair Kit",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 2,
    "description": "Gives couples a language for repair *before* they need it. Not “how to avoid fights” but “how do we come back?” The prompts are all about the *return* — the first sentence, the gesture, the pause, the apology — not the rupture.",
    "prompts": [
      "What is the first sentence you'd want to hear from me after a tense moment?",
      "What does a good apology sound like from me — not perfect, just good?",
      "How do you want me to act when I realize I was wrong, even if I'm embarrassed?",
      "What is a small gesture that tells you “I want to repair this” without words?",
      "How much time do you need after a hard moment before you're ready to talk?",
      "What is one thing I do during a hard moment that actually helps, even if I don't realize it?",
      "What would a “repair ritual” look like for us — 2 minutes, no fixing, just returning?",
      "How do you want me to check in the *next day* after a hard conversation?",
      "What is a phrase that helps you feel safe again, even if the problem isn't solved?",
      "What is one repair you remember that made us *closer*, not just back to normal?",
      "If we could have a “repair word” that means “pause, I want to try again,” what would it be?",
      "What is one thing you want us to *keep* doing when things get hard?"
    ],
    "design": {
      "whatItDoes": "Gives couples a language for repair *before* they need it. Not “how to avoid fights” but “how do we come back?” The prompts are all about the *return* — the first sentence, the gesture, the pause, the apology — not the rupture.",
      "whyPromptsWork": "",
      "playWhen": "Calm, not mid-conflict. Pair with Gentle Signal — Repair Kit is the plan, Signal is the phrase.\n1. What is the first sentence you'd want to hear from me after a tense moment?\n2. What does a good apology sound like from me — not perfect, just good?\n3. How do you want me to act when I realize I was wrong, even if I'm embarrassed?\n4. What is a small gesture that tells you “I want to repair this” without words?\n5. How much time do you need after a hard moment before you're ready to talk?\n6. What is one thing I do during a hard moment that actually helps, even if I don't realize it?\n7. What would a “repair ritual” look like for us — 2 minutes, no fixing, just returning?\n8. How do you want me to check in the *next day* after a hard conversation?\n9. What is a phrase that helps you feel safe again, even if the problem isn't solved?\n10. What is one repair you remember that made us *closer*, not just back to normal?\n11. If we could have a “repair word” that means “pause, I want to try again,” what would it be?\n12. What is one thing you want us to *keep* doing when things get hard?",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "long-distance-window",
    "title": "Long-Distance Window",
    "vibe": "tender",
    "type": "ritual",
    "intensity": 1,
    "description": "For couples apart — or just in different rooms — it creates a shared window: same sky, same song, same photo, same minute. Distance is not fixed by grand gestures; it's fixed by tiny simultaneity.",
    "prompts": [
      "Look out your window right now. Describe what you see in 2 sentences, as if I'm there.",
      "Send a photo of the sky above you today. What does it make you think of?",
      "If we were looking at the same moon tonight, what would you want to say?",
      "Share a song you're listening to right now. What does it make you miss?",
      "What is one thing in your current room that you wish I could touch?",
      "Describe the next meal you'll eat as if you're saving me a bite.",
      "What time is it for you, and what would you be doing if we were together?",
      "Send me the sound of where you are — or describe it if you can't.",
      "What is one small thing you want to do *together* when we're back in the same place?",
      "Write a 1-line postcard from where you are: “Wish you were here because…”",
      "What is a ritual we can do *apart* at the same time every day?",
      "If distance had a color, what color is ours today — and what would make it warmer?"
    ],
    "design": {
      "whatItDoes": "For couples apart — or just in different rooms — it creates a shared window: same sky, same song, same photo, same minute. Distance is not fixed by grand gestures; it's fixed by tiny simultaneity.",
      "whyPromptsWork": "",
      "playWhen": "Apart, traveling, or in different time zones. Pair with Landing Lights — Window is daytime simultaneity, Landing is nighttime arrival.\n1. Look out your window right now. Describe what you see in 2 sentences, as if I'm there.\n2. Send a photo of the sky above you today. What does it make you think of?\n3. If we were looking at the same moon tonight, what would you want to say?\n4. Share a song you're listening to right now. What does it make you miss?\n5. What is one thing in your current room that you wish I could touch?\n6. Describe the next meal you'll eat as if you're saving me a bite.\n7. What time is it for you, and what would you be doing if we were together?\n8. Send me the sound of where you are — or describe it if you can't.\n9. What is one small thing you want to do *together* when we're back in the same place?\n10. Write a 1-line postcard from where you are: “Wish you were here because…”\n11. What is a ritual we can do *apart* at the same time every day?\n12. If distance had a color, what color is ours today — and what would make it warmer?",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "kindness-ledger",
    "title": "The Kindness Ledger",
    "vibe": "tender",
    "type": "journal",
    "intensity": 1,
    "description": "A running record of kindnesses *given*, not received. Writing what *you* gave — not what you got — fights scorekeeping by flipping the lens. You notice your own generosity, not your partner's debts.",
    "prompts": [
      "What is one kind thing you did for me today that I might have missed?",
      "Write a ledger entry for a kindness you offered that cost you almost nothing but meant a lot.",
      "What kindness do you want to offer *tomorrow* that you haven't yet?",
      "Name a kindness you gave that you *didn't* get thanked for — and thank yourself for it.",
      "What is the smallest kindness in our ledger that still matters?",
      "If kindness were currency, what would you have “spent” this week?",
      "Write a ledger entry for a kindness you gave to *someone else* that made you think of us.",
      "What kindness did you *almost* give but didn't? What stopped you?",
      "What is a kindness you want to be *known* for in our relationship?",
      "Look back: what kindness from last month still makes you smile?",
      "If we kept a ledger for a year, what would the first page say?",
      "Write one kindness you want to give *yourself* this week, and let me witness it."
    ],
    "design": {
      "whatItDoes": "A running record of kindnesses *given*, not received. Writing what *you* gave — not what you got — fights scorekeeping by flipping the lens. You notice your own generosity, not your partner's debts.",
      "whyPromptsWork": "",
      "playWhen": "When things feel transactional. Pair with Small Mercies — Ledger is given, Mercies is received.\n1. What is one kind thing you did for me today that I might have missed?\n2. Write a ledger entry for a kindness you offered that cost you almost nothing but meant a lot.\n3. What kindness do you want to offer *tomorrow* that you haven't yet?\n4. Name a kindness you gave that you *didn't* get thanked for — and thank yourself for it.\n5. What is the smallest kindness in our ledger that still matters?\n6. If kindness were currency, what would you have “spent” this week?\n7. Write a ledger entry for a kindness you gave to *someone else* that made you think of us.\n8. What kindness did you *almost* give but didn't? What stopped you?\n9. What is a kindness you want to be *known* for in our relationship?\n10. Look back: what kindness from last month still makes you smile?\n11. If we kept a ledger for a year, what would the first page say?\n12. Write one kindness you want to give *yourself* this week, and let me witness it.",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "quiet-company",
    "title": "Quiet Company",
    "vibe": "tender",
    "type": "ritual",
    "intensity": 1,
    "description": "Formalizes parallel play — doing separate things in the same room, together. Not talking, not performing, just *being* nearby. For many couples, quiet company is more intimate than conversation.",
    "prompts": [
      "What are you doing right now that you'd enjoy doing *near* me, not *with* me?",
      "Describe your ideal quiet company setup: same couch, different rooms, or same room, different chairs?",
      "What sound do you want in the background when we're quietly together — music, silence, rain, or something else?",
      "What is a hobby you'd like to do *beside* me, even if I don't do it too?",
      "How do you know when quiet company is working — what does it feel like?",
      "What is one thing you'd want me *not* to do during quiet company (e.g. ask questions, talk, check in)?",
      "Design a quiet company evening: 2 activities, 1 snack, 0 talking required.",
      "What would make quiet company feel like *connection*, not just being in the same house?",
      "When is quiet company *better* than talking for you?",
      "What is a memory of quiet company that felt especially good?",
      "If quiet company had a rule, what would it be?",
      "What is one thing you'd like to do quietly together tomorrow?"
    ],
    "design": {
      "whatItDoes": "Formalizes parallel play — doing separate things in the same room, together. Not talking, not performing, just *being* nearby. For many couples, quiet company is more intimate than conversation.",
      "whyPromptsWork": "",
      "playWhen": "Tired, overstimulated, or after a busy day. Pair with Quiet Moment duel — Quiet Company is together, Quiet Moment is breath.\n1. What are you doing right now that you'd enjoy doing *near* me, not *with* me?\n2. Describe your ideal quiet company setup: same couch, different rooms, or same room, different chairs?\n3. What sound do you want in the background when we're quietly together — music, silence, rain, or something else?\n4. What is a hobby you'd like to do *beside* me, even if I don't do it too?\n5. How do you know when quiet company is working — what does it feel like?\n6. What is one thing you'd want me *not* to do during quiet company (e.g. ask questions, talk, check in)?\n7. Design a quiet company evening: 2 activities, 1 snack, 0 talking required.\n8. What would make quiet company feel like *connection*, not just being in the same house?\n9. When is quiet company *better* than talking for you?\n10. What is a memory of quiet company that felt especially good?\n11. If quiet company had a rule, what would it be?\n12. What is one thing you'd like to do quietly together tomorrow?",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "couple-coop",
    "title": "Couple Co-op",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "description": "Turns a real task into a co-op game. Cooking, cleaning, planning, packing — all become a 2-player game with roles, power-ups, and a boss level. Play makes labor feel shared, not divided.",
    "prompts": [
      "If cooking dinner were a video game, what would our roles be — and what is the boss level?",
      "Design a power-up for our least favorite chore. What does it do?",
      "What is the final boss of our week, and how do we beat it together?",
      "If tidying were a co-op game, what would the “combo move” be?",
      "Assign us co-op roles for a grocery run: who is the scout, who is the carrier, who is the snack chooser?",
      "What would our co-op game's save point be — where do we pause and rest?",
      "Invent a cheat code for a chore we both hate.",
      "If we had a “team attack” for a hard day, what would it look like?",
      "What is a chore that is *actually* fun when we do it as a co-op?",
      "Design a co-op level for “getting ready to leave the house on time.”",
      "What is our co-op victory dance?",
      "If we could add one NPC (non-player character) to help us this week, who/what would it be?"
    ],
    "design": {
      "whatItDoes": "Turns a real task into a co-op game. Cooking, cleaning, planning, packing — all become a 2-player game with roles, power-ups, and a boss level. Play makes labor feel shared, not divided.",
      "whyPromptsWork": "",
      "playWhen": "Chores, cooking, or planning feel heavy. Pair with Tiny Shark Tank — Co-op is doing, Shark Tank is pitching.\n1. If cooking dinner were a video game, what would our roles be — and what is the boss level?\n2. Design a power-up for our least favorite chore. What does it do?\n3. What is the final boss of our week, and how do we beat it together?\n4. If tidying were a co-op game, what would the “combo move” be?\n5. Assign us co-op roles for a grocery run: who is the scout, who is the carrier, who is the snack chooser?\n6. What would our co-op game's save point be — where do we pause and rest?\n7. Invent a cheat code for a chore we both hate.\n8. If we had a “team attack” for a hard day, what would it look like?\n9. What is a chore that is *actually* fun when we do it as a co-op?\n10. Design a co-op level for “getting ready to leave the house on time.”\n11. What is our co-op victory dance?\n12. If we could add one NPC (non-player character) to help us this week, who/what would it be?",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "what-if-machine",
    "title": "The What-If Machine",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "description": "A machine that generates absurd what-ifs — “What if we had to communicate only in song lyrics for a day?” — and you have to answer *seriously*. Absurd premises + serious answers = laughter + real insight.",
    "prompts": [
      "What if we could only communicate in emojis for a whole evening? How would we survive?",
      "What if our house was a boat for a week? What would change?",
      "What if we swapped morning routines for a day? What would we learn?",
      "What if we had to plan a date using only a map and no phones?",
      "What if we were the last two people awake in our town? What would we do?",
      "What if we had a tiny dragon as a pet? Who would be in charge of feeding it?",
      "What if we could hear each other's thoughts for 10 minutes? What would we hear?",
      "What if we had to live in a different decade for a week? Which one?",
      "What if our couch could talk? What would it say about us?",
      "What if we had to throw a party for our future selves? What would we serve?",
      "What if we could only eat one meal together for the rest of our lives? What would it be?",
      "What if we had a time machine that only goes back 24 hours? What would we redo?"
    ],
    "design": {
      "whatItDoes": "A machine that generates absurd what-ifs — “What if we had to communicate only in song lyrics for a day?” — and you have to answer *seriously*. Absurd premises + serious answers = laughter + real insight.",
      "whyPromptsWork": "",
      "playWhen": "When you want imagination without pressure. Pair with What-If in Love in the Blanks — Machine is premise, Blanks is story.\n1. What if we could only communicate in emojis for a whole evening? How would we survive?\n2. What if our house was a boat for a week? What would change?\n3. What if we swapped morning routines for a day? What would we learn?\n4. What if we had to plan a date using only a map and no phones?\n5. What if we were the last two people awake in our town? What would we do?\n6. What if we had a tiny dragon as a pet? Who would be in charge of feeding it?\n7. What if we could hear each other's thoughts for 10 minutes? What would we hear?\n8. What if we had to live in a different decade for a week? Which one?\n9. What if our couch could talk? What would it say about us?\n10. What if we had to throw a party for our future selves? What would we serve?\n11. What if we could only eat one meal together for the rest of our lives? What would it be?\n12. What if we had a time machine that only goes back 24 hours? What would we redo?",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "museum-gift-shop",
    "title": "Tiny Museum Gift Shop",
    "vibe": "playful",
    "type": "journal",
    "intensity": 1,
    "description": "Companion to Museum of Us. If the museum is the exhibits, the gift shop is the souvenirs — what would you *sell* to visitors that captures us? Designing souvenirs forces you to distill your relationship into an object.",
    "prompts": [
      "What would our museum gift shop's best-selling item be?",
      "Design a souvenir that makes no sense to outsiders but perfect sense to us.",
      "What would the gift shop's “I was here” postcard say?",
      "Invent a tiny, useless souvenir that we would both love.",
      "What would our gift shop sell that is *actually* useful (e.g. a mug, a tote, a keychain)?",
      "Design a gift-shop item for a *hard* chapter — how do you souvenir a hard time?",
      "What would the gift shop's window display be?",
      "If a stranger bought one item, which one would tell them the most about us?",
      "Design a gift-shop item that is just a *sound* or a *smell*.",
      "What would our gift shop's “staff pick” be, and who picked it?",
      "Invent a souvenir for a memory we haven't made yet.",
      "What would the gift shop's closing-time announcement say?"
    ],
    "design": {
      "whatItDoes": "Companion to Museum of Us. If the museum is the exhibits, the gift shop is the souvenirs — what would you *sell* to visitors that captures us? Designing souvenirs forces you to distill your relationship into an object.",
      "whyPromptsWork": "",
      "playWhen": "After Museum of Us. Pair with Museum — Museum is exhibits, Gift Shop is souvenirs.\n1. What would our museum gift shop's best-selling item be?\n2. Design a souvenir that makes no sense to outsiders but perfect sense to us.\n3. What would the gift shop's “I was here” postcard say?\n4. Invent a tiny, useless souvenir that we would both love.\n5. What would our gift shop sell that is *actually* useful (e.g. a mug, a tote, a keychain)?\n6. Design a gift-shop item for a *hard* chapter — how do you souvenir a hard time?\n7. What would the gift shop's window display be?\n8. If a stranger bought one item, which one would tell them the most about us?\n9. Design a gift-shop item that is just a *sound* or a *smell*.\n10. What would our gift shop's “staff pick” be, and who picked it?\n11. Invent a souvenir for a memory we haven't made yet.\n12. What would the gift shop's closing-time announcement say?",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "daily-double",
    "title": "The Daily Double",
    "vibe": "playful",
    "type": "match",
    "intensity": 1,
    "description": "Two quick matches a day — one silly, one tender. It's Mind Meld, but daily and tiny. The daily cadence makes it a ritual, not a game. Two questions, one match, done.",
    "prompts": [
      "Today, our ideal snack is… / Today, our ideal way to be cared for is…",
      "If we had 10 minutes together right now, we'd… / The song that fits today is…",
      "Our mascot today would be… / The look I love today is…",
      "The best part of today was… / The hardest part of today was…",
      "If today were a weather report, it would be… / If today were a color, it would be…",
      "The tiny luxury we need today is… / The tiny adventure we could take today is…",
      "Our ideal tonight is… / Our ideal tomorrow morning is…",
      "The thing I want to thank you for today is… / The thing I want to ask you for today is…",
      "If we had a free hour, we'd… / If we had a free day, we'd…",
      "The emoji that fits today is… / The word that fits today is…",
      "Our house rule for today is… / Our tradition for today is…",
      "The memory I want to keep from today is… / The hope I have for tomorrow is…"
    ],
    "design": {
      "whatItDoes": "Two quick matches a day — one silly, one tender. It's Mind Meld, but daily and tiny. The daily cadence makes it a ritual, not a game. Two questions, one match, done.",
      "whyPromptsWork": "",
      "playWhen": "Daily check-in. Pair with Mind Meld — Daily Double is daily, Mind Meld is nightly.\n1. Today, our ideal snack is… / Today, our ideal way to be cared for is…\n2. If we had 10 minutes together right now, we'd… / The song that fits today is…\n3. Our mascot today would be… / The look I love today is…\n4. The best part of today was… / The hardest part of today was…\n5. If today were a weather report, it would be… / If today were a color, it would be…\n6. The tiny luxury we need today is… / The tiny adventure we could take today is…\n7. Our ideal tonight is… / Our ideal tomorrow morning is…\n8. The thing I want to thank you for today is… / The thing I want to ask you for today is…\n9. If we had a free hour, we'd… / If we had a free day, we'd…\n10. The emoji that fits today is… / The word that fits today is…\n11. Our house rule for today is… / Our tradition for today is…\n12. The memory I want to keep from today is… / The hope I have for tomorrow is…",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "longing-ledger",
    "title": "Longing Ledger",
    "vibe": "spicy",
    "type": "journal",
    "intensity": 2,
    "description": "Companion to What I Miss Today, but longer-form. You keep a running ledger of longing — not just what you miss, but *how* it feels, *when* it hits, and what you'd do when you reunite. Longing, written down, becomes anticipation, not just sadness.",
    "prompts": [
      "When does longing hit you hardest — morning, evening, or in between?",
      "What is a specific, ordinary moment you long for that no one else would understand?",
      "Describe longing as a weather, a color, or a sound. What is ours today?",
      "What would the first 10 minutes of our reunion look like, in detail?",
      "What is something you long for that is *not* physical — a conversation, a routine, a look?",
      "Write a longing entry that is funny, not sad.",
      "What is a longing you have that you *haven't* told me yet?",
      "If longing had a gift, what would you give me when we reunite?",
      "What is a small, daily longing that repeats — a coffee, a walk, a hello?",
      "Describe a longing from *before* we met that makes more sense now.",
      "What would you want me to know about longing on a day when you don't say it?",
      "Write a longing entry for a future version of us who are *not* apart."
    ],
    "design": {
      "whatItDoes": "Companion to What I Miss Today, but longer-form. You keep a running ledger of longing — not just what you miss, but *how* it feels, *when* it hits, and what you'd do when you reunite. Longing, written down, becomes anticipation, not just sadness.",
      "whyPromptsWork": "",
      "playWhen": "Apart, or longing for closeness. Pair with What I Miss Today — Longing is ledger, Miss is daily.\n1. When does longing hit you hardest — morning, evening, or in between?\n2. What is a specific, ordinary moment you long for that no one else would understand?\n3. Describe longing as a weather, a color, or a sound. What is ours today?\n4. What would the first 10 minutes of our reunion look like, in detail?\n5. What is something you long for that is *not* physical — a conversation, a routine, a look?\n6. Write a longing entry that is funny, not sad.\n7. What is a longing you have that you *haven't* told me yet?\n8. If longing had a gift, what would you give me when we reunite?\n9. What is a small, daily longing that repeats — a coffee, a walk, a hello?\n10. Describe a longing from *before* we met that makes more sense now.\n11. What would you want me to know about longing on a day when you don't say it?\n12. Write a longing entry for a future version of us who are *not* apart.",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "slow-hello",
    "title": "The Slow Hello",
    "vibe": "spicy",
    "type": "ritual",
    "intensity": 1,
    "description": "A reunion ritual that is deliberately slow. Not a quick hug and back to phones, but a 60-second hello — eye contact, a breath, a touch, a sentence. Slowness makes hello feel like *arrival*.",
    "prompts": [
      "What would your ideal slow hello look like — where, how, for how long?",
      "What is the first thing you'd want me to say when I see you after a day apart?",
      "What is a touch that says “I missed you” without words?",
      "How do you want to be greeted when you're tired vs when you're happy?",
      "What is a slow hello that is just *looking* — no words, no touch, just seeing each other?",
      "Design a slow hello for a day when one of us is grumpy.",
      "What would a slow hello look like if we were in a crowd?",
      "What is a hello you *wish* we had a ritual for?",
      "If our hello had a soundtrack, what would it be?",
      "What is one thing you'd want me *not* to do during our hello (e.g. check phone, ask about dinner)?",
      "Write a slow hello for a version of us who haven't seen each other in a month.",
      "What is a slow hello that is *also* a goodbye — for when one of us is leaving?"
    ],
    "design": {
      "whatItDoes": "A reunion ritual that is deliberately slow. Not a quick hug and back to phones, but a 60-second hello — eye contact, a breath, a touch, a sentence. Slowness makes hello feel like *arrival*.",
      "whyPromptsWork": "",
      "playWhen": "Reuniting after a day apart. Pair with Landing Lights — Slow Hello is arrival, Landing is end-of-day.\n1. What would your ideal slow hello look like — where, how, for how long?\n2. What is the first thing you'd want me to say when I see you after a day apart?\n3. What is a touch that says “I missed you” without words?\n4. How do you want to be greeted when you're tired vs when you're happy?\n5. What is a slow hello that is just *looking* — no words, no touch, just seeing each other?\n6. Design a slow hello for a day when one of us is grumpy.\n7. What would a slow hello look like if we were in a crowd?\n8. What is a hello you *wish* we had a ritual for?\n9. If our hello had a soundtrack, what would it be?\n10. What is one thing you'd want me *not* to do during our hello (e.g. check phone, ask about dinner)?\n11. Write a slow hello for a version of us who haven't seen each other in a month.\n12. What is a slow hello that is *also* a goodbye — for when one of us is leaving?",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "whispered-map",
    "title": "Whispered Map",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 2,
    "description": "A map of closeness, whispered. You describe where closeness lives in your day — a chair, a kitchen, a walk, a car — and what makes that place feel close. Places carry intimacy; mapping them makes them intentional.",
    "prompts": [
      "Where in our home (or our day) do you feel closest to me?",
      "What is a place that *only* feels close when we're together?",
      "Describe a place you'd like to be close in that we've never been.",
      "What makes a place feel close — light, sound, privacy, or something else?",
      "What is a place where closeness feels *easy*, and a place where it feels *hard*?",
      "If closeness had a map, where would “home” be?",
      "What is a tiny, ordinary place (a doorway, a car, a kitchen) that feels like ours?",
      "Describe a place you'd want to whisper in — not because it's secret, but because it's soft.",
      "What place would you choose for a 10-minute closeness ritual?",
      "If we could add a room to our home that is *only* for closeness, what would it have?",
      "What is a place from our past that still feels close when you think of it?",
      "Draw (or describe) a map of our closeness: 3 places, 3 feelings, 1 wish."
    ],
    "design": {
      "whatItDoes": "A map of closeness, whispered. You describe where closeness lives in your day — a chair, a kitchen, a walk, a car — and what makes that place feel close. Places carry intimacy; mapping them makes them intentional.",
      "whyPromptsWork": "",
      "playWhen": "Tender, reflective. Pair with Whisper Line — Map is places, Whisper is words.\n1. Where in our home (or our day) do you feel closest to me?\n2. What is a place that *only* feels close when we're together?\n3. Describe a place you'd like to be close in that we've never been.\n4. What makes a place feel close — light, sound, privacy, or something else?\n5. What is a place where closeness feels *easy*, and a place where it feels *hard*?\n6. If closeness had a map, where would “home” be?\n7. What is a tiny, ordinary place (a doorway, a car, a kitchen) that feels like ours?\n8. Describe a place you'd want to whisper in — not because it's secret, but because it's soft.\n9. What place would you choose for a 10-minute closeness ritual?\n10. If we could add a room to our home that is *only* for closeness, what would it have?\n11. What is a place from our past that still feels close when you think of it?\n12. Draw (or describe) a map of our closeness: 3 places, 3 feelings, 1 wish.",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  },
  {
    "id": "afterglow-notes",
    "title": "Afterglow Notes",
    "vibe": "spicy",
    "type": "journal",
    "intensity": 2,
    "description": "A journal for the *after* — not the moment itself, but the soft, quiet feeling after a good evening, a good date, a good conversation. Afterglow is the feeling that lingers. Writing it down preserves it.",
    "prompts": [
      "What is lingering for you after tonight — a feeling, a sentence, a look?",
      "Describe tonight's afterglow as a color, a temperature, or a sound.",
      "What is one thing from tonight you want to remember tomorrow?",
      "If tonight had a one-line afterglow note, what would it say?",
      "What made tonight feel *soft* — not exciting, just soft?",
      "What is a small detail from tonight that you didn't want to end?",
      "Write an afterglow note for a night that was *ordinary* but still good.",
      "What would you want me to remember about tonight if I forgot everything else?",
      "Describe an afterglow from *before* we met that makes sense now.",
      "What is an afterglow you want to *create* tomorrow?",
      "If afterglow had a ritual, what would it be — a note, a photo, a sentence?",
      "Write an afterglow note for a future night we haven't had yet."
    ],
    "design": {
      "whatItDoes": "A journal for the *after* — not the moment itself, but the soft, quiet feeling after a good evening, a good date, a good conversation. Afterglow is the feeling that lingers. Writing it down preserves it.",
      "whyPromptsWork": "",
      "playWhen": "After a good night. Pair with After Hours — Afterglow is after, After Hours is during.\n1. What is lingering for you after tonight — a feeling, a sentence, a look?\n2. Describe tonight's afterglow as a color, a temperature, or a sound.\n3. What is one thing from tonight you want to remember tomorrow?\n4. If tonight had a one-line afterglow note, what would it say?\n5. What made tonight feel *soft* — not exciting, just soft?\n6. What is a small detail from tonight that you didn't want to end?\n7. Write an afterglow note for a night that was *ordinary* but still good.\n8. What would you want me to remember about tonight if I forgot everything else?\n9. Describe an afterglow from *before* we met that makes sense now.\n10. What is an afterglow you want to *create* tomorrow?\n11. If afterglow had a ritual, what would it be — a note, a photo, a sentence?\n12. Write an afterglow note for a future night we haven't had yet.\n\n\n## Prompt and question banks — expanded\n\nEach bank below keeps its original prompts (listed in the v2 catalog) and adds new ones in the same voice. The note at the start of each bank explains *why* the bank exists — what relational test it performs.",
      "makeItLand": "",
      "watchOut": "",
      "twist": ""
    }
  }
];


export function getNewBoardActivity(id) { return NEW_BOARD_ACTIVITIES.find((a) => a.id === id) ?? null; }
export function getNewBoardActivitiesByVibe(vibe) { return NEW_BOARD_ACTIVITIES.filter((a) => a.vibe === vibe); }
export const NEW_BOARD_ACTIVITY_COUNT = NEW_BOARD_ACTIVITIES.length; // 12
export const NEW_BOARD_PROMPT_COUNT = NEW_BOARD_ACTIVITIES.reduce((n, a) => n + a.prompts.length, 0); // 144
