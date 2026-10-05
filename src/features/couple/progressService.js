import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore'

export const BASE_THEME_CARDS = [
  { art: '/assets/themes/tabletop-cozy-night-in.png', id: 'cozy', label: 'Cozy night in' },
  { art: '/assets/themes/tabletop-secret-garden.png', id: 'garden', label: 'Secret garden' },
  { art: '/assets/themes/tabletop-seaside-date.png', id: 'beach', label: 'Seaside date' },
  { art: '/assets/themes/tabletop-city-date-night.png', id: 'city', label: 'City date night' },
  { art: '/assets/themes/tabletop-holiday-sparkle.png', id: 'holiday', label: 'Holiday sparkle' },
]

export const UNLOCKABLE_THEMES = [
  {
    art: '/assets/themes/unlock-starlit-rooftop.png',
    blurb: 'String lights, skyline hum, just the two of you above it all.',
    cost: 60,
    id: 'starlit-rooftop',
    label: 'Starlit Rooftop',
  },
  {
    art: '/assets/themes/unlock-autumn-embers.png',
    blurb: 'Crackling leaves and cider-warm light.',
    cost: 120,
    id: 'autumn-embers',
    label: 'Autumn Embers',
  },
  {
    art: '/assets/themes/unlock-cherry-blossom.png',
    blurb: 'A soft storm of petals over the board.',
    cost: 200,
    id: 'cherry-blossom',
    label: 'Cherry Blossom',
  },
  {
    art: '/assets/themes/unlock-aurora-veil.png',
    blurb: 'The sky itself leans in to watch you play.',
    cost: 320,
    id: 'aurora-veil',
    label: 'Aurora Veil',
  },
]

export const TROPHIES = [
  { detail: 'Closed out your very first game night.', id: 'first-night', label: 'First Night' },
  { detail: 'Ten nights together and counting.', id: 'ten-nights', label: 'Ten Nights' },
  { detail: 'Twenty-five nights of play.', id: 'twentyfive-nights', label: 'Silver 25' },
  { detail: 'Fifty nights. That is devotion.', id: 'fifty-nights', label: 'Golden 50' },
  { detail: 'A 7-night streak, together.', id: 'streak-7', label: 'Week of Us' },
  { detail: 'A 30-night streak, together.', id: 'streak-30', label: 'Month of Us' },
  { detail: 'Shared a duel victory.', id: 'duel-champions', label: 'Duel Champions' },
  { detail: 'Matched on a sealed prediction.', id: 'mind-reader', label: 'Mind Reader' },
  { detail: 'Pocketed 3 keepsakes in one night.', id: 'keepsake-keeper', label: 'Keepsake Keeper' },
  { detail: 'Unlocked a tabletop theme.', id: 'theme-collector', label: 'Table Stylist' },
  { detail: 'Fulfilled a koupon dare.', id: 'koupon-giver', label: 'Promise Keeper' },
  { detail: 'Finished a full-length night.', id: 'marathon', label: 'Marathoners' },
  { detail: 'Matched on a sealed desire card.', id: 'mutual-yes', label: 'Mutual Yes' },
]

export const TROPHY_IDS = TROPHIES.map((trophy) => trophy.id)

export const KOUPON_DECK = [
  { detail: 'Delivered with zero occasion required.', label: 'Breakfast in bed' },
  { detail: 'The other person picks, no vetoes, no sighing.', label: 'Movie night, your pick' },
  { detail: 'Twenty minutes, no talking about logistics.', label: 'Shoulder rub' },
  { detail: 'Phones stay home. Both of them.', label: 'Phone-free walk' },
  { detail: 'Two forks, one plate, no sharing regrets.', label: 'Dessert of your choice' },
  { detail: 'Every song, every skip, all day.', label: 'Control the playlist' },
  { detail: 'Sleep in. The morning can wait.', label: 'Sleep-in pass' },
  { detail: 'Blanket, sky, each other.', label: 'Stargazing date' },
  { detail: 'A cuisine neither of you has tried.', label: 'Cook something new' },
  { detail: 'Planned in secret, revealed with flair.', label: 'Surprise date' },
  { detail: 'Sealed, dated, opened next year.', label: 'Letter to each other' },
  { detail: 'Somewhere neither of you has been.', label: 'Day trip, your call' },
  { detail: 'Their favorite takeout, ordered before they ask.', label: 'Takeout surprise' },
  { detail: 'No agenda. Just us, out in the world.', label: 'Slow morning together' },
  { detail: 'A playlist that sounds like the two of you.', label: 'Make them a playlist' },
  { detail: 'One photo of you, printed and framed.', label: 'Framed photo' },
  { detail: 'Their least-favorite chore, done before they notice.', label: 'Chore takeover' },
  { detail: 'Exactly how they take it, delivered in bed.', label: 'Morning coffee run' },
]

export const COMPANION_STAGES = [
  { heartsNeeded: 0, label: 'A quiet egg' },
  { heartsNeeded: 50, label: 'Hatchling' },
  { heartsNeeded: 150, label: 'Glowkeeper' },
  { heartsNeeded: 300, label: 'Radiant' },
]

export const COMPANION_STAGE_EMOJI = ['🥚', '🐣', '✨', '🌟']

export const NUDGE_COOLDOWN_MS = 12 * 60 * 60 * 1000

export const MILESTONE_NIGHTS = [1, 10, 25, 50, 100]

export function buildDefaultProgress(coupleId) {
  return {
    anniversary: null,
    companion: { heartsFed: 0, name: 'Ember', stage: 0 },
    coupleId,
    createdAt: serverTimestamp(),
    freezeTokens: 1,
    heartsSpent: 0,
    koupons: [],
    lastBankedSessionId: null,
    lifetimeHearts: 0,
    lifetimeNights: 0,
    nudge: null,
    // Absent = auto: the board rotates its look each round. Any theme id pins
    // the whole night to that look. The key is omitted (not null) because the
    // security rules only accept a bounded string when it is present.
    streakCount: 0,
    streakLastDate: null,
    trophies: [],
    unlockedThemes: [],
    updatedAt: serverTimestamp(),
  }
}

export function spendableHearts(progress) {
  if (!progress) {
    return 0
  }

  return Math.max(0, (progress.lifetimeHearts || 0) - (progress.heartsSpent || 0))
}

export function companionStageForHearts(heartsFed) {
  let stage = 0
  COMPANION_STAGES.forEach((entry, index) => {
    if (heartsFed >= entry.heartsNeeded) {
      stage = index
    }
  })
  return stage
}

export function previousDateStr(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}

export function localDateStr(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function awardTrophy(progress, events, trophyId) {
  if (!TROPHY_IDS.includes(trophyId)) {
    return
  }

  if (!progress.trophies.includes(trophyId)) {
    progress.trophies = [...progress.trophies, trophyId]
    events.push({ trophyId, type: 'trophy' })
  }
}

/**
 * Pure night-completion reducer. Returns the next progress doc plus the
 * events (trophies, milestones, freeze usage) the UI should celebrate.
 */
export function applyNightComplete(progress, { dateStr, heartsEarned = 0, stats = {} }) {
  const next = {
    ...progress,
    companion: { ...progress.companion },
    koupons: [...(progress.koupons || [])],
    trophies: [...(progress.trophies || [])],
    unlockedThemes: [...(progress.unlockedThemes || [])],
  }
  const events = []
  const earned = Math.max(0, Math.round(heartsEarned) || 0)

  next.lifetimeHearts = (next.lifetimeHearts || 0) + earned
  next.lifetimeNights = (next.lifetimeNights || 0) + 1
  next.companion.heartsFed = (next.companion.heartsFed || 0) + earned
  next.companion.stage = companionStageForHearts(next.companion.heartsFed)

  if (next.streakLastDate !== dateStr) {
    if (next.streakLastDate && previousDateStr(dateStr) === next.streakLastDate) {
      next.streakCount = (next.streakCount || 0) + 1
    } else if ((next.freezeTokens || 0) > 0 && next.streakLastDate) {
      next.freezeTokens -= 1
      next.streakCount = (next.streakCount || 0) + 1
      events.push({ type: 'freeze-used' })
    } else {
      next.streakCount = 1
    }
    next.streakLastDate = dateStr

    if (next.streakCount > 0 && next.streakCount % 7 === 0 && next.freezeTokens < 5) {
      next.freezeTokens += 1
      events.push({ type: 'freeze-earned' })
    }
  }

  if (MILESTONE_NIGHTS.includes(next.lifetimeNights)) {
    events.push({ nights: next.lifetimeNights, type: 'milestone' })
  }

  if (next.lifetimeNights >= 1) awardTrophy(next, events, 'first-night')
  if (next.lifetimeNights >= 10) awardTrophy(next, events, 'ten-nights')
  if (next.lifetimeNights >= 25) awardTrophy(next, events, 'twentyfive-nights')
  if (next.lifetimeNights >= 50) awardTrophy(next, events, 'fifty-nights')
  if (next.streakCount >= 7) awardTrophy(next, events, 'streak-7')
  if (next.streakCount >= 30) awardTrophy(next, events, 'streak-30')
  if (stats.sharedDuelWins > 0) awardTrophy(next, events, 'duel-champions')
  if (stats.sealedMatches > 0) awardTrophy(next, events, 'mind-reader')
  if (stats.keepsakes >= 3) awardTrophy(next, events, 'keepsake-keeper')
  if (stats.preset === 'long') awardTrophy(next, events, 'marathon')
  if (stats.mutualYesMatches > 0) awardTrophy(next, events, 'mutual-yes')

  return { events, progress: next }
}

export function pickKouponForGrant(progress, random = Math.random) {
  const activeLabels = new Set(
    (progress.koupons || []).filter((k) => k.status === 'active').map((k) => k.label),
  )
  const available = KOUPON_DECK.filter((entry) => !activeLabels.has(entry.label))
  if (available.length === 0) {
    return null
  }

  return available[Math.floor(random() * available.length)]
}

export function buildKouponRecord(entry, random = Math.random) {
  const stamp = Math.floor(random() * 1e9).toString(36)
  return {
    createdAt: serverTimestamp(),
    detail: entry.detail || '',
    fulfilledAt: null,
    id: `koupon-${Date.now().toString(36)}-${stamp}`,
    label: entry.label,
    redeemedAt: null,
    status: 'active',
  }
}

export async function ensureCoupleProgress(db, coupleId) {
  const ref = doc(db, 'coupleProgress', coupleId)
  const snapshot = await getDoc(ref)

  if (snapshot.exists()) {
    return { id: ref.id, ...snapshot.data() }
  }

  const payload = buildDefaultProgress(coupleId)
  await setDoc(ref, payload)
  return { id: ref.id, ...payload }
}

export function subscribeToCoupleProgress(db, coupleId, onNext, onError) {
  return onSnapshot(
    doc(db, 'coupleProgress', coupleId),
    (snapshot) => {
      onNext(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)
    },
    onError,
  )
}

async function transactProgress(db, coupleId, mutate) {
  const ref = doc(db, 'coupleProgress', coupleId)

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)
    const current = snapshot.exists()
      ? { id: snapshot.id, ...snapshot.data() }
      : { ...buildDefaultProgress(coupleId), id: coupleId }

    const { events = [], progress: next, deletedFields = [], ...rest } = mutate(current) || {}
    const existed = snapshot.exists()

    const payload = {
      ...next,
      coupleId,
      createdAt: current.createdAt || serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
    delete payload.id
    for (const field of deletedFields) {
      payload[field] = deleteField()
    }

    if (existed) {
      transaction.update(ref, payload)
    } else {
      transaction.set(ref, payload)
    }

    return { events, progress: { id: coupleId, ...payload }, ...rest }
  })
}

export async function recordNightComplete(
  db,
  coupleId,
  { buildEntries = () => [], dateStr, heartsEarned, sessionId, stats },
) {
  const progressRef = doc(db, 'coupleProgress', coupleId)

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(progressRef)
    const current = snapshot.exists()
      ? { id: snapshot.id, ...snapshot.data() }
      : { ...buildDefaultProgress(coupleId), id: coupleId }

    // Idempotency: a retried or second-phone finale for the same session is a
    // no-op, so a night can never be banked twice.
    if (sessionId && current.lastBankedSessionId === sessionId) {
      return { alreadyRecorded: true, events: [], progress: current }
    }

    const { events = [], progress: next } =
      applyNightComplete(current, { dateStr, heartsEarned, stats }) || {}

    const payload = {
      ...next,
      coupleId,
      createdAt: current.createdAt || serverTimestamp(),
      lastBankedSessionId: sessionId || null,
      updatedAt: serverTimestamp(),
    }
    delete payload.id

    if (snapshot.exists()) {
      transaction.update(progressRef, payload)
    } else {
      transaction.set(progressRef, payload)
    }

    // Milestone and trophy journal entries ride in the same transaction, with
    // deterministic ids, so a retry can never duplicate them.
    if (sessionId) {
      const entries = (buildEntries(events) || []).filter(Boolean)
      entries.forEach((entry, index) => {
        transaction.set(
          doc(collection(db, 'journalEntries'), `${sessionId}-progress-${index}`),
          {
            ...entry,
            createdAt: serverTimestamp(),
            sessionId,
          },
        )
      })
    }

    return {
      alreadyRecorded: false,
      events,
      progress: { id: coupleId, ...payload },
    }
  })
}

export async function unlockThemeWithHearts(db, coupleId, themeId) {
  const theme = UNLOCKABLE_THEMES.find((entry) => entry.id === themeId)

  if (!theme) {
    throw new Error('That theme is not unlockable.')
  }

  const { events, progress } = await transactProgress(db, coupleId, (current) => {
    const next = {
      ...current,
      trophies: [...(current.trophies || [])],
      unlockedThemes: [...(current.unlockedThemes || [])],
    }
    const localEvents = []

    if (next.unlockedThemes.includes(themeId)) {
      return { events: localEvents, progress: next }
    }

    if (spendableHearts(next) < theme.cost) {
      throw new Error(`You need ${theme.cost} hearts to unlock ${theme.label}.`)
    }

    next.heartsSpent = (next.heartsSpent || 0) + theme.cost
    next.unlockedThemes = [...next.unlockedThemes, themeId]
    next.selectedTheme = themeId
    awardTrophy(next, localEvents, 'theme-collector')

    return { events: localEvents, progress: next }
  })

  return { events, progress }
}

export async function selectTheme(db, coupleId, themeId) {
  // null = auto: the board rotates its look each round. The field is deleted
  // (not nulled) because the security rules only accept a bounded string.
  if (themeId !== null) {
    const allIds = [
      ...BASE_THEME_CARDS.map((entry) => entry.id),
      ...UNLOCKABLE_THEMES.map((entry) => entry.id),
    ]

    if (!allIds.includes(themeId)) {
      throw new Error('Unknown theme.')
    }
  }

  const { progress } = await transactProgress(db, coupleId, (current) => {
    if (
      UNLOCKABLE_THEMES.some((entry) => entry.id === themeId) &&
      !(current.unlockedThemes || []).includes(themeId)
    ) {
      throw new Error('Unlock that theme with hearts first.')
    }

    if (themeId === null) {
      return { deletedFields: ['selectedTheme'], events: [], progress: { ...current } }
    }

    return { events: [], progress: { ...current, selectedTheme: themeId } }
  })

  return progress
}

export async function grantKoupon(db, coupleId, entry = null, random = Math.random) {
  const { granted, progress } = await transactProgress(db, coupleId, (current) => {
    const pick = entry || pickKouponForGrant(current, random)

    if (!pick) {
      return { events: [], granted: null, progress: current }
    }

    const record = buildKouponRecord(pick, random)

    return {
      events: [{ koupon: pick.label, type: 'koupon-granted' }],
      granted: record,
      progress: {
        ...current,
        koupons: [...(current.koupons || []), record],
      },
    }
  })

  return { granted, progress }
}

export async function redeemKoupon(db, coupleId, kouponId) {
  const { progress } = await transactProgress(db, coupleId, (current) => {
    const koupons = (current.koupons || []).map((koupon) =>
      koupon.id === kouponId && koupon.status === 'active'
        ? { ...koupon, redeemedAt: serverTimestamp(), status: 'redeemed' }
        : koupon,
    )

    return { events: [], progress: { ...current, koupons } }
  })

  return progress
}

export async function fulfillKoupon(db, coupleId, kouponId) {
  const { events, progress } = await transactProgress(db, coupleId, (current) => {
    let fulfilled = false
    const koupons = (current.koupons || []).map((koupon) => {
      if (koupon.id === kouponId && koupon.status === 'redeemed') {
        fulfilled = true
        return { ...koupon, fulfilledAt: serverTimestamp(), status: 'fulfilled' }
      }

      return koupon
    })

    const next = {
      ...current,
      koupons,
      lifetimeHearts: (current.lifetimeHearts || 0) + (fulfilled ? 4 : 0),
      trophies: [...(current.trophies || [])],
    }
    const localEvents = []

    if (fulfilled) {
      next.companion = { ...next.companion }
      next.companion.heartsFed = (next.companion.heartsFed || 0) + 4
      next.companion.stage = companionStageForHearts(next.companion.heartsFed)
      awardTrophy(next, localEvents, 'koupon-giver')
    }

    return { events: localEvents, progress: next }
  })

  return { events, progress }
}

export async function renameCompanion(db, coupleId, name) {
  const trimmed = name.trim().slice(0, 40)

  if (!trimmed) {
    throw new Error('Give your companion a name first.')
  }

  const { progress } = await transactProgress(db, coupleId, (current) => ({
    events: [],
    progress: {
      ...current,
      companion: { ...current.companion, name: trimmed },
    },
  }))

  return progress
}

export async function setAnniversary(db, coupleId, dateStr) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateStr)) {
    throw new Error('Use a YYYY-MM-DD date.')
  }

  const { progress } = await transactProgress(db, coupleId, (current) => ({
    events: [],
    progress: { ...current, anniversary: dateStr },
  }))

  return progress
}

export async function sendNudge(db, coupleId, { byName, byUid }) {
  const ref = doc(db, 'coupleProgress', coupleId)

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)
    const current = snapshot.exists()
      ? { id: snapshot.id, ...snapshot.data() }
      : { ...buildDefaultProgress(coupleId), id: coupleId }

    // Cooldown keeps the nudge a love tap, not a nag.
    const lastAt = current.nudge?.at?.toDate?.()?.getTime?.()
    if (lastAt && Date.now() - lastAt < NUDGE_COOLDOWN_MS) {
      return { retryAfterMs: NUDGE_COOLDOWN_MS - (Date.now() - lastAt), sent: false }
    }

    const payload = {
      ...current,
      coupleId,
      createdAt: current.createdAt || serverTimestamp(),
      nudge: {
        at: serverTimestamp(),
        byName: byName.trim().slice(0, 60),
        byUid,
      },
      updatedAt: serverTimestamp(),
    }
    delete payload.id

    if (snapshot.exists()) {
      transaction.update(ref, payload)
    } else {
      transaction.set(ref, payload)
    }

    return { retryAfterMs: 0, sent: true }
  })
}

export async function clearNudge(db, coupleId) {
  const ref = doc(db, 'coupleProgress', coupleId)

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref)

    if (!snapshot.exists()) {
      return
    }

    transaction.update(ref, { nudge: null, updatedAt: serverTimestamp() })
  })
}

export function nextAnniversaryCountdown(anniversary, now = new Date()) {
  if (!anniversary) {
    return null
  }

  const [, month, day] = anniversary.split('-').map(Number)
  const thisYear = new Date(now.getFullYear(), month - 1, day)
  const target = thisYear < now
    ? new Date(now.getFullYear() + 1, month - 1, day)
    : thisYear
  const days = Math.round((target - now) / 86400000)

  return { days, label: target.toLocaleDateString(undefined, { month: 'long', day: 'numeric' }) }
}

function isoOrNull(value) {
  try {
    const time = value?.toDate?.()?.getTime?.()
    return typeof time === 'number' ? new Date(time).toISOString() : null
  } catch {
    return null
  }
}

function sanitizeExportValue(value) {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value?.toDate === 'function') {
    return isoOrNull(value)
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeExportValue)
  }

  if (typeof value === 'object') {
    // Firestore internals (server-timestamp sentinels, etc.) are class
    // instances — only plain objects survive the export.
    const proto = Object.getPrototypeOf(value)
    if (proto !== Object.prototype && proto !== null) {
      return null
    }

    const out = {}
    for (const [key, item] of Object.entries(value)) {
      out[key] = sanitizeExportValue(item)
    }
    return out
  }

  return value
}

function sanitizeJournalEntryForExport(entry) {
  return {
    createdAt: isoOrNull(entry.createdAt),
    id: entry.id || null,
    payload: sanitizeExportValue(entry.payload),
    sessionId: entry.sessionId || null,
    summary: entry.summary ?? null,
    text: entry.text ?? null,
    title: entry.title ?? null,
    type: entry.type || null,
    vibe: entry.vibe || null,
  }
}

/**
 * Trust feature: the couple's whole story as one JSON file — every journal
 * entry plus the shared progression record. Reads are participant-scoped in
 * the security rules, so this only ever returns your own couple's data.
 */
export async function fetchCoupleJournalExport(db, coupleId, { limitCount = 2000 } = {}) {
  const snapshot = await getDocs(
    query(
      collection(db, 'journalEntries'),
      where('coupleId', '==', coupleId),
      limit(limitCount),
    ),
  )

  const entries = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
  entries.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.()?.getTime?.() || 0
    const bTime = b.createdAt?.toDate?.()?.getTime?.() || 0
    return bTime - aTime
  })

  return entries.map(sanitizeJournalEntryForExport)
}
