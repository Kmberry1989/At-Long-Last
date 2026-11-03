import { describe, expect, it } from 'vitest'
import { brandIconPaths } from './brandIcons.js'

describe('card-deck brand marks', () => {
  it('provides distinct line-art symbols for Trash and Treasure moments', () => {
    expect(brandIconPaths.trash).toEqual(expect.arrayContaining([expect.any(String)]))
    expect(brandIconPaths.treasure).toEqual(expect.arrayContaining([expect.any(String)]))
    expect(brandIconPaths.trash).not.toEqual(brandIconPaths.treasure)
  })
})
