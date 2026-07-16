import { useEffect, useRef, useState } from 'react'

export function DoodleDuel({
  disabled = false,
  durationSec = 60,
  onComplete,
  onSkip,
  prompt = 'Draw it from memory.',
}) {
  const canvasRef = useRef(null)
  const startedAtRef = useRef(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [timeLeft, setTimeLeft] = useState(durationSec)

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
    context.scale(devicePixelRatio, devicePixelRatio)
    context.fillStyle = '#fffaf4'
    context.fillRect(0, 0, rect.width, rect.height)
    context.strokeStyle = '#201718'
    context.lineWidth = 4
    context.lineCap = 'round'
    context.lineJoin = 'round'
    startedAtRef.current = performance.now()

    return undefined
  }, [])

  useEffect(() => {
    if (disabled || isDone) {
      return undefined
    }

    if (timeLeft <= 0) {
      handleDone()
      return undefined
    }

    const timer = window.setTimeout(() => setTimeLeft((current) => current - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [disabled, isDone, timeLeft])

  function getCoordinates(event) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  function startDrawing(event) {
    if (disabled || isDone) {
      return
    }

    const context = canvasRef.current?.getContext('2d')
    if (!context) {
      return
    }

    const { x, y } = getCoordinates(event)
    context.beginPath()
    context.moveTo(x, y)
    setIsDrawing(true)
  }

  function moveDrawing(event) {
    if (!isDrawing || disabled || isDone) {
      return
    }

    const context = canvasRef.current?.getContext('2d')
    if (!context) {
      return
    }

    const { x, y } = getCoordinates(event)
    context.lineTo(x, y)
    context.stroke()
  }

  function stopDrawing() {
    setIsDrawing(false)
  }

  function clearCanvas() {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      return
    }

    const rect = canvas.getBoundingClientRect()
    context.fillStyle = '#fffaf4'
    context.fillRect(0, 0, rect.width, rect.height)
  }

  function handleDone() {
    if (isDone) {
      return
    }

    setIsDone(true)
    const dataUrl = canvasRef.current?.toDataURL('image/png', 0.82) ?? null
    const elapsed = Math.max(1, durationSec - timeLeft)
    onComplete({
      dataUrl,
      highlight: `sketched it in ${elapsed}s`,
      score: elapsed,
      time: elapsed,
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
      <div className="doodle-meta">
        <span>{timeLeft}s left</span>
        <span>Thick brush. No eraser.</span>
      </div>
      <div className="doodle-progress">
        <span style={{ width: `${(timeLeft / durationSec) * 100}%` }} />
      </div>
      <div className="doodle-stage">
        <canvas
          className="doodle-canvas"
          onMouseDown={startDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={moveDrawing}
          onMouseUp={stopDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={moveDrawing}
          onTouchStart={startDrawing}
          ref={canvasRef}
        />
        {!isDrawing && timeLeft === durationSec && (
          <p className="doodle-hint">Draw here. Messy is better.</p>
        )}
      </div>
      <div className="button-row">
        <button className="primary-btn alt" disabled={disabled || isDone} onClick={clearCanvas} type="button">
          Clear
        </button>
        <button className="primary-btn" disabled={disabled} onClick={handleDone} type="button">
          Reveal It
        </button>
      </div>
    </div>
  )
}
