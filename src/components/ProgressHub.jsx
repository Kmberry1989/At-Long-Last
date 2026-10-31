import { Suspense, lazy, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { YearInReview } from './YearInReview.jsx'
import {
  BASE_THEME_CARDS,
  FLOWER_STAGES,
  NUDGE_COOLDOWN_MS,
  TROPHIES,
  UNLOCKABLE_THEMES,
  fetchCoupleJournalExport,
  localDateStr,
  nextAnniversaryCountdown,
  activeFlowerSpecies,
  resolveFlower,
  spendableHearts,
  resolveKouponLabel,
} from '../features/couple/progressService.js'
import { getFlowerSpecies } from '../flower/flowerSpecies.js'

const FlowerScene = lazy(() => import('../flower/FlowerScene.jsx').then((module) => ({ default: module.FlowerScene })))

function timeAgo(timestamp) {
  if (!timestamp?.toDate) {
    return ''
  }

  const seconds = Math.max(1, Math.floor((Date.now() - timestamp.toDate().getTime()) / 1000))

  if (seconds < 60) {
    return 'just now'
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  return `${Math.floor(hours / 24)}d ago`
}

function StreakRow() {
  const { clearNudge, progress, sendNudge } = useCouple()
  const { userId } = useFirebaseApp()
  const [nudging, setNudging] = useState(false)
  const [nudgeNote, setNudgeNote] = useState('')
  const nudge = progress?.nudge
  const incomingNudge = nudge && nudge.byUid !== userId
  const myLastNudgeAt = !incomingNudge && nudge?.at?.toDate?.()?.getTime?.()
  const coolingDown = Boolean(myLastNudgeAt && Date.now() - myLastNudgeAt < NUDGE_COOLDOWN_MS)

  async function handleNudge() {
    if (nudging || coolingDown) {
      return
    }
    setNudging(true)
    setNudgeNote('')
    try {
      const result = await sendNudge()
      if (result && result.sent === false) {
        const hours = Math.max(1, Math.ceil((result.retryAfterMs || 0) / 3600000))
        setNudgeNote(`Try again in ~${hours}h.`)
      }
    } finally {
      setNudging(false)
    }
  }

  return (
    <div className="progress-row streak-row">
      <div className="streak-flame" aria-label={`${progress?.streakCount || 0} night streak`}>
        <span aria-hidden="true">🔥</span>
        <strong>{progress?.streakCount || 0}</strong>
      </div>
      {(progress?.freezeTokens || 0) > 0 && (
        <span className="freeze-chip">
          ❄️ {progress.freezeTokens}
        </span>
      )}
      <div className="nudge-zone">
        {incomingNudge ? (
          <div className="nudge-incoming-row">
            <p className="nudge-incoming">
              <strong>{nudge.byName}</strong> nudged you {timeAgo(nudge.at)}
            </p>
            <button className="secondary-link" onClick={clearNudge} type="button">
              Dismiss
            </button>
          </div>
        ) : (
          <>
            <button
              className="secondary-btn"
              disabled={coolingDown || nudging}
              onClick={handleNudge}
              type="button"
            >
              {coolingDown ? 'Nudged ✓' : nudging ? 'Sending…' : 'Nudge 💌'}
            </button>
            {nudgeNote && <p className="support-copy">{nudgeNote}</p>}
          </>
        )}
      </div>
    </div>
  )
}

function HeartsRow() {
  const { progress } = useCouple()
  const spendable = spendableHearts(progress)

  return (
    <div className="progress-row hearts-row">
      <div className="love-tank-mini" aria-label={`${spendable} hearts to spend`}>
        <span aria-hidden="true">💗</span>
        <strong>{spendable}</strong>
      </div>
      <span className="lifetime-chip">{progress?.lifetimeNights || 0} nights together</span>
    </div>
  )
}

function ThemePicker() {
  const { progress, selectTheme, unlockTheme } = useCouple()
  const [unlockingId, setUnlockingId] = useState(null)
  const spendable = spendableHearts(progress)
  const selected = progress?.selectedTheme || null
  const unlocked = progress?.unlockedThemes || []

  async function handleUnlock(theme) {
    setUnlockingId(theme.id)
    try {
      await unlockTheme(theme.id)
    } finally {
      setUnlockingId(null)
    }
  }

  return (
    <div className="progress-section">
      <h3>Themes</h3>

      <div className="theme-grid">
        <button
          className={`theme-card${selected === null ? ' selected' : ''}`}
          onClick={() => selectTheme(null)}
          type="button"
        >
          <span className="theme-name">Surprise us</span>

          {selected === null && <span className="theme-check">✓</span>}
        </button>
        {BASE_THEME_CARDS.map((theme) => (
          <button
            className={`theme-card${selected === theme.id ? ' selected' : ''}`}
            key={theme.id}
            onClick={() => selectTheme(theme.id)}
            type="button"
          >
            <img alt="" className="theme-art" loading="lazy" src={theme.art} />
            <span className="theme-name">{theme.label}</span>
            {selected === theme.id && <span className="theme-check">✓</span>}
          </button>
        ))}
        {UNLOCKABLE_THEMES.map((theme) => {
          const isUnlocked = unlocked.includes(theme.id)
          const affordable = spendable >= theme.cost

          return (
            <div
              className={`theme-card unlockable${selected === theme.id ? ' selected' : ''}${isUnlocked ? '' : ' locked'}`}
              key={theme.id}
            >
              <img alt="" className="theme-art" loading="lazy" src={theme.art} />
              <span className="theme-name">{theme.label}</span>

              {isUnlocked ? (
                <button
                  className="secondary-btn"
                  aria-label={selected === theme.id ? `Selected: ${theme.label}` : `Use ${theme.label}`}
                  disabled={selected === theme.id}
                  onClick={() => selectTheme(theme.id)}
                  type="button"
                >
                  {selected === theme.id ? '✓' : 'Use'}
                </button>
              ) : (
                <button
                  className="primary-btn"
                  disabled={!affordable || unlockingId === theme.id}
                  onClick={() => handleUnlock(theme)}
                  type="button"
                >
                  {unlockingId === theme.id ? 'Unlocking…' : `Unlock · 💗${theme.cost}`}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FlowerCard() {
  const { couple, pickFlower, progress, waterFlower } = useCouple()
  const { userId } = useFirebaseApp()
  const { playAction, playSuccess } = useAudio()
  const [watering, setWatering] = useState(false)
  const [picking, setPicking] = useState(false)
  const [note, setNote] = useState('')
  const [revealedId, setRevealedId] = useState(null)
  const flower = resolveFlower(progress)
  const activeSpecies = activeFlowerSpecies(flower)
  const stage = FLOWER_STAGES[flower.stage] || FLOWER_STAGES[0]
  const nextStage = FLOWER_STAGES[flower.stage + 1]
  const iWatered = (flower.wateredBy || []).includes(userId)
  const partnerWatered = (flower.wateredBy || []).some((waterer) => waterer !== userId)
  const partnerName =
    couple?.players?.find((player) => player.uid !== userId)?.displayName || 'Your partner'

  async function handleWater() {
    if (watering || iWatered) {
      return
    }
    setWatering(true)
    setNote('')
    try {
      playAction?.()
      const result = await waterFlower()
      const event = result?.events?.find((entry) => entry.type === 'flower-watered')
      if (event?.grew) {
        playSuccess?.()
        setNote('You both watered today — it grew a little.')
      } else {
        setNote('Watered. It grows once your partner waters today too.')
      }
    } finally {
      setWatering(false)
    }
  }

  async function handlePick() {
    if (picking || flower.stage < 3) return
    setPicking(true)
    try {
      playAction?.()
      const result = await pickFlower()
      const picked = result?.events?.find((entry) => entry.type === 'flower-picked')
      if (picked) {
        setRevealedId(picked.speciesId)
        setNote('')
        playSuccess?.()
      }
    } finally {
      setPicking(false)
    }
  }

  return (
    <div className="progress-section">
      <h3>Our Bloom</h3>
      <div className="companion-card">
        {activeSpecies ? (
          <Suspense fallback={<div className="flower-scene" aria-hidden="true" />}>
            <FlowerScene onPick={flower.stage === 3 ? handlePick : undefined} speciesId={activeSpecies.id} stage={flower.stage} wateredCount={flower.wateredBy?.length || 0} />
          </Suspense>
        ) : <div className="flower-scene flower-complete" aria-hidden="true">✦</div>}
        <div className="flower-card-copy">
          <strong>{activeSpecies ? `${stage.label} · mystery flower` : 'Our garden is in bloom'}</strong>
          <span className="companion-stage">
            {activeSpecies && (flower.stage === 3
              ? 'Fully grown. Pick it to discover what you grew.'
              : <>{iWatered ? 'You watered today' : 'You have not watered today'}
                {partnerWatered ? ` · ${partnerName} watered today` : ` · Waiting on ${partnerName}`}</>)}
          </span>
          {activeSpecies && nextStage ? (
            <span className="companion-progress">
              {flower.growth}/{nextStage.growthNeeded} days both watered to {nextStage.label}
            </span>
          ) : null}
        </div>
        {activeSpecies && (flower.stage === 3
          ? <button className="primary-btn alt" disabled={picking} onClick={handlePick} type="button">{picking ? 'Picking…' : 'Pick the bloom'}</button>
          : <button className="primary-btn alt" disabled={iWatered || watering} onClick={handleWater} type="button">{iWatered ? '✓ Watered' : watering ? 'Watering…' : 'Water 💧'}</button>)}
      </div>
      {note && <p className="support-copy">{note}</p>}
      {revealedId && <div className="flower-reveal" role="status"><strong>You grew a {getFlowerSpecies(revealedId).name} together.</strong><span>It’s now part of your collection.</span><button aria-label="Dismiss flower reveal" onClick={() => setRevealedId(null)} type="button">×</button></div>}
      {flower.collected.length > 0 && <div className="flower-collection"><h4>Our collection · {flower.collected.length}</h4><div className="flower-collection-grid">{flower.collected.map((speciesId) => <div className="flower-collection-item" key={speciesId}><Suspense fallback={<div className="flower-scene compact" aria-hidden="true" />}><FlowerScene compact revealName speciesId={speciesId} stage={3} /></Suspense><span>{getFlowerSpecies(speciesId).name}</span></div>)}</div></div>}
      {activeSpecies && <p className="support-copy">It grows only on days you both water it. Its name stays a mystery until you pick it.</p>}
    </div>
  )
}

function TrophyCase() {
  const { progress } = useCouple()
  const earned = new Set(progress?.trophies || [])

  return (
    <div className="progress-section">
      <div className="trophy-grid">
        {TROPHIES.map((trophy) => {
          const hasIt = earned.has(trophy.id)

          return (
            <div className={`trophy${hasIt ? ' earned' : ' locked'}`} key={trophy.id}>
              <span aria-hidden="true">{hasIt ? '🏆' : '🔒'}</span>
              <strong>{trophy.label}</strong>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PromiseWallet() {
  const { progress, redeemKoupon, fulfillKoupon } = useCouple()
  const promises = (progress?.koupons || []).filter((koupon) => koupon.status === 'active')

  return (
    <div className="progress-section">
      <h3>Pinky swears</h3>
      {promises.length === 0 ? (
        <p className="support-copy">
          No pinky swears yet
        </p>
      ) : (
        <div className="koupon-list">
          {promises.map((promise) => (
            <div className="koupon" key={promise.id}>
              <div>
                <strong>{resolveKouponLabel(promise.label)}</strong>
              </div>
              <div className="button-row">
                <button className="primary-btn alt" onClick={() => redeemKoupon(promise.id)} type="button">
                  Redeem
                </button>
                <button aria-label={`Mark ${resolveKouponLabel(promise.label)} fulfilled`} className="secondary-link" onClick={() => fulfillKoupon(promise.id)} type="button">
                  <span aria-hidden="true">✓</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AnniversaryRow() {
  const { progress, setAnniversary } = useCouple()
  const [editing, setEditing] = useState(false)
  const [date, setDate] = useState(progress?.anniversary || '')
  const countdown = nextAnniversaryCountdown(progress?.anniversary)

  async function save() {
    if (date) {
      await setAnniversary(date)
    }
    setEditing(false)
  }

  return (
    <div className="progress-section">
      <h3>Anniversary</h3>
      {countdown && (
        <p className="support-copy">
          💍 <strong>{countdown.days} days</strong> · {countdown.label}
        </p>
      )}
      {!editing ? (
        <button className="secondary-link" onClick={() => setEditing(true)} type="button">
          {progress?.anniversary ? 'Edit' : 'Set date'}
        </button>
      ) : (
        <div className="inline-editor">
          <input
            className="text-input"
            onChange={(event) => setDate(event.target.value)}
            aria-label="Anniversary date"
            type="date"
            value={date}
          />
          <div className="button-row">
            <button className="primary-btn alt" disabled={!date} onClick={save} type="button">
              Save
            </button>
            <button className="secondary-link" onClick={() => setEditing(false)} type="button">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ExportSection() {
  const { couple, progress } = useCouple()
  const { db } = useFirebaseApp()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function handleExport() {
    if (busy || !db || !couple?.id) {
      return
    }

    setBusy(true)
    setDone(false)

    try {
      const journalEntries = await fetchCoupleJournalExport(db, couple.id)
      const companion = progress?.companion || {}
      const flower = progress?.flower || {}
      const payload = {
        app: 'at-long-last',
        couple: { id: couple.id },
        exportedAt: new Date().toISOString(),
        journalEntries,
        progress: {
          anniversary: progress?.anniversary || null,
          companion: {
            heartsFed: companion.heartsFed || 0,
            name: companion.name || null,
            stage: companion.stage || 0,
          },
          flower: {
            collected: flower.collected || [],
            growth: flower.growth || 0,
            speciesIndex: flower.speciesIndex || 0,
            stage: flower.stage || 0,
            wateredBy: flower.wateredBy || [],
            wateredDate: flower.wateredDate || null,
          },
          freezeTokens: progress?.freezeTokens || 0,
          heartsSpent: progress?.heartsSpent || 0,
          lifetimeHearts: progress?.lifetimeHearts || 0,
          lifetimeNights: progress?.lifetimeNights || 0,
          selectedTheme: progress?.selectedTheme || null,
          streakCount: progress?.streakCount || 0,
          trophies: progress?.trophies || [],
          unlockedThemes: progress?.unlockedThemes || [],
        },
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `at-long-last-memories-${localDateStr()}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      setDone(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="progress-section">
      <h3>Memories</h3>
      <p className="support-copy">
        Download your data (JSON)
      </p>
      <button
        className="secondary-btn"
        aria-label={done ? "Downloaded" : undefined}
        disabled={busy}
        onClick={handleExport}
        type="button"
      >
        {busy ? 'Gathering…' : done ? '✓' : 'Download'}
      </button>
    </div>
  )
}

export function ProgressHub() {
  const { progress } = useCouple()

  if (!progress) {
    return null
  }

  return (
    <div className="progress-hub">
      <StreakRow />
      <HeartsRow />
      <ThemePicker />
      <FlowerCard />
      <TrophyCase />
      <PromiseWallet />
      <AnniversaryRow />
      <YearInReview />
      <ExportSection />
    </div>
  )
}
