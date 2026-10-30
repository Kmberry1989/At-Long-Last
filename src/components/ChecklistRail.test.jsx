import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ChecklistRail } from './ChecklistRail.jsx'
import { LoveTank } from './LoveTank.jsx'

describe('ChecklistRail', () => {
  it('marks completed goals from live session state', () => {
    const session = {
      lastRoll: 4,
      players: [{ uid: 'a' }, { uid: 'b' }],
    }

    const html = renderToStaticMarkup(<ChecklistRail session={session} />)

    expect(html).toContain('Night checklist: 1 of 3 complete')
    expect(html).toContain('Roll')
    expect(html).not.toContain('Mood')
    expect(html).not.toContain('Vibe')
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
