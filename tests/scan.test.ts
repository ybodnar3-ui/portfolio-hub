import { describe, it, expect } from 'vitest'
import { mergeProjects } from '@/lib/merge.mjs'
import type { Project } from '@/lib/types'

const existing: Project = {
  slug: 'aquastar', repo: 'aquastar', title: 'Аквастар',
  tagline: 'Лендінг доставки води',
  story: 'Написано людиною', kind: 'web', origin: 'client', stack: ['Next.js'],
  liveUrl: null, localPath: '~/Claude/aquastar', tags: ['landing'],
  status: 'finishing', featureSlugs: [], nextStep: 'Дожати форму',
  blocker: '', lastTouched: '2026-06-30', health: 'unknown',
}

describe('mergeProjects', () => {
  it('оновлює автополя', () => {
    const result = mergeProjects([existing], [
      { slug: 'aquastar', lastTouched: '2026-07-31' },
    ])
    expect(result[0].lastTouched).toBe('2026-07-31')
  })

  it('не затирає рукописні поля', () => {
    const result = mergeProjects([existing], [
      { slug: 'aquastar', title: 'aquastar', story: '', status: 'idea', nextStep: '' },
    ])
    expect(result[0].title).toBe('Аквастар')
    expect(result[0].story).toBe('Написано людиною')
    expect(result[0].status).toBe('finishing')
    expect(result[0].nextStep).toBe('Дожати форму')
  })

  it('додає нові проєкти з дефолтами', () => {
    const result = mergeProjects([existing], [
      { slug: 'new-thing', title: 'new-thing', lastTouched: '2026-07-31' },
    ])
    const added = result.find((p) => p.slug === 'new-thing')!
    expect(added.status).toBe('idea')
    expect(added.kind).toBe('web')
    expect(added.health).toBe('unknown')
    expect(added.tagline).toBe('')
  })

  it('не видаляє проєкти, яких більше немає на диску', () => {
    const result = mergeProjects([existing], [])
    expect(result).toHaveLength(1)
  })

  it('впізнає проєкт за repo, навіть якщо слаг знеособлений', () => {
    const renamed: Project = { ...existing, slug: 'water-delivery', repo: 'aquastar' }
    const result = mergeProjects([renamed], [
      { slug: 'aquastar', repo: 'aquastar', lastTouched: '2026-08-01' },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('water-delivery')
    expect(result[0].lastTouched).toBe('2026-08-01')
  })

  it('нова картка запамʼятовує, з якої папки прийшла', () => {
    const result = mergeProjects([], [{ slug: 'some-repo', repo: 'some-repo' }])
    expect(result[0].repo).toBe('some-repo')
    expect(result[0].origin).toBe('practice')
  })

  it('не вигадує домен за назвою проєкту у Vercel', () => {
    // `<projectName>.vercel.app` глобально унікальний і буває чужим —
    // саме так у портфоліо потрапив чужий сайт.
    const result = mergeProjects([], [
      { slug: 'restaurant-pwa', repo: 'restaurant-pwa', vercelProject: 'restaurant-pwa' },
    ])
    expect(result[0].liveUrl).toBeNull()
    expect(result[0].nextStep).toContain('restaurant-pwa')
  })
})
