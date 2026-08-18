import { describe, it, expect } from 'vitest'
import { BOARD_COLUMNS, isStale, visibleOnShowcase, groupByColumn } from '@/lib/status'
import type { Project } from '@/lib/types'

const base: Project = {
  slug: 'x', repo: 'x', title: 'X', tagline: '', story: '', kind: 'web', origin: 'client',
  stack: [], liveUrl: null, localPath: '', tags: [], status: 'in-progress',
  featureSlugs: [], nextStep: '', blocker: '', lastTouched: '2026-01-01',
  health: 'unknown', notes: [],
}

const NOW = new Date('2026-07-31T00:00:00Z')

describe('BOARD_COLUMNS', () => {
  it('має шість колонок у правильному порядку', () => {
    expect(BOARD_COLUMNS.map((c) => c.id)).toEqual([
      'idea', 'in-progress', 'finishing', 'needs-fix', 'done', 'archived',
    ])
  })
})

describe('isStale', () => {
  it('позначає проєкт без дотику понад 60 днів', () => {
    expect(isStale({ ...base, lastTouched: '2026-05-01' }, NOW)).toBe(true)
  })

  it('не позначає свіжий проєкт', () => {
    expect(isStale({ ...base, lastTouched: '2026-07-20' }, NOW)).toBe(false)
  })

  it('рівно 60 днів ще не stale', () => {
    expect(isStale({ ...base, lastTouched: '2026-06-01' }, NOW)).toBe(false)
  })

  it('не позначає готові проєкти', () => {
    expect(isStale({ ...base, status: 'done', lastTouched: '2025-01-01' }, NOW)).toBe(false)
  })

  it('не позначає архівні проєкти', () => {
    expect(isStale({ ...base, status: 'archived', lastTouched: '2025-01-01' }, NOW)).toBe(false)
  })
})

describe('visibleOnShowcase', () => {
  it('прибирає архівні', () => {
    const result = visibleOnShowcase([
      { ...base, slug: 'a', status: 'done' },
      { ...base, slug: 'b', status: 'archived' },
    ])
    expect(result.map((p) => p.slug)).toEqual(['a'])
  })

  it('лишає клієнтську роботу і власні продукти', () => {
    const result = visibleOnShowcase([
      { ...base, slug: 'client', origin: 'client' },
      { ...base, slug: 'product', origin: 'product' },
    ])
    expect(result.map((p) => p.slug).sort()).toEqual(['client', 'product'])
  })

  it('прибирає навчальне й практику — вітрина не про це', () => {
    const result = visibleOnShowcase([
      { ...base, slug: 'real', origin: 'client' },
      { ...base, slug: 'tetr', origin: 'study' },
      { ...base, slug: 'clone', origin: 'practice' },
    ])
    expect(result.map((p) => p.slug)).toEqual(['real'])
  })

  it('сортує від найсвіжішого', () => {
    const result = visibleOnShowcase([
      { ...base, slug: 'old', lastTouched: '2026-01-01' },
      { ...base, slug: 'new', lastTouched: '2026-07-01' },
    ])
    expect(result.map((p) => p.slug)).toEqual(['new', 'old'])
  })
})

describe('groupByColumn', () => {
  it('розкладає по колонках і не губить порожні', () => {
    const grouped = groupByColumn([{ ...base, status: 'done' }])
    expect(grouped.done).toHaveLength(1)
    expect(grouped.idea).toEqual([])
  })
})
