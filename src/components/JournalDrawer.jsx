import { useEffect, useMemo, useRef, useState } from 'react'
import { getScrapbookMomentCount } from '../features/session/journalHelpers.js'
import { JournalTimeline } from './JournalTimeline.jsx'
import { PairingStory } from './Milestones.jsx'
import { useAudio } from '../audio/AudioProvider.jsx'

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'activities', label: 'Activities' },
  { id: 'duels', label: 'Duels' },
  { id: 'keepsakes', label: 'Keepsakes' },
]

function matchesFilter(entry, filterId) {
  if (filterId === 'activities') {
    return !['duel', 'finale', 'keepsake'].includes(entry.type)
  }

  if (filterId === 'duels') {
    return entry.type === 'duel'
  }

  if (filterId === 'keepsakes') {
    return entry.type === 'keepsake'
  }

  return entry.type !== 'finale'
}

export function JournalDrawer({ entries, open, onClose, sessionId }) {
  const { setScrapbookOpen } = useAudio() || {}
  const [activeFilter, setActiveFilter] = useState('all')
  const [nightScope, setNightScope] = useState('tonight')
  useEffect(() => { setNightScope('tonight') }, [sessionId])
  const scopedEntries = useMemo(
    () => sessionId && nightScope === 'tonight' ? entries.filter(entry => entry.sessionId === sessionId) : entries,
    [entries, nightScope, sessionId],
  )
  const drawerRef = useRef(null)
  useEffect(() => {
    setScrapbookOpen?.(open)
    return () => setScrapbookOpen?.(false)
  }, [open, setScrapbookOpen])
  const finaleEntry = scopedEntries.find((entry) => entry.type === 'finale')
  const momentsCount = getScrapbookMomentCount(scopedEntries)
  const duelCount = scopedEntries.filter((entry) => entry.type === 'duel').length
  const keepsakeCount = scopedEntries.filter((entry) => entry.type === 'keepsake').length
  const headline = finaleEntry?.payload?.headline || 'Every good round deserves its own page.'
  const supportCopy =
    finaleEntry?.payload?.coda ||
    'Activities, duels, and keepsakes land here as little artifacts instead of one flat summary feed.'
  const filteredEntries = useMemo(
    () => scopedEntries.filter((entry) => matchesFilter(entry, activeFilter)),
    [activeFilter, scopedEntries],
  )

  useEffect(() => {
    if (open) {
      drawerRef.current?.scrollTo?.({ top: 0 })
    }
  }, [open])

  return (
    <aside aria-hidden={!open} inert={!open} className={`journal-drawer${open ? ' open' : ''}`} ref={drawerRef}>
      <div className="journal-header">
        <div className="journal-heading">
          <p className="eyebrow">Shared Scrapbook</p>
          <h3>{nightScope === 'all' ? 'Your Nights Together' : 'What You Made Tonight'}</h3>
          <p className="support-copy">{headline}</p>
        </div>
        <button className="ghost-btn" onClick={onClose} type="button">
          Back To Board
        </button>
      </div>
      <PairingStory />
      {sessionId && <details className="scrapbook-night-picker">
        <summary>{nightScope === 'tonight' ? 'Tonight' : 'All nights'} · Change view</summary>
        <label>
          <span>Scrapbook night</span>
          <select aria-label="Scrapbook night" value={nightScope} onChange={event => setNightScope(event.target.value)}>
            <option value="tonight">Tonight</option>
            <option value="all">All nights</option>
          </select>
        </label>
      </details>}
      <div className="scrapbook-overview">
        <div className="scrapbook-overview-copy">
          <strong>Saved for later</strong>
          <p>{supportCopy}</p>
        </div>
        <div className="scrapbook-overview-stats">
          <div>
            <strong>{momentsCount}</strong>
            <span>Moments</span>
          </div>
          <div>
            <strong>{duelCount}</strong>
            <span>Duels</span>
          </div>
          <div>
            <strong>{keepsakeCount}</strong>
            <span>Keepsakes</span>
          </div>
        </div>
      </div>
      {finaleEntry?.payload && (
        <div className="scrapbook-tonight-card">
          <div className="scrapbook-tonight-head">
            <span>Tonight</span>
            <strong>{finaleEntry.payload.presetLabel}</strong>
          </div>
          <p>{finaleEntry.payload.duelOutcomeLabel}</p>
          {finaleEntry.payload.goalBadges?.length > 0 && (
            <div className="scrapbook-tag-row">
              {finaleEntry.payload.goalBadges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="mode-toggle journal-filter-row" role="tablist" aria-label="Scrapbook filter">
        {FILTERS.map((filter) => (
          <button
            className={`mode-pill${activeFilter === filter.id ? ' active' : ''}`}
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
      <JournalTimeline entries={filteredEntries} />
    </aside>
  )
}
