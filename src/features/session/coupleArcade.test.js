import { describe, expect, it } from 'vitest'
import { applyCoupleArcadeAction, createCoupleArcadeState } from '../couple/coupleArcadeService.js'
import {
  MAD_LIBS_BLANKS,
  MAD_LIBS_TEMPLATES,
  askCatchMyHeart,
  createCatchMyHeart,
  createMyOneAndOnly,
  createRadarLove,
  fillLoveInTheBlanks,
  fireRadarLoveShot,
  playMyOneAndOnlyCard,
  weaveOurNextLine,
} from './coupleArcade.js'

describe('At Long Last couple arcade mechanics', () => {
  it('deals a 108-card My One and Only hand and takes only legal turns', () => {
    const game = createMyOneAndOnly(['a', 'b'], () => 0.42)
    expect(game.hands.map(hand => hand.length)).toEqual([7, 7])
    expect(game.drawPile.length + game.discardPile.length + game.hands.flat().length).toBe(108)
    expect(game.activeColor).not.toBe('wild')
    const playable = game.hands[0].find(card => card.color === game.activeColor || card.value === game.discardPile.at(-1).value)
    expect(() => playMyOneAndOnlyCard(game, { playerUid: 'b', cardId: playable.id })).toThrow(/turn/i)
    expect(playMyOneAndOnlyCard(game, { playerUid: 'a', cardId: playable.id }).moveCount).toBe(1)
  })

  it('deals Go Fish cards and only allows asking for a held rank', () => {
    const game = createCatchMyHeart(['a', 'b'], () => 0.31)
    expect(game.hands.flat().length + game.drawPile.length + game.books.flat().length * 4).toBe(52)
    const rank = game.hands[0][0].rank
    expect(askCatchMyHeart(game, { playerUid: 'a', targetUid: 'b', rank }).lastAction.rank).toBe(rank)
    expect(() => askCatchMyHeart(game, { playerUid: 'a', targetUid: 'b', rank: 'invalid' })).toThrow()
  })

  it('keeps Radar Love fleets inside the grid and records one shot per spot', () => {
    const game = createRadarLove(['a', 'b'], () => 0.17)
    expect(game.fleets.flat(2)).toHaveLength(14)
    expect(new Set(game.fleets.flat(2)).size).toBe(14)
    const next = fireRadarLoveShot(game, { playerUid: 'a', row: 7, column: 7 })
    expect(next.shots[0]).toContain('7:7')
    expect(() => fireRadarLoveShot(next, { playerUid: 'a', row: 7, column: 7 })).toThrow(/turn/i)
    const target = game.fleets[1][0][0].split(':').map(Number)
    const hit = fireRadarLoveShot(game, { playerUid: 'a', row: target[0], column: target[1] })
    expect(hit.hits[0]).toContain(`${target[0]}:${target[1]}`)
  })

  it('plays both charades in sequence, scores correct guesses, and awards the better actor', () => {
    let state = createCoupleArcadeState('say-it-without-saying', ['a', 'b'], () => 0)
    expect(state.promptIndex).toBe(0)
    state = applyCoupleArcadeAction(state, state.game, 'a', { kind: 'charade', promptIndex: state.promptIndex, clipDataUrl: 'data:video/webm;base64,AAAA' })
    state = applyCoupleArcadeAction(state, state.game, 'b', { kind: 'guess', guessId: state.promptIndex })
    expect(state.scores).toEqual([1, 0])
    expect(state.actorIndex).toBe(1)
    state = applyCoupleArcadeAction(state, state.game, 'b', { kind: 'charade', promptIndex: state.promptIndex, clipDataUrl: 'data:video/mp4;base64,AAAA' })
    state = applyCoupleArcadeAction(state, state.game, 'a', { kind: 'guess', guessId: -1 })
    expect(state.status).toBe('finished')
    expect(state.winnerUid).toBe('a')
  })

  it('provides complete Mad Lib blanks and alternating one-word story reveal', () => {
    const template = MAD_LIBS_TEMPLATES[0]
    const answers = Object.fromEntries(MAD_LIBS_BLANKS.map(blank => [blank.id, blank.choices[0]]))
    const story = fillLoveInTheBlanks(template, answers)
    expect(story).not.toMatch(/\[[^\]]+\]/)
    expect(story).toContain(answers.food)
    expect(weaveOurNextLine(['we', 'found'], ['both', 'home'])).toBe('we both found home')
  })
})
