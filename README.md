# At Long Last

Remote-first two-player board game for couples, rebuilt as a Vite + React app with a mobile-first single-screen shell, realtime Firebase pairing/session sync, prompt events, and quick duel-style microgames.

## What Is Here

- `src/features/couple`: Firebase bootstrap, anonymous auth, invite-code pairing, and local preview fallback.
- `src/features/session`: Board/session state helpers, realtime session wiring, activity registry, and duel registry.
- `src/board`: Imperative Three.js board scene.
- `public/assets`: Reused board textures, poster art, and player model assets pulled from the source repos.

## Commands

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

## Firebase Setup

Create a `.env.local` from `.env.local.example` with:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_APP_ID=at-long-last
```

With those vars present, the app uses anonymous auth plus Firestore for:

- `couples`
- `sessions`
- `activities`
- `journalEntries`

The repo also includes:

- `firestore.rules`
- `firestore.indexes.json`

Those are the expected Firestore security and index baselines for the current app shape.

## No-Key Preview

If Firebase env vars are missing, the app still boots into a local preview path so the board loop, overlays, and journal flow can be exercised on one device. That preview is for UI verification only; realtime pairing still requires Firebase.

## Current Notes

- The production bundle is currently large because Three.js, Firebase, and the duel/activity UI all ship in the main chunk.
- A Firebase web app has been registered for project `at-long-last`, and the local Vite env file can now use that generated config.
- Anonymous Authentication has been enabled in Firebase Console for this project.
- Firestore still needs its first database instance created before realtime pairing and session sync can run against the live backend.
