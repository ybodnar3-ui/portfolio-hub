'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BOARD_COLUMNS } from '@/lib/status'
import { KIND_LABEL, ORIGIN_LABEL } from '@/lib/labels'
import type { Project, ProjectKind, ProjectOrigin, ProjectStatus } from '@/lib/types'

const KINDS = Object.keys(KIND_LABEL) as ProjectKind[]
const ORIGINS = Object.keys(ORIGIN_LABEL) as ProjectOrigin[]

const list = (value: string) =>
  value.split(',').map((s) => s.trim()).filter(Boolean)

export function ProjectEditor({ project }: { project: Project }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: project.title,
    tagline: project.tagline,
    story: project.story,
    kind: project.kind,
    origin: project.origin,
    status: project.status,
    liveUrl: project.liveUrl ?? '',
    nextStep: project.nextStep,
    blocker: project.blocker,
    stack: project.stack.join(', '),
    tags: project.tags.join(', '),
  })

  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')

    try {
      const response = await fetch(`/api/projects/${project.slug}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          edits: {
            ...form,
            liveUrl: form.liveUrl.trim() || null,
            stack: list(form.stack),
            tags: list(form.tags),
          },
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? `Сервер відповів ${response.status}`)
        return
      }
      setOpen(false)
      router.refresh()
    } catch {
      setError('Не вдалось достукатись до сервера')
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-default">
        Редагувати
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-ink/25 p-6 backdrop-blur-sm">
      <form onSubmit={save} className="card mx-auto w-full max-w-2xl p-6 shadow-[var(--shadow-md)]">
        <h2 className="text-lg">Редагувати проєкт</h2>

        <div className="mt-5 space-y-4">
          <Field label="Назва">
            <input value={form.title} onChange={(e) => set({ title: e.target.value })} className={input} />
          </Field>

          <Field label="Підзаголовок" hint="один рядок, видно на картці">
            <input value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} className={input} />
          </Field>

          <Field label="Опис">
            <textarea value={form.story} onChange={(e) => set({ story: e.target.value })} rows={5} className={input} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Тип">
              <select value={form.kind} onChange={(e) => set({ kind: e.target.value as ProjectKind })} className={input}>
                {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
              </select>
            </Field>
            <Field label="Звідки">
              <select value={form.origin} onChange={(e) => set({ origin: e.target.value as ProjectOrigin })} className={input}>
                {ORIGINS.map((o) => <option key={o} value={o}>{ORIGIN_LABEL[o]}</option>)}
              </select>
            </Field>
            <Field label="Колонка">
              <select value={form.status} onChange={(e) => set({ status: e.target.value as ProjectStatus })} className={input}>
                {BOARD_COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Посилання на живий сайт" hint="порожньо — значить немає">
            <input value={form.liveUrl} onChange={(e) => set({ liveUrl: e.target.value })} placeholder="https://…" className={input} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Стек" hint="через кому">
              <input value={form.stack} onChange={(e) => set({ stack: e.target.value })} className={input} />
            </Field>
            <Field label="Теги" hint="через кому">
              <input value={form.tags} onChange={(e) => set({ tags: e.target.value })} className={input} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Наступний крок" hint="видно на дошці">
              <input value={form.nextStep} onChange={(e) => set({ nextStep: e.target.value })} className={input} />
            </Field>
            <Field label="Блокер" hint="жовтий прапорець на картці">
              <input value={form.blocker} onChange={(e) => set({ blocker: e.target.value })} className={input} />
            </Field>
          </div>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-broken">{error}</p>}

        <div className="mt-6 flex gap-2">
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy ? 'Зберігаю…' : 'Зберегти'}
          </button>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-default">
            Скасувати
          </button>
        </div>
      </form>
    </div>
  )
}

const input =
  'mt-1.5 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 py-2.5 text-[0.9375rem] outline-none transition-colors focus:border-accent'

function Field({
  label, hint, children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="eyebrow">
        {label}
        {hint && <span className="ml-2 text-faint">{hint}</span>}
      </span>
      {children}
    </label>
  )
}
