export const INK_BRUSHES = [
  { id: 'pencil', label: 'Pencil' },
  { id: 'calligraphy', label: 'Ink pen' },
]

const SCENE_DOODLE_PROMPTS = [
  'Two mugs beneath one blanket',
  'A little picnic under the moon',
  'Sharing dessert by candlelight',
  'Two umbrellas in a rain shower',
  'Stargazing from a rooftop',
  'A flower tucked into a note',
  'A slow dance in the living room',
  'Two chairs facing the sunset',
  'A lazy breakfast for two',
  'A handwritten note on the table',
  'Planting a flower together',
  'A walk home beneath one coat',
  'A tiny cake with two candles',
  'A pair of slippers waiting by the door',
  'A blanket fort with room for two',
  'Two bicycles beside a quiet path',
  'A bowl of popcorn between two seats',
  'A little vase made from a jam jar',
  'A shared playlist on a rainy afternoon',
  'Two mittens drying by the heater',
  'A note tucked beside the coffee tin',
  'A picnic packed in mismatched containers',
  'A window glowing on a snowy evening',
  'A pair of toothbrushes in a cup',
  'A small garden growing in old teacups',
  'Two plates waiting for a late dinner',
  'A heart drawn in the fog on a window',
  'A favorite book with a pressed flower inside',
  'A pair of rain boots by the doorstep',
  'A candlelit table set for an ordinary Tuesday',
  'A shared scarf on a chilly walk',
  'A little paper boat carrying a love note',
  'Two oranges shaped like a tiny sun',
  'A sleepy cat curled between two pillows',
  'A breakfast tray with one extra flower',
  'A pair of keys resting in the same bowl',
  'A record spinning beside two cups of tea',
  'A tiny tent beneath a sky full of dots',
  'A bookshelf with one space saved for a favorite',
  'A warm loaf cooling beside two plates',
  'A paper airplane crossing a living room',
  'Two sweaters hanging side by side',
  'A little moon reflected in two cups',
  'A houseplant leaning toward the window',
  'A shared umbrella leaning by the door',
  'A postcard from a place you want to visit',
  'A bowl of strawberries and two spoons',
  'A pair of socks escaping the laundry basket',
  'A lantern glowing beside a quiet path',
  'A small bouquet wrapped in yesterday’s paper',
  'A coffee cup with a tiny heart in the foam',
  'Two chairs pulled close beside a fireplace',
  'A blanket and two books on a sunny floor',
  'A little jar collecting kind notes',
  'A bicycle basket carrying a bunch of flowers',
  'A sunrise peeking over the breakfast table',
  'A takeout bag beside a movie-night blanket',
  'A tiny house with two lights in the windows',
  'A pair of gloves sharing one coat pocket',
  'A moonlit path leading back home',
]

export const SLOW_DRAW_PROMPTS = [
  'Sketch one small detail about your partner you would recognize anywhere',
  'Draw your partner in their favorite way to unwind',
  'Capture a favorite expression from a memory you share',
  'Sketch the way your partner looks when they feel at home',
  'Draw a little everyday moment when they feel most like themselves',
  'Sketch the mug, book, or blanket your partner reaches for most',
  'Draw your partner’s coziest posture in a few simple lines',
  'Capture the way they celebrate a small win',
  'Sketch a favorite outfit using only a few shapes',
  'Draw the smile you remember from a favorite day together',
  'Sketch your partner doing something they love',
  'Draw one detail that makes your partner unmistakably them',
  'Capture the look they get when they are concentrating',
  'Sketch their hands doing an ordinary thing you love',
  'Draw the way your partner greets you at the end of the day',
  'Sketch a quiet moment when you feel close to them',
  'Draw your partner as the main character in a peaceful scene',
  'Capture the little thing they do that always makes you smile',
]

export const DOODLE_PROMPTS = [...SCENE_DOODLE_PROMPTS, ...SLOW_DRAW_PROMPTS]

export function getDoodlePrompt(duelId = '', round = 0, sessionId = '') {
  let hash = Number(round) || 0
  for (const character of `${duelId}:${sessionId}`) hash = (hash * 31 + character.charCodeAt(0)) >>> 0
  return DOODLE_PROMPTS[hash % DOODLE_PROMPTS.length]
}

export function inkWidth({ brush = 'calligraphy', pressure = 0, pointerType = 'mouse', speed = 0, angle = 0, previousWidth = null, size = 1 }) {
  if (brush === 'pencil') return (1.1 + Math.min(1, 1 / (1 + Math.max(0, speed) * 1.5)) * 1.6) * size
  if (brush === 'fine') return 2.2 * size
  // Finger and mouse drivers commonly report a constant 0.5. Treat that as
  // unknown pressure; slower movement lays down more ink on every device.
  const hasPressure = pointerType !== 'mouse' && pressure > 0 && pressure !== 0.5
  const force = hasPressure ? Math.min(1, pressure) : 1 / (1 + Math.max(0, speed) * 1.8)
  const nib = brush === 'calligraphy' ? .45 + .55 * Math.abs(Math.sin(angle - Math.PI / 4)) : 1
  const target = (1.2 + force * (brush === 'brush' ? 12 : 8) * nib) * size
  return previousWidth === null ? target : previousWidth * .6 + target * .4
}

export function inkPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect()
  const scale = canvas.width / (rect.width || canvas.width || 1)
  return { x: (event.clientX - rect.left) * scale, y: (event.clientY - rect.top) * canvas.height / (rect.height || canvas.height || 1), time: event.timeStamp, scale }
}

export function drawInkSegment(context, from, to, event, { brush, color, size = 1 }, previousWidth = null) {
  const dx = to.x - from.x, dy = to.y - from.y
  const speed = Math.hypot(dx, dy) / to.scale / Math.max(1, to.time - from.time)
  const width = inkWidth({ brush, pressure: event.pressure, pointerType: event.pointerType, speed, angle: Math.atan2(dy, dx), previousWidth, size })
  context.strokeStyle = color
  context.lineWidth = width * to.scale
  context.globalAlpha = brush === 'pencil' ? 0.54 : 1
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.beginPath()
  context.moveTo(from.x, from.y)
  context.lineTo(to.x === from.x && to.y === from.y ? to.x + .05 : to.x, to.y)
  context.stroke()
  context.globalAlpha = 1
  return width
}
