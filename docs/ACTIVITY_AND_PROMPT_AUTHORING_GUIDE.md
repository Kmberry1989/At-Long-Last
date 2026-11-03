# At Long Last Gameplay, Activity, and Visual Guide

This guide explains how At Long Last nights work and how to add activities, question banks, and answer choices that make partners feel understood rather than examined. The guiding rule is simple: a good prompt invites a warm, low-pressure moment. It never treats a partner's guess as proof of love, attention, or compatibility.

It is also the shared product reference for the current gameplay and presentation decisions. Treat the rules below as design direction; verify implementation in the code before describing a feature as shipped.

## What players are trying to do

At Long Last is a cooperative date-night game for two connected players. The goal is to make a night together, collect moments for the shared scrapbook, and earn shared hearts that can be used for keepsakes. It is not a compatibility test, a quiz with a correct partner, or a competition to know the other person best.

Players can move through their own turns independently. A player rolls two dice, adds their values, and advances their own piece around the 20-space board. A landing can create a personal activity, a keepsake to collect, or no additional card. The night also creates a paired duel for a round. Work that does not need a partner should not make the other player wait.

Answers and guesses can remain private while each player progresses. Comparison moments are collected for the end of the night, when both players have time to look at them together. Each player can open and acknowledge the finale at their own pace. The final scrapbook entry is shared. Hearts are a shared resource and rewards belong to the night; never award or remove hearts for being right, choosing the same answer, sharing a personal detail, or accepting affection.

The current Quick preset uses eight roll rounds. Each round has a roll slot for each player and one paired duel slot. The game is ready for its end-of-night reveal when both players have completed their roll slots and every paired duel is ready. A future preset can use a different round count, so author content against the session and registry data rather than hard-coding eight.

## The night from a player's point of view

1. The player touches or swipes the board dice. The gesture shapes the tumble; the saved roll, not the gesture's direction, determines the random dice result.
2. The piece moves space by space. Each landing is a small beat with its own sound.
3. The game offers any action attached to that landing. The player can answer privately, collect a keepsake, or pass when the card allows it.
4. The player continues when their own next action does not require their partner. Paired work records each person's contribution independently.
5. At the end, the game gathers comparisons, duel results, keepsakes, and other moments for the shared reveal and scrapbook.

Do not add a step that asks a player to wait for a partner unless the mechanic genuinely needs synchronized input. A synchronized reveal may happen later; input collection should remain independent whenever it can.

## Activity families already in the game

The activity registry combines the original content pack with several newer families. A new activity should fit one of these jobs or explain why it needs a new interaction family.

| Family | Current examples | What makes it work |
| --- | --- | --- |
| Independent reflection | comfort menu, weather report, growth ring, anchor memory, gratitude snapshot | A player can answer for themselves, privately, without predicting the partner. Keep the response short and kind. |
| Sealed comparison | Mind Meld, The Prediction Box, Same Wavelength, Mutual Yes | Choices or answers are sealed separately and compared later. A mismatch is an invitation to learn, never a failed score. |
| Connection choices | Vibe Check and the multiple-choice connection prompts | Each player makes an honest selection. The reveal can show overlap or difference without declaring either wrong. |
| Creative play | Blind Canvas, Doodle Duel, Word Weaver, photo prompts, story and caption cards | The play itself is the answer. Let players create at their own pace; do not require a partner to predict an exact sentence or image. |
| Paired microgames | rhythm/tapping, mazes, resonance, Bluff Bidding, Wavelength | A clear, short mechanic produces a result that can be saved per player. Explain input visually and keep the time limit humane. |
| Keepsakes and vaults | mystery card collection, The Vault, Pinky Swears | These create a saved object or note. Promise cards must be randomly dealt from their deck, not selected from a menu. |
| Paired duels | Constellation and other round-based duels | Both players can submit separately; the round resolves only when the protocol says it is ready. Avoid making a private reflection a speed contest. |

Before adding a new family, decide whether the moment is an activity or a duel. Activities attach to a player's landing and may be private. A duel is paired by round and is answered by both players. A keepsake is a collection action. Do not make the UI pretend that a step is shared if the data model stores it for one owner.

## Multiple choice for prediction and comparison

Open text is valuable when someone is sharing their own thought. It is a poor default for a partner-prediction task. Asking one person to guess the exact free-text answer their partner will type makes a tender game feel like a test: the guesser can feel exposed, and the answerer can feel misunderstood when wording differs.

For prompts such as Mind Meld, The Prediction Box, and Same Wavelength, use a short list of answer choices. Both players should see the same prompt and the same choices, but the UI should not reveal the other person's selection before the reveal. Store a stable choice ID, not only the displayed label. On reveal, show the choices side by side and describe overlap neutrally. Never use "wrong," "missed," "you should know," or a compatibility percentage.

Recommended choice design:

- Use four choices as the normal pattern. Two can feel like a forced binary; more than five slows a phone-sized interaction.
- Make every choice plausible, emotionally safe, and distinct in meaning. Do not pad a set with jokes that are obviously less appealing than the intended answer.
- Vary the *kind* of answer within a set. A comfort question might distinguish listening, practical help, humor, and space; it should not offer four differently worded versions of a hug.
- Keep labels concise enough to scan, but specific enough to imagine. Avoid vague filler such as "something nice," "whatever," or repeated "spend time together."
- Avoid choices that assume money, travel, sex, marriage, children, a particular home, a particular gender role, or a shared memory that every couple may not have.
- For needs and affection, include a clear low-pressure choice such as "quiet company" or "not tonight" when appropriate. A separate Skip control must always remain available for a skippable activity.
- Make choices about the player's own preference, not a diagnosis of the partner. Ask "What would feel good to you?" before asking another player to predict it.
- Keep a mismatch warm: "You chose different kinds of comfort. Want to hear what each of you meant?" Do not score the difference as failure.

### A safer prediction interaction

For a two-person guess activity, the answerer first chooses privately. The guesser then makes one selection from the same options without seeing that answer. Both entries are saved independently. At the finale, show the guess beside the answer. If they match, celebrate the shared read lightly. If they differ, invite a short explanation only if both want it. Do not require the answerer to justify their preference or the guesser to apologize.

For a Mind Meld style activity, both players choose privately from the same list. The result can be "same choice" or "different choices," but the game should emphasize the reveal itself rather than awarding a winner. If the choice set is nuanced, showing the actual labels matters more than a binary match badge.

Open-text prompts can remain for personal reflections, letters, captions, and creative play. Make them optional, bounded, or scaffolded. A player can answer in a phrase, choose a starter, or pass. Do not ask a partner to predict an exact open-text response.

## A prompt and choice library to build from

These are examples of the intended breadth and answer quality. They are not mandatory exact wording. Keep each prompt tied to one clear moment, and make answer choices meaningfully different.

### Comfort and care

**After a long day, what would feel kindest first?**

- Let me tell the whole story
- Sit beside me without fixing it
- Help me with one practical thing
- Make me laugh, then check in

**When I go quiet, which first move usually helps?**

- Ask if I want company
- Give me a little room, then return
- Offer a simple choice: talk, snack, or rest
- Keep things ordinary until I open up

**What kind of encouragement would land today?**

- Remind me what I handled well
- Tell me you believe in me
- Help me take the first small step
- Distract me with something gentle

### A shared evening

**We find an unexpected free hour. What sounds best right now?**

- Walk somewhere familiar
- Make a snack and stay in
- Try one new place nearby
- Put on music and do nothing planned

**What should the next date feel like?**

- Cozy and unhurried
- Playful with a little surprise
- Outside and moving
- Dressed up for a change

**Choose the small luxury for tonight.**

- Someone else chooses the food
- A room with soft light and no rush
- A favorite treat saved for us
- An hour without phones or errands

### Being known without being tested

**Which ordinary moment of ours would you keep in a little frame?**

- Laughing at something nobody else noticed
- A quiet ride with the right song on
- Making a meal from whatever we had
- The first few minutes after seeing each other again

**What detail makes a place feel like ours?**

- The light at a certain time of day
- A familiar sound in the background
- Something we made or found together
- Knowing the other person is nearby

**Which kind of message would brighten an ordinary day?**

- "I saved you the good one."
- "I noticed how hard you worked."
- "Want a tiny adventure later?"
- "No need to answer now. I'm thinking of you."

### Looking forward

**Pick a tiny tradition for the next month.**

- A weekly walk with no destination
- A shared breakfast when schedules allow
- One song sent to each other each week
- A small end-of-day check-in

**What would make a future weekend feel restorative?**

- One plan and lots of open time
- A new place with a loose itinerary
- Staying home and finishing nothing
- Seeing people we miss, then coming back to quiet

**Choose an object for our next time capsule.**

- A note from an ordinary Tuesday
- A photo that needs its full story
- A ticket, wrapper, or tiny receipt
- A song title and the reason it mattered

### Play and imagination

**Our imaginary couple café is known for…**

- Comfort food served after closing
- Desserts with ridiculous names
- A quiet corner full of books
- A playlist customers ask to keep

**A tiny museum about us needs one exhibit first.**

- The object that keeps getting passed between us
- A photo from a day that went off-plan
- The phrase that makes us both laugh
- The small ritual we would miss if it vanished

**If tonight had an end-credit sequence, what would play over it?**

- A soft piano theme
- An overconfident dance song
- A warm instrumental with strings
- The real room sounds and our laughter

### Affection and consent

**What kind of affection would feel welcome right now?**

- A long hug
- Sitting close, no pressure to talk
- A hand squeeze or shoulder touch
- No touch right now; just stay kind

**Pick a low-pressure way to reconnect this week.**

- Share a favorite song
- Take a short walk
- Send a note with no reply required
- Make time for a quiet meal

Questions about intimacy must preserve a genuine no. Never phrase "not tonight" as rejection, a penalty, or a joke. Do not ask players to disclose trauma, secrets, medical information, or conflict details as a condition of play.

## Making a larger question bank

Grow the library in small, curated batches. Each new item should add a new angle, not merely swap nouns in an existing prompt. Useful dimensions include:

- present energy: tired, playful, quiet, adventurous, affectionate
- ways of caring: listening, practical help, humor, space, celebration
- shared memory: ordinary rituals, firsts, detours, familiar places, saved objects
- future plans: small traditions, nearby adventures, seasonal rituals, no-cost plans
- imagination: tiny businesses, fictional soundtracks, mascots, museums, rituals
- communication: how to check in, what kind of note helps, how to reconnect gently
- environment: weather, light, music, food, textures, sounds, places to rest

Avoid repeating the same answer pool across unrelated prompts. Reuse a choice only when it is a deliberate, understandable category. "A hug / listen / space / practical help" belongs to comfort. It should not become the default answer pool for date planning, memory, compliments, and every other topic.

Write options from the same point of view and at a similar level of specificity. A question about a specific evening should not mix a mood ("cozy") with an action ("book a weekend away"), an expense ("buy concert tickets"), and a vague answer ("anything"). Make the options comparable while still distinct.

### Suggested bank format

Each question needs:

- a stable ID that is never reused for different content
- one short prompt with a single interpretation
- four distinct answer objects with stable IDs and readable labels
- an optional category and tone tag for curation
- an optional follow-up that is an invitation, not a required second answer
- a content note if the prompt needs a specific consent or safety treatment

For example:

```js
{
  id: 'care-first-move-01',
  prompt: 'After a long day, what would feel kindest first?',
  options: [
    { id: 'tell-story', label: 'Let me tell the whole story' },
    { id: 'quiet-company', label: 'Sit beside me without fixing it' },
    { id: 'practical-help', label: 'Help me with one practical thing' },
    { id: 'gentle-humor', label: 'Make me laugh, then check in' },
  ],
  category: 'care',
  tone: 'tender',
}
```

Do not store player answer text in the prompt bank. Store answer IDs in the game state and resolve labels from the versioned content definition when rendering or building the journal. If an answer bank changes later, old entries must still render correctly. Keep prompt IDs stable and retain old labels or a content version when changing wording could change the meaning of a saved answer.

## Writing and reviewing an activity

Before implementation, write a one-sentence activity brief:

> Players do **[one clear action]** privately or together, then **[one concrete reveal/result]**. It takes about **[time]**, requires **[partner dependency]**, and can be skipped by **[method]**.

Then answer these questions:

1. What is the player's objective in one sentence?
2. Can each player's input be collected independently?
3. What exact information is private until the reveal?
4. What does a mismatch mean in plain language? It should mean only "different answers."
5. Is there a pass or skip path that does not punish either player?
6. Can it be completed on a phone with one hand and without typing a paragraph?
7. Does it still work if a player reloads, leaves, or returns later?
8. What exact artifact will the scrapbook preserve?
9. Does the mechanic require new Firestore fields, rules, or transaction behavior?
10. Can reduced motion, sound-off, and assistive technology users complete it?

Keep the on-screen instruction short: one action, one progress cue, one outcome. Teach complex mechanics with the interaction itself and brief visual feedback. Never leave an activity on a timer that auto-submits a private answer. Timers may add play to a voluntary mini-game, but saving should be explicit and the player should be able to pass.

## Implementation map

Use these current files as the entry points. Confirm their current contents before editing because activity families continue to evolve.

- `src/features/session/activityRegistry.jsx` assembles the live activity registry and base entry behavior.
- `src/features/session/contentPackData.js` combines the original content pack with newer activity definitions.
- `at-long-last-content-pack-v2/activityRegistry.ts` contains the original activity catalogue.
- `src/features/session/connectionGameData.js` contains Mind Meld, Prediction Box, Vault, and connection-game prompts.
- `src/features/session/nightQuestionBank.js` contains shared multiple-choice questions and vault additions.
- `src/features/session/sealedActivityData.js` contains sealed comparison and Mutual Yes prompt decks.
- `src/features/session/sealedActivityRegistry.jsx` owns sealed choice storage, mutual-consent outcomes, reveals, and acknowledgments.
- `src/features/session/waveTwoGameData.js`, `waveThreeGameData.js`, and `waveFourGameData.js` contain the later activity-family data.
- `src/features/session/expandedPromptData.js`, `activityPromptExpansion.js`, and `moreNightPrompts.js` add rotated prompt variants.
- `src/features/session/independentNight.js` owns the independent round slots, personal progression, deferred comparison readiness, and finale settlement.
- `firestore.rules` and `src/features/session/independentNightService.js` define the persistence boundary. Treat a schema or security-rule change as a coordinated feature, not a content-only edit.

Most additions need focused tests in the corresponding `*.test.js` or `*.test.jsx` file. Test prompt selection, deterministic option IDs, private-before-reveal behavior, independent submissions, retries/reloads, pass behavior, journal output, and a mismatch. For security-sensitive sealed choices, use the Firestore emulator and authenticated two-player flow; a component test cannot prove that the partner cannot read a private answer.

## Content review checklist

- The prompt is one question, not several bundled questions.
- The player knows whether they are answering for themselves or predicting the partner.
- A prediction never requires guessing open-ended prose.
- Choices are distinct, balanced, concrete, and not recycled by habit.
- A mismatch is safe and has no compatibility score or penalty.
- Every sensitive prompt has a real pass and consent path.
- Text entry is optional and appropriately short.
- Content fits the selected tone and does not assume a particular relationship structure or life situation.
- Stable IDs and old saved journal entries remain understandable.
- Both players can move on independently whenever the partner is not required.
- The reveal waits until the intended end-of-night point and never leaks the other player's answer early.

## Board and interaction direction

Keep the active board legible at a glance. Player portraits belong in the upper-left and upper-right corners, large enough to read as the two players' pieces. The Trade action sits at the top center. The always-visible HUD should stay minimal: omit the center/recenter controller and decorative counters for hearts, rolls, and matches. Put a control on the board only when a player needs it there.

Trade is an offer with mutual consent. A player can offer a keepsake they own; the other player sees only that specific offered keepsake and may accept or pass. Never show the partner's unoffered collection or let a player browse it to build an offer. Keep the sheet spare: the title, the offered card, and Offer / Accept / Pass are enough. Avoid negotiation copy, optional notes, quick-reply tags, counts, and paragraphs. A pending offer can be canceled by its sender.

The board stays circular in both the route and the dice home base. Tiles float gently out of sync, dip under a player's piece, and pulse light from below. The dice home base is a round vessel with a real bottom and fabric liner; it floats slightly higher than the tiles and casts a soft shadow across its full footprint. Give the liner a complementary theme accent. Keep the skybox panoramic around the board, with atmospheric particles between sky and board. Slow idle camera orbit and keep the spaces themselves still on the circle.

Player portraits use their Google photo as the focal point, large in the corner with a gentle animated aura behind them. Portrait frames are vector-drawn overlays, not generated photos or textures. Refine them as restrained engraved metalwork with clear photo area and a delicate edge; avoid oversized curls, stickers, dense decoration, and novelty effects. Frame selection cards should use the same quiet heirloom finish. The Trade control should share the board's dark glass and fine-gold edge language.

The outer board wall should read as woven or embroidered trim, not a row of object pictograms. Use a consistent fine-line ornamental vocabulary, low contrast, and theme-specific fabric and color. Keep symbols small and sparse so the ring does not look like signage.

### Centerpiece model references

Centerpiece props are optional theme accents beside the dice home base, not replacements for the dice or board spaces. Keep each model compact, stable on a small base, visible from the normal camera angle, and clear of dice-touch input and player paths. Treat concept art as a modeling reference, not a finished game asset; validate silhouette, scale, material readability, shadow, and collision in the actual board scene before adding it.

The current nine-theme concept list is:

![Nine themed center-prop concept references in a 3 by 3 sheet](../output/imagegen/board-centerpiece-theme-reference-sheet.png)

| Board theme | Centerpiece direction |
| --- | --- |
| Cozy night in | Porcelain tea set, folded letter, and a small brass candle |
| Secret garden | Glass cloche terrarium with moss and one unopened flower bud |
| Seaside date | Tide-pool glass orb with shells and wave carving |
| City date night | Compact art-deco gramophone with a tiny skyline relief |
| Holiday sparkle | Small snow globe with an evergreen and warm cottage lights |
| Starlit Rooftop | Brass celestial orrery with delicate orbital rings |
| Autumn Embers | Copper lantern with an oak leaf and ember glass |
| Cherry Blossom | Pale ceramic ikebana vase with one flowering branch |
| Aurora Veil | Crystal prism with translucent teal-violet aurora ribbons |

Keep the prop hidden until its concept is reviewed. The earlier request to hide props remains the implementation default; new centerpiece ideas are references to develop and test one theme at a time.

### Experimental turn-card ideas

The board card deck has two content families: **Trash** cards turn everyday hassles into setbacks; **Treasures** celebrate affectionate details, ordinary joys, and relationship milestones. Each roll draws one private moment card into that player's turn. The partner can keep taking their own turn while it is unanswered. The card sets direction: Trash moves backward and Treasure moves forward. Reuse the lower of the two movement dice as the exact effect strength: 1 moves one space, 2 moves two, and so on through 6 moving six spaces. This changes board progress only; moment cards never remove shared hearts. Resolve the card with one tap; no response choices should offer a smaller reward. The card and its movement effect are saved for the night's recap. The board marks the draw and resolved piles with circular dotted outlines. Print their short identifiers flush into the board fabric, never as camera-facing floating plaques. Tint the Trash / Treasures draw marker with a darker shade of the active theme's card accent and the discard marker with a lighter shade of that same accent. Card backs use paired line-art emblems: a trash mark for Trash and a faceted gem with a glint for Treasures. Keep both markers inside the round inset, clear of the dice home base, and apply the palette and emblem style to all base and remix themes.

Moment cards are a short required part of the drawing player's own turn and never gate their partner's progress. Give each a short, memorable title, one specific everyday or milestone scene, and an effect label that clearly connects the title to its movement. Trash always causes a setback; Treasure always advances the player. Do not make heart or health totals the penalty/reward, and do not ask players to choose between unequal rewards. Discard after resolution and include the card and movement in the end-of-night scrapbook recap.

The initial authored library lives in `src/features/session/momentCards.js` and contains 12 Trash and 12 Treasure cards. Preserve those rules when expanding it: one distinct scene and named effect, Trash moves backward, Treasure moves forward, the lower-die face directly sets movement from one to six spaces, and effects do not change shared hearts.

Each moment card has its own square, painterly still-life illustration in `public/assets/moment-cards/`, displayed as a cropped card image. Keep the shared rose, ivory, plum, and amber palette and readable object-centered composition. Prefer objects and settings; do not add people or characters. Never put card title, time, or other copy inside the generated artwork. Keep scene titles timeless; for example, use “Dinner Runs Late” rather than a specific clock time.

The individual nightly prize goes to the first player to complete a full circuit of the 20-space board. If neither completes a circuit, the player with the most net progress wins. A perfect progress tie goes to the round's starting player. Keep this race separate from cooperative hearts and shared activity rewards.

Start with low-stakes effects that reward participation rather than correctness: a small shared-heart bonus for completing the turn, a keepsake reroll/pass that never removes an earned item, or a gentle prompt swap that preserves the same activity type. Avoid penalties, forced disclosure, take-that effects, streak loss, or rules that make one player's progress depend on the other's availability. Keep variants behind a small experimental deck so their pacing can be compared before making one permanent.

## Current screen review checklist

- Can each player identify their own portrait and their partner's without reading labels?
- Does the board remain a circle on a phone-sized viewport, with every control inside the screen?
- Are portraits, Trade, dice, and spaces distinct in scale and contrast?
- Does a trade expose only the keepsake that was explicitly offered?
- Is every trade transfer accepted by the recipient, with a pass path and sender cancellation?
- Does decorative motion stay subtle, honor reduced-motion preferences, and avoid obscuring dice input?
- Do theme colors and textures carry most of the theme, while shared iconography stays coherent?
- Are unmodeled centerpiece concepts kept out of the production board until a real model has been reviewed at board scale?

## Consolidated product direction

This section gathers the cross-screen requests that shape future work. It is a design reference, not a claim that every visual effect or interaction is already implemented.

### Pacing, turns, and the finale

- Keep each player's progress independent whenever the next action does not require the partner. Paired activities collect input separately and resolve only when their actual dependency is met.
- Do not make a player wait on a partner just to continue their own landing or reflection. The shared end-of-night reveal is the intended place to gather comparison moments.
- Preserve both answers until the reveal. At the end of the night, collect comparisons and saved moments into a clear shared recap and scrapbook entry.
- Count shared hearts visibly at the finale, one point at a time, with a soft cue for each point and an optional flourish such as hearts arriving into the total. Keep the count readable and let the celebration finish before presenting the saved keepsake.
- Pinky Swears are drawn randomly from their authored deck. Players should not browse and select the promise they are meant to receive.

### Activity and content quality

- Prefer multiple choice for prediction and comparison. Reserve open text for personal reflection or creative work where the player is expressing their own answer.
- Make answer sets varied and specific to the prompt. Do not reuse a generic pool of answers where some options do not fit the question.
- Never turn a different answer, a missed prediction, a pass, or a declined affectionate option into a penalty or compatibility score.
- Keep the on-screen copy sparse: one clear action and only the context a player needs to complete it. Do not add explanatory paragraphs to activity screens when the interaction can teach itself.

### Board, art, and screen flow

- Keep the board and dice base circular; avoid oval silhouettes that clash with the round ring. Keep board spaces in a round path and allow gentle, slightly unsynchronized bobbing, a weighted dip while a piece rests on a space, and a soft pulsing underglow.
- Give dice a circular open vessel with a visible bottom and a complementary fabric liner. Float it slightly higher than spaces and cast a coherent shadow beneath the entire vessel.
- The theme skybox should wrap panoramically around the board. A restrained particle layer belongs between the sky and board. Idle camera orbit should be slow enough not to distract from play.
- Let pieces travel space by space after a roll, with a light landing cue for each step. Dice should respond directly to the player's tap or swipe; avoid a separate single-action roll button and avoid showing a second, competing dice control away from the board.
- Keep the player portraits large and separate in the upper corners, using the actual Google profile photos as the focal point. Use quiet, carefully proportioned frame overlays and a restrained glow or particle treatment behind them. Avoid oversized frame art and full-name labels.
- Keep the board HUD compact and consistent. Trade sits between the portraits near the top; remove controls and counters that do not help the current action. Give controls a repeatable color pattern, coherent symbol scale, and clear number outlines when they show counts.
- Build a coherent set of branded vector marks for recurring game actions and themes. Replace stray emoji, generic symbols, and mismatched icon styles; use icon-only controls when the meaning is clear, with accessible labels for assistive technology. Give every tappable control a deliberate pressed state as well as its selected and idle states.
- Trade exposes only the keepsake deliberately offered. Acceptance or passing is explicit; the sender can cancel a pending offer. Keep the trade sheet short and uncluttered.
- Use subtle visual and sound transitions when the night changes phase, with a short phase banner rather than lengthy instructions. Motion should be smooth, respect reduced-motion settings, and not obstruct touch input.
- Make the lobby feel like a welcoming splash: a brief logo reveal from black, a centered couple portrait composition, a quiet branded centerpiece illustration, and a softly animated background with restrained glow or rising sparkle. Use direct crossfades between portrait/background images rather than fading through blankness.
- Design every active screen to fit a phone viewport where practical, avoid unnecessary scrolling, and keep the important action centered and legible even when the browser has its address bar visible or the user zooms out.
- When reviewing a layout change, capture a local screenshot so the actual composition can be reviewed before moving to another screen.

### Theme, sound, and Our Bloom

- Give each board theme a related panoramic background and fabric surface, with a consistent level of finish across themes. Use 2D embroidered or etched overlays for theme character; keep 3D props hidden until each real model has been reviewed in the board scene.
- Dice should be highly legible against every theme and may use a theme-specific skin. Their rolling sound should feel tactile and varied, with several randomized soft impacts during a tumble rather than one repetitive click.
- Layer the soundtrack thoughtfully: gentle low drum accents in main menus, swelling ambient pads on selected screens, occasional music-box piano notes, and dynamic pizzicato or sustained strings. Give melodies enough measures and note variation to avoid a short obvious loop.
- Our Bloom is intended to be a procedural, animated 3D flower that grows into a larger-scale plant. Keep its identity mysterious until the player picks it at full bloom; use the selected name, a real-flower collection, sequential growth, and automatic next seed. Review the plant at board scale so it reads as a centerpiece rather than a tiny token.
- Consider further 3D centerpiece props only as optional accents near the dice area. The included concept sheet gives starting silhouettes; each prop still needs to be modeled, sized, lit, and checked against touch paths before it is enabled.
