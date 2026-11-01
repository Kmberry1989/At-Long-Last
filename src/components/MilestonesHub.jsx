import { BrandText } from './BrandIcon.jsx'
import { BrandIcon } from './BrandIcon.jsx'
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

const promiseLabel = (promise) => resolveKouponLabel(promise.label)
function touchDrift(x, y, touchPoint) {
  if (!touchPoint) return {}
  const deltaX = x - touchPoint.x
  const deltaY = y - touchPoint.y
  const distance = Math.max(1, Math.hypot(deltaX, deltaY))
  const influence = Math.exp(-distance / 95)
  const radialPull = 8 * influence
  const swirl = 24 * influence
  return {
    '--touch-drift-x': `${(-deltaX / distance) * radialPull - (deltaY / distance) * swirl}px`,
    '--touch-drift-y': `${(-deltaY / distance) * radialPull + (deltaX / distance) * swirl}px`,
  }
}
const constellationDust = [
  [22, 42, 1], [86, 28, 1.4], [155, 50, 0.9], [238, 34, 1.2], [298, 72, 1],
  [30, 112, 1.2], [286, 142, 1.3], [24, 206, 0.9], [300, 218, 1.1],
  [34, 286, 1.2], [100, 316, 1], [172, 292, 1.4], [246, 318, 1], [296, 280, 1.3],
]

export function MilestonesHub({ initialTab = 'constellation', onClose, open = true }) {
  const audio = useAudio()
  const { couple, fulfillKoupon, grantKoupon, progress, redeemKoupon, setAnniversary } = useCouple()
  const { db } = useFirebaseApp()
  const { moments = [] } = useMilestones()

  const [activeTab, setActiveTab] = useState(initialTab)
  const [selectedStar, setSelectedStar] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [customPinkie, setCustomPinkie] = useState('')
  const [workingPromise, setWorkingPromise] = useState('')
  const [capsuleIndex, setCapsuleIndex] = useState(0)
  const [pinkieIndex, setPinkieIndex] = useState(0)
  const [recapIndex, setRecapIndex] = useState(0)
  const [anniversaryEditing, setAnniversaryEditing] = useState(false)
  const [anniversaryDraft, setAnniversaryDraft] = useState(progress?.anniversary || '')
  const [savingAnniversary, setSavingAnniversary] = useState(false)
  const [touchPoint, setTouchPoint] = useState(null)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const [recapData, setRecapData] = useState(null)
  const [recapLoading, setRecapLoading] = useState(false)

  const rootRef = useRef(null)
  const constellationRef = useRef(null)
  const swipeStartX = useRef(null)
  const touchResetTimer = useRef(null)
  const toastTimerRef = useRef(null)
  const activeViewIndex = ['constellation', 'capsules', 'pinkieswears', 'recap'].indexOf(activeTab)
  const vaultViews = [
    { id: 'constellation', label: 'Stars' },
    { id: 'capsules', label: 'Capsules' },
    { id: 'pinkieswears', label: 'Pinkies' },
    { id: 'recap', label: 'Recap' },
  ]

  function moveSection(direction) {
    const nextIndex = Math.max(0, Math.min(vaultViews.length - 1, activeViewIndex + direction))
    if (nextIndex !== activeViewIndex) {
      window.clearTimeout(toastTimerRef.current)
      setToastMessage('')
      setActiveTab(vaultViews[nextIndex].id)
      setSelectedStar(null)
      chime()
    }
  }

  function handleVaultTouchStart(event) {
    swipeStartX.current = event.touches[0]?.clientX ?? null
    setSwipeOffset(0)
  }

  function handleVaultTouchMove(event) {
    if (swipeStartX.current == null) return
    const delta = event.touches[0].clientX - swipeStartX.current
    setSwipeOffset(Math.max(-90, Math.min(90, delta)))
  }

  function handleVaultTouchEnd(event) {
    if (swipeStartX.current == null) return
    const delta = event.changedTouches[0].clientX - swipeStartX.current
    swipeStartX.current = null
    setSwipeOffset(0)
    if (Math.abs(delta) < 55) return
    moveSection(delta < 0 ? 1 : -1)
  }

  function followMapTouch(event) {
    const bounds = constellationRef.current?.getBoundingClientRect()
    if (!bounds?.width || !bounds?.height) return
    window.clearTimeout(touchResetTimer.current)
    setTouchPoint({
      x: Math.max(0, Math.min(320, ((event.clientX - bounds.left) / bounds.width) * 320)),
      y: Math.max(0, Math.min(340, ((event.clientY - bounds.top) / bounds.height) * 340)),
    })
  }

  function releaseMapTouch() {
    window.clearTimeout(touchResetTimer.current)
    touchResetTimer.current = window.setTimeout(() => setTouchPoint(null), 1450)
  }

  // Focus and Escape key handling
  useEffect(() => {
    if (!open) return
    const prevActive = document.activeElement
    rootRef.current?.focus()
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      } else if (e.key === 'ArrowRight' && e.target.closest?.('input, textarea, button') == null) {
        e.preventDefault()
        moveSection(1)
      } else if (e.key === 'ArrowLeft' && e.target.closest?.('input, textarea, button') == null) {
        e.preventDefault()
        moveSection(-1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      prevActive?.focus?.()
    }
  }, [activeViewIndex, onClose, open])

  useEffect(() => () => {
    window.clearTimeout(touchResetTimer.current)
    window.clearTimeout(toastTimerRef.current)
  }, [])

  // Toast trigger with auto-dismiss
  function showToast(msg) {
    window.clearTimeout(toastTimerRef.current)
    setToastMessage(msg)
    toastTimerRef.current = window.setTimeout(() => {
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
        // Spread the constellation through the available sky even when it has
        // only a couple of saved milestones.
        const progress = moments.length < 2 ? 0.5 : idx / (moments.length - 1)
        const x = 60 + progress * 200
        const y = 38 + progress * 264
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
  const visiblePinkies = useMemo(
    () => (progress?.koupons || []).filter((promise) => ['active', 'redeemed'].includes(promise.status)),
    [progress?.koupons],
  )
  const selectedPinkieIndex = Math.min(pinkieIndex, Math.max(0, visiblePinkies.length - 1))
  const selectedPinkie = visiblePinkies[selectedPinkieIndex]

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
  const recapStats = [
    { icon: 'moon', label: 'Nights', value: progress?.lifetimeNights || 0 },
    { icon: 'heart', label: 'Hearts', value: progress?.lifetimeHearts || 0 },
    { icon: 'flame', label: 'Streak', value: progress?.streakCount || 0 },
    { icon: 'promise', label: 'Pinkies kept', value: (progress?.koupons || []).filter((item) => item.status === 'fulfilled').length },
  ]

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

  async function saveAnniversaryDate() {
    if (!anniversaryDraft || savingAnniversary) return
    setSavingAnniversary(true)
    try {
      const result = await setAnniversary?.(anniversaryDraft)
      if (!result) throw new Error('Date could not be saved')
      setAnniversaryEditing(false)
      showToast('Date saved')
      chime()
    } catch (error) {
      showToast(error?.message ? `Could not save: ${error.message}` : 'Could not save date. Try again.')
    } finally {
      setSavingAnniversary(false)
    }
  }

  // Handle creating a new Pinkie Swear
  function handleSealPinkie(e) {
    e.preventDefault()
    const label = customPinkie.trim()
    if (!label || workingPromise) return
    setWorkingPromise('new')
    Promise.resolve(grantKoupon?.(label)).then((result) => {
      if (!result?.granted) throw new Error('Promise could not be saved')
      chime('celebration')
      showToast('Promise saved')
      setCustomPinkie('')
    }).catch((error) => showToast(error?.message ? `Could not save: ${error.message}` : 'Could not save. Try again.')).finally(() => setWorkingPromise(''))
  }

  async function handleRedeemPinkie(promise) {
    if (workingPromise) return
    setWorkingPromise(promise.id)
    try {
      const result = await redeemKoupon?.(promise.id)
      if (!result?.redeemed) throw new Error('Promise is no longer ready')
      chime('celebration')
      showToast('Promise called in')
    } catch (error) {
      showToast(error?.message ? `Could not use: ${error.message}` : 'Could not use this promise. Try again.')
    } finally {
      setWorkingPromise('')
    }
  }

  async function handleFulfillPinkie(promise) {
    if (workingPromise) return
    setWorkingPromise(promise.id)
    try {
      const result = await fulfillKoupon?.(promise.id)
      const kept = result?.progress?.koupons?.some((entry) => entry.id === promise.id && entry.status === 'fulfilled')
      if (!kept) throw new Error('Promise is not waiting to be kept')
      chime('celebration')
      showToast('Marked as kept')
    } catch (error) {
      showToast(error?.message ? `Could not update: ${error.message}` : 'Could not update this promise. Try again.')
    } finally {
      setWorkingPromise('')
    }
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
      style={{ '--vault-parallax-x': `${(activeViewIndex - 1.5) * 8 + swipeOffset * 0.14}px` }}
      ref={rootRef}
      role="dialog"
      tabIndex={-1}
    >
      <div aria-hidden="true" className="milestones-hub-stars" />

      <button
        aria-label="Close Vault"
        className="milestones-hub-close-btn"
        onClick={onClose}
        type="button"
      ><BrandIcon name="close" /></button>

      {/* Main Tab Content */}
      <main aria-live="polite" className="milestones-hub-content" onTouchStart={handleVaultTouchStart} onTouchMove={handleVaultTouchMove} onTouchEnd={handleVaultTouchEnd}>
        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: Living Constellation View (Choice 1A)                       */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'constellation' && (
          <section aria-label="Living Constellation Map" className="constellation-view">
            <div className="constellation-intro">
              <h4>Living Constellation</h4>
            </div>

            <div className="constellation-canvas-wrapper" onPointerDown={followMapTouch} onPointerMove={followMapTouch} onPointerUp={releaseMapTouch} onPointerCancel={releaseMapTouch} ref={constellationRef}>
              <svg
                aria-label="Celestial Constellation"
                className="constellation-svg"
                role="img"
                viewBox="0 0 320 340"
              >
                <g aria-hidden="true" className="constellation-dust">
                  {constellationDust.map(([x, y, radius], index) => (
                    <circle
                      cx={x}
                      cy={y}
                      key={`${x}-${y}`}
                      r={radius}
                      style={{ '--dust-delay': `${(index * 1.13) % 7}s`, '--dust-duration': `${5 + (index % 5)}s`, ...touchDrift(x, y, touchPoint) }}
                    />
                  ))}
                </g>
                {touchPoint && (
                  <g aria-hidden="true" className="touch-swirl" transform={`translate(${touchPoint.x} ${touchPoint.y})`}>
                    <g className="touch-swirl-orbit">
                      <circle className="touch-swirl-trail" cx="0" cy="0" r="20" />
                      <circle className="touch-swirl-spark" cx="20" cy="0" r="1.8" />
                      <circle className="touch-swirl-spark" cx="-10" cy="17" r="1.5" />
                      <circle className="touch-swirl-spark" cx="-10" cy="-17" r="1.3" />
                    </g>
                  </g>
                )}
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
                {starNodes.map((star, index) => (
                  <g
                    className="constellation-star-node"
                    key={star.id}
                    style={{ '--twinkle-delay': `${(index * 1.37) % 5}s`, '--twinkle-duration': `${4 + (index % 4)}s`, ...touchDrift(star.x, star.y, touchPoint) }}
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
                    ><BrandText text={"✕ "} /></button>
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

        {/* Capsule cards advance by swipe or arrow. */}
        {activeTab === 'capsules' && (
          <section aria-label="Anniversary Time Capsules" className="capsules-view">
            <div className="capsule-anniversary-banner">
              <div className="capsule-anniversary-text">
                <p>Anniversary</p>
                <h4>{anniversaryInfo ? anniversaryInfo.label : 'Not set'}</h4>
              </div>
              <button className="capsule-countdown-badge" onClick={() => { setAnniversaryDraft(progress?.anniversary || ''); setAnniversaryEditing(true) }} type="button">{anniversaryInfo ? 'Edit date' : 'Set date'}</button>
            </div>

            <div aria-label="Capsules" className="capsules-grid capsule-carousel">
              {capsuleList[capsuleIndex] && (() => {
                const capsule = capsuleList[capsuleIndex]
                return <article className={`time-capsule-card ${capsule.isUnlocked ? 'unlocked' : 'sealed'}`} key={capsule.id}>
                  <div className="capsule-card-top">
                    <span aria-hidden="true" className="capsule-wax-seal">
                      <BrandText text={capsule.seal} />
                    </span>
                    <span className="capsule-status-tag">{capsule.countdownText}</span>
                  </div>
                  <div className="capsule-card-info">
                    <h5>{capsule.title}</h5>
                  </div>
                </article>
              })()}
            </div>
            <div aria-label="Capsule position" className="capsule-card-pager">
              <button aria-label="Previous capsule" disabled={capsuleIndex === 0} onClick={() => setCapsuleIndex((index) => Math.max(0, index - 1))} type="button"><BrandIcon name="back" /></button>
              <span>{capsuleIndex + 1} of {capsuleList.length}</span>
              <button aria-label="Next capsule" disabled={capsuleIndex >= capsuleList.length - 1} onClick={() => setCapsuleIndex((index) => Math.min(capsuleList.length - 1, index + 1))} type="button"><BrandIcon name="back" /></button>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: Pinkie Swears Ledger (Strictly Pinkie Swears 🤙)            */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'pinkieswears' && (
          <section aria-label="Pinkie Swears Ledger" className="pinkieswears-view">
            <div className="pinkieswears-hero">
              <span aria-hidden="true" className="pinkie-hero-stamp"><BrandText text={"🤙"} /></span>
              <div className="pinkie-hero-text"><h4>Promises</h4></div>
            </div>

            <div className="pinkie-swears-list pinkie-carousel">
              {selectedPinkie ? (
                <div className="pinkie-swear-item" key={selectedPinkie.id}>
                  <div className="pinkie-swear-info">
                    <strong>{promiseLabel(selectedPinkie)}</strong>
                    <span className="pinkie-swear-status">{selectedPinkie.status === 'active' ? 'Ready' : 'Called in'}</span>
                  </div>
                  <div className="pinkie-swear-actions">
                    {selectedPinkie.status === 'active' ? <button className="pinkie-redeem-btn" disabled={Boolean(workingPromise)} onClick={() => handleRedeemPinkie(selectedPinkie)} type="button">{workingPromise === selectedPinkie.id ? '…' : 'Use'}</button> : <button className="pinkie-redeem-btn" disabled={Boolean(workingPromise)} onClick={() => handleFulfillPinkie(selectedPinkie)} type="button">{workingPromise === selectedPinkie.id ? '…' : 'Mark kept'}</button>}
                  </div>
                </div>
              ) : <p className="pinkie-empty">No promises yet</p>}
              {visiblePinkies.length > 1 && <div aria-label="Promise position" className="pinkie-card-pager">
                <button aria-label="Previous promise" disabled={selectedPinkieIndex === 0} onClick={() => setPinkieIndex((index) => Math.max(0, index - 1))} type="button"><BrandIcon name="back" /></button>
                <span>{selectedPinkieIndex + 1} of {visiblePinkies.length}</span>
                <button aria-label="Next promise" disabled={selectedPinkieIndex >= visiblePinkies.length - 1} onClick={() => setPinkieIndex((index) => Math.min(visiblePinkies.length - 1, index + 1))} type="button"><BrandIcon name="back" /></button>
              </div>}
            </div>

            <form className="capsule-vow-form" onSubmit={handleSealPinkie}>
              <input
                className="text-input"
                id="custom-pinkie-input"
                maxLength={80}
                onChange={(e) => setCustomPinkie(e.target.value)}
                placeholder="A promise to add…"
                aria-label="A promise to add"
                value={customPinkie}
              />
              <button
                className="capsule-vow-submit"
                disabled={!customPinkie.trim()}
                type="submit"
              ><BrandText text={workingPromise === 'new' ? 'Saving…' : 'Add'} /></button>
            </form>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: Celestial Year in Review                                   */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'recap' && (
          <section aria-label="Celestial Year in Review" className="recap-view">
            <div className="recap-hero-tile">
              <h4>Our Story</h4>
            </div>

            <div className="recap-stat-carousel" aria-label="Story statistics">
              <article className="recap-stat-card">
                <BrandIcon name={recapStats[recapIndex].icon} />
                <span className="recap-stat-value">{recapStats[recapIndex].value}</span>
                <span className="recap-stat-label">{recapStats[recapIndex].label}</span>
              </article>
              <div className="pinkie-card-pager">
                <button aria-label="Previous statistic" disabled={recapIndex === 0} onClick={() => setRecapIndex((index) => Math.max(0, index - 1))} type="button"><BrandIcon name="back" /></button>
                <span>{recapIndex + 1} of {recapStats.length}</span>
                <button aria-label="Next statistic" disabled={recapIndex >= recapStats.length - 1} onClick={() => setRecapIndex((index) => Math.min(recapStats.length - 1, index + 1))} type="button"><BrandIcon name="back" /></button>
              </div>
            </div>

            <button
              className="recap-share-btn"
              onClick={handleShareRecap}
              type="button"
            ><BrandText text={"Share Celestial Story 💌 "} /></button>
          </section>
        )}
      </main>

      <nav aria-label="Vault sections" className="vault-pager">
        <button aria-label="Previous section" disabled={activeViewIndex === 0} onClick={() => moveSection(-1)} type="button"><BrandIcon name="back" /></button>
        <div aria-live="polite" className="vault-pager-label"><strong>{vaultViews[activeViewIndex]?.label}</strong><span>{activeViewIndex + 1} / {vaultViews.length}</span></div>
        <button aria-label="Next section" disabled={activeViewIndex >= vaultViews.length - 1} onClick={() => moveSection(1)} type="button"><BrandIcon name="back" /></button>
      </nav>

      {anniversaryEditing && <div className="anniversary-date-backdrop" onClick={(event) => { if (event.target === event.currentTarget) setAnniversaryEditing(false) }}>
        <form aria-labelledby="anniversary-date-heading" className="anniversary-date-dialog" onSubmit={(event) => { event.preventDefault(); saveAnniversaryDate() }}>
          <h3 id="anniversary-date-heading">Our date</h3>
          <input aria-label="Anniversary date" className="text-input" max={new Date().toISOString().slice(0, 10)} onChange={(event) => setAnniversaryDraft(event.target.value)} type="date" value={anniversaryDraft} />
          <div className="anniversary-date-actions"><button className="capsule-vow-submit" disabled={!anniversaryDraft || savingAnniversary} type="submit">{savingAnniversary ? 'Saving…' : 'Save'}</button><button className="secondary-link" onClick={() => setAnniversaryEditing(false)} type="button">Cancel</button></div>
        </form>
      </div>}

      {/* Floating Toast */}
      {toastMessage && <div className="milestones-toast"><BrandText text={toastMessage} /></div>}
    </aside>
  )
}
