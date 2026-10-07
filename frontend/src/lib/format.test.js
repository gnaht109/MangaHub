import { describe, it, expect } from 'vitest'
import { formatPrice } from './format.js'

describe('formatPrice', () => {
  it('formats a number as VND', () => {
    expect(formatPrice(45000)).toBe('45.000 ₫')
  })
  it('formats a numeric string from BigDecimal JSON', () => {
    expect(formatPrice('45000.00')).toBe('45.000 ₫')
  })
  it('returns an em dash for missing or invalid values', () => {
    expect(formatPrice(null)).toBe('—')
    expect(formatPrice(undefined)).toBe('—')
    expect(formatPrice('')).toBe('—')
    expect(formatPrice('abc')).toBe('—')
  })
})
