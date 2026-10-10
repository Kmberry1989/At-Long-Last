import { useState } from 'react'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import {
  COMPANION_STAGES,
  fetchCoupleJournalExport,
} from '../features/couple/progressService.js'

/**
 * "Our story so far" — the relationship Wrapped. Aggregates the couple's
 * journal entries and shared progression record into a warm stat recap.
 * Pure and unit-tested; the component below only handles fetching.
 */
export function buildYearRecap(entries = [], progress = {}) {
  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)

  const dated = entries.filter((entry) => entry?.createdAt)
  const thisYear = dated.filter((entry) => new Date(entry.createdAt) >= yearStart)
  const sessionsThisYear = new Set(
    thisYear.map((entry) => entry.sessionId).filter(Boolean),
  ).size

  const duels = entries.filter((entry) => entry?.type === 'duel')
  const wavelengthScores = duels
    .map((entry) => entry?.payload?.wavelength?.matches)
    .filter((matches) => typeof matches === 'number')

  const vibeCounts = {}
  entries.forEach((entry) => {
    if (entry?.vibe) {
      vibeCounts[entry.vibe] = (vibeCounts[entry.vibe] || 0) + 1
    }
  })
  const topVibe =
    Object.entries(vibeCounts).sort((left, right) => right[1] - left[1])[0]?.[0] || null

  const koupons = progress.koupons || []
  const promisesFulfilled = koupons.filter((koupon) => koupon.status === 'fulfilled').length

  const companionStage =
    COMPANION_STAGES[progress?.companion?.stage] || COMPANION_STAGES[0]

  return {
    bestWavelength:
      wavelengthScores.length > 0 ? Math.max(...wavelengthScores) : null,
    companionStageLabel: companionStage.label,
    duelsPlayed: duels.length,
    hearts: progress.lifetimeHearts || 0,
    nights: progress.lifetimeNights || 0,
    nightsThisYear: sessionsThisYear,
    promisesFulfilled,
    streak: progress.streakCount || 0,
    themesUnlocked: (progress.unlockedThemes || []).length,
    topVibe,
    trophies: (progress.trophies || []).length,
  }
}

function recapShareText(recap) {
  const lines = ['Our story so far 💞']
  lines.push(
    `${recap.nights} night${recap.nights === 1 ? '' : 's'} together · ${recap.hearts} hearts earned`,
  )
  if (recap.streak > 1) {
    lines.push(`Date-night streak: ${recap.streak} 🔥`)
  }
  if (recap.duelsPlayed > 0) {
    lines.push(`${recap.duelsPlayed} duel${recap.duelsPlayed === 1 ? '' : 's'} played`)
  }
  if (recap.bestWavelength != null) {
    lines.push(`Best wavelength: ${recap.bestWavelength}/10`)
  }
  if (recap.promisesFulfilled > 0) {
    lines.push(`${recap.promisesFulfilled} promise${recap.promisesFulfilled === 1 ? '' : 's'} fulfilled`)
  }
  if (recap.topVibe) {
    lines.push(`Top vibe: ${recap.topVibe}`)
  }
  return lines.join('\n')
}

function StatTile({ emoji, label, value }) {
  return (
    <div className="recap-tile">
      <span aria-hidden="true">{emoji}</span>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

export function YearInReview() {
  const { couple, progress } = useCouple()
  const { db } = useFirebaseApp()
  const [status, setStatus] = useState('idle')
  const [recap, setRecap] = useState(null)
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    if (status === 'loading' || !db || !couple?.id) {
      return
    }

    setStatus('loading')
    setCopied(false)

    try {
      const entries = await fetchCoupleJournalExport(db, couple.id)
      setRecap(buildYearRecap(entries, progress))
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  async function handleCopy() {
    if (!recap) {
      return
    }

    try {
      await navigator.clipboard.writeText(recapShareText(recap))
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="progress-section">
      <h3>Our story so far</h3>
      <p className="support-copy">
        Your relationship Wrapped — every night, duel, and promise, distilled
        into the numbers that actually matter.
      </p>

      {status === 'idle' && (
        <button className="secondary-btn" onClick={handleGenerate} type="button">
          Build our recap ✨
        </button>
      )}

      {status === 'loading' && <p className="support-copy">Gathering your nights together…</p>}

      {status === 'error' && (
        <div>
          <p className="support-copy">Could not gather your story just now.</p>
          <button className="secondary-btn" onClick={handleGenerate} type="button">
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && recap && (
        <div>
          <div className="recap-grid">
            <StatTile emoji="🌙" label="nights together" value={recap.nights} />
            <StatTile emoji="💞" label="hearts earned" value={recap.hearts} />
            {recap.streak > 0 && (
              <StatTile emoji="🔥" label="night streak" value={recap.streak} />
            )}
            {recap.duelsPlayed > 0 && (
              <StatTile emoji="⚔️" label="duels played" value={recap.duelsPlayed} />
            )}
            {recap.bestWavelength != null && (
              <StatTile emoji="📡" label="best wavelength" value={`${recap.bestWavelength}/10`} />
            )}
            {recap.promisesFulfilled > 0 && (
              <StatTile emoji="💌" label="promises fulfilled" value={recap.promisesFulfilled} />
            )}
            {recap.trophies > 0 && (
              <StatTile emoji="🏆" label="trophies" value={recap.trophies} />
            )}
            {recap.themesUnlocked > 0 && (
              <StatTile emoji="🎨" label="themes unlocked" value={recap.themesUnlocked} />
            )}
            {recap.topVibe && (
              <StatTile emoji="☼" label="top vibe" value={recap.topVibe} />
            )}
            <StatTile emoji="✨" label="companion" value={recap.companionStageLabel} />
          </div>
          <div className="button-row">
            <button className="secondary-btn" onClick={handleCopy} type="button">
              {copied ? '✓ Copied' : 'Copy to share'}
            </button>
            <button className="secondary-link" onClick={handleGenerate} type="button">
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
