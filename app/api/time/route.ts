import { NextResponse } from 'next/server'
import { getTimeData } from '@/lib/data'
import { writeTime } from '@/lib/write'
import { startTimer, stopTimer, addManualEntry, updateEntry, removeEntry } from '@/lib/time'

type Body =
  | { action: 'start'; projectSlug: string }
  | { action: 'stop'; overrideMinutes?: number }
  | { action: 'addManual'; projectSlug: string; minutes: number; note?: string; date: string }
  | { action: 'updateEntry'; id: string; minutes?: number; note?: string }
  | { action: 'removeEntry'; id: string }

export async function GET() {
  return NextResponse.json(getTimeData())
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'read-only' }, { status: 403 })
  }

  const body = (await request.json()) as Body
  const now = new Date().toISOString()
  const data = getTimeData()

  // Уся логіка живе в lib/time.ts і вже протестована.
  // Роут тільки читає, викликає й пише.
  let next = data

  switch (body.action) {
    case 'start':
      next = startTimer(data, body.projectSlug, now)
      break
    case 'stop':
      next = stopTimer(data, now, body.overrideMinutes)
      break
    case 'addManual':
      next = addManualEntry(data, {
        projectSlug: body.projectSlug,
        minutes: Number(body.minutes),
        note: body.note ?? '',
        date: body.date,
      })
      if (next === data) {
        return NextResponse.json({ error: 'Потрібні хвилини більше нуля і дата' }, { status: 400 })
      }
      break
    case 'updateEntry':
      next = updateEntry(data, body.id, {
        minutes: body.minutes === undefined ? undefined : Number(body.minutes),
        note: body.note,
      })
      break
    case 'removeEntry':
      next = removeEntry(data, body.id)
      break
    default:
      return NextResponse.json({ error: 'unknown action' }, { status: 400 })
  }

  writeTime(next)
  return NextResponse.json(next)
}
