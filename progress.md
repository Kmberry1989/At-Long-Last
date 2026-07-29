Original prompt: Harden the Firestore rules so participants can make only legitimate couple and session lifecycle updates, without breaking the verified invite/join flow. Add focused rules coverage and retest the two-account critical path before deploying.

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
