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
      <div className="journal-list">
        {entries.length === 0 ? (
          <div className="journal-card">
            <strong>Nothing logged yet.</strong>
            <p>The board will start filling this drawer as soon as you roll.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="journal-card">
              <p className="entry-type">{entry.type}</p>
              <strong>{entry.title}</strong>
              <p>{entry.summary}</p>
            </article>
          ))
        )}
      </div>
    </aside>
  )
}
