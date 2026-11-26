// expandedSessionArcs.js — 5 session arcs + pairing rules + guardrails
// At Long Last — Expanded Edition (Nov 26, 2026)
// The catalog is a menu, not a list to work through in order. An arc is
// a suggested order for one night. validateArc() checks pairing rules:
// no two Intensity-2+ back-to-back without a breather, and ends on sealed/ritual.

export const SESSION_ARCS = [
  {
    "id": "first-night",
    "title": "First Night",
    "subtitle": "low vulnerability, high play",
    "mood": "Playful",
    "steps": [
      {
        "activityId": "mind-meld",
        "label": "Mind Meld (2–3 questions) — warm-up, low stakes"
      },
      {
        "activityId": "cursed-date-12",
        "label": "Cursed Date — laughter"
      },
      {
        "activityId": "doodle-duel-memory",
        "label": "Keepsake Sketch duel — bad drawings, more laughter"
      },
      {
        "activityId": "comfort-menu",
        "label": "Comfort Menu — one prompt, to end on care"
      },
      {
        "activityId": "the-vault",
        "label": "Vault — seal one compliment for the finale"
      }
    ]
  },
  {
    "id": "tired-night",
    "title": "Tired Night",
    "subtitle": "low energy, high care",
    "mood": "Cozy",
    "steps": [
      {
        "activityId": "weather-report",
        "label": "Weather Report — 1 prompt, no fixing"
      },
      {
        "activityId": "rose-thorn-seed",
        "label": "Rose, Thorn, Seed — 1 round, 3 sentences"
      },
      {
        "activityId": "sync-breath",
        "label": "Quiet Moment duel — breath"
      },
      {
        "activityId": "small-mercies",
        "label": "Small Mercies — 1 prompt"
      },
      {
        "activityId": "landing-lights",
        "label": "Landing Lights — land together, end"
      }
    ]
  },
  {
    "id": "long-distance-night",
    "title": "Long-Distance Night",
    "subtitle": "apart, but together",
    "mood": "Dreamy",
    "steps": [
      {
        "activityId": "long-distance-window",
        "label": "Long-Distance Window (NEW) — same sky, same photo"
      },
      {
        "activityId": "what-miss-today",
        "label": "What I Miss Today — 1 prompt"
      },
      {
        "activityId": "sound-capsule",
        "label": "Sound Capsule — leave a 7-second sound"
      },
      {
        "activityId": "landing-lights",
        "label": "Landing Lights — land together"
      },
      {
        "activityId": "postcard-next-year",
        "label": "Postcard From Next Year — write to future-us"
      }
    ]
  },
  {
    "id": "playful-tender-mix",
    "title": "Playful + Tender Mix",
    "subtitle": "for a full night",
    "mood": "Playful",
    "steps": [
      {
        "activityId": "bluff-bidding",
        "label": "Bluff Bidding — 1 category, bid boldly"
      },
      {
        "activityId": "build-a-cult",
        "label": "Build-A-Cult — invent a society"
      },
      {
        "activityId": "gratitude-duel",
        "label": "Gratitude Duel — 1 prompt, parallel gratitude"
      },
      {
        "activityId": "museum-of-us",
        "label": "Museum of Us — 1 exhibit"
      },
      {
        "activityId": "mutual-yes",
        "label": "Mutual Yes — 1 card, double-blind"
      },
      {
        "activityId": "the-vault",
        "label": "Vault — seal one for finale"
      }
    ]
  },
  {
    "id": "repair-night",
    "title": "Repair Night",
    "subtitle": "after a hard week, not mid-conflict",
    "mood": "Cozy",
    "steps": [
      {
        "activityId": "gentle-signal",
        "label": "Gentle Signal — agree on one signal"
      },
      {
        "activityId": "repair-kit",
        "label": "Repair Kit (NEW) — 2 prompts, calm"
      },
      {
        "activityId": "invisible-backpack",
        "label": "Invisible Backpack — 1 prompt, no fixing"
      },
      {
        "activityId": "growth-ring",
        "label": "Growth Ring — 1 prompt, what got lighter?"
      },
      {
        "activityId": "afterglow-notes",
        "label": "Afterglow Notes (NEW) — write one afterglow line for tonight"
      }
    ]
  }
];

export const PAIRING_RULES = [
  "Always pair a Playful with a Tender in the same night. Play opens, tenderness lands.",
  "Never play two Intensity-2+ activities back-to-back without a Playful or Ritual in between. Vulnerability needs a breather.",
  "End with a sealed or ritual activity (Vault, Landing Lights, Shared Seed, Afterglow) — not a debate. The last moment should be a keeping, not a solving."
];

export const EXPANDED_GUARDRAILS = [
  "Explicit content: Spicy stays at tiny, specific, opt-in closeness. Specificity > heat, consent > pressure.",
  "Scoring / leaderboards: No activity ranks couples against each other. The only 'scores' are: did we match? did we guess? did we stay?",
  "Advice / therapy: Bad Advice is a joke, not therapy. Repair Kit is a language, not a treatment. The game gives words, not diagnoses.",
  "More moods: Cozy / Playful / Flirty / Dreamy / Wild already cover the range. No new moods.",
  "More 'big' prompts: Every prompt is small, recent, and specific. A prompt that asks for a lifetime is less useful than one that asks for today."
];


export function getSessionArc(id) { return SESSION_ARCS.find((a) => a.id === id) ?? null; }
export function getAllSessionArcs() { return SESSION_ARCS; }
// Validate an arc against pairing rules given a lookup of activityId -> {intensity, type}.
// Returns { valid, issues: string[] }. Breather = type ritual OR intensity 1 playful.
export function validateArc(steps, lookup) {
  const issues = [];
  for (let i = 1; i < steps.length; i++) {
    const prev = lookup[steps[i - 1].activityId];
    const cur = lookup[steps[i].activityId];
    if (prev && cur && prev.intensity >= 2 && cur.intensity >= 2) {
      issues.push(`Steps ${i}–${i + 1} are both Intensity 2+ with no breather: ${steps[i - 1].activityId} → ${steps[i].activityId}`);
    }
  }
  const last = lookup[steps[steps.length - 1]?.activityId];
  if (last && !(last.type === 'ritual' || last.type === 'vault' || last.id === 'the-vault')) {
    // Last step should be sealed/ritual — warn, don't block.
    issues.push(`Last step (${steps[steps.length - 1].activityId}) is not a sealed/ritual closer. Prefer Vault, Landing Lights, Shared Seed, or Afterglow.`);
  }
  return { valid: issues.length === 0, issues };
}
