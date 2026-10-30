# At Long Last gameplay handoff — 2026-10-30

## Purpose and working style

The user wants the game to feel **interactive, intimate, atmospheric, and full of mood**. Tactile actions, camera movement, lighting, sound, portraits, and a partner's presence should make a night feel shared. Keep text short and every required tap meaningful. Do not add mechanics or menus merely to fill pauses.

The user asked to discuss **one game screen at a time**, with two choice sets for each: presentation/transition and how that screen can remove hassle or increase the value of playing together. Wait for their response before moving to another screen. They explicitly corrected the prior agent for advancing before an answer. This file records accepted directions; it is not permission to invent additional screen decisions.

## Accepted design directions

- **Opening:** Skip the mood question and vibe dial. A new night opens on the board. The old vibe dial may return as an activity where each partner answers the same question with a marker, then sees how close they agree.
- **Board:** Treat board, dice, tiles, and activities as parts of one continuous scene. Pan and zoom smoothly between shots. Gameplay should dominate the display; move Home, scrapbook, settings, and other unrelated controls out of the persistent game overlay. Keep player portraits visible most of the time.
- **Dice:** Two dice, darker than the board, shown close to the viewer. Touching/rubbing moves and rattles them together; releasing casts them onto the board. Their sum moves the piece **2–12 spaces**. Do not rely on an on-screen text instruction for the gesture. Keep an accessible keyboard/screen-reader way to roll.
- **Movement:** Show a dimensional, legible path on the board. The player drags their piece along the route; it lifts and plops onto each spot. If a branch exists, dragging chooses it; on a single route the destination is obvious. The physical movement must correspond to game state, not just decorate an already-finished server move.
- **Activity cards:** Camera moves to the landed tile and a card rises. The input depends on the question/activity: text for reflection, matching options for prediction, an untimed canvas for drawing, a dial for agreement. Offer a quick/deep choice only when both are meaningful. Transitions and portraits must clearly identify **“Your answer”** versus **“Guess for [partner]”**. Add audible and pressed-state feedback.
- **Pacing:** Each player advances independently whenever the next action does not strictly require the partner. Do not gate simple taps on the other phone. Collect private answers and comparisons for an end-of-night reveal where possible. Drawing must have no timer.
- **Mystery keepsakes:** A `?` landing draws from a card stack. A face-down card lifts, flips with a snap/pop, hovers buoyantly, then flies into the player's cards when tapped. Use decorative high-quality borders and one consistent branded back for every card. Cards, dice, and airborne props should cast soft shadows onto the board/mat. The prior cost/“Save Hearts” shop screen was confusing and sometimes offered only a disabled purchase; the current WIP makes the draw free.
- **Truce:** At occasional landings, allow an **open trade offer**: choose a card to offer and a partner card to request. The partner accepts or declines asynchronously; neither player's round pauses. Trading should reinforce connection, not become a large shop system.

## Current implementation

The login-screen changes in `src/components/LobbyScreen.jsx`, `src/components/LobbyScreen.test.jsx`, `src/index.css`, and `src/auth-screen.css` predate this gameplay work and are unrelated. Preserve them when working on gameplay.

Gameplay changes included with this handoff:

1. `src/features/session/sessionLogic.js`, `sessionService.js`, `SessionProvider.jsx`, `src/components/GameScreen.jsx`, and `firestore.rules` start new nights directly in the first board turn using the existing 50/30/20 tender/playful/spicy mix. An active session still on the old setup phase automatically migrates. The Mood/Vibe checklist entries and board vibe chip are removed. The default mix keeps intensity-3 content locked. `MoodPulse.jsx` and `VibeDial.jsx` remain available for future reuse.
2. `src/components/DoodleDuel.jsx` no longer counts down or auto-submits. The player saves after drawing. `src/components/DoodleDuel.test.jsx` covers waiting beyond the old limit.
3. `src/board/BoardScene.jsx` now builds a visible raised, inlaid route between the existing ring of 20 tiles, adds tile plinths and an outer board foot/rim, and uses softer directional shadows. `getBoardPathSegments` has a focused test. This is **render geometry only**: there are no route branches or piece dragging yet.
4. `src/components/MysteryKeepsakeCard.jsx` and its CSS add a branded front/back card, decorative SVG border, deck stack, flip, hover, soft CSS ground shadow, and collect animation. `GameScreen.jsx` shows it at a keepsake landing. This has **not been visually inspected in a live browser**; the card's CSS shadow is not yet a true WebGL shadow projected onto the board.
5. `boardConfig.js` marks keepsake tiles as Mystery Card and avoids repeats until the four-card pool is exhausted. `resolveKeepsakeDecision` now collects for zero hearts and tags the card with `ownerIndex`/`instanceId`; the provider writes a matching journal entry. This metadata is **not yet a real per-player hand or trade system**. Existing shared perk behavior and the old `cost` fields remain and need review.

## Critical unfinished work

- **No two-dice roll yet.** `SessionProvider.rollTurn` still generates one 1–6 value. `BoardScene` still renders one primitive die and uses its old automatic tumble. Rebalance board pace once 2–12 is wired through logic, animation, tests, and two-player state.
- **No physical piece drag yet.** The server currently applies a roll and lands the piece immediately. Do not make the gesture cosmetic or block the other player with a new global `move` phase. Design pending movement in a per-player state model, support single-route travel and later branches, and persist landing only when the drag completes. Provide a clear accessible fallback.
- **Independent progress is not implemented.** The session still uses one global `phase`, `activePlayerIndex`, and `turnsTakenThisRound`; activities often use a shared `turnIndex`. This is the main source of asynchronous waiting. A safe redesign must allow per-player pending moves/activities and atomic shared rewards, then hold partner comparisons until the end-of-night reveal. `firestore.rules` has an exact session schema, so any new fields require matching rules and migration tests.
- **No Truce landing/offer UI or transactions yet.** Current `keepsakes` is a shared array with ownership metadata. Design per-player hands and an asynchronous offer with explicit accept/decline; transactionally prevent duplicate or stale swaps. Decide how unused perks follow a traded card.
- **Game HUD is still crowded.** Home, sound, scrapbook, details, and other controls remain visible during play. Portraits are still strips/dots rather than consistently visible profile images. Perspective cues, role transitions, pressed states, and distinct sound effects remain to build.
- **Card/board visual proof is missing.** The local browser surface was disabled in this session. Old files under `output/playwright/` show the pre-change board and must not be used as proof of this WIP. Inspect current mobile and desktop render, shadow placement, tile/path readability, card front/back/flip, and real touch interaction once browser access is available. Test two actual emulator clients, not just local preview.

## Validation and handoff boundary

- After the latest WIP, `npm test` passed **248/248** app tests (38 files), the Firestore emulator rules suite passed **39/39** (3 files), `npm run lint` passed, `npm run build` passed, and `git diff --check` passed.
- These are static/emulator checks. They do **not** establish current visual, mobile touch, sound, multi-session, production, or remote-Git behavior.
- The default Firestore emulator port 8080 was occupied by another Java process. The rules run used a temporary config at `/tmp/at-long-last-firestore-8086.json` for port 8086; recreate that config if it is gone. Do not kill the existing 8080 process merely to run this suite.
- Do not deploy to Vercel without the user's explicit approval. No deployment or production data operation was done for this gameplay work. Check Git history and remote state for the latest delivery status.

## Suggested first action for the next agent

Start by checking `git status --short` and the latest commits. Then focus on a **small, visible board interaction slice** that strengthens touch, ambience, and connection: inspect the new route/card in a real browser if available, correct visual defects, and design the two-dice/piece-drag state boundary so it can support independent players. Keep the user in the conversation on the current screen before deciding another one.
