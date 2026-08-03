'use client'

import { useEffect, useRef, useState } from 'react'
import { formatDuration } from '@/lib/time'

const WHEN = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
})

export function LongSessionDialog({
  projectTitle,
  startedAt,
  measuredMinutes,
  onWrite,
  onCancel,
}: {
  projectTitle: string
  startedAt: string
  measuredMinutes: number
  onWrite: (minutes: number) => void
  onCancel: () => void
}) {
  const [value, setValue] = useState(String(measuredMinutes))
  const [busy, setBusy] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.focus()
    input.current?.select()
  }, [])

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const minutes = Number(value)
  const valid = Number.isFinite(minutes) && minutes > 0

  function write() {
    if (!valid || busy) return
    setBusy(true)
    onWrite(Math.round(minutes))
  }

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-bg/80 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="long-session-title"
    >
      <div className="w-full max-w-md border border-line-strong bg-surface p-8">
        <p className="eyebrow">Довга сесія</p>
        <h2 id="long-session-title" className="mt-4 font-serif text-3xl leading-tight text-ink">
          Таймер по «{projectTitle}» іде з {WHEN.format(new Date(startedAt))}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Це {formatDuration(measuredMinutes)}. Скільки з цього справді робота?
        </p>

        <label className="mt-8 block">
          <span className="eyebrow">Хвилин</span>
          <input
            ref={input}
            type="number"
            min={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && write()}
            className="num mt-2 w-full border-b border-line-strong bg-transparent pb-3 text-2xl text-ink outline-none transition-colors duration-300 focus:border-accent"
          />
        </label>

        {valid && minutes !== measuredMinutes && (
          <p className="num mt-2 text-xs text-faint">= {formatDuration(Math.round(minutes))}</p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={write}
            disabled={!valid || busy}
            data-cursor="hover"
            className="border border-accent px-6 py-3 text-sm tracking-[0.06em] text-accent transition-opacity duration-300 hover:opacity-80 disabled:opacity-40"
          >
            {busy ? 'Записую…' : 'Записати'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            data-cursor="hover"
            className="border border-line px-6 py-3 text-sm tracking-[0.06em] text-muted transition-colors duration-300 hover:text-ink"
          >
            Скасувати
          </button>
        </div>

        {/* Закрити, не підтвердивши, означає скасувати запис — таймер лишається йти. */}
        <p className="mt-5 text-xs leading-relaxed text-faint">
          «Скасувати» нічого не записує: таймер продовжує йти.
        </p>
      </div>
    </div>
  )
}
