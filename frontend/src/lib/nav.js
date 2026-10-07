export function safeNext(next) {
  if (typeof next !== 'string' || !next.startsWith('/')) return '/'
  if (next.startsWith('//') || next.startsWith('/\\')) return '/'
  if (/^\/(login|signup)(\/|\?|$)/.test(next)) return '/'
  return next
}
