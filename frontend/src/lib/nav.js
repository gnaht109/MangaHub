export function safeNext(next) {
  if (typeof next !== 'string' || !next.startsWith('/')) return '/'
  if (next.startsWith('//')) return '/'
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001F\u007F\\]/.test(next)) return '/'
  if (/^\/(login|signup)(\/|\?|$)/.test(next)) return '/'
  return next
}
