import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useProjectFilter } from './useProjectFilter'
import type { Project } from '../types'

function makeProject(overrides: Partial<Project>): Project {
  return {
    id: 1,
    name: '',
    description: '',
    category: 'KNITTING',
    tags: '',
    coverImages: [],
    notes: '',
    recipeText: '',
    pinterestBoardUrls: [],
    craftDetails: '',
    materials: [],
    files: [],
    patternGrids: [],
    isPublic: false,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

const projects: Project[] = [
  makeProject({ id: 1, name: 'My Scarf', category: 'KNITTING' }),
  makeProject({ id: 2, name: 'Hat', description: 'blue hat', category: 'KNITTING' }),
  makeProject({ id: 3, name: 'Blanket', category: 'CROCHET' }),
  makeProject({ id: 4, name: 'Dress', category: 'SEWING', tags: 'summer linen' }),
]

describe('useProjectFilter', () => {
  it('returns all projects and correct counts by default', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    expect(result.current.filtered).toHaveLength(4)
    expect(result.current.counts.ALL).toBe(4)
    expect(result.current.counts.KNITTING).toBe(2)
    expect(result.current.counts.CROCHET).toBe(1)
    expect(result.current.counts.SEWING).toBe(1)
  })

  it('filters by category', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    act(() => result.current.setFilter('KNITTING'))

    expect(result.current.filtered).toHaveLength(2)
    expect(result.current.filtered.every(p => p.category === 'KNITTING')).toBe(true)
  })

  it('restores all projects when filter is reset to ALL', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    act(() => result.current.setFilter('CROCHET'))
    act(() => result.current.setFilter('ALL'))

    expect(result.current.filtered).toHaveLength(4)
  })

  it('filters by search term matching name', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    act(() => result.current.setSearch('scarf'))

    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0].name).toBe('My Scarf')
  })

  it('filters by search term matching description', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    act(() => result.current.setSearch('blue'))

    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0].id).toBe(2)
  })

  it('filters by search term matching tags', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    act(() => result.current.setSearch('linen'))

    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0].id).toBe(4)
  })

  it('search is case-insensitive', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    act(() => result.current.setSearch('BLANKET'))

    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0].id).toBe(3)
  })

  it('combines category and search filters', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    act(() => {
      result.current.setFilter('KNITTING')
      result.current.setSearch('hat')
    })

    expect(result.current.filtered).toHaveLength(1)
    expect(result.current.filtered[0].id).toBe(2)
  })

  it('returns empty array when nothing matches', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    act(() => result.current.setSearch('xyz-not-found'))

    expect(result.current.filtered).toHaveLength(0)
  })

  it('returns /projects/new for the ALL filter', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    expect(result.current.newProjectPath).toBe('/projects/new')
  })

  it('returns a category-scoped path when a category filter is active', () => {
    const { result } = renderHook(() => useProjectFilter(projects))

    act(() => result.current.setFilter('CROCHET'))

    expect(result.current.newProjectPath).toBe('/projects/new?category=CROCHET')
  })
})
