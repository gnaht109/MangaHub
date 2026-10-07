const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })

export function formatPrice(value) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string' && value.trim() === '') return '—'
  const amount = Number(value)
  return Number.isFinite(amount) ? vnd.format(amount) : '—'
}
