import type { TimeData, TimeEntry } from './types'

export const LONG_SESSION_MINUTES = 360 // 6 годин

export function minutesBetween(startIso: string, endIso: string): number {
  const diff = new Date(endIso).getTime() - new Date(startIso).getTime()
  if (diff <= 0) return 0
  return Math.round(diff / 60_000)
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0 хв'
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  if (hours === 0) return `${rest} хв`
  if (rest === 0) return `${hours} год`
  return `${hours} год ${rest} хв`
}

export function totalMinutes(entries: TimeEntry[], projectSlug: string): number {
  return entries
    .filter((e) => e.projectSlug === projectSlug)
    .reduce((sum, e) => sum + e.minutes, 0)
}

export function isLongSession(minutes: number): boolean {
  return minutes > LONG_SESSION_MINUTES
}

export function newEntryId(entries: TimeEntry[]): string {
  const max = entries.reduce((acc, e) => {
    const n = Number(e.id.replace('e_', ''))
    return Number.isFinite(n) && n > acc ? n : acc
  }, 0)
  return `e_${String(max + 1).padStart(4, '0')}`
}

export function stopTimer(
  data: TimeData,
  nowIso: string,
  overrideMinutes?: number,
): TimeData {
  if (!data.running) return data
  const measured = minutesBetween(data.running.startedAt, nowIso)
  const entry: TimeEntry = {
    id: newEntryId(data.entries),
    projectSlug: data.running.projectSlug,
    startedAt: data.running.startedAt,
    endedAt: nowIso,
    minutes: overrideMinutes ?? measured,
    note: '',
    source: overrideMinutes === undefined ? 'timer' : 'manual',
  }
  return { running: null, entries: [...data.entries, entry] }
}

export function startTimer(
  data: TimeData,
  projectSlug: string,
  nowIso: string,
): TimeData {
  const stopped = stopTimer(data, nowIso)
  return { running: { projectSlug, startedAt: nowIso }, entries: stopped.entries }
}

/**
 * Сесія заднім числом. Точного часу доби ми не знаємо й не вигадуємо:
 * ставимо межі від 09:00 обраного дня, щоб `startedAt`/`endedAt` лишались
 * валідними ISO-мітками і розбивка по днях не поламалась.
 */
export function addManualEntry(
  data: TimeData,
  input: { projectSlug: string; minutes: number; note: string; date: string },
): TimeData {
  const minutes = Math.round(input.minutes)
  if (!Number.isFinite(minutes) || minutes <= 0) return data

  const startedAt = new Date(`${input.date}T09:00:00.000Z`)
  if (Number.isNaN(startedAt.getTime())) return data
  const endedAt = new Date(startedAt.getTime() + minutes * 60_000)

  const entry: TimeEntry = {
    id: newEntryId(data.entries),
    projectSlug: input.projectSlug,
    startedAt: startedAt.toISOString(),
    endedAt: endedAt.toISOString(),
    minutes,
    note: input.note.trim(),
    source: 'manual',
  }
  return { ...data, entries: [...data.entries, entry] }
}

export function updateEntry(
  data: TimeData,
  id: string,
  patch: { minutes?: number; note?: string },
): TimeData {
  const index = data.entries.findIndex((e) => e.id === id)
  if (index === -1) return data

  const current = data.entries[index]
  const minutes = patch.minutes === undefined ? current.minutes : Math.round(patch.minutes)
  if (!Number.isFinite(minutes) || minutes <= 0) return data

  const entries = [...data.entries]
  entries[index] = {
    ...current,
    minutes,
    note: patch.note === undefined ? current.note : patch.note.trim(),
    // Виправлена цифра більше не «з таймера» — інакше з розбивки не видно,
    // що її чіпали руками.
    source: 'manual',
  }
  return { ...data, entries }
}

export function removeEntry(data: TimeData, id: string): TimeData {
  return { ...data, entries: data.entries.filter((e) => e.id !== id) }
}
