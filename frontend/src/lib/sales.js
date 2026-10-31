const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_MS = 86400000

const remainingOf = (item) => Math.max(0, item.saleQuantityLimit - item.quantitySold)

// Local-date parse; new Date('YYYY-MM-DD') would be UTC.
const parseDay = (s) => {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Calendar-day difference (DST-safe via rounding, time of day ignored).
const daysBetween = (from, to) =>
  Math.round((parseDay(to) - new Date(from.getFullYear(), from.getMonth(), from.getDate())) / DAY_MS)

export function joinSales(sales, manga) {
  const byId = new Map(manga.map((m) => [String(m.id), m]))
  return sales
    .filter((s) => s.status === 'ACTIVE' || s.status === 'UPCOMING')
    .sort((a, b) => (a.status === b.status ? 0 : a.status === 'ACTIVE' ? -1 : 1) || a.startDate.localeCompare(b.startDate))
    .map((s) => ({
      ...s,
      items: s.items
        .filter((i) => byId.has(String(i.mangaId)))
        .map((i) => {
          const remaining = remainingOf(i)
          return { ...i, manga: byId.get(String(i.mangaId)), remaining, soldOut: remaining === 0 }
        }),
    }))
}

export function activePrices(sales) {
  const prices = new Map()
  for (const s of sales) {
    if (s.status !== 'ACTIVE') continue
    for (const i of s.items) {
      if (remainingOf(i) === 0) continue
      const key = String(i.mangaId)
      const discountedPrice = Number(i.discountedPrice)
      if (!prices.has(key) || discountedPrice < prices.get(key).discountedPrice) {
        prices.set(key, { discountedPrice, flashSaleId: i.flashSaleId })
      }
    }
  }
  return prices
}

export function saleDaysLabel(sale, today) {
  if (sale.status === 'ACTIVE') {
    const n = daysBetween(today, sale.endDate)
    return n <= 0 ? 'Ends today' : n === 1 ? '1 day left' : `${n} days left`
  }
  const n = daysBetween(today, sale.startDate)
  return n <= 1 ? 'Starts tomorrow' : `Starts in ${n} days`
}

const shortDate = (s) => {
  const d = parseDay(s)
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export const formatDateRange = (sale) => `${shortDate(sale.startDate)} – ${shortDate(sale.endDate)}`
