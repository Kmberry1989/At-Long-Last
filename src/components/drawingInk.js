export const INK_BRUSHES = [
  { id: 'calligraphy', label: 'Ink pen' },
  { id: 'fine', label: 'Fine liner' },
  { id: 'brush', label: 'Soft brush' },
]

export function inkWidth({ brush = 'calligraphy', pressure = 0, pointerType = 'mouse', speed = 0, angle = 0, previousWidth = null, size = 1 }) {
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
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.beginPath()
  context.moveTo(from.x, from.y)
  context.lineTo(to.x === from.x && to.y === from.y ? to.x + .05 : to.x, to.y)
  context.stroke()
  return width
}
