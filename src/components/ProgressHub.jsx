import { useState } from 'react'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { YearInReview } from './YearInReview.jsx'
import {
  BASE_THEME_CARDS,
  COMPANION_STAGES,
  COMPANION_STAGE_EMOJI,
  NUDGE_COOLDOWN_MS,
  TROPHIES,
  UNLOCKABLE_THEMES,
  fetchCoupleJournalExport,
  localDateStr,
  nextAnniversaryCountdown,
  spendableHearts,
} from '../features/couple/progressService.js'

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
        setNudgeNote(`Nudge sent — one love tap every 12 hours. Try again in ~${hours}h.`)
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
        <span>night streak</span>
      </div>
      {(progress?.freezeTokens || 0) > 0 && (
        <span
          className="freeze-chip"
          title="Freeze tokens save your streak when life gets in the way."
        >
          ❄️ {progress.freezeTokens}
        </span>
      )}
      <div className="nudge-zone">
        {incomingNudge ? (
          <div className="nudge-incoming-row">
            <p className="nudge-incoming">
              <strong>{nudge.byName}</strong> nudged you {timeAgo(nudge.at)} — they are
              thinking about game night.
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
              {coolingDown ? 'Nudged ✓' : nudging ? 'Sending…' : 'Nudge partner 💌'}
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
        <span>hearts to spend</span>
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
      <h3>Tabletop themes</h3>
      <p className="support-copy">Spend the hearts you earn together on new looks for the board. Picking a theme dresses the whole night in it.</p>
      <div className="theme-grid">
        <button
          className={`theme-card${selected === null ? ' selected' : ''}`}
          onClick={() => selectTheme(null)}
          type="button"
        >
          <span className="theme-name">Surprise us</span>
          <span className="theme-blurb">The board changes its look every round.</span>
          {selected === null && <span className="theme-check">✓</span>}
        </button>
        {BASE_THEME_CARDS.map((theme) => (
          <button
            className={`theme-card${selected === theme.id ? ' selected' : ''}`}
            key={theme.id}
            onClick={() => selectTheme(theme.id)}
            type="button"
          >
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
              <span className="theme-name">{theme.label}</span>
              <span className="theme-blurb">{theme.blurb}</span>
              {isUnlocked ? (
                <button
                  className="secondary-btn"
                  disabled={selected === theme.id}
                  onClick={() => selectTheme(theme.id)}
                  type="button"
                >
                  {selected === theme.id ? '✓ Selected' : 'Use theme'}
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

function CompanionCard() {
  const { progress, renameCompanion } = useCouple()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const companion = progress?.companion || { heartsFed: 0, name: 'Ember', stage: 0 }
  const stage = COMPANION_STAGES[companion.stage] || COMPANION_STAGES[0]
  const nextStage = COMPANION_STAGES[companion.stage + 1]

  async function saveName() {
    const trimmed = name.trim()
    if (trimmed) {
      await renameCompanion(trimmed)
    }
    setEditing(false)
    setName('')
  }

  return (
    <div className="progress-section">
      <h3>Companion</h3>
      <div className="companion-card">
        <span className="companion-emoji" aria-hidden="true">
          {COMPANION_STAGE_EMOJI[companion.stage] || '🥚'}
        </span>
        <div>
          <strong>{companion.name}</strong>
          <span className="companion-stage">{stage.label}</span>
          {nextStage ? (
            <span className="companion-progress">
              {companion.heartsFed}/{nextStage.heartsNeeded} hearts to {nextStage.label}
            </span>
          ) : (
            <span className="companion-progress">Fully radiant. What a pair you are.</span>
          )}
        </div>
        {!editing ? (
          <button className="secondary-link" onClick={() => setEditing(true)} type="button">
            Rename
          </button>
        ) : (
          <div className="inline-editor">
            <input
              className="text-input"
              maxLength={40}
              onChange={(event) => setName(event.target.value)}
              placeholder="Companion name"
              value={name}
            />
            <div className="button-row">
              <button className="primary-btn alt" onClick={saveName} type="button">
                Save
              </button>
              <button className="secondary-link" onClick={() => setEditing(false)} type="button">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="support-copy">Every heart you earn together feeds {companion.name}.</p>
    </div>
  )
}

function TrophyCase() {
  const { progress } = useCouple()
  const earned = new Set(progress?.trophies || [])

  return (
    <div className="progress-section">
      <h3>Trophy case</h3>
      <div className="trophy-grid">
        {TROPHIES.map((trophy) => {
          const hasIt = earned.has(trophy.id)

          return (
            <div className={`trophy${hasIt ? ' earned' : ' locked'}`} key={trophy.id} title={trophy.detail}>
              <span aria-hidden="true">{hasIt ? '🏆' : '🔒'}</span>
              <strong>{trophy.label}</strong>
              <span>{trophy.detail}</span>
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
      <h3>Promise wallet</h3>
      {promises.length === 0 ? (
        <p className="support-copy">
          No promises yet. Finish nights together and the deck deals you little
          promises to gift each other.
        </p>
      ) : (
        <div className="koupon-list">
          {promises.map((promise) => (
            <div className="koupon" key={promise.id}>
              <div>
                <strong>{promise.label}</strong>
                {promise.detail && <span>{promise.detail}</span>}
              </div>
              <div className="button-row">
                <button className="primary-btn alt" onClick={() => redeemKoupon(promise.id)} type="button">
                  Redeem
                </button>
                <button className="secondary-link" onClick={() => fulfillKoupon(promise.id)} type="button">
                  Mark fulfilled
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
      <h3>Milestones</h3>
      {countdown ? (
        <p className="support-copy">
          💍 <strong>{countdown.days} days</strong> until your anniversary ({countdown.label}).
        </p>
      ) : (
        <p className="support-copy">Add your anniversary and we will count down to it together.</p>
      )}
      {!editing ? (
        <button className="secondary-link" onClick={() => setEditing(true)} type="button">
          {progress?.anniversary ? 'Change anniversary' : 'Set anniversary'}
        </button>
      ) : (
        <div className="inline-editor">
          <input
            className="text-input"
            onChange={(event) => setDate(event.target.value)}
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
      <h3>Your memories, yours to keep</h3>
      <p className="support-copy">
        Download your whole story — every scrapbook entry, trophy, and streak —
        as a JSON file. Whatever happens, your nights together are portable.
      </p>
      <button
        className="secondary-btn"
        disabled={busy}
        onClick={handleExport}
        type="button"
      >
        {busy ? 'Gathering…' : done ? '✓ Downloaded' : 'Export our memories'}
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
      <p className="eyebrow">Our collection</p>
      <h2>Everything you have built together.</h2>
      <StreakRow />
      <HeartsRow />
      <ThemePicker />
      <CompanionCard />
      <TrophyCase />
      <PromiseWallet />
      <AnniversaryRow />
      <YearInReview />
      <ExportSection />
    </div>
  )
}
