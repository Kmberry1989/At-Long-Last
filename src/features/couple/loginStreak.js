const DAY_MS = 86400000

export function loginDate(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function dayNumber(date) {
  return Date.parse(`${date}T00:00:00Z`) / DAY_MS
}

function weekNumber(date) {
  // Monday-based calendar weeks, anchored to 1970-01-05.
  return Math.floor((dayNumber(date) - 4) / 7)
}

export function advanceLoginStreak(previous = {}, date = loginDate()) {
  if (previous.lastDate === date || (previous.lastDate && date < previous.lastDate)) return previous
  const consecutive = previous.lastDate && dayNumber(date) - dayNumber(previous.lastDate) === 1
  const dayCount = consecutive ? (previous.dayCount || 0) + 1 : 1
  const week = weekNumber(date)
  const oldWeek = previous.lastDate ? weekNumber(previous.lastDate) : null
  const weekCount = oldWeek === week ? previous.weekCount || 1 : oldWeek === week - 1 ? (previous.weekCount || 0) + 1 : 1
  return {
    lastDate: date,
    dayCount,
    weekCount,
    bestDayCount: Math.max(previous.bestDayCount || 0, dayCount),
  }
}
