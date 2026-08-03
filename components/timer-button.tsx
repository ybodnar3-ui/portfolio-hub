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
    // Картка — це посилання й ручка для перетягування. Клік по кнопці
    // не має ні переходити на кейс, ні починати драг.
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

  const hint =
    running && !mine ? `Зупинить таймер по ${running.projectSlug}` : undefined

  return (
    <button
      type="button"
      onClick={click}
      onMouseDown={(e) => e.stopPropagation()}
      onDragStart={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      draggable={false}
      title={hint}
      aria-label={mine ? `Зупинити таймер по ${projectTitle}` : `Почати таймер по ${projectTitle}`}
      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-xs tracking-[0.06em] transition-colors duration-300 ${
        mine
          ? 'border-accent text-accent'
          : 'border-line text-muted hover:border-line-strong hover:text-ink'
      } ${busy ? 'opacity-50' : ''}`}
    >
      <span aria-hidden className={mine ? 'text-accent' : ''}>
        {mine ? '■' : '▶'}
      </span>
      {mine ? <span className="num">{formatDuration(elapsed)}</span> : 'Старт'}
    </button>
  )
}
