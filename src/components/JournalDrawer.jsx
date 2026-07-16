import { JournalTimeline } from './JournalTimeline.jsx'

export function JournalDrawer({ entries, open, onClose }) {
  return (
    <aside className={`journal-drawer${open ? ' open' : ''}`}>
      <div className="journal-header">
        <div>
          <p className="eyebrow">Shared Journal</p>
          <h3>What You Made Tonight</h3>
        </div>
        <button className="ghost-btn" onClick={onClose} type="button">
          Close
        </button>
      </div>
      <JournalTimeline entries={entries} />
    </aside>
  )
}
