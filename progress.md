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
