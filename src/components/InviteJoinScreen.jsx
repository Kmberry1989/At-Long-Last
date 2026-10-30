import { useEffect, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { resolveInviteRoom } from '../features/couple/coupleService.js'

/**
 * Deep-link join screen. The invite URL (e.g. ?invite=XXXXXX) resolves the
 * room before the partner sees any generic navigation: host identity,
 * private-room confirmation, then a nickname field. Joining proceeds as soon
 * as a nickname is supplied. Six-character code entry stays available as a
 * fallback path.
 */
export function InviteJoinScreen({
  db,
  inviteCode,
  nickname,
  onJoin,
  onNicknameChange,
  onUseCodeInstead,
  working = false,
}) {
  const audio = useAudio()
  const [room, setRoom] = useState(null)
  const [resolving, setResolving] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    setResolving(true)
    setError('')
    setRoom(null)

    resolveInviteRoom({ code: inviteCode, db })
      .then((resolved) => {
        if (!cancelled) {
          setRoom(resolved)
          setResolving(false)
        }
      })
      .catch((resolutionError) => {
        if (!cancelled) {
          setError(resolutionError.message)
          setResolving(false)
          audio?.playError?.()
        }
      })

    return () => {
      cancelled = true
    }
  }, [db, inviteCode, audio])

  function handleJoin() {
    if (!nickname.trim() || working) {
      return
    }

    audio?.playAction?.()
    onJoin(nickname.trim())
    audio?.playSuccess?.()
  }

  return (
    <div className="invite-join">
      {resolving ? (
        <>
          <p className="eyebrow">Invite</p>
          <h2>Loading…</h2>
        </>
      ) : error ? (
        <>
          <p className="eyebrow">Invite</p>
          <h2>Invite unavailable</h2>
          <p className="support-copy" role="alert">{error}</p>
          <div className="button-row">
            <button
              className="primary-btn"
              onClick={() => {
                audio?.playAction?.()
                onUseCodeInstead()
              }}
              type="button"
            >
              Use code
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="eyebrow">Invite</p>
          <h2>Connect with {room.hostName}</h2>

          <div className="invite-join-field">
            <label className="sr-only" htmlFor="invite-nickname">Name</label>
            <input
              autoComplete="nickname"
              className="text-input"
              id="invite-nickname"
              maxLength={40}
              onChange={(event) => onNicknameChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleJoin()
                }
              }}
              placeholder="Name"
              value={nickname}
            />
          </div>
          <div className="button-row">
            <button
              className="primary-btn"
              disabled={!nickname.trim() || working}
              onClick={handleJoin}
              type="button"
            >
              Connect
            </button>
          </div>
          <button
            className="ghost-btn invite-fallback"
            onClick={() => {
              audio?.playAction?.()
              onUseCodeInstead()
            }}
            type="button"
          >
            Use code
          </button>
        </>
      )}
    </div>
  )
}
