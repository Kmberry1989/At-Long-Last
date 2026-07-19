import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  doc,
  onSnapshot,
} from 'firebase/firestore'
import { useFirebaseApp } from './FirebaseAppContext.jsx'
import {
  clearPlayerCoupleLink,
  createCoupleDocument,
  joinPublicLobby as joinPublicLobbyDocument,
  joinCoupleByInviteCode,
  leaveCoupleDocument,
  sendLobbyMessage as sendLobbyMessageDocument,
  subscribeToLobbyMessages,
  subscribeToPublicLobbies,
  updateCoupleSessionPreset as updateCoupleSessionPresetDocument,
} from './coupleService.js'
import { createDefaultBoardState } from '../session/sessionWiring.js'

const CoupleContext = createContext(null)

export function CoupleProvider({ children }) {
  const {
    db,
    enabled,
    origin,
    profile,
    ready,
    user,
    userId,
  } = useFirebaseApp()
  const [couple, setCouple] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewCouple, setPreviewCouple] = useState(null)
  const [linkedCoupleId, setLinkedCoupleId] = useState(null)
  const [blockedCoupleId, setBlockedCoupleId] = useState(null)
  const [publicLobbies, setPublicLobbies] = useState([])
  const [selectedPublicLobbyId, setSelectedPublicLobbyId] = useState(null)
  const [publicLobbyMessages, setPublicLobbyMessages] = useState([])

  async function recoverFromStaleCoupleLink(nextError) {
    if (!db || !userId || nextError?.code !== 'permission-denied') {
      setError(nextError.message)
      setLoading(false)
      return
    }

    const staleCoupleId = linkedCoupleId

    // Tear down the forbidden listener state first so Firestore does not keep
    // retrying a couple doc the current user cannot read.
    setBlockedCoupleId(staleCoupleId)
    setLinkedCoupleId(null)
    setCouple(null)
    setLoading(false)

    try {
      await clearPlayerCoupleLink({ db, userId })
      setError('That saved couple link was stale, so it was cleared. You can create or join a room again.')
    } catch {
      setError(nextError.message)
    }
  }

  useEffect(() => {
    if (!ready) {
      return undefined
    }

    if (!enabled || !db || !userId || !user) {
      setLoading(false)
      setCouple(previewCouple)
      return undefined
    }

    setLoading(true)

    const unsubscribe = onSnapshot(
      doc(db, 'playerCouples', userId),
      (snapshot) => {
        const nextCoupleId = snapshot.exists() ? snapshot.data().coupleId : null

        if (nextCoupleId && nextCoupleId === blockedCoupleId) {
          setLinkedCoupleId(null)
          setCouple(null)
          setLoading(false)
          return
        }

        if (!nextCoupleId) {
          setBlockedCoupleId(null)
        } else if (blockedCoupleId && blockedCoupleId !== nextCoupleId) {
          setBlockedCoupleId(null)
        }

        setLinkedCoupleId(nextCoupleId)
        if (!nextCoupleId) {
          setCouple(null)
          setLoading(false)
        }
      },
      (nextError) => {
        setError(nextError.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [blockedCoupleId, db, enabled, previewCouple, ready, user, userId])

  useEffect(() => {
    if (!ready) {
      return undefined
    }

    if (!enabled || !db || !linkedCoupleId) {
      return undefined
    }

    setLoading(true)

    const unsubscribe = onSnapshot(
      doc(db, 'couples', linkedCoupleId),
      (snapshot) => {
        if (!snapshot.exists()) {
          setBlockedCoupleId(linkedCoupleId)
          clearPlayerCoupleLink({ db, userId }).catch(() => undefined)
          setLinkedCoupleId(null)
          setCouple(null)
          setLoading(false)
          return
        }

        setCouple({ id: snapshot.id, ...snapshot.data() })
        setLoading(false)
      },
      recoverFromStaleCoupleLink,
    )

    return () => unsubscribe()
  }, [db, enabled, linkedCoupleId, ready, userId])

  useEffect(() => {
    if (!ready || !enabled || !db || !userId || !user) {
      setPublicLobbies([])
      return undefined
    }

    const unsubscribe = subscribeToPublicLobbies(
      db,
      (entries) => {
        const openLobbies = entries.filter((entry) => (
          entry.status === 'open' &&
          entry.playerCount === 1
        ))
        setPublicLobbies(openLobbies)
      },
      (nextError) => {
        setError(nextError.message)
      },
    )

    return () => unsubscribe()
  }, [db, enabled, ready, user, userId])

  const activePublicLobbyId = selectedPublicLobbyId || (
    couple?.playerIds?.length === 1 ? couple.id : null
  )

  useEffect(() => {
    if (!ready || !enabled || !db || !activePublicLobbyId) {
      setPublicLobbyMessages([])
      return undefined
    }

    const unsubscribe = subscribeToLobbyMessages(
      db,
      activePublicLobbyId,
      setPublicLobbyMessages,
      (nextError) => {
        setError(nextError.message)
      },
    )

    return () => unsubscribe()
  }, [activePublicLobbyId, db, enabled, ready])

  useEffect(() => {
    if (couple?.playerIds?.length === 1) {
      const ownLobbyId = couple.id

      if (selectedPublicLobbyId === ownLobbyId) {
        return
      }

      if (
        selectedPublicLobbyId &&
        publicLobbies.some((entry) => entry.id === selectedPublicLobbyId)
      ) {
        return
      }

      setSelectedPublicLobbyId(ownLobbyId)
      return
    }

    if (
      selectedPublicLobbyId &&
      publicLobbies.some((entry) => entry.id === selectedPublicLobbyId)
    ) {
      return
    }

    setSelectedPublicLobbyId(publicLobbies[0]?.id || null)
  }, [couple, publicLobbies, selectedPublicLobbyId])

  function getPreferredName(displayName) {
    return displayName?.trim() || profile?.displayName?.trim() || user?.displayName?.trim() || 'Player'
  }

  async function createCouple(displayName, sessionPreset) {
    if (!db || !userId) {
      return
    }

    setError('')
    setBlockedCoupleId(null)
    setSelectedPublicLobbyId(null)
    try {
      await createCoupleDocument({
        db,
        displayName: getPreferredName(displayName),
        origin,
        sessionPreset,
        userId,
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function joinCouple(displayName, inviteCode) {
    if (!db || !userId) {
      return
    }

    setError('')
    setBlockedCoupleId(null)
    setSelectedPublicLobbyId(null)
    try {
      await joinCoupleByInviteCode({
        code: inviteCode,
        db,
        displayName: getPreferredName(displayName),
        userId,
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function leaveCouple() {
    if (!db || !userId || !couple) {
      return
    }

    setError('')
    setBlockedCoupleId(null)
    setSelectedPublicLobbyId(null)
    try {
      await leaveCoupleDocument({
        couple,
        db,
        userId,
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function switchCouple(displayName, inviteCode) {
    if (!db || !userId || !couple) {
      return
    }

    setError('')
    setBlockedCoupleId(null)
    setSelectedPublicLobbyId(null)

    try {
      await leaveCoupleDocument({
        couple,
        db,
        userId,
      })

      await joinCoupleByInviteCode({
        code: inviteCode,
        db,
        displayName: getPreferredName(displayName),
        userId,
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  function launchPreview(displayName) {
    const name = displayName.trim() || 'You'
    const nextPreviewCouple = {
      id: 'preview-couple',
      inviteCode: 'PREVIEW',
      shareLink: '',
      status: 'paired',
      sessionPreset: 'standard',
      playerIds: ['preview-you', 'preview-echo'],
      players: [
        {
          uid: 'preview-you',
          displayName: name,
          color: '#ff7a97',
          accent: '#ff5478',
          avatar: '/assets/players/kyle.glb',
        },
        {
          uid: 'preview-echo',
          displayName: 'Echo',
          color: '#59b5ff',
          accent: '#2aa1ff',
          avatar: '/assets/players/kyle.glb',
        },
      ],
      activeSessionId: 'preview-session',
      boardState: createDefaultBoardState(),
    }
    setPreviewCouple(nextPreviewCouple)
    setCouple(nextPreviewCouple)
  }

  async function updateSessionPreset(preset) {
    if (!db || !couple?.id || !userId) {
      return
    }

    setError('')

    try {
      await updateCoupleSessionPresetDocument({
        coupleId: couple.id,
        db,
        preset,
        userId,
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function joinPublicLobby(lobbyId) {
    if (!db || !userId) {
      return
    }

    setError('')
    setBlockedCoupleId(null)

    try {
      await joinPublicLobbyDocument({
        db,
        displayName: getPreferredName(),
        lobbyId,
        userId,
      })
      setSelectedPublicLobbyId(null)
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function switchPublicLobby(lobbyId) {
    if (!db || !userId || !couple) {
      return
    }

    setError('')
    setBlockedCoupleId(null)

    try {
      await leaveCoupleDocument({
        couple,
        db,
        userId,
      })
      await joinPublicLobbyDocument({
        db,
        displayName: getPreferredName(),
        lobbyId,
        userId,
      })
      setSelectedPublicLobbyId(null)
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function postLobbyMessage(text) {
    if (!db || !userId || !activePublicLobbyId) {
      return
    }

    setError('')

    try {
      await sendLobbyMessageDocument({
        authorId: userId,
        authorName: getPreferredName(),
        db,
        lobbyId: activePublicLobbyId,
        text,
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  const value = useMemo(
    () => ({
      activePublicLobbyId,
      couple,
      createCouple,
      error,
      hasPartner: couple?.playerIds?.length === 2,
      joinCouple,
      joinPublicLobby,
      leaveCouple,
      launchPreview,
      loading,
      postLobbyMessage,
      profile,
      previewMode: !enabled,
      publicLobbyMessages,
      publicLobbies,
      sessionPreset: couple?.sessionPreset || 'standard',
      selectedPublicLobbyId,
      selectPublicLobby: setSelectedPublicLobbyId,
      setError,
      switchPublicLobby,
      switchCouple,
      updateSessionPreset,
    }),
    [
      activePublicLobbyId,
      couple,
      enabled,
      error,
      loading,
      profile,
      publicLobbyMessages,
      publicLobbies,
      couple?.sessionPreset,
      selectedPublicLobbyId,
    ],
  )

  return (
    <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
  )
}

export function useCouple() {
  return useContext(CoupleContext)
}
