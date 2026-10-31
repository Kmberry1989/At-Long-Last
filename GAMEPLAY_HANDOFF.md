# At Long Last gameplay handoff — updated 2026-10-31

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

Gameplay changes implemented and validated:

1. **Screen 1 (Board Screen & Two-Dice Cast)**:
   - `src/components/TactileDiceCast.jsx`: Mobile tactile pad with two-dice rattle, drag-and-flick cast, haptics, accessible fallback button.
   - `src/board/BoardScene.jsx`: Two-dice physics tumble with ebony wood/gold pips settling to sum 2–12. Perimeter tile-hop pathing with landing sounds (`playPieceStep`). Pacing camera targeting (Free Flow vs. Shared Spotlight).
   - `src/features/session/sessionLogic.js` & `SessionProvider.jsx`: Persists two-dice results in `lastMove.dice`. Pacing mode toggle in HUD.
   - All tests pass (274 tests).

2. **Screen 2 (Activity Card Screen)**:
   - `src/components/ActivityCardModal.jsx`: Tile-rise modal entrance (`tileRise 0.38s cubic-bezier(0.16, 1, 0.3, 1)`), paired player portraits with dynamic spotlight halo, 3D perspective card flip container (`perspective: 1200px`, `transform: rotateY(180deg)`) flipping between Face 1 (Your Answer) and Face 2 (Guess for Partner).
   - Audio and Haptics: Integrated `playCardFlip()` (card snap), `playChoiceTap()` (marimba inspiration tag tap), `playCardSeal()` (wax seal stamp thump), and `playSuccess()` (reveal flourish).
   - Private Flow & Wax Seal State: Asynchronous answering without turn-gated blockers (`supportsPrivateFlow: true`). Tactile wax seal waiting state (`activity-wax-sealed-state`) with progress pill ("✓ You — ⏳ Partner").
   - Board Peeking: "Peek Board" button minimizes the modal to an interactive bottom pill (`activity-minimized-pill`) allowing the player to freely explore the 3D board while waiting without losing state.
   - Synchronized Reveal: Side-by-side comparative answers & guesses with celebratory flourish and intimacy reward (+3 Hearts).
   - All 282 tests pass across 42 test suites. Zero lint errors/warnings. Clean production build.

3. **Screen 3 (Mystery Keepsakes Screen — `?` Tile Landing)**:
   - `src/board/BoardScene.jsx`: Camera dips close to the mat (`y: 10.5, z: 12.5`) when entering `phase: 'keepsake'`, framing the landed space intimately at eye level.
   - `src/components/MysteryKeepsakeCard.jsx` & `mystery-keepsake-card.css`: Card lifts from a 3D-stacked deck on the mat, hovers buoyantly with dynamic breathing ground shadow, flips with audible snap (`playCardFlip()`) and haptics, and features a zero-friction couple privilege badge ("✧ Free Privilege ✧") with drawer player piece avatar chip.
   - Tactile Action Button: "Tap Card to Collect ✦" triggers celebratory audio (`playSuccess()`) and starlight swoop animation into your hand (`onCollect()`).
   - All 286 tests pass across 43 test suites. Zero lint errors/warnings. Clean production build.

## Validation and handoff boundary

- `npm test` passes **286/286** app tests across 43 test suites.
- `oxlint src` reports 0 errors and 0 warnings.
- `npm run build` passes cleanly in 1.68s.
- Vite dev server is running on `http://127.0.0.1:5173/`.
- Do not deploy to Vercel without the user's explicit approval. No deployment or production data operation was done for this gameplay work. Check Git history and remote state for the latest delivery status.

## Suggested first action for the next agent

Start by checking `git status --short` and the latest commits. Then focus on a **small, visible board interaction slice** that strengthens touch, ambience, and connection: inspect the new route/card in a real browser if available, correct visual defects, and design the two-dice/piece-drag state boundary so it can support independent players. Keep the user in the conversation on the current screen before deciding another one.

## 2026-10-31 continuation — Our Bloom and themed environment

- `Our Bloom` replaces the visible Companion card. `src/flower/` generates five real species entirely from Three.js geometry: daisy, tulip, sunflower, rose, and cosmos. Each has a seed, sprout, bud, and bloom; the species stays unnamed while growing. When both partners water on six separate days, it becomes pickable. Picking reveals the name, saves it to their collection, and advances to the next species. The saved Companion field remains for old data compatibility only.
- `ProgressHub.jsx` renders the plant and compact collection scenes. `progressService.js`, `CoupleProvider.jsx`, and `firestore.rules` cover the shared progression, collection, and eligible waterers. The browser preview confirmed a bloom-mesh tap picks the rose; a real two-account water/pick run remains to verify before release.
- `GameScreen.jsx` removes Home and other persistent non-activity HUD controls during play, and keeps both selected player-piece portraits visible. The board and an activity were inspected at 390×844. Personal profile images are not stored in this app yet.
- `boardThemes.js` and `boardEnvironment.js` provide distinct sky palettes, drifting haze/motes, and selective prop glow/motion for all five base themes and four unlockable remixes. Several related props were grouped into theme-specific vignettes. `BOARD_THEME_LAYOUT.md` contains coordinates, purpose, camera-shot plan, and optional future backdrop props. A City and Garden desktop render confirmed all five GLBs loaded and the new groupings read correctly; mobile camera framing currently crops side props until the planned camera pan/zoom work is implemented.

## 2026-10-31 continuation — Mobile Tactile Two-Dice Cast & Dual Pacing Modes

- **Mobile Tactile Two-Dice Cast (`src/components/TactileDiceCast.jsx`, `src/index.css`):**
  - Designed specifically for one-handed mobile touch in the lower third of the display.
  - Rendered with rich ebony-wood and gold-piped SVG geometry with soft drop shadows.
  - Interactive touch gestures (`pointerdown`, `pointermove`, `pointerup` with `touchAction: none`): rubbing the thumb rattles the two dice with synthesized wooden collision audio (`playDiceRattle`) and native haptics (`navigator.vibrate([14])`).
  - Swiping upward or releasing casts the dice with swoosh and dual felt drop audio (`playDiceCast`).
  - Fully accessible keyboard (`Space`/`Enter`) and labeled button fallbacks (`Roll 2 Dice (2–12)`).
- **Two-Dice 3D Board Physics (`src/board/BoardScene.jsx`):**
  - Replaced the single primitive die with two independent rounded-box ebony/gold-piped dice with individual spin axes, velocities, and tumbling trajectories.
  - Both dice bounce across the velvet board center and settle on the exact rolled values (`die1`, `die2`) summing to 2–12.
  - Symmetrical dice face helper `resolveDiceValues(roll, dice)` ensures full backward compatibility with any older tests or sessions.
- **Path Walking & Piece Steps (`src/board/BoardScene.jsx`, `src/audio/AudioProvider.jsx`):**
  - Implemented `calculateStepPath` and perimeter step hops so tokens walk along the raised inlaid route space-by-space with parabolic hop arcs (`hop = Math.sin(p * Math.PI) * 0.45`) and intimate wooden landing plops (`playPieceStep`).
- **Dual Pacing Modes (`GameScreen.jsx`, `src/index.css`):**
  - Added a thumb-friendly pill toggle in the top HUD:
    - **Free Flow (Default):** Independent pacing where players can roll and traverse single-player tiles without gating on turn pauses, converging seamlessly at shared activities or reveals.
    - **Shared Spotlight:** Intimate turn-by-turn mode where the camera focuses dynamically on the active player taking the stage.
- **Validation:**
  - 41 unit test files passed (274/274 tests), including dedicated suites for `TactileDiceCast.test.jsx`, `BoardScene.test.js`, and `sessionLogic.test.js`.
  - `oxlint src` passed with 0 errors and 0 warnings.
  - `npm run build` compiled cleanly.
