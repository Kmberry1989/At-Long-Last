import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { JournalTimeline } from './JournalTimeline.jsx'
import './night-replay.css'

const HIGHLIGHT_LIMIT = 8
const HIGHLIGHT_PRIORITY = {
  keepsake: 5,
  duel: 4,
  canvas: 3,
  harmonic: 3,
  maze: 3,
  photo: 3,
  bluff: 2,
  journal: 2,
  match: 2,
  prediction: 2,
  prompt: 2,
  ritual: 2,
  tempo: 2,
  vault: 2,
  word: 2,
}
const HIGHLIGHT_FAMILY = {
  keepsake: 'keepsake',
  duel: 'duel',
  canvas: 'shared-activity',
  harmonic: 'shared-activity',
  maze: 'shared-activity',
  photo: 'shared-activity',
  bluff: 'conversation',
  journal: 'conversation',
  match: 'conversation',
  prediction: 'conversation',
  prompt: 'conversation',
  ritual: 'conversation',
  tempo: 'shared-activity',
  vault: 'conversation',
  word: 'shared-activity',
}

function isSealed(entry, now) {
  const openAt = entry.openAt || entry.payload?.openAt
  if (!openAt) return false
  const timestamp = typeof openAt.toDate === 'function' ? openAt.toDate().getTime() : new Date(openAt).getTime()
  return Number.isFinite(timestamp) && timestamp > now
}

function createdTime(entry) {
  const value = entry.createdAt
  const timestamp = typeof value?.toDate === 'function' ? value.toDate().getTime() : new Date(value || 0).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function selectNightHighlights(entries, now = Date.now()) {
  const candidates = entries
    .filter(entry => entry.type !== 'finale' && entry.type !== 'trophy' && !isSealed(entry, now))
    .map((entry, index) => ({ entry, index, family: HIGHLIGHT_FAMILY[entry.type] || 'other', priority: HIGHLIGHT_PRIORITY[entry.type] || 1, time: createdTime(entry) }))
    .sort((a, b) => b.priority - a.priority || a.time - b.time || a.index - b.index)
  const selected = []
  const families = new Set()
  for (const candidate of candidates) {
    if (families.has(candidate.family)) continue
    selected.push(candidate)
    families.add(candidate.family)
    if (selected.length === HIGHLIGHT_LIMIT) break
  }
  for (const candidate of candidates) {
    if (selected.length === HIGHLIGHT_LIMIT) break
    if (!selected.includes(candidate)) selected.push(candidate)
  }
  selected.sort((a, b) => a.time - b.time || a.index - b.index)
  return selected.map(({ entry }) => entry)
}

export function NightReplay({ entries, players = [], onClose }) {
  const closeRef = useRef(null)
  const highlights = useMemo(() => selectNightHighlights(entries), [entries])

  useEffect(() => {
    const previousFocus = document.activeElement
    closeRef.current?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose?.()
      if (event.key === 'Tab') {
        const dialog = closeRef.current?.closest('[role="dialog"]')
        const items = [...(dialog?.querySelectorAll('button:not(:disabled),a[href],select,input,textarea,[tabindex]:not([tabindex="-1"])') || [])]
        if (!items.length) return
        const first = items[0], last = items.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => { window.removeEventListener('keydown', onKeyDown); previousFocus?.focus?.() }
  }, [onClose])

  return createPortal(<div className="night-replay-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose?.() }}>
    <section aria-label="Replay this night" aria-modal="true" className="night-replay-dialog" role="dialog">
      <header className="night-replay-header">
        <div><p className="eyebrow">A few favorite pages</p><h2>Replay this night</h2></div>
        <button aria-label="Close replay" className="ghost-btn" onClick={onClose} ref={closeRef} type="button">Close</button>
      </header>
      <p className="night-replay-intro">A little rewind through the moments you saved together.</p>
      {highlights.length
        ? <JournalTimeline entries={highlights} players={players} revealVaults />
        : <div className="journal-card journal-empty scrapbook-empty"><strong>No saved moments to replay yet</strong></div>}
    </section>
  </div>, document.body)
}
