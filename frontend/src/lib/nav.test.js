import { describe, it, expect } from 'vitest'
import { safeNext } from './nav.js'

describe('safeNext', () => {
  it('keeps same-origin paths', () => {
    expect(safeNext('/manga/m1')).toBe('/manga/m1')
    expect(safeNext('/?q=naruto')).toBe('/?q=naruto')
  })
  it('rejects external, protocol-relative and missing targets', () => {
    expect(safeNext('//evil.example')).toBe('/')
    expect(safeNext('/\\evil.example')).toBe('/')
    expect(safeNext('https://evil.example')).toBe('/')
    expect(safeNext(null)).toBe('/')
  })
  it('rejects control characters and backslashes', () => {
    expect(safeNext('/\t/evil.example')).toBe('/')
    expect(safeNext('/\n/evil.example')).toBe('/')
    expect(safeNext('/\r//evil')).toBe('/')
  })
  it('never sends you back to an auth page', () => {
    expect(safeNext('/login')).toBe('/')
    expect(safeNext('/signup?next=/x')).toBe('/')
  })
})
