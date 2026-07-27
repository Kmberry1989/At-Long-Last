import { useEffect, useMemo, useState } from 'react'
import {
  BLUFF_BIDDING_TOPICS,
  PHOTO_FLASHBACK_PROMPTS,
} from './waveFourGameData.js'

function pickItem(items, random = Math.random) {
  const index = Math.min(
    items.length - 1,
    Math.max(0, Math.floor(random() * items.length)),
  )
  return items[index]
}

function getPlayerName(players, playerIndex) {
  return players[playerIndex]?.displayName || `Player ${playerIndex + 1}`
}

function getNextPlayerIndex(playerIndex) {
  return playerIndex === 0 ? 1 : 0
}

function useActivityUiState(state) {
  useEffect(() => {
    window.__atLongLastActivityUiState = state
    return () => {
      if (window.__atLongLastActivityUiState === state) {
        delete window.__atLongLastActivityUiState
      }
    }
  }, [state])
}

function ActivityHeader({ definition, disabled, eyebrow, onSkip }) {
  return (
    <>
      <div className="overlay-head">
        <p className="eyebrow">{eyebrow}</p>
        {definition.skippable && (
          <button
            className="secondary-link"
            disabled={disabled}
            onClick={onSkip}
            type="button"
          >
            Skip This
          </button>
        )}
      </div>
      <h3>{definition.label}</h3>
      <p className="support-copy">{definition.description}</p>
    </>
  )
}

function normalizeAnswers(text) {
  return Array.from(new Set(
    text
      .split(/[,\n]/)
      .map((answer) => answer.trim())
      .filter(Boolean),
  )).slice(0, 12)
}

function BluffBiddingCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  players,
}) {
  const state = activity.state
  const [proofText, setProofText] = useState('')
  const answers = normalizeAnswers(proofText)
  const activeName = getPlayerName(players, state.turnIndex)
  const bidderName = getPlayerName(players, state.bidderIndex)

  useEffect(() => {
    setProofText('')
  }, [activity.id, state.phase, state.turnIndex])

  useActivityUiState(useMemo(() => ({
    answerCount: answers.length,
    bid: state.currentBid,
    bidderIndex: state.bidderIndex,
    control: state.phase === 'bidding' ? 'raise-or-challenge' : 'proof-list',
    phase: state.phase,
  }), [answers.length, state.bidderIndex, state.currentBid, state.phase]))

  return (
    <div className="overlay-card activity-card wave-four-card bluff-card vibe-playful">
      <ActivityHeader
        definition={definition}
        disabled={disabled}
        eyebrow="Call The Bluff"
        onSkip={onSkip}
      />
      <div className="connection-game-prompt">
        <span>Tonight’s category</span>
        <p>{state.topic}</p>
      </div>
      <div className="bluff-bid-display">
        <span>{bidderName} says</span>
        <strong>{state.currentBid}</strong>
        <p>in 15 seconds</p>
      </div>

      {disabled ? (
        <div className="connection-waiting-card compact">
          <span aria-hidden="true">♠</span>
          <strong>{activeName} decides the next move.</strong>
          <p>{state.phase === 'bidding' ? 'Raise or challenge?' : 'The bidder is proving the claim.'}</p>
        </div>
      ) : state.phase === 'bidding' ? (
        <>
          <p className="connection-stage-copy">
            Raise the promise and become the bidder, or make {bidderName} prove it.
          </p>
          <div className="bluff-actions">
            <button
              disabled={state.currentBid >= state.maxBid}
              onClick={() => onSubmit({ action: 'raise' })}
              type="button"
            >
              <span>Raise</span>
              <strong>I can name {Math.min(state.maxBid, state.currentBid + 1)}</strong>
            </button>
            <button
              className="challenge"
              onClick={() => onSubmit({ action: 'challenge' })}
              type="button"
            >
              <span>Challenge</span>
              <strong>Prove {state.currentBid}</strong>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="bluff-proof-meta">
            <span>{bidderName} must name {state.currentBid}</span>
            <strong>{answers.length}/{state.currentBid}</strong>
          </div>
          <textarea
            aria-label="Proof answers"
            className="text-entry bluff-proof"
            maxLength={500}
            onChange={(event) => setProofText(event.target.value)}
            placeholder="One answer per line or separated by commas…"
            rows={5}
            value={proofText}
          />
          <p className="bluff-honor-note">Honor system: the challenger gets final bragging rights.</p>
          <button
            className="primary-btn"
            disabled={answers.length < 1}
            onClick={() => onSubmit({ answers })}
            type="button"
          >
            Lock The Proof
          </button>
        </>
      )}
    </div>
  )
}

function loadImageElement(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = dataUrl
  })
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function compressPhoto(file) {
  if (!file.type.startsWith('image/') || file.size > 12 * 1024 * 1024) {
    throw new Error('Choose an image smaller than 12 MB.')
  }

  const source = await readFileAsDataUrl(file)
  const image = await loadImageElement(source)
  const maxDimension = 900
  const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.width * scale))
  canvas.height = Math.max(1, Math.round(image.height * scale))
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
  let imageDataUrl = canvas.toDataURL('image/webp', 0.7)
  if (!imageDataUrl.startsWith('data:image/webp')) {
    imageDataUrl = canvas.toDataURL('image/jpeg', 0.72)
  }
  if (imageDataUrl.length > 350000) {
    throw new Error('That photo stays too large after compression. Try a smaller image.')
  }
  return imageDataUrl
}

function PhotoFlashbackCard({
  activity,
  definition,
  disabled,
  onSkip,
  onSubmit,
  playerIndex,
  players,
}) {
  const state = activity.state
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const activeName = getPlayerName(players, state.turnIndex)
  const ownCaption = state.captions?.[String(playerIndex)]
  const choosingPhoto = state.phase === 'photo'
  const visiblePhoto = choosingPhoto ? imageDataUrl : state.imageDataUrl

  useEffect(() => {
    setCaption('')
    setError('')
    setImageDataUrl('')
    setLoading(false)
  }, [activity.id, state.phase, state.turnIndex])

  useActivityUiState(useMemo(() => ({
    captionLength: caption.length,
    control: choosingPhoto ? 'photo-picker-and-caption' : 'caption',
    phase: state.phase,
    photoSelected: Boolean(visiblePhoto),
  }), [caption.length, choosingPhoto, state.phase, visiblePhoto]))

  async function choosePhoto(event) {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    setLoading(true)
    setError('')
    try {
      setImageDataUrl(await compressPhoto(file))
    } catch (nextError) {
      setImageDataUrl('')
      setError(nextError.message)
    } finally {
      setLoading(false)
    }
  }

  function submitCaption() {
    onSubmit({
      caption,
      ...(choosingPhoto ? { imageDataUrl } : {}),
    })
  }

  return (
    <div className="overlay-card activity-card wave-four-card photo-flashback-card vibe-tender">
      <ActivityHeader
        definition={definition}
        disabled={disabled}
        eyebrow="Shared Memory"
        onSkip={onSkip}
      />
      <div className="connection-game-prompt">
        <span>Photo prompt</span>
        <p>{state.prompt}</p>
      </div>
      <div className="turn-badge connection-turn-badge">
        <div>
          <strong>{activeName}</strong>
          <span>{choosingPhoto ? ' chooses and captions' : ' writes a second caption'}</span>
        </div>
        <span className="sealed-chip">{Object.keys(state.captions || {}).length}/2 captioned</span>
      </div>

      {ownCaption ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">▣</span>
          <strong>Your caption is sealed.</strong>
          <p>The two versions reveal together in the scrapbook.</p>
        </div>
      ) : disabled ? (
        <div className="connection-waiting-card">
          <span aria-hidden="true">⌛</span>
          <strong>{activeName} is building the memory card.</strong>
          <p>The photo and both captions reveal after the second turn.</p>
        </div>
      ) : (
        <>
          {choosingPhoto && (
            <label className={`photo-picker${imageDataUrl ? ' selected' : ''}`}>
              <input accept="image/*" onChange={choosePhoto} type="file" />
              {imageDataUrl
                ? <img alt="Selected flashback" src={imageDataUrl} />
                : (
                    <span>
                      <strong>{loading ? 'Preparing photo…' : 'Choose A Shared Photo'}</strong>
                      <small>Compressed on this phone before it is saved</small>
                    </span>
                  )}
            </label>
          )}
          {!choosingPhoto && state.imageDataUrl && (
            <img alt="Shared flashback" className="photo-flashback-preview" src={state.imageDataUrl} />
          )}
          <textarea
            aria-label="Photo caption"
            className="text-entry photo-caption-entry"
            maxLength={240}
            onChange={(event) => setCaption(event.target.value)}
            placeholder="Write what this photo means from your side…"
            rows={4}
            value={caption}
          />
          <div className="photo-caption-meta">
            <span>{error || 'Your partner will not see this caption yet.'}</span>
            <strong>{caption.length}/240</strong>
          </div>
          <button
            className="primary-btn"
            disabled={!caption.trim() || loading || (choosingPhoto && !imageDataUrl)}
            onClick={submitCaption}
            type="button"
          >
            Seal My Caption
          </button>
        </>
      )}
    </div>
  )
}

function createBluffEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      const selected = pickItem(BLUFF_BIDDING_TOPICS, options.random)
      const bidderIndex = options.activePlayerIndex ?? 0
      return {
        activityId: definition.id,
        bidderIndex,
        currentBid: 2,
        history: [{ bid: 2, bidderIndex }],
        maxBid: 8,
        mode: 'bluff-bidding',
        phase: 'bidding',
        topic: selected.prompt,
        topicId: selected.id,
        turnIndex: getNextPlayerIndex(bidderIndex),
      }
    },
    advance(state, { input, playerIndex }) {
      if (playerIndex !== state.turnIndex) {
        return { completed: false, state }
      }

      if (state.phase === 'bidding' && input.action === 'raise' && state.currentBid < state.maxBid) {
        const currentBid = state.currentBid + 1
        return {
          completed: false,
          state: {
            ...state,
            bidderIndex: playerIndex,
            currentBid,
            history: [...state.history, { bid: currentBid, bidderIndex: playerIndex }],
            turnIndex: getNextPlayerIndex(playerIndex),
          },
        }
      }

      if (state.phase === 'bidding' && input.action === 'challenge') {
        return {
          completed: false,
          state: {
            ...state,
            challengerIndex: playerIndex,
            phase: 'proof',
            turnIndex: state.bidderIndex,
          },
        }
      }

      if (state.phase === 'proof' && playerIndex === state.bidderIndex) {
        const answers = Array.isArray(input.answers)
          ? Array.from(new Set(
              input.answers
                .map((answer) => String(answer).trim())
                .filter(Boolean),
            )).slice(0, 12)
          : []
        if (!answers.length) {
          return { completed: false, state }
        }
        return {
          completed: true,
          state: {
            ...state,
            answers,
          },
        }
      }

      return { completed: false, state }
    },
    render(props) {
      return <BluffBiddingCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const succeeded = state.answers.length >= state.currentBid
      const bidderName = getPlayerName(players, state.bidderIndex)
      const challengerName = getPlayerName(players, state.challengerIndex)
      const heartBonus = succeeded ? 4 : 2
      return {
        heartBonus,
        label: definition.label,
        payload: {
          answers: state.answers,
          bid: state.currentBid,
          bidderIndex: state.bidderIndex,
          challengerIndex: state.challengerIndex,
          heartBonus,
          history: state.history,
          succeeded,
          topic: state.topic,
        },
        savesToJournal: true,
        summary: succeeded
          ? `${bidderName} proved the ${state.currentBid}-answer boast.`
          : `${challengerName} caught the bluff at ${state.currentBid}.`,
        text: state.answers.join(', '),
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

function isValidPhoto(imageDataUrl) {
  return typeof imageDataUrl === 'string' &&
    imageDataUrl.length <= 350000 &&
    /^data:image\/(?:webp|jpeg|png);base64,/.test(imageDataUrl)
}

function createPhotoEntry(definition) {
  return {
    ...definition,
    createInitialState(_players, options = {}) {
      const selected = pickItem(PHOTO_FLASHBACK_PROMPTS, options.random)
      const photoOwnerIndex = options.activePlayerIndex ?? 0
      return {
        activityId: definition.id,
        captions: {},
        mode: 'photo-flashback',
        phase: 'photo',
        photoOwnerIndex,
        prompt: selected.prompt,
        promptId: selected.id,
        turnIndex: photoOwnerIndex,
      }
    },
    advance(state, { input, playerIndex }) {
      const caption = String(input.caption || '').trim().slice(0, 240)
      if (
        playerIndex !== state.turnIndex ||
        state.captions?.[String(playerIndex)] ||
        !caption
      ) {
        return { completed: false, state }
      }

      if (state.phase === 'photo' && playerIndex === state.photoOwnerIndex) {
        if (!isValidPhoto(input.imageDataUrl)) {
          return { completed: false, state }
        }
        return {
          completed: false,
          state: {
            ...state,
            captions: {
              [String(playerIndex)]: caption,
            },
            imageDataUrl: input.imageDataUrl,
            phase: 'caption',
            turnIndex: getNextPlayerIndex(playerIndex),
          },
        }
      }

      if (state.phase === 'caption') {
        return {
          completed: true,
          state: {
            ...state,
            captions: {
              ...state.captions,
              [String(playerIndex)]: caption,
            },
          },
        }
      }

      return { completed: false, state }
    },
    render(props) {
      return <PhotoFlashbackCard {...props} definition={definition} />
    },
    resolve(state, players) {
      const captions = [0, 1].map((playerIndex) => ({
        label: getPlayerName(players, playerIndex),
        playerIndex,
        text: state.captions[String(playerIndex)],
      }))
      return {
        heartBonus: 4,
        label: definition.label,
        payload: {
          captions,
          heartBonus: 4,
          imageDataUrl: state.imageDataUrl,
          prompt: state.prompt,
          promptId: state.promptId,
        },
        savesToJournal: true,
        summary: 'One photograph collected two versions of the same memory.',
        text: captions
          .map((caption) => `${getPlayerName(players, caption.playerIndex)}: ${caption.text}`)
          .join('\n'),
        title: definition.label,
        type: definition.type,
        vibe: definition.vibe,
      }
    },
  }
}

export function createWaveFourGameEntry(definition) {
  if (definition.id === 'bluff-bidding') {
    return createBluffEntry(definition)
  }

  if (definition.id === 'photo-flashback') {
    return createPhotoEntry(definition)
  }

  return null
}
