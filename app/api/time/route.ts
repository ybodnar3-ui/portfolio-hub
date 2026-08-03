import { NextResponse } from 'next/server'
import { getTimeData } from '@/lib/data'
import { writeTime } from '@/lib/write'
import { startTimer, stopTimer } from '@/lib/time'

type Body =
  | { action: 'start'; projectSlug: string }
  | { action: 'stop'; overrideMinutes?: number }

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
  const next =
    body.action === 'start'
      ? startTimer(data, body.projectSlug, now)
      : stopTimer(data, now, body.overrideMinutes)

  writeTime(next)
  return NextResponse.json(next)
}
