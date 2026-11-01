import { describe, expect, it } from 'vitest'
import { FREE_FRAME_IDS, framePurchase, googlePhotoURL } from './portraitFrames.js'
describe('portrait frames', () => {
  it('uses only Google-hosted HTTPS photos', () => {
    expect(googlePhotoURL('https://lh3.googleusercontent.com/a/photo')).toBe('https://lh3.googleusercontent.com/a/photo')
    for (const url of ['javascript:alert(1)', 'http://lh3.googleusercontent.com/a', 'https://googleusercontent.com.evil.test/photo', 'https://fake@lh3.googleusercontent.com/a']) expect(googlePhotoURL(url)).toBeNull()
  })
  it('offers three free frames and charges only the first unlock', () => {
    expect(FREE_FRAME_IDS).toHaveLength(3)
    expect(framePurchase(null, 'ivory', 0).cost).toBe(0)
    const paid = framePurchase(null, 'rose', 48)
    expect(paid.cost).toBe(48)
    expect(paid.portrait.selectedFrame).toBe('rose')
    expect(framePurchase(paid.portrait, 'rose', 0).cost).toBe(0)
    expect(() => framePurchase(null, 'rose', 47)).toThrow('48 shared hearts')
  })
})
