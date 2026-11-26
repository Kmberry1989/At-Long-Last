// expandedBanks.js — expanded prompt/question banks
// At Long Last — Expanded Edition (Nov 26, 2026)
// ADDITIVE ONLY. Merge with existing banks via mergeBank() below.
// Bank shapes match the existing game: choice banks are {prompt, choices[4]},
// scale banks are {prompt, scale:{low, high}}, round banks are {prompt, round},
// letter banks are {prompt, letters, note?}, plain banks are {prompt}.
// No bank changes existing entries — expansions are appended after the base.


export const BANK_META = {
  "mind-meld": {
    "title": "Mind Meld — shared-choice questions",
    "tests": "Do we match? Both choose secretly, then reveal. The joy is in the match; the value is in the mismatch.",
    "before": 56,
    "after": 68
  },
  "prediction-box": {
    "title": "The Prediction Box — prediction questions",
    "tests": "Do you know me? One predicts, the other answers honestly. A correct prediction is proof of attention. A miss is information, not failure.",
    "before": 58,
    "after": 70
  },
  "vault": {
    "title": "The Vault — sealed messages (main)",
    "tests": "Writes now, reveals at finale. The delay is the mechanic.",
    "before": 20,
    "after": 30
  },
  "vault-additional": {
    "title": "The Vault — Additional Vault prompts",
    "tests": "Writes now, reveals at finale. Same mechanic, extra contexts.",
    "before": 16,
    "after": 20
  },
  "same-wavelength": {
    "title": "Same Wavelength — sealed comparison prompts",
    "tests": "Can you write what you think, sealed, and see if we match? Writing is more honest than choosing.",
    "before": 58,
    "after": 70
  },
  "mutual-yes": {
    "title": "Mutual Yes — consent-based cards",
    "tests": "Double-blind desire. Only mutual yes reveals. All cards are low-pressure, high-care invitations.",
    "before": 20,
    "after": 30
  },
  "vibe-check": {
    "title": "Vibe Check — slider prompts",
    "tests": "Places two markers on one continuum. The distance is the conversation.",
    "before": 20,
    "after": 30
  },
  "tempo-tap": {
    "title": "Tempo Tap — rhythm round instructions",
    "tests": "Embodied synchrony. Five taps, same pulse, compare steadiness.",
    "before": 8,
    "after": 14
  },
  "word-weaver": {
    "title": "Word Weaver — letter-tray prompts",
    "tests": "Same tray, different words. Uniqueness is the prize.",
    "before": 6,
    "after": 10
  },
  "dual-axis-maze": {
    "title": "Dual-Axis Maze — cooperative route prompts",
    "tests": "One moves sideways, one moves vertically. You cannot succeed alone.",
    "before": 2,
    "after": 6
  },
  "blind-canvas": {
    "title": "Blind Canvas — drawing prompts",
    "tests": "Draw two unseen halves of one picture, then join. The join is the surprise.",
    "before": 22,
    "after": 32
  },
  "harmonic-lock": {
    "title": "Harmonic Lock — resonance prompts",
    "tests": "Non-verbal attunement. Tune separately, find where the rings feel calmest.",
    "before": 8,
    "after": 14
  },
  "bluff-bidding": {
    "title": "Bluff Bidding — category topics",
    "tests": "Bid how many you can name, or call the bluff. Categories are all shared knowledge.",
    "before": 25,
    "after": 35
  },
  "photo-flashback": {
    "title": "Photo Flashback — photo prompts",
    "tests": "Dual captions, sealed. Same photo, different captions.",
    "before": 20,
    "after": 30
  },
  "wavelength": {
    "title": "Wavelength — choice and scale questions",
    "tests": "Answer for yourself, guess for your partner. It tests guessing, not just matching.",
    "before": 157,
    "after": 181
  },
  "letterpress": {
    "title": "Letterpress — one-word prompts",
    "tests": "Each adds four words to a shared starter. The reveal weaves them alternating.",
    "before": 43,
    "after": 55
  },
  "gratitude-duel": {
    "title": "Gratitude Duel — appreciation prompts",
    "tests": "Both privately answer one shared appreciation prompt; both open in reveal.",
    "before": 36,
    "after": 48
  },
  "say-it-without-saying": {
    "title": "Say It Without Saying — charades prompts",
    "tests": "Act it, don't say it. Prompts are all shared moments.",
    "before": 48,
    "after": 60
  },
  "love-in-the-blanks": {
    "title": "Love in the Blanks — story templates",
    "tests": "Mad Libs for two. Each fills blanks privately; both stories reveal together.",
    "before": 4,
    "after": 8
  },
  "star-map": {
    "title": "Star Map — values to rank",
    "tests": "Rank five values, compare. Not a compatibility score — a conversation about what matters right now.",
    "before": 12,
    "after": 18
  },
  "portrait-panic": {
    "title": "Portrait Panic — drawing guide cues",
    "tests": "You send three cues, your partner draws you from them. You direct, they draw.",
    "before": 8,
    "after": 16
  },
  "our-next-line": {
    "title": "Our Next Line — story and song seeds",
    "tests": "Add eight words, one at a time, to a shared seed. Turn-taking is the mechanic.",
    "before": 4,
    "after": 8
  }
};

export const EXPANDED_BANKS = {
  "mind-meld": [
    {
        "prompt": "Which tiny ritual would make a weekday feel special?",
        "choices": [
            "A morning note",
            "A shared snack",
            "A 10-minute walk",
            "A goodnight check-in"
        ]
    },
    {
        "prompt": "Which kind of evening would recharge us both?",
        "choices": [
            "Quiet and cozy",
            "Silly and playful",
            "Dreamy and slow",
            "Wild and spontaneous"
        ]
    },
    {
        "prompt": "If we could keep one memory forever, which kind would it be?",
        "choices": [
            "A laugh",
            "A quiet moment",
            "An adventure",
            "A reunion"
        ]
    },
    {
        "prompt": "What should our next date *feel* like?",
        "choices": [
            "Like a first date",
            "Like a holiday",
            "Like a secret",
            "Like home"
        ]
    },
    {
        "prompt": "Which small thing would make tomorrow easier?",
        "choices": [
            "A plan",
            "A little help",
            "A kind word",
            "A little space"
        ]
    },
    {
        "prompt": "Our imaginary garden should grow…",
        "choices": [
            "Food we can eat",
            "Flowers for beauty",
            "Herbs for cooking",
            "Something wild"
        ]
    },
    {
        "prompt": "The best way to end a hard day together is…",
        "choices": [
            "Talk it out",
            "Do something fun",
            "Be quiet together",
            "Make something good to eat"
        ]
    },
    {
        "prompt": "If we had a secret language, it would be…",
        "choices": [
            "Emoji only",
            "Song titles",
            "Inside jokes",
            "Tiny gestures"
        ]
    },
    {
        "prompt": "What would make a staycation feel like a real vacation?",
        "choices": [
            "No chores",
            "A new place to explore",
            "A special meal",
            "No phones"
        ]
    },
    {
        "prompt": "Which version of us do you miss most?",
        "choices": [
            "Early us",
            "Adventurous us",
            "Cozy us",
            "Future us"
        ]
    },
    {
        "prompt": "Our next tiny quest should involve…",
        "choices": [
            "Food",
            "A walk",
            "Making something",
            "Learning something"
        ]
    },
    {
        "prompt": "The most romantic ordinary moment is…",
        "choices": [
            "Morning coffee",
            "A shared laugh",
            "A quiet walk",
            "Falling asleep together"
        ]
    }
],
  "prediction-box": [
    {
        "prompt": "What would your partner pick for a perfect 10-minute break?",
        "choices": [
            "A walk",
            "A snack",
            "A quiet moment",
            "A funny video"
        ]
    },
    {
        "prompt": "Which tiny gift would make your partner's week?",
        "choices": [
            "A note",
            "A favorite snack",
            "Help with a task",
            "Time together"
        ]
    },
    {
        "prompt": "What does your partner want most from a slow morning?",
        "choices": [
            "No alarm",
            "Good food",
            "Quiet company",
            "A plan for the day"
        ]
    },
    {
        "prompt": "Which compliment would your partner most want to hear today?",
        "choices": [
            "You look amazing",
            "You handled that so well",
            "I love your laugh",
            "I'm proud of you"
        ]
    },
    {
        "prompt": "What is your partner's ideal way to celebrate a small win?",
        "choices": [
            "A treat",
            "A hug",
            "Tell everyone",
            "A quiet proud moment"
        ]
    },
    {
        "prompt": "Which kind of surprise would your partner *least* want?",
        "choices": [
            "A big party",
            "A surprise trip",
            "A surprise visitor",
            "A surprise chore"
        ]
    },
    {
        "prompt": "What would your partner choose for a cozy night in?",
        "choices": [
            "A movie",
            "A game",
            "Cooking",
            "Reading side by side"
        ]
    },
    {
        "prompt": "Which memory does your partner most want to revisit?",
        "choices": [
            "A trip",
            "A first date",
            "An ordinary perfect day",
            "A funny mishap"
        ]
    },
    {
        "prompt": "What does your partner need after a long day — really?",
        "choices": [
            "To vent",
            "To be distracted",
            "To be held",
            "To be left alone for a bit"
        ]
    },
    {
        "prompt": "Which small ritual would your partner most want to start?",
        "choices": [
            "Morning coffee together",
            "Evening walk",
            "Goodnight check-in",
            "Weekly date"
        ]
    },
    {
        "prompt": "What is your partner's favorite way to be thanked?",
        "choices": [
            "In words",
            "In actions",
            "In a note",
            "In a hug"
        ]
    },
    {
        "prompt": "If your partner could have one superpower for today, which would they pick?",
        "choices": [
            "Pause time",
            "Teleport",
            "Read minds",
            "Never get tired"
        ]
    }
],
  "vault": [
    {
        "prompt": "Seal one sentence you want your partner to hear on their next birthday."
    },
    {
        "prompt": "Seal a thank-you for a version of your partner that only you see."
    },
    {
        "prompt": "Seal one thing you noticed about your partner today that you didn't say out loud."
    },
    {
        "prompt": "Write a note for the next time your partner doubts themselves."
    },
    {
        "prompt": "Seal a wish for a version of us that hasn't happened yet."
    },
    {
        "prompt": "Leave a note for a future ordinary day when you both need cheering up."
    },
    {
        "prompt": "Seal the title of a song that sounds like how you feel about them right now."
    },
    {
        "prompt": "Write one thing you hope they remember about *this* night."
    },
    {
        "prompt": "Seal a promise that is just for tomorrow — small enough to keep."
    },
    {
        "prompt": "Leave a post-finale note: “After you read this, I want you to know…”"
    }
],
  "vault-additional": [
    {
        "prompt": "Leave a note for the next time you both laugh until you can't breathe."
    },
    {
        "prompt": "Write a sentence you'd want to read on a morning when you miss each other."
    },
    {
        "prompt": "Save a memory of a time you felt *seen* by your partner."
    },
    {
        "prompt": "Describe the next ordinary moment you want to turn into a treasure."
    }
],
  "same-wavelength": [
    {
        "prompt": "If we had a free evening with no phones, what would we actually do?"
    },
    {
        "prompt": "What is the most *us* thing we've done in the last week?"
    },
    {
        "prompt": "What would our dream *ordinary* day look like — hour by hour?"
    },
    {
        "prompt": "What is one thing you wish I knew about how you feel today?"
    },
    {
        "prompt": "If we could keep one habit forever, which one?"
    },
    {
        "prompt": "What is the best tiny thing I did this week, in your opinion?"
    },
    {
        "prompt": "What would you want to tell future-us about this month?"
    },
    {
        "prompt": "If we had a secret place, where would it be and what would we do there?"
    },
    {
        "prompt": "What is one thing you want to do together that we keep postponing?"
    },
    {
        "prompt": "What does “home” mean to you right now — a place, a person, or a feeling?"
    },
    {
        "prompt": "What is a memory you want to make before this season ends?"
    },
    {
        "prompt": "If you could describe us in 3 words that no one else would use, what would they be?"
    }
],
  "mutual-yes": [
    {
        "prompt": "A 10-minute slow hello when we next see each other — eye contact, no phones?"
    },
    {
        "prompt": "A walk where we only talk about good things — no problems, just good?"
    },
    {
        "prompt": "Making a tiny snack together and eating it in our favorite spot?"
    },
    {
        "prompt": "A 5-minute drawing of each other, no skill required, just for laughs?"
    },
    {
        "prompt": "Reading one Vault note out loud, slowly, with no rush?"
    },
    {
        "prompt": "A phone call just to say goodnight, even if we're in the same house?"
    },
    {
        "prompt": "Choosing a song for each other and listening to it together, start to finish?"
    },
    {
        "prompt": "A 2-minute hug with no talking, no fixing, just holding?"
    },
    {
        "prompt": "Planning a tiny date for *this* week — not someday, this week?"
    },
    {
        "prompt": "Writing each other a 1-line love note to find tomorrow morning?"
    }
],
  "vibe-check": [
    {
        "prompt": "How much *togetherness* do you want tonight?",
        "scale": {
            "low": "Side by side, separate activities",
            "high": "Doing everything together"
        }
    },
    {
        "prompt": "How much do you want to be *seen* vs *comforted* right now?",
        "scale": {
            "low": "See me, really see me",
            "high": "Comfort me, just hold me"
        }
    },
    {
        "prompt": "Our next memory should be…",
        "scale": {
            "low": "A tiny, quiet one",
            "high": "A big, unforgettable one"
        }
    },
    {
        "prompt": "How much *planning* feels good for a date?",
        "scale": {
            "low": "No plan, just go",
            "high": "Every detail planned"
        }
    },
    {
        "prompt": "How do you want to feel after tonight?",
        "scale": {
            "low": "Calm and rested",
            "high": "Energized and giddy"
        }
    },
    {
        "prompt": "How much do you want to talk about feelings tonight?",
        "scale": {
            "low": "Just a little",
            "high": "Let's go deep"
        }
    },
    {
        "prompt": "Our ideal pace for this week is…",
        "scale": {
            "low": "Slow, one thing at a time",
            "high": "Full, busy, lots happening"
        }
    },
    {
        "prompt": "How much *new* do you want vs *familiar*?",
        "scale": {
            "low": "All familiar, comfort only",
            "high": "All new, surprise me"
        }
    },
    {
        "prompt": "How much do you want to be *playful* vs *tender* tonight?",
        "scale": {
            "low": "Tender, soft, slow",
            "high": "Playful, silly, loud"
        }
    },
    {
        "prompt": "How much do you want tonight to be *just us* vs *with others*?",
        "scale": {
            "low": "Just us, no one else",
            "high": "Everyone we love, together"
        }
    }
],
  "tempo-tap": [
    {
        "prompt": "Follow this pulse for five unhurried taps.",
        "round": "Evening porch"
    },
    {
        "prompt": "Follow this pulse for five unhurried taps.",
        "round": "Morning coffee"
    },
    {
        "prompt": "Follow this pulse for five unhurried taps.",
        "round": "Rain on a window"
    },
    {
        "prompt": "Find the calm beat and keep it steady for five taps.",
        "round": "Quiet kitchen"
    },
    {
        "prompt": "Hold a slow, close rhythm for five taps.",
        "round": "Goodnight breath"
    },
    {
        "prompt": "Catch the quick pulse without rushing it.",
        "round": "Happy surprise"
    }
],
  "word-weaver": [
    {
        "prompt": "Weave as many words as you can from the same six letters.",
        "letters": "TOGETHER",
        "note": "(use 8 letters for a longer round)"
    },
    {
        "prompt": "Turn this shared tray into a tiny love-letter dictionary.",
        "letters": "TENDER",
        "note": ""
    },
    {
        "prompt": "Find the words tucked inside HOLDING.",
        "letters": "HOLDING",
        "note": ""
    },
    {
        "prompt": "Grow a few words from this little SUNDAY.",
        "letters": "SUNDAY",
        "note": ""
    }
],
  "dual-axis-maze": [
    {
        "prompt": "Guide the tiny boat from the dock to the lighthouse without hitting the rocks.",
        "round": "Harbor light"
    },
    {
        "prompt": "Pass the warm cookie from the kitchen to the couch without dropping it.",
        "round": "Cookie run"
    },
    {
        "prompt": "Guide the sleepy cat from the window to the blanket without waking it.",
        "round": "Sleepy cat"
    },
    {
        "prompt": "Carry the lantern from the garden to the front door through the dark.",
        "round": "Lantern walk"
    }
],
  "blind-canvas": [
    {
        "prompt": "Our dream farmers market stall"
    },
    {
        "prompt": "A library built for two (with a secret room)"
    },
    {
        "prompt": "A tiny hotel for tired travelers (run by us)"
    },
    {
        "prompt": "A garden where our memories grow as plants"
    },
    {
        "prompt": "A cozy train carriage for a long, slow journey"
    },
    {
        "prompt": "A bakery that only sells one perfect thing"
    },
    {
        "prompt": "A treehouse for rainy days"
    },
    {
        "prompt": "A tiny observatory for stargazing together"
    },
    {
        "prompt": "A kitchen where we cook every meal together"
    },
    {
        "prompt": "A map of a place we haven't been yet but will love"
    }
],
  "harmonic-lock": [
    {
        "prompt": "Let the glow guide you toward a steady shared resonance.",
        "round": "Morning light"
    },
    {
        "prompt": "Let the glow guide you toward a steady shared resonance.",
        "round": "Rainy window"
    },
    {
        "prompt": "Find the frequency where the two rings feel calmest.",
        "round": "Warm kitchen"
    },
    {
        "prompt": "Settle into the softest shared hum.",
        "round": "Sleepy hum"
    },
    {
        "prompt": "Let the glow guide you toward a steady shared resonance.",
        "round": "Garden evening"
    },
    {
        "prompt": "Tune toward the point where the glass seems to glow.",
        "round": "First snow"
    }
],
  "bluff-bidding": [
    {
        "prompt": "Things we would put in a blanket fort for a perfect night"
    },
    {
        "prompt": "Songs that make us both sing along (even badly)"
    },
    {
        "prompt": "Tiny things that make our home feel like ours"
    },
    {
        "prompt": "Ways we make each other laugh"
    },
    {
        "prompt": "Foods we would eat on a perfect, no-rules day"
    },
    {
        "prompt": "Places in our town we love (or want to love)"
    },
    {
        "prompt": "Things we would bring to a picnic on the moon"
    },
    {
        "prompt": "Reasons we are a good team"
    },
    {
        "prompt": "Memories we both remember differently (and both love)"
    },
    {
        "prompt": "Things we would put in a time capsule for future-us"
    }
],
  "photo-flashback": [
    {
        "prompt": "Choose a photo where you're both laughing. What were you laughing *at*?"
    },
    {
        "prompt": "Choose a photo from a day that started badly and ended well. What changed?"
    },
    {
        "prompt": "Choose a photo that feels like “us” in one image. Why?"
    },
    {
        "prompt": "Choose a photo you took *of* your partner when they weren't looking. What did you see?"
    },
    {
        "prompt": "Choose a photo of a place that feels like home, even if it's not home."
    },
    {
        "prompt": "Choose a photo and write the caption your *future* selves would write."
    },
    {
        "prompt": "Choose a photo that would make a stranger say, “Tell me about these two.”"
    },
    {
        "prompt": "Choose a photo from a moment you *almost* didn't photograph. Why are you glad you did?"
    },
    {
        "prompt": "Choose a photo and invent the *sound* that was happening just outside the frame."
    },
    {
        "prompt": "Choose a photo from this week. Caption it with one thing you want to remember."
    }
],
  "wavelength": [
    {
        "prompt": "A perfect rainy day together would include…",
        "choices": [
            "A film and a blanket",
            "Cooking something warm",
            "A walk in the rain",
            "A museum or bookshop"
        ]
    },
    {
        "prompt": "The best way to start a weekend together is…",
        "choices": [
            "Sleep in",
            "A big breakfast",
            "A walk",
            "A plan for one fun thing"
        ]
    },
    {
        "prompt": "When I need cheering up, I most want…",
        "choices": [
            "A funny story",
            "A hug",
            "A favorite snack",
            "A distraction"
        ]
    },
    {
        "prompt": "A small adventure we could take *this* week is…",
        "choices": [
            "A new café",
            "A different walk",
            "A local event",
            "A drive with no destination"
        ]
    },
    {
        "prompt": "The most romantic thing about an ordinary day is…",
        "choices": [
            "Morning coffee",
            "A shared laugh",
            "A quiet moment",
            "Falling asleep together"
        ]
    },
    {
        "prompt": "If we had a secret code, it would be for…",
        "choices": [
            "“I love you”",
            "“I need help”",
            "“Let's go home”",
            "“I miss you”"
        ]
    },
    {
        "prompt": "The best gift for a tired partner is…",
        "choices": [
            "A meal",
            "A quiet evening",
            "Help with a task",
            "A long hug"
        ]
    },
    {
        "prompt": "Our ideal holiday together would be…",
        "choices": [
            "A cozy cabin",
            "A city food tour",
            "A beach with nothing planned",
            "A road trip"
        ]
    },
    {
        "prompt": "When we disagree, I most want us to…",
        "choices": [
            "Take a breath",
            "Listen first",
            "Find a compromise",
            "Come back to it later"
        ]
    },
    {
        "prompt": "A tradition I would love to keep is…",
        "choices": [
            "A weekly date",
            "A morning ritual",
            "A yearly trip",
            "A tiny daily check-in"
        ]
    },
    {
        "prompt": "The best way to say “I'm thinking of you” is…",
        "choices": [
            "A text",
            "A note",
            "A small surprise",
            "A hug when we meet"
        ]
    },
    {
        "prompt": "If we could learn one thing together, it would be…",
        "choices": [
            "A language",
            "A recipe",
            "A dance",
            "A craft"
        ]
    },
    {
        "prompt": "The most comforting sound in our home is…",
        "choices": [
            "Laughter",
            "Music",
            "Quiet",
            "Rain on the window"
        ]
    },
    {
        "prompt": "A perfect evening with friends would be…",
        "choices": [
            "Dinner together",
            "A game night",
            "A walk",
            "A cozy night in"
        ]
    },
    {
        "prompt": "When I feel proud, I want you to…",
        "choices": [
            "Celebrate with me",
            "Say you're proud",
            "Hug me",
            "Ask me to tell you everything"
        ]
    },
    {
        "prompt": "The best way to end a day together is…",
        "choices": [
            "Talk about the day",
            "Watch something together",
            "Be quiet together",
            "Plan tomorrow"
        ]
    },
    {
        "prompt": "If we had a garden, we'd grow…",
        "choices": [
            "Flowers",
            "Vegetables",
            "Herbs",
            "Something wild"
        ]
    },
    {
        "prompt": "A small thing that makes me feel loved is…",
        "choices": [
            "You remembering a detail",
            "You making me laugh",
            "You helping without being asked",
            "You being near"
        ]
    },
    {
        "prompt": "Our next chapter should include more of…",
        "choices": [
            "Adventure",
            "Quiet",
            "Laughter",
            "Togetherness"
        ]
    },
    {
        "prompt": "The best way to apologize is…",
        "choices": [
            "Say it plainly",
            "Show it with actions",
            "Write it",
            "Hug and say it"
        ]
    },
    {
        "prompt": "If we could have one more hour today, we'd spend it…",
        "choices": [
            "Outside",
            "Eating together",
            "Talking",
            "Doing nothing together"
        ]
    },
    {
        "prompt": "The most important thing in our home is…",
        "choices": [
            "Comfort",
            "Laughter",
            "Peace",
            "Togetherness"
        ]
    },
    {
        "prompt": "A memory I want us to make this year is…",
        "choices": [
            "A trip",
            "A celebration",
            "An ordinary perfect day",
            "A new tradition"
        ]
    },
    {
        "prompt": "The thing I most want us to keep is…",
        "choices": [
            "Our humor",
            "Our kindness",
            "Our curiosity",
            "Our closeness"
        ]
    }
],
  "letterpress": [
    {
        "prompt": "A quiet evening together feels best when…"
    },
    {
        "prompt": "The next small adventure we should take is…"
    },
    {
        "prompt": "A memory I want to keep from this week…"
    },
    {
        "prompt": "Our home feels most like ours when…"
    },
    {
        "prompt": "A tiny kindness I want to offer this week…"
    },
    {
        "prompt": "The best way to say “I'm here” without words…"
    },
    {
        "prompt": "A place we should visit together someday…"
    },
    {
        "prompt": "One thing we should celebrate, even if it's small…"
    },
    {
        "prompt": "A tradition we could start tonight…"
    },
    {
        "prompt": "The sound of our home on a good day…"
    },
    {
        "prompt": "A future version of us I can't wait to meet…"
    },
    {
        "prompt": "The next chapter should start with…"
    }
],
  "gratitude-duel": [
    {
        "prompt": "A way you made a hard day a little softer"
    },
    {
        "prompt": "Something you did that I didn't thank you for at the time"
    },
    {
        "prompt": "A way you make our home feel like *ours*"
    },
    {
        "prompt": "A moment when you made me feel brave"
    },
    {
        "prompt": "A small thing you do that makes me feel chosen"
    },
    {
        "prompt": "A way you show up for me when I'm not at my best"
    },
    {
        "prompt": "Something about how you love that I want to keep learning from"
    },
    {
        "prompt": "A time you made an ordinary day feel special without trying"
    },
    {
        "prompt": "A way you help me feel like myself"
    },
    {
        "prompt": "A kindness you gave to someone else that made me proud of you"
    },
    {
        "prompt": "A detail you remembered that told me you were listening"
    },
    {
        "prompt": "A way you make it easier to be honest with you"
    }
],
  "say-it-without-saying": [
    {
        "prompt": "Making a tiny snowman together"
    },
    {
        "prompt": "Trying to take a perfect selfie and failing"
    },
    {
        "prompt": "Sharing headphones on a long walk"
    },
    {
        "prompt": "Waiting for a late-night snack to finish cooking"
    },
    {
        "prompt": "Finding a four-leaf clover together"
    },
    {
        "prompt": "Dancing in the kitchen while dinner burns (just a little)"
    },
    {
        "prompt": "Reading the same book in different chairs"
    },
    {
        "prompt": "Picking the perfect pumpkin at a patch"
    },
    {
        "prompt": "Trying to fold a fitted sheet together"
    },
    {
        "prompt": "Watching the sunrise after staying up too late"
    },
    {
        "prompt": "Building a pillow fort for two (and a cat)"
    },
    {
        "prompt": "Saying goodbye at an airport and missing each other already"
    }
],
  "love-in-the-blanks": [
    {
        "title": "The tiny adventure",
        "template": "We meant to go to [place], but we ended up at [place]. We brought [food], met a [adjective] [noun], and [verb] until [weather] made us [verb2] home with [plural noun] in our pockets."
    },
    {
        "title": "The cozy mystery",
        "template": "In [place], we found a [adjective] [noun] that [verb] every time we [verb2]. We shared [food], waited through [weather], and discovered it was really [plural noun] all along."
    },
    {
        "title": "The future letter",
        "template": "Dear future-us in [place], remember when we [verb] with [adjective] [noun]? We [verb2], ate [food], and promised to keep [plural noun] even when [weather] changed everything."
    },
    {
        "title": "The ordinary magic",
        "template": "On a very ordinary day in [place], a [adjective] [noun] [verb] past us. We [verb2], shared [food], and decided that [plural noun] under [weather] skies was magic enough."
    }
],
  "star-map": [
    {
        "value": "Curiosity"
    },
    {
        "value": "Playfulness"
    },
    {
        "value": "Honesty"
    },
    {
        "value": "Comfort"
    },
    {
        "value": "Togetherness"
    },
    {
        "value": "Kindness"
    }
],
  "portrait-panic": [
    {
        "cue": "Add a hat"
    },
    {
        "cue": "Make it silly"
    },
    {
        "cue": "Add a pet"
    },
    {
        "cue": "Draw us together"
    },
    {
        "cue": "Add a background"
    },
    {
        "cue": "Make it tiny"
    },
    {
        "cue": "Add a speech bubble"
    },
    {
        "cue": "Keep the eyes"
    }
],
  "our-next-line": [
    {
        "kind": "story",
        "seed": "The last train left without us, so we…"
    },
    {
        "kind": "song",
        "seed": "If our evening had a bridge, it would say…"
    },
    {
        "kind": "story",
        "seed": "We found a note in a book we thought we'd finished…"
    },
    {
        "kind": "song",
        "seed": "The chorus we hum when no one is listening goes…"
    }
],
};


export function getBankExpansion(bankId) {
  return EXPANDED_BANKS[bankId] ?? [];
}
export function mergeBank(baseEntries, bankId) {
  const expansion = getBankExpansion(bankId);
  const seen = new Set(baseEntries.map((e) => JSON.stringify(e)));
  const fresh = expansion.filter((e) => !seen.has(JSON.stringify(e)));
  return [...baseEntries, ...fresh];
}
export function getBankMeta(bankId) { return BANK_META[bankId] ?? null; }
export const EXPANDED_BANK_TOTAL = Object.values(EXPANDED_BANKS).reduce((n, arr) => n + arr.length, 0);
