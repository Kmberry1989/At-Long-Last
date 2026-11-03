// At Long Last: a small engraved line language, drawn on a 32-unit square.
export const brandIconPaths = {
  heart: ['M16 27C12 23 4 18 4 11a6 6 0 0 1 12-1 6 6 0 0 1 12 1c0 7-8 12-12 16Z', 'M10 12c0-3 3-4 5-2'],
  seal: ['M5 9h22v16H5Z', 'm5 9 11 9L27 9', 'M12 20c0-5 8-5 8 0s-8 5-8 0Z'],
  dice: ['M8 4h18l3 20-18 4L5 10Z', 'm8 4 3 24M11 12l18-4', 'M17 16h.01M24 13h.01M19 23h.01', 'M7 11h.01M8 18h.01'],
  moon: ['M25 21A12 12 0 0 1 11 4 12 12 0 1 0 25 21Z', 'm23 4 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z'],
  bloom: ['M16 27V16M16 23c-6 0-8-4-8-4 6-1 8 4 8 4Zm0-3c6 0 8-5 8-5-6 0-8 5-8 5Z', 'M16 15c-9 4-13-5-6-7-1-7 10-7 11 0 7 2 4 11-5 7Z', 'M16 8v7'],
  book: ['M16 8C11 4 5 5 3 7v20c4-3 9-2 13 0 4-2 9-3 13 0V7c-4-2-9-2-13 1Zm0 0v19', 'M7 11h5M7 15h5M20 11h5M20 15h5'],
  music: ['M13 23V8l13-3v16', 'm13 12 13-3', 'M13 23c0 5-9 6-9 1s9-6 9-1Zm13-2c0 5-9 6-9 1s9-6 9-1Z'],
  sound: ['M4 13h6l7-6v18l-7-6H4Z', 'M22 11c4 2 4 8 0 10M25 6c8 5 8 15 0 20'],
  muted: ['M4 13h6l7-6v18l-7-6H4Z', 'm23 12 7 8m0-8-7 8'],
  sparkle: ['M16 3c1 9 4 12 13 13-9 1-12 4-13 13C15 20 12 17 3 16 12 15 15 12 16 3Z', 'm25 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z'],
  arrow: ['M7 25 25 7M12 7h13v13'],
  reset: ['M26 12A11 11 0 1 0 27 22M26 4v9h-9'],
  back: ['M25 16H7m8-8-8 8 8 8'],
  chevron: ['m12 6 10 10-10 10'],
  down: ['m6 12 10 10 10-10'],
  check: ['M5 17c4-1 5 5 8 6L27 7'],
  close: ['m8 8 16 16M24 8 8 24'],
  gift: ['M4 13h24v6H4Zm3 6v10h18V19M16 13v16', 'M16 13C2 12 7 0 13 6l3 7Zm0 0c14-1 9-13 3-7l-3 7Z'],
  trash: ['M7 8h18l-2 21H9L7 8Zm-2 0h22M12 5h8M13 12v12m6-12v12', 'm11 4 4 3-3 3 5 3-2 4 5 3'],
  treasure: ['M4 12 10 4h12l6 8-12 17L4 12Z', 'M4 12h24M10 4l2 8 4 17 4-17 2-8', 'M26 2c.4 2 1.2 3 3 3-1.8.4-2.6 1.2-3 3-.4-1.8-1.2-2.6-3-3 1.8-.4 2.6-1 3-3Z'],
  duel: ['M5 4 24 23m-3-2 5-5m-5 5-5 5m8-3 4 5M27 4 8 23m3-2-5-5m5 5 5 5m-8-3-4 5', 'M5 4v7M27 4v7'],
  flame: ['M17 3c1 7 10 10 9 18-1 12-21 10-20-1 0-4 3-9 6-12-1 8 5 6 5-5Z', 'M16 17c-8 7-4 13 1 11s4-7-1-11Z'],
  snow: ['M16 3v26M5 9l22 14M5 23 27 9', 'm12 5 4 4 4-4m-8 22 4-4 4 4M5 13l5-1-1-5m18 12-5 1 1 5M5 19l5 1-1 5m18-12-5-1 1-5'],
  promise: ['M3 20c5-10 8-7 13 1 5 8 10 3 9-1l-5-9c-2-4-6 0-4 3l3 5', 'M29 12c-5 10-8 7-13-1C11 3 6 8 7 12l5 9c2 4 6 0 4-3l-3-5'],
  trophy: ['M9 4h14v10c0 10-14 10-14 0V4Zm7 18v6m-6 0h12', 'M9 7H3c0 8 4 10 8 10M23 7h6c0 8-4 10-8 10'],
  lock: ['M7 14h18v15H7Zm4 0V9c0-8 10-8 10 0v5', 'M16 20v4'],
  eye: ['M2 16c7-12 21-12 28 0-7 12-21 12-28 0Z', 'M11 16a5 5 0 1 0 10 0 5 5 0 1 0-10 0'],
  timer: ['M12 3h8M16 3v4M24 8l3-3', 'M5 19a11 11 0 1 0 22 0 11 11 0 1 0-22 0', 'M16 12v8l5 3'],
  trade: ['M4 11h23l-6-6M28 21H5l6 6', 'M6 5 4 11l6 4m16 12 2-6-6-4'],
  palette: ['M16 3C-1 3-2 27 13 29c6 1 1-7 6-7h6c10-1 6-19-9-19Z', 'M10 10h.01M19 8h.01M25 13h.01M7 18h.01'],
  coffee: ['M5 11h17v9c0 10-17 10-17 0v-9Zm17 1h4c6 0 4 10-4 9M3 29h23', 'M10 3c-3 3 3 3 0 6m7-6c-3 3 3 3 0 6'],
  wave: ['M2 13c4 0 4-6 8-6s4 6 8 6 4-6 8-6 4 6 4 6M2 22c4 0 4-6 8-6s4 6 8 6 4-6 8-6 4 6 4 6'],
  tree: ['M16 2 6 14h5L3 25h26l-8-11h5L16 2Zm0 23v5'],
  glass: ['M9 3h14l2 10c2 12-20 12-18 0L9 3Zm7 20v7m-6 0h12', 'M8 12h16'],
  signal: ['M16 24h.01M11 19c3-3 7-3 10 0M6 14c6-6 14-6 20 0M2 9c8-8 20-8 28 0'],
  more: ['M6 8h20M6 16h20M6 24h20', 'M3 8h.01M3 16h.01M3 24h.01'],
}

export const glyphIcons = {
  '♥': 'heart', '♡': 'heart', '💛': 'heart', '💗': 'heart', '💖': 'heart', '💓': 'heart', '💞': 'promise', '❤️': 'heart', '💘': 'heart', '💕': 'heart', '🤍': 'heart', '💋': 'heart',
  '✦': 'sparkle', '✧': 'sparkle', '✨': 'sparkle', '💫': 'sparkle', '🌟': 'sparkle', '✉️': 'seal', '✉': 'seal', '💌': 'seal', '♫': 'music', '☾': 'moon', '🌙': 'moon',
  '🎲': 'dice', '🌸': 'bloom', '🌿': 'bloom', '💧': 'bloom', '🎄': 'tree', '🌊': 'wave', '🍷': 'glass', '☕': 'coffee', '⚖': 'trade', '🕊️': 'trade', '⇄': 'trade',
  '✓': 'check', '✔': 'check', '✗': 'close', '✕': 'close', '×': 'close', '↗': 'arrow', '▾': 'down', '▸': 'chevron', '◷': 'timer', '◌': 'timer', '○': 'moon', '⏳': 'timer', '⌛': 'timer',
  '🔥': 'flame', '❄️': 'snow', '🤙': 'promise', '💍': 'promise', '🎁': 'gift', '🏆': 'trophy', '🔒': 'lock', '👁️': 'eye', '👀': 'eye', '💭': 'moon', '☝️': 'arrow',
  '⚔️': 'duel', '⚔': 'duel', '♠': 'duel', '📖': 'book', '📡': 'signal', '🎨': 'palette', '☼': 'sparkle', '✎': 'palette', '🛋️': 'coffee', '🎉': 'sparkle', '🥚': 'bloom', '🐣': 'bloom',
}

export const iconGlyphPattern = new RegExp(`(${Object.keys(glyphIcons).sort((a, b) => b.length - a.length).map(glyph => glyph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gu')

export function drawBrandIcon(context, name, x, y, size) {
  context.save()
  context.translate(x - size / 2, y - size / 2)
  context.scale(size / 32, size / 32)
  context.lineWidth = 1.8
  context.lineCap = 'round'
  context.lineJoin = 'round'
  for (const path of brandIconPaths[name] || brandIconPaths.sparkle) context.stroke(new Path2D(path))
  context.restore()
}
