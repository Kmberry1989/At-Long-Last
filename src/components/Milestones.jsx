import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { acknowledgeMoment, subscribeToCelebrationReceipts, subscribeToMoments } from '../features/couple/milestoneService.js'
import { getPlayerPiece } from '../features/couple/playerAvatar.js'
import { useAudio } from '../audio/AudioProvider.jsx'
import './Milestones.css'

const MilestonesContext = createContext({ moments: [] })
export function useMilestones() { return useContext(MilestonesContext) }
export function momentCopy(moment) {
  if (moment.kind === 'connected') return { chapter: 'Our beginning', title: 'A shared beginning', line: 'Two people. One little world.', icon: '✦' }
  if (moment.kind === 'committed') return { chapter: 'Our commitment', title: 'We choose us.', line: 'One commitment. Every chapter ahead.', icon: '♥' }
  if (moment.nights === 1) return { chapter: 'Our first night', title: 'The first of many.', line: 'Your first night together, saved forever.', icon: '☾' }
  return { chapter: 'Another chapter', title: `${moment.nights} nights. One story.`, line: 'Look at everything you have made together.', icon: '✧' }
}
function receiptKey(uid, id) { return `at-long-last:celebration:${uid}:${id}` }
function locallySeen(uid, id) { try { return localStorage.getItem(receiptKey(uid, id)) === 'seen' } catch { return false } }

export function MilestonesProvider({ children }) {
  const { couple } = useCouple()
  const { db, userId, enabled } = useFirebaseApp()
  const [state, setState] = useState({ key: '', moments: [], receipts: null })
  const [dismissed, setDismissed] = useState(new Set())
  const key = `${userId || ''}:${couple?.id || ''}`
  useEffect(() => {
    if (!enabled || !db || !userId || !couple?.id || (couple.playerIds?.length !== 2 || !couple.playerIds.includes(userId))) {
      setState({ key, moments: [], receipts: null }); return
    }
    setState({ key, moments: [], receipts: null }); setDismissed(new Set())
    const moments = subscribeToMoments(db, couple.id, (items) => setState((current) => current.key === key ? { ...current, moments: items } : current), () => undefined)
    const receipts = subscribeToCelebrationReceipts(db, userId, (items) => setState((current) => current.key === key ? { ...current, receipts: items } : current), () => undefined)
    return () => { moments(); receipts() }
  }, [db, userId, couple?.id, couple?.playerIds?.length, enabled, key])
  const moments = state.key === key ? state.moments : []
  const next = state.key === key && state.receipts ? moments.find((moment) => !state.receipts.has(moment.id) && !dismissed.has(moment.id) && !locallySeen(userId, moment.id)) : null
  function dismiss() {
    if (!next) return
    try { localStorage.setItem(receiptKey(userId, next.id), 'seen') } catch { /* Server receipts still prevent repeats. */ }
    setDismissed((previous) => new Set([...previous, next.id]))
    acknowledgeMoment(db, userId, next.id).catch(() => undefined)
  }
  return <MilestonesContext.Provider value={{ moments }}>{children}{next && <MomentCelebration key={next.id} moment={next} onContinue={dismiss} />}</MilestonesContext.Provider>
}

export function MomentCelebration({ moment, onContinue }) {
  const audio = useAudio()
  const root = useRef(null)
  const playback = useRef(null)
  const copy = momentCopy(moment)
  const playerA = getPlayerPiece(moment.avatars[0])
  const playerB = getPlayerPiece(moment.avatars[1])
  useEffect(() => {
    const previousFocus = document.activeElement
    root.current?.focus()
    return () => { playback.current?.stop(); previousFocus?.focus?.() }
  }, [moment.id])
  useEffect(() => {
    // Start the full cue when sound is first enabled, even if the player
    // spends time reading the ceremony before allowing browser playback.
    if (!playback.current && !audio?.muted && audio?.unlocked) {
      playback.current = audio.playCelebration?.(moment.kind === 'night' && moment.nights > 1 ? 'milestone' : moment.kind)
    }
    playback.current?.setMuted(audio?.muted)
  }, [audio?.muted, audio?.unlocked, moment.id])
  function keyDown(event) {
    if (event.key === 'Escape') { event.preventDefault(); onContinue() }
    if (event.key !== 'Tab') return
    const buttons = [...root.current.querySelectorAll('button:not([disabled])')]
    if (!buttons.length) return
    const first = buttons[0], last = buttons[buttons.length - 1]
    if (event.shiftKey && (document.activeElement === first || document.activeElement === root.current)) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && (document.activeElement === last || document.activeElement === root.current)) { event.preventDefault(); first.focus() }
  }
  return <div className={`moment-celebration moment-${moment.kind}`} role="dialog" aria-modal="true" aria-labelledby="moment-title" ref={root} tabIndex={-1} onKeyDown={keyDown}>
    <div aria-hidden="true" className="moment-halo" />
    <div aria-hidden="true" className="moment-stars">{Array.from({ length: 22 }, (_, index) => <i key={index} style={{ '--i': index, left: `${5 + index * 37 % 90}%`, top: `${8 + index * 17 % 80}%`, animationDuration: `${6 + index % 5}s` }} />)}</div>
    <div className="moment-content">
      <p className="moment-chapter">{copy.chapter}</p>
      <div className="moment-pieces" aria-hidden="true"><img src={playerA.thumbnail} alt="" /><span className="moment-seal">{copy.icon}</span><img src={playerB.thumbnail} alt="" /></div>
      <p className="moment-names">{moment.names[0]} <span>&amp;</span> {moment.names[1]}</p>
      <h2 id="moment-title">{copy.title}</h2>
      <p className="moment-line">{copy.line}</p>
      <p className="moment-saved">Saved in your scrapbook</p>
    </div>
    <div className="moment-controls">
      <button className="moment-sound audio-toggle" onClick={audio?.toggleMuted} type="button" aria-label={audio?.muted || !audio?.unlocked ? 'Enable celebration sound' : 'Mute celebration sound'}>{audio?.muted || !audio?.unlocked ? 'Sound on' : 'Mute sound'}</button>
      <button className="moment-continue" onClick={onContinue} type="button">Continue</button>
    </div>
  </div>
}

export function PairingStory() {
  const { moments } = useMilestones()
  if (!moments.length) return null
  const ordered = [...moments].sort((a, b) => (a.kind === 'connected' ? -1 : b.kind === 'connected' ? 1 : a.kind === 'committed' ? -1 : b.kind === 'committed' ? 1 : a.nights - b.nights))
  return <section className="pairing-story" aria-label="Our story">
    <p className="eyebrow">Our story</p>
    {ordered.map((moment) => {
      const copy = momentCopy(moment)
      const date = moment.createdAt?.toDate?.()
      return <article className={`story-moment story-${moment.kind}`} key={moment.id}>
        <span className="story-moment-seal" aria-hidden="true">{copy.icon}</span>
        <div><p className="eyebrow">{copy.chapter}</p><h3>{copy.title}</h3><p>{moment.names.join(' & ')}</p>{date && <time dateTime={date.toISOString()}>{date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</time>}</div>
      </article>
    })}
  </section>
}
