import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChecklistRail } from './ChecklistRail.jsx'
import { LoveTank } from './LoveTank.jsx'

describe('ChecklistRail', () => {
  it('marks completed goals from live session state', () => {
    const session = {
      lastRoll: 4,
      players: [{ uid: 'a' }, { uid: 'b' }],
      moodVotes: { a: 'Cozy', b: 'Playful' },
      vibeWeights: { cozy: 2 },
    }

    const html = renderToStaticMarkup(<ChecklistRail session={session} />)

    expect(html).toContain('Night checklist: 3 of 5 complete')
    expect(html).toContain('Share your mood')
    expect(html).toContain('Take the first roll')
    expect(html).toContain('Set the night&#x27;s vibe')
  })

  it('renders nothing without a session', () => {
    expect(renderToStaticMarkup(<ChecklistRail session={null} />)).toBe('')
  })
})

describe('LoveTank', () => {
  it('shows the shared hearts total with a fill level', () => {
    const html = renderToStaticMarkup(<LoveTank hearts={12} onOpenGuide={() => {}} />)

    expect(html).toContain('Love Tank: 12 shared hearts')
    expect(html).toContain('height:50%')
  })
})
