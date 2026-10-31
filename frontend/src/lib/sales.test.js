import { describe, it, expect } from 'vitest'
import { joinSales, activePrices, saleDaysLabel, formatDateRange } from './sales.js'

const item = (o) => ({ id: 1, mangaId: 1, flashSaleId: 1, discountedPrice: 10000, saleQuantityLimit: 5, quantitySold: 0, ...o })
const sale = (o) => ({ id: 1, name: 'S', startDate: '2026-11-01', endDate: '2026-11-07', status: 'ACTIVE', items: [], ...o })
const manga = [{ id: 1, title: 'A' }, { id: 2, title: 'B' }]

describe('joinSales', () => {
  it('drops ENDED and CANCELLED sales', () => {
    const out = joinSales([sale({ id: 1, status: 'ENDED' }), sale({ id: 2, status: 'CANCELLED' }), sale({ id: 3 })], manga)
    expect(out.map((s) => s.id)).toEqual([3])
  })

  it('sorts ACTIVE before UPCOMING, then by startDate, without mutating input', () => {
    const input = [
      sale({ id: 1, status: 'UPCOMING', startDate: '2026-12-01' }),
      sale({ id: 2, status: 'UPCOMING', startDate: '2026-11-10' }),
      sale({ id: 3, status: 'ACTIVE', startDate: '2026-11-05' }),
      sale({ id: 4, status: 'ACTIVE', startDate: '2026-11-01' }),
    ]
    expect(joinSales(input, manga).map((s) => s.id)).toEqual([4, 3, 2, 1])
    expect(input.map((s) => s.id)).toEqual([1, 2, 3, 4])
  })

  it('marks sold out when limit equals sold', () => {
    const [s] = joinSales([sale({ items: [item({ saleQuantityLimit: 5, quantitySold: 5 })] })], manga)
    expect(s.items[0]).toMatchObject({ remaining: 0, soldOut: true })
  })

  it('clamps remaining to 0 when oversold', () => {
    const [s] = joinSales([sale({ items: [item({ saleQuantityLimit: 5, quantitySold: 7 })] })], manga)
    expect(s.items[0]).toMatchObject({ remaining: 0, soldOut: true })
  })

  it('attaches manga and remaining, matching by String(mangaId)', () => {
    const [s] = joinSales([sale({ items: [item({ mangaId: 2, quantitySold: 2 })] })], manga)
    expect(s.items[0]).toMatchObject({ remaining: 3, soldOut: false, manga: { id: 2 } })
  })

  it('drops items whose manga is unknown', () => {
    const [s] = joinSales([sale({ items: [item({ mangaId: 99 }), item({ mangaId: 1 })] })], manga)
    expect(s.items.map((i) => i.mangaId)).toEqual([1])
  })
})

describe('activePrices', () => {
  it('picks the lowest price, ignoring sold-out items and UPCOMING sales', () => {
    const map = activePrices([
      sale({ id: 1, items: [item({ flashSaleId: 1, discountedPrice: 20000 })] }),
      sale({ id: 2, items: [
        item({ flashSaleId: 2, discountedPrice: '18000' }),
        item({ flashSaleId: 2, mangaId: 2, discountedPrice: 1000, saleQuantityLimit: 3, quantitySold: 3 }),
      ] }),
      sale({ id: 3, status: 'UPCOMING', items: [item({ flashSaleId: 3, discountedPrice: 500 })] }),
    ])
    expect(map.get('1')).toEqual({ discountedPrice: 18000, flashSaleId: 2 })
    expect(map.has('2')).toBe(false)
  })
})

describe('saleDaysLabel', () => {
  const today = new Date(2026, 10, 7, 23, 30)
  it('ends today', () => expect(saleDaysLabel(sale({ endDate: '2026-11-07' }), today)).toBe('Ends today'))
  it('1 day left', () => expect(saleDaysLabel(sale({ endDate: '2026-11-08' }), today)).toBe('1 day left'))
  it('N days left', () => expect(saleDaysLabel(sale({ endDate: '2026-11-10' }), today)).toBe('3 days left'))
  it('starts tomorrow', () => expect(saleDaysLabel(sale({ status: 'UPCOMING', startDate: '2026-11-08' }), today)).toBe('Starts tomorrow'))
  it('starts in N days', () => expect(saleDaysLabel(sale({ status: 'UPCOMING', startDate: '2026-11-09' }), today)).toBe('Starts in 2 days'))
  it('same label early in the day', () => expect(saleDaysLabel(sale({ endDate: '2026-11-10' }), new Date(2026, 10, 7, 0, 5))).toBe('3 days left'))
})

describe('formatDateRange', () => {
  it('formats day-first short months with an en dash', () => {
    expect(formatDateRange(sale({ startDate: '2026-11-01', endDate: '2026-11-07' }))).toBe('1 Nov – 7 Nov')
  })
})
