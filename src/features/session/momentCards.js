const trashMoments = [
  { id: 'cold-coffee', title: 'Cold Coffee Again', scene: 'The cup cooled while the morning rushed by.', effect: 'Coffee detour' },
  { id: 'laundry-mountain', title: 'The Laundry Mountain', scene: 'The chair has disappeared under the laundry.', effect: 'Laundry pile-up' },
  { id: 'missing-keys', title: 'The Missing Keys', scene: 'You are ready to leave, but the keys are not.', effect: 'Retrace the route' },
  { id: 'late-dinner', title: 'Dinner Runs Late', scene: 'The day ran long and dinner is running later.', effect: 'Dinner delay' },
  { id: 'split-grocery-bag', title: 'The Split Grocery Bag', scene: 'The grocery bag gives way on the walk home.', effect: 'Rescue the groceries' },
  { id: 'calendar-tangle', title: 'The Calendar Tangle', scene: 'Two plans have landed on the same evening.', effect: 'Double-booking detour' },
  { id: 'rainy-walk', title: 'The Umbrella Left Behind', scene: 'The rain begins halfway through the walk.', effect: 'Rain delay' },
  { id: 'first-hard-week', title: 'Our First Hard Week', scene: 'A tough week asks for a little extra care.', effect: 'Take a breather' },
  { id: 'forgotten-bin-day', title: 'The Forgotten Bin Day', scene: 'The truck has gone and the bins are still out.', effect: 'Back to the curb' },
  { id: 'flat-pack-evening', title: 'The Flat-Pack Evening', scene: 'There are too many screws and one extra piece.', effect: 'Search for the missing screw' },
  { id: 'wrong-turn', title: 'The Wrong Turn', scene: 'The route is wrong and arrival keeps slipping.', effect: 'Re-route' },
  { id: 'tiny-home-repair', title: 'The Tiny Home Repair', scene: 'A small home repair needs one more trip to the toolbox.', effect: 'Toolbox detour' },
]

const treasureMoments = [
  { id: 'warm-mug', title: 'A Warm Mug Left Ready', scene: 'Someone remembered just how you take it.', effect: 'A warm start' },
  { id: 'lunch-note', title: 'A Note in the Lunch Bag', scene: 'A kind note appears in the middle of an ordinary day.', effect: 'A little encouragement' },
  { id: 'first-shared-key', title: 'The First Shared Key', scene: 'A small key marks a new chapter together.', effect: 'An open door' },
  { id: 'saved-last-slice', title: 'The Last Slice Saved', scene: 'The last piece of a favorite treat was saved for you.', effect: 'A saved slice' },
  { id: 'first-trip-photo', title: 'A Photo from the First Trip', scene: 'A picture brings an early adventure back to life.', effect: 'Happy trail' },
  { id: 'inside-joke', title: 'The Inside Joke, Again', scene: 'The old joke lands perfectly, once again.', effect: 'A laugh that carries' },
  { id: 'first-home', title: 'Our First Home Together', scene: 'You remember the first place that felt like yours.', effect: 'Homeward' },
  { id: 'chose-us', title: 'The Day We Chose Us', scene: 'A milestone worth keeping close.', effect: 'A promise propels you' },
  { id: 'rainy-day-date', title: 'The Rainy-Day Date', scene: 'The weather changed the plan and improved it.', effect: 'A lovely detour' },
  { id: 'saved-voice-note', title: 'A Voice Note Kept', scene: 'A familiar voice brings a good moment close again.', effect: 'A voice to carry with you' },
  { id: 'new-tradition', title: 'A New Little Tradition', scene: 'A small ritual has quietly become yours.', effect: 'Tradition takes you further' },
  { id: 'ordinary-tuesday', title: 'An Ordinary Tuesday, Together', scene: 'Nothing big happened, and it was a lovely day.', effect: 'An ordinary-day glow' },
]

export const MOMENT_DECKS = Object.freeze({ trash: trashMoments, treasure: treasureMoments })

export function drawMomentCard(random = Math.random, dice = [1, 1]) {
  const category = random() < 0.5 ? 'trash' : 'treasure'
  const deck = MOMENT_DECKS[category]
  const card = deck[Math.floor(random() * deck.length)]
  const lowerDie = Math.min(...dice)
  const spaces = Math.min(6, Math.max(1, lowerDie))
  return {
    category,
    id: card.id,
    title: card.title,
    scene: card.scene,
    effect: card.effect,
    image: `/assets/moment-cards/${card.id}.jpg`,
    lowerDie,
    spaces,
    movement: category === 'trash' ? -spaces : spaces,
  }
}
