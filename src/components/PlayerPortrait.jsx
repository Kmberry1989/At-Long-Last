import { createContext, useContext, useEffect, useState } from 'react'
import { useFirebaseApp } from '../features/couple/FirebaseAppContext.jsx'
import { useCouple } from '../features/couple/CoupleProvider.jsx'
import { getPortraitFrame, googlePhotoURL } from '../features/couple/portraitFrames.js'
import { selectPortraitFrame, subscribePortraits, syncGooglePortrait } from '../features/couple/portraitService.js'
import './player-portrait.css'

const PortraitContext = createContext({ portraits: {}, userId: null, selectFrame: null, error: '', working: false })
export function usePortraits() { return useContext(PortraitContext) }

export function PortraitProvider({ children }) {
  const { db, enabled, user } = useFirebaseApp()
  const { couple } = useCouple()
  const [portraits, setPortraits] = useState({})
  const [error, setError] = useState('')
  const [working, setWorking] = useState(false)
  useEffect(() => {
    setPortraits({})
    if (!enabled || !db || !couple?.id || !user) return undefined
    let cancelled = false
    const fail = next => { if (!cancelled) setError(next.message) }
    syncGooglePortrait(db, couple.id, user).catch(fail)
    const unsubscribe = subscribePortraits(db, couple.id, data => { if (!cancelled) setPortraits(data) }, fail)
    return () => { cancelled = true; unsubscribe() }
  }, [db, enabled, couple?.id, user?.uid, user?.photoURL])
  async function selectFrame(id) {
    if (working || !db || !couple?.id || !user) return
    setWorking(true); setError('')
    try { await selectPortraitFrame(db, couple.id, user.uid, id) }
    catch (next) { setError(next.message) }
    finally { setWorking(false) }
  }
  return <PortraitContext.Provider value={{ portraits, userId: user?.uid, selectFrame, error, working }}>{children}</PortraitContext.Provider>
}

export function PlayerPortrait({ player = {}, frameId, className = '', photoURL, label }) {
  const { portraits } = usePortraits()
  const saved = portraits[player.uid]
  const src = googlePhotoURL(photoURL || saved?.photoURL || player.photoURL)
  const frame = getPortraitFrame(frameId || saved?.selectedFrame || player.selectedFrame)
  const [failedURL, setFailedURL] = useState(null)
  const initials = (player.displayName || 'Your person').trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase()
  return <span className={`profile-portrait frame-${frame.id} ${className}`} role="img" aria-label={label || `${player.displayName || 'Player'} · ${frame.label} frame`}>
    <span className="portrait-photo-window">{src && src !== failedURL ? <img alt="" src={src} referrerPolicy="no-referrer" onError={() => setFailedURL(src)} /> : <span className="portrait-initials">{initials}</span>}</span>
    <FrameDecoration id={frame.id} />
  </span>
}

function FrameDecoration({ id }) {
  return <svg className="portrait-frame-art" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.25">
    <circle cx="50" cy="50" r="43" /><circle cx="50" cy="50" r="39" />
    {id === 'ribbon' && <><path d="M18 78C-9 51 14 5 39 8c19 4 8 16-5 11M82 22c27 27 4 73-21 70-19-4-8-16 5-11" /><path d="M38 91c-7-13 14-13 12-2-2-11 19-11 12 2l-12 5Z" /></>}
    {id === 'ivory' && <><circle cx="50" cy="50" r="46" strokeDasharray="1 4" strokeWidth="3" /><path d="m50 1 4 5-4 5-4-5Z" /></>}
    {id === 'midnight' && <><path d="m50 1 9 9 31 31 9 9-9 9-31 31-9 9-9-9L10 59 1 50l9-9L41 10Z" /><path d="m50 5 3 6-3 6-3-6Zm0 78 3 6-3 6-3-6Z" /></>}
    {id === 'starlight' && <><circle cx="50" cy="50" r="47" strokeDasharray="1 6" /><path d="m14 20 10-10 26-6 27 9 12 22M4 50l7 25 19 17 29 4 26-14" />{[[14,20],[50,4],[89,35],[11,75],[59,96]].map(([x,y]) => <path key={x} d={`M${x-4} ${y}h8m-4-4v8`} />)}</>}
    {id === 'rose' && <>{[0,60,120,180,240,300].map(angle => <path key={angle} transform={`rotate(${angle} 50 50)`} d="M50 3c-13-7-14 12 0 8 14 4 13-15 0-8Zm-8 7c-15 0-14 15-7 15M58 10c15 0 14 15 7 15" />)}</>}
    {id === 'laurel' && <>{[0,1].map(side => <g key={side} transform={side ? 'translate(100 0) scale(-1 1)' : undefined}><path d="M46 96C5 79-6 32 26 8" />{[0,1,2,3,4,5].map(i => <path key={i} transform={`rotate(${i*15} 50 50)`} d="M7 53C-2 49 0 40 5 41c5 0 8 6 2 12Zm0-2c4-10 13-9 13-4 0 5-7 7-13 4Z" />)}</g>)}</>}
  </svg>
}
