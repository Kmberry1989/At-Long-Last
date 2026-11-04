import { InkToolbar } from './InkToolbar.jsx'
import { drawInkSegment, getDoodlePrompt, inkPoint } from './drawingInk.js'
import { useEffect, useRef, useState } from 'react'

export function DoodleDuel({
  disabled = false,
  drawingStorageKey = '',
  onComplete,
  duel,
  round = 0,
  promptSeed = '',
  prompt,
  title = '',
}) {
  const canvasRef = useRef(null)
  const strokeRef = useRef(null)
  const [brush, setBrush] = useState('pencil')
  const [color, setColor] = useState('#201718')
  const [size, setSize] = useState(1)
  const [isDone, setIsDone] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const savedDrawingKey = drawingStorageKey ? `at-long-last:doodle:${drawingStorageKey}` : ''

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return undefined
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return undefined
    }

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      const width = Math.max(1, Math.round(rect.width * ratio))
      const height = Math.max(1, Math.round(rect.height * ratio))
      if (canvas.width === width && canvas.height === height) return

      const previous = document.createElement('canvas')
      previous.width = canvas.width
      previous.height = canvas.height
      if (previous.width && previous.height) previous.getContext('2d')?.drawImage(canvas, 0, 0)
      canvas.width = width
      canvas.height = height
      context.fillStyle = '#fffaf4'
      context.fillRect(0, 0, width, height)
      if (previous.width && previous.height) context.drawImage(previous, 0, 0, width, height)
      context.strokeStyle = '#201718'
      context.lineWidth = 4
      context.lineCap = 'round'
      context.lineJoin = 'round'
    }

    resizeCanvas()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resizeCanvas)
    observer?.observe(canvas)
    window.addEventListener('resize', resizeCanvas)

    if (savedDrawingKey) {
      try {
        const saved = sessionStorage.getItem(savedDrawingKey)
        if (saved) {
          const image = new Image()
          image.onload = () => {
            if (canvasRef.current !== canvas) return
            context.drawImage(image, 0, 0, canvas.width, canvas.height)
            setHasDrawn(true)
          }
          image.src = saved
        }
      } catch { /* Drawing can continue without tab storage. */ }
    }

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [savedDrawingKey])

  function saveDrawing() {
    if (!savedDrawingKey || !canvasRef.current) return
    try { sessionStorage.setItem(savedDrawingKey, canvasRef.current.toDataURL('image/png')) } catch { /* Ignore storage limits. */ }
  }

  useEffect(() => {
    const preserve = () => saveDrawing()
    window.addEventListener('pagehide', preserve)
    return () => window.removeEventListener('pagehide', preserve)
  }, [savedDrawingKey])

  function removeSavedDrawing() {
    if (!savedDrawingKey) return
    try { sessionStorage.removeItem(savedDrawingKey) } catch { /* Ignore storage errors. */ }
  }

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
    if (canvasRef.current?.hasPointerCapture?.(stroke.pointerId)) canvasRef.current.releasePointerCapture(stroke.pointerId)
    saveDrawing()
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      return
    }

    strokeRef.current = null
    context.fillStyle = '#fffaf4'
    context.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    removeSavedDrawing()
  }

  function handleDone() {
    if (isDone || !hasDrawn) {
      return
    }

    setIsDone(true)
    const dataUrl = canvasRef.current?.toDataURL('image/png', 0.82) ?? null
    removeSavedDrawing()
    onComplete({
      dataUrl,
      highlight: 'saved a drawing',
      score: 1,
      time: 0,
      won: true,
    })
  }

  const scenePrompt = prompt || getDoodlePrompt(duel?.id || '', round, promptSeed)
  return (
    <div className="overlay-card duel-card doodle-duel-card">
      {title && <h3>{title}</h3>}
      <p className="doodle-prompt">{scenePrompt}</p>
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
      </div>
      <div className="button-row">
        <button className="primary-btn alt" disabled={disabled || isDone} onClick={clearCanvas} type="button">
          Clear
        </button>
        <button className="primary-btn" disabled={disabled || isDone || !hasDrawn} onClick={handleDone} type="button">
          Done
        </button>
      </div>
    </div>
  )
}
