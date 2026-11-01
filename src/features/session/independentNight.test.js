import { describe, expect, it } from 'vitest'
import { activityRegistry } from './activityRegistry.jsx'
import { buildInitialSession } from './sessionLogic.js'
import { advanceNightStep, canAnswerStep, finishIndependentNight, getNightProgress, makeRollSteps, needsRevealInteraction } from './independentNight.js'
import { commitChoice } from './choiceCommitment.js'

const players = [{ uid: 'a', displayName: 'A' }, { uid: 'b', displayName: 'B' }]
function session() { return { ...buildInitialSession({ id: 'couple', players, sessionPreset: 'quick' }), id: 'night', status: 'active' } }
function duels(s) { return Array.from({ length: s.totalRounds }, (_, i) => ({ id: `duel-${i + 1}`, kind: 'duel', type: 'gratitude-duel', round: i + 1, ownerIndex: -1, ready: true, completed: false, skipped: false, state: { results: { '0': { highlight: 'Played', won: true, time: 1 }, '1': { highlight: 'Played', won: true, time: 2 } } } })) }
function activity(type = 'comfort-menu', round = 1, ownerIndex = 0) {
  return { id: `roll-${round}-${ownerIndex}`, round, ownerIndex, kind: 'activity', type, ready: false, completed: false, skipped: false,
    state: activityRegistry[type].createInitialState(players, { activePlayerIndex: ownerIndex, random: () => 0 }) }
}
async function answer(s, steps, id, playerIndex, input) {
  const result = await advanceNightStep(s, steps, id, playerIndex, input)
  return result ? steps.map(step => step.id === id ? result.step : step) : steps
}

describe('independent night pacing', () => {
  it('lets either phone roll first and advance after its own answer while its partner stays behind', async () => {
    const s = session()
    expect(getNightProgress(s, [], 1).canRoll).toBe(true)
    let steps = [activity()]
    expect(getNightProgress(s, steps, 0).canRoll).toBe(false)
    steps = await answer(s, steps, steps[0].id, 0, { text: 'My answer', guess: 'My guess' })
    expect(getNightProgress(s, steps, 0).canRoll).toBe(true)
    const next = makeRollSteps(s, steps, 0, [1, 1], [], () => 0)
    expect(next.created[0].round).toBe(2)
    expect(steps[0].state.entries).toHaveLength(1)
    expect(getNightProgress(s, steps, 1).ownRolls).toBe(0)
    expect(getNightProgress(s, steps, 0).readyToReveal).toBe(false)
  })

  it('keeps submitted answers immutable and accepts the partner first on private cards', async () => {
    const s = session()
    let steps = [activity()]
    steps = await answer(s, steps, steps[0].id, 1, { text: 'Partner first' })
    const duplicate = await advanceNightStep(s, steps, steps[0].id, 1, { text: 'Overwrite' })
    expect(duplicate).toBeNull()
    steps = await answer(s, steps, steps[0].id, 0, { text: 'Other answer' })
    expect(steps[0].ready).toBe(true)
    expect(steps[0].state.entries.map(row => row.text)).toEqual(['Partner first', 'Other answer'])
    expect(s.hearts).toBe(6)
  })

  it('allows independent specialist input while leaving partner-dependent steps pending', async () => {
    const s = session()
    const independent = activity('vibe-check')
    expect(canAnswerStep(independent, 1)).toBe(true)
    const photo = activity('photo-flashback')
    expect(canAnswerStep(photo, 1)).toBe(false)
    expect(getNightProgress(s, [photo], 1).canRoll).toBe(true)
    const updated = await answer(s, [independent], independent.id, 1, { value: 40 })
    expect(updated[0].state.values['1']).toBe(40)
  })

  it('defers choice opening until both players finish the board, and verifies the original commitment', async () => {
    const s = session()
    let steps = [activity('mind-meld')]
    const one = await commitChoice(steps[0].state.options[0].id)
    const two = await commitChoice(steps[0].state.options[1].id)
    steps = await answer(s, steps, steps[0].id, 1, { commitment: two.commitment })
    steps = await answer(s, steps, steps[0].id, 0, { commitment: one.commitment })
    expect(steps[0].ready).toBe(true)
    expect(needsRevealInteraction(steps[0])).toBe(true)
    expect(canAnswerStep(steps[0], 0)).toBe(false)
    expect(() => finishIndependentNight(s, steps)).toThrow()
    for (let round = 1; round <= s.totalRounds; round++) for (const ownerIndex of [0, 1]) {
      if (round === 1 && ownerIndex === 0) continue
      steps.push({ id: `roll-${round}-${ownerIndex}`, kind: 'board', round, ownerIndex, ready: true, completed: true, state: {} })
    }
    steps.push(...duels(s))
    expect(getNightProgress(s, steps, 0).readyToReveal).toBe(true)
    await expect(advanceNightStep(s, steps, steps[0].id, 0, { answerId: 'bad', nonce: one.nonce })).rejects.toThrow('verified')
    steps = await answer(s, steps, steps[0].id, 0, one)
    steps = await answer(s, steps, steps[0].id, 1, two)
    for (const index of [0, 1]) steps = await answer(s, steps, steps[0].id, index, { action: 'continue' })
    expect(steps[0].completed).toBe(true)
  })

  it('requires every roll and outstanding response, then produces exactly one finale artifact', async () => {
    const s = session()
    const steps = []
    for (let round = 1; round <= s.totalRounds; round++) for (const ownerIndex of [0, 1]) {
      let task = activity('comfort-menu', round, ownerIndex)
      task = (await advanceNightStep(s, [task], task.id, 0, { text: `A ${round}` })).step
      task = (await advanceNightStep(s, [task], task.id, 1, { text: `B ${round}` })).step
      steps.push(task)
    }
    steps.push(...duels(s))
    expect(() => finishIndependentNight(s, steps.slice(1))).toThrow()
    const { session: final, entries } = finishIndependentNight(s, steps)
    expect(final.phase).toBe('finale')
    expect(entries.filter(item => item.type === 'finale')).toHaveLength(1)
    expect(entries.filter(item => item.type !== 'finale')).toHaveLength(12)
    expect(entries.every(item => item.sessionId === s.id)).toBe(true)
    expect(final.hearts).toBeGreaterThan(6)
    expect(entries[0].payload.entries).toHaveLength(2)
  })
})

describe('end-of-night acknowledgements', () => {
  function finishedBoard(s, task) {
    const rolls = []
    for (let round=1; round<=s.totalRounds; round++) for (const ownerIndex of [0,1]) {
      const id = `roll-${round}-${ownerIndex}`
      rolls.push(id===task.id ? task : { id, round, ownerIndex, kind:'board', ready:true, completed:true, skipped:false, state:{} })
    }
    return [...rolls, ...duels(s).filter(duel => duel.id !== task.id), ...(task.kind === 'duel' ? [task] : [])]
  }
  it('does not strand the first player after the second player calls a matching verdict', async () => {
    const s = session()
    let task=activity('same-wavelength')
    task=(await advanceNightStep(s,[task],task.id,0,{text:'Coffee'})).step
    task=(await advanceNightStep(s,[task],task.id,1,{text:'Coffee'})).step
    let steps=finishedBoard(s,task)
    steps=await answer(s,steps,task.id,1,{matched:true})
    expect(canAnswerStep(steps.find(item=>item.id===task.id),0,true)).toBe(true)
    steps=await answer(s,steps,task.id,0,{revealAck:true})
    expect(getNightProgress(s,steps,0).readyToFinish).toBe(true)
  })
  it('moves a tied race replay to the end, preserving an independent retry for both players', async () => {
    const s=session()
    let task={ id:'duel-1', kind:'duel', type:'reaction-heart', round:1, ownerIndex:-1, ready:false, completed:false, skipped:false, state:{results:{}} }
    task=(await advanceNightStep(s,[task],task.id,0,{highlight:'Tapped',time:1,won:true})).step
    task=(await advanceNightStep(s,[task],task.id,1,{highlight:'Tapped',time:1,won:true})).step
    expect(task.state.retry).toBe(true)
    let steps=finishedBoard(s,task)
    expect(getNightProgress(s,steps,0).readyToFinish).toBe(false)
    steps=await answer(s,steps,task.id,0,{highlight:'Retried',time:1.1,won:true})
    expect(canAnswerStep(steps.find(item=>item.id===task.id),0,true)).toBe(false)
    steps=await answer(s,steps,task.id,1,{highlight:'Retried',time:2,won:true})
    expect(getNightProgress(s,steps,0).readyToFinish).toBe(true)
  })
})
