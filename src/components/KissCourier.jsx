import { useEffect, useRef, useState } from 'react'

export function KissCourier({
  disabled = false,
  onComplete,
  onSkip,
  prompt = 'Send it across the board, then catch the glow.',
}) {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const [sent, setSent] = useState(false)
  const [caught, setCaught] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) {
      return undefined
    }

    let animationFrame = 0

    function draw() {
      const rect = canvas.getBoundingClientRect()
      context.clearRect(0, 0, rect.width, rect.height)
      context.strokeStyle = 'rgba(44, 34, 36, 0.12)'
      context.lineWidth = 2
      context.setLineDash([8, 8])
      context.beginPath()
      context.moveTo(28, rect.height / 2)
      context.quadraticCurveTo(
        rect.width / 2,
        rect.height * 0.18,
        rect.width - 28,
        rect.height / 2,
      )
      context.stroke()
      context.setLineDash([])

      particlesRef.current = particlesRef.current.filter((particle) => particle.life > 0)
      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.05
        particle.life -= 0.015

        context.globalAlpha = particle.life
        context.fillStyle = particle.color
        context.font = '18px serif'
        context.fillText('♥', particle.x, particle.y)
      })
      context.globalAlpha = 1

      context.strokeStyle = caught ? 'rgba(90, 165, 142, 0.9)' : 'rgba(233, 193, 134, 0.55)'
      context.fillStyle = caught ? 'rgba(90, 165, 142, 0.18)' : 'rgba(233, 193, 134, 0.12)'
      context.beginPath()
      context.arc(rect.width - 30, rect.height / 2, 26, 0, Math.PI * 2)
      context.fill()
      context.stroke()

      animationFrame = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationFrame)
  }, [caught])

  function sendKiss() {
    if (disabled) {
      return
    }

    setSent(true)
    setCaught(false)
    particlesRef.current = Array.from({ length: 12 }, (_, index) => ({
      color: index % 2 === 0 ? '#d96f7b' : '#efc589',
      life: 1,
      vx: 3.2 + Math.random() * 2.4,
      vy: -1.2 + Math.random() * 1.4,
      x: 28 + Math.random() * 12,
      y: 78 + Math.random() * 18,
    }))
  }

  function catchKiss() {
    if (disabled || !sent) {
      return
    }

    setCaught(true)
    particlesRef.current.push(
      ...Array.from({ length: 18 }, () => ({
        color: '#ffd8de',
        life: 1,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 4,
        x: 290,
        y: 88,
      })),
    )

    onComplete({
      highlight: 'sent a kiss clear across the board',
      score: 1,
      time: 1,
      won: true,
    })
  }

  return (
    <div className="overlay-card duel-card">
      <div className="overlay-head">
        <p className="eyebrow">Spicy Duel</p>
        {onSkip && (
          <button className="secondary-link" disabled={disabled} onClick={onSkip} type="button">
            Skip Duel
          </button>
        )}
      </div>
      <h3>Kiss Courier</h3>
      <p className="support-copy">{prompt}</p>
      <div className="kiss-stage">
        <canvas className="kiss-canvas" height="176" ref={canvasRef} width="320" />
        <span className="kiss-label left">YOU</span>
        <span className="kiss-label right">THEM</span>
      </div>
      <div className="button-row">
        <button className="primary-btn alt" disabled={disabled} onClick={sendKiss} type="button">
          {sent ? 'Send Again' : 'Blow Kiss'}
        </button>
        <button className="primary-btn" disabled={disabled || !sent || caught} onClick={catchKiss} type="button">
          {caught ? 'Caught' : 'Catch It'}
        </button>
      </div>
    </div>
  )
}
