import { useEffect, useMemo, useRef, useState } from 'react'
import { getScrapbookMomentCount } from '../features/session/journalHelpers.js'
import { JournalTimeline } from './JournalTimeline.jsx'
import { PairingStory } from './Milestones.jsx'
import { useAudio } from '../audio/AudioProvider.jsx'
import { createPortal } from 'react-dom'
import { NightReplay } from './NightReplay.jsx'

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

export function JournalDrawer({ entries, open, onClose, players = [], sessionId }) {
  const { setScrapbookOpen } = useAudio() || {}
  const [activeFilter, setActiveFilter] = useState('all')
  const [nightScope, setNightScope] = useState('tonight')
  const [replaySessionId, setReplaySessionId] = useState(null)
  const completedNights = useMemo(() => {
    const seen = new Set()
    return entries.filter(entry => {
      if (entry.type !== 'finale' || !entry.sessionId || seen.has(entry.sessionId)) return false
      seen.add(entry.sessionId)
      return true
    })
  }, [entries])
  useEffect(() => { setNightScope('tonight') }, [sessionId])
  const scopedEntries = useMemo(
    () => {
      if (nightScope === 'all') return entries
      const selectedSessionId = nightScope === 'tonight' ? sessionId : nightScope.slice('night:'.length)
      return selectedSessionId ? entries.filter(entry => entry.sessionId === selectedSessionId) : entries
    },
    [entries, nightScope, sessionId],
  )
  const drawerRef = useRef(null)
  useEffect(() => {
    setScrapbookOpen?.(open)
    return () => setScrapbookOpen?.(false)
  }, [open, setScrapbookOpen])
  const finaleEntry = scopedEntries.find((entry) => entry.type === 'finale')
  const selectedNightLabel = nightScope === 'tonight'
    ? 'Tonight'
    : nightScope === 'all'
      ? 'All nights'
      : finaleEntry?.payload?.presetLabel || 'Completed night'
  const momentsCount = getScrapbookMomentCount(scopedEntries)
  const duelCount = scopedEntries.filter((entry) => entry.type === 'duel').length
  const keepsakeCount = scopedEntries.filter((entry) => entry.type === 'keepsake').length
  const headline = finaleEntry?.payload?.headline || 'Every good round deserves its own page.'
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
        <summary>{selectedNightLabel} · Change view</summary>
        <label>
          <span>Scrapbook night</span>
          <select aria-label="Scrapbook night" value={nightScope} onChange={event => setNightScope(event.target.value)}>
            <option value="tonight">Tonight</option>
            <option value="all">All nights</option>
            {completedNights.filter(entry => entry.sessionId !== sessionId).map(entry => <option key={entry.sessionId} value={`night:${entry.sessionId}`}>{entry.payload?.presetLabel || entry.title || 'Completed night'}</option>)}
          </select>
        </label>
      </details>}
      <div className="scrapbook-overview">
        <div className="scrapbook-overview-copy">
          <strong>Saved for later</strong>
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
            <span>{nightScope === 'tonight' ? 'Tonight' : 'Completed night'}</span>
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
          {nightScope !== 'all' && finaleEntry.sessionId && <button className="scrapbook-replay-action" onClick={() => setReplaySessionId(finaleEntry.sessionId)} type="button">Replay this night</button>}
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
      <JournalTimeline entries={filteredEntries} players={players} onReplayNight={id => { if (id) setReplaySessionId(id) }} />
      {replaySessionId && createPortal(<NightReplay entries={entries.filter(entry => entry.sessionId === replaySessionId)} players={players} onClose={() => setReplaySessionId(null)} />, document.body)}
    </aside>
  )
}
