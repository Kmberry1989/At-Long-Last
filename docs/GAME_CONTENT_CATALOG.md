# At Long Last — Game Content Catalog

Generated from the current game data on 2026-11-01.

This is the complete catalog of authored, data-driven game content and player-facing choice pools: prompts, drawing ideas, Pinky Swear promises, activities, duels, board themes, keepsakes, progression rewards, and visual selections. It includes the stable IDs and the stored copy/options so each entry can be traced back to its source.

It does not list transient runtime variables (such as a player’s current position), account data, or freeform answers entered by players. Those values are created or supplied while the game runs and are not a finite authored catalog.

Regenerate after changing these data tables with `node scripts/generate-game-content-catalog.mjs`.

## Contents
1. [Activities and duels](#activities-and-duels)
2. [Night questions and vault prompts](#night-questions-and-vault-prompts)
3. [Connection games](#connection-games)
4. [Sealed activities](#sealed-activities)
5. [Wave two prompts and puzzles](#wave-two-prompts-and-puzzles)
6. [Wave three prompts and layouts](#wave-three-prompts-and-layouts)
7. [Wave four prompts](#wave-four-prompts)
8. [Expanded and themed prompt pools](#expanded-and-themed-prompt-pools)
9. [Authored activity prompt variations](#authored-activity-prompt-variations)
10. [Original and expanded activity prompts](#original-and-expanded-activity-prompts)
11. [Wavelength duel](#wavelength-duel)
12. [Board spaces and keepsakes](#board-spaces-and-keepsakes)
13. [Night setup and vibe choices](#night-setup-and-vibe-choices)
14. [Board themes and scene decorations](#board-themes-and-scene-decorations)
15. [Player pieces and visual styles](#player-pieces-and-visual-styles)
16. [Portrait frames](#portrait-frames)
17. [Pinky Swear promise draw deck and progression](#pinky-swear-promise-draw-deck-and-progression)
18. [Our Bloom flower collection](#our-bloom-flower-collection)

## Activities and duels

Source: `src/features/session/contentPackData.js`.

### `activityDefinitions` (76 entries)

```json
[
  {
    "id": "comfort-menu",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 1,
    "title": "Comfort Menu",
    "prompt": "When I'm overwhelmed, what actually helps is...",
    "description": "Build your personal comfort cheat sheet for each other.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "support",
      "needs",
      "cozy"
    ],
    "label": "Comfort Menu"
  },
  {
    "id": "small-mercies",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 1,
    "title": "Small Mercies",
    "prompt": "Name one tiny thing I did this week you appreciated that I probably thought you did not notice.",
    "description": "Catch the invisible kindness.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "gratitude",
      "noticing"
    ],
    "label": "Small Mercies"
  },
  {
    "id": "weather-report",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 1,
    "title": "Weather Report",
    "prompt": "My internal weather today is sunny, foggy, stormy, or clear because...",
    "description": "No fixing, just reporting.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "check-in",
      "emotional"
    ],
    "label": "Weather Report"
  },
  {
    "id": "receipts",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 1,
    "title": "Receipts",
    "prompt": "Find the oldest photo of us on your phone. What do you remember about that day that the photo does not show?",
    "description": "Race to find it, then story swap.",
    "durationSec": 120,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "memory",
      "photo"
    ],
    "label": "Receipts"
  },
  {
    "id": "future-artifact",
    "vibe": "tender",
    "type": "journal",
    "intensity": 2,
    "title": "Future Artifact",
    "prompt": "If someone found a box of our stuff 50 years from now, what 3 things should be in it?",
    "description": "Build your legacy box.",
    "durationSec": 120,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "future",
      "legacy"
    ],
    "label": "Future Artifact"
  },
  {
    "id": "postcard-next-year",
    "vibe": "tender",
    "type": "journal",
    "intensity": 2,
    "title": "Postcard From Next Year",
    "prompt": "Write a 2-sentence note your future selves will open in 12 months. Start with \"Remember when we...\"",
    "description": "Saves to journalEntries with open date +12 months.",
    "durationSec": 120,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "future",
      "time-capsule"
    ],
    "label": "Postcard From Next Year"
  },
  {
    "id": "translation",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 1,
    "title": "Translation",
    "prompt": "How I say I love you without saying it is...",
    "description": "Decode your love language actions.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "love-language"
    ],
    "label": "Translation"
  },
  {
    "id": "map-pin-wish",
    "vibe": "tender",
    "type": "ritual",
    "intensity": 1,
    "title": "Map Pin",
    "prompt": "Drop a pin where you wish you were together right now. The other guesses why.",
    "description": "Uses map placeholder or text description.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "longing",
      "future-date"
    ],
    "label": "Map Pin"
  },
  {
    "id": "director-commentary",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 1,
    "title": "Director's Commentary",
    "prompt": "Describe the day we met like it is a movie trailer.",
    "description": "Dramatic retelling.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "story",
      "origin"
    ],
    "label": "Director's Commentary"
  },
  {
    "id": "house-rules",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 1,
    "title": "House Rules",
    "prompt": "Invent one ridiculous rule for our future house together.",
    "description": "World building for two.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "future",
      "playful-tender"
    ],
    "label": "House Rules"
  },
  {
    "id": "growth-ring",
    "vibe": "tender",
    "type": "journal",
    "intensity": 2,
    "title": "Growth Ring",
    "prompt": "What is something hard from 6 months ago that feels lighter now because we handled it together?",
    "description": "Notice growth.",
    "durationSec": 120,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "growth",
      "resilience"
    ],
    "label": "Growth Ring"
  },
  {
    "id": "anchor-memory",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 2,
    "title": "Anchor Memory",
    "prompt": "What is a memory of us you go to when you need to feel grounded?",
    "description": "Share your anchor.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "memory",
      "grounding"
    ],
    "label": "Anchor Memory"
  },
  {
    "id": "unsent-draft",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 2,
    "title": "Unsent Draft",
    "prompt": "What text did you almost send me this week and delete?",
    "description": "Say the quiet part.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "vulnerability"
    ],
    "label": "Unsent Draft"
  },
  {
    "id": "gratitude-snapshot",
    "vibe": "tender",
    "type": "ritual",
    "intensity": 1,
    "title": "Gratitude Snapshot",
    "prompt": "Both take a photo of your current view and caption it \"this is where I love you from today\".",
    "description": "Async photo ritual.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "photo",
      "gratitude"
    ],
    "label": "Gratitude Snapshot"
  },
  {
    "id": "shared-seed",
    "vibe": "tender",
    "type": "ritual",
    "intensity": 1,
    "title": "Shared Seed",
    "prompt": "A plant on the board grows only if you both water it today. Water it?",
    "description": "Daily co-care ritual. No death, just droop.",
    "durationSec": 30,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "daily",
      "co-care"
    ],
    "label": "Shared Seed"
  },
  {
    "id": "cursed-date-12",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Cursed Date",
    "prompt": "You have $12 and a gas station. Plan our best date possible.",
    "description": "Forced creativity.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "funny",
      "creativity"
    ],
    "label": "Cursed Date"
  },
  {
    "id": "yelp-review",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Yelp Review",
    "prompt": "Write a 5-star Yelp review for your partner as if they are a restaurant.",
    "description": "Overly specific praise.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "funny",
      "compliment"
    ],
    "label": "Yelp Review"
  },
  {
    "id": "build-a-cult",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Build-A-Cult",
    "prompt": "Invent a cult based on our weirdest shared habit. What is the uniform? The motto?",
    "description": "Lore building.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "lore",
      "funny"
    ],
    "label": "Build-A-Cult"
  },
  {
    "id": "lore-drop",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Lore Drop",
    "prompt": "What is the official origin story of our dumbest inside joke? Make it epic.",
    "description": "Canonize the joke.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "inside-joke",
      "story"
    ],
    "label": "Lore Drop"
  },
  {
    "id": "two-truths-one-dream",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Two Truths and a Dream",
    "prompt": "Two true memories, one dream memory you wish we had. Partner guesses the dream.",
    "description": "Twist on classic game.",
    "durationSec": 120,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "game",
      "memory"
    ],
    "label": "Two Truths and a Dream"
  },
  {
    "id": "alternate-job",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Alternate Universe Job",
    "prompt": "In another life, I think you would be an amazing... because...",
    "description": "See them differently.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "imagination"
    ],
    "label": "Alternate Universe Job"
  },
  {
    "id": "apocalypse-role",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Apocalypse Role",
    "prompt": "Zombie apocalypse. What is my job in our duo and what is yours? No, you cannot both be the chef.",
    "description": "Assign survival roles.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "funny",
      "role"
    ],
    "label": "Apocalypse Role"
  },
  {
    "id": "pet-peeve-love-letter",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 2,
    "title": "Pet Peeve Love Letter",
    "prompt": "Write a love letter to my most annoying cute habit.",
    "description": "Roast with love.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "roast",
      "affection"
    ],
    "label": "Pet Peeve Love Letter"
  },
  {
    "id": "conspiracy-us",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Conspiracy: Us",
    "prompt": "What is our wildest conspiracy theory that is actually true? Like \"we were meant to meet because...\"",
    "description": "Romantic conspiracies.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "romantic-funny"
    ],
    "label": "Conspiracy: Us"
  },
  {
    "id": "wikipedia-us",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Wikipedia: Us",
    "prompt": "Write the intro paragraph to our Wikipedia page.",
    "description": "Legacy but funny.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "legacy",
      "funny"
    ],
    "label": "Wikipedia: Us"
  },
  {
    "id": "theme-song",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Theme Song",
    "prompt": "What is our current theme song? Not our song, our sitcom theme song this week.",
    "description": "Quick music share.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "music"
    ],
    "label": "Theme Song"
  },
  {
    "id": "bad-advice",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Bad Advice",
    "prompt": "Give me terrible advice for a problem I have this week. The worse the better.",
    "description": "Reverse support.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "funny",
      "support"
    ],
    "label": "Bad Advice"
  },
  {
    "id": "villain-origin",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Villain Origin",
    "prompt": "What mundane event would turn me into a supervillain? Narrate my origin.",
    "description": "Dramatic backstory.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "funny",
      "story"
    ],
    "label": "Villain Origin"
  },
  {
    "id": "nudge-wars",
    "vibe": "playful",
    "type": "ritual",
    "intensity": 1,
    "title": "Nudge Wars",
    "prompt": "Leave a surprise on their board: rubber duck, disco ball, cactus, or love note?",
    "description": "Async board decoration ritual.",
    "durationSec": 20,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "ritual",
      "async"
    ],
    "label": "Nudge Wars"
  },
  {
    "id": "sound-capsule",
    "vibe": "playful",
    "type": "ritual",
    "intensity": 1,
    "title": "Sound Capsule",
    "prompt": "Leave a 7-second sound on this tile for your partner to find on their next roll.",
    "description": "Voice, laugh, weird noise.",
    "durationSec": 30,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "audio",
      "async"
    ],
    "label": "Sound Capsule"
  },
  {
    "id": "replay-favorite-kiss",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 1,
    "title": "Replay",
    "prompt": "My favorite kiss was not the most romantic one, it was the one when...",
    "description": "Memory that is intimate without being explicit.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "romantic",
      "memory"
    ],
    "label": "Replay"
  },
  {
    "id": "wanted-list",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 1,
    "title": "Wanted List",
    "prompt": "One non-physical thing you do that instantly makes me feel wanted is...",
    "description": "Focus on emotional desire.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "desire",
      "emotional"
    ],
    "label": "Wanted List"
  },
  {
    "id": "slow-morning",
    "vibe": "spicy",
    "type": "journal",
    "intensity": 2,
    "title": "Slow Morning",
    "prompt": "Describe our ideal slow morning together, hour by hour, from waking up to getting coffee.",
    "description": "Cozy intimacy visualization.",
    "durationSec": 120,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "intimacy",
      "future"
    ],
    "label": "Slow Morning"
  },
  {
    "id": "confidence-fit",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 1,
    "title": "Confidence Fit",
    "prompt": "What is an outfit you wear that makes YOU feel amazing? Describe it so I can picture you.",
    "description": "Celebrate confidence.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "confidence",
      "flirty"
    ],
    "label": "Confidence Fit"
  },
  {
    "id": "whisper-line",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 2,
    "title": "Whisper Line",
    "prompt": "If you could teleport next to me for 10 seconds right now, what would you whisper?",
    "description": "Short and sweet.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "flirty",
      "longing"
    ],
    "label": "Whisper Line"
  },
  {
    "id": "scent-memory",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 1,
    "title": "Scent Memory",
    "prompt": "What scent instantly reminds you of me or us?",
    "description": "Sensory memory.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "sensory",
      "memory"
    ],
    "label": "Scent Memory"
  },
  {
    "id": "favorite-way-held",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 2,
    "title": "How I Like To Be Held",
    "prompt": "My favorite way to be held when I am tired vs when I am happy is...",
    "description": "Non-explicit touch preferences.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "touch",
      "comfort"
    ],
    "label": "How I Like To Be Held"
  },
  {
    "id": "look-you-love",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 1,
    "title": "That Look",
    "prompt": "Describe a look on my face that you love and when you usually see it.",
    "description": "Noticing details.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "noticing",
      "romantic"
    ],
    "label": "That Look"
  },
  {
    "id": "flirt-resume",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 2,
    "title": "Flirt Resume",
    "prompt": "What is your go-to move when you are trying to make me blush? Is it working right now?",
    "description": "Playful self-awareness.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "flirty",
      "playful-spicy"
    ],
    "label": "Flirt Resume"
  },
  {
    "id": "what-miss-today",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 2,
    "title": "What I Miss Today",
    "prompt": "The specific thing I miss about being next to you today is...",
    "description": "Daily longing prompt.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "longing",
      "daily"
    ],
    "label": "What I Miss Today"
  },
  {
    "id": "date-that-never-ends",
    "vibe": "spicy",
    "type": "journal",
    "intensity": 2,
    "title": "Date That Never Ends",
    "prompt": "Design a date that has no end time, no phones, no plans. Where does it start?",
    "description": "Fantasy date building.",
    "durationSec": 120,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "fantasy-date"
    ],
    "label": "Date That Never Ends"
  },
  {
    "id": "secret-admiration",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 1,
    "title": "Secret Admiration",
    "prompt": "Something I find attractive about you that I have never said out loud is...",
    "description": "Low-pressure compliment.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "admiration"
    ],
    "label": "Secret Admiration"
  },
  {
    "id": "after-hours-tile",
    "vibe": "spicy",
    "type": "ritual",
    "intensity": 2,
    "title": "After Hours",
    "prompt": "This tile only glows after 9pm for both of you. Leave a photo of your eyes, your smile, or your hand right now.",
    "description": "Time-gated intimacy ritual.",
    "durationSec": 30,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "ritual",
      "time-gated",
      "photo"
    ],
    "label": "After Hours"
  },
  {
    "id": "landing-lights",
    "vibe": "spicy",
    "type": "ritual",
    "intensity": 1,
    "title": "Landing Lights",
    "prompt": "End-of-day ritual: land on the home tile together. 3 nights in a row unlocks a love note.",
    "description": "Co-sleep ritual for remote couples.",
    "durationSec": 20,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "ritual",
      "nightly"
    ],
    "label": "Landing Lights"
  },
  {
    "id": "rewind-touch",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 2,
    "title": "Rewind",
    "prompt": "What is a tiny, non-sexual touch from us that lives rent-free in your head? Forehead kiss, hand squeeze, etc.",
    "description": "Celebrate small touch.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "touch",
      "memory"
    ],
    "label": "Rewind"
  },
  {
    "id": "rose-thorn-seed",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 1,
    "title": "Rose, Thorn, Seed",
    "prompt": "Share one bright spot, one hard spot, and one small thing you hope grows before we play again.",
    "description": "A compact check-in with somewhere hopeful to land.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "check-in",
      "hope",
      "growth"
    ],
    "label": "Rose, Thorn, Seed"
  },
  {
    "id": "ordinary-treasure",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 1,
    "title": "Ordinary Treasure",
    "prompt": "Which completely ordinary moment with us would you freeze and keep exactly as it was?",
    "description": "Notice the quiet moments that became important.",
    "durationSec": 75,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "memory",
      "noticing",
      "everyday"
    ],
    "label": "Ordinary Treasure"
  },
  {
    "id": "invisible-backpack",
    "vibe": "tender",
    "type": "prompt",
    "intensity": 2,
    "title": "Invisible Backpack",
    "prompt": "What have you been carrying quietly lately, and what would make it feel one notch lighter?",
    "description": "Offer context and one practical form of care without trying to fix everything.",
    "durationSec": 120,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "support",
      "needs",
      "vulnerability"
    ],
    "label": "Invisible Backpack"
  },
  {
    "id": "gentle-signal",
    "vibe": "tender",
    "type": "ritual",
    "intensity": 1,
    "title": "Gentle Signal",
    "prompt": "Invent a tiny phrase or gesture that means \"I want to reconnect, but I do not have the perfect words yet.\"",
    "description": "Create a low-pressure repair signal for future moments.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "repair",
      "communication",
      "ritual"
    ],
    "label": "Gentle Signal"
  },
  {
    "id": "five-minute-tradition",
    "vibe": "tender",
    "type": "ritual",
    "intensity": 1,
    "title": "Five-Minute Tradition",
    "prompt": "Design a five-minute tradition we could actually repeat this week. Give it a name and one simple rule.",
    "description": "Turn affection into a tiny repeatable ritual.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "tradition",
      "co-care",
      "future"
    ],
    "label": "Five-Minute Tradition"
  },
  {
    "id": "museum-of-us",
    "vibe": "tender",
    "type": "journal",
    "intensity": 2,
    "title": "Museum of Us",
    "prompt": "Choose one everyday object from our relationship and write its museum label: title, year, and why it mattered.",
    "description": "Give an ordinary artifact the importance it deserves.",
    "durationSec": 120,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "artifact",
      "memory",
      "story"
    ],
    "label": "Museum of Us"
  },
  {
    "id": "wrong-answers-only",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Wrong Answers Only",
    "prompt": "Why are we obviously the most suspicious couple in town? Give the least believable explanation possible.",
    "description": "Build a ridiculous shared alibi.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "improv",
      "funny",
      "story"
    ],
    "label": "Wrong Answers Only"
  },
  {
    "id": "couple-mascot",
    "vibe": "playful",
    "type": "journal",
    "intensity": 1,
    "title": "Couple Mascot",
    "prompt": "Invent our official mascot. What creature is it, what is it wearing, and what chaotic advice does it give us?",
    "description": "Create a recurring character for your shared lore.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "lore",
      "character",
      "creativity"
    ],
    "label": "Couple Mascot"
  },
  {
    "id": "tiny-shark-tank",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Tiny Shark Tank",
    "prompt": "Pitch one unnecessary invention that would improve our relationship by exactly 3%. Name it and sell it.",
    "description": "Make a one-minute pitch for a gloriously minor solution.",
    "durationSec": 75,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "improv",
      "invention",
      "funny"
    ],
    "label": "Tiny Shark Tank"
  },
  {
    "id": "plot-twist",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Plot Twist",
    "prompt": "Retell one real memory of us, but add one dramatic plot twist. Your partner has to identify the fake detail.",
    "description": "Turn shared history into a guessing game.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "game",
      "memory",
      "guessing"
    ],
    "label": "Plot Twist"
  },
  {
    "id": "soundtrack-shuffle",
    "vibe": "playful",
    "type": "ritual",
    "intensity": 1,
    "title": "Soundtrack Shuffle",
    "prompt": "Choose three songs: our opening credits, tonight's montage, and the song playing over the bloopers.",
    "description": "Build a tiny soundtrack for this chapter.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "music",
      "ritual",
      "story"
    ],
    "label": "Soundtrack Shuffle"
  },
  {
    "id": "emoji-forecast",
    "vibe": "playful",
    "type": "prompt",
    "intensity": 1,
    "title": "Emoji Forecast",
    "prompt": "Describe our next week using exactly five emoji, then explain the weirdest one.",
    "description": "Make a tiny prediction and compare interpretations.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "emoji",
      "future",
      "quick"
    ],
    "label": "Emoji Forecast"
  },
  {
    "id": "closer-than-words",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 1,
    "title": "Closer Than Words",
    "prompt": "What small thing makes you feel instantly closer to me: a look, a phrase, a touch, or something else?",
    "description": "Name an easy invitation to closeness.",
    "durationSec": 75,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "closeness",
      "noticing",
      "affection"
    ],
    "label": "Closer Than Words"
  },
  {
    "id": "date-trailer",
    "vibe": "spicy",
    "type": "journal",
    "intensity": 2,
    "title": "Date Trailer",
    "prompt": "Write the voice-over for a 20-second trailer teasing our next ideal date without revealing the ending.",
    "description": "Build anticipation with a cinematic invitation.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "date",
      "anticipation",
      "story"
    ],
    "label": "Date Trailer"
  },
  {
    "id": "favorite-detail",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 1,
    "title": "Favorite Detail",
    "prompt": "Name one tiny detail about me you could recognize anywhere, and tell me why you notice it.",
    "description": "Trade specific, grounded admiration.",
    "durationSec": 75,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "admiration",
      "noticing",
      "romantic"
    ],
    "label": "Favorite Detail"
  },
  {
    "id": "green-light-tonight",
    "vibe": "spicy",
    "type": "ritual",
    "intensity": 2,
    "title": "Green Light Tonight",
    "prompt": "What kind of affection would feel especially welcome tonight? Offer one option, and \"not tonight\" is always a complete answer.",
    "description": "Make room for a clear, low-pressure invitation and an equally easy pass.",
    "durationSec": 90,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "consent",
      "affection",
      "communication"
    ],
    "label": "Green Light Tonight"
  },
  {
    "id": "chemistry-recipe",
    "vibe": "spicy",
    "type": "prompt",
    "intensity": 1,
    "title": "Chemistry Recipe",
    "prompt": "Our chemistry is two parts ___, one part ___, plus a dangerous amount of ___. Fill in the recipe.",
    "description": "Describe your spark without taking it too seriously.",
    "durationSec": 60,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "chemistry",
      "funny",
      "flirty"
    ],
    "label": "Chemistry Recipe"
  },
  {
    "id": "doorstep-scene",
    "vibe": "spicy",
    "type": "journal",
    "intensity": 2,
    "title": "Doorstep Scene",
    "prompt": "Imagine we have not seen each other for a month. Write the first three lines of the scene when the door finally opens.",
    "description": "Capture anticipation and reunion without scripting beyond your comfort.",
    "durationSec": 120,
    "skippable": true,
    "savesToJournal": true,
    "tags": [
      "reunion",
      "longing",
      "story"
    ],
    "label": "Doorstep Scene"
  },
  {
    "description": "Choose secretly, then reveal whether your instincts landed together.",
    "durationSec": 45,
    "id": "mind-meld",
    "intensity": 1,
    "label": "Mind Meld",
    "prompt": "Which movie trope feels most like the two of you lately?",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "match",
      "prediction",
      "featured"
    ],
    "title": "Mind Meld",
    "type": "match",
    "vibe": "playful"
  },
  {
    "description": "One player predicts the answer before the other chooses honestly.",
    "durationSec": 60,
    "id": "prediction-box",
    "intensity": 1,
    "label": "The Prediction Box",
    "prompt": "Which surprise date would your partner choose first?",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "prediction",
      "asymmetric",
      "featured"
    ],
    "title": "The Prediction Box",
    "type": "prediction",
    "vibe": "playful"
  },
  {
    "description": "Seal two private notes now and open them together at the finale.",
    "durationSec": 75,
    "id": "the-vault",
    "intensity": 2,
    "label": "The Vault",
    "prompt": "Seal one compliment you want your partner to discover at the finale.",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "time-capsule",
      "finale",
      "featured"
    ],
    "title": "The Vault",
    "type": "vault",
    "vibe": "tender"
  },
  {
    "description": "Place two secret markers on the same continuum and reveal the distance.",
    "durationSec": 50,
    "id": "vibe-check",
    "intensity": 1,
    "label": "Vibe Check",
    "prompt": "A perfect date needs…",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "slider",
      "sync",
      "featured"
    ],
    "title": "Vibe Check",
    "type": "vibe-sync",
    "vibe": "playful"
  },
  {
    "description": "Tap a five-beat pulse, then compare how steadily you both held the rhythm.",
    "durationSec": 45,
    "id": "tempo-tap",
    "intensity": 1,
    "label": "Tempo Tap",
    "prompt": "Follow this pulse for five unhurried taps.",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "rhythm",
      "timing",
      "featured"
    ],
    "title": "Tempo Tap",
    "type": "tempo",
    "vibe": "playful"
  },
  {
    "description": "Race the same letter tray and save the words only each of you found.",
    "durationSec": 75,
    "id": "word-weaver",
    "intensity": 1,
    "label": "Word Weaver",
    "prompt": "Weave as many words as you can from the same six letters.",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "word",
      "timed",
      "featured"
    ],
    "title": "Word Weaver",
    "type": "word",
    "vibe": "playful"
  },
  {
    "description": "One player moves sideways and the other moves vertically through a shared maze.",
    "durationSec": 90,
    "id": "dual-axis-maze",
    "intensity": 1,
    "label": "Dual-Axis Maze",
    "prompt": "Guide the pearl from the garden gate to the moonlit table.",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "cooperative",
      "maze",
      "communication",
      "featured"
    ],
    "title": "Dual-Axis Maze",
    "type": "maze",
    "vibe": "playful"
  },
  {
    "description": "Draw two unseen halves of one picture, then join them in the scrapbook.",
    "durationSec": 120,
    "id": "blind-canvas",
    "intensity": 1,
    "label": "Blind Canvas",
    "prompt": "Our dream breakfast café",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "cooperative",
      "drawing",
      "memory",
      "featured"
    ],
    "title": "Blind Canvas",
    "type": "canvas",
    "vibe": "playful"
  },
  {
    "description": "Follow the resonance separately and discover whether both dials found the lock.",
    "durationSec": 60,
    "id": "harmonic-lock",
    "intensity": 1,
    "label": "Harmonic Lock",
    "prompt": "Find the frequency where the two rings feel calmest.",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "cooperative",
      "slider",
      "haptic",
      "featured"
    ],
    "title": "Harmonic Lock",
    "type": "harmonic",
    "vibe": "tender"
  },
  {
    "description": "Raise the promise or call the bluff, then see whether the bidder can prove it.",
    "durationSec": 90,
    "id": "bluff-bidding",
    "intensity": 1,
    "label": "Bluff Bidding",
    "prompt": "Things we would pack for a picnic",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "head-to-head",
      "bidding",
      "word",
      "featured"
    ],
    "title": "Bluff Bidding",
    "type": "bluff",
    "vibe": "playful"
  },
  {
    "description": "Choose one shared photo and write two captions without seeing the first.",
    "durationSec": 120,
    "id": "photo-flashback",
    "intensity": 2,
    "label": "Photo Flashback",
    "prompt": "Choose a photo that makes you laugh. What happened just before it?",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "memory",
      "photo",
      "caption",
      "featured"
    ],
    "title": "Photo Flashback",
    "type": "photo",
    "vibe": "tender"
  },
  {
    "description": "Answer the same question separately — sealed. Then reveal together and call it: did your minds meld?",
    "id": "same-wavelength",
    "intensity": 2,
    "label": "Same Wavelength",
    "savesToJournal": true,
    "skippable": true,
    "type": "prediction",
    "vibe": "playful"
  },
  {
    "description": "A double-blind desire card. Both answer sealed — only a mutual yes ever sees the light.",
    "id": "mutual-yes",
    "intensity": 3,
    "label": "Mutual Yes",
    "savesToJournal": true,
    "skippable": true,
    "type": "mutual-yes",
    "vibe": "spicy"
  }
]
```

### `duelDefinitions` (16 entries)

```json
[
  {
    "id": "constellation-home",
    "vibe": "tender",
    "intensity": 1,
    "name": "Constellation",
    "tagline": "Where is home?",
    "durationSec": 60,
    "players": 2,
    "mechanics": "Both place 5 dots where home feels. Overlap creates a star.",
    "howToPlay": [
      "Blank sky appears",
      "Each taps 5 places that feel like home",
      "Reveal together, overlapping dots become bright stars",
      "Star stays on your board as permanent tile"
    ],
    "firebaseEvents": [
      "duel:dotPlaced",
      "duel:reveal"
    ],
    "boardReward": "New permanent star tile on board",
    "assetsNeeded": [
      "canvas",
      "particle:star"
    ],
    "skippable": true,
    "label": "Constellation",
    "prompt": "Blank sky appears"
  },
  {
    "id": "heartbeat-hold-tender",
    "vibe": "tender",
    "intensity": 1,
    "name": "Heartbeat Hold",
    "tagline": "Stay with me",
    "durationSec": 45,
    "players": 2,
    "mechanics": "Both hold button, board pulses. Release ends it. Sync bonus.",
    "howToPlay": [
      "Hold when ready",
      "Board pulses with combined rhythm",
      "Let go whenever you want, game ends when one lets go",
      "No winner, just how long you stayed"
    ],
    "firebaseEvents": [
      "duel:holdStart",
      "duel:holdEnd",
      "duel:pulse"
    ],
    "boardReward": "Both move forward 2 if you beat your record",
    "assetsNeeded": [
      "haptics",
      "pulse animation"
    ],
    "skippable": true,
    "label": "Heartbeat Hold",
    "prompt": "Hold when ready"
  },
  {
    "id": "letterpress-one-word",
    "vibe": "tender",
    "intensity": 2,
    "name": "Letterpress",
    "tagline": "One word at a time",
    "durationSec": 90,
    "players": 2,
    "mechanics": "Co-type one sentence alternating words. Cant see next word coming.",
    "howToPlay": [
      "Prompt: \"What I love about us is...\"",
      "Player A types word 1, Player B word 2, etc",
      "No deleting",
      "Read final sentence aloud"
    ],
    "firebaseEvents": [
      "duel:wordAdded",
      "duel:sentenceComplete"
    ],
    "boardReward": "Saves to journalEntries",
    "assetsNeeded": [
      "text input",
      "typewriter effect"
    ],
    "skippable": true,
    "label": "Letterpress",
    "prompt": "Prompt: \"What I love about us is...\""
  },
  {
    "id": "sync-breath",
    "vibe": "tender",
    "intensity": 1,
    "name": "Sync Breath",
    "tagline": "Breathe with me",
    "durationSec": 60,
    "players": 2,
    "mechanics": "Circle expands/contracts. Tap to inhale/exhale together.",
    "howToPlay": [
      "Circle grows = inhale",
      "Circle shrinks = exhale",
      "Try to stay in sync 4 breaths",
      "Board glows if synced"
    ],
    "firebaseEvents": [
      "duel:breathPhase"
    ],
    "boardReward": "Calm board effect for rest of session",
    "assetsNeeded": [
      "breathing circle animation"
    ],
    "skippable": true,
    "label": "Sync Breath",
    "prompt": "Circle grows = inhale"
  },
  {
    "id": "gratitude-duel",
    "vibe": "tender",
    "intensity": 1,
    "name": "Gratitude Duel",
    "tagline": "Thank you war",
    "durationSec": 60,
    "players": 2,
    "mechanics": "Rapid fire thank yous, cannot repeat.",
    "howToPlay": [
      "30 seconds each, alternating",
      "Thank your partner for something specific",
      "No repeats, no \"thanks for being you\" generic",
      "Most specific list wins but both save to journal"
    ],
    "firebaseEvents": [
      "duel:thanksAdded"
    ],
    "boardReward": "Both get 1 gratitude leaf on home tile",
    "assetsNeeded": [
      "timer",
      "list UI"
    ],
    "skippable": true,
    "label": "Gratitude Duel",
    "prompt": "30 seconds each, alternating"
  },
  {
    "id": "doodle-duel-memory",
    "vibe": "playful",
    "intensity": 1,
    "name": "Keepsake Sketch",
    "tagline": "Draw it bad",
    "durationSec": 60,
    "players": 2,
    "mechanics": "Same prompt, 60 sec draw, reveal simultaneously.",
    "howToPlay": [
      "Prompt appears: \"draw our couch from memory\"",
      "60 sec, thick brush, no eraser - more time to add details",
      "Auto-reveal at same time",
      "Vote: which is more accurate / more cursed"
    ],
    "firebaseEvents": [
      "duel:drawingStroke",
      "duel:drawingComplete",
      "duel:vote"
    ],
    "boardReward": "Winner moves 3, loser moves 2 but gets funny sticker",
    "assetsNeeded": [
      "drawing canvas",
      "brush"
    ],
    "skippable": true,
    "label": "Keepsake Sketch",
    "prompt": "Prompt appears: \"draw our couch from memory\""
  },
  {
    "id": "portrait-panic-directed",
    "vibe": "playful",
    "intensity": 2,
    "name": "Portrait Panic",
    "tagline": "You draw, I direct",
    "durationSec": 60,
    "players": 2,
    "mechanics": "Each player independently sends three visual cues, then draws their partner from the cues received. Either player can continue the night while waiting for the other cue set.",
    "howToPlay": [
      "Each player chooses three distinct cues: face left or right, draw larger or smaller, move closer, add one detail, keep it simple, or add a smile.",
      "Send cues; your partner can continue their own night while they wait.",
      "Draw your partner from the three cues they sent.",
      "Compare both portraits and the cues that guided them in the scrapbook."
    ],
    "firebaseEvents": [
      "duel:stroke",
      "duel:guideCues",
      "duel:drawingComplete"
    ],
    "boardReward": "Both portraits become board decorations",
    "assetsNeeded": ["drawing canvas"],
    "skippable": true,
    "label": "Portrait Panic",
    "prompt": "Player A draws Player B"
  },
  {
    "id": "wavelength-slider",
    "vibe": "playful",
    "intensity": 1,
    "name": "Wavelength",
    "tagline": "How well do you know my brain?",
    "durationSec": 60,
    "players": 2,
    "mechanics": "Hidden slider guess closeness game.",
    "howToPlay": [
      "Prompt: \"How chaotic was your day?\" or \"How much do you want pizza right now?\"",
      "Both place marker on slider secretly",
      "Reveal distance",
      "Closer = more points"
    ],
    "firebaseEvents": [
      "duel:sliderPlaced",
      "duel:reveal"
    ],
    "boardReward": "Perfect match = warp forward 4",
    "assetsNeeded": [
      "slider UI"
    ],
    "skippable": true,
    "label": "Wavelength",
    "prompt": "Prompt: \"How chaotic was your day?\" or \"How much do you want pizza right now?\""
  },
  {
    "id": "emoji-court",
    "vibe": "playful",
    "intensity": 1,
    "name": "Emoji Court",
    "tagline": "You are on trial",
    "durationSec": 90,
    "players": 2,
    "mechanics": "Silly trial, prosecution only emoji, defense only words.",
    "howToPlay": [
      "Accusation: \"You stole the blankets\"",
      "Player A prosecutes with 5 emoji only",
      "Player B defends in 10 words",
      "Judge (board) decides: guilty of being cute"
    ],
    "firebaseEvents": [
      "duel:emojiSet",
      "duel:defense"
    ],
    "boardReward": "Loser does a dare from winner",
    "assetsNeeded": [
      "emoji picker"
    ],
    "skippable": true,
    "label": "Emoji Court",
    "prompt": "Accusation: \"You stole the blankets\""
  },
  {
    "id": "reaction-heart",
    "vibe": "playful",
    "intensity": 1,
    "name": "Heartflash",
    "tagline": "One flash. One quick tap.",
    "durationSec": 30,
    "players": 2,
    "mechanics": "A heart or spark flashes after a short wait. Tap the matching symbol as quickly as you can.",
    "howToPlay": [
      "Wait for the flash, then tap the matching symbol."
    ],
    "firebaseEvents": [
      "duel:heartSpawn",
      "duel:tap"
    ],
    "boardReward": "Winner moves 2",
    "assetsNeeded": [
      "tap feedback",
      "haptics"
    ],
    "skippable": true,
    "label": "Heartflash",
    "prompt": "Wait for the flash, then tap the matching symbol."
  },
  {
    "id": "kiss-courier",
    "vibe": "spicy",
    "intensity": 1,
    "name": "Kiss Courier",
    "tagline": "Catch this",
    "durationSec": 30,
    "players": 2,
    "mechanics": "Blow kiss becomes particle across Three.js board, partner catches.",
    "howToPlay": [
      "Player A blows kiss on camera or tap",
      "Kiss becomes particle stream flying across board",
      "Player B moves piece to catch",
      "Catch = board glows warm"
    ],
    "firebaseEvents": [
      "duel:kissSent",
      "duel:kissCaught"
    ],
    "boardReward": "Home tile glows for rest of session",
    "assetsNeeded": [
      "particle system",
      "camera optional"
    ],
    "skippable": true,
    "label": "Kiss Courier",
    "prompt": "Player A blows kiss on camera or tap"
  },
  {
    "id": "fever-dream-date",
    "vibe": "spicy",
    "intensity": 2,
    "name": "Fever Dream Date",
    "tagline": "Most romantic date wins",
    "durationSec": 90,
    "players": 2,
    "mechanics": "Both build dream date in 45 sec, then merge.",
    "howToPlay": [
      "45 sec to type dream date with no budget",
      "Reveal both",
      "Pick one detail from each to create final date",
      "Save final date to journal"
    ],
    "firebaseEvents": [
      "duel:dateDraft",
      "duel:merge"
    ],
    "boardReward": "Date saved to journalEntries with reminder",
    "assetsNeeded": [
      "text area",
      "merge UI"
    ],
    "skippable": true,
    "label": "Fever Dream Date",
    "prompt": "45 sec to type dream date with no budget"
  },
  {
    "id": "voice-note-trailer",
    "vibe": "spicy",
    "intensity": 2,
    "name": "Trailer Voice",
    "tagline": "Say it like you mean it",
    "durationSec": 45,
    "players": 2,
    "mechanics": "Loser of last duel sends 7 sec voice note with prompt.",
    "howToPlay": [
      "Prompt: \"Say one thing you love about me like movie trailer\"",
      "Record 7 sec",
      "Other has to guess if you smiled while recording",
      "Both save"
    ],
    "firebaseEvents": [
      "duel:audioRecorded",
      "duel:guess"
    ],
    "boardReward": "Audio saved to tile",
    "assetsNeeded": [
      "audio recorder",
      "playback"
    ],
    "skippable": true,
    "label": "Trailer Voice",
    "prompt": "Prompt: \"Say one thing you love about me like movie trailer\""
  },
  {
    "id": "temperature-check",
    "vibe": "spicy",
    "intensity": 1,
    "name": "Temperature Check",
    "tagline": "How close do you feel?",
    "durationSec": 30,
    "players": 2,
    "mechanics": "Both privately rate closeness 1-10, closeness bonus.",
    "howToPlay": [
      "How close do you feel to me right now 1-10?",
      "Both answer privately",
      "If within 1 point, big reward",
      "If far, gentle tender prompt appears, no shame"
    ],
    "firebaseEvents": [
      "duel:tempRating",
      "duel:reveal"
    ],
    "boardReward": "Close = warp 4, Far = unlock tender tile",
    "assetsNeeded": [
      "private slider"
    ],
    "skippable": true,
    "label": "Temperature Check",
    "prompt": "How close do you feel to me right now 1-10?"
  },
  {
    "id": "slow-draw-portrait-romantic",
    "vibe": "spicy",
    "intensity": 2,
    "name": "Slow Draw",
    "tagline": "Draw me like you see me",
    "durationSec": 75,
    "players": 2,
    "mechanics": "60 sec to draw partner from memory focusing on favorite detail.",
    "howToPlay": [
      "Prompt: \"Draw the detail you love most\"",
      "60 sec slow draw, thin brush",
      "Reveal and explain why that detail",
      "Both drawings become paired art on board"
    ],
    "firebaseEvents": [
      "duel:slowStroke",
      "duel:complete"
    ],
    "boardReward": "Art becomes permanent frame on home tile",
    "assetsNeeded": [
      "drawing canvas",
      "soft brush"
    ],
    "skippable": true,
    "label": "Slow Draw",
    "prompt": "Prompt: \"Draw the detail you love most\""
  },
  {
    "durationSec": 180,
    "howToPlay": [
      "Five quick prompts. Answer honestly for yourself, then guess what your partner will answer. Every match earns a shared heart — up to 10."
    ],
    "id": "wavelength-duel",
    "intensity": 1,
    "name": "Wavelength",
    "skippable": true,
    "tagline": "Answer for you, guess for them. How in sync are you, really?",
    "vibe": "playful",
    "label": "Wavelength",
    "prompt": "Five quick prompts. Answer honestly for yourself, then guess what your partner will answer. Every match earns a shared heart — up to 10."
  }
]
```


## Night questions and vault prompts

Source: `src/features/session/nightQuestionBank.js`.

### `NIGHT_CHOICE_QUESTIONS` (50 entries)

```json
[
  {
    "id": "night-rainy-date",
    "text": "A rainy afternoon together calls for…",
    "options": [
      {
        "id": "a",
        "label": "A blanket and a film"
      },
      {
        "id": "b",
        "label": "Baking something"
      },
      {
        "id": "c",
        "label": "A museum wander"
      },
      {
        "id": "d",
        "label": "A puddle-filled walk"
      }
    ]
  },
  {
    "id": "night-surprise-hour",
    "text": "An unexpected hour together is best spent…",
    "options": [
      {
        "id": "a",
        "label": "Talking with no phones"
      },
      {
        "id": "b",
        "label": "Getting coffee"
      },
      {
        "id": "c",
        "label": "Taking a nap"
      },
      {
        "id": "d",
        "label": "Going somewhere new"
      }
    ]
  },
  {
    "id": "night-tiny-holiday",
    "text": "A made-up holiday for us should celebrate…",
    "options": [
      {
        "id": "a",
        "label": "Our first hello"
      },
      {
        "id": "b",
        "label": "Our best inside joke"
      },
      {
        "id": "c",
        "label": "Doing nothing together"
      },
      {
        "id": "d",
        "label": "Our favorite meal"
      }
    ]
  },
  {
    "id": "night-road-seat",
    "text": "On a road trip, my dream role is…",
    "options": [
      {
        "id": "a",
        "label": "Driver"
      },
      {
        "id": "b",
        "label": "DJ"
      },
      {
        "id": "c",
        "label": "Snack manager"
      },
      {
        "id": "d",
        "label": "Scenery commentator"
      }
    ]
  },
  {
    "id": "night-lost-map",
    "text": "If we got lost in a new city, I would…",
    "options": [
      {
        "id": "a",
        "label": "Find a café first"
      },
      {
        "id": "b",
        "label": "Ask a local"
      },
      {
        "id": "c",
        "label": "Open the map"
      },
      {
        "id": "d",
        "label": "Call it an adventure"
      }
    ]
  },
  {
    "id": "night-souvenir",
    "text": "The souvenir I would keep is…",
    "options": [
      {
        "id": "a",
        "label": "A postcard"
      },
      {
        "id": "b",
        "label": "A ridiculous photo"
      },
      {
        "id": "c",
        "label": "A small local treasure"
      },
      {
        "id": "d",
        "label": "The ticket stub"
      }
    ]
  },
  {
    "id": "night-night-sound",
    "text": "The nicest background sound for a quiet night is…",
    "options": [
      {
        "id": "a",
        "label": "Rain"
      },
      {
        "id": "b",
        "label": "A familiar playlist"
      },
      {
        "id": "c",
        "label": "A crackling fire"
      },
      {
        "id": "d",
        "label": "Comfortable silence"
      }
    ]
  },
  {
    "id": "night-breakfast",
    "text": "Breakfast brought to me should include…",
    "options": [
      {
        "id": "a",
        "label": "Coffee and toast"
      },
      {
        "id": "b",
        "label": "Something sweet"
      },
      {
        "id": "c",
        "label": "Eggs and all the extras"
      },
      {
        "id": "d",
        "label": "Whatever you made"
      }
    ]
  },
  {
    "id": "night-little-help",
    "text": "When I feel overwhelmed, start with…",
    "options": [
      {
        "id": "a",
        "label": "A hug"
      },
      {
        "id": "b",
        "label": "A practical offer"
      },
      {
        "id": "c",
        "label": "Listening"
      },
      {
        "id": "d",
        "label": "A little space"
      }
    ]
  },
  {
    "id": "night-good-news",
    "text": "When I have good news, I want…",
    "options": [
      {
        "id": "a",
        "label": "An excited call"
      },
      {
        "id": "b",
        "label": "A big hug"
      },
      {
        "id": "c",
        "label": "A tiny celebration"
      },
      {
        "id": "d",
        "label": "Time to tell the whole story"
      }
    ]
  },
  {
    "id": "night-surprise-kind",
    "text": "My favorite kind of surprise is…",
    "options": [
      {
        "id": "a",
        "label": "A thoughtful note"
      },
      {
        "id": "b",
        "label": "A planned outing"
      },
      {
        "id": "c",
        "label": "A favorite snack"
      },
      {
        "id": "d",
        "label": "A chore already done"
      }
    ]
  },
  {
    "id": "night-home-detail",
    "text": "The detail that makes a place feel like home is…",
    "options": [
      {
        "id": "a",
        "label": "Warm lighting"
      },
      {
        "id": "b",
        "label": "Familiar smells"
      },
      {
        "id": "c",
        "label": "Photos"
      },
      {
        "id": "d",
        "label": "Someone waiting for me"
      }
    ]
  },
  {
    "id": "night-garden",
    "text": "If we grew something together, I would pick…",
    "options": [
      {
        "id": "a",
        "label": "Herbs"
      },
      {
        "id": "b",
        "label": "Wildflowers"
      },
      {
        "id": "c",
        "label": "Tomatoes"
      },
      {
        "id": "d",
        "label": "A slightly dramatic houseplant"
      }
    ]
  },
  {
    "id": "night-silly-trophy",
    "text": "Our couple trophy should reward…",
    "options": [
      {
        "id": "a",
        "label": "Excellent snack decisions"
      },
      {
        "id": "b",
        "label": "Turning errands into dates"
      },
      {
        "id": "c",
        "label": "Impressive teamwork"
      },
      {
        "id": "d",
        "label": "Unnecessary laughter"
      }
    ]
  },
  {
    "id": "night-mystery-box",
    "text": "I would open a mystery box hoping for…",
    "options": [
      {
        "id": "a",
        "label": "A letter"
      },
      {
        "id": "b",
        "label": "A tiny gadget"
      },
      {
        "id": "c",
        "label": "Art supplies"
      },
      {
        "id": "d",
        "label": "A map to somewhere"
      }
    ]
  },
  {
    "id": "night-couple-show",
    "text": "Our imaginary TV show would be…",
    "options": [
      {
        "id": "a",
        "label": "A cozy sitcom"
      },
      {
        "id": "b",
        "label": "A travel series"
      },
      {
        "id": "c",
        "label": "A cooking disaster"
      },
      {
        "id": "d",
        "label": "A very gentle mystery"
      }
    ]
  },
  {
    "id": "night-picnic",
    "text": "The most important picnic item is…",
    "options": [
      {
        "id": "a",
        "label": "The good blanket"
      },
      {
        "id": "b",
        "label": "Excellent food"
      },
      {
        "id": "c",
        "label": "A great view"
      },
      {
        "id": "d",
        "label": "A backup plan for ants"
      }
    ]
  },
  {
    "id": "night-dance",
    "text": "If our song came on in a shop, I would…",
    "options": [
      {
        "id": "a",
        "label": "Dance a little"
      },
      {
        "id": "b",
        "label": "Give you a look"
      },
      {
        "id": "c",
        "label": "Sing quietly"
      },
      {
        "id": "d",
        "label": "Wait until we get outside"
      }
    ]
  },
  {
    "id": "night-museum",
    "text": "Our tiny museum needs an exhibit about…",
    "options": [
      {
        "id": "a",
        "label": "Our first adventure"
      },
      {
        "id": "b",
        "label": "Our strangest meal"
      },
      {
        "id": "c",
        "label": "An ordinary perfect day"
      },
      {
        "id": "d",
        "label": "Our running jokes"
      }
    ]
  },
  {
    "id": "night-week-reset",
    "text": "A fresh start to the week means…",
    "options": [
      {
        "id": "a",
        "label": "A tidy space"
      },
      {
        "id": "b",
        "label": "A shared plan"
      },
      {
        "id": "c",
        "label": "A slow breakfast"
      },
      {
        "id": "d",
        "label": "Something fun to anticipate"
      }
    ]
  },
  {
    "id": "night-future-home",
    "text": "Our imaginary dream home needs…",
    "options": [
      {
        "id": "a",
        "label": "A reading nook"
      },
      {
        "id": "b",
        "label": "A big kitchen"
      },
      {
        "id": "c",
        "label": "A garden"
      },
      {
        "id": "d",
        "label": "A room for making things"
      }
    ]
  },
  {
    "id": "night-pet-name",
    "text": "Our imaginary pet should be named after…",
    "options": [
      {
        "id": "a",
        "label": "A food"
      },
      {
        "id": "b",
        "label": "A grand historical figure"
      },
      {
        "id": "c",
        "label": "A favorite character"
      },
      {
        "id": "d",
        "label": "A completely ordinary person"
      }
    ]
  },
  {
    "id": "night-team-power",
    "text": "Our shared superpower should be…",
    "options": [
      {
        "id": "a",
        "label": "Teleporting together"
      },
      {
        "id": "b",
        "label": "Perfect snack timing"
      },
      {
        "id": "c",
        "label": "Finding lost things"
      },
      {
        "id": "d",
        "label": "Pausing busy days"
      }
    ]
  },
  {
    "id": "night-tiny-adventure",
    "text": "A small adventure I would say yes to is…",
    "options": [
      {
        "id": "a",
        "label": "A mystery train stop"
      },
      {
        "id": "b",
        "label": "A new walking trail"
      },
      {
        "id": "c",
        "label": "An unfamiliar restaurant"
      },
      {
        "id": "d",
        "label": "A sunrise outing"
      }
    ]
  },
  {
    "id": "night-gift-wrap",
    "text": "A gift feels most thoughtful when…",
    "options": [
      {
        "id": "a",
        "label": "It recalls something I said"
      },
      {
        "id": "b",
        "label": "You made it"
      },
      {
        "id": "c",
        "label": "It gives us time together"
      },
      {
        "id": "d",
        "label": "It makes daily life easier"
      }
    ]
  },
  {
    "id": "night-photo-style",
    "text": "My favorite photo of us would be…",
    "options": [
      {
        "id": "a",
        "label": "Laughing mid-sentence"
      },
      {
        "id": "b",
        "label": "Somewhere beautiful"
      },
      {
        "id": "c",
        "label": "A slightly blurry candid"
      },
      {
        "id": "d",
        "label": "An ordinary day at home"
      }
    ]
  },
  {
    "id": "night-quiet-company",
    "text": "Quiet company feels best when we…",
    "options": [
      {
        "id": "a",
        "label": "Read side by side"
      },
      {
        "id": "b",
        "label": "Cook without rushing"
      },
      {
        "id": "c",
        "label": "Watch the sky"
      },
      {
        "id": "d",
        "label": "Work on separate hobbies"
      }
    ]
  },
  {
    "id": "night-first-stop",
    "text": "At a fair, I would head straight for…",
    "options": [
      {
        "id": "a",
        "label": "The food"
      },
      {
        "id": "b",
        "label": "The games"
      },
      {
        "id": "c",
        "label": "The biggest ride"
      },
      {
        "id": "d",
        "label": "The animals"
      }
    ]
  },
  {
    "id": "night-dream-class",
    "text": "A class I would take with you is…",
    "options": [
      {
        "id": "a",
        "label": "Pottery"
      },
      {
        "id": "b",
        "label": "Cooking"
      },
      {
        "id": "c",
        "label": "Dancing"
      },
      {
        "id": "d",
        "label": "Something unexpectedly niche"
      }
    ]
  },
  {
    "id": "night-time-capsule",
    "text": "Our time capsule should include…",
    "options": [
      {
        "id": "a",
        "label": "A letter"
      },
      {
        "id": "b",
        "label": "A playlist"
      },
      {
        "id": "c",
        "label": "A photo"
      },
      {
        "id": "d",
        "label": "A very specific inside joke"
      }
    ]
  },
  {
    "id": "night-comfort-color",
    "text": "A room that helps me relax would feel…",
    "options": [
      {
        "id": "a",
        "label": "Warm and golden"
      },
      {
        "id": "b",
        "label": "Cool and blue"
      },
      {
        "id": "c",
        "label": "Soft and green"
      },
      {
        "id": "d",
        "label": "Bright and airy"
      }
    ]
  },
  {
    "id": "night-staycation",
    "text": "The best part of a staycation is…",
    "options": [
      {
        "id": "a",
        "label": "No alarm"
      },
      {
        "id": "b",
        "label": "Room-service-style breakfast"
      },
      {
        "id": "c",
        "label": "Exploring our own town"
      },
      {
        "id": "d",
        "label": "Ignoring the to-do list"
      }
    ]
  },
  {
    "id": "night-secret-talent",
    "text": "A silly talent I would like us to master is…",
    "options": [
      {
        "id": "a",
        "label": "A duet"
      },
      {
        "id": "b",
        "label": "Card tricks"
      },
      {
        "id": "c",
        "label": "Elaborate pancake art"
      },
      {
        "id": "d",
        "label": "A synchronized entrance"
      }
    ]
  },
  {
    "id": "night-walk-choice",
    "text": "On a walk, I would rather find…",
    "options": [
      {
        "id": "a",
        "label": "Water"
      },
      {
        "id": "b",
        "label": "A garden"
      },
      {
        "id": "c",
        "label": "An interesting street"
      },
      {
        "id": "d",
        "label": "A place to sit"
      }
    ]
  },
  {
    "id": "night-reunion",
    "text": "After time apart, my ideal first moment is…",
    "options": [
      {
        "id": "a",
        "label": "A long hug"
      },
      {
        "id": "b",
        "label": "Telling every little story"
      },
      {
        "id": "c",
        "label": "Food together"
      },
      {
        "id": "d",
        "label": "Settling in quietly"
      }
    ]
  },
  {
    "id": "night-small-tradition",
    "text": "A weekly tradition I would enjoy is…",
    "options": [
      {
        "id": "a",
        "label": "A shared breakfast"
      },
      {
        "id": "b",
        "label": "A walk"
      },
      {
        "id": "c",
        "label": "A game night"
      },
      {
        "id": "d",
        "label": "Trying a new recipe"
      }
    ]
  },
  {
    "id": "night-movie-role",
    "text": "In an adventure movie, I would be…",
    "options": [
      {
        "id": "a",
        "label": "The planner"
      },
      {
        "id": "b",
        "label": "The brave improviser"
      },
      {
        "id": "c",
        "label": "The comic relief"
      },
      {
        "id": "d",
        "label": "The one with the supplies"
      }
    ]
  },
  {
    "id": "night-winter-date",
    "text": "A cold-weather date should involve…",
    "options": [
      {
        "id": "a",
        "label": "Hot drinks"
      },
      {
        "id": "b",
        "label": "A snowy walk"
      },
      {
        "id": "c",
        "label": "A warm kitchen"
      },
      {
        "id": "d",
        "label": "A blanket fortress"
      }
    ]
  },
  {
    "id": "night-summer-date",
    "text": "A summer evening together needs…",
    "options": [
      {
        "id": "a",
        "label": "A sunset"
      },
      {
        "id": "b",
        "label": "Ice cream"
      },
      {
        "id": "c",
        "label": "An outdoor concert"
      },
      {
        "id": "d",
        "label": "A quiet porch"
      }
    ]
  },
  {
    "id": "night-one-day-off",
    "text": "One responsibility I would love a day off from is…",
    "options": [
      {
        "id": "a",
        "label": "Making decisions"
      },
      {
        "id": "b",
        "label": "Cooking"
      },
      {
        "id": "c",
        "label": "Tidying"
      },
      {
        "id": "d",
        "label": "Watching the clock"
      }
    ]
  },
  {
    "id": "night-message",
    "text": "The message I would love to get today is…",
    "options": [
      {
        "id": "a",
        "label": "I am proud of you"
      },
      {
        "id": "b",
        "label": "I saved you some"
      },
      {
        "id": "c",
        "label": "Want to go somewhere?"
      },
      {
        "id": "d",
        "label": "No rush, take your time"
      }
    ]
  },
  {
    "id": "night-dream-shop",
    "text": "Our imaginary shop would sell…",
    "options": [
      {
        "id": "a",
        "label": "Books and tea"
      },
      {
        "id": "b",
        "label": "Odd little treasures"
      },
      {
        "id": "c",
        "label": "Plants"
      },
      {
        "id": "d",
        "label": "Desserts"
      }
    ]
  },
  {
    "id": "night-treasure",
    "text": "The best treasure hunt would end with…",
    "options": [
      {
        "id": "a",
        "label": "A personal letter"
      },
      {
        "id": "b",
        "label": "A picnic"
      },
      {
        "id": "c",
        "label": "An unexpected view"
      },
      {
        "id": "d",
        "label": "A wonderfully silly prize"
      }
    ]
  },
  {
    "id": "night-learning-us",
    "text": "Something I would enjoy learning about you is…",
    "options": [
      {
        "id": "a",
        "label": "A childhood favorite"
      },
      {
        "id": "b",
        "label": "A quiet ambition"
      },
      {
        "id": "c",
        "label": "A surprising opinion"
      },
      {
        "id": "d",
        "label": "Your ideal ordinary day"
      }
    ]
  },
  {
    "id": "night-spare-room",
    "text": "A spare room for us would become…",
    "options": [
      {
        "id": "a",
        "label": "A creative studio"
      },
      {
        "id": "b",
        "label": "A game room"
      },
      {
        "id": "c",
        "label": "A library"
      },
      {
        "id": "d",
        "label": "A peaceful retreat"
      }
    ]
  },
  {
    "id": "night-wrong-turn",
    "text": "The best accidental detour would lead to…",
    "options": [
      {
        "id": "a",
        "label": "A bakery"
      },
      {
        "id": "b",
        "label": "A beautiful overlook"
      },
      {
        "id": "c",
        "label": "A festival"
      },
      {
        "id": "d",
        "label": "A tiny bookstore"
      }
    ]
  },
  {
    "id": "night-party-exit",
    "text": "Our ideal party exit is…",
    "options": [
      {
        "id": "a",
        "label": "Early, with snacks"
      },
      {
        "id": "b",
        "label": "After one last conversation"
      },
      {
        "id": "c",
        "label": "When the music ends"
      },
      {
        "id": "d",
        "label": "A perfectly timed shared glance"
      }
    ]
  },
  {
    "id": "night-little-luxury",
    "text": "The little luxury I would choose today is…",
    "options": [
      {
        "id": "a",
        "label": "Fresh sheets"
      },
      {
        "id": "b",
        "label": "A really good drink"
      },
      {
        "id": "c",
        "label": "Uninterrupted hobby time"
      },
      {
        "id": "d",
        "label": "A meal I did not plan"
      }
    ]
  },
  {
    "id": "night-week-keepsake",
    "text": "I would remember this week through…",
    "options": [
      {
        "id": "a",
        "label": "A photo"
      },
      {
        "id": "b",
        "label": "A funny quote"
      },
      {
        "id": "c",
        "label": "A song"
      },
      {
        "id": "d",
        "label": "One quiet moment"
      }
    ]
  },
  {
    "id": "night-shared-quest",
    "text": "Our next tiny shared quest should be…",
    "options": [
      {
        "id": "a",
        "label": "Find the best local pastry"
      },
      {
        "id": "b",
        "label": "Learn one new game"
      },
      {
        "id": "c",
        "label": "Visit somewhere nearby"
      },
      {
        "id": "d",
        "label": "Make something by hand"
      }
    ]
  }
]
```

### `EXTRA_VAULT_PROMPTS` (16 entries)

```json
[
  {
    "id": "vault-extra-1",
    "prompt": "Leave your partner one sentence to open after a difficult day."
  },
  {
    "id": "vault-extra-2",
    "prompt": "Save one ordinary moment from today that you want to remember."
  },
  {
    "id": "vault-extra-3",
    "prompt": "Write a small adventure you hope to share before this season ends."
  },
  {
    "id": "vault-extra-4",
    "prompt": "Name something your partner does that makes your life gentler."
  },
  {
    "id": "vault-extra-5",
    "prompt": "Write a promise small enough to keep this week."
  },
  {
    "id": "vault-extra-6",
    "prompt": "Save the compliment you almost said out loud today."
  },
  {
    "id": "vault-extra-7",
    "prompt": "Describe a future ordinary Tuesday you would love to share."
  },
  {
    "id": "vault-extra-8",
    "prompt": "Leave a note for the next time you miss each other."
  },
  {
    "id": "vault-extra-9",
    "prompt": "Write one thing you hope the two of you never outgrow."
  },
  {
    "id": "vault-extra-10",
    "prompt": "Save a thank-you for an effort your partner might think went unnoticed."
  },
  {
    "id": "vault-extra-11",
    "prompt": "Name one thing you are looking forward to doing together again."
  },
  {
    "id": "vault-extra-12",
    "prompt": "Write the title of a chapter you hope comes next for you both."
  },
  {
    "id": "vault-extra-13",
    "prompt": "Leave a reminder of something you already handled well together."
  },
  {
    "id": "vault-extra-14",
    "prompt": "Write one question you would love to ask on your next date."
  },
  {
    "id": "vault-extra-15",
    "prompt": "Save one little ritual you would like to bring back."
  },
  {
    "id": "vault-extra-16",
    "prompt": "Describe the place you would take your partner for one peaceful hour."
  }
]
```


## Connection games

Source: `src/features/session/connectionGameData.js`.

### `MIND_MELD_PROMPTS` (56 entries)

```json
[
  {
    "id": "movie-trope",
    "prompt": "Which movie trope feels most like the two of you lately?",
    "options": [
      {
        "id": "road-trip",
        "label": "Unexpected road trip"
      },
      {
        "id": "slow-burn",
        "label": "Slow-burn romance"
      },
      {
        "id": "heist",
        "label": "Chaotic heist team"
      },
      {
        "id": "cozy-sequel",
        "label": "Cozy sequel"
      }
    ]
  },
  {
    "id": "tiny-luxury",
    "prompt": "Which tiny luxury would improve tonight the most?",
    "options": [
      {
        "id": "dessert",
        "label": "Excellent dessert"
      },
      {
        "id": "blanket",
        "label": "Fresh warm blanket"
      },
      {
        "id": "playlist",
        "label": "Perfect playlist"
      },
      {
        "id": "late-checkout",
        "label": "No alarm tomorrow"
      }
    ]
  },
  {
    "id": "zombie-plan",
    "prompt": "The zombie apocalypse starts. What is your first shared move?",
    "options": [
      {
        "id": "fortify",
        "label": "Fortify the house"
      },
      {
        "id": "road",
        "label": "Hit the road"
      },
      {
        "id": "supplies",
        "label": "Raid the snack aisle"
      },
      {
        "id": "nap",
        "label": "One last nap"
      }
    ]
  },
  {
    "id": "free-hour",
    "prompt": "A surprise free hour appears. Where do you both hope it goes?",
    "options": [
      {
        "id": "walk",
        "label": "Aimless walk"
      },
      {
        "id": "couch",
        "label": "Couch and a show"
      },
      {
        "id": "food",
        "label": "Find something delicious"
      },
      {
        "id": "project",
        "label": "Make something together"
      }
    ]
  },
  {
    "id": "couple-mascot",
    "prompt": "Which unofficial mascot best represents your relationship?",
    "options": [
      {
        "id": "otter",
        "label": "Hand-holding otter"
      },
      {
        "id": "crow",
        "label": "Gift-bringing crow"
      },
      {
        "id": "capybara",
        "label": "Unbothered capybara"
      },
      {
        "id": "raccoon",
        "label": "Snack-seeking raccoon"
      }
    ]
  },
  {
    "id": "soundtrack",
    "prompt": "What should play over the closing credits of this week?",
    "options": [
      {
        "id": "ballad",
        "label": "Tender ballad"
      },
      {
        "id": "disco",
        "label": "Ridiculous disco"
      },
      {
        "id": "instrumental",
        "label": "Dreamy instrumental"
      },
      {
        "id": "anthem",
        "label": "Full-volume anthem"
      }
    ]
  },
  {
    "id": "night-rainy-date",
    "options": [
      {
        "id": "a",
        "label": "A blanket and a film"
      },
      {
        "id": "b",
        "label": "Baking something"
      },
      {
        "id": "c",
        "label": "A museum wander"
      },
      {
        "id": "d",
        "label": "A puddle-filled walk"
      }
    ],
    "prompt": "A rainy afternoon together calls for…"
  },
  {
    "id": "night-surprise-hour",
    "options": [
      {
        "id": "a",
        "label": "Talking with no phones"
      },
      {
        "id": "b",
        "label": "Getting coffee"
      },
      {
        "id": "c",
        "label": "Taking a nap"
      },
      {
        "id": "d",
        "label": "Going somewhere new"
      }
    ],
    "prompt": "An unexpected hour together is best spent…"
  },
  {
    "id": "night-tiny-holiday",
    "options": [
      {
        "id": "a",
        "label": "Our first hello"
      },
      {
        "id": "b",
        "label": "Our best inside joke"
      },
      {
        "id": "c",
        "label": "Doing nothing together"
      },
      {
        "id": "d",
        "label": "Our favorite meal"
      }
    ],
    "prompt": "A made-up holiday for us should celebrate…"
  },
  {
    "id": "night-road-seat",
    "options": [
      {
        "id": "a",
        "label": "Driver"
      },
      {
        "id": "b",
        "label": "DJ"
      },
      {
        "id": "c",
        "label": "Snack manager"
      },
      {
        "id": "d",
        "label": "Scenery commentator"
      }
    ],
    "prompt": "On a road trip, my dream role is…"
  },
  {
    "id": "night-lost-map",
    "options": [
      {
        "id": "a",
        "label": "Find a café first"
      },
      {
        "id": "b",
        "label": "Ask a local"
      },
      {
        "id": "c",
        "label": "Open the map"
      },
      {
        "id": "d",
        "label": "Call it an adventure"
      }
    ],
    "prompt": "If we got lost in a new city, I would…"
  },
  {
    "id": "night-souvenir",
    "options": [
      {
        "id": "a",
        "label": "A postcard"
      },
      {
        "id": "b",
        "label": "A ridiculous photo"
      },
      {
        "id": "c",
        "label": "A small local treasure"
      },
      {
        "id": "d",
        "label": "The ticket stub"
      }
    ],
    "prompt": "The souvenir I would keep is…"
  },
  {
    "id": "night-night-sound",
    "options": [
      {
        "id": "a",
        "label": "Rain"
      },
      {
        "id": "b",
        "label": "A familiar playlist"
      },
      {
        "id": "c",
        "label": "A crackling fire"
      },
      {
        "id": "d",
        "label": "Comfortable silence"
      }
    ],
    "prompt": "The nicest background sound for a quiet night is…"
  },
  {
    "id": "night-breakfast",
    "options": [
      {
        "id": "a",
        "label": "Coffee and toast"
      },
      {
        "id": "b",
        "label": "Something sweet"
      },
      {
        "id": "c",
        "label": "Eggs and all the extras"
      },
      {
        "id": "d",
        "label": "Whatever you made"
      }
    ],
    "prompt": "Breakfast brought to me should include…"
  },
  {
    "id": "night-little-help",
    "options": [
      {
        "id": "a",
        "label": "A hug"
      },
      {
        "id": "b",
        "label": "A practical offer"
      },
      {
        "id": "c",
        "label": "Listening"
      },
      {
        "id": "d",
        "label": "A little space"
      }
    ],
    "prompt": "When I feel overwhelmed, start with…"
  },
  {
    "id": "night-good-news",
    "options": [
      {
        "id": "a",
        "label": "An excited call"
      },
      {
        "id": "b",
        "label": "A big hug"
      },
      {
        "id": "c",
        "label": "A tiny celebration"
      },
      {
        "id": "d",
        "label": "Time to tell the whole story"
      }
    ],
    "prompt": "When I have good news, I want…"
  },
  {
    "id": "night-surprise-kind",
    "options": [
      {
        "id": "a",
        "label": "A thoughtful note"
      },
      {
        "id": "b",
        "label": "A planned outing"
      },
      {
        "id": "c",
        "label": "A favorite snack"
      },
      {
        "id": "d",
        "label": "A chore already done"
      }
    ],
    "prompt": "My favorite kind of surprise is…"
  },
  {
    "id": "night-home-detail",
    "options": [
      {
        "id": "a",
        "label": "Warm lighting"
      },
      {
        "id": "b",
        "label": "Familiar smells"
      },
      {
        "id": "c",
        "label": "Photos"
      },
      {
        "id": "d",
        "label": "Someone waiting for me"
      }
    ],
    "prompt": "The detail that makes a place feel like home is…"
  },
  {
    "id": "night-garden",
    "options": [
      {
        "id": "a",
        "label": "Herbs"
      },
      {
        "id": "b",
        "label": "Wildflowers"
      },
      {
        "id": "c",
        "label": "Tomatoes"
      },
      {
        "id": "d",
        "label": "A slightly dramatic houseplant"
      }
    ],
    "prompt": "If we grew something together, I would pick…"
  },
  {
    "id": "night-silly-trophy",
    "options": [
      {
        "id": "a",
        "label": "Excellent snack decisions"
      },
      {
        "id": "b",
        "label": "Turning errands into dates"
      },
      {
        "id": "c",
        "label": "Impressive teamwork"
      },
      {
        "id": "d",
        "label": "Unnecessary laughter"
      }
    ],
    "prompt": "Our couple trophy should reward…"
  },
  {
    "id": "night-mystery-box",
    "options": [
      {
        "id": "a",
        "label": "A letter"
      },
      {
        "id": "b",
        "label": "A tiny gadget"
      },
      {
        "id": "c",
        "label": "Art supplies"
      },
      {
        "id": "d",
        "label": "A map to somewhere"
      }
    ],
    "prompt": "I would open a mystery box hoping for…"
  },
  {
    "id": "night-couple-show",
    "options": [
      {
        "id": "a",
        "label": "A cozy sitcom"
      },
      {
        "id": "b",
        "label": "A travel series"
      },
      {
        "id": "c",
        "label": "A cooking disaster"
      },
      {
        "id": "d",
        "label": "A very gentle mystery"
      }
    ],
    "prompt": "Our imaginary TV show would be…"
  },
  {
    "id": "night-picnic",
    "options": [
      {
        "id": "a",
        "label": "The good blanket"
      },
      {
        "id": "b",
        "label": "Excellent food"
      },
      {
        "id": "c",
        "label": "A great view"
      },
      {
        "id": "d",
        "label": "A backup plan for ants"
      }
    ],
    "prompt": "The most important picnic item is…"
  },
  {
    "id": "night-dance",
    "options": [
      {
        "id": "a",
        "label": "Dance a little"
      },
      {
        "id": "b",
        "label": "Give you a look"
      },
      {
        "id": "c",
        "label": "Sing quietly"
      },
      {
        "id": "d",
        "label": "Wait until we get outside"
      }
    ],
    "prompt": "If our song came on in a shop, I would…"
  },
  {
    "id": "night-museum",
    "options": [
      {
        "id": "a",
        "label": "Our first adventure"
      },
      {
        "id": "b",
        "label": "Our strangest meal"
      },
      {
        "id": "c",
        "label": "An ordinary perfect day"
      },
      {
        "id": "d",
        "label": "Our running jokes"
      }
    ],
    "prompt": "Our tiny museum needs an exhibit about…"
  },
  {
    "id": "night-week-reset",
    "options": [
      {
        "id": "a",
        "label": "A tidy space"
      },
      {
        "id": "b",
        "label": "A shared plan"
      },
      {
        "id": "c",
        "label": "A slow breakfast"
      },
      {
        "id": "d",
        "label": "Something fun to anticipate"
      }
    ],
    "prompt": "A fresh start to the week means…"
  },
  {
    "id": "night-future-home",
    "options": [
      {
        "id": "a",
        "label": "A reading nook"
      },
      {
        "id": "b",
        "label": "A big kitchen"
      },
      {
        "id": "c",
        "label": "A garden"
      },
      {
        "id": "d",
        "label": "A room for making things"
      }
    ],
    "prompt": "Our imaginary dream home needs…"
  },
  {
    "id": "night-pet-name",
    "options": [
      {
        "id": "a",
        "label": "A food"
      },
      {
        "id": "b",
        "label": "A grand historical figure"
      },
      {
        "id": "c",
        "label": "A favorite character"
      },
      {
        "id": "d",
        "label": "A completely ordinary person"
      }
    ],
    "prompt": "Our imaginary pet should be named after…"
  },
  {
    "id": "night-team-power",
    "options": [
      {
        "id": "a",
        "label": "Teleporting together"
      },
      {
        "id": "b",
        "label": "Perfect snack timing"
      },
      {
        "id": "c",
        "label": "Finding lost things"
      },
      {
        "id": "d",
        "label": "Pausing busy days"
      }
    ],
    "prompt": "Our shared superpower should be…"
  },
  {
    "id": "night-tiny-adventure",
    "options": [
      {
        "id": "a",
        "label": "A mystery train stop"
      },
      {
        "id": "b",
        "label": "A new walking trail"
      },
      {
        "id": "c",
        "label": "An unfamiliar restaurant"
      },
      {
        "id": "d",
        "label": "A sunrise outing"
      }
    ],
    "prompt": "A small adventure I would say yes to is…"
  },
  {
    "id": "night-gift-wrap",
    "options": [
      {
        "id": "a",
        "label": "It recalls something I said"
      },
      {
        "id": "b",
        "label": "You made it"
      },
      {
        "id": "c",
        "label": "It gives us time together"
      },
      {
        "id": "d",
        "label": "It makes daily life easier"
      }
    ],
    "prompt": "A gift feels most thoughtful when…"
  },
  {
    "id": "night-photo-style",
    "options": [
      {
        "id": "a",
        "label": "Laughing mid-sentence"
      },
      {
        "id": "b",
        "label": "Somewhere beautiful"
      },
      {
        "id": "c",
        "label": "A slightly blurry candid"
      },
      {
        "id": "d",
        "label": "An ordinary day at home"
      }
    ],
    "prompt": "My favorite photo of us would be…"
  },
  {
    "id": "night-quiet-company",
    "options": [
      {
        "id": "a",
        "label": "Read side by side"
      },
      {
        "id": "b",
        "label": "Cook without rushing"
      },
      {
        "id": "c",
        "label": "Watch the sky"
      },
      {
        "id": "d",
        "label": "Work on separate hobbies"
      }
    ],
    "prompt": "Quiet company feels best when we…"
  },
  {
    "id": "night-first-stop",
    "options": [
      {
        "id": "a",
        "label": "The food"
      },
      {
        "id": "b",
        "label": "The games"
      },
      {
        "id": "c",
        "label": "The biggest ride"
      },
      {
        "id": "d",
        "label": "The animals"
      }
    ],
    "prompt": "At a fair, I would head straight for…"
  },
  {
    "id": "night-dream-class",
    "options": [
      {
        "id": "a",
        "label": "Pottery"
      },
      {
        "id": "b",
        "label": "Cooking"
      },
      {
        "id": "c",
        "label": "Dancing"
      },
      {
        "id": "d",
        "label": "Something unexpectedly niche"
      }
    ],
    "prompt": "A class I would take with you is…"
  },
  {
    "id": "night-time-capsule",
    "options": [
      {
        "id": "a",
        "label": "A letter"
      },
      {
        "id": "b",
        "label": "A playlist"
      },
      {
        "id": "c",
        "label": "A photo"
      },
      {
        "id": "d",
        "label": "A very specific inside joke"
      }
    ],
    "prompt": "Our time capsule should include…"
  },
  {
    "id": "night-comfort-color",
    "options": [
      {
        "id": "a",
        "label": "Warm and golden"
      },
      {
        "id": "b",
        "label": "Cool and blue"
      },
      {
        "id": "c",
        "label": "Soft and green"
      },
      {
        "id": "d",
        "label": "Bright and airy"
      }
    ],
    "prompt": "A room that helps me relax would feel…"
  },
  {
    "id": "night-staycation",
    "options": [
      {
        "id": "a",
        "label": "No alarm"
      },
      {
        "id": "b",
        "label": "Room-service-style breakfast"
      },
      {
        "id": "c",
        "label": "Exploring our own town"
      },
      {
        "id": "d",
        "label": "Ignoring the to-do list"
      }
    ],
    "prompt": "The best part of a staycation is…"
  },
  {
    "id": "night-secret-talent",
    "options": [
      {
        "id": "a",
        "label": "A duet"
      },
      {
        "id": "b",
        "label": "Card tricks"
      },
      {
        "id": "c",
        "label": "Elaborate pancake art"
      },
      {
        "id": "d",
        "label": "A synchronized entrance"
      }
    ],
    "prompt": "A silly talent I would like us to master is…"
  },
  {
    "id": "night-walk-choice",
    "options": [
      {
        "id": "a",
        "label": "Water"
      },
      {
        "id": "b",
        "label": "A garden"
      },
      {
        "id": "c",
        "label": "An interesting street"
      },
      {
        "id": "d",
        "label": "A place to sit"
      }
    ],
    "prompt": "On a walk, I would rather find…"
  },
  {
    "id": "night-reunion",
    "options": [
      {
        "id": "a",
        "label": "A long hug"
      },
      {
        "id": "b",
        "label": "Telling every little story"
      },
      {
        "id": "c",
        "label": "Food together"
      },
      {
        "id": "d",
        "label": "Settling in quietly"
      }
    ],
    "prompt": "After time apart, my ideal first moment is…"
  },
  {
    "id": "night-small-tradition",
    "options": [
      {
        "id": "a",
        "label": "A shared breakfast"
      },
      {
        "id": "b",
        "label": "A walk"
      },
      {
        "id": "c",
        "label": "A game night"
      },
      {
        "id": "d",
        "label": "Trying a new recipe"
      }
    ],
    "prompt": "A weekly tradition I would enjoy is…"
  },
  {
    "id": "night-movie-role",
    "options": [
      {
        "id": "a",
        "label": "The planner"
      },
      {
        "id": "b",
        "label": "The brave improviser"
      },
      {
        "id": "c",
        "label": "The comic relief"
      },
      {
        "id": "d",
        "label": "The one with the supplies"
      }
    ],
    "prompt": "In an adventure movie, I would be…"
  },
  {
    "id": "night-winter-date",
    "options": [
      {
        "id": "a",
        "label": "Hot drinks"
      },
      {
        "id": "b",
        "label": "A snowy walk"
      },
      {
        "id": "c",
        "label": "A warm kitchen"
      },
      {
        "id": "d",
        "label": "A blanket fortress"
      }
    ],
    "prompt": "A cold-weather date should involve…"
  },
  {
    "id": "night-summer-date",
    "options": [
      {
        "id": "a",
        "label": "A sunset"
      },
      {
        "id": "b",
        "label": "Ice cream"
      },
      {
        "id": "c",
        "label": "An outdoor concert"
      },
      {
        "id": "d",
        "label": "A quiet porch"
      }
    ],
    "prompt": "A summer evening together needs…"
  },
  {
    "id": "night-one-day-off",
    "options": [
      {
        "id": "a",
        "label": "Making decisions"
      },
      {
        "id": "b",
        "label": "Cooking"
      },
      {
        "id": "c",
        "label": "Tidying"
      },
      {
        "id": "d",
        "label": "Watching the clock"
      }
    ],
    "prompt": "One responsibility I would love a day off from is…"
  },
  {
    "id": "night-message",
    "options": [
      {
        "id": "a",
        "label": "I am proud of you"
      },
      {
        "id": "b",
        "label": "I saved you some"
      },
      {
        "id": "c",
        "label": "Want to go somewhere?"
      },
      {
        "id": "d",
        "label": "No rush, take your time"
      }
    ],
    "prompt": "The message I would love to get today is…"
  },
  {
    "id": "night-dream-shop",
    "options": [
      {
        "id": "a",
        "label": "Books and tea"
      },
      {
        "id": "b",
        "label": "Odd little treasures"
      },
      {
        "id": "c",
        "label": "Plants"
      },
      {
        "id": "d",
        "label": "Desserts"
      }
    ],
    "prompt": "Our imaginary shop would sell…"
  },
  {
    "id": "night-treasure",
    "options": [
      {
        "id": "a",
        "label": "A personal letter"
      },
      {
        "id": "b",
        "label": "A picnic"
      },
      {
        "id": "c",
        "label": "An unexpected view"
      },
      {
        "id": "d",
        "label": "A wonderfully silly prize"
      }
    ],
    "prompt": "The best treasure hunt would end with…"
  },
  {
    "id": "night-learning-us",
    "options": [
      {
        "id": "a",
        "label": "A childhood favorite"
      },
      {
        "id": "b",
        "label": "A quiet ambition"
      },
      {
        "id": "c",
        "label": "A surprising opinion"
      },
      {
        "id": "d",
        "label": "Your ideal ordinary day"
      }
    ],
    "prompt": "Something I would enjoy learning about you is…"
  },
  {
    "id": "night-spare-room",
    "options": [
      {
        "id": "a",
        "label": "A creative studio"
      },
      {
        "id": "b",
        "label": "A game room"
      },
      {
        "id": "c",
        "label": "A library"
      },
      {
        "id": "d",
        "label": "A peaceful retreat"
      }
    ],
    "prompt": "A spare room for us would become…"
  },
  {
    "id": "night-wrong-turn",
    "options": [
      {
        "id": "a",
        "label": "A bakery"
      },
      {
        "id": "b",
        "label": "A beautiful overlook"
      },
      {
        "id": "c",
        "label": "A festival"
      },
      {
        "id": "d",
        "label": "A tiny bookstore"
      }
    ],
    "prompt": "The best accidental detour would lead to…"
  },
  {
    "id": "night-party-exit",
    "options": [
      {
        "id": "a",
        "label": "Early, with snacks"
      },
      {
        "id": "b",
        "label": "After one last conversation"
      },
      {
        "id": "c",
        "label": "When the music ends"
      },
      {
        "id": "d",
        "label": "A perfectly timed shared glance"
      }
    ],
    "prompt": "Our ideal party exit is…"
  },
  {
    "id": "night-little-luxury",
    "options": [
      {
        "id": "a",
        "label": "Fresh sheets"
      },
      {
        "id": "b",
        "label": "A really good drink"
      },
      {
        "id": "c",
        "label": "Uninterrupted hobby time"
      },
      {
        "id": "d",
        "label": "A meal I did not plan"
      }
    ],
    "prompt": "The little luxury I would choose today is…"
  },
  {
    "id": "night-week-keepsake",
    "options": [
      {
        "id": "a",
        "label": "A photo"
      },
      {
        "id": "b",
        "label": "A funny quote"
      },
      {
        "id": "c",
        "label": "A song"
      },
      {
        "id": "d",
        "label": "One quiet moment"
      }
    ],
    "prompt": "I would remember this week through…"
  },
  {
    "id": "night-shared-quest",
    "options": [
      {
        "id": "a",
        "label": "Find the best local pastry"
      },
      {
        "id": "b",
        "label": "Learn one new game"
      },
      {
        "id": "c",
        "label": "Visit somewhere nearby"
      },
      {
        "id": "d",
        "label": "Make something by hand"
      }
    ],
    "prompt": "Our next tiny shared quest should be…"
  }
]
```

### `PREDICTION_BOX_PROMPTS` (58 entries)

```json
[
  {
    "id": "surprise-date-original",
    "prompt": "Which surprise date would your partner choose first?",
    "options": [
      {
        "id": "reservation",
        "label": "A secret reservation"
      },
      {
        "id": "drive",
        "label": "A mystery drive"
      },
      {
        "id": "living-room",
        "label": "A transformed living room"
      },
      {
        "id": "morning-note",
        "label": "A note in the morning"
      }
    ]
  },
  {
    "id": "tiny-rescue",
    "prompt": "What would make your partner’s day easier right now?",
    "options": [
      {
        "id": "task",
        "label": "Take one task off their plate"
      },
      {
        "id": "company",
        "label": "Stay close, no advice needed"
      },
      {
        "id": "laugh",
        "label": "Send something ridiculous"
      },
      {
        "id": "space",
        "label": "Give them a quiet hour"
      }
    ]
  },
  {
    "id": "unlikely-duo",
    "prompt": "Which business would your partner start with you for fun?",
    "options": [
      {
        "id": "cafe",
        "label": "A tiny café"
      },
      {
        "id": "rescue",
        "label": "An animal sanctuary"
      },
      {
        "id": "shop",
        "label": "A wonderfully odd shop"
      },
      {
        "id": "travel",
        "label": "A traveling food truck"
      }
    ]
  },
  {
    "id": "surprise-date",
    "prompt": "Which opening would feel most like the perfect surprise date?",
    "options": [
      {
        "id": "reservation",
        "label": "A secret reservation"
      },
      {
        "id": "drive",
        "label": "Get in, we are going somewhere"
      },
      {
        "id": "living-room",
        "label": "A transformed living room"
      },
      {
        "id": "morning-note",
        "label": "A note waiting in the morning"
      }
    ]
  },
  {
    "id": "reset-button",
    "prompt": "Which reset button would your partner choose after a hard day?",
    "options": [
      {
        "id": "quiet",
        "label": "Quiet together"
      },
      {
        "id": "laugh",
        "label": "Make me laugh"
      },
      {
        "id": "food",
        "label": "Bring me food"
      },
      {
        "id": "walk",
        "label": "Take me outside"
      }
    ]
  },
  {
    "id": "free-saturday",
    "prompt": "What does your partner want most from a completely free Saturday?",
    "options": [
      {
        "id": "adventure",
        "label": "A small adventure"
      },
      {
        "id": "nest",
        "label": "Do absolutely nothing"
      },
      {
        "id": "people",
        "label": "See favorite people"
      },
      {
        "id": "project",
        "label": "Finish a satisfying project"
      }
    ]
  },
  {
    "id": "comfort-snack",
    "prompt": "Which comfort-snack category would your partner protect at all costs?",
    "options": [
      {
        "id": "salty",
        "label": "Salty and crunchy"
      },
      {
        "id": "sweet",
        "label": "Soft and sweet"
      },
      {
        "id": "cheese",
        "label": "Anything with cheese"
      },
      {
        "id": "nostalgia",
        "label": "Childhood nostalgia"
      }
    ]
  },
  {
    "id": "compliment",
    "prompt": "Which compliment lands deepest for your partner right now?",
    "options": [
      {
        "id": "seen",
        "label": "You really see me"
      },
      {
        "id": "proud",
        "label": "I am proud of you"
      },
      {
        "id": "safe",
        "label": "I feel safe with you"
      },
      {
        "id": "wanted",
        "label": "I still choose you"
      }
    ]
  },
  {
    "id": "night-rainy-date",
    "options": [
      {
        "id": "a",
        "label": "A blanket and a film"
      },
      {
        "id": "b",
        "label": "Baking something"
      },
      {
        "id": "c",
        "label": "A museum wander"
      },
      {
        "id": "d",
        "label": "A puddle-filled walk"
      }
    ],
    "prompt": "A rainy afternoon together calls for…"
  },
  {
    "id": "night-surprise-hour",
    "options": [
      {
        "id": "a",
        "label": "Talking with no phones"
      },
      {
        "id": "b",
        "label": "Getting coffee"
      },
      {
        "id": "c",
        "label": "Taking a nap"
      },
      {
        "id": "d",
        "label": "Going somewhere new"
      }
    ],
    "prompt": "An unexpected hour together is best spent…"
  },
  {
    "id": "night-tiny-holiday",
    "options": [
      {
        "id": "a",
        "label": "Our first hello"
      },
      {
        "id": "b",
        "label": "Our best inside joke"
      },
      {
        "id": "c",
        "label": "Doing nothing together"
      },
      {
        "id": "d",
        "label": "Our favorite meal"
      }
    ],
    "prompt": "A made-up holiday for us should celebrate…"
  },
  {
    "id": "night-road-seat",
    "options": [
      {
        "id": "a",
        "label": "Driver"
      },
      {
        "id": "b",
        "label": "DJ"
      },
      {
        "id": "c",
        "label": "Snack manager"
      },
      {
        "id": "d",
        "label": "Scenery commentator"
      }
    ],
    "prompt": "On a road trip, my dream role is…"
  },
  {
    "id": "night-lost-map",
    "options": [
      {
        "id": "a",
        "label": "Find a café first"
      },
      {
        "id": "b",
        "label": "Ask a local"
      },
      {
        "id": "c",
        "label": "Open the map"
      },
      {
        "id": "d",
        "label": "Call it an adventure"
      }
    ],
    "prompt": "If we got lost in a new city, I would…"
  },
  {
    "id": "night-souvenir",
    "options": [
      {
        "id": "a",
        "label": "A postcard"
      },
      {
        "id": "b",
        "label": "A ridiculous photo"
      },
      {
        "id": "c",
        "label": "A small local treasure"
      },
      {
        "id": "d",
        "label": "The ticket stub"
      }
    ],
    "prompt": "The souvenir I would keep is…"
  },
  {
    "id": "night-night-sound",
    "options": [
      {
        "id": "a",
        "label": "Rain"
      },
      {
        "id": "b",
        "label": "A familiar playlist"
      },
      {
        "id": "c",
        "label": "A crackling fire"
      },
      {
        "id": "d",
        "label": "Comfortable silence"
      }
    ],
    "prompt": "The nicest background sound for a quiet night is…"
  },
  {
    "id": "night-breakfast",
    "options": [
      {
        "id": "a",
        "label": "Coffee and toast"
      },
      {
        "id": "b",
        "label": "Something sweet"
      },
      {
        "id": "c",
        "label": "Eggs and all the extras"
      },
      {
        "id": "d",
        "label": "Whatever you made"
      }
    ],
    "prompt": "Breakfast brought to me should include…"
  },
  {
    "id": "night-little-help",
    "options": [
      {
        "id": "a",
        "label": "A hug"
      },
      {
        "id": "b",
        "label": "A practical offer"
      },
      {
        "id": "c",
        "label": "Listening"
      },
      {
        "id": "d",
        "label": "A little space"
      }
    ],
    "prompt": "When I feel overwhelmed, start with…"
  },
  {
    "id": "night-good-news",
    "options": [
      {
        "id": "a",
        "label": "An excited call"
      },
      {
        "id": "b",
        "label": "A big hug"
      },
      {
        "id": "c",
        "label": "A tiny celebration"
      },
      {
        "id": "d",
        "label": "Time to tell the whole story"
      }
    ],
    "prompt": "When I have good news, I want…"
  },
  {
    "id": "night-surprise-kind",
    "options": [
      {
        "id": "a",
        "label": "A thoughtful note"
      },
      {
        "id": "b",
        "label": "A planned outing"
      },
      {
        "id": "c",
        "label": "A favorite snack"
      },
      {
        "id": "d",
        "label": "A chore already done"
      }
    ],
    "prompt": "My favorite kind of surprise is…"
  },
  {
    "id": "night-home-detail",
    "options": [
      {
        "id": "a",
        "label": "Warm lighting"
      },
      {
        "id": "b",
        "label": "Familiar smells"
      },
      {
        "id": "c",
        "label": "Photos"
      },
      {
        "id": "d",
        "label": "Someone waiting for me"
      }
    ],
    "prompt": "The detail that makes a place feel like home is…"
  },
  {
    "id": "night-garden",
    "options": [
      {
        "id": "a",
        "label": "Herbs"
      },
      {
        "id": "b",
        "label": "Wildflowers"
      },
      {
        "id": "c",
        "label": "Tomatoes"
      },
      {
        "id": "d",
        "label": "A slightly dramatic houseplant"
      }
    ],
    "prompt": "If we grew something together, I would pick…"
  },
  {
    "id": "night-silly-trophy",
    "options": [
      {
        "id": "a",
        "label": "Excellent snack decisions"
      },
      {
        "id": "b",
        "label": "Turning errands into dates"
      },
      {
        "id": "c",
        "label": "Impressive teamwork"
      },
      {
        "id": "d",
        "label": "Unnecessary laughter"
      }
    ],
    "prompt": "Our couple trophy should reward…"
  },
  {
    "id": "night-mystery-box",
    "options": [
      {
        "id": "a",
        "label": "A letter"
      },
      {
        "id": "b",
        "label": "A tiny gadget"
      },
      {
        "id": "c",
        "label": "Art supplies"
      },
      {
        "id": "d",
        "label": "A map to somewhere"
      }
    ],
    "prompt": "I would open a mystery box hoping for…"
  },
  {
    "id": "night-couple-show",
    "options": [
      {
        "id": "a",
        "label": "A cozy sitcom"
      },
      {
        "id": "b",
        "label": "A travel series"
      },
      {
        "id": "c",
        "label": "A cooking disaster"
      },
      {
        "id": "d",
        "label": "A very gentle mystery"
      }
    ],
    "prompt": "Our imaginary TV show would be…"
  },
  {
    "id": "night-picnic",
    "options": [
      {
        "id": "a",
        "label": "The good blanket"
      },
      {
        "id": "b",
        "label": "Excellent food"
      },
      {
        "id": "c",
        "label": "A great view"
      },
      {
        "id": "d",
        "label": "A backup plan for ants"
      }
    ],
    "prompt": "The most important picnic item is…"
  },
  {
    "id": "night-dance",
    "options": [
      {
        "id": "a",
        "label": "Dance a little"
      },
      {
        "id": "b",
        "label": "Give you a look"
      },
      {
        "id": "c",
        "label": "Sing quietly"
      },
      {
        "id": "d",
        "label": "Wait until we get outside"
      }
    ],
    "prompt": "If our song came on in a shop, I would…"
  },
  {
    "id": "night-museum",
    "options": [
      {
        "id": "a",
        "label": "Our first adventure"
      },
      {
        "id": "b",
        "label": "Our strangest meal"
      },
      {
        "id": "c",
        "label": "An ordinary perfect day"
      },
      {
        "id": "d",
        "label": "Our running jokes"
      }
    ],
    "prompt": "Our tiny museum needs an exhibit about…"
  },
  {
    "id": "night-week-reset",
    "options": [
      {
        "id": "a",
        "label": "A tidy space"
      },
      {
        "id": "b",
        "label": "A shared plan"
      },
      {
        "id": "c",
        "label": "A slow breakfast"
      },
      {
        "id": "d",
        "label": "Something fun to anticipate"
      }
    ],
    "prompt": "A fresh start to the week means…"
  },
  {
    "id": "night-future-home",
    "options": [
      {
        "id": "a",
        "label": "A reading nook"
      },
      {
        "id": "b",
        "label": "A big kitchen"
      },
      {
        "id": "c",
        "label": "A garden"
      },
      {
        "id": "d",
        "label": "A room for making things"
      }
    ],
    "prompt": "Our imaginary dream home needs…"
  },
  {
    "id": "night-pet-name",
    "options": [
      {
        "id": "a",
        "label": "A food"
      },
      {
        "id": "b",
        "label": "A grand historical figure"
      },
      {
        "id": "c",
        "label": "A favorite character"
      },
      {
        "id": "d",
        "label": "A completely ordinary person"
      }
    ],
    "prompt": "Our imaginary pet should be named after…"
  },
  {
    "id": "night-team-power",
    "options": [
      {
        "id": "a",
        "label": "Teleporting together"
      },
      {
        "id": "b",
        "label": "Perfect snack timing"
      },
      {
        "id": "c",
        "label": "Finding lost things"
      },
      {
        "id": "d",
        "label": "Pausing busy days"
      }
    ],
    "prompt": "Our shared superpower should be…"
  },
  {
    "id": "night-tiny-adventure",
    "options": [
      {
        "id": "a",
        "label": "A mystery train stop"
      },
      {
        "id": "b",
        "label": "A new walking trail"
      },
      {
        "id": "c",
        "label": "An unfamiliar restaurant"
      },
      {
        "id": "d",
        "label": "A sunrise outing"
      }
    ],
    "prompt": "A small adventure I would say yes to is…"
  },
  {
    "id": "night-gift-wrap",
    "options": [
      {
        "id": "a",
        "label": "It recalls something I said"
      },
      {
        "id": "b",
        "label": "You made it"
      },
      {
        "id": "c",
        "label": "It gives us time together"
      },
      {
        "id": "d",
        "label": "It makes daily life easier"
      }
    ],
    "prompt": "A gift feels most thoughtful when…"
  },
  {
    "id": "night-photo-style",
    "options": [
      {
        "id": "a",
        "label": "Laughing mid-sentence"
      },
      {
        "id": "b",
        "label": "Somewhere beautiful"
      },
      {
        "id": "c",
        "label": "A slightly blurry candid"
      },
      {
        "id": "d",
        "label": "An ordinary day at home"
      }
    ],
    "prompt": "My favorite photo of us would be…"
  },
  {
    "id": "night-quiet-company",
    "options": [
      {
        "id": "a",
        "label": "Read side by side"
      },
      {
        "id": "b",
        "label": "Cook without rushing"
      },
      {
        "id": "c",
        "label": "Watch the sky"
      },
      {
        "id": "d",
        "label": "Work on separate hobbies"
      }
    ],
    "prompt": "Quiet company feels best when we…"
  },
  {
    "id": "night-first-stop",
    "options": [
      {
        "id": "a",
        "label": "The food"
      },
      {
        "id": "b",
        "label": "The games"
      },
      {
        "id": "c",
        "label": "The biggest ride"
      },
      {
        "id": "d",
        "label": "The animals"
      }
    ],
    "prompt": "At a fair, I would head straight for…"
  },
  {
    "id": "night-dream-class",
    "options": [
      {
        "id": "a",
        "label": "Pottery"
      },
      {
        "id": "b",
        "label": "Cooking"
      },
      {
        "id": "c",
        "label": "Dancing"
      },
      {
        "id": "d",
        "label": "Something unexpectedly niche"
      }
    ],
    "prompt": "A class I would take with you is…"
  },
  {
    "id": "night-time-capsule",
    "options": [
      {
        "id": "a",
        "label": "A letter"
      },
      {
        "id": "b",
        "label": "A playlist"
      },
      {
        "id": "c",
        "label": "A photo"
      },
      {
        "id": "d",
        "label": "A very specific inside joke"
      }
    ],
    "prompt": "Our time capsule should include…"
  },
  {
    "id": "night-comfort-color",
    "options": [
      {
        "id": "a",
        "label": "Warm and golden"
      },
      {
        "id": "b",
        "label": "Cool and blue"
      },
      {
        "id": "c",
        "label": "Soft and green"
      },
      {
        "id": "d",
        "label": "Bright and airy"
      }
    ],
    "prompt": "A room that helps me relax would feel…"
  },
  {
    "id": "night-staycation",
    "options": [
      {
        "id": "a",
        "label": "No alarm"
      },
      {
        "id": "b",
        "label": "Room-service-style breakfast"
      },
      {
        "id": "c",
        "label": "Exploring our own town"
      },
      {
        "id": "d",
        "label": "Ignoring the to-do list"
      }
    ],
    "prompt": "The best part of a staycation is…"
  },
  {
    "id": "night-secret-talent",
    "options": [
      {
        "id": "a",
        "label": "A duet"
      },
      {
        "id": "b",
        "label": "Card tricks"
      },
      {
        "id": "c",
        "label": "Elaborate pancake art"
      },
      {
        "id": "d",
        "label": "A synchronized entrance"
      }
    ],
    "prompt": "A silly talent I would like us to master is…"
  },
  {
    "id": "night-walk-choice",
    "options": [
      {
        "id": "a",
        "label": "Water"
      },
      {
        "id": "b",
        "label": "A garden"
      },
      {
        "id": "c",
        "label": "An interesting street"
      },
      {
        "id": "d",
        "label": "A place to sit"
      }
    ],
    "prompt": "On a walk, I would rather find…"
  },
  {
    "id": "night-reunion",
    "options": [
      {
        "id": "a",
        "label": "A long hug"
      },
      {
        "id": "b",
        "label": "Telling every little story"
      },
      {
        "id": "c",
        "label": "Food together"
      },
      {
        "id": "d",
        "label": "Settling in quietly"
      }
    ],
    "prompt": "After time apart, my ideal first moment is…"
  },
  {
    "id": "night-small-tradition",
    "options": [
      {
        "id": "a",
        "label": "A shared breakfast"
      },
      {
        "id": "b",
        "label": "A walk"
      },
      {
        "id": "c",
        "label": "A game night"
      },
      {
        "id": "d",
        "label": "Trying a new recipe"
      }
    ],
    "prompt": "A weekly tradition I would enjoy is…"
  },
  {
    "id": "night-movie-role",
    "options": [
      {
        "id": "a",
        "label": "The planner"
      },
      {
        "id": "b",
        "label": "The brave improviser"
      },
      {
        "id": "c",
        "label": "The comic relief"
      },
      {
        "id": "d",
        "label": "The one with the supplies"
      }
    ],
    "prompt": "In an adventure movie, I would be…"
  },
  {
    "id": "night-winter-date",
    "options": [
      {
        "id": "a",
        "label": "Hot drinks"
      },
      {
        "id": "b",
        "label": "A snowy walk"
      },
      {
        "id": "c",
        "label": "A warm kitchen"
      },
      {
        "id": "d",
        "label": "A blanket fortress"
      }
    ],
    "prompt": "A cold-weather date should involve…"
  },
  {
    "id": "night-summer-date",
    "options": [
      {
        "id": "a",
        "label": "A sunset"
      },
      {
        "id": "b",
        "label": "Ice cream"
      },
      {
        "id": "c",
        "label": "An outdoor concert"
      },
      {
        "id": "d",
        "label": "A quiet porch"
      }
    ],
    "prompt": "A summer evening together needs…"
  },
  {
    "id": "night-one-day-off",
    "options": [
      {
        "id": "a",
        "label": "Making decisions"
      },
      {
        "id": "b",
        "label": "Cooking"
      },
      {
        "id": "c",
        "label": "Tidying"
      },
      {
        "id": "d",
        "label": "Watching the clock"
      }
    ],
    "prompt": "One responsibility I would love a day off from is…"
  },
  {
    "id": "night-message",
    "options": [
      {
        "id": "a",
        "label": "I am proud of you"
      },
      {
        "id": "b",
        "label": "I saved you some"
      },
      {
        "id": "c",
        "label": "Want to go somewhere?"
      },
      {
        "id": "d",
        "label": "No rush, take your time"
      }
    ],
    "prompt": "The message I would love to get today is…"
  },
  {
    "id": "night-dream-shop",
    "options": [
      {
        "id": "a",
        "label": "Books and tea"
      },
      {
        "id": "b",
        "label": "Odd little treasures"
      },
      {
        "id": "c",
        "label": "Plants"
      },
      {
        "id": "d",
        "label": "Desserts"
      }
    ],
    "prompt": "Our imaginary shop would sell…"
  },
  {
    "id": "night-treasure",
    "options": [
      {
        "id": "a",
        "label": "A personal letter"
      },
      {
        "id": "b",
        "label": "A picnic"
      },
      {
        "id": "c",
        "label": "An unexpected view"
      },
      {
        "id": "d",
        "label": "A wonderfully silly prize"
      }
    ],
    "prompt": "The best treasure hunt would end with…"
  },
  {
    "id": "night-learning-us",
    "options": [
      {
        "id": "a",
        "label": "A childhood favorite"
      },
      {
        "id": "b",
        "label": "A quiet ambition"
      },
      {
        "id": "c",
        "label": "A surprising opinion"
      },
      {
        "id": "d",
        "label": "Your ideal ordinary day"
      }
    ],
    "prompt": "Something I would enjoy learning about you is…"
  },
  {
    "id": "night-spare-room",
    "options": [
      {
        "id": "a",
        "label": "A creative studio"
      },
      {
        "id": "b",
        "label": "A game room"
      },
      {
        "id": "c",
        "label": "A library"
      },
      {
        "id": "d",
        "label": "A peaceful retreat"
      }
    ],
    "prompt": "A spare room for us would become…"
  },
  {
    "id": "night-wrong-turn",
    "options": [
      {
        "id": "a",
        "label": "A bakery"
      },
      {
        "id": "b",
        "label": "A beautiful overlook"
      },
      {
        "id": "c",
        "label": "A festival"
      },
      {
        "id": "d",
        "label": "A tiny bookstore"
      }
    ],
    "prompt": "The best accidental detour would lead to…"
  },
  {
    "id": "night-party-exit",
    "options": [
      {
        "id": "a",
        "label": "Early, with snacks"
      },
      {
        "id": "b",
        "label": "After one last conversation"
      },
      {
        "id": "c",
        "label": "When the music ends"
      },
      {
        "id": "d",
        "label": "A perfectly timed shared glance"
      }
    ],
    "prompt": "Our ideal party exit is…"
  },
  {
    "id": "night-little-luxury",
    "options": [
      {
        "id": "a",
        "label": "Fresh sheets"
      },
      {
        "id": "b",
        "label": "A really good drink"
      },
      {
        "id": "c",
        "label": "Uninterrupted hobby time"
      },
      {
        "id": "d",
        "label": "A meal I did not plan"
      }
    ],
    "prompt": "The little luxury I would choose today is…"
  },
  {
    "id": "night-week-keepsake",
    "options": [
      {
        "id": "a",
        "label": "A photo"
      },
      {
        "id": "b",
        "label": "A funny quote"
      },
      {
        "id": "c",
        "label": "A song"
      },
      {
        "id": "d",
        "label": "One quiet moment"
      }
    ],
    "prompt": "I would remember this week through…"
  },
  {
    "id": "night-shared-quest",
    "options": [
      {
        "id": "a",
        "label": "Find the best local pastry"
      },
      {
        "id": "b",
        "label": "Learn one new game"
      },
      {
        "id": "c",
        "label": "Visit somewhere nearby"
      },
      {
        "id": "d",
        "label": "Make something by hand"
      }
    ],
    "prompt": "Our next tiny shared quest should be…"
  }
]
```

### `VAULT_PROMPTS` (20 entries)

```json
[
  {
    "id": "secret-compliment",
    "prompt": "Seal one compliment you want your partner to discover at the finale."
  },
  {
    "id": "quiet-wish",
    "prompt": "Seal one small wish for the two of you in the coming month."
  },
  {
    "id": "memory-light",
    "prompt": "Seal a memory that still lights up when you think about it."
  },
  {
    "id": "future-thank-you",
    "prompt": "Write a thank-you note to the version of your partner who reaches the finale."
  },
  {
    "id": "vault-extra-1",
    "prompt": "Leave your partner one sentence to open after a difficult day."
  },
  {
    "id": "vault-extra-2",
    "prompt": "Save one ordinary moment from today that you want to remember."
  },
  {
    "id": "vault-extra-3",
    "prompt": "Write a small adventure you hope to share before this season ends."
  },
  {
    "id": "vault-extra-4",
    "prompt": "Name something your partner does that makes your life gentler."
  },
  {
    "id": "vault-extra-5",
    "prompt": "Write a promise small enough to keep this week."
  },
  {
    "id": "vault-extra-6",
    "prompt": "Save the compliment you almost said out loud today."
  },
  {
    "id": "vault-extra-7",
    "prompt": "Describe a future ordinary Tuesday you would love to share."
  },
  {
    "id": "vault-extra-8",
    "prompt": "Leave a note for the next time you miss each other."
  },
  {
    "id": "vault-extra-9",
    "prompt": "Write one thing you hope the two of you never outgrow."
  },
  {
    "id": "vault-extra-10",
    "prompt": "Save a thank-you for an effort your partner might think went unnoticed."
  },
  {
    "id": "vault-extra-11",
    "prompt": "Name one thing you are looking forward to doing together again."
  },
  {
    "id": "vault-extra-12",
    "prompt": "Write the title of a chapter you hope comes next for you both."
  },
  {
    "id": "vault-extra-13",
    "prompt": "Leave a reminder of something you already handled well together."
  },
  {
    "id": "vault-extra-14",
    "prompt": "Write one question you would love to ask on your next date."
  },
  {
    "id": "vault-extra-15",
    "prompt": "Save one little ritual you would like to bring back."
  },
  {
    "id": "vault-extra-16",
    "prompt": "Describe the place you would take your partner for one peaceful hour."
  }
]
```


## Sealed activities

Source: `src/features/session/sealedActivityData.js`.

### `MIND_MELD_PROMPTS` (58 entries)

```json
[
  "If we had a surprise free Saturday, where would we end up?",
  "What snack is the other person craving right now?",
  "What movie would we both happily rewatch tonight?",
  "Where was our best kiss so far?",
  "If we won a weekend trip anywhere, where are we going?",
  "What song instantly reminds you of us?",
  "Describe our perfect lazy Sunday in five words.",
  "What small thing did your partner do lately that you loved?",
  "A rainy afternoon together calls for…",
  "An unexpected hour together is best spent…",
  "A made-up holiday for us should celebrate…",
  "On a road trip, my dream role is…",
  "If we got lost in a new city, I would…",
  "The souvenir I would keep is…",
  "The nicest background sound for a quiet night is…",
  "Breakfast brought to me should include…",
  "When I feel overwhelmed, start with…",
  "When I have good news, I want…",
  "My favorite kind of surprise is…",
  "The detail that makes a place feel like home is…",
  "If we grew something together, I would pick…",
  "Our couple trophy should reward…",
  "I would open a mystery box hoping for…",
  "Our imaginary TV show would be…",
  "The most important picnic item is…",
  "If our song came on in a shop, I would…",
  "Our tiny museum needs an exhibit about…",
  "A fresh start to the week means…",
  "Our imaginary dream home needs…",
  "Our imaginary pet should be named after…",
  "Our shared superpower should be…",
  "A small adventure I would say yes to is…",
  "A gift feels most thoughtful when…",
  "My favorite photo of us would be…",
  "Quiet company feels best when we…",
  "At a fair, I would head straight for…",
  "A class I would take with you is…",
  "Our time capsule should include…",
  "A room that helps me relax would feel…",
  "The best part of a staycation is…",
  "A silly talent I would like us to master is…",
  "On a walk, I would rather find…",
  "After time apart, my ideal first moment is…",
  "A weekly tradition I would enjoy is…",
  "In an adventure movie, I would be…",
  "A cold-weather date should involve…",
  "A summer evening together needs…",
  "One responsibility I would love a day off from is…",
  "The message I would love to get today is…",
  "Our imaginary shop would sell…",
  "The best treasure hunt would end with…",
  "Something I would enjoy learning about you is…",
  "A spare room for us would become…",
  "The best accidental detour would lead to…",
  "Our ideal party exit is…",
  "The little luxury I would choose today is…",
  "I would remember this week through…",
  "Our next tiny shared quest should be…"
]
```

### `MUTUAL_YES_PROMPTS` (20 entries)

```json
[
  "A slow dance in the kitchen — no music needed?",
  "Breakfast in bed this weekend, with your partner picking the menu?",
  "A completely phone-free evening, just the two of us?",
  "A surprise date, planned entirely in secret by your partner?",
  "Sleeping in tomorrow and letting the world wait?",
  "Recreating our first date, as close as we can get it?",
  "A candlelit bath for two tonight?",
  "Finally trying that adventure we keep talking about?",
  "A short walk with no destination and no phones?",
  "Trading one favorite childhood song tonight?",
  "Making dessert together this week?",
  "A quiet hour with separate books and shared company?",
  "Picking a new café to try together?",
  "A sunset picnic, even if it is on the living-room floor?",
  "Learning one simple dance together?",
  "Writing each other a tiny note for tomorrow?",
  "An evening where neither of us has to make a plan?",
  "Making a playlist for our next trip?",
  "Looking through a few old photos together?",
  "A slow, comfortable hug before the night ends?"
]
```

### `SEALED_ACTIVITY_DEFINITIONS` (2 entries)

```json
[
  {
    "description": "Answer the same question separately — sealed. Then reveal together and call it: did your minds meld?",
    "id": "same-wavelength",
    "intensity": 2,
    "label": "Same Wavelength",
    "savesToJournal": true,
    "skippable": true,
    "type": "prediction",
    "vibe": "playful"
  },
  {
    "description": "A double-blind desire card. Both answer sealed — only a mutual yes ever sees the light.",
    "id": "mutual-yes",
    "intensity": 3,
    "label": "Mutual Yes",
    "savesToJournal": true,
    "skippable": true,
    "type": "mutual-yes",
    "vibe": "spicy"
  }
]
```


## Wave two prompts and puzzles

Source: `src/features/session/waveTwoGameData.js`.

### `VIBE_CHECK_PROMPTS` (20 entries)

```json
[
  {
    "id": "date-budget",
    "prompt": "A perfect date needs…",
    "leftLabel": "Almost no money",
    "rightLabel": "A little splurge"
  },
  {
    "id": "surprise-level",
    "prompt": "How much surprise sounds good tonight?",
    "leftLabel": "Tell me the plan",
    "rightLabel": "Keep it a mystery"
  },
  {
    "id": "morning-pace",
    "prompt": "Our ideal morning pace is…",
    "leftLabel": "Up and out",
    "rightLabel": "Slow and sleepy"
  },
  {
    "id": "weekend-map",
    "prompt": "Our next weekend should feel…",
    "leftLabel": "Familiar and cozy",
    "rightLabel": "New and adventurous"
  },
  {
    "id": "gift-scale",
    "prompt": "The nicest gift would be…",
    "leftLabel": "A tiny thoughtful thing",
    "rightLabel": "A grand shared experience"
  },
  {
    "id": "party-size",
    "prompt": "The gathering I want right now is…",
    "leftLabel": "Just us",
    "rightLabel": "Everyone we love"
  },
  {
    "id": "food-adventure",
    "prompt": "Tonight’s menu should be…",
    "leftLabel": "Our reliable favorite",
    "rightLabel": "Something neither of us tried"
  },
  {
    "id": "planning-style",
    "prompt": "Planning our next outing should be…",
    "leftLabel": "A careful itinerary",
    "rightLabel": "A vague direction"
  },
  {
    "id": "energy-reset",
    "prompt": "The best reset for today is…",
    "leftLabel": "Stillness",
    "rightLabel": "Movement"
  },
  {
    "id": "memory-style",
    "prompt": "I remember our adventures through…",
    "leftLabel": "Tiny details",
    "rightLabel": "The overall feeling"
  },
  {
    "id": "home-sound",
    "prompt": "The home atmosphere I want is…",
    "leftLabel": "Peacefully quiet",
    "rightLabel": "Music and chatter"
  },
  {
    "id": "date-duration",
    "prompt": "Our next date should be…",
    "leftLabel": "A tiny escape",
    "rightLabel": "A whole day"
  },
  {
    "id": "learning-style",
    "prompt": "Learning something together sounds best as…",
    "leftLabel": "Following instructions",
    "rightLabel": "Experimenting freely"
  },
  {
    "id": "movie-choice",
    "prompt": "Tonight’s movie should be…",
    "leftLabel": "Comfort rewatch",
    "rightLabel": "A complete surprise"
  },
  {
    "id": "talk-depth",
    "prompt": "A conversation I have energy for is…",
    "leftLabel": "Light and easy",
    "rightLabel": "Deep and thoughtful"
  },
  {
    "id": "weekend-energy",
    "leftLabel": "Plan every detail",
    "prompt": "What makes a shared weekend feel best right now?",
    "rightLabel": "Follow the mood"
  },
  {
    "id": "social-battery",
    "leftLabel": "Stay in together",
    "prompt": "Where is your shared social battery tonight?",
    "rightLabel": "Work the room"
  },
  {
    "id": "affection-style",
    "leftLabel": "Quiet gestures",
    "prompt": "How do you most want affection to show up this week?",
    "rightLabel": "Big declarations"
  },
  {
    "id": "adventure-setting",
    "leftLabel": "Comfort zone",
    "prompt": "How adventurous should your next date feel?",
    "rightLabel": "Thrill seeker"
  },
  {
    "id": "conversation-mode",
    "leftLabel": "Soft and reflective",
    "prompt": "What kind of conversation sounds best tonight?",
    "rightLabel": "Silly and chaotic"
  }
]
```

### `TEMPO_TAP_ROUNDS` (8 entries)

```json
[
  {
    "id": "porch-swing",
    "label": "Porch swing",
    "targetIntervalMs": 1100,
    "prompt": "Follow this pulse for five unhurried taps."
  },
  {
    "id": "gentle-rain",
    "label": "Gentle rain",
    "targetIntervalMs": 760,
    "prompt": "Follow this pulse for five unhurried taps."
  },
  {
    "id": "walking-home",
    "label": "Walking home",
    "targetIntervalMs": 960,
    "prompt": "Follow this pulse for five unhurried taps."
  },
  {
    "id": "kitchen-waltz",
    "label": "Kitchen waltz",
    "targetIntervalMs": 850,
    "prompt": "Follow this pulse for five unhurried taps."
  },
  {
    "id": "slow-heartbeat",
    "label": "Slow heartbeat",
    "targetIntervalMs": 1200,
    "prompt": "Follow this pulse for five unhurried taps."
  },
  {
    "id": "easy-pulse",
    "label": "Easy pulse",
    "prompt": "Find the calm beat and keep it steady for five taps.",
    "targetIntervalMs": 800
  },
  {
    "id": "slow-dance",
    "label": "Slow dance",
    "prompt": "Hold a slow, close rhythm for five taps.",
    "targetIntervalMs": 920
  },
  {
    "id": "bright-spark",
    "label": "Bright spark",
    "prompt": "Catch the quick pulse without rushing it.",
    "targetIntervalMs": 680
  }
]
```

### `WORD_WEAVER_PUZZLES` (6 entries)

```json
[
  {
    "allowedWords": [
      "art",
      "arts",
      "ear",
      "earth",
      "east",
      "eat",
      "hare",
      "has",
      "hat",
      "hear",
      "heart",
      "hearts",
      "heat",
      "her",
      "rat",
      "rate",
      "rest",
      "sat",
      "sea",
      "seat",
      "set",
      "share",
      "she",
      "star",
      "tare",
      "tea",
      "tear",
      "tears"
    ],
    "id": "hearts",
    "letters": [
      "H",
      "E",
      "A",
      "R",
      "T",
      "S"
    ],
    "prompt": "Weave as many words as you can from the same six letters."
  },
  {
    "allowedWords": [
      "dear",
      "dare",
      "date",
      "deal",
      "ear",
      "eat",
      "late",
      "lead",
      "read",
      "real",
      "red",
      "tale",
      "tea",
      "teal",
      "trade",
      "tread"
    ],
    "id": "related",
    "letters": [
      "R",
      "E",
      "L",
      "A",
      "T",
      "D"
    ],
    "prompt": "Turn this shared tray into a tiny love-letter dictionary."
  },
  {
    "allowedWords": [
      "calm",
      "came",
      "clan",
      "clean",
      "lace",
      "lane",
      "lean",
      "male",
      "meal",
      "mean",
      "name",
      "once",
      "one",
      "ocean"
    ],
    "id": "ocean",
    "letters": [
      "O",
      "C",
      "E",
      "A",
      "N",
      "L",
      "M"
    ],
    "prompt": "Make something surprising from this calm little letter tray."
  },
  {
    "id": "listen",
    "letters": [
      "L",
      "I",
      "S",
      "T",
      "E",
      "N"
    ],
    "prompt": "Find the words tucked inside LISTEN.",
    "allowedWords": [
      "listen",
      "silent",
      "enlist",
      "inlets",
      "tinsel",
      "inlet",
      "stein",
      "islet",
      "lines",
      "line",
      "list",
      "lens",
      "lent",
      "nest",
      "net",
      "nets",
      "nit",
      "nits",
      "sit",
      "set",
      "sin",
      "tie",
      "ties",
      "tin",
      "tins",
      "ten",
      "tens",
      "tile",
      "tiles",
      "lie",
      "lies",
      "lit",
      "let",
      "lets",
      "sent"
    ]
  },
  {
    "id": "smiles",
    "letters": [
      "S",
      "M",
      "I",
      "L",
      "E",
      "S"
    ],
    "prompt": "Turn a tray of SMILES into a shared dictionary.",
    "allowedWords": [
      "smiles",
      "smile",
      "slime",
      "slimes",
      "miles",
      "mile",
      "lime",
      "limes",
      "slim",
      "slims",
      "semi",
      "elm",
      "elms",
      "isle",
      "isles",
      "lie",
      "lies",
      "less",
      "mess",
      "miss"
    ]
  },
  {
    "id": "garden",
    "letters": [
      "G",
      "A",
      "R",
      "D",
      "E",
      "N"
    ],
    "prompt": "Grow a few words from this little GARDEN.",
    "allowedWords": [
      "garden",
      "danger",
      "ranged",
      "range",
      "anger",
      "grade",
      "grand",
      "dear",
      "dare",
      "read",
      "gear",
      "rage",
      "near",
      "earn",
      "aged",
      "age",
      "and",
      "are",
      "ear",
      "era",
      "den",
      "end",
      "red",
      "rag",
      "ran",
      "nag",
      "drag",
      "dean"
    ]
  }
]
```

### `WAVE_TWO_ACTIVITY_DEFINITIONS` (3 entries)

```json
[
  {
    "description": "Place two secret markers on the same continuum and reveal the distance.",
    "durationSec": 50,
    "id": "vibe-check",
    "intensity": 1,
    "label": "Vibe Check",
    "prompt": "A perfect date needs…",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "slider",
      "sync",
      "featured"
    ],
    "title": "Vibe Check",
    "type": "vibe-sync",
    "vibe": "playful"
  },
  {
    "description": "Tap a five-beat pulse, then compare how steadily you both held the rhythm.",
    "durationSec": 45,
    "id": "tempo-tap",
    "intensity": 1,
    "label": "Tempo Tap",
    "prompt": "Follow this pulse for five unhurried taps.",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "rhythm",
      "timing",
      "featured"
    ],
    "title": "Tempo Tap",
    "type": "tempo",
    "vibe": "playful"
  },
  {
    "description": "Race the same letter tray and save the words only each of you found.",
    "durationSec": 75,
    "id": "word-weaver",
    "intensity": 1,
    "label": "Word Weaver",
    "prompt": "Weave as many words as you can from the same six letters.",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "word",
      "timed",
      "featured"
    ],
    "title": "Word Weaver",
    "type": "word",
    "vibe": "playful"
  }
]
```


## Wave three prompts and layouts

Source: `src/features/session/waveThreeGameData.js`.

### `DUAL_AXIS_MAZES` (2 entries)

```json
[
  {
    "goal": {
      "x": 4,
      "y": 0
    },
    "height": 5,
    "id": "garden-path",
    "label": "Garden path",
    "obstacles": [
      {
        "x": 0,
        "y": 3
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 1,
        "y": 2
      },
      {
        "x": 3,
        "y": 3
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 4,
        "y": 2
      },
      {
        "x": 3,
        "y": 0
      }
    ],
    "prompt": "Guide the pearl from the garden gate to the moonlit table.",
    "start": {
      "x": 0,
      "y": 4
    },
    "width": 5
  },
  {
    "goal": {
      "x": 0,
      "y": 0
    },
    "height": 5,
    "id": "candle-route",
    "label": "Candle route",
    "obstacles": [
      {
        "x": 4,
        "y": 3
      },
      {
        "x": 2,
        "y": 4
      },
      {
        "x": 3,
        "y": 2
      },
      {
        "x": 1,
        "y": 3
      },
      {
        "x": 2,
        "y": 1
      },
      {
        "x": 0,
        "y": 2
      },
      {
        "x": 1,
        "y": 0
      }
    ],
    "prompt": "Pass the little flame through the room without touching the keepsakes.",
    "start": {
      "x": 4,
      "y": 4
    },
    "width": 5
  }
]
```

### `BLIND_CANVAS_PROMPTS` (22 entries)

```json
[
  {
    "id": "canvas-extra-1",
    "prompt": "Our dream breakfast café"
  },
  {
    "id": "canvas-extra-2",
    "prompt": "A spaceship built for two"
  },
  {
    "id": "canvas-extra-3",
    "prompt": "A tiny home for our imaginary pet"
  },
  {
    "id": "canvas-extra-4",
    "prompt": "The world’s least practical picnic"
  },
  {
    "id": "canvas-extra-5",
    "prompt": "A treehouse with everything we need"
  },
  {
    "id": "canvas-extra-6",
    "prompt": "Our relationship as a friendly monster"
  },
  {
    "id": "canvas-extra-7",
    "prompt": "A garden on the moon"
  },
  {
    "id": "canvas-extra-8",
    "prompt": "A bakery run by woodland creatures"
  },
  {
    "id": "canvas-extra-9",
    "prompt": "A postcard from our imaginary island"
  },
  {
    "id": "canvas-extra-10",
    "prompt": "Our very own carnival ride"
  },
  {
    "id": "canvas-extra-11",
    "prompt": "A rainy-day blanket fortress"
  },
  {
    "id": "canvas-extra-12",
    "prompt": "A trophy for our best inside joke"
  },
  {
    "id": "canvas-extra-13",
    "prompt": "A food truck with our names on it"
  },
  {
    "id": "canvas-extra-14",
    "prompt": "A lighthouse for lost socks"
  },
  {
    "id": "canvas-extra-15",
    "prompt": "A map of a perfect lazy Sunday"
  },
  {
    "id": "canvas-extra-16",
    "prompt": "Our secret headquarters"
  },
  {
    "id": "canvas-extra-17",
    "prompt": "A robot that plans dates"
  },
  {
    "id": "canvas-extra-18",
    "prompt": "A tiny train carrying our favorite snacks"
  },
  {
    "id": "cozy-cabin",
    "prompt": "A cozy cabin in the woods"
  },
  {
    "id": "dream-date",
    "prompt": "Your impossible dream date"
  },
  {
    "id": "relationship-mascot",
    "prompt": "The unofficial mascot of your relationship"
  },
  {
    "id": "tiny-kingdom",
    "prompt": "A tiny kingdom built just for two"
  }
]
```

### `HARMONIC_LOCK_ROUNDS` (8 entries)

```json
[
  {
    "id": "warm-resonance",
    "label": "Warm resonance",
    "prompt": "Find the frequency where the two rings feel calmest.",
    "target": 36
  },
  {
    "id": "bright-resonance",
    "label": "Bright resonance",
    "prompt": "Tune toward the point where the glass seems to glow.",
    "target": 68
  },
  {
    "id": "quiet-resonance",
    "label": "Quiet resonance",
    "prompt": "Settle into the softest shared hum.",
    "target": 52
  },
  {
    "id": "porcelain",
    "label": "Porcelain",
    "target": 28,
    "prompt": "Let the glow guide you toward a steady shared resonance."
  },
  {
    "id": "moon-glass",
    "label": "Moon glass",
    "target": 44,
    "prompt": "Let the glow guide you toward a steady shared resonance."
  },
  {
    "id": "copper-light",
    "label": "Copper light",
    "target": 61,
    "prompt": "Let the glow guide you toward a steady shared resonance."
  },
  {
    "id": "evening-hum",
    "label": "Evening hum",
    "target": 76,
    "prompt": "Let the glow guide you toward a steady shared resonance."
  },
  {
    "id": "little-lantern",
    "label": "Little lantern",
    "target": 83,
    "prompt": "Let the glow guide you toward a steady shared resonance."
  }
]
```

### `WAVE_THREE_ACTIVITY_DEFINITIONS` (3 entries)

```json
[
  {
    "description": "One player moves sideways and the other moves vertically through a shared maze.",
    "durationSec": 90,
    "id": "dual-axis-maze",
    "intensity": 1,
    "label": "Dual-Axis Maze",
    "prompt": "Guide the pearl from the garden gate to the moonlit table.",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "cooperative",
      "maze",
      "communication",
      "featured"
    ],
    "title": "Dual-Axis Maze",
    "type": "maze",
    "vibe": "playful"
  },
  {
    "description": "Draw two unseen halves of one picture, then join them in the scrapbook.",
    "durationSec": 120,
    "id": "blind-canvas",
    "intensity": 1,
    "label": "Blind Canvas",
    "prompt": "Our dream breakfast café",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "cooperative",
      "drawing",
      "memory",
      "featured"
    ],
    "title": "Blind Canvas",
    "type": "canvas",
    "vibe": "playful"
  },
  {
    "description": "Follow the resonance separately and discover whether both dials found the lock.",
    "durationSec": 60,
    "id": "harmonic-lock",
    "intensity": 1,
    "label": "Harmonic Lock",
    "prompt": "Find the frequency where the two rings feel calmest.",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "cooperative",
      "slider",
      "haptic",
      "featured"
    ],
    "title": "Harmonic Lock",
    "type": "harmonic",
    "vibe": "tender"
  }
]
```


## Wave four prompts

Source: `src/features/session/waveFourGameData.js`.

### `BLUFF_BIDDING_TOPICS` (25 entries)

```json
[
  {
    "id": "bluff-extra-1",
    "prompt": "Things we would pack for a picnic"
  },
  {
    "id": "bluff-extra-2",
    "prompt": "Places for a free date"
  },
  {
    "id": "bluff-extra-3",
    "prompt": "Animals that would make terrible roommates"
  },
  {
    "id": "bluff-extra-4",
    "prompt": "Things that belong in a blanket fort"
  },
  {
    "id": "bluff-extra-5",
    "prompt": "Songs with love in the title"
  },
  {
    "id": "bluff-extra-6",
    "prompt": "Foods we could cook together"
  },
  {
    "id": "bluff-extra-7",
    "prompt": "Things we would put in a time capsule"
  },
  {
    "id": "bluff-extra-8",
    "prompt": "Fictional places we could visit"
  },
  {
    "id": "bluff-extra-9",
    "prompt": "Ways to spend a rainy afternoon"
  },
  {
    "id": "bluff-extra-10",
    "prompt": "Things that make a home cozy"
  },
  {
    "id": "bluff-extra-11",
    "prompt": "Ridiculous names for a pet"
  },
  {
    "id": "bluff-extra-12",
    "prompt": "Things we could grow in a garden"
  },
  {
    "id": "bluff-extra-13",
    "prompt": "Reasons to celebrate an ordinary Tuesday"
  },
  {
    "id": "bluff-extra-14",
    "prompt": "Things to spot on a neighborhood walk"
  },
  {
    "id": "bluff-extra-15",
    "prompt": "Ideas for a tiny adventure"
  },
  {
    "id": "bluff-extra-16",
    "prompt": "Things to bring on a road trip"
  },
  {
    "id": "bluff-extra-17",
    "prompt": "Jobs on our imaginary spaceship"
  },
  {
    "id": "bluff-extra-18",
    "prompt": "Desserts worth sharing"
  },
  {
    "id": "bluff-extra-19",
    "prompt": "Things that would ruin a romantic movie scene"
  },
  {
    "id": "bluff-extra-20",
    "prompt": "Objects in our imaginary couple museum"
  },
  {
    "id": "romance-movies",
    "prompt": "Famous romance movies"
  },
  {
    "id": "date-songs",
    "prompt": "Songs that belong on a date-night playlist"
  },
  {
    "id": "dream-trips",
    "prompt": "Places that would make a great couple trip"
  },
  {
    "id": "comfort-foods",
    "prompt": "Foods worthy of a cozy night in"
  },
  {
    "id": "fictional-couples",
    "prompt": "Memorable fictional couples"
  }
]
```

### `PHOTO_FLASHBACK_PROMPTS` (20 entries)

```json
[
  {
    "id": "photo-extra-1",
    "prompt": "Choose a photo that makes you laugh. What happened just before it?"
  },
  {
    "id": "photo-extra-2",
    "prompt": "Choose a photo of a place you would visit together again."
  },
  {
    "id": "photo-extra-3",
    "prompt": "Choose a picture of a meal. What do you remember about the conversation?"
  },
  {
    "id": "photo-extra-4",
    "prompt": "Choose a photo that feels like the beginning of a chapter."
  },
  {
    "id": "photo-extra-5",
    "prompt": "Choose a photo with terrible lighting and a wonderful memory."
  },
  {
    "id": "photo-extra-6",
    "prompt": "Choose a photo of an everyday object that has a story for you both."
  },
  {
    "id": "photo-extra-7",
    "prompt": "Choose a photo that captures your partner being completely themselves."
  },
  {
    "id": "photo-extra-8",
    "prompt": "Choose a picture that would surprise someone who just met you both."
  },
  {
    "id": "photo-extra-9",
    "prompt": "Choose a photo you would put on the cover of this year."
  },
  {
    "id": "photo-extra-10",
    "prompt": "Choose a photo and caption it with one thing you appreciate now."
  },
  {
    "id": "photo-extra-11",
    "prompt": "Choose a picture of a small adventure you nearly did not take."
  },
  {
    "id": "photo-extra-12",
    "prompt": "Choose a photo you wish had sound. Describe what we would hear."
  },
  {
    "id": "photo-extra-13",
    "prompt": "Choose a photo and invent its overly dramatic movie title."
  },
  {
    "id": "photo-extra-14",
    "prompt": "Choose a picture of a moment you would happily repeat."
  },
  {
    "id": "photo-extra-15",
    "prompt": "Choose a photo with a detail you never pointed out before."
  },
  {
    "id": "photo-extra-16",
    "prompt": "Choose a picture that deserves a handwritten note on the back."
  },
  {
    "id": "missing-detail",
    "prompt": "Choose a photo of the two of you. What detail does the picture leave out?"
  },
  {
    "id": "soundtrack",
    "prompt": "Choose a favorite shared photo. What song belongs underneath it?"
  },
  {
    "id": "future-caption",
    "prompt": "Choose an old photo together. Caption it from five years in the future."
  },
  {
    "id": "tiny-moment",
    "prompt": "Choose a photo from an ordinary day that became important later."
  }
]
```

### `WAVE_FOUR_ACTIVITY_DEFINITIONS` (2 entries)

```json
[
  {
    "description": "Raise the promise or call the bluff, then see whether the bidder can prove it.",
    "durationSec": 90,
    "id": "bluff-bidding",
    "intensity": 1,
    "label": "Bluff Bidding",
    "prompt": "Things we would pack for a picnic",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "head-to-head",
      "bidding",
      "word",
      "featured"
    ],
    "title": "Bluff Bidding",
    "type": "bluff",
    "vibe": "playful"
  },
  {
    "description": "Choose one shared photo and write two captions without seeing the first.",
    "durationSec": 120,
    "id": "photo-flashback",
    "intensity": 2,
    "label": "Photo Flashback",
    "prompt": "Choose a photo that makes you laugh. What happened just before it?",
    "savesToJournal": true,
    "skippable": true,
    "tags": [
      "memory",
      "photo",
      "caption",
      "featured"
    ],
    "title": "Photo Flashback",
    "type": "photo",
    "vibe": "tender"
  }
]
```


## Expanded and themed prompt pools

Source: `src/features/session/moreNightPrompts.js`.

### `MORE_NIGHT_PROMPTS` (30 entries)

```json
{
  "comfort-menu": [
    "What helps you feel cared for when words feel tiring?",
    "Design a ten-minute reset we can do from different places.",
    "What should I remember about you on a difficult morning?"
  ],
  "small-mercies": [
    "Which tiny task feels lighter when we share it?",
    "What did we quietly get right this month?",
    "What is a small kindness you want more room for?"
  ],
  "weather-report": [
    "What would help your inner weather clear tonight?",
    "What part of your day felt like sunshine?",
    "If we shared an umbrella today, what would it shelter us from?"
  ],
  "receipts": [
    "Pick a photo that makes you remember a sound.",
    "Choose a picture whose best story happened off camera.",
    "Find a photo that deserves a second caption today."
  ],
  "future-artifact": [
    "What little object would represent our next adventure?",
    "What should go on a shelf labeled Our Ordinary Magic?",
    "Choose a keepsake we could make rather than buy."
  ],
  "translation": [
    "What does your version of I need company look like?",
    "Which little gesture says welcome home to you?",
    "How can I tell when you want encouragement rather than advice?"
  ],
  "director-commentary": [
    "Describe a moment when we made a surprisingly good team.",
    "Which ordinary scene of us deserves a slow-motion replay?",
    "Give the opening line of a documentary about our weekend."
  ],
  "growth-ring": [
    "What have we learned to laugh about together?",
    "Which shared habit has made our lives easier?",
    "Name a challenge we would handle differently now."
  ],
  "anchor-memory": [
    "Describe a shared place using only sounds and smells.",
    "What moment reminds you that we can figure things out?",
    "Which tiny detail from an old date still stays with you?"
  ],
  "gratitude-snapshot": [
    "Show something nearby that reminds you of us.",
    "Photograph an everyday object and give it a thank-you note.",
    "Share a view you would like us to see together."
  ],
  "cursed-date-12": [
    "Plan a date where every purchase must be yellow.",
    "Create a luxury date with the contents of one drawer.",
    "Plan the finest possible date at an airport during a delay."
  ],
  "yelp-review": [
    "Review our teamwork as a tiny moving company.",
    "Write a review of your partner as a personal tour guide.",
    "Give our most ordinary evening an absurd five-star review."
  ],
  "lore-drop": [
    "Invent the legend of our missing socks.",
    "Give a household object a scandalous backstory.",
    "Explain our favorite snack as a sacred family tradition."
  ],
  "two-truths-one-dream": [
    "Name two places you have been and one you wish existed.",
    "Share two real talents and one ridiculous power you want.",
    "Offer two true childhood favorites and one convincing fake."
  ],
  "alternate-job": [
    "Assign your partner a job on a very small spaceship.",
    "What would your partner teach at a school for dragons?",
    "Invent an award only your partner could win."
  ],
  "apocalypse-role": [
    "Who negotiates with the aliens, and who serves snacks?",
    "Assign our jobs on an island with excellent Wi-Fi.",
    "What is our emergency plan for a town overrun by puppies?"
  ],
  "pet-peeve-love-letter": [
    "Write an affectionate product description for a quirky habit.",
    "Turn our messiest routine into a royal ceremony.",
    "Give a tiny disagreement a completely overblown movie title."
  ],
  "wikipedia-us": [
    "Write the entry for our most quotable phrase.",
    "Give our favorite ordinary place an official historical marker.",
    "Name three chapters in the unofficial history of us."
  ],
  "theme-song": [
    "Choose an entrance song for our next grocery trip.",
    "Invent a three-line jingle for our teamwork.",
    "What song would play while we make breakfast?"
  ],
  "villain-origin": [
    "Invent a villain whose weakness is our favorite snack.",
    "What ridiculous rule would we impose as benevolent rulers?",
    "Design our villain uniforms with one very practical feature."
  ],
  "replay-favorite-kiss": [
    "What made one goodbye feel especially sweet?",
    "Describe a moment when a kiss felt like a fresh hello.",
    "Where would you like a quiet affectionate moment again?"
  ],
  "wanted-list": [
    "What small invitation makes you feel included?",
    "How do you like to be welcomed after a busy day?",
    "Name a moment when you felt especially appreciated."
  ],
  "slow-morning": [
    "Choose the soundtrack, breakfast, and view for a slow morning.",
    "What morning chore would we happily postpone?",
    "Design a leisurely morning together from two different cities."
  ],
  "confidence-fit": [
    "What makes you feel comfortable and completely yourself?",
    "Name a look of mine that reminds you of a happy day.",
    "What confidence boost would you give your partner today?"
  ],
  "whisper-line": [
    "Write a tiny invitation for a date at home.",
    "What would you whisper before we step onto a dance floor?",
    "Leave a playful six-word note in an imaginary coat pocket."
  ],
  "scent-memory": [
    "What kitchen smell reminds you of a shared moment?",
    "Describe a place we love without naming it.",
    "What would a candle named after our weekend smell like?"
  ],
  "favorite-way-held": [
    "What kind of welcome hug sounds best today?",
    "How do you ask for closeness when you are tired?",
    "Describe an affectionate gesture that helps you feel grounded."
  ],
  "look-you-love": [
    "What expression tells you I have a surprise planned?",
    "Describe your partner concentrating on something they love.",
    "What face do we make when we know the same joke is coming?"
  ],
  "secret-admiration": [
    "Which effort of yours do you wish I noticed more?",
    "What thoughtful quality in your partner deserves a spotlight?",
    "What ordinary skill of theirs makes you smile?"
  ],
  "rewind-touch": [
    "What small goodbye ritual would you like to keep?",
    "Describe a moment when a hand squeeze said enough.",
    "What gentle gesture could we make a daily tradition?"
  ]
}
```

### `EXTRA_CANVAS_PROMPTS` (18 entries)

```json
[
  {
    "id": "canvas-extra-1",
    "prompt": "Our dream breakfast café"
  },
  {
    "id": "canvas-extra-2",
    "prompt": "A spaceship built for two"
  },
  {
    "id": "canvas-extra-3",
    "prompt": "A tiny home for our imaginary pet"
  },
  {
    "id": "canvas-extra-4",
    "prompt": "The world’s least practical picnic"
  },
  {
    "id": "canvas-extra-5",
    "prompt": "A treehouse with everything we need"
  },
  {
    "id": "canvas-extra-6",
    "prompt": "Our relationship as a friendly monster"
  },
  {
    "id": "canvas-extra-7",
    "prompt": "A garden on the moon"
  },
  {
    "id": "canvas-extra-8",
    "prompt": "A bakery run by woodland creatures"
  },
  {
    "id": "canvas-extra-9",
    "prompt": "A postcard from our imaginary island"
  },
  {
    "id": "canvas-extra-10",
    "prompt": "Our very own carnival ride"
  },
  {
    "id": "canvas-extra-11",
    "prompt": "A rainy-day blanket fortress"
  },
  {
    "id": "canvas-extra-12",
    "prompt": "A trophy for our best inside joke"
  },
  {
    "id": "canvas-extra-13",
    "prompt": "A food truck with our names on it"
  },
  {
    "id": "canvas-extra-14",
    "prompt": "A lighthouse for lost socks"
  },
  {
    "id": "canvas-extra-15",
    "prompt": "A map of a perfect lazy Sunday"
  },
  {
    "id": "canvas-extra-16",
    "prompt": "Our secret headquarters"
  },
  {
    "id": "canvas-extra-17",
    "prompt": "A robot that plans dates"
  },
  {
    "id": "canvas-extra-18",
    "prompt": "A tiny train carrying our favorite snacks"
  }
]
```

### `EXTRA_PHOTO_PROMPTS` (16 entries)

```json
[
  {
    "id": "photo-extra-1",
    "prompt": "Choose a photo that makes you laugh. What happened just before it?"
  },
  {
    "id": "photo-extra-2",
    "prompt": "Choose a photo of a place you would visit together again."
  },
  {
    "id": "photo-extra-3",
    "prompt": "Choose a picture of a meal. What do you remember about the conversation?"
  },
  {
    "id": "photo-extra-4",
    "prompt": "Choose a photo that feels like the beginning of a chapter."
  },
  {
    "id": "photo-extra-5",
    "prompt": "Choose a photo with terrible lighting and a wonderful memory."
  },
  {
    "id": "photo-extra-6",
    "prompt": "Choose a photo of an everyday object that has a story for you both."
  },
  {
    "id": "photo-extra-7",
    "prompt": "Choose a photo that captures your partner being completely themselves."
  },
  {
    "id": "photo-extra-8",
    "prompt": "Choose a picture that would surprise someone who just met you both."
  },
  {
    "id": "photo-extra-9",
    "prompt": "Choose a photo you would put on the cover of this year."
  },
  {
    "id": "photo-extra-10",
    "prompt": "Choose a photo and caption it with one thing you appreciate now."
  },
  {
    "id": "photo-extra-11",
    "prompt": "Choose a picture of a small adventure you nearly did not take."
  },
  {
    "id": "photo-extra-12",
    "prompt": "Choose a photo you wish had sound. Describe what we would hear."
  },
  {
    "id": "photo-extra-13",
    "prompt": "Choose a photo and invent its overly dramatic movie title."
  },
  {
    "id": "photo-extra-14",
    "prompt": "Choose a picture of a moment you would happily repeat."
  },
  {
    "id": "photo-extra-15",
    "prompt": "Choose a photo with a detail you never pointed out before."
  },
  {
    "id": "photo-extra-16",
    "prompt": "Choose a picture that deserves a handwritten note on the back."
  }
]
```

### `EXTRA_BLUFF_TOPICS` (20 entries)

```json
[
  {
    "id": "bluff-extra-1",
    "prompt": "Things we would pack for a picnic"
  },
  {
    "id": "bluff-extra-2",
    "prompt": "Places for a free date"
  },
  {
    "id": "bluff-extra-3",
    "prompt": "Animals that would make terrible roommates"
  },
  {
    "id": "bluff-extra-4",
    "prompt": "Things that belong in a blanket fort"
  },
  {
    "id": "bluff-extra-5",
    "prompt": "Songs with love in the title"
  },
  {
    "id": "bluff-extra-6",
    "prompt": "Foods we could cook together"
  },
  {
    "id": "bluff-extra-7",
    "prompt": "Things we would put in a time capsule"
  },
  {
    "id": "bluff-extra-8",
    "prompt": "Fictional places we could visit"
  },
  {
    "id": "bluff-extra-9",
    "prompt": "Ways to spend a rainy afternoon"
  },
  {
    "id": "bluff-extra-10",
    "prompt": "Things that make a home cozy"
  },
  {
    "id": "bluff-extra-11",
    "prompt": "Ridiculous names for a pet"
  },
  {
    "id": "bluff-extra-12",
    "prompt": "Things we could grow in a garden"
  },
  {
    "id": "bluff-extra-13",
    "prompt": "Reasons to celebrate an ordinary Tuesday"
  },
  {
    "id": "bluff-extra-14",
    "prompt": "Things to spot on a neighborhood walk"
  },
  {
    "id": "bluff-extra-15",
    "prompt": "Ideas for a tiny adventure"
  },
  {
    "id": "bluff-extra-16",
    "prompt": "Things to bring on a road trip"
  },
  {
    "id": "bluff-extra-17",
    "prompt": "Jobs on our imaginary spaceship"
  },
  {
    "id": "bluff-extra-18",
    "prompt": "Desserts worth sharing"
  },
  {
    "id": "bluff-extra-19",
    "prompt": "Things that would ruin a romantic movie scene"
  },
  {
    "id": "bluff-extra-20",
    "prompt": "Objects in our imaginary couple museum"
  }
]
```


## Authored activity prompt variations

Source: `src/features/session/activityPromptExpansion.js`.

### `ACTIVITY_PROMPT_EXPANSION` (63 entries)

```json
{
  "comfort-menu": [
    "You have had a disappointing day. Would you like company, a distraction, practical help, or something else?",
    "What small comfort from your childhood would you like to share with me?",
    "How could we make waiting for difficult news a little gentler together?",
    "Describe your ideal welcome after a tiring journey, from the door to the first drink.",
    "When plans fall through, what helps you feel that the evening is still ours?",
    "What does useful comfort look like when you are excited but nervous about something new?"
  ],
  "small-mercies": [
    "Which moment this week became easier because you knew I was in your corner?",
    "What did I remember recently that made you feel listened to?",
    "Name a small kindness we could offer each other on busy days without adding another task.",
    "What is an everyday favor between us that deserves a better thank-you?",
    "Which of our differences has quietly helped you lately?",
    "What is a kind thing your partner does for other people that you admire?"
  ],
  "weather-report": [
    "Give your energy, patience, and hope their own weather forecasts for tonight.",
    "What is one cloud you would like me to sit beside without trying to move it?",
    "Which feeling surprised you today like an unexpected change in the weather?",
    "Describe our week as a landscape, including one comfortable place to rest.",
    "What would a gentle change of pace look like for tomorrow?",
    "If your mood had a weather advisory, what would you want me to know before coming closer?"
  ],
  "receipts": [
    "Find a shared photo you nearly deleted. What makes it worth keeping now?",
    "Choose a picture from a journey. What happened on the way there?",
    "Which photo captures a version of us you would like to thank?",
    "Pick a picture with food in it. What else was happening at that table?",
    "Find a photo where one small background detail tells the real story.",
    "Choose a picture of somewhere ordinary. How did that place become part of us?"
  ],
  "future-artifact": [
    "What everyday object would prove to future archaeologists that we were a very good team?",
    "Design a tiny keepsake for a milestone we have not reached yet.",
    "Which worn-out object from our lives deserves to be repaired and kept?",
    "Imagine a receipt from our ideal future weekend. What would be listed on it?",
    "What note should we attach to a treasured object so its story is not forgotten?",
    "If our future home had a drawer for this chapter, what would go inside first?"
  ],
  "translation": [
    "When you say you are fine but still want company, how could I recognize the invitation?",
    "What does making room for you look like in an ordinary conversation?",
    "How do you show that you are proud of someone when a big speech feels awkward?",
    "What little action from me means I remembered you while we were apart?",
    "Finish this translation: when I ask for a quiet evening, I am really hoping for...",
    "Which kind of check-in feels caring to you without needing an immediate reply?"
  ],
  "director-commentary": [
    "Narrate our first ordinary errand together as if it secretly changed the whole film.",
    "Choose a shared mishap and explain which scene the editor should absolutely keep.",
    "What would the costume designer notice about a favorite day we spent together?",
    "Describe a quiet moment between us using only what the audience could see and hear.",
    "Give a deleted scene from our week a title and explain why it deserves to return.",
    "If our next chapter opened with one shot, where would the camera find us?"
  ],
  "growth-ring": [
    "What have you become more comfortable asking me for since we first met?",
    "Which small adjustment has helped us understand each other better?",
    "What would you tell an earlier version of us about taking things at our own pace?",
    "Name a mistake that taught us something useful without becoming our whole story.",
    "What is a shared strength we have built through ordinary repetition?",
    "Which difference between us do you understand with more kindness now?"
  ],
  "anchor-memory": [
    "Recall a time when we did not have a plan but still felt okay together.",
    "Which shared memory makes you feel most like yourself?",
    "Remember a moment when we laughed after something went wrong. What broke the tension?",
    "Describe a familiar route that carries a good memory of us.",
    "What is one sentence from a past conversation you still carry with you?",
    "Choose a peaceful memory and describe where each of us was sitting or standing."
  ],
  "gratitude-snapshot": [
    "Describe a small detail in your current view that your partner would probably appreciate.",
    "If you framed one moment from today as a thank-you, what would the caption say?",
    "Choose a color around you and connect it to something you appreciate about us.",
    "Describe an empty space nearby where you wish your partner could sit for a minute.",
    "What unnoticed corner of your day would you like to show me, and why?",
    "Imagine a before-and-after picture of a day your partner made better. What changes?"
  ],
  "cursed-date-12": [
    "Plan a charming date in a laundromat while every dryer is occupied.",
    "Build a date around a bus ride, a shared umbrella, and absolutely no sense of direction.",
    "Our reservation is accidentally at a garden center. Make this the date of the year.",
    "Plan an elegant anniversary using only items from a convenience-store clearance shelf.",
    "Design a date for two people wearing fancy clothes in a very unfancy place.",
    "We have one bench, two snacks, and a town neither of us knows. What happens next?"
  ],
  "yelp-review": [
    "Review your partner as a hotel, including the breakfast service and one wonderfully specific amenity.",
    "Give our shared sense of direction a generous review that somehow remains honest.",
    "Review an imaginary business that sells the kind of hugs we like.",
    "Write a customer review of our ability to choose something to watch.",
    "Review your partner as an emergency snack-delivery service during a very long day.",
    "Describe our inside jokes as a tourist attraction with confusing opening hours."
  ],
  "lore-drop": [
    "Explain why one of our usual phrases is actually the password to an enchanted city.",
    "Give a favorite shared meal a heroic origin involving a terrible misunderstanding.",
    "Invent the ancient rivalry between two objects in our imaginary home.",
    "Tell the legend of the first time we successfully chose what to watch.",
    "Explain an ordinary shared habit as if you are a historian from a thousand years in the future.",
    "Which tiny event from our week would a traveling storyteller exaggerate beyond recognition?"
  ],
  "two-truths-one-dream": [
    "Offer two real things you would pack for a trip and one wildly impractical dream item. Let me guess.",
    "Name two skills you have tried and one you only wish you had. Which is the dream?",
    "Share two true things about your ideal day and one invented detail for me to spot.",
    "Give me two real childhood ambitions and one career your younger self never considered.",
    "Describe two real gifts you have received and one dream gift. Let your partner find it.",
    "Share two genuine places on your wish list and one imaginary destination. Which one did you invent?"
  ],
  "alternate-job": [
    "What would your partner do at a hotel for mythical creatures, and who would be their favorite guest?",
    "Assign your partner a role in a museum where all the exhibits have escaped.",
    "Which highly specific problem would make someone call your partner as the world expert?",
    "Invent a tiny shop your partner could run brilliantly, including its most popular item.",
    "Give your partner a behind-the-scenes job on the film of our lives.",
    "If we ran a radio station for one day, what would each of our shows be called?"
  ],
  "apocalypse-role": [
    "We are snowed in at a library. Who organizes survival, and who starts the book club?",
    "The robots have taken every job except two. Invent the roles we save for ourselves.",
    "We must turn an abandoned cinema into a home. What does each of us tackle first?",
    "The town has lost the ability to make decisions. Which tiny decision do we each take charge of?",
    "We have to lead a caravan of very dramatic cats. Divide the responsibilities.",
    "Our island needs one useful invention and one morale-boosting luxury. Who makes which?"
  ],
  "pet-peeve-love-letter": [
    "Write a tender apology to an object caught in the middle of one of our harmless disagreements.",
    "Describe a lovable quirk of mine as a feature in an extremely expensive brochure.",
    "Give one of our recurring tiny debates a ceremonial opening statement.",
    "Write a love note to the way we are both a little inconvenient sometimes.",
    "Nominate one harmless habit for a lifetime achievement award and read the citation.",
    "Turn a small difference in our routines into an affectionate two-line poem."
  ],
  "wikipedia-us": [
    "Write the Early History section of our encyclopedia entry using three very serious facts.",
    "What belongs in the Cultural Impact section about our influence on snack consumption?",
    "Invent a footnote explaining one phrase that outsiders never understand.",
    "Write the Geography section describing our most frequently visited places.",
    "Give a shared adventure a historical name and a one-sentence summary.",
    "What would the References section cite as evidence that we make a good team?"
  ],
  "theme-song": [
    "Choose a theme for the moment we finally settle on dinner after discussing every possible option.",
    "What instrument would represent each of us in a duet about our week?",
    "Write the chorus of a theme song for our least glamorous shared chore.",
    "Pick a song for the walk home after a really good date. What part would we sing?",
    "Our relationship becomes a cooking show. Describe its opening theme.",
    "Choose an unexpectedly dramatic song for a very small victory we recently shared."
  ],
  "villain-origin": [
    "Your partner becomes a villain after a disappointing sandwich. What is their first decree?",
    "Design our villain getaway vehicle with room for one unnecessary comfort.",
    "What would your partner demand in exchange for returning all the missing teaspoons?",
    "Invent a hero whose only power can defeat our most ridiculous villain plan.",
    "Write the apology our villain duo sends after accidentally improving the town.",
    "What is the one wholesome hobby our villain characters refuse to give up?"
  ],
  "replay-favorite-kiss": [
    "What do you remember about the place around a kiss that mattered to you?",
    "Describe the anticipation before an affectionate moment you still smile about.",
    "Which ordinary hello would you turn into an unhurried reunion?",
    "What song, sound, or bit of weather belongs in the background of a kiss you remember?",
    "Imagine recreating a sweet moment with none of the original scenery. What would still matter?",
    "What would your ideal goodnight kiss say without using any words?"
  ],
  "wanted-list": [
    "What kind of invitation tells you that I am choosing your company rather than just filling time?",
    "When do you most enjoy being asked for your opinion?",
    "What detail do you love it when I remember without being reminded?",
    "How would you like me to celebrate an achievement that feels small to everyone else?",
    "What makes a message feel personal to you rather than just a routine check-in?",
    "Describe a moment when your partner made room for your interests, even if they were not their own."
  ],
  "slow-morning": [
    "We wake up somewhere unfamiliar with no obligations. What is the first thing we explore?",
    "Describe a slow morning when one of us wants quiet and the other wants to chat.",
    "Plan a relaxed breakfast using three things already in your kitchen.",
    "Imagine our ideal winter morning. What keeps us from rushing?",
    "What small preparation tonight could give us a gentler morning tomorrow?",
    "Write a postcard from a lazy morning we might share ten years from now."
  ],
  "confidence-fit": [
    "Choose an imaginary outfit for your partner to wear while accepting an award they deserve.",
    "Which piece of clothing carries a particularly good memory for you?",
    "What would you wear on a date where feeling like yourself mattered more than dressing up?",
    "Describe a tiny getting-ready ritual that helps your confidence arrive.",
    "If we each picked one accessory for the other, what would we choose and why?",
    "What compliment about your style would feel especially good to hear?"
  ],
  "whisper-line": [
    "What would you quietly say to your partner just before they do something brave?",
    "Write a whispered compliment that mentions no part of how your partner looks.",
    "We are pretending to be strangers at a party. What is your first quiet line to me?",
    "What one-sentence invitation would make an ordinary evening feel like a secret date?",
    "Choose a line for the moment we sneak away from a noisy gathering to get some air.",
    "What could you whisper during a dull errand that would make your partner grin?"
  ],
  "scent-memory": [
    "Which outdoor smell brings back a place you would like to visit with me?",
    "Describe the imaginary fragrance of the first chapter of our relationship.",
    "What smell would you hope to notice first when arriving at our ideal weekend getaway?",
    "Choose a familiar scent and tell me a story about it that I might not know.",
    "If a shared meal had a scent-based postcard, what would it remind us of?",
    "What three scents would make a place feel like home to you?"
  ],
  "favorite-way-held": [
    "What kind of closeness would feel welcome after a day full of people?",
    "Describe a comfortable way to sit together while doing completely different things.",
    "How could we make a hug feel like a question you are free to answer?",
    "What is the difference between the comfort you want before a challenge and after it?",
    "Imagine a chilly evening outside. What small affectionate gesture sounds nicest?",
    "What should I know about when you prefer company nearby without being touched?"
  ],
  "look-you-love": [
    "Describe the expression your partner makes when they are trying not to spoil a surprise.",
    "What look tells you your partner has just had a very good idea?",
    "Which expression of yours do you think I would recognize from across a busy room?",
    "What does your partner look like when they feel completely at ease?",
    "Describe the face your partner makes when a favorite meal arrives.",
    "What expression would you put on a tiny portrait of your partner, and why?"
  ],
  "secret-admiration": [
    "What is a way your partner treats people that makes you quietly proud?",
    "Name a strength in your partner that they tend to underestimate.",
    "What do you admire about how your partner approaches something they are still learning?",
    "Which small act of courage have you noticed in your partner lately?",
    "What is something your partner cares about that has helped you see it differently?",
    "Finish this sentence: I hope you know how much I admire the way you..."
  ],
  "rewind-touch": [
    "Which ordinary moment would you like to mark with a small affectionate gesture?",
    "Describe a brief touch that helped you feel less alone in a crowded place.",
    "What small greeting could we make our own without needing a big occasion?",
    "What is a tiny gesture you would choose for wishing your partner good luck?",
    "Recall a time when sitting close was more comforting than finding the right words.",
    "Imagine a quiet reunion at a station. What is the first gentle gesture you would offer?"
  ],
  "postcard-next-year": [
    "Write two sentences to us one year from now about something ordinary you hope we still enjoy.",
    "Leave our future selves a question about a small hope you have for the coming year.",
    "Tell next-year us what makes this chapter worth remembering, even if life changes.",
    "Write a postcard to our future selves describing a tradition you hope we have started.",
    "What should us-a-year-from-now remember about how we look after each other today?",
    "Leave a two-sentence prediction about a tiny adventure we might have before this note opens.",
    "Write to our future selves about something we are learning to do together right now.",
    "Tell next-year us one thing you hope they have made more time for.",
    "Describe a little pleasure from today that you hope still exists in our lives in twelve months.",
    "Leave future-us a gentle reminder about taking life at our own pace.",
    "Write a two-sentence toast for the day we read this note together a year from now."
  ],
  "map-pin-wish": [
    "Imagine a pin on a map of your hometown. Where would you take me first, and why?",
    "Choose a place within a short walk where you would like a tiny date together.",
    "Think of a place we have never visited. Give three clues so I can guess your choice.",
    "Where would you place a map pin for a day when we both need a little quiet?",
    "Pick a place from your childhood you would like me to understand through your eyes.",
    "Choose a spot for a future picnic and describe what we would see from our blanket.",
    "Which place on our shared map deserves another visit for a completely different reason?",
    "Imagine a pin labeled No plans needed. Where is it, and what do we do there?",
    "Pick a meeting point halfway between our imaginary dream destinations. Describe the compromise.",
    "What place would you choose for watching the sun come up together?",
    "Place an imaginary pin somewhere ordinary that could become special with the right company."
  ],
  "house-rules": [
    "Invent a house rule for rainy Sundays that protects our right to be wonderfully unproductive.",
    "Create a ridiculous rule about what happens when someone finishes the last snack.",
    "Our future house has a ceremonial entrance greeting. What is the rule?",
    "Write a house rule that makes doing an annoying chore slightly more amusing.",
    "What is the official policy for adopting a very ugly but lovable decorative object?",
    "Invent a rule for choosing music when our imaginary kitchen becomes a dance floor.",
    "Our house needs a constitution for blanket ownership. Write its first article.",
    "Create a house rule that allows a spontaneous tiny celebration on an ordinary day.",
    "What harmless behavior earns the title of Household Hero for the evening?",
    "Write the rule posted beside a secret cupboard full of emergency treats.",
    "Invent a house rule our guests would find baffling but we would understand immediately."
  ],
  "unsent-draft": [
    "What small compliment have you thought about giving me but not found the moment for?",
    "Write the message you would send if you knew you did not have to phrase it perfectly.",
    "What funny observation from your day did you nearly send me?",
    "Share a question you have been meaning to ask me, with no pressure to answer tonight.",
    "What is a tiny invitation you almost made because it felt too ordinary to mention?",
    "Write a message that begins: There is a little thing I wanted to tell you...",
    "What happy news would you like to have interrupted my day with?",
    "Share an appreciation that would have made a past conversation feel more complete.",
    "What would you text me from the queue at a shop if the goal were simply to make me smile?",
    "Write a kind message to us from the version of you who sometimes overthinks sending it.",
    "What ordinary part of today deserved a quick thinking-of-you message?"
  ],
  "shared-seed": [
    "Imagine planting one tiny intention for us this week. What would help it grow?",
    "Our relationship has a little windowsill garden. Which habit gets its own pot?",
    "Choose a seed of an idea we could each spend five minutes nurturing.",
    "What would we name a plant that grows whenever we make time to listen?",
    "Which small shared effort deserves patient watering rather than instant results?",
    "Design an imaginary garden bed for the things we want more of in our evenings.",
    "What is one tiny action each of us could take to support the same hope?",
    "Pick a gardening metaphor for a habit we would like to care for more gently.",
    "What is already growing between us that we sometimes forget to notice?",
    "Imagine our first little harvest from a week of kindness. What do we gather?",
    "What would a sign beside our shared seed remind us on a day when progress feels slow?"
  ],
  "build-a-cult": [
    "Invent a silly secret society devoted to our favorite snack. Give it a greeting and a hat.",
    "Our most ordinary shared habit becomes a club. What is the very low-stakes initiation?",
    "Design the uniform for an organization dedicated to staying in on Friday nights.",
    "Write three absurd commandments for the Society of One More Episode.",
    "Our imaginary club has an annual festival. What harmless nonsense happens there?",
    "Invent a secret handshake for people who share our most specific enthusiasm.",
    "What ridiculously grand title would each of us hold in a club of exactly two?",
    "Create a recruitment poster for our imaginary order of excellent snack decisions.",
    "Our shared quirk needs a crest, a motto, and an official beverage. Choose all three.",
    "Invent a club tradition that turns one boring weekly task into a tiny ceremony.",
    "What completely optional vow would members of our very unserious society make?"
  ],
  "conspiracy-us": [
    "Make the case that a tiny coincidence from our week was arranged by romantic pigeons.",
    "Explain why our matching snack cravings are evidence of a completely harmless secret plot.",
    "Which ordinary object is obviously working behind the scenes to help our relationship?",
    "Invent a conspiracy connecting three unrelated details from the day we met.",
    "Prove, using terrible logic, that our favorite song has been following us on purpose.",
    "What would our imaginary detective board suggest about why we keep choosing the same dinner?",
    "Explain how a minor travel delay was secretly part of an elaborate meet-cute operation.",
    "Our pets or houseplants are running a matchmaking agency. What is your evidence?",
    "Choose an inside joke and explain why it must be a coded message from future-us.",
    "What suspicious pattern connects our best ordinary evenings?",
    "Invent the least believable explanation for why we make such a good team."
  ],
  "bad-advice": [
    "Give terrible advice for choosing dinner when both of us say we do not mind.",
    "Advise an imaginary couple who cannot agree on the temperature of a room. Be spectacularly unhelpful.",
    "What is the worst possible way to prepare for a relaxed weekend?",
    "Give me terrible advice for packing a bag for one night away.",
    "Explain the least efficient way we could decide what to watch together.",
    "Advise us on becoming morning people using only obviously ridiculous suggestions.",
    "What completely impractical advice would you give someone planning a surprise picnic?",
    "Solve the imaginary problem of having too many snacks in the worst possible way.",
    "Offer an absurd productivity tip for a couple who would rather take a nap.",
    "Give the worst possible advice for keeping a very small plant alive in an imaginary house.",
    "Invent a useless relationship tip from a self-help book written by a confused raccoon."
  ],
  "nudge-wars": [
    "Imagine leaving a tiny rubber duck on my board. What encouraging message comes with it?",
    "Choose an imaginary surprise to make my next boring task more entertaining.",
    "Design a harmless board-side prank with a reveal that would make us both laugh.",
    "Invent a tiny good-luck mascot I could imagine beside my next roll.",
    "Leave an imaginary disco ball somewhere unexpected and explain what we are celebrating.",
    "Choose a board-side snack offering and write its overly dramatic delivery note.",
    "What miniature sign would you leave to welcome me back to our little world?",
    "Invent an imaginary cactus with a surprisingly affectionate message attached.",
    "Leave me a pretend clue for finding a very small treasure. What is the treasure?",
    "Design the least intimidating challenge you could leave beside my piece.",
    "What imaginary surprise would say I know exactly what kind of day you have had?"
  ],
  "sound-capsule": [
    "Describe seven seconds of sound that would transport me to a place you love.",
    "Write a tiny soundscape for our perfect rainy evening, using three familiar noises.",
    "If you left me a sound from your childhood, what would I hear and why?",
    "Describe the sound of your day at its happiest point.",
    "Write out the noises our imaginary café makes just before opening.",
    "Choose one sound that means home to you and tell me the memory behind it.",
    "Describe a seven-second audio postcard from a trip we have not taken yet.",
    "What would the soundtrack to our shared laugh sound like without using music?",
    "Build a tiny sound capsule from a familiar voice, a background noise, and a moment of quiet.",
    "Describe a sound I would recognize immediately even if I could not see you.",
    "Imagine leaving a gentle goodnight sound on the board. What would it be?"
  ],
  "flirt-resume": [
    "Write the opening line of your application for the position of My Favorite Distraction.",
    "List three very specific qualifications for planning a date with me.",
    "Describe your signature flirting move as an overly formal professional skill.",
    "What would a reference from our best date say about your charm?",
    "Write a cover letter of two sentences explaining why I should hold your hand tonight.",
    "Your flirt resume needs a special achievement. Which sweet moment goes on it?",
    "Invent a charming job title for the way you make me laugh.",
    "What is one flirting skill you would like to practice on our next date?",
    "Write a personal statement that begins: I bring enthusiasm, excellent company, and...",
    "What would your partner put in the Strengths section of your flirt resume?",
    "Pitch yourself as a companion for an extremely ordinary errand that could become a date."
  ],
  "what-miss-today": [
    "What is one tiny part of sharing a room with me that you would welcome right now?",
    "Describe an ordinary sound of mine that you miss hearing nearby.",
    "What shared errand would you happily do today just for the company?",
    "Which little moment from your day would have been nicer if we had experienced it side by side?",
    "What detail of an unhurried evening together sounds especially good today?",
    "Imagine I could join you for ten minutes. Which ten minutes would you choose?",
    "What familiar greeting do you most look forward to when we next meet?",
    "Which routine feels most different when we are not doing it together?",
    "What is one thing you would point out to me if I were sitting beside you now?",
    "What small shared pleasure would you like us to make time for soon?",
    "Describe the place you would save for me next to you today."
  ],
  "date-that-never-ends": [
    "Our date begins at sunrise with no schedule. Describe the first three turns we take.",
    "Imagine a date where we can stay in each place until we are truly ready to leave. Where do we linger?",
    "Design a day together that moves from a busy place to somewhere peaceful without rushing.",
    "Write the middle of a date when we forget to check the time because the conversation is that good.",
    "We have a whole rainy day and nowhere to report back to. Tell the story of our date.",
    "Plan a date guided entirely by whatever smells delicious next.",
    "Our date can include one familiar place and one new place. How do they connect?",
    "Describe a wandering date in a city where neither of us knows the streets.",
    "Imagine a date with no purchases, no appointments, and a very comfortable pace.",
    "What would make us decide to keep an ordinary afternoon together going into the evening?",
    "Write the final scene of a date that gently becomes the next morning over breakfast."
  ],
  "after-hours-tile": [
    "Describe the kind of quiet company you would welcome at the end of tonight.",
    "What small detail in your face or posture would tell me how your evening has felt?",
    "Write an after-hours note that would make an ordinary room feel a little warmer.",
    "Imagine we are the last two people awake in a sleepy house. What do we talk about?",
    "What would your ideal last ten minutes together before sleep look like?",
    "Describe a favorite late-evening light and the scene you would share beneath it.",
    "What gentle question would you like to hear when the day is finally done?",
    "Choose one small comfort for an imaginary midnight kitchen visit together.",
    "Write a quiet invitation to sit beside you with no need to entertain each other.",
    "What part of yourself do you find easier to share when the evening slows down?",
    "Imagine a peaceful late-night walk together. What do we notice that daytime hides?"
  ],
  "landing-lights": [
    "Choose one thing from today to set down before we spend a few quiet minutes together.",
    "What short welcome would help your mind arrive here after a busy day?",
    "Design a two-minute landing ritual for evenings when neither of us has much energy.",
    "What should our imaginary home beacon say when one of us has had a difficult day?",
    "Name one small good thing we can bring from today into tomorrow.",
    "What kind of check-in would feel like a soft landing rather than another obligation?",
    "Write a one-sentence all-clear message for the end of a long day.",
    "Choose a sound, a drink, and a comfortable place for our end-of-day landing.",
    "What would you like us to leave outside the door of this evening for a little while?",
    "Imagine meeting at our home tile after separate adventures. What do you tell me first?",
    "What simple goodnight ritual could we keep even when our schedules do not match?"
  ],
  "rose-thorn-seed": [
    "Share one small win, one lingering worry, and one gentle intention for tomorrow.",
    "Name one moment you enjoyed, one that took effort, and one thing you would like to try together.",
    "Look back on our week: what felt warm, what felt tangled, and what deserves more room to grow?",
    "Offer one appreciation, one thing you need patience with, and one hope for our next evening.",
    "Describe a bright spot in your routine, a rough edge, and a tiny change that might help.",
    "Share one surprise you liked, one disappointment, and one possibility you are curious about.",
    "What should we celebrate, what could use care, and what would you like us to make time for?",
    "Name something that made you laugh, something that tired you, and something you are looking forward to.",
    "Give this chapter of us a rose, a thorn, and a seed using one sentence for each.",
    "Share one thing to keep doing, one to approach more gently, and one small experiment for us.",
    "What nourished you today, what drained you, and what might restore a little energy tomorrow?"
  ],
  "ordinary-treasure": [
    "Which everyday sound from a shared day would you put in a tiny treasure box?",
    "Recall a meal that mattered because of the company rather than the food.",
    "What unremarkable place became quietly special because we spent time there?",
    "Name an ordinary object that carries more of our story than anyone else would guess.",
    "Which small part of our routine would you miss if it disappeared?",
    "Describe a time when doing almost nothing together felt like exactly enough.",
    "What five-minute memory of us deserves a frame?",
    "Which ordinary journey would you happily take together again?",
    "What is a little kindness between us that has become so familiar you almost overlook it?",
    "Choose a shared moment with no special occasion and tell me why you kept it.",
    "What detail from today might become a treasure if we remember to notice it?"
  ],
  "invisible-backpack": [
    "Which unfinished thought has been taking up more space than it deserves lately?",
    "What is one responsibility you would like me to understand better without needing me to fix it?",
    "When your mind feels full, what kind of company makes room to breathe?",
    "Name one small decision that feels tiring right now and the support you would welcome.",
    "What is something you have been managing that has gone mostly unnoticed?",
    "If we could put one worry on a shelf until tomorrow, which would you choose?",
    "What would taking one thing off your mental checklist look like this week?",
    "Which expectation would you like permission to hold a little more loosely?",
    "What is a kind question I could ask when you seem to be carrying a lot?",
    "Describe one way we can share the weight of an ordinary busy day.",
    "What would feeling ten percent less stretched look like for you tonight?"
  ],
  "gentle-signal": [
    "Choose a tiny phrase that means I have room to listen if you want company.",
    "Invent a message for I need a pause, and I still care about this conversation.",
    "What low-pressure question could invite us to reconnect after a distracted day?",
    "Design a small signal for asking whether now is a good time to talk.",
    "Choose a gesture that could mean thank you for understanding without interrupting the moment.",
    "What could we say when we want closeness but do not know what kind yet?",
    "Invent a lighthearted signal for I am getting overwhelmed; can we slow down?",
    "What brief message would reassure you that a quiet reply is not a lack of affection?",
    "Create a phrase for I would love to share something good when you have a minute.",
    "What gentle opening could help us return to a conversation we left unfinished?",
    "Choose a small check-in that leaves room for either yes, later, or not today."
  ],
  "five-minute-tradition": [
    "Design a five-minute reunion ritual for days when we have been in different places.",
    "Invent a tiny weekly celebration that requires no purchases or preparation.",
    "What five-minute tradition could turn the end of a chore into a moment together?",
    "Create a short rainy-day ritual with a name that makes us both smile.",
    "Design a tradition we can share by message when our schedules do not overlap.",
    "What could we do for five minutes before a busy weekend to feel like a team?",
    "Invent a tiny ritual for noticing one good thing about our ordinary surroundings.",
    "Create a five-minute tradition built around a song we both enjoy.",
    "What short routine could make a Sunday evening feel a little more welcoming?",
    "Design a five-minute adventure that starts at the nearest doorway.",
    "Invent a tradition with a smaller version for days when we have only one minute."
  ],
  "museum-of-us": [
    "Design a visiting exhibition about a place we both love, using three objects you would borrow.",
    "Which shared moment deserves an entire room in the Museum of Us?",
    "Write the first lines of the audio guide for the exhibit about how we met.",
    "Describe an exhibit that only the two of us would understand.",
    "Our museum has a room for plans that went wrong. What is its most beloved exhibit?",
    "Choose a sound for an interactive exhibit about our everyday life.",
    "Write a curator note for an object we used until it nearly fell apart.",
    "What belongs in the museum gift shop that visitors would find puzzling but we would love?",
    "Design a temporary exhibition about our funniest shared habit.",
    "Write a museum label for a place we cannot physically bring into the collection.",
    "What would you put in a small display called The Beginning of This Chapter?"
  ],
  "wrong-answers-only": [
    "Why do we take so long to choose dinner? Wrong answers only.",
    "What is the secret purpose of our most ordinary shared routine? Be completely incorrect.",
    "Explain why we make each other laugh using the least plausible scientific theory.",
    "Where are we going on our next date? Give the most confidently wrong answer.",
    "What are we actually doing when we say we are having a quiet night in?",
    "Why does one of us always need a snack? Invent a ridiculous explanation.",
    "Explain how we first met as if every important detail had been misheard.",
    "What is the true meaning of our favorite inside joke? Answers must be spectacularly wrong.",
    "Why are we so qualified to run an imaginary tiny kingdom? Give terrible evidence.",
    "What is our couple superpower? Invent the least useful possible option.",
    "Explain why an ordinary household object is obviously our relationship coach."
  ],
  "couple-mascot": [
    "Invent a mascot for our rainy-day plans, including its name and most impractical accessory.",
    "Our mascot needs a rival who is still very lovable. Describe them both.",
    "What would a tiny creature representing our shared sense of humor look like?",
    "Design the mascot of our imaginary kitchen and its signature catchphrase.",
    "Create a mascot for our ability to get through a long week together.",
    "Our mascot has one completely useless magical power. What is it?",
    "Write the first paragraph of our mascot biography, including its suspicious origin.",
    "What advice would a mascot based on our best shared habit give us tonight?",
    "Choose an animal, an outfit, and a favorite snack for our weekend-adventure mascot.",
    "Our mascot is applying for a job. What does its reference from us say?",
    "Design an emblem featuring our mascot that we would put on an imaginary club jacket."
  ],
  "tiny-shark-tank": [
    "Pitch an unnecessary gadget that would settle our imaginary blanket disputes.",
    "Invent a product that improves choosing dinner by a very questionable amount.",
    "Sell us a subscription box for our most specific shared interest.",
    "Pitch a tiny service that makes a boring errand slightly more romantic.",
    "Invent a ridiculous app for people who share our sense of humor. Give the sales pitch.",
    "Our inside joke becomes a product. What is it, and why would exactly two people buy it?",
    "Pitch an invention that solves a problem we only encounter on lazy Sundays.",
    "Sell us an extremely overengineered way to leave each other a nice note.",
    "Invent a date-planning device with one brilliant feature and one obvious flaw.",
    "Pitch a travel accessory designed specifically for the two of us.",
    "Our imaginary company needs a flagship product for cozy evenings. Convince your partner to invest."
  ],
  "plot-twist": [
    "Retell a shared journey with one invented passenger. Can your partner spot the addition?",
    "Describe a real meal together but secretly change one dramatic detail.",
    "Retell an ordinary errand as an adventure with one fake obstacle for your partner to identify.",
    "Choose a memory and replace one object with an absurdly expensive version. What changed?",
    "Tell a real story from our early days but sneak in one impossible coincidence.",
    "Describe a shared celebration with one convincing but invented surprise.",
    "Retell a small mishap while adding one imaginary heroic rescue.",
    "Describe a real place we have visited with one extra room that never existed.",
    "Tell the story of a good evening while changing one line of dialogue. Can I guess which?",
    "Give a shared memory a different ending and let your partner find where reality changed.",
    "Retell an inside-joke origin with one fake witness. Let your partner investigate."
  ],
  "soundtrack-shuffle": [
    "Choose a song for getting ready, one for the journey, and one for the ride home from a date.",
    "Build a three-song soundtrack for a rainy afternoon that gradually gets cozier.",
    "Pick songs for our imaginary cooking-show opening, kitchen disaster, and happy ending.",
    "Choose one song each for our past, our present, and a future adventure.",
    "Make a three-track playlist for surviving an ordinary chore together with style.",
    "Pick a song to make us laugh, a song to help us slow down, and a song for a goodnight.",
    "Choose the soundtrack for a tiny road trip: leaving, getting lost, and finding something lovely.",
    "Build the three-song score for our relationship as a wonderfully low-budget film.",
    "Pick songs for a quiet morning, a spontaneous afternoon, and a long conversation after dark.",
    "Choose a track for each of us and a third that sounds like us together.",
    "Make a three-song soundtrack for our imaginary home: the doorway, the kitchen, and the sofa."
  ],
  "emoji-forecast": [
    "Predict our ideal weekend using five emoji, then explain the one your partner is least likely to guess.",
    "Describe a recent shared adventure using five emoji with no words until your partner guesses.",
    "Give tomorrow a five-emoji forecast with one hopeful surprise in it.",
    "Tell the story of our first meeting in five emoji, then decode the strangest choice.",
    "Describe the date you would like next using five emoji and one very unhelpful clue.",
    "Make a five-emoji weather report for our imaginary holiday together.",
    "Predict the plot of our next grocery trip using exactly five emoji.",
    "Use five emoji to describe what a wonderfully lazy day together would contain.",
    "Give our current chapter a five-emoji title sequence and explain your casting choices.",
    "Choose five emoji for an evening that starts badly and ends sweetly. What happens?",
    "Send future-us a forecast in five emoji for something you hope we will try together."
  ],
  "closer-than-words": [
    "What kind of quiet company makes you feel especially understood?",
    "Describe a small shared routine that helps distance feel less important.",
    "When do you most appreciate your partner noticing something without being asked?",
    "What is a gentle way to reconnect when we are both distracted?",
    "Which familiar sound, look, or gesture from your partner feels like an invitation?",
    "What tiny detail can turn a practical conversation into a warm one for you?",
    "Describe an ordinary moment when doing the same thing side by side felt connecting.",
    "What could we do for a minute together when neither of us has words left?",
    "Which small sign tells you that your partner is fully present with you?",
    "What affectionate habit would you like us to notice more deliberately?",
    "Describe a moment when silence between us felt comfortable rather than empty."
  ],
  "date-trailer": [
    "Write a trailer for a date that begins with a shared umbrella and a very small mystery.",
    "Our next cozy night becomes a blockbuster. Give it a voice-over and a closing title card.",
    "Tease an ideal date without naming the location, the food, or the activity.",
    "Write a romantic-comedy trailer about two people attempting one ordinary errand together.",
    "Give our dream day trip a dramatic trailer with one excellent review quote.",
    "Write the trailer for a date told entirely through its sounds and tiny details.",
    "Our date trailer has the wrong movie genre. Make an innocent picnic sound like a thriller.",
    "Pitch a date trailer with one spectacular promise that costs absolutely nothing.",
    "Write a trailer for a sequel to a date we would happily revisit.",
    "Tease a spontaneous date using three quick scenes and one unanswered question.",
    "Write a trailer for our ideal slow evening as if it were the adventure of a lifetime."
  ],
  "favorite-detail": [
    "What is a small detail in how I speak that you think you would recognize anywhere?",
    "Describe one tiny habit of mine that makes an ordinary moment unmistakably ours.",
    "What detail do you notice when your partner becomes excited about something?",
    "Which small thing about my handwriting, messages, or word choices do you like?",
    "Name a detail about the way your partner moves through a familiar place.",
    "What ordinary preference of mine have you learned so well you can predict it?",
    "Describe a small thing your partner does when they are concentrating.",
    "What is a detail about me that you first overlooked and now find endearing?",
    "Which little expression, phrase, or gesture would you include in a portrait of us?",
    "What tiny sign tells you that I am having a particularly good day?",
    "Name one small detail you would point out if someone asked what makes me me."
  ],
  "green-light-tonight": [
    "Would a sweet message, a little flirting, quiet company, or space feel nicest tonight? You can choose none.",
    "What is a low-pressure invitation you would enjoy receiving today, if any?",
    "Name one kind of affection that sounds welcome and one that can wait. Passing is welcome too.",
    "Would you rather be listened to, made to laugh, or left room to rest tonight?",
    "What would help an invitation feel easy to accept or decline without awkwardness?",
    "If you could set the pace of a cozy evening together, what pace would feel comfortable?",
    "What kind of compliment would feel good today? It is okay to prefer no spotlight.",
    "Choose a small way we could show care tonight that asks very little of either of us.",
    "Would you welcome a playful question, a tender one, or a change of subject right now?",
    "What is one gentle way to ask whether you are in the mood for closeness?",
    "What could an especially considerate goodnight look like for you tonight?"
  ],
  "chemistry-recipe": [
    "Write a recipe for our perfect ordinary evening, including one ingredient that cannot be bought.",
    "Our laughter is a recipe. What are its three main ingredients and its secret seasoning?",
    "Invent a drink named after our chemistry and explain what each ingredient represents.",
    "What happens if you mix our two strongest qualities with one tiny shared flaw?",
    "Write the instructions for making a good date from one simple plan and two curious people.",
    "Give a favorite shared memory a recipe title and a list of emotional ingredients.",
    "What ingredient would you add to our week, and which one has been a little overpowering?",
    "Describe our teamwork as a recipe that somehow works despite the unusual combination.",
    "Invent a cozy-night recipe with a generous helping of something your partner does well.",
    "Write a warning label for a recipe containing too much of our shared sense of humor.",
    "What are the essential ingredients in a reunion that feels like us?"
  ],
  "doorstep-scene": [
    "Write the first three lines of a reunion scene on a rainy evening, with a familiar bag by the door.",
    "We meet at a station after time apart. What do we each say before going anywhere?",
    "Write a reunion scene where the first meaningful thing is a small gesture rather than a speech.",
    "Imagine arriving with terrible travel hair and excellent news. Write the doorway conversation.",
    "Write three lines for a quiet reunion when one of us is too tired to tell the whole story yet.",
    "Our reunion takes place in a busy airport. Describe how we find each other in the crowd.",
    "Write the first few lines of seeing each other after a long day rather than a long absence.",
    "Imagine a reunion in a place neither of us has visited. What familiar thing happens first?",
    "Write a doorstep scene with one tiny surprise hidden behind your back.",
    "Describe our reunion as the opening of a cozy film, including the first sound we hear.",
    "Write three lines of a reunion scene where everything goes a little wrong and we laugh anyway."
  ]
}
```


## Original and expanded activity prompts

Source: `src/features/session/expandedPromptData.js`.

### `ACTIVITY_PROMPT_VARIANTS` (63 entries)

```json
{
  "comfort-menu": [
    "When I go quiet after a hard day, the kindest first move is...",
    "Build me a three-item comfort menu for a low-energy night: one thing to say, one thing to do, and one thing to bring.",
    "What helps you feel cared for when words feel tiring?",
    "Design a ten-minute reset we can do from different places.",
    "What should I remember about you on a difficult morning?",
    "You have had a disappointing day. Would you like company, a distraction, practical help, or something else?",
    "What small comfort from your childhood would you like to share with me?",
    "How could we make waiting for difficult news a little gentler together?",
    "Describe your ideal welcome after a tiring journey, from the door to the first drink.",
    "When plans fall through, what helps you feel that the evening is still ours?",
    "What does useful comfort look like when you are excited but nervous about something new?"
  ],
  "small-mercies": [
    "What ordinary thing did I make easier for you lately without realizing it?",
    "Name one quiet way I showed up for us this week that deserves a tiny celebration.",
    "Which tiny task feels lighter when we share it?",
    "What did we quietly get right this month?",
    "What is a small kindness you want more room for?",
    "Which moment this week became easier because you knew I was in your corner?",
    "What did I remember recently that made you feel listened to?",
    "Name a small kindness we could offer each other on busy days without adding another task.",
    "What is an everyday favor between us that deserves a better thank-you?",
    "Which of our differences has quietly helped you lately?",
    "What is a kind thing your partner does for other people that you admire?"
  ],
  "weather-report": [
    "If your inner weather had a forecast for tomorrow, what would it predict and what might change it?",
    "Describe today as a season, a temperature, and one thing moving through the sky.",
    "What would help your inner weather clear tonight?",
    "What part of your day felt like sunshine?",
    "If we shared an umbrella today, what would it shelter us from?",
    "Give your energy, patience, and hope their own weather forecasts for tonight.",
    "What is one cloud you would like me to sit beside without trying to move it?",
    "Which feeling surprised you today like an unexpected change in the weather?",
    "Describe our week as a landscape, including one comfortable place to rest.",
    "What would a gentle change of pace look like for tomorrow?",
    "If your mood had a weather advisory, what would you want me to know before coming closer?"
  ],
  "receipts": [
    "Find a photo of an ordinary day together. Why did that small moment become worth keeping?",
    "Choose a shared photo you would place in a tiny museum. What would its exhibit card say?",
    "Pick a photo that makes you remember a sound.",
    "Choose a picture whose best story happened off camera.",
    "Find a photo that deserves a second caption today.",
    "Find a shared photo you nearly deleted. What makes it worth keeping now?",
    "Choose a picture from a journey. What happened on the way there?",
    "Which photo captures a version of us you would like to thank?",
    "Pick a picture with food in it. What else was happening at that table?",
    "Find a photo where one small background detail tells the real story.",
    "Choose a picture of somewhere ordinary. How did that place become part of us?"
  ],
  "future-artifact": [
    "Choose three objects from your life now that future-you should never throw away. Why those three?",
    "What object from the next chapter of your relationship do you hope exists one year from now?",
    "What little object would represent our next adventure?",
    "What should go on a shelf labeled Our Ordinary Magic?",
    "Choose a keepsake we could make rather than buy.",
    "What everyday object would prove to future archaeologists that we were a very good team?",
    "Design a tiny keepsake for a milestone we have not reached yet.",
    "Which worn-out object from our lives deserves to be repaired and kept?",
    "Imagine a receipt from our ideal future weekend. What would be listed on it?",
    "What note should we attach to a treasured object so its story is not forgotten?",
    "If our future home had a drawer for this chapter, what would go inside first?"
  ],
  "translation": [
    "A small action from you that always translates to “I am on your side” is...",
    "What do I do that means “I missed you” even when I never say those words?",
    "What does your version of I need company look like?",
    "Which little gesture says welcome home to you?",
    "How can I tell when you want encouragement rather than advice?",
    "When you say you are fine but still want company, how could I recognize the invitation?",
    "What does making room for you look like in an ordinary conversation?",
    "How do you show that you are proud of someone when a big speech feels awkward?",
    "What little action from me means I remembered you while we were apart?",
    "Finish this translation: when I ask for a quiet evening, I am really hoping for...",
    "Which kind of check-in feels caring to you without needing an immediate reply?"
  ],
  "director-commentary": [
    "Give the director commentary for one tiny moment when you first realized this relationship mattered.",
    "If this week were one scene in your love story, what detail would the camera linger on?",
    "Describe a moment when we made a surprisingly good team.",
    "Which ordinary scene of us deserves a slow-motion replay?",
    "Give the opening line of a documentary about our weekend.",
    "Narrate our first ordinary errand together as if it secretly changed the whole film.",
    "Choose a shared mishap and explain which scene the editor should absolutely keep.",
    "What would the costume designer notice about a favorite day we spent together?",
    "Describe a quiet moment between us using only what the audience could see and hear.",
    "Give a deleted scene from our week a title and explain why it deserves to return.",
    "If our next chapter opened with one shot, where would the camera find us?"
  ],
  "growth-ring": [
    "What is one way the two of you handle hard conversations better than you used to?",
    "Which version of your relationship would be proudest of the way you work together now?",
    "What have we learned to laugh about together?",
    "Which shared habit has made our lives easier?",
    "Name a challenge we would handle differently now.",
    "What have you become more comfortable asking me for since we first met?",
    "Which small adjustment has helped us understand each other better?",
    "What would you tell an earlier version of us about taking things at our own pace?",
    "Name a mistake that taught us something useful without becoming our whole story.",
    "What is a shared strength we have built through ordinary repetition?",
    "Which difference between us do you understand with more kindness now?"
  ],
  "anchor-memory": [
    "Which shared memory can still calm your nervous system when you replay it slowly?",
    "Choose a memory that feels like a safe room. What is the first detail you notice when you enter it?",
    "Describe a shared place using only sounds and smells.",
    "What moment reminds you that we can figure things out?",
    "Which tiny detail from an old date still stays with you?",
    "Recall a time when we did not have a plan but still felt okay together.",
    "Which shared memory makes you feel most like yourself?",
    "Remember a moment when we laughed after something went wrong. What broke the tension?",
    "Describe a familiar route that carries a good memory of us.",
    "What is one sentence from a past conversation you still carry with you?",
    "Choose a peaceful memory and describe where each of us was sitting or standing."
  ],
  "gratitude-snapshot": [
    "Take a photo of one ordinary thing near you that you wish your partner could see right now, then explain why.",
    "Photograph the light where you are and caption it with one thing your partner brought into your day.",
    "Show something nearby that reminds you of us.",
    "Photograph an everyday object and give it a thank-you note.",
    "Share a view you would like us to see together.",
    "Describe a small detail in your current view that your partner would probably appreciate.",
    "If you framed one moment from today as a thank-you, what would the caption say?",
    "Choose a color around you and connect it to something you appreciate about us.",
    "Describe an empty space nearby where you wish your partner could sit for a minute.",
    "What unnoticed corner of your day would you like to show me, and why?",
    "Imagine a before-and-after picture of a day your partner made better. What changes?"
  ],
  "cursed-date-12": [
    "Plan a date using only things found in a grocery store and a parking lot. Make it weirdly excellent.",
    "You have fifteen dollars, one hour, and terrible weather. Build the date anyway.",
    "Plan a date where every purchase must be yellow.",
    "Create a luxury date with the contents of one drawer.",
    "Plan the finest possible date at an airport during a delay.",
    "Plan a charming date in a laundromat while every dryer is occupied.",
    "Build a date around a bus ride, a shared umbrella, and absolutely no sense of direction.",
    "Our reservation is accidentally at a garden center. Make this the date of the year.",
    "Plan an elegant anniversary using only items from a convenience-store clearance shelf.",
    "Design a date for two people wearing fancy clothes in a very unfancy place.",
    "We have one bench, two snacks, and a town neither of us knows. What happens next?"
  ],
  "yelp-review": [
    "Review your partner as if they were a five-star roadside attraction. Be extremely specific.",
    "Write a glowing review of your relationship as if it were a tiny neighborhood café.",
    "Review our teamwork as a tiny moving company.",
    "Write a review of your partner as a personal tour guide.",
    "Give our most ordinary evening an absurd five-star review.",
    "Review your partner as a hotel, including the breakfast service and one wonderfully specific amenity.",
    "Give our shared sense of direction a generous review that somehow remains honest.",
    "Review an imaginary business that sells the kind of hugs we like.",
    "Write a customer review of our ability to choose something to watch.",
    "Review your partner as an emergency snack-delivery service during a very long day.",
    "Describe our inside jokes as a tourist attraction with confusing opening hours."
  ],
  "lore-drop": [
    "Turn one completely normal couple habit into an ancient prophecy.",
    "Explain the secret mythology behind an object the two of you see every day.",
    "Invent the legend of our missing socks.",
    "Give a household object a scandalous backstory.",
    "Explain our favorite snack as a sacred family tradition.",
    "Explain why one of our usual phrases is actually the password to an enchanted city.",
    "Give a favorite shared meal a heroic origin involving a terrible misunderstanding.",
    "Invent the ancient rivalry between two objects in our imaginary home.",
    "Tell the legend of the first time we successfully chose what to watch.",
    "Explain an ordinary shared habit as if you are a historian from a thousand years in the future.",
    "Which tiny event from our week would a traveling storyteller exaggerate beyond recognition?"
  ],
  "two-truths-one-dream": [
    "Share two real future plans and one impossible dream date. Let your partner find the impossible one.",
    "Offer two accurate memories and one detail you wish had happened. Which detail is the beautiful fake?",
    "Name two places you have been and one you wish existed.",
    "Share two real talents and one ridiculous power you want.",
    "Offer two true childhood favorites and one convincing fake.",
    "Offer two real things you would pack for a trip and one wildly impractical dream item. Let me guess.",
    "Name two skills you have tried and one you only wish you had. Which is the dream?",
    "Share two true things about your ideal day and one invented detail for me to spot.",
    "Give me two real childhood ambitions and one career your younger self never considered.",
    "Describe two real gifts you have received and one dream gift. Let your partner find it.",
    "Share two genuine places on your wish list and one imaginary destination. Which one did you invent?"
  ],
  "alternate-job": [
    "Give your partner a highly specific job in a fantasy kingdom and defend the appointment.",
    "What oddly niche competition would your partner secretly dominate on television?",
    "Assign your partner a job on a very small spaceship.",
    "What would your partner teach at a school for dragons?",
    "Invent an award only your partner could win.",
    "What would your partner do at a hotel for mythical creatures, and who would be their favorite guest?",
    "Assign your partner a role in a museum where all the exhibits have escaped.",
    "Which highly specific problem would make someone call your partner as the world expert?",
    "Invent a tiny shop your partner could run brilliantly, including its most popular item.",
    "Give your partner a behind-the-scenes job on the film of our lives.",
    "If we ran a radio station for one day, what would each of our shows be called?"
  ],
  "apocalypse-role": [
    "The power is out for a week. Assign each of you one useful role and one deeply unnecessary role.",
    "Your train is stranded overnight. Who handles logistics and who becomes entertainment director?",
    "Who negotiates with the aliens, and who serves snacks?",
    "Assign our jobs on an island with excellent Wi-Fi.",
    "What is our emergency plan for a town overrun by puppies?",
    "We are snowed in at a library. Who organizes survival, and who starts the book club?",
    "The robots have taken every job except two. Invent the roles we save for ourselves.",
    "We must turn an abandoned cinema into a home. What does each of us tackle first?",
    "The town has lost the ability to make decisions. Which tiny decision do we each take charge of?",
    "We have to lead a caravan of very dramatic cats. Divide the responsibilities.",
    "Our island needs one useful invention and one morale-boosting luxury. Who makes which?"
  ],
  "pet-peeve-love-letter": [
    "Deliver a dramatic acceptance speech thanking your partner for their most lovable annoying habit.",
    "Turn one tiny pet peeve into a luxury feature you would proudly advertise.",
    "Write an affectionate product description for a quirky habit.",
    "Turn our messiest routine into a royal ceremony.",
    "Give a tiny disagreement a completely overblown movie title.",
    "Write a tender apology to an object caught in the middle of one of our harmless disagreements.",
    "Describe a lovable quirk of mine as a feature in an extremely expensive brochure.",
    "Give one of our recurring tiny debates a ceremonial opening statement.",
    "Write a love note to the way we are both a little inconvenient sometimes.",
    "Nominate one harmless habit for a lifetime achievement award and read the citation.",
    "Turn a small difference in our routines into an affectionate two-line poem."
  ],
  "wikipedia-us": [
    "Write the section heading for the most chaotic era of your relationship and summarize it in one sentence.",
    "What oddly specific fact belongs in the “Legacy” section of your shared encyclopedia page?",
    "Write the entry for our most quotable phrase.",
    "Give our favorite ordinary place an official historical marker.",
    "Name three chapters in the unofficial history of us.",
    "Write the Early History section of our encyclopedia entry using three very serious facts.",
    "What belongs in the Cultural Impact section about our influence on snack consumption?",
    "Invent a footnote explaining one phrase that outsiders never understand.",
    "Write the Geography section describing our most frequently visited places.",
    "Give a shared adventure a historical name and a one-sentence summary.",
    "What would the References section cite as evidence that we make a good team?"
  ],
  "theme-song": [
    "Choose the song that should play when the two of you enter a room this week. Explain the choreography.",
    "What three sounds belong in the opening five seconds of your current couple theme?",
    "Choose an entrance song for our next grocery trip.",
    "Invent a three-line jingle for our teamwork.",
    "What song would play while we make breakfast?",
    "Choose a theme for the moment we finally settle on dinner after discussing every possible option.",
    "What instrument would represent each of us in a duet about our week?",
    "Write the chorus of a theme song for our least glamorous shared chore.",
    "Pick a song for the walk home after a really good date. What part would we sing?",
    "Our relationship becomes a cooking show. Describe its opening theme.",
    "Choose an unexpectedly dramatic song for a very small victory we recently shared."
  ],
  "villain-origin": [
    "Invent the minor inconvenience that turns your partner into a glamorous supervillain.",
    "Design your shared villain lair, including the one domestic feature neither of you would compromise on.",
    "Invent a villain whose weakness is our favorite snack.",
    "What ridiculous rule would we impose as benevolent rulers?",
    "Design our villain uniforms with one very practical feature.",
    "Your partner becomes a villain after a disappointing sandwich. What is their first decree?",
    "Design our villain getaway vehicle with room for one unnecessary comfort.",
    "What would your partner demand in exchange for returning all the missing teaspoons?",
    "Invent a hero whose only power can defeat our most ridiculous villain plan.",
    "Write the apology our villain duo sends after accidentally improving the town.",
    "What is the one wholesome hobby our villain characters refuse to give up?"
  ],
  "replay-favorite-kiss": [
    "Which almost-kiss or quick goodbye kiss deserves a slower replay, and what made it stay with you?",
    "Describe a kiss you remember mostly because of what happened immediately before or after it.",
    "What made one goodbye feel especially sweet?",
    "Describe a moment when a kiss felt like a fresh hello.",
    "Where would you like a quiet affectionate moment again?",
    "What do you remember about the place around a kiss that mattered to you?",
    "Describe the anticipation before an affectionate moment you still smile about.",
    "Which ordinary hello would you turn into an unhurried reunion?",
    "What song, sound, or bit of weather belongs in the background of a kiss you remember?",
    "Imagine recreating a sweet moment with none of the original scenery. What would still matter?",
    "What would your ideal goodnight kiss say without using any words?"
  ],
  "wanted-list": [
    "What is one way your partner pays attention that makes you feel unmistakably chosen?",
    "Name one sentence from your partner that can make you feel wanted without being flirty at all.",
    "What small invitation makes you feel included?",
    "How do you like to be welcomed after a busy day?",
    "Name a moment when you felt especially appreciated.",
    "What kind of invitation tells you that I am choosing your company rather than just filling time?",
    "When do you most enjoy being asked for your opinion?",
    "What detail do you love it when I remember without being reminded?",
    "How would you like me to celebrate an achievement that feels small to everyone else?",
    "What makes a message feel personal to you rather than just a routine check-in?",
    "Describe a moment when your partner made room for your interests, even if they were not their own."
  ],
  "slow-morning": [
    "Design a no-alarm morning together using five small details from waking up through breakfast.",
    "What would make a rainy morning together feel luxurious without leaving the house?",
    "Choose the soundtrack, breakfast, and view for a slow morning.",
    "What morning chore would we happily postpone?",
    "Design a leisurely morning together from two different cities.",
    "We wake up somewhere unfamiliar with no obligations. What is the first thing we explore?",
    "Describe a slow morning when one of us wants quiet and the other wants to chat.",
    "Plan a relaxed breakfast using three things already in your kitchen.",
    "Imagine our ideal winter morning. What keeps us from rushing?",
    "What small preparation tonight could give us a gentler morning tomorrow?",
    "Write a postcard from a lazy morning we might share ten years from now."
  ],
  "confidence-fit": [
    "Describe the version of your partner who walks into a room already knowing they look incredible.",
    "Which color, texture, or tiny styling detail brings out your partner’s confidence most?",
    "What makes you feel comfortable and completely yourself?",
    "Name a look of mine that reminds you of a happy day.",
    "What confidence boost would you give your partner today?",
    "Choose an imaginary outfit for your partner to wear while accepting an award they deserve.",
    "Which piece of clothing carries a particularly good memory for you?",
    "What would you wear on a date where feeling like yourself mattered more than dressing up?",
    "Describe a tiny getting-ready ritual that helps your confidence arrive.",
    "If we each picked one accessory for the other, what would we choose and why?",
    "What compliment about your style would feel especially good to hear?"
  ],
  "whisper-line": [
    "You get one sentence in your partner’s ear before a crowded room goes quiet. What do you say?",
    "What six-word message would make your partner blush if it arrived at exactly the right moment?",
    "Write a tiny invitation for a date at home.",
    "What would you whisper before we step onto a dance floor?",
    "Leave a playful six-word note in an imaginary coat pocket.",
    "What would you quietly say to your partner just before they do something brave?",
    "Write a whispered compliment that mentions no part of how your partner looks.",
    "We are pretending to be strangers at a party. What is your first quiet line to me?",
    "What one-sentence invitation would make an ordinary evening feel like a secret date?",
    "Choose a line for the moment we sneak away from a noisy gathering to get some air.",
    "What could you whisper during a dull errand that would make your partner grin?"
  ],
  "scent-memory": [
    "Build the scent of a favorite shared memory from three notes: something warm, something fresh, and something unexpected.",
    "What familiar scent would you bottle as an instant portal back to the two of you?",
    "What kitchen smell reminds you of a shared moment?",
    "Describe a place we love without naming it.",
    "What would a candle named after our weekend smell like?",
    "Which outdoor smell brings back a place you would like to visit with me?",
    "Describe the imaginary fragrance of the first chapter of our relationship.",
    "What smell would you hope to notice first when arriving at our ideal weekend getaway?",
    "Choose a familiar scent and tell me a story about it that I might not know.",
    "If a shared meal had a scent-based postcard, what would it remind us of?",
    "What three scents would make a place feel like home to you?"
  ],
  "favorite-way-held": [
    "What kind of hug do you want when you need courage, and how is it different from a celebration hug?",
    "Describe the exact hand squeeze, shoulder lean, or cuddle position that says “stay here a minute.”",
    "What kind of welcome hug sounds best today?",
    "How do you ask for closeness when you are tired?",
    "Describe an affectionate gesture that helps you feel grounded.",
    "What kind of closeness would feel welcome after a day full of people?",
    "Describe a comfortable way to sit together while doing completely different things.",
    "How could we make a hug feel like a question you are free to answer?",
    "What is the difference between the comfort you want before a challenge and after it?",
    "Imagine a chilly evening outside. What small affectionate gesture sounds nicest?",
    "What should I know about when you prefer company nearby without being touched?"
  ],
  "look-you-love": [
    "What expression crosses your partner’s face right before they laugh for real?",
    "Describe the look your partner gives when the two of you share a thought nobody else caught.",
    "What expression tells you I have a surprise planned?",
    "Describe your partner concentrating on something they love.",
    "What face do we make when we know the same joke is coming?",
    "Describe the expression your partner makes when they are trying not to spoil a surprise.",
    "What look tells you your partner has just had a very good idea?",
    "Which expression of yours do you think I would recognize from across a busy room?",
    "What does your partner look like when they feel completely at ease?",
    "Describe the face your partner makes when a favorite meal arrives.",
    "What expression would you put on a tiny portrait of your partner, and why?"
  ],
  "secret-admiration": [
    "What quality in your partner has become more attractive the longer you have known them?",
    "Name a completely ordinary moment when your partner looked especially beautiful to you.",
    "Which effort of yours do you wish I noticed more?",
    "What thoughtful quality in your partner deserves a spotlight?",
    "What ordinary skill of theirs makes you smile?",
    "What is a way your partner treats people that makes you quietly proud?",
    "Name a strength in your partner that they tend to underestimate.",
    "What do you admire about how your partner approaches something they are still learning?",
    "Which small act of courage have you noticed in your partner lately?",
    "What is something your partner cares about that has helped you see it differently?",
    "Finish this sentence: I hope you know how much I admire the way you..."
  ],
  "rewind-touch": [
    "Replay one tiny touch that made a public moment feel private for a second.",
    "Which small affectionate habit—hand on a shoulder, forehead touch, knee bump—would you never want to lose?",
    "What small goodbye ritual would you like to keep?",
    "Describe a moment when a hand squeeze said enough.",
    "What gentle gesture could we make a daily tradition?",
    "Which ordinary moment would you like to mark with a small affectionate gesture?",
    "Describe a brief touch that helped you feel less alone in a crowded place.",
    "What small greeting could we make our own without needing a big occasion?",
    "What is a tiny gesture you would choose for wishing your partner good luck?",
    "Recall a time when sitting close was more comforting than finding the right words.",
    "Imagine a quiet reunion at a station. What is the first gentle gesture you would offer?"
  ],
  "postcard-next-year": [
    "Write two sentences to us one year from now about something ordinary you hope we still enjoy.",
    "Leave our future selves a question about a small hope you have for the coming year.",
    "Tell next-year us what makes this chapter worth remembering, even if life changes.",
    "Write a postcard to our future selves describing a tradition you hope we have started.",
    "What should us-a-year-from-now remember about how we look after each other today?",
    "Leave a two-sentence prediction about a tiny adventure we might have before this note opens.",
    "Write to our future selves about something we are learning to do together right now.",
    "Tell next-year us one thing you hope they have made more time for.",
    "Describe a little pleasure from today that you hope still exists in our lives in twelve months.",
    "Leave future-us a gentle reminder about taking life at our own pace.",
    "Write a two-sentence toast for the day we read this note together a year from now."
  ],
  "map-pin-wish": [
    "Imagine a pin on a map of your hometown. Where would you take me first, and why?",
    "Choose a place within a short walk where you would like a tiny date together.",
    "Think of a place we have never visited. Give three clues so I can guess your choice.",
    "Where would you place a map pin for a day when we both need a little quiet?",
    "Pick a place from your childhood you would like me to understand through your eyes.",
    "Choose a spot for a future picnic and describe what we would see from our blanket.",
    "Which place on our shared map deserves another visit for a completely different reason?",
    "Imagine a pin labeled No plans needed. Where is it, and what do we do there?",
    "Pick a meeting point halfway between our imaginary dream destinations. Describe the compromise.",
    "What place would you choose for watching the sun come up together?",
    "Place an imaginary pin somewhere ordinary that could become special with the right company."
  ],
  "house-rules": [
    "Invent a house rule for rainy Sundays that protects our right to be wonderfully unproductive.",
    "Create a ridiculous rule about what happens when someone finishes the last snack.",
    "Our future house has a ceremonial entrance greeting. What is the rule?",
    "Write a house rule that makes doing an annoying chore slightly more amusing.",
    "What is the official policy for adopting a very ugly but lovable decorative object?",
    "Invent a rule for choosing music when our imaginary kitchen becomes a dance floor.",
    "Our house needs a constitution for blanket ownership. Write its first article.",
    "Create a house rule that allows a spontaneous tiny celebration on an ordinary day.",
    "What harmless behavior earns the title of Household Hero for the evening?",
    "Write the rule posted beside a secret cupboard full of emergency treats.",
    "Invent a house rule our guests would find baffling but we would understand immediately."
  ],
  "unsent-draft": [
    "What small compliment have you thought about giving me but not found the moment for?",
    "Write the message you would send if you knew you did not have to phrase it perfectly.",
    "What funny observation from your day did you nearly send me?",
    "Share a question you have been meaning to ask me, with no pressure to answer tonight.",
    "What is a tiny invitation you almost made because it felt too ordinary to mention?",
    "Write a message that begins: There is a little thing I wanted to tell you...",
    "What happy news would you like to have interrupted my day with?",
    "Share an appreciation that would have made a past conversation feel more complete.",
    "What would you text me from the queue at a shop if the goal were simply to make me smile?",
    "Write a kind message to us from the version of you who sometimes overthinks sending it.",
    "What ordinary part of today deserved a quick thinking-of-you message?"
  ],
  "shared-seed": [
    "Imagine planting one tiny intention for us this week. What would help it grow?",
    "Our relationship has a little windowsill garden. Which habit gets its own pot?",
    "Choose a seed of an idea we could each spend five minutes nurturing.",
    "What would we name a plant that grows whenever we make time to listen?",
    "Which small shared effort deserves patient watering rather than instant results?",
    "Design an imaginary garden bed for the things we want more of in our evenings.",
    "What is one tiny action each of us could take to support the same hope?",
    "Pick a gardening metaphor for a habit we would like to care for more gently.",
    "What is already growing between us that we sometimes forget to notice?",
    "Imagine our first little harvest from a week of kindness. What do we gather?",
    "What would a sign beside our shared seed remind us on a day when progress feels slow?"
  ],
  "build-a-cult": [
    "Invent a silly secret society devoted to our favorite snack. Give it a greeting and a hat.",
    "Our most ordinary shared habit becomes a club. What is the very low-stakes initiation?",
    "Design the uniform for an organization dedicated to staying in on Friday nights.",
    "Write three absurd commandments for the Society of One More Episode.",
    "Our imaginary club has an annual festival. What harmless nonsense happens there?",
    "Invent a secret handshake for people who share our most specific enthusiasm.",
    "What ridiculously grand title would each of us hold in a club of exactly two?",
    "Create a recruitment poster for our imaginary order of excellent snack decisions.",
    "Our shared quirk needs a crest, a motto, and an official beverage. Choose all three.",
    "Invent a club tradition that turns one boring weekly task into a tiny ceremony.",
    "What completely optional vow would members of our very unserious society make?"
  ],
  "conspiracy-us": [
    "Make the case that a tiny coincidence from our week was arranged by romantic pigeons.",
    "Explain why our matching snack cravings are evidence of a completely harmless secret plot.",
    "Which ordinary object is obviously working behind the scenes to help our relationship?",
    "Invent a conspiracy connecting three unrelated details from the day we met.",
    "Prove, using terrible logic, that our favorite song has been following us on purpose.",
    "What would our imaginary detective board suggest about why we keep choosing the same dinner?",
    "Explain how a minor travel delay was secretly part of an elaborate meet-cute operation.",
    "Our pets or houseplants are running a matchmaking agency. What is your evidence?",
    "Choose an inside joke and explain why it must be a coded message from future-us.",
    "What suspicious pattern connects our best ordinary evenings?",
    "Invent the least believable explanation for why we make such a good team."
  ],
  "bad-advice": [
    "Give terrible advice for choosing dinner when both of us say we do not mind.",
    "Advise an imaginary couple who cannot agree on the temperature of a room. Be spectacularly unhelpful.",
    "What is the worst possible way to prepare for a relaxed weekend?",
    "Give me terrible advice for packing a bag for one night away.",
    "Explain the least efficient way we could decide what to watch together.",
    "Advise us on becoming morning people using only obviously ridiculous suggestions.",
    "What completely impractical advice would you give someone planning a surprise picnic?",
    "Solve the imaginary problem of having too many snacks in the worst possible way.",
    "Offer an absurd productivity tip for a couple who would rather take a nap.",
    "Give the worst possible advice for keeping a very small plant alive in an imaginary house.",
    "Invent a useless relationship tip from a self-help book written by a confused raccoon."
  ],
  "nudge-wars": [
    "Imagine leaving a tiny rubber duck on my board. What encouraging message comes with it?",
    "Choose an imaginary surprise to make my next boring task more entertaining.",
    "Design a harmless board-side prank with a reveal that would make us both laugh.",
    "Invent a tiny good-luck mascot I could imagine beside my next roll.",
    "Leave an imaginary disco ball somewhere unexpected and explain what we are celebrating.",
    "Choose a board-side snack offering and write its overly dramatic delivery note.",
    "What miniature sign would you leave to welcome me back to our little world?",
    "Invent an imaginary cactus with a surprisingly affectionate message attached.",
    "Leave me a pretend clue for finding a very small treasure. What is the treasure?",
    "Design the least intimidating challenge you could leave beside my piece.",
    "What imaginary surprise would say I know exactly what kind of day you have had?"
  ],
  "sound-capsule": [
    "Describe seven seconds of sound that would transport me to a place you love.",
    "Write a tiny soundscape for our perfect rainy evening, using three familiar noises.",
    "If you left me a sound from your childhood, what would I hear and why?",
    "Describe the sound of your day at its happiest point.",
    "Write out the noises our imaginary café makes just before opening.",
    "Choose one sound that means home to you and tell me the memory behind it.",
    "Describe a seven-second audio postcard from a trip we have not taken yet.",
    "What would the soundtrack to our shared laugh sound like without using music?",
    "Build a tiny sound capsule from a familiar voice, a background noise, and a moment of quiet.",
    "Describe a sound I would recognize immediately even if I could not see you.",
    "Imagine leaving a gentle goodnight sound on the board. What would it be?"
  ],
  "flirt-resume": [
    "Write the opening line of your application for the position of My Favorite Distraction.",
    "List three very specific qualifications for planning a date with me.",
    "Describe your signature flirting move as an overly formal professional skill.",
    "What would a reference from our best date say about your charm?",
    "Write a cover letter of two sentences explaining why I should hold your hand tonight.",
    "Your flirt resume needs a special achievement. Which sweet moment goes on it?",
    "Invent a charming job title for the way you make me laugh.",
    "What is one flirting skill you would like to practice on our next date?",
    "Write a personal statement that begins: I bring enthusiasm, excellent company, and...",
    "What would your partner put in the Strengths section of your flirt resume?",
    "Pitch yourself as a companion for an extremely ordinary errand that could become a date."
  ],
  "what-miss-today": [
    "What is one tiny part of sharing a room with me that you would welcome right now?",
    "Describe an ordinary sound of mine that you miss hearing nearby.",
    "What shared errand would you happily do today just for the company?",
    "Which little moment from your day would have been nicer if we had experienced it side by side?",
    "What detail of an unhurried evening together sounds especially good today?",
    "Imagine I could join you for ten minutes. Which ten minutes would you choose?",
    "What familiar greeting do you most look forward to when we next meet?",
    "Which routine feels most different when we are not doing it together?",
    "What is one thing you would point out to me if I were sitting beside you now?",
    "What small shared pleasure would you like us to make time for soon?",
    "Describe the place you would save for me next to you today."
  ],
  "date-that-never-ends": [
    "Our date begins at sunrise with no schedule. Describe the first three turns we take.",
    "Imagine a date where we can stay in each place until we are truly ready to leave. Where do we linger?",
    "Design a day together that moves from a busy place to somewhere peaceful without rushing.",
    "Write the middle of a date when we forget to check the time because the conversation is that good.",
    "We have a whole rainy day and nowhere to report back to. Tell the story of our date.",
    "Plan a date guided entirely by whatever smells delicious next.",
    "Our date can include one familiar place and one new place. How do they connect?",
    "Describe a wandering date in a city where neither of us knows the streets.",
    "Imagine a date with no purchases, no appointments, and a very comfortable pace.",
    "What would make us decide to keep an ordinary afternoon together going into the evening?",
    "Write the final scene of a date that gently becomes the next morning over breakfast."
  ],
  "after-hours-tile": [
    "Describe the kind of quiet company you would welcome at the end of tonight.",
    "What small detail in your face or posture would tell me how your evening has felt?",
    "Write an after-hours note that would make an ordinary room feel a little warmer.",
    "Imagine we are the last two people awake in a sleepy house. What do we talk about?",
    "What would your ideal last ten minutes together before sleep look like?",
    "Describe a favorite late-evening light and the scene you would share beneath it.",
    "What gentle question would you like to hear when the day is finally done?",
    "Choose one small comfort for an imaginary midnight kitchen visit together.",
    "Write a quiet invitation to sit beside you with no need to entertain each other.",
    "What part of yourself do you find easier to share when the evening slows down?",
    "Imagine a peaceful late-night walk together. What do we notice that daytime hides?"
  ],
  "landing-lights": [
    "Choose one thing from today to set down before we spend a few quiet minutes together.",
    "What short welcome would help your mind arrive here after a busy day?",
    "Design a two-minute landing ritual for evenings when neither of us has much energy.",
    "What should our imaginary home beacon say when one of us has had a difficult day?",
    "Name one small good thing we can bring from today into tomorrow.",
    "What kind of check-in would feel like a soft landing rather than another obligation?",
    "Write a one-sentence all-clear message for the end of a long day.",
    "Choose a sound, a drink, and a comfortable place for our end-of-day landing.",
    "What would you like us to leave outside the door of this evening for a little while?",
    "Imagine meeting at our home tile after separate adventures. What do you tell me first?",
    "What simple goodnight ritual could we keep even when our schedules do not match?"
  ],
  "rose-thorn-seed": [
    "Share one small win, one lingering worry, and one gentle intention for tomorrow.",
    "Name one moment you enjoyed, one that took effort, and one thing you would like to try together.",
    "Look back on our week: what felt warm, what felt tangled, and what deserves more room to grow?",
    "Offer one appreciation, one thing you need patience with, and one hope for our next evening.",
    "Describe a bright spot in your routine, a rough edge, and a tiny change that might help.",
    "Share one surprise you liked, one disappointment, and one possibility you are curious about.",
    "What should we celebrate, what could use care, and what would you like us to make time for?",
    "Name something that made you laugh, something that tired you, and something you are looking forward to.",
    "Give this chapter of us a rose, a thorn, and a seed using one sentence for each.",
    "Share one thing to keep doing, one to approach more gently, and one small experiment for us.",
    "What nourished you today, what drained you, and what might restore a little energy tomorrow?"
  ],
  "ordinary-treasure": [
    "Which everyday sound from a shared day would you put in a tiny treasure box?",
    "Recall a meal that mattered because of the company rather than the food.",
    "What unremarkable place became quietly special because we spent time there?",
    "Name an ordinary object that carries more of our story than anyone else would guess.",
    "Which small part of our routine would you miss if it disappeared?",
    "Describe a time when doing almost nothing together felt like exactly enough.",
    "What five-minute memory of us deserves a frame?",
    "Which ordinary journey would you happily take together again?",
    "What is a little kindness between us that has become so familiar you almost overlook it?",
    "Choose a shared moment with no special occasion and tell me why you kept it.",
    "What detail from today might become a treasure if we remember to notice it?"
  ],
  "invisible-backpack": [
    "Which unfinished thought has been taking up more space than it deserves lately?",
    "What is one responsibility you would like me to understand better without needing me to fix it?",
    "When your mind feels full, what kind of company makes room to breathe?",
    "Name one small decision that feels tiring right now and the support you would welcome.",
    "What is something you have been managing that has gone mostly unnoticed?",
    "If we could put one worry on a shelf until tomorrow, which would you choose?",
    "What would taking one thing off your mental checklist look like this week?",
    "Which expectation would you like permission to hold a little more loosely?",
    "What is a kind question I could ask when you seem to be carrying a lot?",
    "Describe one way we can share the weight of an ordinary busy day.",
    "What would feeling ten percent less stretched look like for you tonight?"
  ],
  "gentle-signal": [
    "Choose a tiny phrase that means I have room to listen if you want company.",
    "Invent a message for I need a pause, and I still care about this conversation.",
    "What low-pressure question could invite us to reconnect after a distracted day?",
    "Design a small signal for asking whether now is a good time to talk.",
    "Choose a gesture that could mean thank you for understanding without interrupting the moment.",
    "What could we say when we want closeness but do not know what kind yet?",
    "Invent a lighthearted signal for I am getting overwhelmed; can we slow down?",
    "What brief message would reassure you that a quiet reply is not a lack of affection?",
    "Create a phrase for I would love to share something good when you have a minute.",
    "What gentle opening could help us return to a conversation we left unfinished?",
    "Choose a small check-in that leaves room for either yes, later, or not today."
  ],
  "five-minute-tradition": [
    "Design a five-minute reunion ritual for days when we have been in different places.",
    "Invent a tiny weekly celebration that requires no purchases or preparation.",
    "What five-minute tradition could turn the end of a chore into a moment together?",
    "Create a short rainy-day ritual with a name that makes us both smile.",
    "Design a tradition we can share by message when our schedules do not overlap.",
    "What could we do for five minutes before a busy weekend to feel like a team?",
    "Invent a tiny ritual for noticing one good thing about our ordinary surroundings.",
    "Create a five-minute tradition built around a song we both enjoy.",
    "What short routine could make a Sunday evening feel a little more welcoming?",
    "Design a five-minute adventure that starts at the nearest doorway.",
    "Invent a tradition with a smaller version for days when we have only one minute."
  ],
  "museum-of-us": [
    "Design a visiting exhibition about a place we both love, using three objects you would borrow.",
    "Which shared moment deserves an entire room in the Museum of Us?",
    "Write the first lines of the audio guide for the exhibit about how we met.",
    "Describe an exhibit that only the two of us would understand.",
    "Our museum has a room for plans that went wrong. What is its most beloved exhibit?",
    "Choose a sound for an interactive exhibit about our everyday life.",
    "Write a curator note for an object we used until it nearly fell apart.",
    "What belongs in the museum gift shop that visitors would find puzzling but we would love?",
    "Design a temporary exhibition about our funniest shared habit.",
    "Write a museum label for a place we cannot physically bring into the collection.",
    "What would you put in a small display called The Beginning of This Chapter?"
  ],
  "wrong-answers-only": [
    "Why do we take so long to choose dinner? Wrong answers only.",
    "What is the secret purpose of our most ordinary shared routine? Be completely incorrect.",
    "Explain why we make each other laugh using the least plausible scientific theory.",
    "Where are we going on our next date? Give the most confidently wrong answer.",
    "What are we actually doing when we say we are having a quiet night in?",
    "Why does one of us always need a snack? Invent a ridiculous explanation.",
    "Explain how we first met as if every important detail had been misheard.",
    "What is the true meaning of our favorite inside joke? Answers must be spectacularly wrong.",
    "Why are we so qualified to run an imaginary tiny kingdom? Give terrible evidence.",
    "What is our couple superpower? Invent the least useful possible option.",
    "Explain why an ordinary household object is obviously our relationship coach."
  ],
  "couple-mascot": [
    "Invent a mascot for our rainy-day plans, including its name and most impractical accessory.",
    "Our mascot needs a rival who is still very lovable. Describe them both.",
    "What would a tiny creature representing our shared sense of humor look like?",
    "Design the mascot of our imaginary kitchen and its signature catchphrase.",
    "Create a mascot for our ability to get through a long week together.",
    "Our mascot has one completely useless magical power. What is it?",
    "Write the first paragraph of our mascot biography, including its suspicious origin.",
    "What advice would a mascot based on our best shared habit give us tonight?",
    "Choose an animal, an outfit, and a favorite snack for our weekend-adventure mascot.",
    "Our mascot is applying for a job. What does its reference from us say?",
    "Design an emblem featuring our mascot that we would put on an imaginary club jacket."
  ],
  "tiny-shark-tank": [
    "Pitch an unnecessary gadget that would settle our imaginary blanket disputes.",
    "Invent a product that improves choosing dinner by a very questionable amount.",
    "Sell us a subscription box for our most specific shared interest.",
    "Pitch a tiny service that makes a boring errand slightly more romantic.",
    "Invent a ridiculous app for people who share our sense of humor. Give the sales pitch.",
    "Our inside joke becomes a product. What is it, and why would exactly two people buy it?",
    "Pitch an invention that solves a problem we only encounter on lazy Sundays.",
    "Sell us an extremely overengineered way to leave each other a nice note.",
    "Invent a date-planning device with one brilliant feature and one obvious flaw.",
    "Pitch a travel accessory designed specifically for the two of us.",
    "Our imaginary company needs a flagship product for cozy evenings. Convince your partner to invest."
  ],
  "plot-twist": [
    "Retell a shared journey with one invented passenger. Can your partner spot the addition?",
    "Describe a real meal together but secretly change one dramatic detail.",
    "Retell an ordinary errand as an adventure with one fake obstacle for your partner to identify.",
    "Choose a memory and replace one object with an absurdly expensive version. What changed?",
    "Tell a real story from our early days but sneak in one impossible coincidence.",
    "Describe a shared celebration with one convincing but invented surprise.",
    "Retell a small mishap while adding one imaginary heroic rescue.",
    "Describe a real place we have visited with one extra room that never existed.",
    "Tell the story of a good evening while changing one line of dialogue. Can I guess which?",
    "Give a shared memory a different ending and let your partner find where reality changed.",
    "Retell an inside-joke origin with one fake witness. Let your partner investigate."
  ],
  "soundtrack-shuffle": [
    "Choose a song for getting ready, one for the journey, and one for the ride home from a date.",
    "Build a three-song soundtrack for a rainy afternoon that gradually gets cozier.",
    "Pick songs for our imaginary cooking-show opening, kitchen disaster, and happy ending.",
    "Choose one song each for our past, our present, and a future adventure.",
    "Make a three-track playlist for surviving an ordinary chore together with style.",
    "Pick a song to make us laugh, a song to help us slow down, and a song for a goodnight.",
    "Choose the soundtrack for a tiny road trip: leaving, getting lost, and finding something lovely.",
    "Build the three-song score for our relationship as a wonderfully low-budget film.",
    "Pick songs for a quiet morning, a spontaneous afternoon, and a long conversation after dark.",
    "Choose a track for each of us and a third that sounds like us together.",
    "Make a three-song soundtrack for our imaginary home: the doorway, the kitchen, and the sofa."
  ],
  "emoji-forecast": [
    "Predict our ideal weekend using five emoji, then explain the one your partner is least likely to guess.",
    "Describe a recent shared adventure using five emoji with no words until your partner guesses.",
    "Give tomorrow a five-emoji forecast with one hopeful surprise in it.",
    "Tell the story of our first meeting in five emoji, then decode the strangest choice.",
    "Describe the date you would like next using five emoji and one very unhelpful clue.",
    "Make a five-emoji weather report for our imaginary holiday together.",
    "Predict the plot of our next grocery trip using exactly five emoji.",
    "Use five emoji to describe what a wonderfully lazy day together would contain.",
    "Give our current chapter a five-emoji title sequence and explain your casting choices.",
    "Choose five emoji for an evening that starts badly and ends sweetly. What happens?",
    "Send future-us a forecast in five emoji for something you hope we will try together."
  ],
  "closer-than-words": [
    "What kind of quiet company makes you feel especially understood?",
    "Describe a small shared routine that helps distance feel less important.",
    "When do you most appreciate your partner noticing something without being asked?",
    "What is a gentle way to reconnect when we are both distracted?",
    "Which familiar sound, look, or gesture from your partner feels like an invitation?",
    "What tiny detail can turn a practical conversation into a warm one for you?",
    "Describe an ordinary moment when doing the same thing side by side felt connecting.",
    "What could we do for a minute together when neither of us has words left?",
    "Which small sign tells you that your partner is fully present with you?",
    "What affectionate habit would you like us to notice more deliberately?",
    "Describe a moment when silence between us felt comfortable rather than empty."
  ],
  "date-trailer": [
    "Write a trailer for a date that begins with a shared umbrella and a very small mystery.",
    "Our next cozy night becomes a blockbuster. Give it a voice-over and a closing title card.",
    "Tease an ideal date without naming the location, the food, or the activity.",
    "Write a romantic-comedy trailer about two people attempting one ordinary errand together.",
    "Give our dream day trip a dramatic trailer with one excellent review quote.",
    "Write the trailer for a date told entirely through its sounds and tiny details.",
    "Our date trailer has the wrong movie genre. Make an innocent picnic sound like a thriller.",
    "Pitch a date trailer with one spectacular promise that costs absolutely nothing.",
    "Write a trailer for a sequel to a date we would happily revisit.",
    "Tease a spontaneous date using three quick scenes and one unanswered question.",
    "Write a trailer for our ideal slow evening as if it were the adventure of a lifetime."
  ],
  "favorite-detail": [
    "What is a small detail in how I speak that you think you would recognize anywhere?",
    "Describe one tiny habit of mine that makes an ordinary moment unmistakably ours.",
    "What detail do you notice when your partner becomes excited about something?",
    "Which small thing about my handwriting, messages, or word choices do you like?",
    "Name a detail about the way your partner moves through a familiar place.",
    "What ordinary preference of mine have you learned so well you can predict it?",
    "Describe a small thing your partner does when they are concentrating.",
    "What is a detail about me that you first overlooked and now find endearing?",
    "Which little expression, phrase, or gesture would you include in a portrait of us?",
    "What tiny sign tells you that I am having a particularly good day?",
    "Name one small detail you would point out if someone asked what makes me me."
  ],
  "green-light-tonight": [
    "Would a sweet message, a little flirting, quiet company, or space feel nicest tonight? You can choose none.",
    "What is a low-pressure invitation you would enjoy receiving today, if any?",
    "Name one kind of affection that sounds welcome and one that can wait. Passing is welcome too.",
    "Would you rather be listened to, made to laugh, or left room to rest tonight?",
    "What would help an invitation feel easy to accept or decline without awkwardness?",
    "If you could set the pace of a cozy evening together, what pace would feel comfortable?",
    "What kind of compliment would feel good today? It is okay to prefer no spotlight.",
    "Choose a small way we could show care tonight that asks very little of either of us.",
    "Would you welcome a playful question, a tender one, or a change of subject right now?",
    "What is one gentle way to ask whether you are in the mood for closeness?",
    "What could an especially considerate goodnight look like for you tonight?"
  ],
  "chemistry-recipe": [
    "Write a recipe for our perfect ordinary evening, including one ingredient that cannot be bought.",
    "Our laughter is a recipe. What are its three main ingredients and its secret seasoning?",
    "Invent a drink named after our chemistry and explain what each ingredient represents.",
    "What happens if you mix our two strongest qualities with one tiny shared flaw?",
    "Write the instructions for making a good date from one simple plan and two curious people.",
    "Give a favorite shared memory a recipe title and a list of emotional ingredients.",
    "What ingredient would you add to our week, and which one has been a little overpowering?",
    "Describe our teamwork as a recipe that somehow works despite the unusual combination.",
    "Invent a cozy-night recipe with a generous helping of something your partner does well.",
    "Write a warning label for a recipe containing too much of our shared sense of humor.",
    "What are the essential ingredients in a reunion that feels like us?"
  ],
  "doorstep-scene": [
    "Write the first three lines of a reunion scene on a rainy evening, with a familiar bag by the door.",
    "We meet at a station after time apart. What do we each say before going anywhere?",
    "Write a reunion scene where the first meaningful thing is a small gesture rather than a speech.",
    "Imagine arriving with terrible travel hair and excellent news. Write the doorway conversation.",
    "Write three lines for a quiet reunion when one of us is too tired to tell the whole story yet.",
    "Our reunion takes place in a busy airport. Describe how we find each other in the crowd.",
    "Write the first few lines of seeing each other after a long day rather than a long absence.",
    "Imagine a reunion in a place neither of us has visited. What familiar thing happens first?",
    "Write a doorstep scene with one tiny surprise hidden behind your back.",
    "Describe our reunion as the opening of a cozy film, including the first sound we hear.",
    "Write three lines of a reunion scene where everything goes a little wrong and we laugh anyway."
  ]
}
```


## Wavelength duel

Source: `src/features/session/wavelengthDuelData.js`.

### `WAVELENGTH_PROMPT_COUNT`

```json
5
```

### `WAVELENGTH_MATCHES_TOTAL`

```json
10
```

### `WAVELENGTH_PROMPTS` (65 entries)

```json
[
  {
    "id": "friday-night",
    "options": [
      {
        "id": "a",
        "label": "Takeout + couch fort"
      },
      {
        "id": "b",
        "label": "Out with friends"
      },
      {
        "id": "c",
        "label": "Cooking something new together"
      },
      {
        "id": "d",
        "label": "Stargazing drive"
      }
    ],
    "text": "The ideal Friday night is…"
  },
  {
    "id": "best-gift",
    "options": [
      {
        "id": "a",
        "label": "A handwritten letter"
      },
      {
        "id": "b",
        "label": "A surprise date, planned"
      },
      {
        "id": "c",
        "label": "Something sparkly"
      },
      {
        "id": "d",
        "label": "A whole free day, no plans"
      }
    ],
    "text": "The best gift to receive is…"
  },
  {
    "id": "recharge",
    "options": [
      {
        "id": "a",
        "label": "Quiet solo time"
      },
      {
        "id": "b",
        "label": "Venting it all out"
      },
      {
        "id": "c",
        "label": "A long walk"
      },
      {
        "id": "d",
        "label": "Music + dance break"
      }
    ],
    "text": "After a long day, the recharge looks like…"
  },
  {
    "id": "dream-trip",
    "options": [
      {
        "id": "a",
        "label": "Beach, nothing planned"
      },
      {
        "id": "b",
        "label": "City food tour"
      },
      {
        "id": "c",
        "label": "Cabin in the woods"
      },
      {
        "id": "d",
        "label": "Road trip, no map"
      }
    ],
    "text": "The dream trip together is…"
  },
  {
    "id": "love-moment",
    "options": [
      {
        "id": "a",
        "label": "Coffee in bed"
      },
      {
        "id": "b",
        "label": "A random “thinking of you” text"
      },
      {
        "id": "c",
        "label": "A long, no-rush hug"
      },
      {
        "id": "d",
        "label": "A chore quietly handled"
      }
    ],
    "text": "The smallest moment that says “I love you”…"
  },
  {
    "id": "sunday-morning",
    "options": [
      {
        "id": "a",
        "label": "Coffee and nowhere to be"
      },
      {
        "id": "b",
        "label": "A big cooked breakfast"
      },
      {
        "id": "c",
        "label": "A slow walk, no phones"
      },
      {
        "id": "d",
        "label": "Back to sleep, obviously"
      }
    ],
    "text": "The perfect slow Sunday morning starts with…"
  },
  {
    "id": "chore-least",
    "options": [
      {
        "id": "a",
        "label": "Dishes. Always the dishes"
      },
      {
        "id": "b",
        "label": "Folding laundry"
      },
      {
        "id": "c",
        "label": "Cleaning the bathroom"
      },
      {
        "id": "d",
        "label": "Taking out the trash"
      }
    ],
    "text": "The chore you would happily never do again…"
  },
  {
    "id": "comfort-watch",
    "options": [
      {
        "id": "a",
        "label": "The old sitcom, again"
      },
      {
        "id": "b",
        "label": "A cozy documentary"
      },
      {
        "id": "c",
        "label": "Reality TV, zero shame"
      },
      {
        "id": "d",
        "label": "Whatever is shortest"
      }
    ],
    "text": "The comfort rewatch when nothing else sounds good…"
  },
  {
    "id": "grocery-extra",
    "options": [
      {
        "id": "a",
        "label": "Something from the bakery"
      },
      {
        "id": "b",
        "label": "Fancy cheese, obviously"
      },
      {
        "id": "c",
        "label": "Ice cream, obviously"
      },
      {
        "id": "d",
        "label": "Snacks for the couch"
      }
    ],
    "text": "The grocery run always ends with one extra…"
  },
  {
    "id": "day-over",
    "options": [
      {
        "id": "a",
        "label": "Pajamas immediately"
      },
      {
        "id": "b",
        "label": "A hot shower"
      },
      {
        "id": "c",
        "label": "Couch + blanket cocoon"
      },
      {
        "id": "d",
        "label": "Cooking something nice"
      }
    ],
    "text": "The signal that the day is officially over…"
  },
  {
    "id": "road-trip-role",
    "options": [
      {
        "id": "a",
        "label": "Driver, windows down"
      },
      {
        "id": "b",
        "label": "DJ, full control"
      },
      {
        "id": "c",
        "label": "Navigator with snacks"
      },
      {
        "id": "d",
        "label": "Passenger princess, napping"
      }
    ],
    "text": "On a road trip, your natural role is…"
  },
  {
    "id": "bad-day-fix",
    "options": [
      {
        "id": "a",
        "label": "Vent it all out"
      },
      {
        "id": "b",
        "label": "A walk to clear the head"
      },
      {
        "id": "c",
        "label": "Comfort food, stat"
      },
      {
        "id": "d",
        "label": "Quiet time, then talk"
      }
    ],
    "text": "The fastest fix for a bad day…"
  },
  {
    "id": "weekend-project",
    "options": [
      {
        "id": "a",
        "label": "Rearranging a room"
      },
      {
        "id": "b",
        "label": "Trying a new recipe"
      },
      {
        "id": "c",
        "label": "A thrift-store treasure hunt"
      },
      {
        "id": "d",
        "label": "Absolutely nothing, on purpose"
      }
    ],
    "text": "The ideal low-stakes weekend project…"
  },
  {
    "id": "sleep-essential",
    "options": [
      {
        "id": "a",
        "label": "Total darkness"
      },
      {
        "id": "b",
        "label": "A fan humming"
      },
      {
        "id": "c",
        "label": "The good pillow arrangement"
      },
      {
        "id": "d",
        "label": "Cool room, warm blanket"
      }
    ],
    "text": "The non-negotiable for good sleep…"
  },
  {
    "id": "small-win",
    "options": [
      {
        "id": "a",
        "label": "Dessert, obviously"
      },
      {
        "id": "b",
        "label": "Tell everyone immediately"
      },
      {
        "id": "c",
        "label": "A little dance"
      },
      {
        "id": "d",
        "label": "Bank it quietly, smile all day"
      }
    ],
    "text": "The right way to celebrate a small win…"
  },
  {
    "id": "night-rainy-date",
    "text": "A rainy afternoon together calls for…",
    "options": [
      {
        "id": "a",
        "label": "A blanket and a film"
      },
      {
        "id": "b",
        "label": "Baking something"
      },
      {
        "id": "c",
        "label": "A museum wander"
      },
      {
        "id": "d",
        "label": "A puddle-filled walk"
      }
    ]
  },
  {
    "id": "night-surprise-hour",
    "text": "An unexpected hour together is best spent…",
    "options": [
      {
        "id": "a",
        "label": "Talking with no phones"
      },
      {
        "id": "b",
        "label": "Getting coffee"
      },
      {
        "id": "c",
        "label": "Taking a nap"
      },
      {
        "id": "d",
        "label": "Going somewhere new"
      }
    ]
  },
  {
    "id": "night-tiny-holiday",
    "text": "A made-up holiday for us should celebrate…",
    "options": [
      {
        "id": "a",
        "label": "Our first hello"
      },
      {
        "id": "b",
        "label": "Our best inside joke"
      },
      {
        "id": "c",
        "label": "Doing nothing together"
      },
      {
        "id": "d",
        "label": "Our favorite meal"
      }
    ]
  },
  {
    "id": "night-road-seat",
    "text": "On a road trip, my dream role is…",
    "options": [
      {
        "id": "a",
        "label": "Driver"
      },
      {
        "id": "b",
        "label": "DJ"
      },
      {
        "id": "c",
        "label": "Snack manager"
      },
      {
        "id": "d",
        "label": "Scenery commentator"
      }
    ]
  },
  {
    "id": "night-lost-map",
    "text": "If we got lost in a new city, I would…",
    "options": [
      {
        "id": "a",
        "label": "Find a café first"
      },
      {
        "id": "b",
        "label": "Ask a local"
      },
      {
        "id": "c",
        "label": "Open the map"
      },
      {
        "id": "d",
        "label": "Call it an adventure"
      }
    ]
  },
  {
    "id": "night-souvenir",
    "text": "The souvenir I would keep is…",
    "options": [
      {
        "id": "a",
        "label": "A postcard"
      },
      {
        "id": "b",
        "label": "A ridiculous photo"
      },
      {
        "id": "c",
        "label": "A small local treasure"
      },
      {
        "id": "d",
        "label": "The ticket stub"
      }
    ]
  },
  {
    "id": "night-night-sound",
    "text": "The nicest background sound for a quiet night is…",
    "options": [
      {
        "id": "a",
        "label": "Rain"
      },
      {
        "id": "b",
        "label": "A familiar playlist"
      },
      {
        "id": "c",
        "label": "A crackling fire"
      },
      {
        "id": "d",
        "label": "Comfortable silence"
      }
    ]
  },
  {
    "id": "night-breakfast",
    "text": "Breakfast brought to me should include…",
    "options": [
      {
        "id": "a",
        "label": "Coffee and toast"
      },
      {
        "id": "b",
        "label": "Something sweet"
      },
      {
        "id": "c",
        "label": "Eggs and all the extras"
      },
      {
        "id": "d",
        "label": "Whatever you made"
      }
    ]
  },
  {
    "id": "night-little-help",
    "text": "When I feel overwhelmed, start with…",
    "options": [
      {
        "id": "a",
        "label": "A hug"
      },
      {
        "id": "b",
        "label": "A practical offer"
      },
      {
        "id": "c",
        "label": "Listening"
      },
      {
        "id": "d",
        "label": "A little space"
      }
    ]
  },
  {
    "id": "night-good-news",
    "text": "When I have good news, I want…",
    "options": [
      {
        "id": "a",
        "label": "An excited call"
      },
      {
        "id": "b",
        "label": "A big hug"
      },
      {
        "id": "c",
        "label": "A tiny celebration"
      },
      {
        "id": "d",
        "label": "Time to tell the whole story"
      }
    ]
  },
  {
    "id": "night-surprise-kind",
    "text": "My favorite kind of surprise is…",
    "options": [
      {
        "id": "a",
        "label": "A thoughtful note"
      },
      {
        "id": "b",
        "label": "A planned outing"
      },
      {
        "id": "c",
        "label": "A favorite snack"
      },
      {
        "id": "d",
        "label": "A chore already done"
      }
    ]
  },
  {
    "id": "night-home-detail",
    "text": "The detail that makes a place feel like home is…",
    "options": [
      {
        "id": "a",
        "label": "Warm lighting"
      },
      {
        "id": "b",
        "label": "Familiar smells"
      },
      {
        "id": "c",
        "label": "Photos"
      },
      {
        "id": "d",
        "label": "Someone waiting for me"
      }
    ]
  },
  {
    "id": "night-garden",
    "text": "If we grew something together, I would pick…",
    "options": [
      {
        "id": "a",
        "label": "Herbs"
      },
      {
        "id": "b",
        "label": "Wildflowers"
      },
      {
        "id": "c",
        "label": "Tomatoes"
      },
      {
        "id": "d",
        "label": "A slightly dramatic houseplant"
      }
    ]
  },
  {
    "id": "night-silly-trophy",
    "text": "Our couple trophy should reward…",
    "options": [
      {
        "id": "a",
        "label": "Excellent snack decisions"
      },
      {
        "id": "b",
        "label": "Turning errands into dates"
      },
      {
        "id": "c",
        "label": "Impressive teamwork"
      },
      {
        "id": "d",
        "label": "Unnecessary laughter"
      }
    ]
  },
  {
    "id": "night-mystery-box",
    "text": "I would open a mystery box hoping for…",
    "options": [
      {
        "id": "a",
        "label": "A letter"
      },
      {
        "id": "b",
        "label": "A tiny gadget"
      },
      {
        "id": "c",
        "label": "Art supplies"
      },
      {
        "id": "d",
        "label": "A map to somewhere"
      }
    ]
  },
  {
    "id": "night-couple-show",
    "text": "Our imaginary TV show would be…",
    "options": [
      {
        "id": "a",
        "label": "A cozy sitcom"
      },
      {
        "id": "b",
        "label": "A travel series"
      },
      {
        "id": "c",
        "label": "A cooking disaster"
      },
      {
        "id": "d",
        "label": "A very gentle mystery"
      }
    ]
  },
  {
    "id": "night-picnic",
    "text": "The most important picnic item is…",
    "options": [
      {
        "id": "a",
        "label": "The good blanket"
      },
      {
        "id": "b",
        "label": "Excellent food"
      },
      {
        "id": "c",
        "label": "A great view"
      },
      {
        "id": "d",
        "label": "A backup plan for ants"
      }
    ]
  },
  {
    "id": "night-dance",
    "text": "If our song came on in a shop, I would…",
    "options": [
      {
        "id": "a",
        "label": "Dance a little"
      },
      {
        "id": "b",
        "label": "Give you a look"
      },
      {
        "id": "c",
        "label": "Sing quietly"
      },
      {
        "id": "d",
        "label": "Wait until we get outside"
      }
    ]
  },
  {
    "id": "night-museum",
    "text": "Our tiny museum needs an exhibit about…",
    "options": [
      {
        "id": "a",
        "label": "Our first adventure"
      },
      {
        "id": "b",
        "label": "Our strangest meal"
      },
      {
        "id": "c",
        "label": "An ordinary perfect day"
      },
      {
        "id": "d",
        "label": "Our running jokes"
      }
    ]
  },
  {
    "id": "night-week-reset",
    "text": "A fresh start to the week means…",
    "options": [
      {
        "id": "a",
        "label": "A tidy space"
      },
      {
        "id": "b",
        "label": "A shared plan"
      },
      {
        "id": "c",
        "label": "A slow breakfast"
      },
      {
        "id": "d",
        "label": "Something fun to anticipate"
      }
    ]
  },
  {
    "id": "night-future-home",
    "text": "Our imaginary dream home needs…",
    "options": [
      {
        "id": "a",
        "label": "A reading nook"
      },
      {
        "id": "b",
        "label": "A big kitchen"
      },
      {
        "id": "c",
        "label": "A garden"
      },
      {
        "id": "d",
        "label": "A room for making things"
      }
    ]
  },
  {
    "id": "night-pet-name",
    "text": "Our imaginary pet should be named after…",
    "options": [
      {
        "id": "a",
        "label": "A food"
      },
      {
        "id": "b",
        "label": "A grand historical figure"
      },
      {
        "id": "c",
        "label": "A favorite character"
      },
      {
        "id": "d",
        "label": "A completely ordinary person"
      }
    ]
  },
  {
    "id": "night-team-power",
    "text": "Our shared superpower should be…",
    "options": [
      {
        "id": "a",
        "label": "Teleporting together"
      },
      {
        "id": "b",
        "label": "Perfect snack timing"
      },
      {
        "id": "c",
        "label": "Finding lost things"
      },
      {
        "id": "d",
        "label": "Pausing busy days"
      }
    ]
  },
  {
    "id": "night-tiny-adventure",
    "text": "A small adventure I would say yes to is…",
    "options": [
      {
        "id": "a",
        "label": "A mystery train stop"
      },
      {
        "id": "b",
        "label": "A new walking trail"
      },
      {
        "id": "c",
        "label": "An unfamiliar restaurant"
      },
      {
        "id": "d",
        "label": "A sunrise outing"
      }
    ]
  },
  {
    "id": "night-gift-wrap",
    "text": "A gift feels most thoughtful when…",
    "options": [
      {
        "id": "a",
        "label": "It recalls something I said"
      },
      {
        "id": "b",
        "label": "You made it"
      },
      {
        "id": "c",
        "label": "It gives us time together"
      },
      {
        "id": "d",
        "label": "It makes daily life easier"
      }
    ]
  },
  {
    "id": "night-photo-style",
    "text": "My favorite photo of us would be…",
    "options": [
      {
        "id": "a",
        "label": "Laughing mid-sentence"
      },
      {
        "id": "b",
        "label": "Somewhere beautiful"
      },
      {
        "id": "c",
        "label": "A slightly blurry candid"
      },
      {
        "id": "d",
        "label": "An ordinary day at home"
      }
    ]
  },
  {
    "id": "night-quiet-company",
    "text": "Quiet company feels best when we…",
    "options": [
      {
        "id": "a",
        "label": "Read side by side"
      },
      {
        "id": "b",
        "label": "Cook without rushing"
      },
      {
        "id": "c",
        "label": "Watch the sky"
      },
      {
        "id": "d",
        "label": "Work on separate hobbies"
      }
    ]
  },
  {
    "id": "night-first-stop",
    "text": "At a fair, I would head straight for…",
    "options": [
      {
        "id": "a",
        "label": "The food"
      },
      {
        "id": "b",
        "label": "The games"
      },
      {
        "id": "c",
        "label": "The biggest ride"
      },
      {
        "id": "d",
        "label": "The animals"
      }
    ]
  },
  {
    "id": "night-dream-class",
    "text": "A class I would take with you is…",
    "options": [
      {
        "id": "a",
        "label": "Pottery"
      },
      {
        "id": "b",
        "label": "Cooking"
      },
      {
        "id": "c",
        "label": "Dancing"
      },
      {
        "id": "d",
        "label": "Something unexpectedly niche"
      }
    ]
  },
  {
    "id": "night-time-capsule",
    "text": "Our time capsule should include…",
    "options": [
      {
        "id": "a",
        "label": "A letter"
      },
      {
        "id": "b",
        "label": "A playlist"
      },
      {
        "id": "c",
        "label": "A photo"
      },
      {
        "id": "d",
        "label": "A very specific inside joke"
      }
    ]
  },
  {
    "id": "night-comfort-color",
    "text": "A room that helps me relax would feel…",
    "options": [
      {
        "id": "a",
        "label": "Warm and golden"
      },
      {
        "id": "b",
        "label": "Cool and blue"
      },
      {
        "id": "c",
        "label": "Soft and green"
      },
      {
        "id": "d",
        "label": "Bright and airy"
      }
    ]
  },
  {
    "id": "night-staycation",
    "text": "The best part of a staycation is…",
    "options": [
      {
        "id": "a",
        "label": "No alarm"
      },
      {
        "id": "b",
        "label": "Room-service-style breakfast"
      },
      {
        "id": "c",
        "label": "Exploring our own town"
      },
      {
        "id": "d",
        "label": "Ignoring the to-do list"
      }
    ]
  },
  {
    "id": "night-secret-talent",
    "text": "A silly talent I would like us to master is…",
    "options": [
      {
        "id": "a",
        "label": "A duet"
      },
      {
        "id": "b",
        "label": "Card tricks"
      },
      {
        "id": "c",
        "label": "Elaborate pancake art"
      },
      {
        "id": "d",
        "label": "A synchronized entrance"
      }
    ]
  },
  {
    "id": "night-walk-choice",
    "text": "On a walk, I would rather find…",
    "options": [
      {
        "id": "a",
        "label": "Water"
      },
      {
        "id": "b",
        "label": "A garden"
      },
      {
        "id": "c",
        "label": "An interesting street"
      },
      {
        "id": "d",
        "label": "A place to sit"
      }
    ]
  },
  {
    "id": "night-reunion",
    "text": "After time apart, my ideal first moment is…",
    "options": [
      {
        "id": "a",
        "label": "A long hug"
      },
      {
        "id": "b",
        "label": "Telling every little story"
      },
      {
        "id": "c",
        "label": "Food together"
      },
      {
        "id": "d",
        "label": "Settling in quietly"
      }
    ]
  },
  {
    "id": "night-small-tradition",
    "text": "A weekly tradition I would enjoy is…",
    "options": [
      {
        "id": "a",
        "label": "A shared breakfast"
      },
      {
        "id": "b",
        "label": "A walk"
      },
      {
        "id": "c",
        "label": "A game night"
      },
      {
        "id": "d",
        "label": "Trying a new recipe"
      }
    ]
  },
  {
    "id": "night-movie-role",
    "text": "In an adventure movie, I would be…",
    "options": [
      {
        "id": "a",
        "label": "The planner"
      },
      {
        "id": "b",
        "label": "The brave improviser"
      },
      {
        "id": "c",
        "label": "The comic relief"
      },
      {
        "id": "d",
        "label": "The one with the supplies"
      }
    ]
  },
  {
    "id": "night-winter-date",
    "text": "A cold-weather date should involve…",
    "options": [
      {
        "id": "a",
        "label": "Hot drinks"
      },
      {
        "id": "b",
        "label": "A snowy walk"
      },
      {
        "id": "c",
        "label": "A warm kitchen"
      },
      {
        "id": "d",
        "label": "A blanket fortress"
      }
    ]
  },
  {
    "id": "night-summer-date",
    "text": "A summer evening together needs…",
    "options": [
      {
        "id": "a",
        "label": "A sunset"
      },
      {
        "id": "b",
        "label": "Ice cream"
      },
      {
        "id": "c",
        "label": "An outdoor concert"
      },
      {
        "id": "d",
        "label": "A quiet porch"
      }
    ]
  },
  {
    "id": "night-one-day-off",
    "text": "One responsibility I would love a day off from is…",
    "options": [
      {
        "id": "a",
        "label": "Making decisions"
      },
      {
        "id": "b",
        "label": "Cooking"
      },
      {
        "id": "c",
        "label": "Tidying"
      },
      {
        "id": "d",
        "label": "Watching the clock"
      }
    ]
  },
  {
    "id": "night-message",
    "text": "The message I would love to get today is…",
    "options": [
      {
        "id": "a",
        "label": "I am proud of you"
      },
      {
        "id": "b",
        "label": "I saved you some"
      },
      {
        "id": "c",
        "label": "Want to go somewhere?"
      },
      {
        "id": "d",
        "label": "No rush, take your time"
      }
    ]
  },
  {
    "id": "night-dream-shop",
    "text": "Our imaginary shop would sell…",
    "options": [
      {
        "id": "a",
        "label": "Books and tea"
      },
      {
        "id": "b",
        "label": "Odd little treasures"
      },
      {
        "id": "c",
        "label": "Plants"
      },
      {
        "id": "d",
        "label": "Desserts"
      }
    ]
  },
  {
    "id": "night-treasure",
    "text": "The best treasure hunt would end with…",
    "options": [
      {
        "id": "a",
        "label": "A personal letter"
      },
      {
        "id": "b",
        "label": "A picnic"
      },
      {
        "id": "c",
        "label": "An unexpected view"
      },
      {
        "id": "d",
        "label": "A wonderfully silly prize"
      }
    ]
  },
  {
    "id": "night-learning-us",
    "text": "Something I would enjoy learning about you is…",
    "options": [
      {
        "id": "a",
        "label": "A childhood favorite"
      },
      {
        "id": "b",
        "label": "A quiet ambition"
      },
      {
        "id": "c",
        "label": "A surprising opinion"
      },
      {
        "id": "d",
        "label": "Your ideal ordinary day"
      }
    ]
  },
  {
    "id": "night-spare-room",
    "text": "A spare room for us would become…",
    "options": [
      {
        "id": "a",
        "label": "A creative studio"
      },
      {
        "id": "b",
        "label": "A game room"
      },
      {
        "id": "c",
        "label": "A library"
      },
      {
        "id": "d",
        "label": "A peaceful retreat"
      }
    ]
  },
  {
    "id": "night-wrong-turn",
    "text": "The best accidental detour would lead to…",
    "options": [
      {
        "id": "a",
        "label": "A bakery"
      },
      {
        "id": "b",
        "label": "A beautiful overlook"
      },
      {
        "id": "c",
        "label": "A festival"
      },
      {
        "id": "d",
        "label": "A tiny bookstore"
      }
    ]
  },
  {
    "id": "night-party-exit",
    "text": "Our ideal party exit is…",
    "options": [
      {
        "id": "a",
        "label": "Early, with snacks"
      },
      {
        "id": "b",
        "label": "After one last conversation"
      },
      {
        "id": "c",
        "label": "When the music ends"
      },
      {
        "id": "d",
        "label": "A perfectly timed shared glance"
      }
    ]
  },
  {
    "id": "night-little-luxury",
    "text": "The little luxury I would choose today is…",
    "options": [
      {
        "id": "a",
        "label": "Fresh sheets"
      },
      {
        "id": "b",
        "label": "A really good drink"
      },
      {
        "id": "c",
        "label": "Uninterrupted hobby time"
      },
      {
        "id": "d",
        "label": "A meal I did not plan"
      }
    ]
  },
  {
    "id": "night-week-keepsake",
    "text": "I would remember this week through…",
    "options": [
      {
        "id": "a",
        "label": "A photo"
      },
      {
        "id": "b",
        "label": "A funny quote"
      },
      {
        "id": "c",
        "label": "A song"
      },
      {
        "id": "d",
        "label": "One quiet moment"
      }
    ]
  },
  {
    "id": "night-shared-quest",
    "text": "Our next tiny shared quest should be…",
    "options": [
      {
        "id": "a",
        "label": "Find the best local pastry"
      },
      {
        "id": "b",
        "label": "Learn one new game"
      },
      {
        "id": "c",
        "label": "Visit somewhere nearby"
      },
      {
        "id": "d",
        "label": "Make something by hand"
      }
    ]
  }
]
```

### `WAVELENGTH_DUEL_DEFINITION` (8 entries)

```json
{
  "durationSec": 180,
  "howToPlay": [
    "Five quick prompts. Answer honestly for yourself, then guess what your partner will answer. Every match earns a shared heart — up to 10."
  ],
  "id": "wavelength-duel",
  "intensity": 1,
  "name": "Wavelength",
  "skippable": true,
  "tagline": "Answer for you, guess for them. How in sync are you, really?",
  "vibe": "playful"
}
```


## Board spaces and keepsakes

Source: `src/features/session/boardConfig.js`.

### `BASE_DUEL_HEART_BONUS`

```json
3
```

### `KEEPSAKES` (4 entries)

```json
[
  {
    "id": "sparkler-photo",
    "label": "Sparkler Photo",
    "cost": 5,
    "blurb": "A flash-lit snapshot worth replaying.",
    "perkDescription": "The next journal-saving activity grants +1 extra heart.",
    "perkId": "sparkler-photo",
    "perkLabel": "Encore Glow"
  },
  {
    "id": "midnight-snack",
    "label": "Midnight Snack",
    "cost": 6,
    "blurb": "A sweet little win for the road.",
    "perkDescription": "The first oops space this night deals 0 heart loss.",
    "perkId": "midnight-snack",
    "perkLabel": "Soft Landing Snack"
  },
  {
    "id": "love-note",
    "label": "Pocket Love Note",
    "cost": 7,
    "blurb": "Tiny, sincere, impossible to forget.",
    "perkDescription": "The first skipped activity still leaves behind a short journal note.",
    "perkId": "pocket-love-note",
    "perkLabel": "Saved Anyway"
  },
  {
    "id": "dance-ticket",
    "label": "Last Dance Ticket",
    "cost": 8,
    "blurb": "Saved for the moment the lights go low.",
    "perkDescription": "The final duel is worth +2 more shared hearts.",
    "perkId": "last-dance-ticket",
    "perkLabel": "Finale Boost"
  }
]
```

### `BOARD_SPACES` (20 entries)

```json
[
  {
    "id": "starlight-start",
    "label": "Starlight Start",
    "type": "heart"
  },
  {
    "id": "soft-reset",
    "label": "Soft Reset",
    "type": "oops"
  },
  {
    "id": "spark-checkin",
    "label": "Spark Check-In",
    "type": "connection"
  },
  {
    "id": "duel-beat",
    "label": "Duel Beat",
    "type": "duel"
  },
  {
    "id": "keepsake-kiosk",
    "label": "Mystery Card",
    "type": "keepsake"
  },
  {
    "id": "glow-up",
    "label": "Glow Up",
    "type": "heart"
  },
  {
    "id": "story-chain",
    "label": "Story Chain",
    "type": "connection"
  },
  {
    "id": "rain-check",
    "label": "Rain Check",
    "type": "oops"
  },
  {
    "id": "duel-spark",
    "label": "Duel Spark",
    "type": "duel"
  },
  {
    "id": "glad-you-came",
    "label": "Glad You Came",
    "type": "heart"
  },
  {
    "id": "gratitude-drop",
    "label": "Gratitude Drop",
    "type": "connection"
  },
  {
    "id": "souvenir-stop",
    "label": "Mystery Card",
    "type": "keepsake"
  },
  {
    "id": "trip-up",
    "label": "Trip Up",
    "type": "oops"
  },
  {
    "id": "bonus-beat",
    "label": "Bonus Beat",
    "type": "duel"
  },
  {
    "id": "heart-burst",
    "label": "Heart Burst",
    "type": "heart"
  },
  {
    "id": "story-swerve",
    "label": "Story Swerve",
    "type": "connection"
  },
  {
    "id": "spilled-soda",
    "label": "Spilled Soda",
    "type": "oops"
  },
  {
    "id": "prize-corner",
    "label": "Mystery Card",
    "type": "keepsake"
  },
  {
    "id": "crowd-roar",
    "label": "Crowd Roar",
    "type": "heart"
  },
  {
    "id": "final-glow",
    "label": "Final Glow",
    "type": "duel"
  }
]
```


## Night setup and vibe choices

Source: `src/features/session/sessionPresets.js and sessionLogic.js`.

### `SESSION_PRESETS` (3 entries)

```json
{
  "quick": {
    "id": "quick",
    "label": "Quick",
    "minutesLabel": "~10 min",
    "description": "A short, sweet warm-up night: one laugh, one connection, one warm close.",
    "totalRounds": 4
  },
  "standard": {
    "id": "standard",
    "label": "Date night",
    "minutesLabel": "~25 min",
    "description": "The full board-night rhythm: warm-up, variety, and a meaningful close.",
    "totalRounds": 6
  },
  "long": {
    "id": "long",
    "label": "Stay awhile",
    "minutesLabel": "~40 min",
    "description": "A longer night with two mini-arcs and more room for keepsakes.",
    "totalRounds": 8
  }
}
```

### `DEFAULT_SESSION_PRESET`

```json
"quick"
```

### `SESSION_PRESET_OPTIONS` (3 entries)

```json
[
  {
    "id": "quick",
    "label": "Quick",
    "minutesLabel": "~10 min",
    "description": "A short, sweet warm-up night: one laugh, one connection, one warm close.",
    "totalRounds": 4
  },
  {
    "id": "standard",
    "label": "Date night",
    "minutesLabel": "~25 min",
    "description": "The full board-night rhythm: warm-up, variety, and a meaningful close.",
    "totalRounds": 6
  },
  {
    "id": "long",
    "label": "Stay awhile",
    "minutesLabel": "~40 min",
    "description": "A longer night with two mini-arcs and more room for keepsakes.",
    "totalRounds": 8
  }
]
```

### `MOOD_OPTIONS` (5 entries)

```json
[
  {
    "emoji": "🛋️",
    "id": "cozy",
    "label": "Cozy"
  },
  {
    "emoji": "🎉",
    "id": "playful",
    "label": "Playful"
  },
  {
    "emoji": "💋",
    "id": "flirty",
    "label": "Flirty"
  },
  {
    "emoji": "🌙",
    "id": "dreamy",
    "label": "Dreamy"
  },
  {
    "emoji": "🔥",
    "id": "wild",
    "label": "Wild"
  }
]
```


## Board themes and scene decorations

Source: `src/board/boardThemes.js`.

### `BOARD_THEME_SETS` (5 entries)

```json
{
  "cozy": {
    "id": "cozy",
    "label": "Cozy night in",
    "environment": {
      "top": "#2c2037",
      "horizon": "#8b576b",
      "bottom": "#372637",
      "glow": "#ffc797",
      "motes": "#f3c78a",
      "mode": "dust",
      "count": 18,
      "panorama": "/assets/board/skyboxes/cozy.webp"
    },
    "skinOverlay": "/assets/board/skins/cozy.svg",
    "diceSkin": {
      "face": "#493042",
      "alternate": "#382335",
      "pip": "#f4d49b",
      "edge": "#f2d6a0"
    },
    "spaceColors": {
      "connection": "#694a68",
      "duel": "#3c526c",
      "heart": "#8a5367",
      "keepsake": "#705472",
      "oops": "#674355"
    },
    "cardSkin": {
      "top": "#fff0e4",
      "bottom": "#eed6dc",
      "ink": "#352432",
      "accent": "#aa5b72",
      "border": "#eac5bd"
    },
    "surfaces": {
      "inset": {
        "color": "#ffffff",
        "repeat": [
          3,
          3
        ],
        "texture": "/assets/board/rose-velvet-texture-v2.png"
      },
      "tabletop": {
        "color": "#fff2f4",
        "repeat": [
          3.2,
          3.2
        ],
        "texture": "/assets/board/wine-velvet-texture-v2.png"
      }
    },
    "decorations": [
      {
        "id": "cozy-slippers",
        "label": "Cozy slippers",
        "model": "/assets/board/cozy/cozy-slippers.glb",
        "position": [
          -6.4,
          -0.02,
          -3.8
        ],
        "rotation": -0.38,
        "size": 1.8
      },
      {
        "id": "cozy-latte",
        "label": "Latte on a coaster",
        "model": "/assets/board/cozy/latte-on-coaster.glb",
        "position": [
          6.4,
          -0.02,
          -3.6
        ],
        "rotation": 0.48,
        "size": 1.5
      },
      {
        "id": "cozy-blankets",
        "label": "Folded blankets",
        "model": "/assets/board/cozy/folded-blankets.glb",
        "position": [
          -5.1,
          -0.02,
          3.2
        ],
        "rotation": 0.24,
        "size": 1.75
      },
      {
        "id": "cozy-record-player",
        "label": "Record player",
        "model": "/assets/board/cozy/record-player.glb",
        "position": [
          5.2,
          -0.02,
          3.4
        ],
        "rotation": -0.2,
        "size": 1.7
      },
      {
        "id": "cozy-lamp",
        "label": "Table lamp",
        "model": "/assets/board/cozy/table-lamp.glb",
        "position": [
          0.1,
          -0.02,
          5.5
        ],
        "rotation": 0.1,
        "size": 1.65,
        "glow": {
          "color": "#ffd0a1",
          "intensity": 1.2,
          "distance": 8
        }
      }
    ]
  },
  "garden": {
    "id": "garden",
    "label": "Secret garden",
    "environment": {
      "top": "#243b4a",
      "horizon": "#b47d92",
      "bottom": "#324b47",
      "glow": "#e4c5a5",
      "motes": "#d8f4a5",
      "mode": "fireflies",
      "count": 25,
      "panorama": "/assets/board/skyboxes/garden.webp"
    },
    "skinOverlay": "/assets/board/skins/garden.svg",
    "diceSkin": {
      "face": "#315241",
      "alternate": "#243f3b",
      "pip": "#f7e9b8",
      "edge": "#c5dca5"
    },
    "spaceColors": {
      "connection": "#456953",
      "duel": "#3b5260",
      "heart": "#725a4c",
      "keepsake": "#436859",
      "oops": "#71545f"
    },
    "cardSkin": {
      "top": "#f3efd9",
      "bottom": "#dbe3ca",
      "ink": "#253932",
      "accent": "#587f62",
      "border": "#c4d1a9"
    },
    "surfaces": {
      "inset": {
        "color": "#ffffff",
        "repeat": [
          3,
          3
        ],
        "texture": "/assets/board/garden-velvet-texture.png"
      },
      "tabletop": {
        "color": "#e9ebc8",
        "repeat": [
          2.5,
          2.5
        ],
        "texture": "/assets/board/garden-velvet-texture.png"
      }
    },
    "decorations": [
      {
        "id": "garden-rose-planter",
        "label": "Rose planter",
        "model": "/assets/board/garden/rose-planter.glb",
        "position": [
          -6.4,
          -0.02,
          -3.8
        ],
        "rotation": -0.3,
        "size": 1.9
      },
      {
        "id": "garden-bench",
        "label": "Garden bench",
        "model": "/assets/board/garden/garden-bench.glb",
        "position": [
          6.4,
          -0.02,
          -3.6
        ],
        "rotation": 0.56,
        "size": 2.05
      },
      {
        "id": "garden-watering-can",
        "label": "Watering can",
        "model": "/assets/board/garden/watering-can.glb",
        "position": [
          -5.1,
          -0.02,
          3.2
        ],
        "rotation": 0.28,
        "size": 1.55
      },
      {
        "id": "garden-butterfly",
        "label": "Blue butterfly",
        "model": "/assets/board/garden/blue-butterfly.glb",
        "position": [
          -5.25,
          1.1,
          -2.5
        ],
        "rotation": -0.2,
        "size": 1.15,
        "motion": "flutter"
      },
      {
        "id": "garden-songbird",
        "label": "Garden songbird",
        "model": "/assets/board/garden/garden-songbird.glb",
        "position": [
          0.1,
          -0.02,
          5.5
        ],
        "rotation": 0.26,
        "size": 1.4,
        "motion": "perch"
      }
    ]
  },
  "beach": {
    "id": "beach",
    "label": "Seaside date",
    "environment": {
      "top": "#2e7696",
      "horizon": "#e6ac8b",
      "bottom": "#65819a",
      "glow": "#f7d4b0",
      "motes": "#f7e8c7",
      "mode": "sea",
      "count": 20,
      "panorama": "/assets/board/skyboxes/beach.webp"
    },
    "skinOverlay": "/assets/board/skins/beach.svg",
    "diceSkin": {
      "face": "#26556b",
      "alternate": "#183f55",
      "pip": "#f9e5b8",
      "edge": "#aad9df"
    },
    "spaceColors": {
      "connection": "#316b77",
      "duel": "#315b79",
      "heart": "#985e62",
      "keepsake": "#436e78",
      "oops": "#915c62"
    },
    "cardSkin": {
      "top": "#f0f7f0",
      "bottom": "#cce4e3",
      "ink": "#173f50",
      "accent": "#248092",
      "border": "#abd5d5"
    },
    "surfaces": {
      "inset": {
        "color": "#ffffff",
        "repeat": [
          3,
          3
        ],
        "texture": "/assets/board/beach-velvet-texture.png"
      },
      "tabletop": {
        "color": "#e2f0ef",
        "repeat": [
          2.7,
          2.7
        ],
        "texture": "/assets/board/beach-velvet-texture.png"
      }
    },
    "decorations": [
      {
        "id": "beach-surfboard-rack",
        "label": "Surfboard rack",
        "model": "/assets/board/beach/surfboard-rack.glb",
        "position": [
          -6.4,
          -0.02,
          -3.8
        ],
        "rotation": -0.34,
        "size": 2.1
      },
      {
        "id": "beach-sandcastle",
        "label": "Sandcastle",
        "model": "/assets/board/beach/sandcastle.glb",
        "position": [
          6.4,
          -0.02,
          -3.6
        ],
        "rotation": 0.48,
        "size": 1.9
      },
      {
        "id": "beach-picnic-basket",
        "label": "Beach picnic basket",
        "model": "/assets/board/beach/beach-picnic-basket.glb",
        "position": [
          -5.1,
          -0.02,
          3.2
        ],
        "rotation": 0.2,
        "size": 1.8
      },
      {
        "id": "beach-firepit",
        "label": "Beach fire pit",
        "model": "/assets/board/beach/beach-firepit.glb",
        "position": [
          5.2,
          -0.02,
          3.4
        ],
        "rotation": -0.18,
        "size": 1.85,
        "glow": {
          "color": "#ffba79",
          "intensity": 1.5,
          "distance": 7
        }
      },
      {
        "id": "beach-deck-chair",
        "label": "Striped deck chair",
        "model": "/assets/board/beach/striped-deck-chair.glb",
        "position": [
          2.65,
          -0.02,
          4.65
        ],
        "rotation": -0.28,
        "size": 1.75
      }
    ]
  },
  "city": {
    "id": "city",
    "label": "City date night",
    "environment": {
      "top": "#1b1e40",
      "horizon": "#745a8c",
      "bottom": "#2f2946",
      "glow": "#d8b1ef",
      "motes": "#ffd4ab",
      "mode": "lights",
      "count": 22,
      "panorama": "/assets/board/skyboxes/city.webp"
    },
    "skinOverlay": "/assets/board/skins/city.svg",
    "diceSkin": {
      "face": "#3b315f",
      "alternate": "#25203f",
      "pip": "#ffe0ad",
      "edge": "#d9b6ef"
    },
    "spaceColors": {
      "connection": "#55466f",
      "duel": "#38496d",
      "heart": "#78465f",
      "keepsake": "#594c78",
      "oops": "#69465f"
    },
    "cardSkin": {
      "top": "#eee6f4",
      "bottom": "#d8cde7",
      "ink": "#312541",
      "accent": "#7a5b9b",
      "border": "#d0bee4"
    },
    "surfaces": {
      "inset": {
        "color": "#ffffff",
        "repeat": [
          3,
          3
        ],
        "texture": "/assets/board/city-velvet-texture.png"
      },
      "tabletop": {
        "color": "#efe5ef",
        "repeat": [
          2.2,
          2.2
        ],
        "texture": "/assets/board/city-velvet-texture.png"
      }
    },
    "decorations": [
      {
        "id": "city-dessert",
        "label": "Dessert for two",
        "model": "/assets/board/city/dessert-for-two.glb",
        "position": [
          -6.4,
          -0.02,
          -3.8
        ],
        "rotation": -0.38,
        "size": 1.7
      },
      {
        "id": "city-heart-coffee",
        "label": "Black heart coffee",
        "model": "/assets/board/city/black-heart-coffee.glb",
        "position": [
          -4.1,
          -0.02,
          -3.2
        ],
        "rotation": 0.48,
        "size": 1.45
      },
      {
        "id": "city-love-note-bouquet",
        "label": "Love-note bouquet",
        "model": "/assets/board/city/love-note-bouquet.glb",
        "position": [
          2.5,
          -0.02,
          2.65
        ],
        "rotation": 0.24,
        "size": 1.85
      },
      {
        "id": "city-flower-cart",
        "label": "Flower cart",
        "model": "/assets/board/city/flower-cart.glb",
        "position": [
          5.2,
          -0.02,
          3.4
        ],
        "rotation": -0.2,
        "size": 2.1,
        "glow": {
          "color": "#f4b7d5",
          "intensity": 0.8,
          "distance": 7
        }
      },
      {
        "id": "city-taxi",
        "label": "Little yellow taxi",
        "model": "/assets/board/city/little-yellow-taxi.glb",
        "position": [
          0.1,
          -0.02,
          5.5
        ],
        "rotation": 0.1,
        "size": 1.8
      }
    ]
  },
  "holiday": {
    "id": "holiday",
    "label": "Holiday sparkle",
    "environment": {
      "top": "#1b3447",
      "horizon": "#8097a9",
      "bottom": "#244257",
      "glow": "#dbeaf5",
      "motes": "#f6f6ee",
      "mode": "snow",
      "count": 42,
      "panorama": "/assets/board/skyboxes/holiday.webp"
    },
    "skinOverlay": "/assets/board/skins/holiday.svg",
    "diceSkin": {
      "face": "#294a56",
      "alternate": "#1b3543",
      "pip": "#f3d58f",
      "edge": "#d6c28d"
    },
    "spaceColors": {
      "connection": "#365d64",
      "duel": "#3f596c",
      "heart": "#82545b",
      "keepsake": "#416171",
      "oops": "#744e56"
    },
    "cardSkin": {
      "top": "#f7f4e8",
      "bottom": "#d6e5e7",
      "ink": "#183845",
      "accent": "#9b6d41",
      "border": "#d2c69a"
    },
    "surfaces": {
      "inset": {
        "color": "#ffffff",
        "repeat": [
          3,
          3
        ],
        "texture": "/assets/board/holiday-velvet-texture.png"
      },
      "tabletop": {
        "color": "#e6f0de",
        "repeat": [
          2.2,
          2.2
        ],
        "texture": "/assets/board/holiday-velvet-texture.png"
      }
    },
    "decorations": [
      {
        "id": "holiday-snow-mug",
        "label": "Snowy cocoa mug",
        "model": "/assets/board/holiday/snowy-cocoa-mug.glb",
        "position": [
          -6.4,
          -0.02,
          -3.8
        ],
        "rotation": -0.38,
        "size": 1.5
      },
      {
        "id": "holiday-cocoa-jar",
        "label": "Cocoa jar",
        "model": "/assets/board/holiday/cocoa-jar.glb",
        "position": [
          -4.15,
          -0.02,
          -3.25
        ],
        "rotation": 0.48,
        "size": 1.55
      },
      {
        "id": "holiday-twinkle-lights",
        "label": "Twinkle lights",
        "model": "/assets/board/holiday/twinkle-lights.glb",
        "position": [
          -5.1,
          0.02,
          3.2
        ],
        "rotation": 0.24,
        "size": 1.9,
        "glow": {
          "color": "#ffd5a7",
          "intensity": 1,
          "distance": 8
        }
      },
      {
        "id": "holiday-wreath",
        "label": "Winter wreath",
        "model": "/assets/board/holiday/winter-wreath.glb",
        "position": [
          5.2,
          0.12,
          3.4
        ],
        "rotation": -0.2,
        "size": 1.7
      },
      {
        "id": "holiday-gift",
        "label": "Wrapped present",
        "model": "/assets/board/holiday/wrapped-present.glb",
        "position": [
          0.1,
          -0.02,
          5.5
        ],
        "rotation": 0.1,
        "size": 1.6
      }
    ]
  }
}
```


## Player pieces and visual styles

Source: `src/features/couple/playerAvatar.js`.

### `PLAYER_PIECE_CATEGORIES` (5 entries)

```json
[
  {
    "id": "romance",
    "label": "Love Notes"
  },
  {
    "id": "cozy",
    "label": "Cozy"
  },
  {
    "id": "game-night",
    "label": "Game Night"
  },
  {
    "id": "adventure",
    "label": "Adventure"
  },
  {
    "id": "creative",
    "label": "Creative"
  }
]
```

### `PLAYER_PIECES` (52 entries)

```json
[
  {
    "avatar": "/assets/players/heart.glb",
    "category": "romance",
    "id": "heart",
    "label": "Heart",
    "thumbnail": "/assets/players/thumbs/heart.webp"
  },
  {
    "avatar": "/assets/players/ring.glb",
    "category": "romance",
    "id": "ring",
    "label": "Ring",
    "thumbnail": "/assets/players/thumbs/ring.webp"
  },
  {
    "avatar": "/assets/players/cupid.glb",
    "category": "romance",
    "id": "cupid",
    "label": "Cupid",
    "thumbnail": "/assets/players/thumbs/cupid.webp"
  },
  {
    "avatar": "/assets/players/rose-bouquet.glb",
    "category": "romance",
    "id": "rose-bouquet",
    "label": "Roses",
    "thumbnail": "/assets/players/thumbs/rose-bouquet.webp"
  },
  {
    "avatar": "/assets/players/gift-box.glb",
    "category": "romance",
    "id": "gift-box",
    "label": "Gift",
    "thumbnail": "/assets/players/thumbs/gift-box.webp"
  },
  {
    "avatar": "/assets/players/teddy-bear.glb",
    "category": "romance",
    "id": "teddy-bear",
    "label": "Teddy",
    "thumbnail": "/assets/players/thumbs/teddy-bear.webp"
  },
  {
    "avatar": "/assets/players/curled-cat.glb",
    "category": "cozy",
    "id": "curled-cat",
    "label": "Cat",
    "thumbnail": "/assets/players/thumbs/curled-cat.webp"
  },
  {
    "avatar": "/assets/players/puppy.glb",
    "category": "cozy",
    "id": "puppy",
    "label": "Puppy",
    "thumbnail": "/assets/players/thumbs/puppy.webp"
  },
  {
    "avatar": "/assets/players/rabbit.glb",
    "category": "cozy",
    "id": "rabbit",
    "label": "Rabbit",
    "thumbnail": "/assets/players/thumbs/rabbit.webp"
  },
  {
    "avatar": "/assets/players/owl.glb",
    "category": "cozy",
    "id": "owl",
    "label": "Owl",
    "thumbnail": "/assets/players/thumbs/owl.webp"
  },
  {
    "avatar": "/assets/players/penguin.glb",
    "category": "cozy",
    "id": "penguin",
    "label": "Penguin",
    "thumbnail": "/assets/players/thumbs/penguin.webp"
  },
  {
    "avatar": "/assets/players/dolphin.glb",
    "category": "cozy",
    "id": "dolphin",
    "label": "Dolphin",
    "thumbnail": "/assets/players/thumbs/dolphin.webp"
  },
  {
    "avatar": "/assets/players/tiger.glb",
    "category": "cozy",
    "id": "tiger",
    "label": "Tiger",
    "thumbnail": "/assets/players/thumbs/tiger.webp"
  },
  {
    "avatar": "/assets/players/gorilla.glb",
    "category": "cozy",
    "id": "gorilla",
    "label": "Gorilla",
    "thumbnail": "/assets/players/thumbs/gorilla.webp"
  },
  {
    "avatar": "/assets/players/chicken.glb",
    "category": "cozy",
    "id": "chicken",
    "label": "Chicken",
    "thumbnail": "/assets/players/thumbs/chicken.webp"
  },
  {
    "avatar": "/assets/players/strawberry.glb",
    "category": "cozy",
    "id": "strawberry",
    "label": "Strawberry",
    "thumbnail": "/assets/players/thumbs/strawberry.webp"
  },
  {
    "avatar": "/assets/players/campfire.glb",
    "category": "cozy",
    "id": "campfire",
    "label": "Campfire",
    "thumbnail": "/assets/players/thumbs/campfire.webp"
  },
  {
    "avatar": "/assets/players/hot-air-balloon.glb",
    "category": "cozy",
    "id": "hot-air-balloon",
    "label": "Balloon",
    "thumbnail": "/assets/players/thumbs/hot-air-balloon.webp"
  },
  {
    "avatar": "/assets/players/game-controller.glb",
    "category": "game-night",
    "id": "game-controller",
    "label": "Controller",
    "thumbnail": "/assets/players/thumbs/game-controller.webp"
  },
  {
    "avatar": "/assets/players/chess-knight.glb",
    "category": "game-night",
    "id": "chess-knight",
    "label": "Knight",
    "thumbnail": "/assets/players/thumbs/chess-knight.webp"
  },
  {
    "avatar": "/assets/players/royal-crown.glb",
    "category": "game-night",
    "id": "royal-crown",
    "label": "Royal Crown",
    "thumbnail": "/assets/players/thumbs/royal-crown.webp"
  },
  {
    "avatar": "/assets/players/jeweled-crown.glb",
    "category": "game-night",
    "id": "jeweled-crown",
    "label": "Jeweled Crown",
    "thumbnail": "/assets/players/thumbs/jeweled-crown.webp"
  },
  {
    "avatar": "/assets/players/floral-crown.glb",
    "category": "game-night",
    "id": "floral-crown",
    "label": "Floral Crown",
    "thumbnail": "/assets/players/thumbs/floral-crown.webp"
  },
  {
    "avatar": "/assets/players/treasure-chest.glb",
    "category": "game-night",
    "id": "treasure-chest",
    "label": "Treasure",
    "thumbnail": "/assets/players/thumbs/treasure-chest.webp"
  },
  {
    "avatar": "/assets/players/jester-hat.glb",
    "category": "game-night",
    "id": "jester-hat",
    "label": "Jester",
    "thumbnail": "/assets/players/thumbs/jester-hat.webp"
  },
  {
    "avatar": "/assets/players/magic-wand.glb",
    "category": "game-night",
    "id": "magic-wand",
    "label": "Wand",
    "thumbnail": "/assets/players/thumbs/magic-wand.webp"
  },
  {
    "avatar": "/assets/players/throne.glb",
    "category": "game-night",
    "id": "throne",
    "label": "Throne",
    "thumbnail": "/assets/players/thumbs/throne.webp"
  },
  {
    "avatar": "/assets/players/horseshoe.glb",
    "category": "game-night",
    "id": "horseshoe",
    "label": "Horseshoe",
    "thumbnail": "/assets/players/thumbs/horseshoe.webp"
  },
  {
    "avatar": "/assets/players/paw-print.glb",
    "category": "game-night",
    "id": "paw-print",
    "label": "Paw",
    "thumbnail": "/assets/players/thumbs/paw-print.webp"
  },
  {
    "avatar": "/assets/players/maple-leaf.glb",
    "category": "game-night",
    "id": "maple-leaf",
    "label": "Leaf",
    "thumbnail": "/assets/players/thumbs/maple-leaf.webp"
  },
  {
    "avatar": "/assets/players/hourglass.glb",
    "category": "game-night",
    "id": "hourglass",
    "label": "Hourglass",
    "thumbnail": "/assets/players/thumbs/hourglass.webp"
  },
  {
    "avatar": "/assets/players/locomotive.glb",
    "category": "adventure",
    "id": "locomotive",
    "label": "Train",
    "thumbnail": "/assets/players/thumbs/locomotive.webp"
  },
  {
    "avatar": "/assets/players/scooter.glb",
    "category": "adventure",
    "id": "scooter",
    "label": "Scooter",
    "thumbnail": "/assets/players/thumbs/scooter.webp"
  },
  {
    "avatar": "/assets/players/motorcycle.glb",
    "category": "adventure",
    "id": "motorcycle",
    "label": "Motorcycle",
    "thumbnail": "/assets/players/thumbs/motorcycle.webp"
  },
  {
    "avatar": "/assets/players/classic-car.glb",
    "category": "adventure",
    "id": "classic-car",
    "label": "Car",
    "thumbnail": "/assets/players/thumbs/classic-car.webp"
  },
  {
    "avatar": "/assets/players/airplane.glb",
    "category": "adventure",
    "id": "airplane",
    "label": "Plane",
    "thumbnail": "/assets/players/thumbs/airplane.webp"
  },
  {
    "avatar": "/assets/players/sailboat.glb",
    "category": "adventure",
    "id": "sailboat",
    "label": "Sailboat",
    "thumbnail": "/assets/players/thumbs/sailboat.webp"
  },
  {
    "avatar": "/assets/players/globe-classic.glb",
    "category": "adventure",
    "id": "globe-classic",
    "label": "Globe",
    "thumbnail": "/assets/players/thumbs/globe-classic.webp"
  },
  {
    "avatar": "/assets/players/camera.glb",
    "category": "adventure",
    "id": "camera",
    "label": "Camera",
    "thumbnail": "/assets/players/thumbs/camera.webp"
  },
  {
    "avatar": "/assets/players/sneaker.glb",
    "category": "adventure",
    "id": "sneaker",
    "label": "Sneaker",
    "thumbnail": "/assets/players/thumbs/sneaker.webp"
  },
  {
    "avatar": "/assets/players/microphone.glb",
    "category": "creative",
    "id": "microphone",
    "label": "Mic",
    "thumbnail": "/assets/players/thumbs/microphone.webp"
  },
  {
    "avatar": "/assets/players/music-note.glb",
    "category": "creative",
    "id": "music-note",
    "label": "Note",
    "thumbnail": "/assets/players/thumbs/music-note.webp"
  },
  {
    "avatar": "/assets/players/guitar.glb",
    "category": "creative",
    "id": "guitar",
    "label": "Guitar",
    "thumbnail": "/assets/players/thumbs/guitar.webp"
  },
  {
    "avatar": "/assets/players/pencil.glb",
    "category": "creative",
    "id": "pencil",
    "label": "Pencil",
    "thumbnail": "/assets/players/thumbs/pencil.webp"
  },
  {
    "avatar": "/assets/players/book-stack.glb",
    "category": "creative",
    "id": "book-stack",
    "label": "Books",
    "thumbnail": "/assets/players/thumbs/book-stack.webp"
  },
  {
    "avatar": "/assets/players/vintage-tv.glb",
    "category": "creative",
    "id": "vintage-tv",
    "label": "TV",
    "thumbnail": "/assets/players/thumbs/vintage-tv.webp"
  },
  {
    "avatar": "/assets/players/laptop.glb",
    "category": "creative",
    "id": "laptop",
    "label": "Laptop",
    "thumbnail": "/assets/players/thumbs/laptop.webp"
  },
  {
    "avatar": "/assets/players/smartphone-classic.glb",
    "category": "creative",
    "id": "smartphone-classic",
    "label": "Classic Phone",
    "thumbnail": "/assets/players/thumbs/smartphone-classic.webp"
  },
  {
    "avatar": "/assets/players/smartphone-modern.glb",
    "category": "creative",
    "id": "smartphone-modern",
    "label": "Modern Phone",
    "thumbnail": "/assets/players/thumbs/smartphone-modern.webp"
  },
  {
    "avatar": "/assets/players/smartwatch.glb",
    "category": "creative",
    "id": "smartwatch",
    "label": "Watch",
    "thumbnail": "/assets/players/thumbs/smartwatch.webp"
  },
  {
    "avatar": "/assets/players/headphones.glb",
    "category": "creative",
    "id": "headphones",
    "label": "Headphones",
    "thumbnail": "/assets/players/thumbs/headphones.webp"
  },
  {
    "avatar": "/assets/players/frying-pan.glb",
    "category": "creative",
    "id": "frying-pan",
    "label": "Pan",
    "thumbnail": "/assets/players/thumbs/frying-pan.webp"
  }
]
```

### `PLAYER_THEMES` (2 entries)

```json
[
  {
    "color": "#ff7a97",
    "accent": "#ff5478",
    "avatar": "/assets/players/heart.glb"
  },
  {
    "color": "#59b5ff",
    "accent": "#2aa1ff",
    "avatar": "/assets/players/globe-classic.glb"
  }
]
```


## Portrait frames

Source: `src/features/couple/portraitFrames.js`.

### `PORTRAIT_FRAMES` (6 entries)

```json
[
  {
    "id": "ribbon",
    "label": "Our Ribbon",
    "cost": 0,
    "description": "Two fine gold loops, tied together."
  },
  {
    "id": "ivory",
    "label": "Ivory Cameo",
    "cost": 0,
    "description": "A pearl edge for your everyday portrait."
  },
  {
    "id": "midnight",
    "label": "Midnight",
    "cost": 0,
    "description": "Quiet teal with an engraved gold edge."
  },
  {
    "id": "starlight",
    "label": "Starlit Promise",
    "cost": 24,
    "description": "A little constellation around your person."
  },
  {
    "id": "rose",
    "label": "Rose Gilt",
    "cost": 48,
    "description": "Petal scrolls in warm rose gold."
  },
  {
    "id": "laurel",
    "label": "Evergreen Vow",
    "cost": 80,
    "description": "A gilded botanical wreath, made to keep."
  }
]
```


## Pinky Swear promise draw deck and progression

Source: `src/features/couple/progressService.js`.

### `KOUPON_DECK` (18 entries)

```json
[
  {
    "detail": "",
    "label": "Breakfast in bed"
  },
  {
    "detail": "",
    "label": "Your movie pick"
  },
  {
    "detail": "",
    "label": "Shoulder rub"
  },
  {
    "detail": "",
    "label": "Phone-free walk"
  },
  {
    "detail": "",
    "label": "Anything you want"
  },
  {
    "detail": "",
    "label": "Your playlist"
  },
  {
    "detail": "",
    "label": "Sleep-in pass"
  },
  {
    "detail": "",
    "label": "Stargazing"
  },
  {
    "detail": "",
    "label": "Fine dining for two"
  },
  {
    "detail": "",
    "label": "Surprise date"
  },
  {
    "detail": "",
    "label": "Letters"
  },
  {
    "detail": "",
    "label": "Day trip"
  },
  {
    "detail": "",
    "label": "Takeout surprise"
  },
  {
    "detail": "",
    "label": "Slow morning"
  },
  {
    "detail": "",
    "label": "Make a playlist"
  },
  {
    "detail": "",
    "label": "Framed photo"
  },
  {
    "detail": "",
    "label": "Chore takeover"
  },
  {
    "detail": "",
    "label": "Coffee run"
  }
]
```

### `BASE_THEME_CARDS` (5 entries)

```json
[
  {
    "art": "/assets/themes/tabletop-cozy-night-in.webp",
    "id": "cozy",
    "label": "Cozy"
  },
  {
    "art": "/assets/themes/tabletop-secret-garden.webp",
    "id": "garden",
    "label": "Garden"
  },
  {
    "art": "/assets/themes/tabletop-seaside-date.webp",
    "id": "beach",
    "label": "Seaside"
  },
  {
    "art": "/assets/themes/tabletop-city-date-night.webp",
    "id": "city",
    "label": "City"
  },
  {
    "art": "/assets/themes/tabletop-holiday-sparkle.webp",
    "id": "holiday",
    "label": "Holiday"
  }
]
```

### `UNLOCKABLE_THEMES` (4 entries)

```json
[
  {
    "art": "/assets/themes/unlock-starlit-rooftop.webp",
    "blurb": "String lights, skyline hum, just the two of you above it all.",
    "cost": 60,
    "id": "starlit-rooftop",
    "label": "Rooftop"
  },
  {
    "art": "/assets/themes/unlock-autumn-embers.webp",
    "blurb": "Crackling leaves and cider-warm light.",
    "cost": 120,
    "id": "autumn-embers",
    "label": "Autumn"
  },
  {
    "art": "/assets/themes/unlock-cherry-blossom.webp",
    "blurb": "A soft storm of petals over the board.",
    "cost": 200,
    "id": "cherry-blossom",
    "label": "Blossom"
  },
  {
    "art": "/assets/themes/unlock-aurora-veil.webp",
    "blurb": "The sky itself leans in to watch you play.",
    "cost": 320,
    "id": "aurora-veil",
    "label": "Aurora"
  }
]
```

### `TROPHIES` (13 entries)

```json
[
  {
    "detail": "Closed out your very first game night.",
    "id": "first-night",
    "label": "First Night"
  },
  {
    "detail": "Ten nights together and counting.",
    "id": "ten-nights",
    "label": "Ten Nights"
  },
  {
    "detail": "Twenty-five nights of play.",
    "id": "twentyfive-nights",
    "label": "25 Nights"
  },
  {
    "detail": "Fifty nights. That is devotion.",
    "id": "fifty-nights",
    "label": "50 Nights"
  },
  {
    "detail": "A 7-night streak, together.",
    "id": "streak-7",
    "label": "Week of Us"
  },
  {
    "detail": "A 30-night streak, together.",
    "id": "streak-30",
    "label": "Month of Us"
  },
  {
    "detail": "Shared a duel victory.",
    "id": "duel-champions",
    "label": "Duel Champions"
  },
  {
    "detail": "Matched on a sealed prediction.",
    "id": "mind-reader",
    "label": "Mind Reader"
  },
  {
    "detail": "Pocketed 3 keepsakes in one night.",
    "id": "keepsake-keeper",
    "label": "Keepsake Keeper"
  },
  {
    "detail": "Unlocked a tabletop theme.",
    "id": "theme-collector",
    "label": "Table Stylist"
  },
  {
    "detail": "Fulfilled a pinky swear.",
    "id": "koupon-giver",
    "label": "Promise Keeper"
  },
  {
    "detail": "Finished a full-length night.",
    "id": "marathon",
    "label": "Marathoners"
  },
  {
    "detail": "Matched on a sealed desire card.",
    "id": "mutual-yes",
    "label": "Mutual Yes"
  }
]
```

### `COMPANION_STAGES` (4 entries)

```json
[
  {
    "heartsNeeded": 0,
    "label": "Egg"
  },
  {
    "heartsNeeded": 50,
    "label": "Hatchling"
  },
  {
    "heartsNeeded": 150,
    "label": "Baby"
  },
  {
    "heartsNeeded": 300,
    "label": "Adult"
  }
]
```

### `FLOWER_STAGES` (4 entries)

```json
[
  {
    "growthNeeded": 0,
    "label": "A tiny seed"
  },
  {
    "growthNeeded": 1,
    "label": "Sprout"
  },
  {
    "growthNeeded": 3,
    "label": "Bud"
  },
  {
    "growthNeeded": 6,
    "label": "In bloom"
  }
]
```

### `MILESTONE_NIGHTS` (5 entries)

```json
[
  1,
  10,
  25,
  50,
  100
]
```


## Our Bloom flower collection

Source: `src/flower/flowerSpecies.js`.

### `FLOWER_SPECIES` (5 entries)

```json
[
  {
    "id": "daisy",
    "name": "Daisy",
    "kind": "ray",
    "petals": 12,
    "petalColor": "#fff9ea",
    "petalShade": "#e8d9d4",
    "centerColor": "#e4a936",
    "leafColor": "#4e9a5c",
    "leafWidth": 0.9,
    "leafLength": 0.9,
    "stemHeight": 1
  },
  {
    "id": "tulip",
    "name": "Tulip",
    "kind": "cup",
    "petals": 6,
    "petalColor": "#e86971",
    "petalShade": "#b93b59",
    "centerColor": "#f0c75e",
    "leafColor": "#4a956b",
    "leafWidth": 0.68,
    "leafLength": 1.4,
    "stemHeight": 0.92
  },
  {
    "id": "sunflower",
    "name": "Sunflower",
    "kind": "ray",
    "petals": 18,
    "petalColor": "#efb83e",
    "petalShade": "#d77c2f",
    "centerColor": "#684335",
    "leafColor": "#5d8e47",
    "leafWidth": 1.3,
    "leafLength": 1.06,
    "stemHeight": 1.16
  },
  {
    "id": "rose",
    "name": "Rose",
    "kind": "rose",
    "petals": 14,
    "petalColor": "#df688b",
    "petalShade": "#a63d66",
    "centerColor": "#e7a2a2",
    "leafColor": "#467e58",
    "leafWidth": 1.1,
    "leafLength": 0.78,
    "stemHeight": 0.94
  },
  {
    "id": "cosmos",
    "name": "Cosmos",
    "kind": "ray",
    "petals": 8,
    "petalColor": "#eaa4c1",
    "petalShade": "#ca719b",
    "centerColor": "#efba52",
    "leafColor": "#5b9d62",
    "leafWidth": 0.46,
    "leafLength": 1.12,
    "stemHeight": 1.08
  }
]
```

### `FLOWER_DAYS_TO_BLOOM`

```json
6
```
