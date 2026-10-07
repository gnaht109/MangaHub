export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .trim()
}

export function filterManga(list, query) {
  const q = normalizeText(query)
  if (!q) return list
  return list.filter((m) => normalizeText(m.title).includes(q) || normalizeText(m.author).includes(q))
}
