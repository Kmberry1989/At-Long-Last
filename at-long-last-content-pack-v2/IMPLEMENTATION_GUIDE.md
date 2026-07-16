# At Long Last — Content Pack + Implementation Guide

You asked to lean into all three vibes. This pack gives you **60 pieces** ready to drop in.

## What's Inside

```
/src/features/session/
  activityRegistry.ts  — 45 activities (15 tender / 15 playful / 15 spicy)
  duelRegistry.ts      — 15 microgames (5 tender / 5 playful / 5 spicy)

/components/
  VibeDial.tsx         — draggable triangle mood picker (needs framer-motion)

/snippets/
  sessionWiring.ts     — weighted pick + session queue builder
  firebaseHelpers.ts   — invite codes + Firestore rules starter
```

## Install

```bash
npm install framer-motion
```

Copy:
- `activityRegistry.ts` -> `src/features/session/activityRegistry.ts` (merge if you have one)
- `duelRegistry.ts` -> `src/features/session/duelRegistry.ts`
- `VibeDial.tsx` -> `src/components/VibeDial.tsx`
- snippets -> merge into your existing session/couple helpers

## The Vibe System Explained

**Tender:** Cozy, grounding, legacy. This is why couples retain. Think comfort menus, anchor memories, shared seed plant.

**Playful:** Chaotic, competitive, clip-able. This is why they laugh. Doodle Duel, Emoji Court, Wavelength.

**Spicy:** Romantic, flirty, non-explicit. Always opt-in, always skippable. Focus on "feel wanted" not explicit detail. Kiss Courier, Slow Morning, Whisper Line.

Each item has:
- `vibe: 'tender' | 'playful' | 'spicy'`
- `intensity: 1 | 2 | 3` — 1 = soft, 3 = deep. Don't show intensity 3 unless vibe.spicy > 0.5 or user opts in.
- `skippable: true` — mandatory for spicy, humane for all.
- `savesToJournal: boolean` — drives your legacy board.

## Session Flow (Recommended 25 min)

```ts
import { buildSessionQueue } from './sessionWiring';

const weights = { tender: 0.5, playful: 0.3, spicy: 0.2 }; // from VibeDial
const queue = buildSessionQueue(weights, 7);
// Result: [prompt, duel, prompt, duel, prompt, duel, journal]
// Example: Small Mercies -> Doodle Duel -> Map Pin -> Reaction Heart -> Whisper Line -> Kiss Courier -> Postcard From Next Year
```

Flow logic in `sessionWiring.ts` already does: warmup playful, middle mix, close tender.

## Firestore Shape

```
couples/{coupleId}
  memberIds: [uid1, uid2]
  pairedAt: timestamp
  boardState: { stars: [], stickers: [], homeGlow: number }

sessions/{sessionId}
  coupleId
  vibeWeights: { tender, playful, spicy }
  queue: [{ id, type, vibe }]
  currentIndex: number
  status: 'lobby' | 'playing' | 'finished'

journalEntries/{entryId}
  coupleId
  activityId
  title, text, extra
  vibe
  authorId
  createdAt
  openAt? (for Postcard future entry)

invites/{CODE}
  coupleId
  ownerUid
  expiresAt
```

Use the rules in `firebaseHelpers.ts` as baseline. Anonymous auth + couple membership check.

## Three.js Board Rewards

Hook rewards to visuals so the board becomes *theirs*:

- Tender = soft pink light, leaves on home tile, star constellations
- Playful = paint splats, rubber ducks, disco balls left on tiles
- Spicy = warm glow on home tile, after-hours shimmer, paired frames

Save these in `couples/{id}.boardState` so board persists.

## How to Expand Safely

1. Start with intensity 1 only for first week of testers. See what gets skipped.
2. Log `skip` events — if an activity is skipped >30%, rewrite prompt or lower intensity.
3. For spicy, keep language sensory but not explicit: scent, touch (hand squeeze, forehead kiss), look, voice. Avoid graphic detail.
4. Add "Steal This Moment" button on every tile that calls `makeJournalEntry()`.

## Next Builds I'd Do

- Daily ritual: Shared Seed + Landing Lights (5 min build, huge retention)
- Sound Capsule tiles (audio dots on board)
- Postcard timeline view — journal sorted by openAt

You have everything to ship a testable date night loop tonight. Let me know if you want me to generate the actual Journal timeline component or the Three.js particle for Kiss Courier next.


## UPDATE v1.1 - 60s Doodle + New Components

### Change: Doodle Duel timer
- Changed from 25s to 60s as requested
- File: duelRegistry.ts `doodle-duel-memory` durationSec = 60
- Component DoodleDuel.tsx now defaults to 60s with visual countdown and progress bar
- More time = more cursed details, better for remote

### New Components

#### 1. DoodleDuel.tsx
- 60s countdown, thick brush (lineWidth 4), no eraser
- High DPI canvas, touch + mouse support
- Auto-completes at 0s, emits dataUrl PNG
- Props: prompt, durationSec (default 60), onComplete(dataUrl)
- Save dataUrl to journalEntries.image or Firebase Storage

#### 2. JournalTimeline.tsx
- Vertical timeline with spine, vibe-colored dots
- Props: entries: JournalEntry[] with vibe, title, text, image
- Empty state: "Your board is still clean"
- Example entries included for testing
- This is your legacy board - the messier it gets, the more loved it is

#### 3. KissCourier.tsx
- Canvas 2D particle kiss (no Three.js dependency, but looks like it)
- Left = you, right = partner catch zone
- Particles with gravity, heart glyphs
- Emits duel:kissSent on send, duel:kissCaught on catch
- On catch, bursts and glows home tile
- For full Three.js version: replace canvas with your board scene, spawn particles at player piece position, lerp to partner piece

### Wiring these in your session flow

```tsx
import { DoodleDuel } from './components/DoodleDuel'
import { JournalTimeline, EXAMPLE_ENTRIES } from './components/JournalTimeline'
import { KissCourier } from './components/KissCourier'

// In your duel renderer:
if (duel.id === 'doodle-duel-memory') {
  return <DoodleDuel prompt="draw our couch from memory" durationSec={60} onComplete={dataUrl => saveToFirestore(dataUrl)} />
}
if (duel.id === 'kiss-courier') {
  return <KissCourier onCaught={() => unlockHomeGlow()} />
}

// Journal view:
<JournalTimeline entries={journalEntries} />
```
