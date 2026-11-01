import { InkToolbar } from './InkToolbar.jsx'
import { drawInkSegment, inkPoint } from './drawingInk.js'
import { useEffect, useRef, useState } from 'react'

export function DoodleDuel({
  disabled = false,
  onComplete,
  onSkip,
  prompt = 'Draw it from memory.',
}) {
  const canvasRef = useRef(null)
  const strokeRef = useRef(null)
  const [brush, setBrush] = useState('calligraphy')
  const [color, setColor] = useState('#201718')
  const [size, setSize] = useState(1)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return undefined
    }

    const devicePixelRatio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * devicePixelRatio
    canvas.height = rect.height * devicePixelRatio
    context.fillStyle = '#fffaf4'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#201718'
    context.lineWidth = 4
    context.lineCap = 'round'
    context.lineJoin = 'round'
    return undefined
  }, [])

  function startDrawing(event) {
    if (disabled || isDone || strokeRef.current || event.isPrimary === false) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!context) return
    canvas.setPointerCapture?.(event.pointerId)
    const point = inkPoint(event, canvas)
    const style = { brush, color, size }
    const width = drawInkSegment(context, point, point, event, style)
    strokeRef.current = { point, pointerId: event.pointerId, style, width }
    setIsDrawing(true)
    setHasDrawn(true)
  }

  function moveDrawing(event) {
    const stroke = strokeRef.current
    if (!stroke || event.pointerId !== stroke.pointerId || disabled || isDone) return
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    const samples = event.nativeEvent?.getCoalescedEvents?.() || []
    for (const sample of [...samples, event]) {
      const point = inkPoint(sample, canvas)
      stroke.width = drawInkSegment(context, stroke.point, point, sample, stroke.style, stroke.width)
      stroke.point = point
    }
  }

  function stopDrawing(event) {
    const stroke = strokeRef.current
    if (!stroke || (event && event.pointerId !== stroke.pointerId)) return
    strokeRef.current = null
    setIsDrawing(false)
    if (canvasRef.current?.hasPointerCapture?.(stroke.pointerId)) canvasRef.current.releasePointerCapture(stroke.pointerId)
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      return
    }

    strokeRef.current = null
    setIsDrawing(false)
    context.fillStyle = '#fffaf4'
    context.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }

  function handleDone() {
    if (isDone || !hasDrawn) {
      return
    }

    setIsDone(true)
    const dataUrl = canvasRef.current?.toDataURL('image/png', 0.82) ?? null
    onComplete({
      dataUrl,
      highlight: 'saved a drawing',
      score: 1,
      time: 0,
      won: true,
    })
  }

  return (
    <div className="overlay-card duel-card">
      <div className="overlay-head">
        <p className="eyebrow">Playful Duel</p>
        {onSkip && (
          <button className="secondary-link" disabled={disabled} onClick={onSkip} type="button">
            Skip Duel
          </button>
        )}
      </div>
      <h3>Doodle Duel</h3>
      <p className="support-copy">{prompt}</p>
      <InkToolbar brush={brush} color={color} size={size} onBrushChange={setBrush} onColorChange={setColor} onSizeChange={setSize} disabled={disabled || isDone} />
      <div className="doodle-stage">
        <canvas
          className="doodle-canvas"
          aria-label="Drawing canvas"
          onPointerDown={startDrawing}
          onPointerMove={moveDrawing}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onLostPointerCapture={stopDrawing}
          ref={canvasRef}
        />
        {!isDrawing && !hasDrawn && (
          <p className="doodle-hint">Draw here. Messy is better.</p>
        )}
      </div>
      <div className="button-row">
        <button className="primary-btn alt" disabled={disabled || isDone} onClick={clearCanvas} type="button">
          Clear
        </button>
        <button className="primary-btn" disabled={disabled || isDone || !hasDrawn} onClick={handleDone} type="button">
          Save Drawing
        </button>
      </div>
    </div>
  )
}
