import { useEffect, useMemo, useRef, useState } from 'react'
import { useAudio } from '../audio/AudioProvider.jsx'
import { duelRegistry } from '../features/session/duelRegistry.jsx'
import {
  WAVELENGTH_DUEL_ID,
  getWavelengthOptionLabel,
  getWavelengthPromptsForSession,
  scoreWavelengthDuel,
  wavelengthVerdict,
} from '../features/session/wavelengthDuelData.js'
import { evaluateDuelRound } from '../features/session/sessionLogic.js'
import { getPlayerPiece } from '../features/couple/playerAvatar.js'
import './duel-arena.css'

const COUNTDOWN_START = 3
const COUNTDOWN_STEP_MS = 900
const HOST_OVERRIDE_MS = 45000

const BURST_HEARTS = ['💖', '💗', '💓', '💞', '❤️', '💘', '💕', '🤍']

function burstHearts() {
  return BURST_HEARTS.map((emoji, index) => ({
    emoji,
    key: `${emoji}-${index}`,
    style: {
      '--burst-angle': `${(360 / BURST_HEARTS.length) * index + 12}deg`,
      '--burst-delay': `${(index % 4) * 90}ms`,
    },
  }))
}

export function RevealBurst() {
  return (
    <div className="duel-burst" aria-hidden="true">
      {burstHearts().map((heart) => (
        <span className="duel-burst-heart" key={heart.key} style={heart.style}>
          {heart.emoji}
        </span>
      ))}
    </div>
  )
}

function WavelengthScorecard({ duelResults, players, prompts }) {
  const { matches, rows, total } = useMemo(
    () =>
      scoreWavelengthDuel(
        duelResults?.[players[0]?.uid],
        duelResults?.[players[1]?.uid],
        prompts,
      ),
    [duelResults, players, prompts],
  )
  const nameOne = players[0]?.displayName ?? 'Player 1'
  const nameTwo = players[1]?.displayName ?? 'Player 2'

  return (
    <div className="duel-scorecard">
      <p className="duel-scorecard-verdict">{wavelengthVerdict(matches)}</p>
      <p className="duel-scorecard-tally" aria-live="polite">
        {matches}/{total} on the same wavelength
      </p>
      <details className="reveal-details">
      <summary>See answers · {matches}/{total} guesses</summary>
      <ol className="duel-scorecard-rows">
        {rows.map((row, index) => (
          <li className="duel-scorecard-row" key={row.prompt.id}>
            <p className="duel-scorecard-prompt">{row.prompt.text}</p>
            <p className={row.oneHit ? 'hit' : 'miss'}>
              <span aria-hidden="true">{row.oneHit ? '✓' : '✗'}</span> {nameOne} said
              “{getWavelengthOptionLabel(index, row.oneAnswer, prompts)}”
            </p>
            <p className={row.twoHit ? 'hit' : 'miss'}>
              <span aria-hidden="true">{row.twoHit ? '✓' : '✗'}</span> {nameTwo} said
              “{getWavelengthOptionLabel(index, row.twoAnswer, prompts)}”
            </p>
          </li>
        ))}
      </ol>
      </details>
    </div>
  )
}

function resolveHeartsForReveal({ duel, duelResults, outcome, players, session }) {
  if (outcome.status === 'noContest' || outcome.status === 'repick' || outcome.status === 'retry') {
    return 0
  }
  const entry = duelRegistry[duel.id]
  if (entry?.resolveHearts && (outcome.status === 'shared' || outcome.status === 'resolved')) {
    return entry.resolveHearts(duelResults[players[0]?.uid], duelResults[players[1]?.uid])
  }
  return session.currentDuel?.heartBonus ?? 0
}

function revealStatement({ duel, outcome, players }) {
  if (outcome.status === 'shared' || outcome.harmonyType === 'resonance') {
    return `${players[0]?.displayName || 'You'} and ${players[1]?.displayName || 'Partner'} landed ${duel.label} in pure resonance!`
  }
  if (outcome.status === 'retry') {
    return 'Too close to call — run it back.'
  }
  if (outcome.status === 'noContest') {
    return `You both passed ${duel.label} — no hearts, and that's okay.`
  }
  if (outcome.status === 'repick') {
    return `${duel.label} was passed — spinning up another duel.`
  }
  const lead = players[outcome.winnerIndex]
  const partner = players[outcome.winnerIndex === 0 ? 1 : 0]
  return `${lead?.displayName || 'One player'} set the tempo, while ${partner?.displayName || 'partner'} brought the spark.`
}

/**
 * DuelRevealOverlay — the synchronized reveal moment after both partners
 * submit. A short countdown, then the scorecard (or result), a heart burst,
 * and an explicit both-players-acknowledged gate before the host continues.
 */
export function DuelRevealOverlay({
  isHost,
  onAck,
  onForceContinue,
  onPreviewContinue,
  playerIndex,
  players,
  preview,
  session,
}) {
  const { playDuelPulse, playSuccess } = useAudio() || {}
  const [count, setCount] = useState(COUNTDOWN_START)
  const [revealed, setRevealed] = useState(false)
  const [overrideReady, setOverrideReady] = useState(false)
  const revealedRef = useRef(false)

  const duel = duelRegistry[session.currentDuel?.id] || session.currentDuel
  const duelResults = session.duelResults || {}
  const myUid = players[playerIndex]?.uid
  const partner = players[playerIndex === 0 ? 1 : 0]
  const myPlayer = players[playerIndex]
  const myPiece = myPlayer?.avatar ? getPlayerPiece(myPlayer.avatar) : null
  const partnerPiece = partner?.avatar ? getPlayerPiece(partner.avatar) : null

  const acks = session.currentDuel?.revealAcks || {}
  const myAcked = myUid ? acks[myUid] === true : false
  const partnerAcked = partner?.uid ? acks[partner.uid] === true : false

  const outcome = useMemo(
    () => evaluateDuelRound(session, duelRegistry),
    [session],
  )
  const wavelengthPrompts = useMemo(
    () =>
      duel?.id === WAVELENGTH_DUEL_ID ? getWavelengthPromptsForSession(session) : null,
    [duel?.id, session],
  )
  const hearts = useMemo(
    () => resolveHeartsForReveal({ duel, duelResults, outcome, players, session }),
    [duel, duelResults, outcome, players, session],
  )

  const isResonance = outcome.status === 'shared' || outcome.harmonyType === 'resonance'
  const awardedHearts = Math.max(hearts, isResonance ? 4 : 2)

  const myResult = duelResults?.[myUid]
  const partnerResult = duelResults?.[partner?.uid]

  const formatResultExcerpt = (result) => {
    if (!result) return 'Completed ✓'
    if (result.excerpt) return 'Answer locked in'
    if (result.score != null) return `Score: ${result.score}`
    if (result.time != null) return `${result.time.toFixed(1)}s`
    if (result.won) return 'Landed it ✓'
    return 'Played ✓'
  }

  useEffect(() => {
    if (count <= 0) {
      if (!revealedRef.current) {
        revealedRef.current = true
        setRevealed(true)
        playSuccess?.()
        playDuelPulse?.(0)
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([40, 80, 40])
        }
      }
      return undefined
    }

    playDuelPulse?.(count)
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25)
    }

    const timer = setTimeout(() => setCount((current) => current - 1), COUNTDOWN_STEP_MS)
    return () => clearTimeout(timer)
  }, [count, playSuccess, playDuelPulse])

  useEffect(() => {
    if (!isHost || preview) {
      return undefined
    }
    const timer = setTimeout(() => setOverrideReady(true), HOST_OVERRIDE_MS)
    return () => clearTimeout(timer)
  }, [isHost, preview])

  if (!duel || outcome.status === 'pending') {
    return null
  }

  return (
    <div className="duel-reveal" role="dialog" aria-label={`${duel.label} reveal`}>
      {revealed && <RevealBurst />}

      {!revealed ? (
        <div className="duel-countdown">
          <p className="duel-countdown-label">Both answers are in…</p>
          <p className="duel-countdown-number" key={count} aria-live="polite">
            {count}
          </p>
          <p className="duel-countdown-sub">Revealing together</p>
        </div>
      ) : (
        <div className="duel-reveal-card">
          <div className="duel-harmony-container">
            <span className={`duel-harmony-badge ${isResonance ? 'resonance' : 'contrast'}`}>
              {isResonance ? '✨ Pure Resonance ✨' : '💫 Playful Contrast 💫'}
            </span>
            <h3 className="duel-harmony-title">
              {isResonance ? 'In Perfect Sync!' : 'Sparks in Difference!'}
            </h3>
            <p className="duel-harmony-sub">
              {revealStatement({ duel, outcome, players })}
            </p>
            <div className="duel-harmony-hearts" aria-live="polite">
              +{awardedHearts} shared hearts 💞
            </div>
          </div>

          {/* Comparative Arena Cards across dividing beam */}
          <div className="duel-comparative-arena">
            <div className="duel-comparative-card">
              <div className="duel-comparative-player">
                <img
                  src={partnerPiece?.thumbnail || '/assets/players/thumbs/heart.webp'}
                  alt=""
                  className="duel-comparative-avatar"
                />
                <span className="duel-comparative-name">{partner?.displayName || 'Partner'}</span>
              </div>
              <span className="duel-comparative-answer">{formatResultExcerpt(partnerResult)}</span>
            </div>

            <div className="duel-comparative-divider" aria-hidden="true">
              <span>Synchronized</span>
            </div>

            <div className="duel-comparative-card">
              <div className="duel-comparative-player">
                <img
                  src={myPiece?.thumbnail || '/assets/players/thumbs/heart.webp'}
                  alt=""
                  className="duel-comparative-avatar"
                />
                <span className="duel-comparative-name">{myPlayer?.displayName || 'You'}</span>
              </div>
              <span className="duel-comparative-answer">{formatResultExcerpt(myResult)}</span>
            </div>
          </div>

          {duel.id === WAVELENGTH_DUEL_ID ? (
            <WavelengthScorecard
              duelResults={duelResults}
              players={players}
              prompts={wavelengthPrompts}
            />
          ) : null}

          {preview ? (
            <button className="primary-btn" onClick={onPreviewContinue} type="button">
              Continue
            </button>
          ) : !myAcked ? (
            <button className="primary-btn" onClick={onAck} type="button">
              We saw it 💞
            </button>
          ) : (
            <div className="duel-ack-status">
              <p>✓ You · {partnerAcked ? '✓' : '…'}{' '}{partner?.displayName || 'Partner'}</p>
              {!partnerAcked && <p className="duel-ack-wait">Waiting for them to tap “We saw it”…</p>}
              {partnerAcked && <p className="duel-ack-wait">Both in — continuing…</p>}
            </div>
          )}

          {!preview && isHost && myAcked && !partnerAcked && overrideReady && (
            <button className="link-btn duel-override" onClick={onForceContinue} type="button">
              Continue without their tap
            </button>
          )}
        </div>
      )}
    </div>
  )
}
