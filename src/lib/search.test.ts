import { describe, expect, it } from 'vitest'
import { matchesSearch, normalizeSearch } from './search.ts'

describe('normalizeSearch', () => {
  it('quita acentos y pasa a minúsculas', () => {
    expect(normalizeSearch('Atún al natural')).toBe('atun al natural')
  })
})

describe('matchesSearch', () => {
  it('encuentra por substring sin acentos', () => {
    expect(matchesSearch('Atún al natural · 130 kcal', 'atun')).toBe(true)
  })

  it('requiere todas las palabras del query', () => {
    expect(matchesSearch('Ensalada de lechuga y tomate', 'ens tom')).toBe(true)
    expect(matchesSearch('Huevo', 'atun')).toBe(false)
  })
})
