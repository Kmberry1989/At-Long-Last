# At Long Last — SFX Generation Prompts

Companion brief for producing replaceable, mix-ready sound assets. The app currently synthesizes most cues in `src/audio/AudioProvider.jsx`; this document describes a cohesive asset library that can replace those tones without changing game rules.

## Sound identity

Create sounds for a romantic, tactile keepsake game: intimate, warm, slightly magical, and clear on phone speakers. Think polished wood, velvet, paper, brass, glass, and a quiet room at night. Keep cues short and satisfying. Avoid casino sounds, loud arcade bleeps, generic phone UI clicks, childish cartoon effects, spoken words, music beds, and heavy cinematic booms.

## Delivery rules for every generated cue

- Export one clean, dry effect per file; no music or voice.
- Prefer 48 kHz WAV, 24-bit PCM as the source master. Make a normalized web delivery copy after approval.
- Leave a small amount of headroom; target a comfortable phone-speaker peak around -6 dBFS. Do not hard-limit transient detail.
- Keep tails short unless a prompt asks for a held shimmer. Avoid long reverb that smears quick repeated actions.
- Provide a mono-compatible version. Use stereo movement only when called out below; preserve the center image on phones.
- Make variants by changing timing, pitch, and timbre slightly, not by changing perceived loudness wildly.
- Keep the user’s music ducking/stop behavior intact. Stop or duck music before recording a microphone clip.

## Core board and turn cues

### Dice cup — pickup and shake

> Close, soft leather-and-wood handling sound: a small felt-lined dice cup lifted from a round wooden tray, then two polished dice rattling inside it. Intimate ASMR perspective, several tiny irregular contacts, gentle stereo motion, 350 ms total, dry room, no voice, no music, no glassy or metallic clanks.

### Dice roll — layered impacts

> Two small rounded dice tumble across a velvet-covered tabletop and settle naturally. Create a 700–1100 ms sequence with 4–7 irregular, separately audible impacts: soft low wooden knocks, bright but muted ivory-pip ticks, one slightly heavier bounce, and a final quiet settle. Vary impact timing and stereo pan naturally between takes. Keep the highest transient soft, not sharp; no dice shaker sound, no casino flourish, no music.

### Dice settle / result lock

> A final tiny wooden tap followed by a warm, clear two-note glassy chime that feels like the dice have come to rest and the value is now known. 180 ms, understated, no fanfare, no voice.

### Dice returned to cup

> Two small dice placed back into a felt-lined wooden cup: a gentle padded double tap, brief velvet brush, and small ceramic-wood resonance. 220 ms, close and reassuring, no hard clatter.

### Missed cup / turn-end flush

> A brief, unmistakable comic consequence cue for a missed cleanup: soft switch click, a quick small toilet flush swirl, then a low watery finish and a tiny descending plunk. Keep it tasteful and short, 900–1200 ms, humorous but not gross, no speech, no harsh plumbing roar. Leave room for the on-screen “oops” animation.

### Player piece hops one space

> A small polished game token makes one soft, weighty hop and lands on a padded illuminated board space: subtle lift swish, rounded wooden contact, tiny warm light chime. 160 ms; produce a family of 6 pitch/timbre variants for repeated movement, with no identical machine-gun loop.

### Space landing accents

> Make a compact landing accent that identifies the space category through timbre alone: ordinary space—warm felt tap; activity—two gentle glass notes; treasure—bright rising brass-and-crystal sparkle; trash—soft muted descending wood note. Each is under 350 ms, same loudness and family, no voices or music.

### Turn control / switch

> A small movable tabletop light switch is pressed with a satisfying mechanical click followed by a soft relay tick and a restrained warm confirmation chime. 220 ms; tactile, not electrical or industrial.

### Trade control (legacy / optional)

> A pair of small keepsake cards slide toward one another across felt, pause, then exchange with a soft paper kiss and a tiny brass confirmation. 350 ms, gentle and clear. Keep separate from the turn switch cue.

## Cards and coin

### Card drawn from either pile

> One thick illustrated keepsake card slides off a short paper stack: papery friction, a soft edge flick, and a muted landing on velvet. 280 ms, close-miked and tactile, no brittle snap.

### Card flip / reveal

> A single heavyweight card turns over in the air and lands face-up: quick paper whoosh, brief flap, rounded velvet landing, tiny bright reveal glint. 400 ms, one clean gesture, not a magical laser.

### Treasure card reveal

> The same card flip as the common reveal, with a soft rising glass shimmer and warm tiny bell at the end. 450 ms, positive but restrained.

### Trash card reveal

> The same card flip as the common reveal, followed by a low soft wood note with a brief downward paper flutter. Lightly rueful, never scary or punishing; under 500 ms.

### Coin spin and landing

> A substantial engraved brass coin spun vertically on a small round velvet pedestal: close metallic shimmer that accelerates into several quick balanced ticks, wobbles unevenly, then lands with a warm, weighty brass click. 900–1300 ms. The spin must sound continuous, with no hard cut or double-hit; no casino jackpot flourish.

### Trash / Treasure coin result

> A short result chime for the engraved coin: treasure side gets a warm upward two-note shimmer; trash side gets a soft lower descending two-note wood-and-brass tone. Equal loudness and duration, under 260 ms, no judgemental or alarming feeling.

## Phase banners and bonding activities

### New phase banner

> A brief intimate transition cue: soft fabric sweep, one breath of airy shimmer, then two clear notes that resolve gently. 650 ms, cinematic enough to mark a chapter change but quiet enough under conversation. No spoken announcement.

### Activity begins

> A single inviting bell-like pair with a soft felt mallet attack and a little room bloom. 300 ms, curious and low-pressure, no countdown or competitive alarm.

### Gentle choice confirmation

> Small fingertip touch on thick paper followed by a tiny celesta note. 100 ms, warm and light; use very low loudness for frequent taps.

### Shared-answer reveal

> Two quiet notes approach and meet in a warm consonant chord, with a short airy shimmer. 500 ms, intimate shared discovery, no victory fanfare.

### Kiss pucker / send / catch

> A soft visual-kiss punctuation: tiny inhaled air pull, gentle lip-pop kiss sound, and a velvet-smooth outward whoosh as the kiss travels. Keep it sweet and non-explicit, 500 ms. Create separate send and catch versions; the catch ends with a warm heart-like two-note sparkle. No cartoon smooch, no voice.

### Finale heart ticker

> One soft heartbeat-like felt thump paired with a tiny crystal tick, designed to repeat once for each heart without becoming tiring. 100 ms per count. Also provide a quiet rising five-count flourish and a resolved final chord for the total score.

## Arcade actions

### My One and Only! — card play / draw / match / hand win

> Card play: quick felt slide, soft paper landing, bright tiny confirmation. Card draw: one card slips from the deck and lands softly. Match: a warm paired chime. Hand win: a short four-note romantic resolution with subtle brass sparkle, no loud arcade fanfare. Keep the common action cue reusable and each result distinct.

### Catch My Heart — ask / book / go-fish / finish

> Ask: one gentle paper-card tap. Successful match/book: two soft card slides into a neat stack, ending in a warm rising note. Go Fish: a card is drawn with a quiet flutter and a slightly lower neutral chime. Game finish: a brief affectionate resolution, not a competitive celebration.

### Say Without Saying — camera / recording / send / correct guess

> Record start: a clear soft red-light click with a faint steady airy pulse only while recording. Stop: gentle button click and pulse release. Send: short envelope-like paper sweep. Correct guess: bright, quick two-note sparkle. Permission or upload issue: neutral low cue with no alarm quality. Never cover speech with SFX.

### Radar Love — sweep / miss / hit / ship sinks

> Sonar sweep: quiet rounded ping with a smooth filtered tail, one pass only. Miss: soft distant hollow water ping. Hit: closer bright sonar ping plus a restrained low impact. Ship sunk: a slow wooden creak and muffled underwater descent followed by a small confirmed sonar note. Keep all effects short, readable, and non-military; no explosions or battle alarm.

### Four Ever — piece drop / connect / win

> Token drop: a flat polished wooden disc falls through a short column, taps the frame once, then lands in a padded slot with a satisfying low click. Connect: four soft ascending notes, one per aligned piece, ending in a warm chord. Draw: gentle neutral two-note resolution. No casino sounds.

### Our Little Pieces — open box / rotate / place / solve

> Keepsake box opens with a small brass latch, wood hinge, and soft velvet release. Rotate: tiny fingertip/wood scrape, under 100 ms. Piece placed correctly: paper tile slides into a snug slot with a crisp but soft click and a miniature bright chime. Puzzle solved: short warm rising phrase with a delicate paper shimmer, 1.2 seconds maximum.

### Love in the Blanks / Our Next Line

> Word or answer added: muted paper letter placed on a page. Shared line revealed: page turn and soft resolving chord. Keep the page noises delicate and do not add typewriter clacks unless a specific visual uses a typewriter.

## Mix review checklist

1. Check every cue on phone speakers at low volume and over the quietest music bed.
2. Verify repeated dice and heart-count cues do not become piercing or tiring.
3. Check that the flush reads as a playful, visible consequence without humiliating either player.
4. Confirm microphone recording is never masked by game audio; pause or duck music and SFX before capture.
5. Check mono playback, reduced-motion mode, mute controls, and cleanup of audio nodes after modal close.
6. Keep one source master and approved web copy; do not replace synthesized hooks until the generated cues are auditioned in the actual game.
