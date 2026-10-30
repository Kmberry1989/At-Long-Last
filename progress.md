Original prompt: Harden the Firestore rules so participants can make only legitimate couple and session lifecycle updates, without breaking the verified invite/join flow. Add focused rules coverage and retest the two-account critical path before deploying.

## 2026-10-29 — Combined repository delivery

- User requested waiting for the connection-process chat to finish and committing/pushing all work together. Confirmed that chat completed before preparing the combined snapshot.
- Final combined checks: default-timeout app coverage suite 237/237 (37 files), Firestore emulator rules 31/31 (two files), lint, production build, and whitespace checks passed. Intermediate menu/invite failures are superseded by this final run.
- Preserved source artwork, generated reference screenshots, and archived music samples alongside both conversations' gameplay/pairing implementations. Local secrets, build output, dependencies, and ignored browser captures stay outside Git. No direct production deployment performed.

## 2026-10-29 — Continue development: repeat nights

- Added shared prompt rotation based on saved prompt/topic history, wired through activity registries and SessionProvider. Unseen first, then least recently seen. Added registry and algorithm tests.
- Scoped scrapbook/HUD/finale to current session, with a collapsed All nights switch; local fresh sessions now have unique IDs. Added drawer/finale tests.
- Resume updates lastActionAt to clear stale recovery. Emulator gameplay exposed reward rule expression overflow; a narrow board-only fast path fixes it and retains limits/identity protection. Focused adversarial rules test passes.
- Both emulator profiles agree on Tonight (5 moments) versus All nights (16), including after reload. Screenshot inspected at 393px with no horizontal overflow. History-based prediction selection used real saved records and selected unseen material.
- Lint/build/diff pass. Focused app run 31/31 passed. Full coverage run completed: 226 passed, two 5-second UI timeouts (228 total / 35 files). Those two files and strengthened finale test passed on focused retry: 36/36 at 20-second timeout. No clean default-timeout full-suite pass claimed. See latest PLAYABILITY_TEST_REPORT.md section for evidence.
- Next: persist stable material IDs for rhythm/puzzle rotation (current history uses prompt/topic text), and rerun a complete production two-account preset/finale before release. All soundtrack variants preserved; no deployment or Git delivery in this continuation.

## 2026-07-26

- Confirmed the target is the `(default)` Firestore Native database, Standard edition, in `nam5`.
- Current production evidence shows a legacy active session cannot be atomically abandoned because the rules require the current session schema.
- Current baseline: rules tests 11/11, app tests 47/47, lint and build pass.
- Also investigating the missing Rochelle GLB and repeated WebGL immutable-texture errors reported from production.
- Added a legacy-session terminal validator plus success and adversarial coverage; rules tests passed 13/13 before the final adversarial additions.
- New couples and historical Rochelle avatar references now resolve to the existing Kyle GLB, with per-player model tinting.
- Board cleanup now stops RAF rendering, guards late GLTF callbacks, deduplicates resource disposal, and exposes browser-test state/time hooks.
- Verification after implementation: rules 13/13, app 49/49, lint, build, and diff whitespace check pass.
- The required web-game client reached the board and emitted matching two-player state across three iterations with no console error artifact. The screenshot was visually inspected.
- The Playwright CLI wrapper is unavailable (`playwright-cli: command not found`); the connector confirmed the preview vote and roll flow. Vite reloaded while coverage artifacts were changing, so the final browser pass was rerun after all test writes completed.
- Final verification: rules 14/14, app 49/49, lint, build, diff check, and Firebase dry-run passed.
- Released the rules to `at-long-last`; the exact July 18 `Start Fresh` transaction then succeeded and created a new round-1 session without losing scrapbook history.
- Deployed the frontend to Vercel deployment `dist-c58ysh0i0-kyle-matthew-berry-s-projects.vercel.app`, aliased to `https://atlonglast.vercel.app/`.
- Production reload used the then-current player model with HTTP 200 and produced no fresh warning/error logs.
- A live two-account smoke run then passed create, invite join, shared session read, abandon/detach, guest leave, and final-host cleanup; temporary room and authentication records were removed.

## TODO

- When a second persistent browser profile is available, repeat the two-phone quick preset through finale for UI endurance; the live two-account service lifecycle and exact legacy recovery are verified.

## 2026-07-27 — scoring, navigation, board gestures, and visible dice

- Started the requested usability pass: replace arbitrary creative-duel scoring, keep scrapbook exit navigation available after long scrolling, add rotate/pan/zoom gestures plus a reset view, and let the 3D die visibly tumble before the next overlay opens.
- Reframed hearts as one explained shared keepsake stash instead of an overall score. Creative, drawing, text, slider, and closeness duels now resolve as shared completions; only actual speed/precision contests pick a winner.
- Removed the unused arbitrary Word Weaver point formula in favor of the exact word count that determines its shared reward, and removed opaque internal score values from scrapbook duel rows.
- Added damped OrbitControls with one-finger/left-drag rotate, pinch/wheel zoom, two-finger/right-drag pan, bounded camera distance/tilt, and an immediate Reset View back to the active-player follow camera.
- Added a staged 1.35-second primitive-die tumble that cycles visible faces, lifts and enlarges over the velvet center, then settles on the synchronized result before the next activity/duel overlay returns on either phone.
- Made the scrapbook header sticky and renamed its persistent exit to Back To Board; opening the drawer starts at its top.
- Browser verification at 390×844 passed real touch rotation, pinch zoom, two-finger pan, body-scroll isolation, reset-to-follow, mid-roll/final die state, the sticky bottom-scroll exit, the shared-heart guide, and the simplified Word Weaver count with no application errors.
- Final validation passes: 9 app test files / 66 tests, lint, production build, diff whitespace check, and the required web-game client with camera gesture metadata and die state. This usability pass is local and not deployed.

## 2026-07-27 — player pieces and board decorations

- Replaced the retired single-player model path with 53 normalized, named player-piece GLBs and generated lightweight WebP previews for the selection UI.
- Added a categorized player-piece picker to local preview and the signed-in create/join flow; the choice is stored locally and sent through create, direct join, public join, and room switching.
- Added `hostAvatar` to open-lobby payloads so a host's chosen piece survives the guest join transaction.
- Added the Draco decoder required by every new GLB and wired it into the board loader.
- Placed the trinket box, flower, two candles, and photo around the outer board lawn.
- Validation passed: 9 app test files / 50 tests, 14/14 Firestore rules tests, lint, production build, diff whitespace check, and an asset-integrity sweep covering 53 GLBs, 53 previews, and five decorations.
- Mobile browser QA at 390×844 selected the Owl from the categorized picker. The Owl and partner Globe decoded on the board, all five decorations reported loaded, and the final web-game client run emitted no console-error artifact.
- Visual inspection confirmed readable picker labels and the five new decorations spread across the visible board lawn.
- Production was not deployed for this asset update.

## 2026-07-27 — connection mini-games, milestone one

- Started the approved first mini-game milestone with Mind Meld, The Prediction Box, and The Vault.
- Added three specialized activity state machines to the existing synchronized activity contract: sealed two-choice matching, predictor-then-subject answers, and two private finale-gated notes.
- Added dedicated activity cards plus scrapbook reveal cards. Vault content is hidden in the UI until a finale entry exists for the same session.
- Added deterministic local-preview routing through `?previewActivity=<activity-id>` in development so each new flow can be browser-tested without changing production routing.
- Added `MINI_GAME_ROADMAP.md` with the remaining six concepts, reuse points, asset directions, and shared acceptance gates.
- Firestore rules coverage now accepts the three registered activity IDs for participants and rejects outsiders.
- Browser verification completed each two-player preview flow at 390×844 with no console warning/error: Mind Meld produced a matched scrapbook reveal, Prediction Box produced an exact-call reveal, and The Vault stayed sealed in both the scrapbook and exported text state.
- Fixed a hook-order crash found by the clean browser pass and exposed privacy-safe activity state through `render_game_to_text`.
- Final verification passed: 9 app test files / 54 tests, 15/15 Firestore rules tests, lint, production build, and diff whitespace check.
- The required web-game client was rerun after the final mobile header polish; both emitted states included the active Vault stage, loaded player pieces, and all five loaded board decorations with no console-error artifact.
- Production was not deployed for this mini-game milestone.

## 2026-07-27 — connection mini-games, milestone two

- Started Wave 2 with Vibe Check, Tempo Tap, and Word Weaver.
- Added deterministic prompt, rhythm, and letter-puzzle banks plus three activity definitions. The implementations will reuse the existing synchronized two-turn activity contract rather than creating a parallel game mode.
- Added all three specialized two-turn state machines and interfaces: secret continuum markers, a five-tap rhythm challenge, and a timed validated letter tray. Early lint passes.
- Added payload-aware scrapbook artifacts, mobile styling, privacy-safe UI state in `render_game_to_text`, and activity-ID rule coverage.
- Midpoint validation passes: lint, diff whitespace check, and 9 app test files / 58 tests.
- Completed all three 390×844 two-turn preview flows with no browser warning/error: Vibe Check revealed 94% alignment, Tempo Tap produced two 95% rhythm turns, and Word Weaver validated and saved two distinct word lists.
- Visual inspection confirmed that each activity and each corresponding scrapbook artifact fits the established tabletop treatment. Tempo Tap's first pass exposed an animated moving hit-box; the button geometry is now fixed while its pulse remains visual.
- Final validation passes: 9 app test files / 58 tests, 15/15 Firestore rules tests, lint, production build, and diff whitespace check.
- The required web-game client was rerun after final validation. It emitted the complete Word Weaver tray, timer, score, loaded players, and all five decorations with no console-error artifact; the screenshot was visually inspected.
- Wave 2 remains local and was not deployed.

## 2026-07-27 — production release and cooperative Wave 3

- Committed the complete player-piece, board-decoration, and first six mini-game milestone as `e442931` and pushed `main` to GitHub.
- Released the compiled Firestore rules to project `at-long-last`.
- Deployed Vercel production `dpl_5bg6hdR5nyfu4x31mjpKMdJPgH2r`, ready at `dist-krs80yaaf-kyle-matthew-berry-s-projects.vercel.app` and aliased to `https://atlonglast.vercel.app/`.
- Read-only production smoke verification passed at 390×844 with a clean console; representative player GLB, thumbnail, and decoration URLs returned HTTP 200.
- Started the next local milestone with Dual-Axis Maze, Blind Canvas, and Harmonic Lock. This Wave 3 work is not part of the production deployment above.
- Added all three Wave 3 state machines, mobile activity cards, scrapbook treatments, `render_game_to_text` state, and Firestore activity IDs.
- Dual-Axis Maze deliberately alternates bounded horizontal and vertical moves to avoid lost concurrent writes in the current document model. Blind Canvas stores compressed WebP/PNG halves under a strict size cap. Harmonic Lock uses visual resonance plus supported-device vibration.
- Midpoint validation passes: lint, diff whitespace check, and 9 app test files / 62 tests.
- Completed all three 390×844 two-turn preview flows without browser warning/error: an eight-move maze route, two drawn and merged canvas halves, and a 97% harmonic lock.
- Visual inspection covered every activity and its scrapbook artifact. The maze was compacted after its first browser pass so all movement controls fit in the initial mobile viewport.
- Wave 3 final validation passes: 9 app test files / 62 tests, 15/15 Firestore rules tests, lint, production build, and diff whitespace check.
- The required web-game client emitted the compact maze, axis controls, move/bump counters, loaded players, and all five decorations without a console-error artifact; its screenshot and complete direct-play artifacts were inspected.
- Continued into the two remaining supplied concepts: Bluff Bidding and Photo Flashback. These remain local with Wave 3.
- Completed Bluff Bidding with alternating raise/challenge turns, an honor-system proof list, outcome-sensitive heart rewards, and a bidding-receipt scrapbook artifact.
- Completed Photo Flashback with an explicit image picker, on-device WebP/JPEG compression, a 350,000-character payload ceiling, sequential sealed captions, and an instant-photo scrapbook reveal.
- Added privacy-safe Wave 4 activity state to `render_game_to_text`, registered both IDs with Firestore rules coverage, and expanded the roadmap with a consolidated future-asset wishlist.
- The required web-game client reached Bluff Bidding with both player pieces and all five decorations loaded. A separate 390×844 browser pass completed both full Wave 4 flows and visually inspected the initial cards, proof/caption stages, and scrapbook artifacts.
- Wave 4 browser state confirmed the bid advanced from 2 to 3 before proof, the proof list contained three answers, Photo Flashback moved from zero to one sealed caption, and the selected image stayed present for the second caption. Neither complete flow produced an application console error.
- Final local continuation validation passes: 9 app test files / 65 tests, 15/15 Firestore rules tests, lint, production build, and diff whitespace check.
- Wave 3 and Wave 4 remain uncommitted and undeployed. Production remains pinned to commit `e442931`.

## 2026-07-27 — condensed sign-in screen

- Simplified the unauthenticated lobby without changing the Google or email authentication handlers: the auth state now uses a compact brand strip, one welcome message, and one shared email form area instead of repeating headings and explanatory copy.
- Added auth-only spacing and control sizing so both Sign In and Create Account fit without scrolling at 390×844. On a 390×667 small-phone pass, the larger Create Account card ended at 582px and remained fully visible.
- Verified the Sign In/Create Account tab switch, editable email/password controls, enabled-button state, and both final layouts. The required web-game client and direct mobile browser pass produced no application warning or error.
- Validation passes: 9 app test files / 65 tests, lint, production build, and diff whitespace check.
- This sign-in refinement remains local with the uncommitted Wave 3 and Wave 4 continuation.

## 2026-07-27 — clean profile reset and recovery fix

- Backed up the live Standard Firestore database, then removed all couple links, rooms, sessions, invitations, lobbies, activities, and journal progress while preserving all four profile documents and Firebase sign-in accounts.
- Post-reset production inventory is four profiles and zero documents in every progress/couple collection.
- Traced the reported second-player Vibe vote rejection to the local session `id` leaking into the Firestore update payload. Session writes now strip that client-only field.
- Added a two-authenticated-account Firestore rules regression test that submits both Vibe votes and verifies the shared session advances to the first turn without persisting `id`.
- The sound control now sits below gameplay overlays and hides while activity/recovery modals or the scrapbook drawer are open, leaving their Close controls unobstructed.
- Mobile browser verification at 390×844 confirmed the scrapbook Close control is visible and clickable. The final required web-game client run completed without an application console error.
- Validation passes: 9 app test files / 65 tests, 16/16 Firestore rules tests, lint, production build, and diff whitespace check.

## 2026-07-27 — romantic velvet board and primitive art kit

- Replaced the retired grass and wood images with generated wine and rose velvet texture maps; both new materials are visibly used in the Three.js board.
- Rebuilt the five tile types from reusable rounded-box primitives with ivory bodies, textured velvet inset panels, and separate label/icon planes.
- Added a rose-velvet primitive die made from one rounded box, one shared sphere geometry, and six visibility-switched pip groups. A roll changes the displayed face without tearing down or reloading the board scene.
- Added a brass-piped rose velvet center inset and warmer fog/fill lighting while preserving readable player pieces and the existing five decorations.
- Created `ART_CONCEPT_HANDOFF.md` plus three generated 2D modeling-reference sheets for the tile kit and the full mini-game prop wishlist.
- Browser verification completed the Vibe setup, rendered both player GLBs and all five decorations, rolled from one to six, confirmed the same WebGL canvas remained mounted, and inspected the clear board at mobile and desktop sizes.
- Final verification passes: 9 app test files / 65 tests, lint, production build, diff whitespace check, and the required web-game client with explicit velvet-surface and primitive-die state.
- This art-direction pass remains local and is not yet committed or deployed.

## 2026-07-28 — complete player-response scrapbook

- Started a scrapbook persistence pass so every completed two-player activity, setup vote, duel result, and explicit pass leaves a durable page instead of relying on the old per-prompt `savesToJournal` opt-in.
- Preserving reveal boundaries: completed Vault notes remain finale-sealed, while passed activities record the pass and prompt without exposing an unfinished private response.
- Normalized all 36 original prompt definitions to save both players' completed answers. Setup vibe ballots now create the first scrapbook page, and activity passes, duel repicks, and mutual duel passes each leave their own zero-heart trace.
- Activity completion now commits the activity, session transition, and scrapbook entry together in one Firestore transaction. Duel transitions and their response pages use the same atomic pattern.
- The Activities filter now includes every specialized mini-game and setup ballot instead of only the three legacy prompt types.
- Mobile browser QA at 390×844 visually confirmed both vibe ballots and both answers from the formerly omitted Weather Report page. `render_game_to_text` matched the visible scrapbook count/title, and both scenarios completed without browser errors.
- Pre-deployment validation passes: 9 app test files / 72 tests, 17/17 Firestore rules tests (including atomic activity-plus-scrapbook persistence), lint, production build, diff whitespace check, and the required web-game client.

## 2026-07-28 — production deployment

- Deployed the complete current workspace, including the board usability work, remaining connection mini-games, velvet art pass, condensed sign-in, and complete player-response scrapbook, to Vercel production deployment `dpl_43Jq8pX52epnSwZ7zUceS9rJDxJV`.
- Production is ready at `https://dist-c1y4b7kwv-kyle-matthew-berry-s-projects.vercel.app` and aliased to `https://atlonglast.vercel.app`.
- The canonical alias returned HTTP 200 with the new `index-DBNgoyty.js` bundle; the live bundle contains the `Tonight’s Vibe` and `activity-pass` scrapbook paths.
- A clean 390×844 production browser smoke rendered the compact Google/email sign-in screen with no page or console errors.

## 2026-07-29 — bounded tone selector, expanded prompts, and positional player pieces

- Rebuilt the tone selector around inset triangle geometry so pointer, touch, tap, and keyboard input all project onto the valid triangular area while keeping the complete circular handle inside its edges.
- Clarified in the interface that both ballots are averaged to weight activities, duels, and the Spark spotlight; the existing 50% shared-Spicy gate still controls intensity-three content.
- Added 60 new prompt variants, evenly divided across Tender, Playful, and Spicy, without creating new activity IDs or changing the synchronized activity contract.
- Added deterministic coverage proving dominant Tender, Playful, and Spicy mixes select matching activity and duel content.
- Player-piece GLBs selected in the lobby now remain the board tokens, sit on persistent player-colored illuminated position rings, and follow each player's board-space index. Co-located players are offset symmetrically so neither model hides the other.
- Shifted the automatic camera focus toward the active tile so starting pieces remain visible below the compact mobile HUD.
- Mobile browser QA selected the Owl, advanced through tone setup, and confirmed the Owl and partner Globe both loaded at distinct coordinates on the same starting tile. All five decorations loaded and the clean pass emitted no console errors.
- The required web-game client reported `withinTriangle: true`, loaded player avatars, distinct co-located board positions, and no console-error artifact; its screenshot was visually inspected.
- Final validation passes: 12 app test files / 82 tests, 17/17 Firestore rules tests, lint, production build, and diff whitespace check. The rules harness now allows 30 seconds for emulator initialization on slower starts.

## 2026-07-29 — plain-language mobile HUD

- Replaced the crowded five-card header with four compact status cards: shared hearts, round, tonight's mood, and the scrapbook. The current spotlight now reads simply as “Next,” and momentum uses three recognizable symbols with a concise progress count.
- Removed ambiguous board-space numbers from player cards; the selected 3D pieces remain the visible position markers on the board.
- Shortened the board camera control to an icon plus “Center,” simplified the tone explanation, and removed the redundant tone meter bars.
- Hid the bottom action tray whenever a mood, activity, duel, keepsake, or finale overlay is open, eliminating the disabled “Waiting on …” control behind the active dialog.
- Direct mobile QA at 344×640 proved the board and bottom action fit without page scrolling, the full tone card fits without scrolling, the bottom tray is absent while the tone card is open, and a completed preview roll advances the selected player's board position. The required web-game client has a visually inspected screenshot and no console-error artifact.
- Final local validation passes: 12 app test files / 82 tests, 17/17 Firestore rules tests, lint, production build, and diff whitespace check.
- Committed as `aafd74c`, pushed to `main`, and deployed to Vercel production `https://dist-n6f0tszii-kyle-matthew-berry-s-projects.vercel.app`, aliased to `https://atlonglast.vercel.app`.
- Production smoke at 390×844 rendered the compact Google/email sign-in screen and reported no console errors. The supplemental claimable-preview endpoint returned an incomplete building response, but the linked Vercel production deployment succeeded and is live.

## 2026-07-29 — home logo

- Replaced the home-screen “At Long Last” text wordmark with the supplied transparent `public/assets/ui/atlonglast.png` logo.
- Sized the logo for legibility at 390×844, with a shorter-screen override that keeps the full Google/email sign-in card visible at 390×667.
- Browser and required web-game-client screenshots were visually inspected with no console-error artifact. Lint, production build, and 82 app tests pass.

## 2026-07-29 — themed board decorations

- Reviewed the new city, beach, holiday, cozy, and garden GLB collections in a rendered asset gallery, then gave the curated board pieces durable, human-readable filenames and in-game labels.
- Added five board themes that advance with the game round: Cozy Night In, Secret Garden, Seaside Date, City Date Night, and Holiday Sparkle. Each places five themed props around the velvet board without replacing the primitive tiles, die, or player pieces.
- The deterministic board text now reports the current theme plus every named decoration and whether its model loaded or failed, making model regressions visible to browser checks.
- A 390×844 local preview visibly rendered the Cozy Night In scene; the board state confirmed all five cozy models loaded, alongside both selected player pieces.
- Validation passes: 13 app test files / 84 tests, lint, production build, diff whitespace check, and mobile browser inspection with no application console errors.

## 2026-07-29 — generated theme velvet textures

- Generated six new 1254px square velvet texture maps: upgraded rose and wine base velvets plus bespoke Secret Garden, Seaside Date, City Date Night, and Holiday Sparkle tabletops.
- Kept the original JPEG textures intact and introduced the generated assets as non-destructive versioned PNGs.
- Board surfaces now select the round’s matching tabletop texture while retaining the new rose velvet as the inset, tile-panel, and primitive-die material; the result keeps labels readable while making each board theme feel materially distinct.
- Browser board state confirmed the new Cozy Night In rose/wine assets loaded from their final project paths alongside all five theme decorations and both player pieces. All six texture URLs returned HTTP 200 from the local app.
- Validation passes: lint, production build, 13 app test files / 84 tests, texture-dimension checks, and diff whitespace check. Browser screenshot capture timed out during the continuously animating WebGL board, while the generated texture outputs were visually inspected before integration.

## 2026-09-29 — Milestone 1: fast private arrival (local, on `milestone-1-fast-private-arrival`)

- Implemented the Milestone 1 slice of the couples experience plan from the base commit `aa0b766`: deep-link fast arrival, progressive disclosure, time-based session presets, a shared play-state shell, and a guest-first migration spike. Nothing is deleted; all edits update in place. No placeholder users, fake couples, or simulated activity were introduced.
- Deep-link join: share links use `?invite=XXXXXX`; legacy `?code=XXXXXX` links still resolve. Added `resolveInviteRoom()` plus `InviteJoinScreen.jsx` with a warm resolving state, host identity, private two-person-room confirmation, nickname field, immediate join, and manual six-character code fallback. Signed-in deep-link users route directly to this screen; signed-out users see private-invite context before the existing production sign-in (production still rejects anonymous users). Automatic first-time pieces: host Heart, joiner Classic Globe; saved user choice is respected. OPEN: `resolveInviteRoom()` currently derives host metadata from `publicLobbies`, so auto-created "private" rooms are still publicly listed — reconcile before finalizing.
- Progressive disclosure: new reusable `Disclosure.jsx`. Piece picker hides behind "Choose your piece (optional)"; the public browser hides behind "Other ways to join"; waiting-room public chat and room switching are also disclosed. Manual code entry stays available. Public-lobby creation behavior is unchanged for now.
- Time presets: `Quick spark` (~10 min, 4 rounds), `Date night` (~25 min, 6 rounds), `Stay awhile` (~40 min, 8 rounds); round counts removed from pre-room UI; `DEFAULT_SESSION_PRESET = 'quick'` with payload, service, and lobby draft defaults. Journal copy updated. OPEN: `CoupleProvider` still defaults new rooms to `standard`; decide whether historical missing presets stay Standard for backward compatibility.
- Shared play states: `PlayStates.jsx` (`ActiveTurnState`, `WaitingState`, `ReadyToRevealState`, `PartnerAwayState`, `PlayStatePanel`) wired into `GameScreen.jsx` for active/waiting board turns, vibe-vote waiting, duel-result waiting, duel ready-to-reveal, and stale-session partner-away. Copy names who is acting, what stays private, and what happens next.
- Guest-first spike (emulator only): `tests/guest-migration.test.js`, `vite.guest.config.js`, `npm run test:guest`. Signs in anonymously and links an email credential with `linkWithCredential`, asserting UID preservation. Production `FirebaseAppContext` is unchanged and still rejects anonymous users.
- Validation: `npm test` 21 files / 113 tests pass; `npm run lint` 0 warnings/errors; `npm run build` passes. `npm run test:guest`: the UID-preservation test passes against the Auth emulator; the profile-data test cannot run here — the Firestore emulator's data plane returns 503 UNAVAILABLE for every request in this sandbox (verified with a standalone emulator instance, independent of firebase-tools and of these code changes). `npm run test:rules` is blocked by the same environmental issue: all 19 tests skip at `beforeAll` when `loadFirestoreRules` hits the 503. No production Firebase or Vercel changes; nothing merged to `main`; nothing deployed.
- Deferred: moderated couple testing ("8 of 10 fresh couples pair in under two minutes" is NOT claimed), private-room/public-listing reconciliation, CoupleProvider preset default, and emulator-backed end-to-end deep-link verification (blocked by the sandbox emulator issue; manual steps: open `?invite=XXXXXX` signed in to land on the private invite screen; signed out to see invite context before sign-in; join with a nickname and confirm the private two-person confirmation and automatic piece assignment).

## 2026-09-29 — Milestone 1 merged and deployed

- Merged `milestone-1-fast-private-arrival` into `main` (merge commit `30b88eb`, no-ff); pushed to `origin/main`. Nothing deleted; all edits in place.
- Validation on merged `main`: `npm test` 21 files / 113 tests pass, `npm run lint` 0 warnings/errors, `npm run build` passes (bundle now code-splits `three` and `firebase` into separate chunks).
- The push triggered Vercel's GitHub auto-deploy; production deployment `dpl_4GL9YCb5NyTzEywNBzJjEDLFnbyu` went READY on target production, so `https://atlonglast.vercel.app/` now serves Milestone 1. HTTP 200 confirmed on the production alias.
- No production Firebase changes (no `firestore.rules` edits, no auth changes).
- Still open from the Milestone 1 report: private-room/public-listing reconciliation in `resolveInviteRoom()`, the `CoupleProvider` `standard` preset fallback decision, sandbox-blocked emulator suites, and moderated couple testing ("8 of 10 fresh couples pair in under two minutes" not yet claimed).


## Recovered local audit evidence (October 28 cleanup)

Original prompt: gameplay test and audit and feedback. WITH SUGGESTIONS FOR REPLAY VALUE AND FUN

## 2026-09-15 continuation

- Audit reproduced a local-preview round-one deadlock at the duel wheel: preview identity follows the second active player while the spin remains host-only.
- Mobile 390x844 screenshots showed the five-chip HUD clipping at both sides.
- Vibe selection needs keyboard-operable adjustments and clearer control semantics.
- Current baseline: lint and build pass; 38/39 tests pass. `JournalTimeline.test.jsx` expects one `Pocket Love Note` match although the UI intentionally renders it twice.
- Git metadata points to a removed primary checkout, so Git status/diff are unavailable in this worktree.
- TODO: implement fixes, a focused replay enhancement, and run full local-preview-to-finale verification.

## Completed

- Fixed local-preview host authority so the one-device flow can spin every round duel.
- Added `Play Another Night` at the finale; preview replay resets to round 1/vibe setup while keeping the accumulated scrapbook, and the existing live host path starts a fresh persisted session.
- Reworked the 390px HUD into a readable two-row layout without clipped labels.
- Added arrow-key operation and an updated accessible value to the vibe control.
- Added `window.render_game_to_text` with current round, phase, players, activity, duel, hearts, and scrapbook count.
- Fixed scrapbook score formatting and the intentionally duplicated keepsake assertion.
- Fixed board render cleanup by canceling its animation frame, and keyed generated tile textures per space so labels stay distinct. Immutable-texture WebGL warnings fell from more than 100 to zero in the full run.
- Expanded the activity library from 45 to 63 activities, evenly split at 21 Tender, 21 Playful, and 21 Spicy prompts. The additions mix conversation prompts, tiny rituals, creative challenges, and short journal moments so repeat nights produce more varied pacing.
- Added six new activities per vibe, including Rose, Thorn, Seed; Museum of Us; Wrong Answers Only; Tiny Shark Tank; Soundtrack Shuffle; Green Light Tonight; Chemistry Recipe; and Doorstep Scene.
- Kept every Spicy activity skippable and made the consent-oriented prompt explicitly accept “not tonight” as a complete answer.
- Fixed activity-card metadata so the player sees a friendly category, title, and supporting description instead of an internal activity ID; journal and ritual activities now receive their intended response treatment.

## Verification

- `npm run lint`: passed.
- `npm run build`: passed.
- `npm test`: 7 files / 40 tests passed, including pool balance, prompt uniqueness, Spicy skip safety, and selection of expansion activities after earlier content is used.
- Bundled game client smoke: passed.
- 390x844 local preview: completed all 6 Standard rounds, activities, keepsake decisions, six duels, finale, 12-entry scrapbook in the main acceptance run, and replay reset to round 1/vibe setup.
- Keyboard vibe change was announced as `Tender 50%, playful 27%, spicy 23%`.
- Browser run had zero app errors and zero immutable-texture WebGL warnings; four screenshot-readback performance warnings remained and are test-tool related.
- Post-expansion 390x844 run again completed all six rounds, finale, scrapbook, and replay reset with zero app errors and zero WebGL errors. The refreshed activity card was visually checked at phone size.
- Live Firebase/two-phone behavior remains unverified because `.env.local` is missing.
- Git status remains unavailable because `.git` points to the removed primary checkout.


## 2026-10-29 gameplay verification

- Target flow: local preview -> vibe setup -> board turn -> activity/duel -> finale -> scrapbook/replay.
- Found and fixed a `GameScreen` hook-order crash when entering local preview: `wavelengthPrompts` is now memoized before the session early return, and the duplicated `renderPlayState` declaration was removed.
- Shortened lobby, mood, vibe, checklist, spotlight, and player-piece copy; stretched the supplied wordmark across the title band at desktop and phone widths.
- Removed a duplicate `VibeDial` handle that rendered a stray pink control outside the modal.
- Playwright MCP replay reached mood, vibe, first roll, activity, duel, duel reveal, and round two in local preview; `render_game_to_text` reported `phase: turn`, `round: 2`, `scrapbook.count: 3`, and zero fresh console errors.
- Fresh screenshots were visually checked at desktop and 390x844 phone width. The bundled web-game client still timed out waiting for the animated preview button under its headless virtual-time setup, so Playwright MCP was used for the browser evidence.
- Duel reveal was visually audited and fixed with an opaque glass card; the pre-fix reveal let HUD text show through the result.
- Final checks: lint passed, targeted checklist/session/vibe tests passed (29/29), build passed, and `git diff --check` passed.
- After the reveal-card fix, a fresh preview replay reached a Constellation reveal with zero fresh console errors; `render_game_to_text` reported `phase: duel`, `round: 1`, and the expected two-player board state.

## 2026-10-29 wordmark and board-display concepts

- Generated a separate transparent wide wordmark from the supplied logo reference, wired it into `LobbyScreen`, and kept the original square `atlonglast.png` unchanged.
- Added `public/assets/ui/atlonglast-wordmark.svg` as a replaceable SVG wrapper and `BOARD_DISPLAY_3D_PROMPTS.md` with twelve aesthetic centerpiece prompts plus shared modeling constraints.
- Desktop and 390x844 browser screenshots show the new wordmark fitting the title band cleanly with zero fresh console errors.

## 2026-10-29 — Richer nights, login checks, adaptive soundtrack

- Expanded Prediction Box to 58 questions, Mind Meld to 56, Wavelength to 65, conversation variants to 150, free-text matching to 58, and vault/consent/continuum/photo banks to 20 each. Added drawing/bluff material, five rhythm/resonance settings, and three validated word trays.
- Mind Meld and Prediction Box now commit salted hashes before opening choices, show a shared conversational reveal, and require both acknowledgments. Wavelength also withholds its answer/guess excerpt until both phones finish. Same-tab reload preserves opening material in session storage.
- Added per-account daily/weekly login streaks, best-day history, a rolling seven-box tracker, animated SVG checks, same-day idempotence, local midnight/visibility refresh, and reduced-motion support. Existing completed-night streaks remain distinct.
- Replaced ambient drones with slow piano, high music-box answers, sustained warm strings, room resonance, light echo, phrase-ending pitch bends, longer rests, a gentle sub heartbeat and very quiet chip texture. Eight contextual arrangements share one continuous clock.
- Simplified secondary HUD details, fixed header/control collisions, made closed scrapbook content inert/hidden, and prevented outer-screen scrolling from exposing it under scorecards.
- Paired emulator QA found/fixed profile timestamp writes, private invite reads, missing activity allowlist/IDs, non-atomic activity attachment and keepsake pages, completed-session restart behavior, reveal hook order, acknowledgment state, and Wavelength heart callback wiring.
- Final checks: lint/build/diff pass; 32 application test files / 216 tests pass; 22 Firestore emulator tests pass. Full four-round Quick night completed with two independent authenticated emulator browsers, followed by independent reload and exact scrapbook response recovery. Targeted two-player commitment/reveal, mismatch, Wavelength, and keepsake cases also passed.
- Current evidence and limitations are in the new 2026-10-29 section of PLAYABILITY_TEST_REPORT.md. No production deployment, remote push, real-phone audio listening, or current live-production paired proof is claimed. Older text/photo activities retain UI-only concealment.

## 2026-10-29 — Preserve music versions, slower continuity, bokeh

- Preserved the pre-change bent-note soundtrack in `src/audio/keepsakeSoundtrack.js`, including a frozen copy of its pattern data, and the original repository ambient engine in `src/audio/firstAmbientSoundtrack.js`. Both remain playable through the new ♫ library; the former also plays in the scrapbook.
- Saved the earlier browser recording/MP3 and both 42-second held/walking upright-bass WAV experiments under `public/assets/audio/library/`. SHA-256 comparisons confirmed byte-identical copies of the source recordings. The library README names their sources and uses.
- The continuous score now uses 2.4-second steps, one audio-clock lookahead scheduler, one shared menu/game chord sequence, persistent loop tails, 7-second room resonance, stereo reflected echoes with ducking, and bends on isolated notes. The main foundation is unchanged between menu and gameplay; a plucked accompaniment/upright bus fades into gameplay only. Held upright chord-change notes are default; sparse walking is selectable.
- Added a compact music chooser with saved theme/bass preferences, coherent mute routing across all engines, and scrapbook-to-selected-theme return. Existing soundtrack engines and recordings remain independent of future changes to the default.
- Added low-cost animated shimmer/bokeh light fields behind menu and overlay content, with pointer-safe layering and static reduced-motion styling.
- Verification: 219 tests passed in 33 files; lint/build/diff checks passed. An 84-second OfflineAudioContext render crossed the 76.8-second score boundary with nonzero tails and maximum adjacent-sample difference 0.0000455 near the wrap. This is signal continuity evidence, not a real-device listening claim.
- Browser QA exercised all three themes, both bass choices, mute/unmute, preference reload, reduced motion, prediction completion, and the original-theme scrapbook handoff with no captured page errors. Desktop/mobile screenshots were inspected. The bundled game client was attempted but timed out on the animated preview entry; direct Playwright supplied the completed interaction evidence.
- Local changes only; no commit, push, or deployment performed in this pass.

## 2026-10-29 — Occasional heartbeat accent

- Changed the continuous theme's rhythmic pulse into alternating single/double rounded sine accents on the downbeat of every fourth measure (32 score steps, 76.8 seconds between accents). Its pitch settles from 72 to 42 Hz and decays softly over 650 ms. Double accents add a quieter second thump 320 ms later; the combined pattern repeats every 64 steps.
- The accent stays out of menu, reflective, and reveal scenes. Preserved soundtrack versions and earlier listening samples are unchanged.

## 2026-10-29 — Permanent connection and relationship celebrations

- User request: retain initial share-link/code joining, persist the two-account connection across nights, add mutual irreversible email-bound Commit, and celebrate connection/commitment/night milestones cinematically with sound and opening scrapbook pages. Also document the possibilities of every implemented activity in README.md and chat.
- Added atomic one-use invitation joining, verified-email consent, immutable email reservations, pre-commit archival, shared-home New night/Continue, and concurrent-start protection. Existing session/history data is retained. No automatic email-delivery service was added.
- Connection, commitment, first night, and 10/25/50/100-night events have immutable dated scrapbook records. Each player dismisses their own ceremony once; receipts persist. Four original synthesized arrangements accompany responsive animated ceremonies; reduced motion, sound controls, focus trapping, Escape, and Continue are supported.
- README now inventories all 76 registered board activities and 16 duels. It distinguishes authored prompt/puzzle counts from answer combinations and open-ended responses, and explicitly identifies the inventory as current working-source counts.
- Verification: lint and production build passed; 37 unit files / 236 tests and 30 Firestore emulator tests passed. Isolated two-account Chromium flow passed invitation, both verified consents, persistent reload, shared-session start/resume, scrapbook prologue, first/10-night fixture ceremonies, receipts, reduced motion, and no page errors. Offline AudioContext rendered all four arrangements with nonzero output/no clipping and silent mute. Safari/WebKit final isolated rerun pending below; physical iOS and live production feature are not verified/deployed.
- Existing unrelated working-tree changes were preserved. This feature and matching rules remain local, uncommitted, and undeployed.
- Final Safari/WebKit isolated run completed all two-account flows and reduced-motion milestone checks. A separate stability check confirmed the home remained visible during idle periods and Continue reopened gameplay after reload. WebKit's emulator-stream access-control messages occurred only during page reload cancellation, not idle use; retain that distinction from a completely clean console claim.
- Removed a duplicate Sign Out button from the shared account card, improved retry subscription handling, added compatibility coverage for enriching legacy invitations, and guarded milestone subscriptions against a stale pair from a different signed-in account.
- Final inventory: 76 activities (13 special + 63 prompt/ritual/journal) and 16 duels. Thirty general activities have 6 prompts, thirty-three have 1. The README contains all individual names/counts and bounded response calculations.
- Final preview smoke caught a startup error in an unnecessary added debug-hook alias; removed it and retained the existing BoardScene text-state integration. Preview then rendered the board and mood controls with loaded player assets and no errors. Final Chromium two-account rerun passed with no page errors.
- Final unit result: 37 files / 237 tests passed; Firestore result: 31 passed. Sound now starts the full arrangement when first enabled rather than consuming it silently while a player reads; a focused test covers this delayed opt-in.

## 2026-10-29 — Twelve prompts per general activity

- User request: continue the proposed expansion from 213 prompts toward 12 authored prompts for every general prompt, ritual, and journal activity.
- Added 543 activity-specific prompts in activityPromptExpansion.js. All 63 general activities now have exactly 12 prompts, totaling 756 globally distinct prompt strings. Existing original questions and prior variants remain in their banks. The 13 specialist activities and 16 duels retain their existing content.
- Added situational, perspective, memory, and creative-constraint variations without adding unsupported input modes, generated cross-products, remote AI calls, or new gameplay/progression rules. Existing prompt-history rotation and saved in-progress cards are preserved.
- Updated every affected README inventory row and totals. Its specialist activity/duel counts remain unchanged.
- Validation: lint/build passed; all 37 unit files / 239 tests passed. Registry coverage reaches all 12 prompts in every general activity before repeating, then selects the least recent. Completion tests preserve new prompts and both answers in scrapbook payloads, including the delayed-opening postcard.
- Browser QA: actual activity components completed both response turns with new prompts for Comfort Menu, Museum of Us, Green Light Tonight, and Postcard From Next Year at 1440px and 390px, without overflow or page errors. The full local game preview opened Museum of Us with loaded board/player assets and no page errors. Temporary QA HTML was removed. The bundled smoke client's initial click timed out waiting for the animated offscreen Play button; a direct browser run with reduced motion/forced click verified the preview successfully.
- This expansion remains local and uncommitted; no deployment or backend/rules change was performed.
