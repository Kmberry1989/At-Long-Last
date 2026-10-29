export function LoginStreak({ streak }) {
  if (!streak?.dayCount) return null
  const page = Math.floor((streak.dayCount - 1) / 7)
  const filled = ((streak.dayCount - 1) % 7) + 1
  return (
    <details className="login-streak" open>
      <summary>{streak.dayCount} day{streak.dayCount === 1 ? '' : 's'} in a row <span> · {streak.weekCount} week{streak.weekCount === 1 ? '' : 's'}</span></summary>
      <div className="login-streak-boxes" aria-label="Daily login milestones">
        {Array.from({ length: 7 }, (_, index) => (
          <div className={`login-day${index < filled ? ' checked' : ''}`} key={page * 7 + index}>
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 17 L13 23 L26 9" /></svg>
            <span>Day {page * 7 + index + 1}</span>
            <span className="sr-only">{index < filled ? 'Complete' : 'Upcoming'}</span>
          </div>
        ))}
      </div>
      <p>Best: {streak.bestDayCount} day{streak.bestDayCount === 1 ? '' : 's'}.</p>
    </details>
  )
}
