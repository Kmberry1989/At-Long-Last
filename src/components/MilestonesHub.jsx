import { useEffect, useMemo, useRef, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import {
  fetchCoupleJournalExport,
  nextAnniversaryCountdown,
  resolveFlower,
  resolveKouponLabel,
  FLOWER_STAGES,
} from '../features/couple/progressService.js'
import { momentCopy, useMilestones } from './Milestones.jsx'
import { buildYearRecap } from './YearInReview.jsx'
import './milestones-hub.css'

export function MilestonesHub({ initialTab = 'constellation', onClose, open = true }) {
  const audio = useAudio()
  const { couple, fulfillKoupon, progress, redeemKoupon } = useCouple()
  const { db } = useFirebaseApp()
  const { moments = [] } = useMilestones()

  const [activeTab, setActiveTab] = useState(initialTab)
  const [selectedStar, setSelectedStar] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [secretVow, setSecretVow] = useState('')
  const [customPinkie, setCustomPinkie] = useState('')
  const [recapData, setRecapData] = useState(null)
  const [recapLoading, setRecapLoading] = useState(false)

  const rootRef = useRef(null)

  // Focus and Escape key handling
  useEffect(() => {
    if (!open) return
    const prevActive = document.activeElement
    rootRef.current?.focus()
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      prevActive?.focus?.()
    }
  }, [onClose, open])

  // Toast trigger with auto-dismiss
  function showToast(msg) {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 2800)
  }

  // Play audio chime
  function chime(type = 'success') {
    if (type === 'celebration') {
      audio?.playCelebration?.('milestone')
    } else {
      audio?.playSuccess?.()
    }
  }

  // Anniversary calculation
  const anniversaryInfo = useMemo(() => {
    return nextAnniversaryCountdown(progress?.anniversary)
  }, [progress?.anniversary])

  // Constellation star nodes
  const starNodes = useMemo(() => {
    if (moments.length > 0) {
      return moments.map((moment, idx) => {
        const copy = momentCopy(moment)
        // Position stars across a 320x340 SVG viewBox
        const x = 50 + (idx * 55) % 220 + ((idx % 3) * 15)
        const y = 60 + ((idx * 65) % 220)
        return {
          copy,
          id: moment.id,
          moment,
          names: moment.names || ['You', 'Partner'],
          title: copy.title,
          x,
          y,
        }
      })
    }

    // Default foundational stars for new couples so celestial sky is rich and alive
    const names = [couple?.players?.[0]?.displayName || 'You', couple?.players?.[1]?.displayName || 'Partner']
    return [
      {
        copy: { chapter: 'Our Beginning', line: 'Two hearts choose the same path.', icon: '✦' },
        id: 'star-genesis',
        names,
        title: 'The Spark',
        x: 60,
        y: 280,
      },
      {
        copy: { chapter: 'First Whispers', line: 'Secrets shared under warm candlelight.', icon: '☾' },
        id: 'star-keepsake',
        names,
        title: 'First Keepsake',
        x: 130,
        y: 190,
      },
      {
        copy: { chapter: 'Pure Resonance', line: 'Playful harmony wins over competition.', icon: '⚔️' },
        id: 'star-duel',
        names,
        title: 'Resonant Duel',
        x: 210,
        y: 130,
      },
      {
        copy: { chapter: 'Pinkie Swear', line: 'A quiet promise kept forever.', icon: '🤙' },
        id: 'star-promise',
        names,
        title: 'Pinkie Swear',
        x: 260,
        y: 70,
      },
    ]
  }, [couple, moments])

  // Path string connecting constellation stars
  const constellationPath = useMemo(() => {
    if (!starNodes.length) return ''
    return starNodes.reduce((acc, node, idx) => {
      return idx === 0 ? `M ${node.x} ${node.y}` : `${acc} L ${node.x} ${node.y}`
    }, '')
  }, [starNodes])

  // Pinkie Swears (Couples Promise Ledger)
  const activePinkies = useMemo(() => {
    const fromProgress = (progress?.koupons || []).filter((k) => k.status === 'active')
    if (fromProgress.length > 0) return fromProgress

    // Default romantic starter Pinkie Swears if none yet in progress
    return [
      { id: 'ps-1', label: 'Breakfast in bed with warm coffee' },
      { id: 'ps-2', label: 'Foot rub with no timer' },
      { id: 'ps-3', label: 'Movie night, your pick (no vetoes)' },
    ]
  }, [progress?.koupons])

  // Sealed capsules
  const capsuleList = useMemo(() => [
    {
      countdownText: anniversaryInfo?.days != null ? `${anniversaryInfo.days} days left` : 'Locked',
      id: 'anniv-vault',
      isUnlocked: anniversaryInfo?.days === 0,
      seal: '♥',
      subtitle: anniversaryInfo ? `Unlocks on ${anniversaryInfo.label}` : 'Set your anniversary date to begin countdown',
      title: 'Our Anniversary Time Capsule',
    },
    {
      countdownText: (progress?.lifetimeNights || 0) >= 10 ? 'Unlocked ✨' : `${Math.max(0, 10 - (progress?.lifetimeNights || 0))} nights left`,
      id: 'ten-nights',
      isUnlocked: (progress?.lifetimeNights || 0) >= 10,
      seal: '10N',
      subtitle: 'Sealed with 10 golden game night vows',
      title: '10 Nights Together Capsule',
    },
    {
      countdownText: (progress?.lifetimeNights || 0) >= 1 ? 'Unlocked ✨' : '1 night left',
      id: 'first-night',
      isUnlocked: (progress?.lifetimeNights || 0) >= 1,
      seal: '1N',
      subtitle: 'The very first night you embarked on this world',
      title: 'First Night Capsule',
    },
  ], [anniversaryInfo, progress?.lifetimeNights])

  // Load Year In Review data
  useEffect(() => {
    if (activeTab === 'recap' && !recapData && !recapLoading) {
      setRecapLoading(true)
      if (db && couple?.id) {
        fetchCoupleJournalExport(db, couple.id)
          .then((entries) => {
            setRecapData(buildYearRecap(entries, progress))
          })
          .catch(() => {
            setRecapData(buildYearRecap([], progress))
          })
          .finally(() => {
            setRecapLoading(false)
          })
      } else {
        setRecapData(buildYearRecap([], progress))
        setRecapLoading(false)
      }
    }
  }, [activeTab, couple?.id, db, progress, recapData, recapLoading])

  // Handle sealing a new secret vow
  function handleSealVow(e) {
    e.preventDefault()
    if (!secretVow.trim()) return
    chime('celebration')
    showToast('Secret vow sealed into the Anniversary Capsule! 🔒✨')
    setSecretVow('')
  }

  // Handle creating a new Pinkie Swear
  function handleSealPinkie(e) {
    e.preventDefault()
    if (!customPinkie.trim()) return
    chime('celebration')
    showToast(`Pinkie Swear sealed: "${customPinkie}" 🤙`)
    setCustomPinkie('')
  }

  // Handle Share Celestial Recap
  async function handleShareRecap() {
    const flower = resolveFlower(progress)
    const flowerStage = FLOWER_STAGES[flower.stage] || FLOWER_STAGES[0]
    const text = [
      '✦ At Long Last: Celestial Couple Recap ✦',
      `🌙 ${progress?.lifetimeNights || 0} Nights Together`,
      `💞 ${progress?.lifetimeHearts || 0} Hearts Earned`,
      `🔥 ${progress?.streakCount || 0} Date-Night Streak`,
      `🌸 Companion: ${flowerStage.label}`,
      `🤙 ${(progress?.koupons || []).filter((k) => k.status === 'fulfilled').length} Pinkie Swears Kept`,
      'Forever in our stars.',
    ].join('\n')

    if (navigator.share) {
      try {
        await navigator.share({
          text,
          title: 'At Long Last — Our Love in the Stars',
        })
        chime()
        return
      } catch {
        // Fall back to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(text)
      chime()
      showToast('Celestial Recap copied to clipboard! ✨')
    } catch {
      showToast('Ready to share!')
    }
  }

  if (!open) return null

  return (
    <aside
      aria-label="The Couple's Vault"
      aria-modal="true"
      className="milestones-hub-overlay"
      id="milestones-vault"
      ref={rootRef}
      role="dialog"
      tabIndex={-1}
    >
      <div aria-hidden="true" className="milestones-hub-stars" />

      {/* Header with Title and Close Button */}
      <header className="milestones-hub-header">
        <div className="milestones-hub-title-block">
          <p className="milestones-hub-eyebrow">The Eternal Couple&apos;s Vault</p>
          <h2 className="milestones-hub-title" id="vault-heading">
            Milestones &amp; Memories
          </h2>
        </div>
        <button
          aria-label="Close Milestones Vault"
          className="milestones-hub-close-btn"
          onClick={onClose}
          type="button"
        >
          ✕
        </button>
      </header>

      {/* Segmented Navigation Tabs */}
      <nav aria-label="Vault Sections" className="milestones-hub-tabs" role="tablist">
        <button
          aria-selected={activeTab === 'constellation'}
          className={`milestones-hub-tab-btn${activeTab === 'constellation' ? ' active' : ''}`}
          onClick={() => {
            setActiveTab('constellation')
            chime()
          }}
          role="tab"
          type="button"
        >
          <span aria-hidden="true" className="tab-icon">✦</span>
          <span>Stars</span>
        </button>

        <button
          aria-selected={activeTab === 'capsules'}
          className={`milestones-hub-tab-btn${activeTab === 'capsules' ? ' active' : ''}`}
          onClick={() => {
            setActiveTab('capsules')
            chime()
          }}
          role="tab"
          type="button"
        >
          <span aria-hidden="true" className="tab-icon">🔒</span>
          <span>Capsules</span>
        </button>

        <button
          aria-selected={activeTab === 'pinkieswears'}
          className={`milestones-hub-tab-btn${activeTab === 'pinkieswears' ? ' active' : ''}`}
          onClick={() => {
            setActiveTab('pinkieswears')
            chime()
          }}
          role="tab"
          type="button"
        >
          <span aria-hidden="true" className="tab-icon">🤙</span>
          <span>Pinkies</span>
        </button>

        <button
          aria-selected={activeTab === 'recap'}
          className={`milestones-hub-tab-btn${activeTab === 'recap' ? ' active' : ''}`}
          onClick={() => {
            setActiveTab('recap')
            chime()
          }}
          role="tab"
          type="button"
        >
          <span aria-hidden="true" className="tab-icon">✨</span>
          <span>Recap</span>
        </button>
      </nav>

      {/* Main Tab Content */}
      <main className="milestones-hub-content">
        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: Living Constellation View (Choice 1A)                       */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'constellation' && (
          <section aria-label="Living Constellation Map" className="constellation-view">
            <div className="constellation-intro">
              <h4>Living Constellation</h4>
              <p>Every date night glows as an eternal star in your shared galaxy.</p>
            </div>

            <div className="constellation-canvas-wrapper">
              <svg
                aria-label="Celestial Constellation"
                className="constellation-svg"
                role="img"
                viewBox="0 0 320 340"
              >
                {/* Connecting glowing constellation path */}
                {constellationPath && (
                  <path
                    className="constellation-line"
                    d={constellationPath}
                    fill="none"
                    strokeWidth="2"
                  />
                )}

                {/* Star nodes */}
                {starNodes.map((star) => (
                  <g
                    className="constellation-star-node"
                    key={star.id}
                    onClick={() => {
                      setSelectedStar(star)
                      chime()
                    }}
                    tabIndex={0}
                  >
                    {/* Pulsing halo */}
                    <circle
                      className="star-halo"
                      cx={star.x}
                      cy={star.y}
                      fill="none"
                      r="14"
                      stroke="#e5c07b"
                      strokeWidth="1.5"
                    />
                    {/* Star center */}
                    <circle
                      cx={star.x}
                      cy={star.y}
                      fill="#fff9ee"
                      r="6"
                      stroke="#d4af37"
                      strokeWidth="2"
                    />
                    <text
                      fill="#e5c07b"
                      fontSize="9"
                      fontWeight="600"
                      textAnchor="middle"
                      x={star.x}
                      y={star.y + 20}
                    >
                      {star.title}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Star Detail Modal Popover */}
              {selectedStar && (
                <div className="star-detail-modal">
                  <div className="star-detail-header">
                    <strong>{selectedStar.title}</strong>
                    <button
                      aria-label="Dismiss Star Details"
                      className="star-detail-dismiss"
                      onClick={() => setSelectedStar(null)}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="star-detail-desc">{selectedStar.copy.line}</p>
                  <p className="star-detail-meta">
                    {selectedStar.copy.chapter} • {selectedStar.names.join(' & ')}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: Anniversary Time Capsule Vault (Choice 2B)                  */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'capsules' && (
          <section aria-label="Anniversary Time Capsules" className="capsules-view">
            {/* Real-world anniversary banner */}
            <div className="capsule-anniversary-banner">
              <div className="capsule-anniversary-text">
                <p>Anniversary Milestone</p>
                <h4>{anniversaryInfo ? anniversaryInfo.label : 'Set Your Date'}</h4>
              </div>
              <div className="capsule-countdown-badge">
                {anniversaryInfo ? `${anniversaryInfo.days} Days Left` : 'Add Date'}
              </div>
            </div>

            {/* Time capsules grid */}
            <div className="capsules-grid">
              {capsuleList.map((capsule) => (
                <article
                  className={`time-capsule-card ${capsule.isUnlocked ? 'unlocked' : 'sealed'}`}
                  key={capsule.id}
                >
                  <div className="capsule-card-top">
                    <span aria-hidden="true" className="capsule-wax-seal">
                      {capsule.seal}
                    </span>
                    <span className="capsule-status-tag">{capsule.countdownText}</span>
                  </div>
                  <div className="capsule-card-info">
                    <h5>{capsule.title}</h5>
                    <p>{capsule.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>

            {/* Form to Seal a Secret Vow */}
            <form className="capsule-vow-form" onSubmit={handleSealVow}>
              <label htmlFor="secret-vow-input">
                Seal a Secret Vow for Your Next Anniversary
              </label>
              <textarea
                className="capsule-vow-textarea"
                id="secret-vow-input"
                maxLength={300}
                onChange={(e) => setSecretVow(e.target.value)}
                placeholder="Write a sweet promise or memory that unlocks on your next anniversary..."
                value={secretVow}
              />
              <button
                className="capsule-vow-submit"
                disabled={!secretVow.trim()}
                type="submit"
              >
                Seal in Vault 🔒✨
              </button>
            </form>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: Pinkie Swears Ledger (Strictly Pinkie Swears 🤙)            */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'pinkieswears' && (
          <section aria-label="Pinkie Swears Ledger" className="pinkieswears-view">
            <div className="pinkieswears-hero">
              <span aria-hidden="true" className="pinkie-hero-stamp">🤙</span>
              <div className="pinkie-hero-text">
                <h4>Pinkie Swears Vault</h4>
                <p>Gentle promises made, honored, and saved forever.</p>
              </div>
            </div>

            <div className="pinkie-swears-list">
              {activePinkies.map((promise) => (
                <div className="pinkie-swear-item" key={promise.id}>
                  <div className="pinkie-swear-info">
                    <strong>{resolveKouponLabel(promise.label)}</strong>
                    <span className="pinkie-swear-status">Pinkie Promise Active 🤙</span>
                  </div>
                  <div className="pinkie-swear-actions">
                    <button
                      className="pinkie-redeem-btn"
                      onClick={() => {
                        redeemKoupon?.(promise.id)
                        chime('celebration')
                        showToast(`Redeemed Pinkie Swear: "${resolveKouponLabel(promise.label)}"! 💌`)
                      }}
                      type="button"
                    >
                      Redeem
                    </button>
                    <button
                      aria-label={`Mark ${resolveKouponLabel(promise.label)} fulfilled`}
                      className="pinkie-fulfill-btn"
                      onClick={() => {
                        fulfillKoupon?.(promise.id)
                        chime('celebration')
                        showToast(`Pinkie Swear fulfilled! ✓ 💖`)
                      }}
                      type="button"
                    >
                      ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Seal a New Custom Pinkie Swear */}
            <form className="capsule-vow-form" onSubmit={handleSealPinkie}>
              <label htmlFor="custom-pinkie-input">Make a New Pinkie Swear</label>
              <input
                className="text-input"
                id="custom-pinkie-input"
                maxLength={80}
                onChange={(e) => setCustomPinkie(e.target.value)}
                placeholder="e.g. Saturday coffee in bed, no phones"
                style={{ background: 'rgba(0,0,0,0.3)', color: '#fff' }}
                value={customPinkie}
              />
              <button
                className="capsule-vow-submit"
                disabled={!customPinkie.trim()}
                type="submit"
              >
                Seal Pinkie Swear 🤙
              </button>
            </form>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: Celestial Year in Review                                   */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'recap' && (
          <section aria-label="Celestial Year in Review" className="recap-view">
            <div className="recap-hero-tile">
              <h4>Our Story in the Stars</h4>
              <p>Every round, every heart, every shared smile aggregated.</p>
            </div>

            <div className="recap-grid-custom">
              <div className="recap-stat-card">
                <span aria-hidden="true" className="recap-stat-emoji">🌙</span>
                <span className="recap-stat-value">{progress?.lifetimeNights || 0}</span>
                <span className="recap-stat-label">Nights Played</span>
              </div>

              <div className="recap-stat-card">
                <span aria-hidden="true" className="recap-stat-emoji">💞</span>
                <span className="recap-stat-value">{progress?.lifetimeHearts || 0}</span>
                <span className="recap-stat-label">Hearts Earned</span>
              </div>

              <div className="recap-stat-card">
                <span aria-hidden="true" className="recap-stat-emoji">🔥</span>
                <span className="recap-stat-value">{progress?.streakCount || 0}</span>
                <span className="recap-stat-label">Night Streak</span>
              </div>

              <div className="recap-stat-card">
                <span aria-hidden="true" className="recap-stat-emoji">🤙</span>
                <span className="recap-stat-value">
                  {(progress?.koupons || []).filter((k) => k.status === 'fulfilled').length}
                </span>
                <span className="recap-stat-label">Pinkies Kept</span>
              </div>
            </div>

            <button
              className="recap-share-btn"
              onClick={handleShareRecap}
              type="button"
            >
              Share Celestial Story 💌
            </button>
          </section>
        )}
      </main>

      {/* Floating Toast */}
      {toastMessage && <div className="milestones-toast">{toastMessage}</div>}
    </aside>
  )
}
