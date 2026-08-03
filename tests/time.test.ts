import { describe, it, expect } from 'vitest'
import {
  LONG_SESSION_MINUTES, minutesBetween, formatDuration, totalMinutes,
  isLongSession, startTimer, stopTimer, newEntryId,
} from '@/lib/time'
import type { TimeData, TimeEntry } from '@/lib/types'

const entry = (over: Partial<TimeEntry> = {}): TimeEntry => ({
  id: 'e_0001', projectSlug: 'a',
  startedAt: '2026-07-30T09:00:00.000Z', endedAt: '2026-07-30T10:00:00.000Z',
  minutes: 60, note: '', source: 'timer', ...over,
})

describe('minutesBetween', () => {
  it('рахує хвилини між ISO-мітками', () => {
    expect(minutesBetween('2026-07-30T09:15:00.000Z', '2026-07-30T11:40:00.000Z')).toBe(145)
  })

  it('округлює до цілої хвилини', () => {
    expect(minutesBetween('2026-07-30T09:00:00.000Z', '2026-07-30T09:00:40.000Z')).toBe(1)
  })

  it('ніколи не повертає відʼємне', () => {
    expect(minutesBetween('2026-07-30T11:00:00.000Z', '2026-07-30T09:00:00.000Z')).toBe(0)
  })
})

describe('formatDuration', () => {
  it('форматує години й хвилини', () => {
    expect(formatDuration(860)).toBe('14 год 20 хв')
  })

  it('пропускає години, коли їх немає', () => {
    expect(formatDuration(45)).toBe('45 хв')
  })

  it('пропускає хвилини, коли рівно години', () => {
    expect(formatDuration(120)).toBe('2 год')
  })

  it('нуль показує явно', () => {
    expect(formatDuration(0)).toBe('0 хв')
  })
})

describe('totalMinutes', () => {
  it('сумує тільки сесії потрібного проєкту', () => {
    const entries = [entry(), entry({ id: 'e_0002', projectSlug: 'b', minutes: 30 })]
    expect(totalMinutes(entries, 'a')).toBe(60)
  })

  it('порожній список дає нуль', () => {
    expect(totalMinutes([], 'a')).toBe(0)
  })
})

describe('isLongSession', () => {
  it('шість годин ще не довга', () => {
    expect(isLongSession(LONG_SESSION_MINUTES)).toBe(false)
  })

  it('понад шість годин — довга', () => {
    expect(isLongSession(LONG_SESSION_MINUTES + 1)).toBe(true)
  })
})

describe('newEntryId', () => {
  it('нумерує послідовно', () => {
    expect(newEntryId([entry({ id: 'e_0007' })])).toBe('e_0008')
  })

  it('на порожньому списку починає з першого', () => {
    expect(newEntryId([])).toBe('e_0001')
  })
})

describe('startTimer', () => {
  it('запускає таймер на порожньому стані', () => {
    const result = startTimer({ running: null, entries: [] }, 'a', '2026-07-31T10:00:00.000Z')
    expect(result.running).toEqual({ projectSlug: 'a', startedAt: '2026-07-31T10:00:00.000Z' })
  })

  it('зупиняє попередній таймер і записує його сесію', () => {
    const before: TimeData = {
      running: { projectSlug: 'a', startedAt: '2026-07-31T09:00:00.000Z' },
      entries: [],
    }
    const after = startTimer(before, 'b', '2026-07-31T10:00:00.000Z')
    expect(after.running?.projectSlug).toBe('b')
    expect(after.entries).toHaveLength(1)
    expect(after.entries[0].projectSlug).toBe('a')
    expect(after.entries[0].minutes).toBe(60)
  })

  it('не мутує вхідні дані', () => {
    const before: TimeData = { running: null, entries: [] }
    startTimer(before, 'a', '2026-07-31T10:00:00.000Z')
    expect(before.running).toBeNull()
  })
})

describe('stopTimer', () => {
  it('записує сесію й обнуляє running', () => {
    const before: TimeData = {
      running: { projectSlug: 'a', startedAt: '2026-07-31T09:00:00.000Z' },
      entries: [],
    }
    const after = stopTimer(before, '2026-07-31T11:30:00.000Z')
    expect(after.running).toBeNull()
    expect(after.entries[0].minutes).toBe(150)
    expect(after.entries[0].source).toBe('timer')
  })

  it('поважає ручне виправлення тривалості', () => {
    const before: TimeData = {
      running: { projectSlug: 'a', startedAt: '2026-07-30T09:00:00.000Z' },
      entries: [],
    }
    const after = stopTimer(before, '2026-07-31T09:00:00.000Z', 90)
    expect(after.entries[0].minutes).toBe(90)
    expect(after.entries[0].source).toBe('manual')
  })

  it('без запущеного таймера нічого не змінює', () => {
    const before: TimeData = { running: null, entries: [] }
    expect(stopTimer(before, '2026-07-31T11:00:00.000Z')).toEqual(before)
  })
})
