import { useMemo, useState } from 'react'
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
  const { playAction, playSuccess } = audio
  const [toastMessage, setToastMessage] = useState('')

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
      {toastMessage && <div className="finale-toast">{toastMessage}</div>}

      <div className="finale-folio-container">
        {/* Unspooling Memory Ribbon */}
        <div className="finale-theme-ribbon">
          <span>{activeTheme.icon}</span>
          <span>{activeTheme.ribbon}</span>
          <span>{activeTheme.icon}</span>
        </div>

        <div className="finale-folio-body">
          <p className="eyebrow">Night's Coda</p>
          <h2 className="finale-headline">{finalSummary?.headline || 'A Night to Remember'}</h2>
          <p className="finale-coda">{finalSummary?.coda || 'Every good round leaves a mark worth keeping.'}</p>

          {/* Metric Stats Row */}
          <div className="finale-stat-row">
            <div className="finale-stat-box">
              <span className="finale-stat-value">{session?.hearts || 0}</span>
              <span className="finale-stat-label">Hearts</span>
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
              <span>✦ Tonight's Keepsake Capsule ✦</span>
              <span className="finale-capsule-vibe-chip">{finalSummary?.tierLabel || 'Connected'}</span>
            </div>

            <div className="finale-capsule-moments">
              {topMoments.map((moment, idx) => (
                <div key={idx} className="finale-capsule-moment-item">
                  <span className="finale-capsule-moment-icon" aria-hidden="true">{moment.icon}</span>
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
            >
              Open Bound Scrapbook 📖
            </button>

            <button
              type="button"
              className="finale-btn finale-secondary-btn"
              onClick={handleShareCapsule}
            >
              Share Keepsake Capsule 💌
            </button>

            <div className="finale-sub-actions">
              {canPlayAgain && (
                <button
                  type="button"
                  className="finale-sub-btn"
                  disabled={working}
                  onClick={onPlayAgain}
                >
                  Play Another Night ✦
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
