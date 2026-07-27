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

## Wave 3 — cooperative set

### Dual-Axis Maze

- One phone controls horizontal movement and the other controls vertical movement.
- Stream normalized axis intent through the activity document at a deliberately bounded rate.
- Use deterministic maze seeds so reconnects restore the same board.
- Best new art: a shallow wooden maze, a pearl token, brass gates, and tiny destination charms.

### Blind Canvas

- Build on `DoodleDuel` canvas capture and scrapbook image support.
- Start with one phone drawing each half sequentially; graduate to live simultaneous halves
  after two-device canvas merging is reliable.
- Reveal the merged image only after both halves are submitted.
- Best new art: torn deckled paper, two ink colors, and wax-seal prompt cards.

### Harmonic Lock

- Each player adjusts one dial while a shared resonance score guides them toward a lock.
- Start with visual and audio feedback; haptics remain progressive enhancement.
- Store only dial positions and the resolved lock result, not a continuous input stream.
- Best new art/audio: paired brass tuning dials, a glass resonance chamber, and layered tones.

## Wave 4 — memory expansion

### Photo Flashback

- Begin with an explicit photo picker instead of broad gallery access.
- Attach a chosen image to a session-scoped memory prompt, then collect one caption from
  each player.
- Use private Firebase Storage paths with couple-only access and deletion controls.
- Best new art: instant-photo frames, date stamps, corner mounts, and handwritten caption labels.

## Shared acceptance gates

- Both players can reconnect mid-activity without losing or revealing a hidden response.
- Only the active participant can submit the expected stage.
- Shared-heart rewards resolve exactly once.
- The scrapbook output is legible and meaningful after the activity finishes.
- Rules-emulator coverage rejects outsiders and malformed state transitions.
- Mobile portrait, desktop, and two-isolated-profile browser paths pass without console errors.
