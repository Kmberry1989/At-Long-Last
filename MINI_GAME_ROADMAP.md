# At Long Last Mini-Game Roadmap

This roadmap keeps new activities inside the existing paired session, shared-heart,
board-reward, and scrapbook loop.

## Wave 1 — playable now

| Activity | Status | Current shape |
| --- | --- | --- |
| Mind Meld | Implemented | Two sequential secret choices, match reveal, shared hearts, and scrapbook card |
| The Prediction Box | Implemented | Predictor locks an answer before the subject responds; exact-call reveal and scrapbook card |
| The Vault | Implemented | Two sequential sealed notes stored as a finale-gated scrapbook entry |

Development previews:

- `?previewActivity=mind-meld`
- `?previewActivity=prediction-box`
- `?previewActivity=the-vault`

## Wave 2 — playable now

### Vibe Check

- Implemented with sequential secret markers, five continuum prompts, distance-based
  shared hearts, and a two-marker scrapbook strip.
- Development preview: `?previewActivity=vibe-check`
- A future expansion can add a predict-your-partner mode.
- Best new art: a tactile brass-and-enamel dial with paired colored pins.

### Tempo Tap

- Implemented as alternate-phone five-tap rhythm turns with a fixed touch target,
  accuracy scoring, steady-interval streaks, and a combined scrapbook result.
- Development preview: `?previewActivity=tempo-tap`
- Live simultaneous input can follow once timing synchronization is proven across two devices.
- Best new art/audio: a softly glowing heart ring, three pulse sounds, and subtle haptics.

### Word Weaver

- Implemented with deterministic letter trays, a 30-second clock, bundled word validation,
  duplicate prevention, length bonuses, and a letterpress scrapbook page.
- Development preview: `?previewActivity=word-weaver`
- A future content pass should expand the compact bundled dictionaries.
- Best new art: ivory letter tiles, a velvet timer, and a miniature printing block.

## Wave 3 — playable locally

### Dual-Axis Maze

- Implemented with deterministic 5×5 routes, one horizontal controller, one vertical
  controller, alternating bounded moves, wall-bump tracking, and a shared-route scrapbook card.
- Development preview: `?previewActivity=dual-axis-maze`
- True simultaneous analog streaming remains a future transport upgrade; the current
  alternating model avoids lost concurrent Firestore writes.
- Best new art: a shallow wooden maze, a pearl token, brass gates, and tiny destination charms.

### Blind Canvas

- Implemented as sequential unseen left/right canvases with compressed, size-bounded image
  payloads and a joined scrapbook reveal.
- Development preview: `?previewActivity=blind-canvas`
- Live simultaneous halves can follow after two-device conflict handling is proven.
- Best new art: torn deckled paper, two ink colors, and wax-seal prompt cards.

### Harmonic Lock

- Implemented with resonance-guided dials, visual ring feedback, supported-device vibration,
  compact stored dial positions, and a shared-resonance scrapbook reveal.
- Development preview: `?previewActivity=harmonic-lock`
- Layered tones remain a future audio-system enhancement.
- Best new art/audio: paired brass tuning dials, a glass resonance chamber, and layered tones.

## Wave 4 — playable locally

### Bluff Bidding

- Implemented as an alternating raise-or-challenge duel capped at eight answers, followed
  by an honor-system proof list and a bidding-receipt scrapbook card.
- Development preview: `?previewActivity=bluff-bidding`
- A future timed-live variant can add a synchronized 15-second proof clock after two-device
  latency and reconnect behavior are proven.
- Best new art/audio: miniature brass bid paddles, a velvet challenge card, a sand timer,
  and a soft table-knock sound.

### Photo Flashback

- Implemented with an explicit photo picker, on-device resizing and compression, a
  350,000-character payload cap, sequential sealed captions, and an instant-photo scrapbook reveal.
- Development preview: `?previewActivity=photo-flashback`
- The current session-scoped image is stored inline. Private Firebase Storage paths with
  couple-only access, retention controls, and explicit deletion are the durable follow-up.
- Best new art: instant-photo frames, date stamps, corner mounts, and handwritten caption labels.

## Future asset wishlist

1. Brass-and-enamel continuum dial with two colored marker pins for Vibe Check.
2. Softly glowing heart-ring target plus three short pulse sounds for Tempo Tap.
3. Ivory letter tiles, velvet timer, and miniature printing block for Word Weaver.
4. Shallow wooden maze, pearl token, brass gates, and interchangeable destination charms.
5. Deckled two-part drawing paper, paired ink nibs, and wax-seal prompt cards.
6. Twin brass tuning dials and a glass resonance chamber with layered harmonic tones.
7. Numbered bid paddles, challenge card, and tabletop sand timer for Bluff Bidding.
8. Instant-photo frames, date stamps, corner mounts, and handwriting-style caption labels.
9. A tiny vault box with opening animation, paper notes, and reusable wax seals.
10. Seasonal board-edge prop packs: picnic night, snowy cabin, beach dusk, and anniversary table.

## Shared acceptance gates

- Both players can reconnect mid-activity without losing or revealing a hidden response.
- Only the active participant can submit the expected stage.
- Shared-heart rewards resolve exactly once.
- The scrapbook output is legible and meaningful after the activity finishes.
- Rules-emulator coverage rejects outsiders and malformed state transitions.
- Mobile portrait, desktop, and two-isolated-profile browser paths pass without console errors.
