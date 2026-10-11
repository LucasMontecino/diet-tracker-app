/** Minúsculas sin acentos para búsqueda tolerante (atun → Atún). */
export function normalizeSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

/** Cada palabra del query debe aparecer como substring en el texto del ítem. */
export function matchesSearch(haystack: string, search: string): boolean {
  const q = normalizeSearch(search)
  if (!q) return true
  const normalizedHaystack = normalizeSearch(haystack)
  return q.split(/\s+/).every((token) => normalizedHaystack.includes(token))
}

/** Filtro para cmdk: 1 = visible, 0 = oculto. */
export function commandSearchFilter(value: string, search: string): number {
  return matchesSearch(value, search) ? 1 : 0
}
