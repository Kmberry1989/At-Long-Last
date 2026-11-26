// expandedBoardPrompts.js — direct expansion prompts for non-bank board activities
// At Long Last — Expanded Edition (Nov 26, 2026)
// ADDITIVE ONLY: this file adds new content. It does not delete or rewrite
// any existing prompt. Merge with the existing registry via the helpers in
// expandedActivityRegistry.js / index.js. See README_EXPANDED_IMPLEMENTATION.md.
// Guardrails: no explicit content, no scoring/leaderboards, no therapy,
// no new moods, no lifetime-scale prompts. Every new prompt is small,
// recent, and specific. Spicy stays at tiny, specific, opt-in closeness.


export const EXPANSION_BANK_BY_ACTIVITY = {
  "mind-meld": "mind-meld",
  "prediction-box": "prediction-box",
  "vibe-check": "vibe-check",
  "tempo-tap": "tempo-tap",
  "word-weaver": "word-weaver",
  "dual-axis-maze": "dual-axis-maze",
  "blind-canvas": "blind-canvas",
  "bluff-bidding": "bluff-bidding",
  "same-wavelength": "same-wavelength",
  "mutual-yes": "mutual-yes",
  "the-vault": "vault",
  "harmonic-lock": "harmonic-lock",
  "photo-flashback": "photo-flashback"
};

// For the 13 bank-driven activities above, the expansion lives in expandedBanks.js
// (Mind Meld +12, Prediction Box +12, etc.) — not duplicated here.
// Every other board activity gets exactly 4 new prompts below.

export const EXPANDED_BOARD_PROMPTS = {
  "comfort-menu": [
    "When I'm overstimulated by noise, people, or screens, the most helpful reset is…",
    "What does comfort look like when you're sick — not sad, just physically wiped out?",
    "If I could only remember one sentence from your comfort menu on a bad day, what should it be?",
    "Design a comfort menu for *us* as a team on a day when we're both running on empty."
],
  "small-mercies": [
    "What is a tiny thing I did today that made your day 2% easier?",
    "Which of my boring, invisible tasks do you secretly appreciate?",
    "Name a kindness I offered that I didn't even realize was kind.",
    "What small mercy do you want to offer *yourself* this week, and how can I help?"
],
  "weather-report": [
    "If your weather had a wind speed today, what is pushing you around?",
    "What is one small thing that would be like sun breaking through for an hour?",
    "Describe our *shared* weather today — are we in the same system or different ones?",
    "What forecast do you want for us tomorrow, even if today was overcast?"
],
  "receipts": [
    "Find a photo where we both look tired but happy. What were we tired *from*?",
    "Find the most boring photo that still makes you smile. Why is it still on your phone?",
    "Find a photo you took *for* me but never sent. What stopped you?",
    "Choose a photo from before we met that explains something about you now."
],
  "future-artifact": [
    "What object from *this week* deserves to go in the box, even though it seems too small?",
    "If future-us opened the box on a hard day, which object should be on top?",
    "Design an artifact for a milestone we haven't named yet — what would it celebrate?",
    "What object would you *remove* from the box because we've outgrown what it meant?"
],
  "postcard-next-year": [
    "Write a postcard from a version of us who handled a hard thing well. What did we learn?",
    "Leave future-us one permission slip: what are we allowed to stop doing?",
    "What ordinary Tuesday do you hope still exists in a year?",
    "Write a 2-sentence toast for the *ordinary* version of us a year from now, not the milestone version."
],
  "translation": [
    "How do you say “I'm proud of you” without using those words?",
    "What does “I need a minute” mean in your language — 5 minutes, an hour, or just a breath?",
    "Translate this for me: when I say “whatever you want,” what am I actually hoping you'll do?",
    "What is one phrase of mine you wish I would retire because it lands wrong?"
],
  "map-pin-wish": [
    "Drop a pin where you'd go if you had one hour, no phone, and each other.",
    "Place a pin for a place that *only* makes sense to us — no tourist would go there.",
    "Where would you put a pin for “the place we argue best and repair fastest”?",
    "Choose a pin for a place you want to *return* to, but as different people than last time."
],
  "director-commentary": [
    "Give the blooper reel from our week a title and one scene that must stay in.",
    "If our relationship had a soundtrack cue for “they finally get it,” when would it play?",
    "Describe the scene where we *almost* missed each other. What saved it?",
    "What would the director's commentary say about a moment we thought was boring at the time?"
],
  "house-rules": [
    "Invent a house rule for what happens when one of us is grumpy and the other is not.",
    "What is the official policy for the “good” snack that is secretly for both of us?",
    "Write a house rule for phones at the table that we'd actually keep.",
    "Our house has a room that doesn't exist yet. What is its one rule?"
],
  "growth-ring": [
    "What is something we used to argue about that we now handle with a shorthand?",
    "Name a small habit we built that future-us will thank us for.",
    "What would earlier-us be surprised to learn we can do now?",
    "Which growth are you proudest of that no one outside us would notice?"
],
  "anchor-memory": [
    "What is an anchor memory that is only 10 seconds long but still steadies you?",
    "Describe an anchor memory from *this month* — not years ago — that already feels safe.",
    "What anchor memory would you lend me on a day when I need one?",
    "If we could bottle one anchor memory as a scent or sound, which one?"
],
  "unsent-draft": [
    "What is a draft you wrote in your head while falling asleep last night?",
    "Share a draft that is just an emoji + 3 words. What did it mean?",
    "What is a message you *did* send that you wish you'd worded more gently?",
    "Write the draft you'd send if you knew I'd reply “tell me more.”"
],
  "gratitude-snapshot": [
    "Photograph the thing you're about to do next and caption it with why it made you think of me.",
    "Show me the view you wish I could see *right now*, not a beautiful view — your real one.",
    "Photograph something you touched today that reminded you of us.",
    "Take a photo of an empty chair and tell me who should be in it."
],
  "shared-seed": [
    "What is one seed we planted that is already sprouting, even if it's tiny?",
    "Name our plant. What does it need this week — more sun, more water, or just to be left alone?",
    "What would our garden look like if we only grew things that make us laugh?",
    "Design a seed for a habit we want to grow *for someone else*, not just us."
],
  "rose-thorn-seed": [
    "Rose: one thing you did for us. Thorn: one thing that felt heavy. Seed: one thing you want to try.",
    "What is our *shared* rose, thorn, and seed — not yours or mine, but ours?",
    "Give this *day* a rose, thorn, and seed in 9 words total.",
    "What seed from last time actually grew? Name it before planting a new one."
],
  "ordinary-treasure": [
    "Which ordinary Tuesday from this month would you put in a treasure box?",
    "What is a treasured sound from our home that a stranger would ignore?",
    "Name a treasured *smell* from an ordinary day together.",
    "What ordinary treasure do you think *I* would pick? Were you right?"
],
  "invisible-backpack": [
    "What is one thing in your backpack that you didn't choose to carry?",
    "If we could set down one backpack item together for a week, which one?",
    "What is a small, invisible task I do that you don't realize I carry?",
    "Describe what your backpack feels like today — heavy, lopsided, zipped shut, overflowing?"
],
  "gentle-signal": [
    "Invent a signal for “I'm not upset with you, I'm just tired.”",
    "What signal means “I need a hug but I can't ask for one out loud”?",
    "Create a signal for “This conversation matters, can we finish it tomorrow?”",
    "What is a signal *I* use that you wish I'd explain better?"
],
  "five-minute-tradition": [
    "Design a 5-minute tradition for the moment we both walk in the door.",
    "Invent a tradition that is just a sentence we say to each other every night.",
    "What 5-minute tradition would our future selves thank us for starting now?",
    "Create a tradition that involves *doing nothing* together for 5 minutes."
],
  "museum-of-us": [
    "What belongs in the museum's “We Almost Gave Up But Didn't” wing?",
    "Write a label for a *sound* in our museum — how would visitors hear it?",
    "Design an exhibit about a meal we shared that no one else would understand.",
    "What would the museum's closing exhibit be called, and what would it contain?"
],
  // the-vault: expansion in bank 'vault' — see expandedBanks.js
  "the-vault": [],
  // harmonic-lock: expansion in bank 'harmonic-lock' — see expandedBanks.js
  "harmonic-lock": [],
  // photo-flashback: expansion in bank 'photo-flashback' — see expandedBanks.js
  "photo-flashback": [],
  "cursed-date-12": [
    "Plan a date using only things you can carry in one tote bag.",
    "You have $5, a library card, and a sunset. Plan the date.",
    "Plan a date where every activity must start with the same letter.",
    "Our date is in a waiting room. Make it the best waiting room date ever."
],
  "yelp-review": [
    "Write a 5-star review for your partner as a weather system.",
    "Review our couch as a vacation destination.",
    "Give our group chat a Yelp review (if we had one).",
    "Write a 1-star review for a tiny annoyance that you secretly love."
],
  "build-a-cult": [
    "What is our cult's official snack, and what happens if someone eats the last one?",
    "Invent a cult holiday that we celebrate with no explanation to outsiders.",
    "What is the cult's secret password, and when do we use it?",
    "Design a cult merit badge for a tiny achievement (e.g. “Chose dinner without a 20-minute debate”)."
],
  "lore-drop": [
    "What is the origin story of our most-used emoji or phrase?",
    "Tell the legend of the time we *almost* had a perfect plan.",
    "Invent a prophecy about a future version of us that we haven't met yet.",
    "What ancient artifact in our home holds our most powerful lore?"
],
  "two-truths-one-dream": [
    "Two true things about our first month, one dream detail you wish had happened.",
    "Two real compliments, one dream compliment you wish I'd give you.",
    "Two true fears, one dream superpower that would fix them.",
    "Two places we've been, one place we *will* go — guess which is the promise."
],
  "alternate-job": [
    "What job would your partner have in a cozy video game about our lives?",
    "Give your partner a job at a lighthouse, a bakery, and a time-travel agency. Which fits best?",
    "What would your partner's business card say in a world where kindness is currency?",
    "Assign your partner a job they would *hate* but be hilariously good at."
],
  "apocalypse-role": [
    "The internet is out for a month. Who is in charge of entertainment, and who is in charge of snacks?",
    "We're stuck in an elevator with a stranger. Who talks, who comforts, who finds the snacks?",
    "Our town is overrun by very polite ghosts. Divide the jobs.",
    "We have to run a tiny shop during a snowstorm. Who does what?"
],
  "pet-peeve-love-letter": [
    "Write a love letter to the way we *both* leave things unfinished.",
    "Give our most recurring tiny debate a trophy and a ceremony.",
    "Turn a habit of yours that annoys *you* into a luxury feature.",
    "Write a thank-you note to a pet peeve that taught us something."
],
  "conspiracy-us": [
    "Prove that our first meeting was arranged by a very specific animal, object, or weather event.",
    "What conspiracy connects our best three ordinary evenings?",
    "Our houseplants are spies. What are they reporting, and to whom?",
    "Invent a conspiracy about why we always pick the same side of the couch."
],
  "wikipedia-us": [
    "Write the “Controversies” section (harmless only — e.g. “The Great Blanket Debate of 2024”).",
    "What would our Wikipedia page say in the “See Also” section?",
    "Write a one-sentence “Legacy” for a couple who only existed for one perfect weekend.",
    "Invent a fake citation for a fact only we know is true."
],
  "theme-song": [
    "What is our theme song for *today*, not for all time?",
    "Choose a theme song for our future selves in 10 years.",
    "What song would play if we were the villains in a movie?",
    "Pick a song that sounds like our *quiet* moments, not our loud ones."
],
  "bad-advice": [
    "Give terrible advice for falling asleep when you're both wide awake.",
    "What is the worst possible way to apologize for a tiny mistake?",
    "Advise a couple who can't agree on a movie using only snacks as arguments.",
    "Give terrible advice for keeping a secret surprise from your partner."
],
  "villain-origin": [
    "What would our villain duo's theme song be, and what would it play during?",
    "Invent a villain whose power is making everyone take a nap.",
    "What is our villain lair's snack policy?",
    "Write the villain duo's breakup-and-makeup scene (they always make up)."
],
  "nudge-wars": [
    "Leave an imaginary tiny umbrella on my board for a rainy day. What does the note say?",
    "Design a nudge that is just a color + one word.",
    "Leave a pretend key on my board. What does it unlock?",
    "Invent a nudge for a day when I have *no* energy to play."
],
  "sound-capsule": [
    "Describe the sound of us cooking together — not music, just the kitchen.",
    "What 7-second sound would you leave for me on a morning when I'm already gone?",
    "Describe a sound from your childhood that you want me to hear.",
    "What would our “goodnight sound” be if we had one?"
],
  "wrong-answers-only": [
    "Why are we so good at *not* doing chores? Wrong answers only.",
    "What is our couple superpower? It must be completely useless.",
    "Why did we *really* meet? Wrong answers only, and it must involve an animal.",
    "What do we do when we say “we're going to bed early”? Wrong answers only."
],
  "couple-mascot": [
    "What does our mascot do on a day when we're both tired?",
    "Design a mascot for our *arguments* — what does it look like, and what does it say?",
    "Our mascot is going on vacation. Where does it go, and what postcard does it send?",
    "What is our mascot's favorite snack, and why is it *our* snack?"
],
  "tiny-shark-tank": [
    "Pitch an invention that helps us remember each other's tiny preferences.",
    "Sell us a subscription box for “a better Tuesday.”",
    "Pitch a gadget that makes saying goodbye 3% less sad.",
    "Invent a product for couples who are both tired and both hungry."
],
  "plot-twist": [
    "Retell our first meeting but change one *sound*. Can I spot it?",
    "Tell a real story but swap one person for a celebrity. Who did you swap?",
    "Retell a shared meal but change what we *ordered*. Can I guess?",
    "Give a memory a different *weather*. How does the story change?"
],
  "soundtrack-shuffle": [
    "Build a 3-song soundtrack for a day when we're both working from home.",
    "Pick a song for our morning, a song for our evening, and a song for our dreams.",
    "Make a playlist for a version of us in a different city.",
    "Choose a song that sounds like *you*, a song that sounds like *me*, and a song that sounds like *us*."
],
  "emoji-forecast": [
    "Describe our *last* week in 5 emoji, then decode the one I'd least expect.",
    "Give tomorrow a 5-emoji forecast with one emoji that is a *wish*.",
    "Describe our dream home in 5 emoji. No words.",
    "Send a 5-emoji forecast for a day when we *both* need cheering up."
],
  // mind-meld: expansion in bank 'mind-meld' — see expandedBanks.js
  "mind-meld": [],
  // prediction-box: expansion in bank 'prediction-box' — see expandedBanks.js
  "prediction-box": [],
  // vibe-check: expansion in bank 'vibe-check' — see expandedBanks.js
  "vibe-check": [],
  // tempo-tap: expansion in bank 'tempo-tap' — see expandedBanks.js
  "tempo-tap": [],
  // word-weaver: expansion in bank 'word-weaver' — see expandedBanks.js
  "word-weaver": [],
  // dual-axis-maze: expansion in bank 'dual-axis-maze' — see expandedBanks.js
  "dual-axis-maze": [],
  // blind-canvas: expansion in bank 'blind-canvas' — see expandedBanks.js
  "blind-canvas": [],
  // bluff-bidding: expansion in bank 'bluff-bidding' — see expandedBanks.js
  "bluff-bidding": [],
  // same-wavelength: expansion in bank 'same-wavelength' — see expandedBanks.js
  "same-wavelength": [],
  "replay-favorite-kiss": [
    "Describe a kiss that was funny — we laughed before, during, or after.",
    "What is a kiss you *wish* you could replay, but the moment is gone?",
    "Describe a kiss from a version of us that no longer exists — what would you tell them?",
    "What would a replay of *today's* kiss look like if we filmed it in slow motion?"
],
  "wanted-list": [
    "What is a tiny thing I do that makes you feel like I *chose* you today?",
    "When do you feel most wanted — in a crowd, alone, or in between?",
    "What is a question I ask that makes you feel wanted?",
    "Describe a moment when you felt wanted *without* me saying anything."
],
  "slow-morning": [
    "Design a slow morning for a day when one of us has to leave early.",
    "What would our slow morning look like if we had a pet, a kid, or a very loud neighbor?",
    "Describe a slow morning in a place we've never been — what do we eat, what do we see?",
    "What is one thing we'd *remove* from our mornings to make them slower?"
],
  "confidence-fit": [
    "What is an outfit you *used* to wear that made you feel amazing, and do you still have it?",
    "Describe the version of me who feels most like myself — what am I wearing?",
    "What is a tiny styling detail that instantly makes you feel more *you*?",
    "If we each picked a “confidence accessory” for the other, what would it be?"
],
  "whisper-line": [
    "What would you whisper if we were in a library and everyone was watching?",
    "Write a whisper that is just a question — one that makes me smile.",
    "What would you whisper to me on a very ordinary Tuesday to make it less ordinary?",
    "Leave a whisper for me to find when I wake up tomorrow."
],
  "scent-memory": [
    "What does *home* smell like to you, in 3 notes?",
    "If our relationship had a scent, what would it be called, and what would it smell like?",
    "What scent would you *remove* from our lives if you could?",
    "Describe the scent of a future memory we haven't made yet."
],
  "favorite-way-held": [
    "How do you like to be held when you're *not* sad, just tired?",
    "What is a touch that feels like “I'm proud of you” without words?",
    "How do you ask for closeness when you don't have words?",
    "What is a touch you'd like to *receive* more, and a touch you'd like to *give* more?"
],
  "look-you-love": [
    "What look do I give when I'm about to say something I think is funny?",
    "Describe the look you make when you're trying not to cry (happy or sad).",
    "What does my face look like when I feel completely safe?",
    "If you could photograph one look of mine forever, which one?"
],
  "flirt-resume": [
    "What is one flirting skill you want to *learn* from your partner?",
    "Write a reference letter from our best date for your flirting.",
    "What would your flirt resume say under “Weaknesses” (harmless only)?",
    "Pitch yourself as a companion for a very boring errand that you will make fun."
],
  "what-miss-today": [
    "What is one thing you *didn't* miss today, and why is that okay?",
    "If you could have one 10-minute missing moment back, which one?",
    "What do you miss about *us* that you didn't know you'd miss?",
    "Describe a missing moment that is funny, not sad."
],
  "date-that-never-ends": [
    "Design a date that never ends but stays in *one* room. What happens there?",
    "What would make us decide to keep an ordinary afternoon going into the night?",
    "Imagine a date where we *only* do things we've never done before.",
    "Write the *middle* of a date that never ends — not the start, not the end, just the middle."
],
  "secret-admiration": [
    "What is something you admire about me that I *don't* admire about myself?",
    "Name a moment when you thought, “I chose the right person,” and you didn't say it.",
    "What do you admire about how I handle something *hard*?",
    "What is a small, unglamorous thing I do that you find attractive?"
],
  "after-hours-tile": [
    "What is a thought you only have after 9pm?",
    "Describe the kind of quiet you'd want if we were the last two awake in the world.",
    "What would you tell me at midnight that you wouldn't tell me at noon?",
    "Design a 9pm ritual that is just one sentence + one photo."
],
  "landing-lights": [
    "What is one thing you want to *leave* outside the door tonight, and one thing you want to *bring* in?",
    "Design a landing ritual for a night when one of us is traveling.",
    "What would our home beacon say on a night when we're both exhausted?",
    "Write a goodnight message that is just 5 words."
],
  "rewind-touch": [
    "What is a touch you *wish* we had a ritual for, but we don't yet?",
    "Describe a touch that helped you feel brave.",
    "What is a touch you'd like to receive when you're *happy*, not just sad?",
    "If we had a “touch” for “I'm here, no words needed,” what would it be?"
],
  "closer-than-words": [
    "What is a closeness invitation that *only* works from you, not from anyone else?",
    "Describe a moment when we were close without touching or talking.",
    "What is a tiny thing I do that makes distance feel smaller, even when we're apart?",
    "If closeness had a sound, what would ours be?"
],
  "date-trailer": [
    "Write a trailer for a date that is just “us, a blanket, and a sunset.”",
    "Give our next date a movie poster tagline (one line).",
    "Write a trailer for a date that goes *wrong* in the best way.",
    "Tease a date using only sounds — no words about where or what."
],
  "favorite-detail": [
    "What is a detail about me that *I* don't notice but you do?",
    "Describe a detail about my *voice* that you could recognize anywhere.",
    "What is a tiny habit of mine that makes a room feel like *us*?",
    "If you had to describe me to a stranger using only 3 details, which 3?"
],
  "green-light-tonight": [
    "What kind of affection would feel welcome *tomorrow*, not tonight?",
    "If you could set a “green light” for a kind of care (not just affection), what would it be?",
    "What is a low-pressure invitation you *wish* I'd offer more?",
    "How do you want me to respond when you say “not tonight”?"
],
  "chemistry-recipe": [
    "Write a recipe for a *bad* date between us (so we know what to avoid).",
    "What ingredient would you *remove* from our chemistry, and what would you *add*?",
    "Invent a cocktail named after our first date. What is in it?",
    "What is the “secret seasoning” in our laughter?"
],
  "doorstep-scene": [
    "Write a doorstep scene where the first thing we do is laugh.",
    "Imagine a reunion after *one* day apart, not a month. What changes?",
    "Write a doorstep scene in a place we've never been — what is familiar?",
    "What would the doorstep scene look like if we were both *exhausted*?"
],
  // mutual-yes: expansion in bank 'mutual-yes' — see expandedBanks.js
  "mutual-yes": [],
};


export function getExpandedBoardPrompts(activityId) {
  return EXPANDED_BOARD_PROMPTS[activityId] ?? [];
}
export function getAllExpandedBoardPrompts() {
  return Object.values(EXPANDED_BOARD_PROMPTS).flat();
}
