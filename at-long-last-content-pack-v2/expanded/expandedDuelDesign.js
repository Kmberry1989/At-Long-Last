// expandedDuelDesign.js — design reading + variant for all 18 duels + arcade rules
// At Long Last — Expanded Edition (Nov 26, 2026)
// ADDITIVE ONLY. No duel mechanics change. This file adds the *reading*
// (what each duel teaches) and a variant to try, plus arcade expansion rules.
// Archived duels stay archived: their best prompts already live in stronger games.

export const DUEL_DESIGN = [
  {
    "id": "constellation-home",
    "title": "Star Map",
    "vibe": "tender",
    "intensity": 1,
    "status": "Selectable",
    "teaches": "Values are not fixed. Ranking five values privately, then comparing, shows *where you are now*, not who you are forever. The reveal is not “we match / don't match” — it's “tell me why you put Trust above Laughter this week.”",
    "pairsWith": "Wavelength (both rank/guess), Future Artifact (values as objects).",
    "variant": "Do Star Map once, then re-rank the same five values a month later. What moved, and why?"
  },
  {
    "id": "heartbeat-hold-tender",
    "title": "Heartbeat Hold",
    "vibe": "tender",
    "intensity": 1,
    "status": "Registered, not selectable",
    "teaches": "Co-regulation. Holding a button together while the board pulses is *staying* — not fixing, not talking, just staying. Release ends it. The game ends when one lets go, and that's okay. Duration is not a score.",
    "pairsWith": "Quiet Moment, Harmonic Lock, Tempo Tap — all non-verbal attunement.",
    "variant": "Hold the button and breathe together for 3 breaths. Let go on the exhale."
  },
  {
    "id": "letterpress-one-word",
    "title": "Letterpress",
    "vibe": "tender",
    "intensity": 2,
    "status": "Selectable",
    "teaches": "Co-authorship. You each add four words to a starter, the reveal weaves them alternating. You have to *read* the starter and imagine your partner's words. The sentence you get is neither yours nor theirs — it's *ours*.",
    "pairsWith": "Our Next Line (both are co-writing), Word Weaver (both are wordplay).",
    "variant": "After the reveal, each partner writes a one-word reply to the woven sentence."
  },
  {
    "id": "sync-breath",
    "title": "Quiet Moment",
    "vibe": "tender",
    "intensity": 1,
    "status": "Selectable",
    "teaches": "Choice in regulation. You choose a breathing, grounding, or muscle-release pause. Choice is the mechanic — you pick what you need, not what the game tells you to need.",
    "pairsWith": "Anchor Memory, Weather Report, Rose Thorn Seed.",
    "variant": "Do Quiet Moment, then name one Anchor Memory that felt safe. Breath + memory = double regulation."
  },
  {
    "id": "gratitude-duel",
    "title": "Gratitude Duel",
    "vibe": "tender",
    "intensity": 1,
    "status": "Selectable",
    "teaches": "Parallel gratitude amplifies. Both answer the same prompt privately, both open together. Hearing *two* gratitudes at once is more than twice as good — it's evidence that gratitude is *shared*.",
    "pairsWith": "Small Mercies, Gratitude Snapshot, Vault.",
    "variant": "After reading both, each partner repeats the other's gratitude in their own words: “You said I…”"
  },
  {
    "id": "doodle-duel-memory",
    "title": "Keepsake Sketch",
    "vibe": "playful",
    "intensity": 1,
    "status": "Selectable",
    "teaches": "Vulnerability via bad drawing. 60 seconds, thick brush, no eraser, draw our couch from memory. Bad is the point. Voting “more accurate / more cursed” makes it a game, not a test.",
    "pairsWith": "Blind Canvas, Portrait Panic.",
    "variant": "After the reveal, each partner tells the story of the couch they drew. The drawing is the prompt; the story is the payoff."
  },
  {
    "id": "portrait-panic-directed",
    "title": "Portrait Panic",
    "vibe": "playful",
    "intensity": 2,
    "status": "Selectable",
    "teaches": "Directed vulnerability. You send three cues, your partner draws you from them. You *direct* how you're seen, but you don't control the drawing. That gap — direction vs result — is the game.",
    "pairsWith": "Keepsake Sketch, Blind Canvas.",
    "variant": "After drawing, swap cues and draw again. How does a different set of cues change the portrait?"
  },
  {
    "id": "wavelength-slider",
    "title": "Wavelength Slider (Archived)",
    "vibe": "playful",
    "intensity": 1,
    "status": "Registered, not selectable",
    "teaches": "Why archiving was right. The old slider asked “How chaotic was your day?” and measured distance. The new Wavelength asks *choice + scale* and measures *guessing*. The new version is better because guessing is more revealing than distance alone.\n**Lesson:** Don't keep two mechanics that do the same job. Archive the weaker one, fold its best prompt into the stronger one.",
    "pairsWith": "Wavelength (successor).",
    "variant": ""
  },
  {
    "id": "emoji-court",
    "title": "Emoji Court",
    "vibe": "playful",
    "intensity": 1,
    "status": "Registered, not selectable",
    "teaches": "Constrained communication. Prosecution in 5 emoji only, defense in 10 words. The constraint forces creativity — you have to *show* the accusation, not just say it. The verdict “guilty of being cute” is the punchline that keeps it safe.",
    "pairsWith": "Emoji Forecast, Translation.",
    "variant": "After the verdict, the “guilty” partner can appeal in 5 words. The judge (board) decides again."
  },
  {
    "id": "reaction-heart",
    "title": "Heartflash",
    "vibe": "playful",
    "intensity": 1,
    "status": "Registered, not selectable",
    "teaches": "Quick, low-stakes reaction. A heart flashes, you tap the matching symbol. It's not about skill — it's about *attention*. The game is a palette cleanser, not a main event.",
    "pairsWith": "Tempo Tap, Kiss Courier — all quick, embodied, playful.",
    "variant": "Tap 3 flashes in a row. If you miss one, you have to send a heart emoji."
  },
  {
    "id": "kiss-courier",
    "title": "Kiss Courier",
    "vibe": "spicy",
    "intensity": 1,
    "status": "Selectable",
    "teaches": "Embodied sending and receiving. You blow a kiss, it becomes a particle stream, your partner catches it. The catch is the point — a kiss is not just sent, it's *received*. The board glows when it's caught.",
    "pairsWith": "Whisper Line, Rewind, Green Light Tonight.",
    "variant": "After the catch, the catcher writes one line: “I caught it, and it felt like…”"
  },
  {
    "id": "fever-dream-date",
    "title": "Fever Dream Date",
    "vibe": "spicy",
    "intensity": 2,
    "status": "Registered, not selectable",
    "teaches": "Merging fantasies. Both build a dream date in 45 seconds, then pick one detail from each to create a final date. The merge is negotiation — you have to *choose* together, not just dream separately.",
    "pairsWith": "Date That Never Ends, Date Trailer, Cursed Date.",
    "variant": "Pick one detail from the merged date and do a 20-minute version of it this week."
  },
  {
    "id": "voice-note-trailer",
    "title": "Trailer Voice",
    "vibe": "spicy",
    "intensity": 2,
    "status": "Registered, not selectable",
    "teaches": "Why folding was right. The standalone voice-note game is archived; its movie-trailer prompt now lives in Kiss Courier. The lesson: don't keep a whole game for one prompt. Fold the prompt into a stronger game.",
    "pairsWith": "Kiss Courier (successor), Date Trailer.",
    "variant": ""
  },
  {
    "id": "temperature-check",
    "title": "Temperature Check",
    "vibe": "spicy",
    "intensity": 1,
    "status": "Registered, not selectable",
    "teaches": "Why folding was right, part 2. The closeness check “How close do you feel 1–10?” now lives in Wavelength (147: “How close do you feel to your partner today?”). The standalone game is gone; the prompt is kept where it belongs — in the guessing game.",
    "pairsWith": "Wavelength (successor).",
    "variant": ""
  },
  {
    "id": "slow-draw-portrait-romantic",
    "title": "Slow Draw",
    "vibe": "spicy",
    "intensity": 2,
    "status": "Registered, not selectable",
    "teaches": "Why folding was right, part 3. Partner portrait prompts now live in Keepsake Sketch. The lesson: if two games do the same thing (draw your partner), keep the one with the better mechanic (60-sec, thick brush, no eraser) and fold the other's prompts into it.",
    "pairsWith": "Keepsake Sketch (successor).",
    "variant": ""
  },
  {
    "id": "wavelength-duel",
    "title": "Wavelength",
    "vibe": "playful",
    "intensity": 1,
    "status": "Selectable",
    "teaches": "Guessing is more intimate than matching. Five prompts mix choices and 1–10 scales. You answer for yourself, then guess your partner. A close scale guess counts. The game rewards *knowing*, not just *agreeing*.",
    "pairsWith": "Mind Meld, Prediction Box, Same Wavelength, Vibe Check — the whole synchrony family.",
    "variant": "Before revealing, bet on which prompt you'll be closest on. The bet makes the reveal more fun."
  },
  {
    "id": "love-in-the-blanks",
    "title": "Love in the Blanks",
    "vibe": "playful",
    "intensity": 1,
    "status": "Selectable",
    "teaches": "Surprise via word choice. Each fills a Mad Lib privately with word choices, both stories reveal together. The story is not the point — your *word choices* are. “Adjective + noun + verb” reveals how you think.",
    "pairsWith": "Word Weaver, Our Next Line.",
    "variant": "After the reveal, draw the story you got. The drawing is the second reveal."
  },
  {
    "id": "our-next-line",
    "title": "Our Next Line",
    "vibe": "tender",
    "intensity": 1,
    "status": "Selectable",
    "teaches": "Turn-taking. Add eight words, one at a time, to a seed. The reveal alternates your words. You can't control the sentence — you can only add one word and trust your partner to add the next. Trust, one word at a time.",
    "pairsWith": "Letterpress, Love in the Blanks.",
    "variant": "Do it live, alternating words in real time, no sealing. The live version is sillier; the sealed version is more honest. Try both.\n\n---"
  }
];

export const ARCADE_EXPANSIONS = [
  {
    "id": "my-one-and-only",
    "title": "My One and Only!",
    "style": "shared two-player card game",
    "teaches": "Collection as care. You collect keepsakes by playing cards together.",
    "expansionRule": "Add a Wild Card that lets you steal a keepsake by writing a compliment. The compliment is the cost."
  },
  {
    "id": "say-without-saying",
    "title": "Say Without Saying",
    "style": "charades",
    "teaches": "Embodied remembering. Acting out a shared moment is remembering it.",
    "expansionRule": "Act it without using your hands. How do you show a love note delivered by a fancy pigeon with only your face?",
    "bank": "say-it-without-saying",
    "bankBefore": 48,
    "bankAfter": 60
  },
  {
    "id": "catch-my-heart",
    "title": "Catch My Heart",
    "style": "Go Fish-style keepsake collection",
    "teaches": "Asking for what you want. Go Fish is 'Do you have…?' — you have to ask for the card you want.",
    "expansionRule": "When you ask for a card and your partner has it, they have to tell you why they kept it. The story is the keepsake."
  },
  {
    "id": "radar-love",
    "title": "Radar Love",
    "style": "Battleship-style fleet placement and guessing",
    "teaches": "Guessing where your partner hid something. Theory of mind as Battleship.",
    "expansionRule": "Name your fleets after memories: 'The First Date,' 'The Rainy Day,' 'The Ordinary Tuesday.' Guessing a fleet is guessing a memory."
  },
  {
    "id": "four-ever",
    "title": "Four Ever",
    "style": "Connect Four with collectible tokens",
    "teaches": "Strategy + collection. Each token is a moment, a joke, a memory.",
    "expansionRule": "Each token you place has to be 'played' with a one-line story: 'This token is for the time we…'"
  },
  {
    "id": "our-little-pieces",
    "title": "Our Little Pieces",
    "style": "shared 3D jigsaw puzzle",
    "teaches": "Co-operation, literally. You have to hold pieces for each other, turn them, fit them together.",
    "expansionRule": "Each piece you place, say one thing you're looking forward to building together. The puzzle becomes a plan."
  }
];


export function getDuelDesign(id) { return DUEL_DESIGN.find((d) => d.id === id) ?? null; }
export function getSelectableDuelDesigns() { return DUEL_DESIGN.filter((d) => /Selectable/.test(d.status) && !/not/.test(d.status)); }
