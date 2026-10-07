import { describe, it, expect } from 'vitest'
import { normalizeText, filterManga } from './search.js'
import { sampleManga } from '../test/fixtures.js'

describe('search', () => {
  it('strips Vietnamese diacritics and đ', () => {
    expect(normalizeText('  Đảo Hải Tặc ')).toBe('dao hai tac')
  })
  it('returns everything for an empty or whitespace query', () => {
    expect(filterManga(sampleManga, '')).toHaveLength(3)
    expect(filterManga(sampleManga, '   ')).toHaveLength(3)
    expect(filterManga(sampleManga, null)).toHaveLength(3)
  })
  it('matches title or author, ignoring case and accents', () => {
    expect(filterManga(sampleManga, 'dao').map((m) => m.id)).toEqual(['m1'])
    expect(filterManga(sampleManga, 'URASAWA').map((m) => m.id)).toEqual(['m3'])
    expect(filterManga(sampleManga, 'zzz')).toEqual([])
  })
})
