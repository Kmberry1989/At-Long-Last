import { useEffect, useMemo, useRef, useState } from 'react'
import { JournalTimeline } from './JournalTimeline.jsx'

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

export function JournalDrawer({ entries, open, onClose }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const drawerRef = useRef(null)
  const finaleEntry = entries.find((entry) => entry.type === 'finale')
  const momentsCount = entries.filter((entry) => entry.type !== 'finale').length
  const duelCount = entries.filter((entry) => entry.type === 'duel').length
  const keepsakeCount = entries.filter((entry) => entry.type === 'keepsake').length
  const headline = finaleEntry?.payload?.headline || 'Every good round deserves its own page.'
  const supportCopy =
    finaleEntry?.payload?.coda ||
    'Activities, duels, and keepsakes land here as little artifacts instead of one flat summary feed.'
  const filteredEntries = useMemo(
    () => entries.filter((entry) => matchesFilter(entry, activeFilter)),
    [activeFilter, entries],
  )

  useEffect(() => {
    if (open) {
      drawerRef.current?.scrollTo({ top: 0 })
    }
  }, [open])

  return (
    <aside className={`journal-drawer${open ? ' open' : ''}`} ref={drawerRef}>
      <div className="journal-header">
        <div className="journal-heading">
          <p className="eyebrow">Shared Scrapbook</p>
          <h3>What You Made Tonight</h3>
          <p className="support-copy">{headline}</p>
        </div>
        <button className="ghost-btn" onClick={onClose} type="button">
          Back To Board
        </button>
      </div>
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
            <strong>{finaleEntry.payload.presetLabel} night</strong>
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
