'use client'

import Link from 'next/link'
import { formatDuration, minutesBetween } from '@/lib/time'
import { useTimer } from './timer-provider'

/** Запущений таймер видно в шапці на всіх трьох режимах. Забути про нього важко. */
export function TimerHud() {
  const { data, now } = useTimer()
  const running = data?.running

  if (!running) return null

  const elapsed = minutesBetween(running.startedAt, new Date(now).toISOString())

  return (
    <Link
      href={`/work/${running.projectSlug}`}
      data-cursor="hover"
      className="inline-flex items-center gap-2.5 border border-accent/40 px-3 py-1.5 text-xs text-accent transition-colors duration-300 hover:border-accent"
    >
      <span aria-hidden className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
      <span className="max-w-[10rem] truncate">{running.projectSlug}</span>
      <span className="num tabular-nums">{formatDuration(elapsed)}</span>
    </Link>
  )
}
