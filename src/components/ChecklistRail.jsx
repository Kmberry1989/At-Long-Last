import { nightChecklistProgress } from '../features/session/sessionLogic.js'

/**
 * The night checklist rail: five small goals that complete themselves from
 * live session state. Everything is "we" — the night is a shared checklist,
 * not a scoreboard.
 */
export function ChecklistRail({ session }) {
  const { done, items, total } = nightChecklistProgress(session)

  if (!session) {
    return null
  }

  return (
    <div
      aria-label={`Night checklist: ${done} of ${total} complete`}
      className="checklist-rail"
    >
      {items.map((item) => (
        <span
          className={`checklist-item${item.done ? ' done' : ''}`}
          key={item.id}
          title={item.label}
        >
          <span aria-hidden="true">{item.done ? '✓' : '○'}</span>
          <span className="checklist-label">{item.label}</span>
        </span>
      ))}
    </div>
  )
}
