'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BOARD_COLUMNS } from '@/lib/status'
import { KIND_LABEL, ORIGIN_LABEL } from '@/lib/labels'
import type { ProjectKind, ProjectOrigin, ProjectStatus } from '@/lib/types'

const KINDS = Object.keys(KIND_LABEL) as ProjectKind[]
const ORIGINS = Object.keys(ORIGIN_LABEL) as ProjectOrigin[]

export function NewProject({ defaultStatus = 'idea' }: { defaultStatus?: ProjectStatus }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<ProjectKind>('web')
  const [origin, setOrigin] = useState<ProjectOrigin>('client')
  const [status, setStatus] = useState<ProjectStatus>(defaultStatus)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function create(event: React.FormEvent) {
    event.preventDefault()
    if (busy || !title.trim()) return

    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title, kind, origin, status }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? `Сервер відповів ${response.status}`)
        return
      }
      setTitle('')
      setOpen(false)
      router.push(`/work/${data.slug}`)
    } catch {
      setError('Не вдалось достукатись до сервера')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-primary">
        <span aria-hidden>+</span> Проєкт
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/25 p-6 backdrop-blur-sm">
      <form onSubmit={create} className="card w-full max-w-md p-6 shadow-[var(--shadow-md)]">
        <h2 className="text-lg">Новий проєкт</h2>
        <p className="mt-1 text-sm text-muted">
          Решту — опис, теги, посилання — допишеш на сторінці проєкту.
        </p>

        <label className="mt-5 block">
          <span className="eyebrow">Назва</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            placeholder="Наприклад: Бот для запису на манікюр"
            className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 py-2.5 text-[0.9375rem] outline-none transition-colors focus:border-accent"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Select label="Тип" value={kind} onChange={(v) => setKind(v as ProjectKind)}
            options={KINDS.map((k) => [k, KIND_LABEL[k]])} />
          <Select label="Звідки" value={origin} onChange={(v) => setOrigin(v as ProjectOrigin)}
            options={ORIGINS.map((o) => [o, ORIGIN_LABEL[o]])} />
        </div>

        <div className="mt-4">
          <Select label="Колонка" value={status} onChange={(v) => setStatus(v as ProjectStatus)}
            options={BOARD_COLUMNS.map((c) => [c.id, c.label])} />
        </div>

        {error && <p role="alert" className="mt-3 text-sm text-broken">{error}</p>}

        <div className="mt-6 flex gap-2">
          <button type="submit" disabled={busy || !title.trim()} className="btn btn-primary">
            {busy ? 'Створюю…' : 'Створити'}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-default">
            Скасувати
          </button>
        </div>
      </form>
    </div>
  )
}

function Select({
  label, value, onChange, options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: [string, string][]
}) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 py-2.5 text-[0.9375rem] outline-none transition-colors focus:border-accent"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  )
}
