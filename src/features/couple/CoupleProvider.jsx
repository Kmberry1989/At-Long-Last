import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  doc,
  onSnapshot,
} from 'firebase/firestore'
import { useFirebaseApp } from './FirebaseAppContext.jsx'
import {
  createCoupleDocument,
  joinCoupleByInviteCode,
  leaveCoupleDocument,
} from './coupleService.js'

const CoupleContext = createContext(null)

export function CoupleProvider({ children }) {
  const { db, enabled, origin, ready, userId } = useFirebaseApp()
  const [couple, setCouple] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewCouple, setPreviewCouple] = useState(null)
  const [linkedCoupleId, setLinkedCoupleId] = useState(null)

  useEffect(() => {
    if (!ready) {
      return undefined
    }

    if (!enabled || !db || !userId) {
      setLoading(false)
      setCouple(previewCouple)
      return undefined
    }

    setLoading(true)

    const unsubscribe = onSnapshot(
      doc(db, 'playerCouples', userId),
      (snapshot) => {
        const nextCoupleId = snapshot.exists() ? snapshot.data().coupleId : null
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
  }, [db, enabled, previewCouple, ready, userId])

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
        setCouple(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)
        setLoading(false)
      },
      (nextError) => {
        setError(nextError.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [db, enabled, linkedCoupleId, ready])

  async function createCouple(displayName) {
    if (!db || !userId) {
      return
    }

    setError('')
    try {
      await createCoupleDocument({ db, displayName, origin, userId })
    } catch (nextError) {
      setError(nextError.message)
    }
  }

  async function joinCouple(displayName, inviteCode) {
    if (!db || !userId) {
      return
    }

    setError('')
    try {
      await joinCoupleByInviteCode({
        code: inviteCode,
        db,
        displayName,
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

    try {
      await leaveCoupleDocument({
        couple,
        db,
        userId,
      })

      await joinCoupleByInviteCode({
        code: inviteCode,
        db,
        displayName,
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
    }
    setPreviewCouple(nextPreviewCouple)
    setCouple(nextPreviewCouple)
  }

  const value = useMemo(
    () => ({
      couple,
      createCouple,
      error,
      hasPartner: couple?.playerIds?.length === 2,
      joinCouple,
      leaveCouple,
      launchPreview,
      loading,
      previewMode: !enabled,
      setError,
      switchCouple,
    }),
    [couple, enabled, error, loading],
  )

  return (
    <CoupleContext.Provider value={value}>{children}</CoupleContext.Provider>
  )
}

export function useCouple() {
  return useContext(CoupleContext)
}
