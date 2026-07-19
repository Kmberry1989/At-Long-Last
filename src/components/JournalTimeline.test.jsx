/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { JournalTimeline } from './JournalTimeline.jsx'

describe('JournalTimeline', () => {
  it('renders scrapbook cards for activities, duels, keepsakes, and the finale', () => {
    render(
      <JournalTimeline
        entries={[
          {
            createdAt: '2026-07-17T00:00:00.000Z',
            id: 'activity-1',
            payload: {
              entries: [
                { text: 'Tea and blankets.' },
                { text: 'Quiet company and snacks.' },
              ],
              prompt: "When I'm overwhelmed, what actually helps is...",
            },
            summary: 'A tender note got saved.',
            text: 'Kyle: Tea and blankets.\nElaine: Quiet company and snacks.',
            title: 'Comfort Menu',
            type: 'prompt',
            vibe: 'tender',
          },
          {
            createdAt: '2026-07-17T00:10:00.000Z',
            id: 'duel-1',
            payload: {
              heartBonus: 4,
              results: {
                u1: { highlight: 'landed it clean', time: 0.91, won: true },
                u2: { highlight: 'kept it close', time: 1.03, won: false },
              },
            },
            summary: 'Kyle won the replay and banked 4 shared hearts.',
            text: 'Kyle: landed it clean\nElaine: kept it close',
            title: 'Reaction Heart',
            type: 'duel',
            vibe: 'playful',
          },
          {
            createdAt: '2026-07-17T00:20:00.000Z',
            id: 'keep-1',
            payload: {
              blurb: 'Tiny, sincere, impossible to forget.',
              cost: 7,
              label: 'Pocket Love Note',
            },
            summary: 'You spent 7 hearts on Pocket Love Note.',
            text: 'Tiny, sincere, impossible to forget.',
            title: 'Pocket Love Note',
            type: 'keepsake',
            vibe: 'tender',
          },
          {
            createdAt: '2026-07-17T00:30:00.000Z',
            id: 'finale-1',
            payload: {
              coda: 'Enough little wins stacked up to feel like a proper finale instead of a fade-out.',
              dominantVibe: 'playful',
              duelOutcomeLabel: 'Shared finish',
              headline: 'A night with some weight to it.',
              hearts: 9,
              journalCount: 6,
              keepsakeCount: 2,
              keepsakeLabels: ['Pocket Love Note', 'Sparkler Photo'],
              tierLabel: 'Shelf-worthy run',
            },
            summary: 'A very solid little legend.',
            text: '2 keepsakes, 6 journal beats, 9 hearts left.',
            title: 'Night Closed Out',
            type: 'finale',
            vibe: 'playful',
          },
        ]}
      />,
    )

    expect(screen.getByText('Conversation Slip')).toBeInTheDocument()
    expect(screen.getByText('Shared hearts')).toBeInTheDocument()
    expect(screen.getByText('Pocket Love Note')).toBeInTheDocument()
    expect(screen.getByText('A night with some weight to it.')).toBeInTheDocument()
    expect(screen.getByText('Shared finish')).toBeInTheDocument()
  })
})
