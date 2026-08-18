import { describe, it, expect } from 'vitest'
import { slugify, uniqueSlug, blankProject, addNote, removeNote, applyEdits } from '@/lib/projects'
import type { Project } from '@/lib/types'

const base: Project = {
  slug: 'x', repo: null, title: 'X', tagline: '', story: '', kind: 'web', origin: 'client',
  stack: [], liveUrl: null, localPath: '', tags: [], status: 'idea', featureSlugs: [],
  nextStep: '', blocker: '', lastTouched: '2026-01-01', health: 'unknown', notes: [],
}

describe('slugify', () => {
  it('транслітерує кирилицю', () => {
    expect(slugify('Аква Стар')).toBe('akva-star')
  })

  it('прибирає зайве й не лишає дефісів по краях', () => {
    expect(slugify('  Відео-меню!! для  ресторанів  ')).toBe('video-menyu-dlya-restoraniv')
  })

  it('на порожньому дає запасне імʼя, а не порожній рядок', () => {
    expect(slugify('!!!')).toBe('project')
  })
})

describe('uniqueSlug', () => {
  it('не чіпає вільний слаг', () => {
    expect(uniqueSlug('novyi', ['inshyi'])).toBe('novyi')
  })

  it('нарощує номер, поки не звільниться', () => {
    expect(uniqueSlug('novyi', ['novyi', 'novyi-2'])).toBe('novyi-3')
  })
})

describe('blankProject', () => {
  it('нова картка порожня, але валідна', () => {
    const p = blankProject({ slug: 'test', title: 'Тест', kind: 'tool', status: 'idea' }, '2026-08-03')
    expect(p.slug).toBe('test')
    expect(p.repo).toBeNull()
    expect(p.notes).toEqual([])
    expect(p.health).toBe('unknown')
    expect(p.lastTouched).toBe('2026-08-03')
  })
})

describe('applyEdits', () => {
  it('міняє тільки передані поля', () => {
    const result = applyEdits(base, { tagline: 'Новий підпис' })
    expect(result.tagline).toBe('Новий підпис')
    expect(result.title).toBe('X')
  })

  it('не дає переписати автополя й слаг', () => {
    const result = applyEdits(base, {
      slug: 'hacked', lastTouched: '2030-01-01', health: 'ok', notes: [{ id: 'n', at: '', text: '' }],
    } as never)
    expect(result.slug).toBe('x')
    expect(result.lastTouched).toBe('2026-01-01')
    expect(result.health).toBe('unknown')
    expect(result.notes).toEqual([])
  })

  it('порожній рядок — це очищення поля, а не «не міняти»', () => {
    const result = applyEdits({ ...base, nextStep: 'щось' }, { nextStep: '' })
    expect(result.nextStep).toBe('')
  })
})

describe('addNote', () => {
  it('додає нотатку зверху', () => {
    const once = addNote(base, 'перша', '2026-08-01T10:00:00.000Z')
    const twice = addNote(once, 'друга', '2026-08-02T10:00:00.000Z')
    expect(twice.notes.map((n) => n.text)).toEqual(['друга', 'перша'])
  })

  it('обрізає пробіли й ігнорує порожнє', () => {
    expect(addNote(base, '   ', '2026-08-01T10:00:00.000Z').notes).toHaveLength(0)
    expect(addNote(base, '  текст  ', '2026-08-01T10:00:00.000Z').notes[0].text).toBe('текст')
  })

  it('не мутує вхідний проєкт', () => {
    addNote(base, 'нова', '2026-08-01T10:00:00.000Z')
    expect(base.notes).toHaveLength(0)
  })
})

describe('removeNote', () => {
  it('видаляє за id', () => {
    const withNote = addNote(base, 'зайва', '2026-08-01T10:00:00.000Z')
    const id = withNote.notes[0].id
    expect(removeNote(withNote, id).notes).toHaveLength(0)
  })

  it('невідомий id нічого не ламає', () => {
    const withNote = addNote(base, 'жива', '2026-08-01T10:00:00.000Z')
    expect(removeNote(withNote, 'немає').notes).toHaveLength(1)
  })
})
