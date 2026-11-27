import { BrandText } from '../../components/BrandIcon.jsx'
import { useEffect, useMemo, useState } from 'react'
import {
  BLUFF_BIDDING_TOPICS,
  PHOTO_FLASHBACK_PROMPTS,
} from './waveFourGameData.js'

import { pickFreshPrompt as pickItem } from './promptRotation.js'
import { getBankEntriesForActivity } from '../../expandedContentIntegration.js'
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

function ActivityHeader({ definition, eyebrow }) {
  return (
    <>
      <div className="overlay-head"><p className="eyebrow">{eyebrow}</p></div>
      <h3>{definition.label}</h3>
      <p className="support-copy">{definition.description}</p>
    </>
  )
}

const BLUFF_PROOF_BANKS = [
  { match: /movie|fictional couple|fictional place|film/i, options: ['Pride and Prejudice', 'When Harry Met Sally', 'The Princess Bride', 'La La Land', 'Notting Hill', 'Moonrise Kingdom', 'About Time', 'Sleepless in Seattle', 'The Holiday', 'Roman Holiday', 'Before Sunrise', '10 Things I Hate About You'] },
  { match: /song|playlist|soundtrack/i, options: ['Lover', 'All You Need Is Love', 'At Last', 'You Make My Dreams', 'This Will Be', 'Come Away with Me', 'Home', 'I Choose You', 'Better Together', 'Can’t Help Falling in Love', 'You Are the Best Thing', 'Dream a Little Dream'] },
  { match: /place|trip|destination|road|neighborhood|explore/i, options: ['A lakeside town', 'A quiet beach', 'A nearby garden', 'A mountain overlook', 'A favorite café', 'A little museum', 'A forest trail', 'A bookstore district', 'A scenic train ride', 'A farmers market', 'A cozy cabin', 'A familiar neighborhood'] },
  { match: /food|snack|meal|dessert|picnic|cook/i, options: ['Fresh fruit', 'Warm bread', 'Chocolate', 'A favorite soup', 'Cheese and crackers', 'Homemade cookies', 'A shared pizza', 'Tea and pastries', 'A picnic sandwich', 'Berry pie', 'Roasted vegetables', 'A favorite takeout dish'] },
  { match: /animal|pet|roommate/i, options: ['Otter', 'Capybara', 'Raccoon', 'Golden retriever', 'Crow', 'Penguin', 'Cat', 'Hedgehog', 'Duck', 'Fox', 'Rabbit', 'Turtle'] },
  { match: /rainy|date|adventure|celebrat|spend|afternoon|ways|ideas/i, options: ['Take a slow walk', 'Make a snack together', 'Start a tiny project', 'Visit somewhere nearby', 'Put on a favorite playlist', 'Make a blanket fort', 'Try a new recipe', 'Watch a comfort movie', 'Play a quick game', 'Look through old photos', 'Plan a small surprise', 'Do absolutely nothing'] },
  { match: /blanket|home|time capsule|object|thing|reason|tuesday|garden|spaceship|museum/i, options: ['A handwritten note', 'A favorite photo', 'A cozy blanket', 'A small plant', 'A favorite mug', 'A silly souvenir', 'A shared playlist', 'A book we love', 'A pressed flower', 'A tiny keepsake', 'A recipe card', 'A ticket stub'] },
]

function getBluffProofOptions(topic) {
  return BLUFF_PROOF_BANKS.find(({ match }) => match.test(topic))?.options || BLUFF_PROOF_BANKS.at(-1).options
}

function BluffBiddingCard({
  activity,
  definition,
  disabled,
  onSubmit,
  players,
}) {
  const state = activity.state
  const [answers, setAnswers] = useState([])
  const activeName = getPlayerName(players, state.turnIndex)
  const bidderName = getPlayerName(players, state.bidderIndex)

  useEffect(() => {
    setAnswers([])
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
          <span aria-hidden="true"><BrandText text={"♠"} /></span>
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
            <span>{bidderName} must choose {state.currentBid}</span>
            <strong>{answers.length}/{state.currentBid}</strong>
          </div>
          <div className="connection-choice-grid bluff-proof-options" role="group" aria-label={`Choose ${state.currentBid} answers for ${state.topic}`}>
            {(state.proofOptions || getBluffProofOptions(state.topic)).map((answer) => <button aria-pressed={answers.includes(answer)} className={`connection-choice${answers.includes(answer) ? ' active' : ''}`} disabled={!answers.includes(answer) && answers.length >= state.currentBid} key={answer} onClick={() => setAnswers((current) => current.includes(answer) ? current.filter((entry) => entry !== answer) : [...current, answer])} type="button">{answer}</button>)}
          </div>
          <p className="bluff-honor-note">Choose exactly {state.currentBid} possible answers. The list is shared with your partner.</p>
          <button
            className="primary-btn"
            disabled={answers.length !== state.currentBid}
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
  onSubmit,
  playerIndex,
  players,
}) {
  const CAPTION_CHOICES = [
    { id: 'keep', label: 'I want to keep this ordinary moment close.' },
    { id: 'smile', label: 'This detail still makes me smile.' },
    { id: 'feeling', label: 'I want to remember how this felt.' },
    { id: 'together', label: 'You made this moment special.' },
  ]
  const state = activity.state
  const [captionId, setCaptionId] = useState('')
  const [error, setError] = useState('')
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const activeName = getPlayerName(players, state.turnIndex)
  const ownCaption = state.captions?.[String(playerIndex)]
  const choosingPhoto = state.phase === 'photo'
  const visiblePhoto = choosingPhoto ? imageDataUrl : state.imageDataUrl

  useEffect(() => {
    setCaptionId('')
    setError('')
    setImageDataUrl('')
    setLoading(false)
  }, [activity.id, state.phase, state.turnIndex])

  useActivityUiState(useMemo(() => ({
    control: choosingPhoto ? 'photo-picker-and-caption-choice' : 'caption-choice',
    phase: state.phase,
    photoSelected: Boolean(visiblePhoto),
  }), [choosingPhoto, state.phase, visiblePhoto]))

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
    const caption = CAPTION_CHOICES.find((choice) => choice.id === captionId)?.label
    if (!caption) return
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

      />
      <div className="connection-game-prompt">
        <span>Photo prompt</span>
        <p>{state.prompt}</p>
      </div>
      <div className="turn-badge connection-turn-badge">
        <div>
          <strong>{activeName}</strong>
          <span>{choosingPhoto ? ' chooses a photo and caption' : ' chooses a second caption'}</span>
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
          <div className="connection-choice-grid" role="radiogroup" aria-label="Choose a caption">
            {CAPTION_CHOICES.map((choice) => (
              <button aria-checked={captionId === choice.id} className={`connection-choice${captionId === choice.id ? ' active' : ''}`} key={choice.id} onClick={() => setCaptionId(choice.id)} role="radio" type="button">
                {choice.label}
              </button>
            ))}
          </div>
          <div className="photo-caption-meta"><span>{error || 'Your partner will not see this caption yet.'}</span></div>
          <button
            className="primary-btn"
            disabled={!captionId || loading || (choosingPhoto && !imageDataUrl)}
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
      const selected = pickItem(getBankEntriesForActivity('bluff-bidding', BLUFF_BIDDING_TOPICS), options.random, options.history)
      const bidderIndex = options.activePlayerIndex ?? 0
      return {
        activityId: definition.id,
        bidderIndex,
        currentBid: 2,
        history: [{ bid: 2, bidderIndex }],
        maxBid: 8,
        mode: 'bluff-bidding',
        phase: 'bidding',
        proofOptions: getBluffProofOptions(selected.prompt),
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
                .filter((answer) => (state.proofOptions || getBluffProofOptions(state.topic)).includes(answer)),
            )).slice(0, 12)
          : []
        if (answers.length !== state.currentBid) {
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
      const selected = pickItem(getBankEntriesForActivity('photo-flashback', PHOTO_FLASHBACK_PROMPTS), options.random, options.history)
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
