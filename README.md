# At Long Last

A remote two-player board game for couples: shared nights, prompts, cooperative activities, duels, and a scrapbook that grows with your relationship. Built with Vite, React, Three.js, Firebase Authentication, and Firestore.

## Connect once, come home together

Sign in with Google or email/password. One person creates an invite and shares the existing link or six-character code. Accepting it consumes that invitation and saves the connection for both accounts. Later visits open your shared home; **New night** starts a session and **Continue** resumes the same session on either device. No new code is needed each night.

**Commit** requires a verified email and explicit permanent confirmation from each person. After both consent, their normalized email addresses are locked to this pair. The client offers no unpair, reset, or replacement partner, and Firestore rules reject those operations, including a new account attempting to reuse a locked email. Before mutual commitment, either person may cancel the connection; its history remains archived. This is an application guarantee enforced by the deployed rules, not a claim that database administrators cannot modify their database. The lock applies to the recorded email addresses; it cannot identify a person using a different address.

Connection, commitment, the first completed night, and **10, 25, 50, and 100 completed nights** receive dated scrapbook entries. Each has a full-screen animated celebration with selected player pieces and an original piano/celeste/string cue. First-night and later milestone music have separate arrangements. Sound follows the audio setting and browser playback permission; **Sound on**, **Mute sound**, and **Continue** remain available throughout. Reduced-motion preferences remove the animation. Per-player receipts prevent acknowledged celebrations from replaying on every visit. The relationship prologue appears at the start of the scrapbook. Existing history and custom names are retained; old milestones are not assigned invented dates.

## Commands

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
npm run test:rules
```

`test:rules` starts a Firestore emulator. If an emulator already runs on port 8080, use:

```bash
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 npx vitest run --config vite.rules.config.js
```

For isolated two-account local testing, set `VITE_USE_FIREBASE_EMULATORS=true` and use a demo Firebase project with Auth on port 9099 and Firestore on port 8080. Never use production accounts for permanent-commitment tests.

## Firebase setup and data

Copy `.env.local.example` to `.env.local` and supply the Firebase web-app values:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_APP_ID=at-long-last
```

Enable Google and email/password authentication and configure authorized domains. Realtime play requires a Firestore database, `firestore.rules`, and `firestore.indexes.json`. The existing production project already has a database; configuring a web app alone does not deploy the rules.

The main collections are `profiles`, `couples`, `playerCouples`, `coupleInvites`, `sessions`, `activities`, and `journalEntries`. Permanent email reservations live in `pairingLocks`; relationship events live in `pairingMoments`; acknowledgment receipts live under each profile's `celebrationReceipts`. Invitations disclose the host preview needed to join; couple history, moments, and receipts remain restricted to their participants/owner. Commitment consent, email locks, and its moment are saved atomically. Night milestones are banked with lifetime progress, once per completed session.

Without Firebase configuration the app supports **local preview** for UI/gameplay checks. Preview does not create a real connection or permanent email lock.

## Implemented activity possibilities

Inventory of the **current working source**, audited October 29, 2026: **76 board activities plus 16 duel types = 92 implemented entries**. These counts describe the source in this checkout, including its expanded prompt banks; they do not assert that every bank or this connection feature is already deployed to the live site.

“Possibilities” below means authored prompts, puzzles, rhythms, or scenarios actually connected to a registered activity. Responses, photos, drawings, timing, bid sequences, and replay order create additional variation. Those are not presented as a finite authored content count. A shared question can appear in more than one activity, so adding bank sizes does not count globally unique questions. Presets and board routing change which entries appear during a night, not these bank sizes.

### Cooperative and sealed activities — 13

| Activity | Implemented content | Additional response possibilities |
| --- | --- | --- |
| Mind Meld | 56 questions | 4 choices each; 16 ordered answer pairs per question, **896** question/answer-pair configurations |
| The Prediction Box | 58 questions | 4 choices; 16 answer/prediction pairs per question, **928** configurations for a fixed pair of roles |
| The Vault | 20 prompts | Written responses are open-ended |
| Same Wavelength | 58 prompts | Two sealed written answers; open-ended |
| Mutual Yes | 20 prompts | Yes / Maybe / Not right now; 9 response pairs each, **180** configurations; individual non-mutual choices remain concealed |
| Vibe Check | 20 scales | Each person selects an integer from 0–100: 10,201 ordered pairs per scale, **204,020** prompt/pair configurations |
| Tempo Tap | 8 rhythm patterns | Real-time tap timing varies |
| Word Weaver | 6 letter trays | **141** accepted tray/word entries, **130** unique words across trays; submission combinations/order vary |
| Dual-Axis Maze | 2 mazes | Shared movement paths and timing vary |
| Blind Canvas | 22 prompts | Drawings are open-ended |
| Harmonic Lock | 8 target rounds | Two integer controls from 0–100: 10,201 ordered control pairs each, **81,608** round/pair configurations |
| Bluff Bidding | 25 topics | Bids and written answers vary |
| Photo Flashback | 20 prompts | Photos and captions are open-ended |

Word Weaver's tray dictionary sizes are **Hearts 28**, **Related 16**, **Ocean 14**, **Listen 35**, **Smiles 20**, and **Garden 28**. Repeated words in different trays account for the difference between 141 tray/word entries and 130 distinct words.

### Prompt, ritual, and journal activities — 63

These entries accept open-ended responses. The count is the original authored prompt plus the additional variants used by `pickActivityPrompt`. **30 entries have 6 prompts each; 33 have 1 each: 213 prompt slots total.** A single-prompt activity can still produce a different shared response every time.

| Activity | Authored prompts |
| --- | ---: |
| Comfort Menu | 6 |
| Small Mercies | 6 |
| Weather Report | 6 |
| Receipts | 6 |
| Future Artifact | 6 |
| Postcard From Next Year | 1 |
| Translation | 6 |
| Map Pin | 1 |
| Director's Commentary | 6 |
| House Rules | 1 |
| Growth Ring | 6 |
| Anchor Memory | 6 |
| Unsent Draft | 1 |
| Gratitude Snapshot | 6 |
| Shared Seed | 1 |
| Cursed Date | 6 |
| Yelp Review | 6 |
| Build-A-Cult | 1 |
| Lore Drop | 6 |
| Two Truths and a Dream | 6 |
| Alternate Universe Job | 6 |
| Apocalypse Role | 6 |
| Pet Peeve Love Letter | 6 |
| Conspiracy: Us | 1 |
| Wikipedia: Us | 6 |
| Theme Song | 6 |
| Bad Advice | 1 |
| Villain Origin | 6 |
| Nudge Wars | 1 |
| Sound Capsule | 1 |
| Replay | 6 |
| Wanted List | 6 |
| Slow Morning | 6 |
| Confidence Fit | 6 |
| Whisper Line | 6 |
| Scent Memory | 6 |
| How I Like To Be Held | 6 |
| That Look | 6 |
| Flirt Resume | 1 |
| What I Miss Today | 1 |
| Date That Never Ends | 1 |
| Secret Admiration | 6 |
| After Hours | 1 |
| Landing Lights | 1 |
| Rewind | 6 |
| Rose, Thorn, Seed | 1 |
| Ordinary Treasure | 1 |
| Invisible Backpack | 1 |
| Gentle Signal | 1 |
| Five-Minute Tradition | 1 |
| Museum of Us | 1 |
| Wrong Answers Only | 1 |
| Couple Mascot | 1 |
| Tiny Shark Tank | 1 |
| Plot Twist | 1 |
| Soundtrack Shuffle | 1 |
| Emoji Forecast | 1 |
| Closer Than Words | 1 |
| Date Trailer | 1 |
| Favorite Detail | 1 |
| Green Light Tonight | 1 |
| Chemistry Recipe | 1 |
| Doorstep Scene | 1 |

### Duels — 16

| Duel | Implemented possibilities |
| --- | --- |
| Constellation | 1 five-star drawing scenario; drawings vary |
| Heartbeat Hold | 1 hold scenario; timing varies |
| Letterpress | 1 writing prompt; text varies |
| Sync Breath | 1 breathing/hold scenario; timing varies |
| Gratitude Duel | 1 writing prompt; text varies |
| Doodle Duel | 1 drawing prompt; drawings vary |
| Portrait Panic | 1 drawing prompt; drawings vary |
| Wavelength | 1 scale; 10 values per player, 100 ordered answer pairs |
| Emoji Court | 1 writing prompt; text/emoji vary |
| Reaction Heart | 1 reaction scenario, 2 possible target symbols (heart/spark); delay and reaction timing vary |
| Kiss Courier | 1 hold scenario; timing varies |
| Fever Dream Date | 1 writing prompt; text varies |
| Trailer Voice | 1 writing prompt; currently submitted as text, not recorded audio |
| Temperature Check | 1 scale; 10 values per player, 100 ordered answer pairs |
| Slow Draw | 1 drawing prompt; drawings vary |
| Wavelength Duel | 65 questions, 4 choices each; 5 distinct questions selected per match |

For Wavelength Duel, choosing 5 questions from 65 gives a mathematical upper space of **8,259,888 unordered packs**, or **991,186,560 ordered packs**. The implementation uses a seeded shuffle; these figures are combinatorial bounds, not a verification that every pack is reachable through its seed generator. Each question has four choices. Both players answer and predict the other across five questions, giving **4²⁰ = 1,099,511,627,776** possible answer/prediction configurations for a fixed pack before scoring. There are only **65 authored questions**, not millions of authored questions.

Counts are derived from the registered entries in `src/features/session/activityRegistry.jsx` and `duelRegistry.jsx`, the definitions in `contentPackData.js`, and the active banks in `expandedPromptData.js`, `connectionGameData.js`, `sealedActivityData.js`, `waveTwoGameData.js`, `waveThreeGameData.js`, `waveFourGameData.js`, and `wavelengthDuelData.js`. Definition descriptions, unused fallback components, collection items, and proposed activities are not counted as extra games.

## Project layout

- `src/features/couple`: authentication, durable invitation/pairing, permanent consent locks, progress and milestones.
- `src/features/session`: board/session state, activity and duel registries, prompt banks, realtime actions.
- `src/components`: shared home, scrapbook, collection, gameplay screens, and cinematic celebrations.
- `src/audio`: music engines and original celebration arrangements.
- `src/board`: Three.js board scene.
- `public/assets`: board, interface, audio, and player assets.

## Verification boundaries

Local automated checks cover UI/provider logic and Firestore authorization, including simultaneous session creation, email verification, immutable commitments, archived history, and idempotent milestone banking. Isolated two-account browser checks exercise joining once, both consents, shared night creation/resume, scrapbook entries, ceremony receipts, and narrow-screen layouts. Milestone visual checks may use emulator fixtures; they are separate from rule tests of actual night banking. Browser-engine and offline audio rendering checks do not substitute for physical iPhone/iPad playback or a complete real-world night. Deploy both the application and its matching rules before treating this feature as live.

Latest local verification for this feature: **237 UI/logic tests and 31 Firestore rule tests passed**, with lint and production build passing. Chromium and WebKit each completed the two-account flow on desktop and phone-sized viewports. WebKit logged canceled Firestore emulator stream requests during navigation; a separate stability check found no idle-page errors and successfully reopened the saved session. Physical iPhone/iPad audio and production deployment remain unverified.
