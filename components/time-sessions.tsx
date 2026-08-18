'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDuration } from '@/lib/time'
import type { TimeEntry } from '@/lib/types'

const DAY = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', timeZone: 'UTC' })

const day = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso.slice(0, 10) : `${DAY.format(d)} ${d.getUTCFullYear()}`
}

const today = () => new Date().toISOString().slice(0, 10)

export function TimeSessions({
  projectSlug,
  sessions,
  total,
  editable,
}: {
  projectSlug: string
  sessions: TimeEntry[]
  total: number
  editable: boolean
}) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [hours, setHours] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(today)

  async function send(body: unknown) {
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/time', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        setError(data?.error ?? `Сервер відповів ${response.status}`)
        return false
      }
      router.refresh()
      return true
    } catch {
      setError('Не вдалось достукатись до сервера')
      return false
    } finally {
      setBusy(false)
    }
  }

  async function add(event: React.FormEvent) {
    event.preventDefault()
    // Години зручніше вводити, ніж хвилини: «пішло годин зо три».
    const minutes = Math.round(parseFloat(hours.replace(',', '.')) * 60)
    if (!Number.isFinite(minutes) || minutes <= 0) {
      setError('Скільки годин? Наприклад 2 або 1,5')
      return
    }
    const ok = await send({ action: 'addManual', projectSlug, minutes, note, date })
    if (ok) {
      setHours('')
      setNote('')
      setAdding(false)
    }
  }

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="eyebrow">Витрачено</h2>
        {editable && !adding && (
          <button type="button" onClick={() => setAdding(true)} className="btn btn-sm btn-quiet">
            + Час
          </button>
        )}
      </div>

      <p className="num mt-1 text-2xl font-semibold text-ink">{formatDuration(total)}</p>

      {adding && (
        <form onSubmit={add} className="mt-4 rounded-[var(--radius-sm)] bg-raised p-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="eyebrow">Годин</span>
              <input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                autoFocus
                placeholder="2 або 1,5"
                className={field}
              />
            </label>
            <label className="block">
              <span className="eyebrow">Коли</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={field} />
            </label>
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="За що саме (не обовʼязково)"
            className={`${field} mt-2`}
          />
          {error && <p role="alert" className="mt-2 text-xs text-broken">{error}</p>}
          <div className="mt-3 flex gap-2">
            <button type="submit" disabled={busy} className="btn btn-sm btn-primary">
              {busy ? 'Записую…' : 'Записати'}
            </button>
            <button
              type="button"
              onClick={() => { setAdding(false); setError('') }}
              className="btn btn-sm btn-default"
            >
              Скасувати
            </button>
          </div>
        </form>
      )}

      {sessions.length === 0 ? (
        <p className="mt-3 text-sm text-faint">Сесій ще немає.</p>
      ) : (
        <ul className="mt-4 space-y-2 border-t border-line pt-3">
          {sessions.map((session) =>
            editingId === session.id ? (
              <EditRow
                key={session.id}
                session={session}
                busy={busy}
                onCancel={() => setEditingId(null)}
                onSave={async (minutes, note) => {
                  const ok = await send({ action: 'updateEntry', id: session.id, minutes, note })
                  if (ok) setEditingId(null)
                }}
                onRemove={() => send({ action: 'removeEntry', id: session.id })}
              />
            ) : (
              <li key={session.id} className="group flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 text-muted">
                  {day(session.startedAt)}
                  {session.note && <span className="text-faint"> · {session.note}</span>}
                  {session.source === 'manual' && <span className="text-faint"> · вручну</span>}
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="num text-ink">{formatDuration(session.minutes)}</span>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => setEditingId(session.id)}
                      aria-label="Редагувати сесію"
                      className="btn btn-sm btn-quiet opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      ✎
                    </button>
                  )}
                </span>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  )
}

function EditRow({
  session, busy, onSave, onCancel, onRemove,
}: {
  session: TimeEntry
  busy: boolean
  onSave: (minutes: number, note: string) => void
  onCancel: () => void
  onRemove: () => void
}) {
  const [hours, setHours] = useState(String(Math.round((session.minutes / 60) * 100) / 100))
  const [note, setNote] = useState(session.note)

  return (
    <li className="rounded-[var(--radius-sm)] bg-raised p-3">
      <div className="flex gap-2">
        <input value={hours} onChange={(e) => setHours(e.target.value)} className={`${field} w-24`} />
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="За що" className={field} />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => onSave(Math.round(parseFloat(hours.replace(',', '.')) * 60), note)}
          className="btn btn-sm btn-primary"
        >
          Зберегти
        </button>
        <button type="button" onClick={onCancel} className="btn btn-sm btn-default">Скасувати</button>
        <button type="button" onClick={onRemove} disabled={busy} className="btn btn-sm btn-quiet text-broken">
          Видалити
        </button>
      </div>
    </li>
  )
}

const field =
  'mt-1 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-2.5 py-1.5 text-sm outline-none transition-colors focus:border-accent'
