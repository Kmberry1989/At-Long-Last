import { BrandIcon, BrandText } from './BrandIcon.jsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import './finale-screen.css'

const THEME_DETAILS = {
  cozy: {
    ribbon: '✦ Wine-Velvet Scrapbook ✦',
    badge: 'Cozy Night',
    icon: '🍷',
  },
  garden: {
    ribbon: '✦ Pressed Botanical Herbarium ✦',
    badge: 'Secret Garden',
    icon: '🌿',
  },
  beach: {
    ribbon: '✦ Driftwood & Sea-Glass Box ✦',
    badge: 'Sunset Beach',
    icon: '🌊',
  },
  city: {
    ribbon: '✦ Midnight Leather Folio ✦',
    badge: 'City Skyline',
    icon: '✨',
  },
  holiday: {
    ribbon: '✦ Evergreen Memory Book ✦',
    badge: 'Winter Holiday',
    icon: '🎄',
  },
}

export function FinaleScreen({
  session,
  finalSummary,
  journalEntries = [],
  themeId = 'cozy',
  players = [],
  onOpenScrapbook,
  onPlayAgain,
  canPlayAgain = false,
  working = false,
}) {
  const audio = useAudio() || {}
  const { playAction, playSuccess, playHeartTick } = audio
  const [toastMessage, setToastMessage] = useState('')
  const heartTotal = Math.max(0, Math.floor(Number(session?.hearts) || 0))
  const [heartsCount, setHeartsCount] = useState(0)
  const [heartsCounted, setHeartsCounted] = useState(heartTotal === 0)
  const [flyingHearts, setFlyingHearts] = useState([])
  const heartCounterRef = useRef(null)
  const heartLayerRef = useRef(null)
  const flightIdRef = useRef(0)
  const playHeartTickRef = useRef(playHeartTick)

  useEffect(() => { playHeartTickRef.current = playHeartTick }, [playHeartTick])

  useEffect(() => {
    setHeartsCount(0)
    setHeartsCounted(heartTotal === 0)
    setFlyingHearts([])
    if (heartTotal === 0) return undefined

    let current = 0
    let cancelled = false
    const timers = new Set()
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const interval = reducedMotion ? 24 : Math.min(90, Math.max(28, 2100 / heartTotal))
    const later = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        callback()
      }, delay)
      timers.add(timer)
    }

    const tick = () => {
      if (cancelled) return
      current += 1
      setHeartsCount(current)
      playHeartTickRef.current?.(current)

      if (!reducedMotion) {
        const bounds = heartLayerRef.current?.getBoundingClientRect()
        const target = heartCounterRef.current?.getBoundingClientRect()
        if (bounds && target) {
          const x = 12 + Math.random() * Math.max(1, bounds.width - 36)
          const y = bounds.height * (0.36 + Math.random() * 0.62)
          const size = 14 + Math.random() * 13
          const particle = {
            id: ++flightIdRef.current,
            style: {
              left: `${x}px`,
              top: `${y}px`,
              '--heart-flight-x': `${target.left + target.width / 2 - x}px`,
              '--heart-flight-y': `${target.top + target.height / 2 - y}px`,
              '--heart-flight-size': `${size}px`,
            },
          }
          setFlyingHearts((items) => [...items.slice(-23), particle])
          later(() => setFlyingHearts((items) => items.filter((item) => item.id !== particle.id)), 820)
        }
      }

      if (current >= heartTotal) setHeartsCounted(true)
      else later(tick, interval)
    }

    later(tick, reducedMotion ? 16 : 240)
    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
      timers.clear()
    }
  }, [heartTotal])

  const activeTheme = THEME_DETAILS[themeId] || THEME_DETAILS.cozy

  const nightEntries = useMemo(
    () => (session?.id ? journalEntries.filter((e) => e.sessionId === session.id) : journalEntries),
    [journalEntries, session?.id],
  )

  const topMoments = useMemo(() => {
    return nightEntries
      .filter((entry) => entry.type !== 'finale')
      .slice(0, 3)
      .map((entry) => ({
        icon: entry.type === 'keepsake' ? '✧' : entry.type === 'duel' ? '⚔' : '♡',
        title: entry.title || entry.summary || 'A sweet moment shared',
      }))
  }, [nightEntries])

  const capsuleSummaryText = useMemo(() => {
    const p1 = players[0]?.displayName || 'Partner 1'
    const p2 = players[1]?.displayName || 'Partner 2'
    const keepsakes = (session?.keepsakes || []).map((k) => k.label).join(', ') || 'Tonight\'s memory'
    return `At Long Last — Our Night in Review ♡\n` +
      `${p1} & ${p2}\n` +
      `✨ ${finalSummary?.headline || 'In Harmony'}\n` +
      `💞 ${session?.hearts || 0} Shared Hearts Earned\n` +
      `🎁 Keepsakes: ${keepsakes}\n` +
      `"${finalSummary?.coda || ''}"`
  }, [players, session?.keepsakes, session?.hearts, finalSummary?.headline, finalSummary?.coda])

  async function handleShareCapsule() {
    playSuccess?.()
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Our Night at Long Last ♡',
          text: capsuleSummaryText,
        })
        return
      } catch {
        // Fall back to clipboard if user dismissed or share failed
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(capsuleSummaryText)
        setToastMessage('Capsule Copied to Clipboard! ♡')
        setTimeout(() => setToastMessage(''), 2500)
      } catch {
        setToastMessage('Summary Ready!')
        setTimeout(() => setToastMessage(''), 2000)
      }
    }
  }

  function handleOpenScrapbook() {
    playAction?.()
    onOpenScrapbook?.()
  }

  return (
    <div className={`finale-screen-overlay theme-${themeId}`} role="dialog" aria-modal="true">
      <div aria-hidden="true" className="finale-heart-flight-layer" ref={heartLayerRef}>
        {flyingHearts.map((heart) => <span className="finale-flying-heart" key={heart.id} style={heart.style}><BrandIcon name="heart" /></span>)}
      </div>
      {toastMessage && <div className="finale-toast"><BrandText text={toastMessage} /></div>}

      <div className="finale-folio-container">
        {/* Unspooling Memory Ribbon */}
        <div className="finale-theme-ribbon">
          <span><BrandText text={activeTheme.icon} /></span>
          <span><BrandText text={activeTheme.ribbon} /></span>
          <span><BrandText text={activeTheme.icon} /></span>
        </div>

        <div className="finale-folio-body">
          <p className="eyebrow">Night's Coda</p>
          <h2 className="finale-headline">{finalSummary?.headline || 'A Night to Remember'}</h2>
          <p className="finale-coda">{finalSummary?.coda || 'Every good round leaves a mark worth keeping.'}</p>

          {/* Metric Stats Row */}
          <div className="finale-stat-row">
            <div className="finale-stat-box">
              <span aria-label={`${heartsCount} of ${heartTotal} hearts counted`} className="finale-stat-value finale-heart-count" ref={heartCounterRef}>
                <span className="finale-heart-count-number" key={heartsCount}>{heartsCount}</span>
              </span>
              <span className="finale-stat-label">Hearts</span>
              <span aria-live="polite" className={`finale-heart-congratulations${heartsCounted ? ' is-visible' : ''}`}>{heartsCounted ? 'Congratulations!' : ''}</span>
            </div>
            <div className="finale-stat-box">
              <span className="finale-stat-value">{session?.keepsakes?.length || 0}</span>
              <span className="finale-stat-label">Keepsakes</span>
            </div>
            <div className="finale-stat-box">
              <span className="finale-stat-value">{finalSummary?.journalCount || nightEntries.length}</span>
              <span className="finale-stat-label">Moments</span>
            </div>
            <div className="finale-stat-box">
              <span className="finale-stat-value">{finalSummary?.dominantVibe || 'warm'}</span>
              <span className="finale-stat-label">Tone</span>
            </div>
          </div>

          {/* One-Tap Keepsake Capsule (Zero Homework) */}
          <div className="finale-capsule-card">
            <div className="finale-capsule-header">
              <span><BrandText text={"✦ Tonight's Keepsake Capsule ✦"} /></span>
              <span className="finale-capsule-vibe-chip">{finalSummary?.tierLabel || 'Connected'}</span>
            </div>

            <div className="finale-capsule-moments">
              {topMoments.map((moment, idx) => (
                <div key={idx} className="finale-capsule-moment-item">
                  <span className="finale-capsule-moment-icon" aria-hidden="true"><BrandText text={moment.icon} /></span>
                  <span className="finale-capsule-moment-text">{moment.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="finale-actions">
            <button
              type="button"
              className="finale-btn finale-primary-btn"
              onClick={handleOpenScrapbook}
            ><BrandText text={"Open Bound Scrapbook 📖 "} /></button>

            <button
              type="button"
              className="finale-btn finale-secondary-btn"
              onClick={handleShareCapsule}
            ><BrandText text={"Share Keepsake Capsule 💌 "} /></button>

            <div className="finale-sub-actions">
              {canPlayAgain && (
                <button
                  type="button"
                  className="finale-sub-btn"
                  disabled={working}
                  onClick={onPlayAgain}
                ><BrandText text={"Play Another Night ✦ "} /></button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
