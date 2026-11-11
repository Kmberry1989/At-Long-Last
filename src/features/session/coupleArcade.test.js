import { describe, expect, it } from 'vitest'
import { applyCoupleArcadeAction, createCoupleArcadeState } from '../couple/coupleArcadeService.js'
import {
  MAD_LIBS_BLANKS,
  MAD_LIBS_TEMPLATES,
  autoPlaceRadarLoveFleet,
  askCatchMyHeart,
  createCatchMyHeart,
  createMyOneAndOnly,
  createOurLittlePieces,
  createRadarLove,
  fillLoveInTheBlanks,
  fireRadarLoveShot,
  playMyOneAndOnlyCard,
  placeRadarLoveShip,
  readyRadarLoveFleet,
  rotateOurLittlePiece,
  weaveOurNextLine,
} from './coupleArcade.js'

describe('At Long Last couple arcade mechanics', () => {
  it('deals a 108-card My One and Only hand and takes only legal turns', () => {
    const game = createMyOneAndOnly(['a', 'b'], () => 0.42)
    expect(Object.values(game.hands).map(hand => hand.length)).toEqual([7, 7])
    expect(game.drawPile.length + game.discardPile.length + Object.values(game.hands).flat().length).toBe(108)
    expect(game.activeColor).not.toBe('wild')
    const playable = game.hands.a.find(card => card.color === game.activeColor || card.value === game.discardPile.at(-1).value)
    expect(() => playMyOneAndOnlyCard(game, { playerUid: 'b', cardId: playable.id })).toThrow(/turn/i)
    expect(playMyOneAndOnlyCard(game, { playerUid: 'a', cardId: playable.id }).moveCount).toBe(1)
  })

  it('deals Go Fish cards and only allows asking for a held rank', () => {
    const game = createCatchMyHeart(['a', 'b'], () => 0.31)
    expect(Object.values(game.hands).flat().length + game.drawPile.length + Object.values(game.books).flat().length * 4).toBe(52)
    const rank = game.hands.a[0].rank
    expect(askCatchMyHeart(game, { playerUid: 'a', targetUid: 'b', rank }).lastAction.rank).toBe(rank)
    expect(() => askCatchMyHeart(game, { playerUid: 'a', targetUid: 'b', rank: 'invalid' })).toThrow()
  })

  it('lets both players place fleets independently before Radar Love starts', () => {
    let game = createRadarLove(['a', 'b'], () => 0.17)
    expect(game.status).toBe('placing')
    game = placeRadarLoveShip(game, { playerUid: 'a', shipId: 0, cells: ['0:0', '0:1', '0:2'] })
    game = placeRadarLoveShip(game, { playerUid: 'a', shipId: 1, cells: ['2:0', '2:1'] })
    game = placeRadarLoveShip(game, { playerUid: 'a', shipId: 2, cells: ['4:0', '4:1'] })
    expect(() => placeRadarLoveShip(game, { playerUid: 'a', shipId: 2, cells: ['2:1', '3:1'] })).toThrow(/overlap/i)
    game = readyRadarLoveFleet(game, 'a')
    expect(game.status).toBe('placing')
    game = autoPlaceRadarLoveFleet(game, 'b', () => 0.17)
    game = readyRadarLoveFleet(game, 'b')
    expect(game.status).toBe('playing')
    const allCells = Object.values(game.fleets).flatMap(fleet => fleet.flatMap(ship => ship.cells))
    expect(allCells).toHaveLength(14)
    for (const fleet of Object.values(game.fleets)) {
      const cells = fleet.flatMap(ship => ship.cells)
      expect(new Set(cells).size).toBe(cells.length)
    }
    const next = fireRadarLoveShot(game, { playerUid: 'a', row: 7, column: 7 })
    expect(next.shots.a).toContain('7:7')
    expect(() => fireRadarLoveShot(next, { playerUid: 'a', row: 7, column: 7 })).toThrow(/turn/i)
    const target = game.fleets.b[0].cells[0].split(':').map(Number)
    const hit = fireRadarLoveShot(game, { playerUid: 'a', row: target[0], column: target[1] })
    expect(hit.hits.a).toContain(`${target[0]}:${target[1]}`)
  })

  it('creates a scrambled shared puzzle and allows full quarter-turn rotations', () => {
    const game = createOurLittlePieces(['a', 'b'], () => 0.17)
    expect(Object.keys(game.pieces)).toHaveLength(9)
    expect(new Set(Object.values(game.pieces).map(piece => piece.slot)).size).toBe(9)
    expect(Object.entries(game.pieces).some(([id, piece]) => piece.slot !== Number(id.slice(1)))).toBe(true)
    let rotated = game
    for (let index = 0; index < 4; index += 1) rotated = rotateOurLittlePiece(rotated, { playerUid: 'b', pieceId: 'p0', direction: 1 })
    expect(rotated.pieces.p0.rotation).toBe(game.pieces.p0.rotation)
    expect(rotated.moveCount).toBe(4)
  })

  it('tracks Radar Love keepsakes and preserves them when a new match starts', () => {
    const started = createCoupleArcadeState('radar-love', ['a', 'b'])
    const inPlay = { ...started, status: 'playing', fleets: { ...started.fleets, b: started.fleets.b.map((ship, index) => ({ ...ship, cells: index === 0 ? ['0:0'] : [] })) } }
    const won = applyCoupleArcadeAction(inPlay, 'radar-love', 'a', { kind: 'shot', row: 0, column: 0 })
    expect(won.wins).toEqual({ a: 1, b: 0 })
    expect(createCoupleArcadeState('radar-love', ['a', 'b'], Math.random, { wins: won.wins }).wins).toEqual({ a: 1, b: 0 })
  })

  it('unlocks new jigsaw art after shared puzzle solves', () => {
    const first = createCoupleArcadeState('our-little-pieces', ['a', 'b'], Math.random)
    const pieces = Object.fromEntries(Array.from({ length: 9 }, (_, index) => [`p${index}`, { slot: index, rotation: index === 0 ? 270 : 0, placedBy: null }]))
    const solved = applyCoupleArcadeAction({ ...first, pieces }, 'our-little-pieces', 'b', { kind: 'rotate-piece', pieceId: 'p0', direction: 1 })
    expect(solved).toMatchObject({ status: 'finished', solvedCount: 1 })
    expect(createCoupleArcadeState('our-little-pieces', ['a', 'b'], Math.random, { solvedCount: 1 }).artIndex).toBe(1)
    expect(createCoupleArcadeState('our-little-pieces', ['a', 'b'], Math.random, { solvedCount: 3 }).artIndex).toBe(2)
    expect(createCoupleArcadeState('our-little-pieces', ['a', 'b'], Math.random, { solvedCount: 5 }).artIndex).toBe(3)
    expect(createCoupleArcadeState('our-little-pieces', ['a', 'b'], Math.random, { solvedCount: 7 }).artIndex).toBe(4)
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
