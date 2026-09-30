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
  setRoomVisibility as setRoomVisibilityDocument,
  subscribeToLobbyMessages,
  subscribeToPublicLobbies,
  updateCoupleSessionPreset as updateCoupleSessionPresetDocument,
} from './coupleService.js'
import {
  ensureCoupleProgress,
  fulfillKoupon as fulfillKouponDocument,
  redeemKoupon as redeemKouponDocument,
  renameCompanion as renameCompanionDocument,
  selectTheme as selectThemeDocument,
  sendNudge as sendNudgeDocument,
  setAnniversary as setAnniversaryDocument,
  subscribeToCoupleProgress,
  unlockThemeWithHearts as unlockThemeWithHeartsDocument,
} from './progressService.js'
import { createDefaultBoardState } from '../session/sessionWiring.js'
import { PLAYER_THEMES, resolvePlayerAvatar } from './playerAvatar.js'

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
  const [progress, setProgress] = useState(null)

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
      setError('')
      setLinkedCoupleId(null)
      setBlockedCoupleId(null)
      setSelectedPublicLobbyId(null)
      setPublicLobbyMessages([])
      setCouple(previewCouple)
      return undefined
    }

    setError('')
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

    if (!enabled || !db || !userId || !user || !linkedCoupleId) {
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
  }, [db, enabled, linkedCoupleId, ready, user, userId])

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

  async function createCouple(displayName, sessionPreset, avatar, { isPublic = false } = {}) {
    if (!db || !userId) {
      return
    }

    setError('')
    setBlockedCoupleId(null)
    setSelectedPublicLobbyId(null)
    try {
      await createCoupleDocument({
        avatar,
        db,
        displayName: getPreferredName(displayName),
        isPublic,
        origin,
        sessionPreset,
        userId,
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function setRoomVisibility(isPublic) {
    if (!db || !userId || !couple) {
      return
    }

    setError('')

    try {
      await setRoomVisibilityDocument({
        coupleId: couple.id,
        db,
        isPublic,
        userId,
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function joinCouple(displayName, inviteCode, avatar) {
    if (!db || !userId) {
      return
    }

    setError('')
    setBlockedCoupleId(null)
    setSelectedPublicLobbyId(null)
    try {
      await joinCoupleByInviteCode({
        avatar,
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

  async function switchCouple(displayName, inviteCode, avatar) {
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
        avatar,
        code: inviteCode,
        db,
        displayName: getPreferredName(displayName),
        userId,
      })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  function launchPreview(displayName, avatar) {
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
          ...PLAYER_THEMES[0],
          avatar: resolvePlayerAvatar(avatar),
        },
        {
          uid: 'preview-echo',
          displayName: 'Echo',
          ...PLAYER_THEMES[1],
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

  async function joinPublicLobby(lobbyId, avatar) {
    if (!db || !userId) {
      return
    }

    setError('')
    setBlockedCoupleId(null)

    try {
      await joinPublicLobbyDocument({
        avatar,
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

  async function switchPublicLobby(lobbyId, avatar) {
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
        avatar,
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

  // Lifetime couple progress: hearts, streaks, trophies, koupons, companion,
  // themes. The doc is created on first read so a fresh couple starts empty
  // and real usage fills it in.
  useEffect(() => {
    if (!ready || !enabled || !db || !couple?.id) {
      setProgress(null)
      return undefined
    }

    let cancelled = false
    let unsubscribe = null

    ensureCoupleProgress(db, couple.id)
      .then(() => {
        if (cancelled) {
          return
        }

        unsubscribe = subscribeToCoupleProgress(
          db,
          couple.id,
          (nextProgress) => {
            if (!cancelled) {
              setProgress(nextProgress)
            }
          },
          (nextError) => {
            if (!cancelled) {
              setError(nextError.message)
            }
          },
        )
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(nextError.message)
        }
      })

    return () => {
      cancelled = true
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [couple?.id, db, enabled, ready])

  async function runProgressAction(action, ...args) {
    if (!db || !couple?.id) {
      return
    }

    setError('')

    try {
      await action(db, couple.id, ...args)
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  function unlockTheme(themeId) {
    return runProgressAction(unlockThemeWithHeartsDocument, themeId)
  }

  function selectTheme(themeId) {
    return runProgressAction(selectThemeDocument, themeId)
  }

  function redeemKoupon(kouponId) {
    return runProgressAction(redeemKouponDocument, kouponId)
  }

  function fulfillKoupon(kouponId) {
    return runProgressAction(fulfillKouponDocument, kouponId)
  }

  function renameCompanion(name) {
    return runProgressAction(renameCompanionDocument, name)
  }

  function setAnniversary(dateStr) {
    return runProgressAction(setAnniversaryDocument, dateStr)
  }

  function sendNudge() {
    return runProgressAction(sendNudgeDocument, {
      byName: getPreferredName(),
      byUid: userId,
    })
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
      progress,
      fulfillKoupon,
      renameCompanion,
      redeemKoupon,
      selectTheme,
      sendNudge,
      setAnniversary,
      unlockTheme,
      publicLobbyMessages,
      publicLobbies,
      sessionPreset: couple?.sessionPreset || 'standard',
      roomVisibility: couple?.visibility ?? 'private',
      setRoomVisibility,
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
      progress,
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
