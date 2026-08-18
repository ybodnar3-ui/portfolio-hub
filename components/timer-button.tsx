'use client'

import { useState } from 'react'
import { formatDuration, minutesBetween } from '@/lib/time'
import { useTimer } from './timer-provider'

export function TimerButton({
  projectSlug,
  projectTitle,
  editable,
}: {
  projectSlug: string
  projectTitle: string
  editable: boolean
}) {
  const { data, now, start, requestStop } = useTimer()
  const [busy, setBusy] = useState(false)

  // На проді запис закритий — кнопки просто немає.
  if (!editable) return null

  const running = data?.running ?? null
  const mine = running?.projectSlug === projectSlug
  const elapsed = mine ? minutesBetween(running.startedAt, new Date(now).toISOString()) : 0

  async function click(event: React.MouseEvent) {
    // Картка — ручка для перетягування. Клік по кнопці не має починати драг.
    event.preventDefault()
    event.stopPropagation()
    if (busy) return

    setBusy(true)
    try {
      if (mine) await requestStop(projectTitle)
      else await start(projectSlug)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={click}
      onMouseDown={(e) => e.stopPropagation()}
      onDragStart={(e) => { e.preventDefault(); e.stopPropagation() }}
      draggable={false}
      disabled={busy}
      title={running && !mine ? `Зупинить таймер по ${running.projectSlug}` : undefined}
      aria-label={mine ? `Зупинити таймер по ${projectTitle}` : `Почати таймер по ${projectTitle}`}
      className={`btn btn-sm ${mine ? 'btn-running' : 'btn-soft'}`}
    >
      <span aria-hidden>{mine ? '◼' : '▶'}</span>
      {mine ? <span className="num">{formatDuration(elapsed)}</span> : 'Старт'}
    </button>
  )
}
