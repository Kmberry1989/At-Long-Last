# At Long Last — Two-Player Playability Test Report

## Current Run Summary

- **Run date:** 2026-07-26 (America/Indiana/Indianapolis)
- **Result:** PASS — the hardened rules support the current two-account lifecycle and narrowly recover the reported pre-arc session; the missing avatar request and WebGL teardown fault are also fixed.
- **Release decision:** Firestore rules and the frontend bundle were deployed only after the emulator, unit, static, and local browser gates passed.
- **Branch:** `main`
- **Local URL:** `http://127.0.0.1:4173/`
- **Production URL:** `https://atlonglast.vercel.app/`
- **Runtime:** Node `v22.23.1`, npm `10.9.8`, macOS `26.5.2`
- **Firebase mode:** Standard Firestore emulator for deterministic two-account coverage; production rules and exact legacy recovery verified against `at-long-last` (`nam5`)

The older two-phone/mobile-finale endurance evidence below remains historical
and separate.

## 2026-07-26 Legacy Recovery and Renderer Hotfix

| Check | Result | Evidence |
| --- | --- | --- |
| Legacy lifecycle root cause | PASS | The reported session used the pre-arc schema and lacked the newer spotlight, momentum, activity-option, and keepsake-perk fields required by the modern validator. |
| Narrow compatibility rule | PASS | Only an existing participant can change `status`, `endedAt`, `lastActionAt`, and `updatedAt` for the matching active session, and only when the same atomic commit clears the couple pointer. |
| Focused adversarial coverage | PASS | Rules tests deny outsider cleanup, one-sided writes, terminal reopen, session field smuggling, and invite mutation during detach; final-participant room cleanup is also covered. |
| Two-account pre-deploy gate | PASS | Two distinct authenticated emulator contexts completed invite creation, code join, shared session start, atomic abandon, and terminal-reopen denial through the production service functions. |
| Live two-account critical path | PASS | Two temporary isolated Firebase identities created and joined a production room, shared one session, atomically abandoned it, completed guest/final-host leave cleanup, and then deleted both temporary auth identities. |
| Exact production recovery | PASS | After the rules release, the previously denied `Start Fresh` action abandoned the July 18 session, created a new round-1 session for the same paired players, and retained three scrapbook artifacts. |
| Player pieces | LOCAL PASS / UNRELEASED | The local build offers 53 named GLB pieces with generated previews. An Owl selection and the second-player Classic Globe both decoded and rendered on the board; production has not been redeployed or retested for this asset update. |
| Renderer lifecycle | PASS | The required web-game client and browser flow exercised preview entry, vibe vote, roll, response, `390×844`/`1040×732` resizing, and repeated remounts with zero new console errors. |
| App unit suite | PASS | `npm test`: 9 files / 49 tests passed. |
| Rules suite | PASS | `npm run test:rules`: 1 file / 14 tests passed. |
| Static validation | PASS | `npm run lint`, `npm run build`, `git diff --check`, and the Firebase rules dry-run passed. |
| Rules deployment | PASS | Firebase CLI compiled and released `firestore.rules` to `at-long-last`. |
| Frontend deployment | PASS | Vercel production deployment `dist-c58ysh0i0-kyle-matthew-berry-s-projects.vercel.app` is Ready and aliased to `https://atlonglast.vercel.app/`. |

Only one of the previously authenticated Chrome profiles was available, so the
exact legacy document was recovered through that existing profile and the live
two-account transaction was repeated with temporary isolated Firebase
identities. Those temporary room and auth records were removed afterward.

## 2026-07-26 Firestore Rules Hardening

| Check | Result | Evidence |
| --- | --- | --- |
| Firestore edition/target | PASS | `projects/at-long-last/databases/(default)` is Standard edition, native mode, in `nam5`. |
| Rules syntax | PASS | Firebase CLI dry-run compiled `firestore.rules` without warnings. |
| Two-account invite/join | PASS | The real `createCoupleDocument` and `joinCoupleByInviteCode` services created the four linked room documents, paired two distinct authenticated UIDs, created the joining player link, and removed the open lobby. |
| Shared session bootstrap | PASS | The real `ensureActiveSession` service created one session and both authenticated contexts read the same couple/session identity. |
| Session termination | PASS | The real `abandonSession` service atomically marked the session `abandoned` and cleared the couple pointer; reopening the terminal session was denied. |
| Legitimate leave/reopen | PASS | The joining participant left through `leaveCoupleDocument`; the host remained and the waiting lobby reopened with matching identity. |
| Bounded board reward | PASS | One production board-reward transition succeeded; a forged jump to 100 stars was denied. |
| Adversarial rules suite | PASS | 14/14 rules tests passed, including unauthenticated access, invite enumeration, outsider reads, third-player injection, invite/schema mutation, forged couple links, arbitrary session attachment, legacy cleanup abuse, final-participant cleanup, identity/timestamp mutation, premature completion, cross-player duel-result tampering, and unpaired abandon/detach writes. |
| App unit suite | PASS | `npm test`: 9 files / 49 tests passed. |
| Static validation | PASS | `npm run lint`, `npm run build`, and `git diff --check` passed. |
| Production rules deploy | PASS | Firebase CLI released `firestore.rules` to Cloud Firestore for `at-long-last`; no application deployment was made. |

The emulator retest exposed and fixed one client transaction bug before
deployment: `abandonSession` previously issued a write before its final read.
The service now reads both couple and session documents before queuing either
write.

### Current Security Rules Audit

```json
{
  "score": 4,
  "summary": "Couple and session authority comes from authenticated identity, existing resource state, and atomic after-state checks. The legacy compatibility path permits only an identity-preserving active-to-abandoned transition with the matching couple detach. Invite creation/join, participant leave, active-session attach/detach, bounded board rewards, modern session transitions, immutable session identity, and per-player duel results remain constrained and emulator-covered. Remaining risk is limited to storage-abuse validation inside flexible nested gameplay, activity-state, and journal payload maps.",
  "findings": [
    {
      "check": "Storage Abuse",
      "severity": "minor",
      "issue": "Flexible nested gameplay, activity state, and journal payload maps have key-count and document-schema bounds but do not type/length-check every possible nested value.",
      "recommendation": "As payload shapes stabilize, add per-activity and per-journal-payload validators without expanding the session lifecycle evaluator past Firestore's expression limit."
    }
  ]
}
```

## Historical Preflight (2026-07-17)

| Check | Result | Evidence |
| --- | --- | --- |
| `npm run lint` | PASS | `oxlint src` exited successfully with no findings. |
| `npm run build` | PASS | Vite 8.1.4 transformed 469 modules and completed in 425 ms. |
| `npm test` | BLOCKED | Vitest 4.1.10 reached `RUN` with V8 coverage enabled but executed no tests or test files; the stalled process was stopped after approximately 40 seconds. |
| Local production shell | PASS | Local preview rendered the current private-first auth screen and the copy “A private board game night for two phones.” |
| Production shell | PASS | Corrected build deployed to `https://atlonglast.vercel.app/`; current private-first copy rendered. |
| Chrome profile isolation | PASS | Two independent connected Chrome profiles were available. |
| Player One authentication | PASS | Player One loaded an authenticated profile and retained it after reload. |
| Player Two authentication | PASS | Player Two loaded a distinct authenticated profile and retained it after reload. |

The console messages observed during browser inspection originated from the Chrome control extension (`chrome-extension://...`), not from the application origin. No application-origin warning or error was observed on the unauthenticated shell.

## 2026-07-21 Production Retest Evidence

| Check | Result | Evidence |
| --- | --- | --- |
| Isolated browser contexts | PARTIAL | A clean in-app browser context and a separate Chrome profile were opened at the production URL. The clean context reached the sign-in screen; the Chrome profile was already attached to an existing live couple session. |
| Mobile viewport, phone one | PASS (shell only) | At `390 × 844`, the production auth screen rendered its title, sign-in controls, and sound opt-in without an application-origin console error or warning. |
| Mobile viewport, phone two | FAIL | At `393 × 852`, an active activity panel showed above a stale-session alert and duplicated the same stalled-state copy. The alert and its recovery controls competed with the active panel at the bottom of the phone screen. |
| Live session/sync inspection | PASS (read-only) | The existing session loaded its round, players, activity state, and journal listener without application-origin console errors or warnings. No state-changing control was used. |
| Scrapbook payload rendering | PASS (read-only) | The live journal listener exposed activity and duel artifacts with participant/result details. The drawer’s button was correctly blocked by the active activity modal, so no underlying control could be used while the modal was open. |
| Full preset through finale | BLOCKED | Only one usable authenticated profile was available. Creating a second test identity would require signing out or switching the existing live Chrome profile; that session was deliberately left untouched. |
| Unit suite | PASS | `npm test`: 8 files, 47 tests passed. |
| Static checks | PASS | `npm run lint`, `npm run build`, and `git diff --check` passed sequentially. |

### Defect Found and Local Fix

**P1 — Mobile stale recovery competed with an activity modal.** The production screenshot showed a stale-state warning twice: once as the bottom status line and again in the recovery card. Its `Resume`/`Start Fresh` controls remained visually present beneath the active activity overlay.

**Local remediation:** `GameScreen.jsx` now suppresses the bottom status while recovery is required and renders one top-layer recovery panel. `index.css` gives that panel a higher stacking level and opaque enough backdrop to prevent the activity, HUD, or scrapbook drawer from competing with recovery actions. The adjusted scrapbook/session tests now clean up their DOM state and assert the intended duplicate keepsake label in the finale tag list. These are local, validated changes only; no production deployment was made from the dirty worktree.

### Completion Blocker and Retest

To complete the requested production gate, provide two clean, separately authenticated test profiles (or make a second Chrome profile available without disconnecting the existing session). Then run the quick preset from pairing through finale, reload both phones, and confirm the finale card plus the persisted scrapbook artifacts on each device.

## Historical Critical-Path Checklist (2026-07-17)

| Scenario | Status | Acceptance evidence required |
| --- | --- | --- |
| Two independent test accounts sign in | PASS | Distinct authenticated identities were visible in isolated Chrome profiles. |
| Authentication survives reload | PASS | Both profiles returned to their respective authenticated lobby state after reload. |
| Player One creates a private room | PASS | A new private room displayed a six-character invite code. |
| Player Two joins by invite code | PASS | Player Two joined Player One's fresh six-character invite after the legacy room was safely cleared. |
| Session preset is selected and game starts | PASS | Both profiles entered the same live session after selecting the quick preset. |
| Initial session state synchronizes | PASS | Both profiles showed the same players, hearts, round, warmup objective, and active turn. |
| Movement/turn transition | PASS | Player One rolled and moved from position 1 to 5; both profiles entered the same keepsake stop. |
| Activity response | PASS | Both players completed “Conspiracy: Us”; responses, hearts, momentum, spotlight completion, and activity journal card synchronized. |
| Duel interaction | PASS | Both players completed Letterpress; winner, +3 hearts, round advancement, timing/score details, and duel journal card synchronized. |
| Active-session reload recovery | PASS | Both profiles reconnected to the same active state after loading the production origin. |
| Mobile-sized usability | NOT RUN | Primary controls remain readable and usable without blocking overflow. |
| Sound opt-in | NOT RUN | Sound starts only after the visible opt-in control is activated. |
| Journal persistence | PASS | Both activity and duel artifacts restored in both profiles after production reload. |

## Historical Production Smoke Test (2026-07-17)

**Status: PASS.** Latest Vercel production deployment `dist-7wltshznv-kyle-matthew-berry-s-projects.vercel.app` was aliased to `https://atlonglast.vercel.app/`. Both isolated Chrome profiles reconnected to the same active session, completed a duel and activity, restored both scrapbook artifacts after reload, and exited the cached “Sync is catching up” state. No Firebase warning or error occurred on the corrected production path; repeated browser-listener messages were attributable to browser extensions.

## Release-Blocking Defect

### P0 — Existing player cannot switch from a legacy private room — FIXED

**Observed behavior:** Player Two was already linked to an older waiting room. Switching to Player One's newly created six-character invite failed with `Missing or insufficient permissions.` Reversing the direction also failed: Player One successfully left the new room but could not join Player Two's existing invite.

**Firestore evidence:** The rejected commit attempted to delete Player Two's `playerCouples`, `couples`, `publicLobbies`, and `coupleInvites` documents as part of the switch transaction. Firestore returned `permission-denied`. The failure is consistent with the current rules requiring modern lifecycle fields while the older couple document predates those fields; this is an evidence-based inference and should be confirmed against the stored document before changing rules or data.

**Root cause:** `leaveCoupleDocument` unconditionally queued deletion of a matching public-lobby document. Player Two's legacy couple had no public-lobby document, so Firestore evaluated a delete without an existing resource and denied the entire cleanup transaction.

**Fix:** The client transaction now reads optional public-lobby and invite documents before writes and deletes each only when it exists.

### P0 — Joining player cannot delete the open lobby — FIXED

**Root cause:** The public-lobby delete rule checked current couple membership, but Player Two is added to the couple in the same atomic transaction. The pre-write membership check therefore denied a valid join.

**Fix:** The delete rule now uses a tightly constrained `getAfter()` path that permits lobby deletion only when the resulting couple is paired with the original host first, the authenticated joining player second, and unchanged invite/share-link identity.

### P0 — Paired session never bootstraps — FIXED

**Root cause:** `SessionProvider` derived `isHost` only from an existing session, while the host check controlled creation of that first session. Both clients therefore rendered an empty shell.

**Fix:** Host resolution now falls back to the first paired couple member before a session exists, with a regression assertion covering the pre-session state.

### P1 — Reloaded sessions remain labeled as syncing — FIXED

**Root cause:** The session listener used cached snapshot metadata to enter the syncing state but did not request metadata-only callbacks, so a server-confirmed snapshot with unchanged data could not return the UI to live.

**Fix:** The session subscription now enables `includeMetadataChanges`; both production profiles returned to live after reload while retaining their two scrapbook artifacts.

**Reproduction:**

1. Sign two distinct existing accounts into isolated browser profiles.
2. Leave one account linked to an older waiting room.
3. Create a new private room with the other account.
4. Enter the new invite in **Switch to their code** and select **Switch**.
5. Observe `Missing or insufficient permissions.`

## Retest Instructions

1. Repeat the mobile-sized layout check on both production profiles.
2. Complete a full preset through the finale in a dedicated endurance run.

## Security Rules Audit

```json
{
  "score": 2,
  "summary": "The new atomic join exception is identity-bound and narrowly constrained, but the existing broader rules still allow participants to update couple and session documents without comprehensive schema and immutable-field validation.",
  "findings": [
    {
      "check": "Update Bypass",
      "severity": "major",
      "issue": "Existing participant update rules can modify sensitive couple or session fields without full post-write validation.",
      "recommendation": "Add domain validators to create and update rules and lock identity, participant, ownership, and lifecycle fields to their intended transitions."
    },
    {
      "check": "Storage Abuse",
      "severity": "minor",
      "issue": "Several user-written strings and nested payloads lack comprehensive size limits.",
      "recommendation": "Add bounded string, list, and nested-map validation without breaking the current game payloads."
    }
  ]
}
```

Deployment remains gated until every authentication, pairing, synchronization, and game-start row passes locally.
