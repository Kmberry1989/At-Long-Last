import { describe, expect, it } from 'vitest'
import { compareStarMapRankings, decodeStarMapRanking, encodeStarMapRanking } from './starMapData.js'

describe('Star Map rankings', () => {
  it('encodes five unique values for a sealed submission and decodes them in rank order', () => {
    const encoded = encodeStarMapRanking(['t', 'h', 'l', 'b', 'p'])
    expect(encoded).toBe('thlbp')
    expect(decodeStarMapRanking(encoded).map(({ id }) => id)).toEqual(['t', 'h', 'l', 'b', 'p'])
  })

  it('rejects incomplete, repeated, and unknown values', () => {
    expect(encodeStarMapRanking(['t', 'h'])).toBe('')
    expect(encodeStarMapRanking(['t', 'h', 'l', 'b', 't'])).toBe('')
    expect(encodeStarMapRanking(['t', 'h', 'l', 'b', 'x'])).toBe('')
    expect(decodeStarMapRanking('thlbx')).toEqual([])
  })

  it('counts values that land in the same rank for the end-of-night comparison', () => {
    expect(compareStarMapRankings(
      decodeStarMapRanking('thlbp'),
      decodeStarMapRanking('tahlp'),
    )).toBe(2)
  })
})
