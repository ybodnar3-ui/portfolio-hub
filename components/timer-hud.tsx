'use client'

import Link from 'next/link'
import { formatDuration, minutesBetween } from '@/lib/time'
import { useTimer } from './timer-provider'

/** Запущений таймер видно в шапці на всіх сторінках. Забути про нього важко. */
export function TimerHud() {
  const { data, now } = useTimer()
  const running = data?.running

  if (!running) return null

  const elapsed = minutesBetween(running.startedAt, new Date(now).toISOString())

  return (
    <Link
      href={`/work/${running.projectSlug}`}
      className="inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent-soft px-3 py-1.5 text-xs font-medium text-accent transition-colors duration-200 hover:border-accent/60"
    >
      <span aria-hidden className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
      <span className="max-w-[10rem] truncate">{running.projectSlug}</span>
      <span className="num">{formatDuration(elapsed)}</span>
    </Link>
  )
}
