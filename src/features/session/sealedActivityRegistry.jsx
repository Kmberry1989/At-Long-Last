import { useEffect, useRef, useState } from 'react'
import { RevealBurst } from '../../components/DuelRevealOverlay.jsx'
import { useAudio } from '../../audio/AudioProvider.jsx'
import {
  MIND_MELD_PROMPTS,
  MUTUAL_YES_PROMPTS,
  pickSealedPrompt,
} from './sealedActivityData.js'
import {
  createSalt,
  deriveSealedKey,
  isValidSalt,
  isValidSealedChoice,
  sealChoice,
  unsealChoice,
} from './sealedCrypto.js'

function getPlayerName(players, index) {
  return players[index]?.displayName || 'Your partner'
}

function nextPlayerIndex(playerIndex) {
  return playerIndex === 0 ? 1 : 0
}

/**
 * Reveal acknowledgments: after the reveal content is ready, the activity
 * only completes once BOTH players have tapped continue. The ack state lives
 * in Firestore, so a player who reconnects (or opens the app later) lands
 * back on the reveal instead of finding it gone.
 */
function addRevealAck(state, playerIndex) {
  const acks = Array.isArray(state.revealAcks) ? state.revealAcks : []
  if (acks.includes(playerIndex)) {
    return acks
  }
  return [...acks, playerIndex]
}

function hasBothRevealAcks(state) {
  const acks = Array.isArray(state.revealAcks) ? state.revealAcks : []
  return acks.includes(0) && acks.includes(1)
}

function SealedHead({ definition, onSkip, sealedCount }) {
  return (
    <>
      <div className="overlay-head">
        <p className="eyebrow">sealed {definition.type}</p>
        {definition.skippable && (
          <button className="secondary-link" onClick={onSkip} type="button">
            Skip This
          </button>
        )}
      </div>
      <h3>{definition.label}</h3>
      <p className="support-copy">{definition.description}</p>
      <div className="turn-badge">
        <span aria-hidden="true">✉️</span>
        <span><strong>{sealedCount}/2 sealed</strong></span>
      </div>
    </>
  )
}

function RevealContinue({ acked, busy, onContinue, partnerName }) {
  if (acked) {
    return (
      <div className="connection-waiting-card">
        <span aria-hidden="true">💛</span>
        <strong>Waiting for {partnerName}…</strong>
        <p>Take your time — this moment stays right here until you both continue.</p>
      </div>
    )
  }

  return (
    <button
      className="primary-btn"
      disabled={busy}
      onClick={onContinue}
      type="button"
    >
      Continue together 💛
    </button>
  )
}

const SEALED_COUNTDOWN_START = 3
const SEALED_COUNTDOWN_STEP_MS = 900

/**
 * SealedRevealMoment — the synchronized reveal beat for Mind Meld and Mutual
 * Yes. Both phones derive the reveal from the same activity state, so each
 * runs the same short countdown, then the answers land with a heart burst,
 * a chime, and a haptic tap.
 */
function SealedRevealMoment({ children }) {
  const { playSuccess } = useAudio()
  const [count, setCount] = useState(SEALED_COUNTDOWN_START)
  const [revealed, setRevealed] = useState(false)
  const firedRef = useRef(false)

  useEffect(() => {
    if (count <= 0) {
      if (!firedRef.current) {
        firedRef.current = true
        setRevealed(true)
        playSuccess?.()
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([30, 60, 30])
        }
      }
      return undefined
    }

    const timer = setTimeout(() => setCount((current) => current - 1), SEALED_COUNTDOWN_STEP_MS)
    return () => clearTimeout(timer)
  }, [count, playSuccess])

  if (!revealed) {
    return (
      <div className="sealed-countdown">
        <p className="duel-countdown-label">Both sealed</p>
        <p className="duel-countdown-number" key={count} aria-live="polite">
          {count}
        </p>
        <p className="duel-countdown-sub">Revealing together</p>
      </div>
    )
  }

  return (
    <div className="sealed-reveal">
      <RevealBurst />
      {children}
    </div>
  )
}

function MindMeldCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  playerIndex,
  players,
}) {
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const {
    answers = {},
    matched = null,
    prompt,
    revealAcks = [],
  } = activity.state
  const answerCount = Object.keys(answers).length
  const revealed = answerCount >= 2
  const decided = matched !== null
  const myAnswer = answers[String(playerIndex)]
  const acked = revealAcks.includes(playerIndex)
  const partnerName = getPlayerName(players, nextPlayerIndex(playerIndex))

  function handleContinue() {
    if (busy) {
      return
    }
    setBusy(true)
    try {
      onSubmit({ revealAck: true })
    } finally {
      // The ack lands via the Firestore snapshot; release the lock on
      // the next render either way so a failed submit can be retried.
      setBusy(false)
    }
  }

  return (
    <div className="overlay-card activity-card vibe-playful">
      <SealedHead definition={definition} onSkip={onSkip} sealedCount={answerCount} />
      <div className="activity-prompt">
        <p>{prompt}</p>
      </div>

      {!revealed && !myAnswer && (
        <>
          <div className="turn-badge">
            <strong>{getPlayerName(players, playerIndex)}</strong>
            <span>answer sealed — your partner cannot peek</span>
          </div>
          <textarea
            className="text-entry"
            disabled={disabled}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Your answer, sealed shut."
            rows={3}
            value={draft}
          />
          <button
            className="primary-btn"
            disabled={disabled || !draft.trim()}
            onClick={() => {
              onSubmit({ text: draft.trim() })
              setDraft('')
            }}
            type="button"
          >
            Seal It ✉️
          </button>
        </>
      )}

      {!revealed && myAnswer && (
        <div className="connection-waiting-card">
          <span aria-hidden="true">✉️</span>
          <strong>Your answer is sealed.</strong>
          <p>The reveal happens the moment your partner seals theirs.</p>
        </div>
      )}

      {revealed && !decided && (
        <SealedRevealMoment>
          <p className="eyebrow">✨ revealed together</p>
          {[0, 1].map((index) => (
            <div className="activity-log-card" key={index}>
              <strong>{getPlayerName(players, index)}</strong>
              <p>{answers[String(index)]}</p>
            </div>
          ))}
          {!disabled ? (
            <div className="reveal-verdict">
              <p>Did your minds meld?</p>
              <div className="verdict-buttons">
                <button
                  className="primary-btn"
                  onClick={() => onSubmit({ matched: true })}
                  type="button"
                >
                  We matched ✨
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => onSubmit({ matched: false })}
                  type="button"
                >
                  Different answers
                </button>
              </div>
            </div>
          ) : (
            <div className="connection-waiting-card">
              <span aria-hidden="true">👀</span>
              <strong>{getPlayerName(players, activity.state.turnIndex)} is calling it.</strong>
              <p>Did your minds meld?</p>
            </div>
          )}
        </SealedRevealMoment>
      )}

      {revealed && decided && (
        <div className="sealed-reveal">
          <p className="eyebrow">
            {matched ? '✨ minds melded' : '💛 revealed with honesty'}
          </p>
          {[0, 1].map((index) => (
            <div className="activity-log-card" key={index}>
              <strong>{getPlayerName(players, index)}</strong>
              <p>{answers[String(index)]}</p>
            </div>
          ))}
          <p className="support-copy">
            {matched
              ? 'Same wavelength. Beautiful.'
              : 'Different answers — still a win for honesty.'}
          </p>
          <RevealContinue
            acked={acked}
            busy={busy}
            onContinue={handleContinue}
            partnerName={partnerName}
          />
        </div>
      )}
    </div>
  )
}

const MUTUAL_YES_CHOICES = [
  { id: 'yes', label: 'Yes', hint: 'Absolutely.' },
  { id: 'maybe', label: 'Maybe', hint: 'Someday, perhaps.' },
  { id: 'later', label: 'Not right now', hint: 'No pressure, ever.' },
]

/**
 * Outcome from two decrypted choices. Only booleans leave the client —
 * the individual choices never do.
 */
function buildOutcome(firstChoice, secondChoice) {
  const mutualYes = firstChoice === 'yes' && secondChoice === 'yes'
  const warm =
    !mutualYes &&
    (firstChoice === 'yes' || secondChoice === 'yes') &&
    (firstChoice === 'maybe' || secondChoice === 'maybe')
  return { mutualYes, warm }
}

function isValidOutcome(value) {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof value.mutualYes === 'boolean' &&
    (value.warm === undefined || typeof value.warm === 'boolean')
  )
}

function MutualYesCard({
  activity,
  definition,
  onSkip,
  onSubmit,
  playerIndex,
  players,
}) {
  const [sealing, setSealing] = useState(false)
  const [continuing, setContinuing] = useState(false)
  const saltSubmitRef = useRef(false)
  const outcomeSubmitRef = useRef(false)
  const {
    outcome = null,
    prompt,
    revealAcks = [],
    salts = {},
    sealed = {},
  } = activity.state
  const partnerIndex = nextPlayerIndex(playerIndex)
  const mySalt = salts[String(playerIndex)]
  const mySealed = sealed[String(playerIndex)]
  const bothSalts = Boolean(salts['0'] && salts['1'])
  const bothSealed = Boolean(sealed['0'] && sealed['1'])
  const decided = outcome !== null
  const acked = revealAcks.includes(playerIndex)
  const partnerName = getPlayerName(players, partnerIndex)

  // Phase 1: publish a random salt so both clients can derive the same
  // AES-GCM key. The salt is public randomness; the choice stays secret.
  useEffect(() => {
    if (mySalt || saltSubmitRef.current) {
      return
    }
    saltSubmitRef.current = true
    try {
      onSubmit({ salt: createSalt() })
    } catch {
      saltSubmitRef.current = false
    }
  }, [mySalt, onSubmit])

  // Phase 2b: if both sealed choices are in but nobody has recorded the
  // outcome yet (e.g. both submitted at once, or a client closed early),
  // compute it locally and record it. Deterministic, so concurrent
  // submissions converge on the same value.
  useEffect(() => {
    if (!bothSealed || decided || outcomeSubmitRef.current) {
      return
    }
    outcomeSubmitRef.current = true
    ;(async () => {
      try {
        const key = await deriveSealedKey(salts['0'], salts['1'])
        const mine = await unsealChoice(key, sealed[String(playerIndex)])
        const theirs = await unsealChoice(key, sealed[String(partnerIndex)])
        onSubmit({ outcome: buildOutcome(mine, theirs) })
      } catch {
        outcomeSubmitRef.current = false
      }
    })()
  }, [bothSealed, decided, onSubmit, partnerIndex, playerIndex, salts, sealed])

  async function handleChoice(choiceId) {
    if (sealing || mySealed || !bothSalts) {
      return
    }
    setSealing(true)
    try {
      const key = await deriveSealedKey(salts['0'], salts['1'])
      const sealedChoice = await sealChoice(key, choiceId)
      const partnerSealed = sealed[String(partnerIndex)]
      if (partnerSealed && !decided) {
        // We hold both ciphertexts, so we can call the outcome now.
        const partnerChoice = await unsealChoice(key, partnerSealed)
        onSubmit({
          sealedChoice,
          outcome: buildOutcome(choiceId, partnerChoice),
        })
      } else {
        onSubmit({ sealedChoice })
      }
    } catch {
      // A crypto failure must never strand the card: the player can retry.
    } finally {
      setSealing(false)
    }
  }

  function handleContinue() {
    if (continuing) {
      return
    }
    setContinuing(true)
    try {
      onSubmit({ revealAck: true })
    } finally {
      setContinuing(false)
    }
  }

  const sealedCount = Object.keys(sealed).length

  return (
    <div className="overlay-card activity-card vibe-spicy">
      <SealedHead definition={definition} onSkip={onSkip} sealedCount={sealedCount} />
      <div className="activity-prompt">
        <p>{prompt}</p>
      </div>

      {!decided && !mySealed && (
        <>
          <div className="turn-badge">
            <strong>{getPlayerName(players, playerIndex)}</strong>
            <span>answer sealed — only a mutual yes ever sees the light</span>
          </div>
          {!bothSalts ? (
            <div className="connection-waiting-card">
              <span aria-hidden="true">✉️</span>
              <strong>Preparing your sealed envelope…</strong>
              <p>Just a moment while both phones get ready.</p>
            </div>
          ) : (
            <div className="choice-stack">
              {MUTUAL_YES_CHOICES.map((choice) => (
                <button
                  className="choice-btn"
                  disabled={sealing}
                  key={choice.id}
                  onClick={() => handleChoice(choice.id)}
                  type="button"
                >
                  <strong>{choice.label}</strong>
                  <span>{choice.hint}</span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {!decided && mySealed && (
        <div className="connection-waiting-card">
          <span aria-hidden="true">✉️</span>
          <strong>Your answer is sealed.</strong>
          <p>
            {bothSealed
              ? 'Both answers are in — revealing now.'
              : 'If it is not a mutual yes, nobody ever has to know.'}
          </p>
        </div>
      )}

      {decided && (
        <SealedRevealMoment>
          <p className="eyebrow">
            {outcome.mutualYes ? '🔥 mutual yes' : '💛 sealed with care'}
          </p>
          <p className="support-copy">
            {outcome.mutualYes
              ? 'You both said yes. Savor this one.'
              : 'A sealed card, answered with care. No pressure, ever — what each of you chose stays between you and the envelope.'}
          </p>
          <RevealContinue
            acked={acked}
            busy={continuing}
            onContinue={handleContinue}
            partnerName={partnerName}
          />
        </SealedRevealMoment>
      )}
    </div>
  )
}

function createMindMeldEntry(definition) {
  return {
    ...definition,
    advance(state, { input, playerIndex }) {
      // Reveal acknowledgments always apply once the verdict is in.
      if (input.revealAck === true) {
        if (state.matched === null || state.matched === undefined) {
          return { completed: false, state }
        }
        const revealAcks = addRevealAck(state, playerIndex)
        return {
          completed: hasBothRevealAcks({ ...state, revealAcks }),
          state: { ...state, revealAcks },
        }
      }

      if (typeof input.matched === 'boolean' && Object.keys(state.answers || {}).length >= 2) {
        if (state.matched !== null && state.matched !== undefined) {
          return { completed: false, state }
        }
        // Whoever calls the verdict has seen the reveal; count their ack.
        const revealAcks = addRevealAck({ ...state, revealAcks: [] }, playerIndex)
        return {
          completed: false,
          state: { ...state, matched: input.matched, revealAcks },
        }
      }

      const answers = state.answers || {}
      const text = input.text?.trim()

      if (
        playerIndex !== state.turnIndex ||
        answers[String(playerIndex)] ||
        !text
      ) {
        return { completed: false, state }
      }

      const nextAnswers = { ...answers, [String(playerIndex)]: text }
      const bothIn = Object.keys(nextAnswers).length >= 2

      return {
        completed: false,
        state: {
          ...state,
          answers: nextAnswers,
          // Whoever seals the second answer calls the verdict.
          turnIndex: bothIn ? playerIndex : nextPlayerIndex(playerIndex),
        },
      }
    },
    createInitialState(_players, { activePlayerIndex = 0, random = Math.random } = {}) {
      return {
        answers: {},
        matched: null,
        prompt: pickSealedPrompt(MIND_MELD_PROMPTS, random),
        revealAcks: [],
        turnIndex: activePlayerIndex,
      }
    },
    render(props) {
      return <MindMeldCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const names = [getPlayerName(players, 0), getPlayerName(players, 1)]
      const matched = state.matched === true
      const text = `${names[0]}: ${state.answers['0']}\n${names[1]}: ${state.answers['1']}`

      return {
        heartBonus: matched ? 6 : 3,
        label: definition.label,
        payload: {
          answers: state.answers,
          matched,
          prompt: state.prompt,
          sealedMatch: matched,
        },
        savesToJournal: definition.savesToJournal,
        summary: matched
          ? `${names[0]} and ${names[1]} pulled off a mind meld.`
          : `${names[0]} and ${names[1]} revealed different answers — still a win for honesty.`,
        text,
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

function createMutualYesEntry(definition) {
  return {
    ...definition,
    advance(state, { input, playerIndex }) {
      const salts = state.salts || {}
      const sealed = state.sealed || {}

      // Phase 1: exchange random salts (public randomness).
      if (typeof input.salt === 'string') {
        if (!isValidSalt(input.salt) || salts[String(playerIndex)]) {
          return { completed: false, state }
        }
        return {
          completed: false,
          state: {
            ...state,
            salts: { ...salts, [String(playerIndex)]: input.salt.toLowerCase() },
            turnIndex: nextPlayerIndex(playerIndex),
          },
        }
      }

      // Reveal acknowledgments, once the outcome is recorded.
      if (input.revealAck === true) {
        if (!state.outcome) {
          return { completed: false, state }
        }
        const revealAcks = addRevealAck(state, playerIndex)
        return {
          completed: hasBothRevealAcks({ ...state, revealAcks }),
          state: { ...state, revealAcks },
        }
      }

      // Phase 2b: record a locally-computed outcome when both sealed
      // choices are present but the outcome is still missing.
      if (input.outcome && !input.sealedChoice) {
        if (state.outcome || !sealed['0'] || !sealed['1']) {
          return { completed: false, state }
        }
        if (!isValidOutcome(input.outcome)) {
          return { completed: false, state }
        }
        return {
          completed: false,
          state: {
            ...state,
            outcome: {
              mutualYes: input.outcome.mutualYes,
              warm: input.outcome.warm === true,
            },
          },
        }
      }

      // Phase 2a: submit an encrypted choice. Plaintext choices are never
      // written here — only AES-GCM ciphertext produced by sealedCrypto.
      if (input.sealedChoice) {
        if (
          !isValidSealedChoice(input.sealedChoice) ||
          !salts['0'] ||
          !salts['1'] ||
          sealed[String(playerIndex)]
        ) {
          return { completed: false, state }
        }
        const nextSealed = { ...sealed, [String(playerIndex)]: input.sealedChoice }
        const nextState = {
          ...state,
          sealed: nextSealed,
          turnIndex: nextPlayerIndex(playerIndex),
        }
        // The client submitting the second sealed choice also calls the
        // outcome, which it computed locally by decrypting both
        // ciphertexts. Trust boundary: both clients run this same code;
        // a tampered client could only lie to its own partner.
        if (
          nextSealed['0'] &&
          nextSealed['1'] &&
          !state.outcome &&
          isValidOutcome(input.outcome)
        ) {
          nextState.outcome = {
            mutualYes: input.outcome.mutualYes,
            warm: input.outcome.warm === true,
          }
        }
        return { completed: false, state: nextState }
      }

      return { completed: false, state }
    },
    createInitialState(_players, { activePlayerIndex = 0, random = Math.random } = {}) {
      return {
        outcome: null,
        prompt: pickSealedPrompt(MUTUAL_YES_PROMPTS, random),
        revealAcks: [],
        salts: {},
        sealed: {},
        turnIndex: activePlayerIndex,
      }
    },
    render(props) {
      return <MutualYesCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const names = [getPlayerName(players, 0), getPlayerName(players, 1)]
      const mutualYes = state.outcome?.mutualYes === true
      const warm = !mutualYes && state.outcome?.warm === true
      // Consent-safe by construction: individual choices are ciphertext in
      // Firestore and are never copied into the journal payload.

      return {
        heartBonus: mutualYes ? 6 : warm ? 4 : 2,
        label: definition.label,
        payload: {
          mutualYes,
          prompt: state.prompt,
        },
        savesToJournal: definition.savesToJournal,
        summary: mutualYes
          ? `${names[0]} and ${names[1]} got a mutual yes. 🔥`
          : 'A sealed card, answered with care. No pressure, ever.',
        text: mutualYes
          ? `Mutual yes: ${state.prompt}`
          : `Sealed answers on: ${state.prompt}`,
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

export function createSealedActivityEntry(definition) {
  if (definition.id === 'same-wavelength') {
    return createMindMeldEntry(definition)
  }

  if (definition.id === 'mutual-yes') {
    return createMutualYesEntry(definition)
  }

  return null
}
