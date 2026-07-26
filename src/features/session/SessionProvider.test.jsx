/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const mockState = vi.hoisted(() => ({
  coupleContext: null,
  firebaseContext: null,
  initialSessionOverride: null,
}))

vi.mock('../couple/CoupleProvider.jsx', () => ({
  useCouple: () => mockState.coupleContext,
}))

vi.mock('../couple/FirebaseAppContext.jsx', () => ({
  useFirebaseApp: () => mockState.firebaseContext,
}))

vi.mock('./sessionLogic.js', async () => {
  const actual = await vi.importActual('./sessionLogic.js')
  return {
    ...actual,
    buildInitialSession: (couple) => mockState.initialSessionOverride ?? actual.buildInitialSession(couple),
  }
})

import { resolveSessionHostId, SessionProvider, useSession } from './SessionProvider.jsx'
import { ensureSessionArcState } from './sessionLogic.js'

function buildCouple() {
  return {
    id: 'couple-1',
    players: [
      { uid: 'u1', displayName: 'Kyle', color: '#f00' },
      { uid: 'u2', displayName: 'Elaine', color: '#0af' },
    ],
    sessionPreset: 'standard',
  }
}

function Probe() {
  const session = useSession()
  if (!session.readyToPlay) {
    return <div>loading</div>
  }

  return (
    <div>
      <div data-testid="phase">{session.session.phase}</div>
      <div data-testid="spotlight">{session.session.spotlight?.act}</div>
      <div data-testid="momentum-playful">{session.session.momentum?.playful}</div>
      <div data-testid="pending-activity">{session.session.pendingActivityType || 'none'}</div>
      <div data-testid="activity-type">{session.activity?.type || 'none'}</div>
      <button
        onClick={() =>
          session.submitVibeVote({
            playful: 0.3,
            spicy: 0.2,
            tender: 0.5,
          })}
        type="button"
      >
        Vote
      </button>
      <button onClick={() => session.selectActivityOption('comfort-menu')} type="button">
        Pick Comfort Menu
      </button>
    </div>
  )
}

describe('SessionProvider', () => {
  afterEach(() => {
    cleanup()
    mockState.initialSessionOverride = null
    mockState.coupleContext = null
    mockState.firebaseContext = null
  })

  function renderProvider() {
    mockState.coupleContext = {
      couple: buildCouple(),
      hasPartner: true,
    }
    mockState.firebaseContext = {
      db: null,
      enabled: false,
      ready: true,
      userId: 'u1',
    }

    render(
      <SessionProvider>
        <Probe />
      </SessionProvider>,
    )
  }

  it('resolves the host from the paired couple before the first session exists', () => {
    expect(resolveSessionHostId(null, buildCouple())).toBe('u1')
  })

  it('initializes local preview sessions with the new arc state and transitions out of vibe setup', async () => {
    renderProvider()

    await waitFor(() => expect(screen.getByTestId('phase')).toHaveTextContent('vibeSetup'))
    expect(screen.getByTestId('spotlight')).toHaveTextContent('warmup')
    expect(screen.getByTestId('momentum-playful')).toHaveTextContent('0')

    fireEvent.click(screen.getByText('Vote'))

    await waitFor(() => expect(screen.getByTestId('phase')).toHaveTextContent('turn'))
    expect(screen.getByTestId('spotlight')).toHaveTextContent('warmup')
  })

  it('handles activity-choice selection in local preview mode', async () => {
    mockState.initialSessionOverride = ensureSessionArcState({
      actionText: 'Playful momentum unlocked a double pick. Choose the next beat.',
      activePlayerIndex: 0,
      completedSpotlightActs: [],
      coupleId: 'couple-1',
      currentDuel: null,
      duelResults: {},
      goals: [],
      hearts: 6,
      hostId: 'u1',
      keepsakePerks: [],
      keepsakes: [],
      lastDuelOutcome: null,
      lastMove: null,
      lastRoll: 2,
      momentum: {
        playful: 2,
        spicy: 0,
        tender: 0,
        consumed: {
          playful: true,
          spicy: false,
          tender: false,
        },
        unlocked: {
          playful: true,
          spicy: false,
          tender: false,
        },
      },
      pendingActivityId: null,
      pendingActivityOptions: ['comfort-menu', 'small-mercies'],
      pendingActivityType: null,
      pendingKeepsake: null,
      phase: 'activityChoice',
      players: buildCouple().players,
      positions: [2, 0],
      preset: 'standard',
      round: 1,
      roundDuelBonus: 0,
      startingPlayerIndex: 0,
      totalRounds: 6,
      turnsTakenThisRound: 0,
      usedActivityIds: [],
      usedDuelIds: [],
      usedKeepsakePerks: [],
      vibeVotes: {},
      vibeWeights: {
        playful: 0.5,
        spicy: 0.2,
        tender: 0.3,
      },
    })

    renderProvider()

    await waitFor(() => expect(screen.getByTestId('phase')).toHaveTextContent('activityChoice'))
    fireEvent.click(screen.getByText('Pick Comfort Menu'))

    await waitFor(() => expect(screen.getByTestId('phase')).toHaveTextContent('activity'))
    expect(screen.getByTestId('pending-activity')).toHaveTextContent('comfort-menu')
    expect(screen.getByTestId('activity-type')).toHaveTextContent('comfort-menu')
  })
})
