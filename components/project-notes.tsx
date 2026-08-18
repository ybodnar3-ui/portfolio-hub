'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ProjectNote } from '@/lib/types'

const WHEN = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
})

export function ProjectNotes({
  slug,
  notes,
  editable,
}: {
  slug: string
  notes: ProjectNote[]
  editable: boolean
}) {
  const router = useRouter()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(body: unknown) {
    setBusy(true)
    try {
      const response = await fetch(`/api/projects/${slug}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (response.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  async function add(event: React.FormEvent) {
    event.preventDefault()
    if (!text.trim() || busy) return
    await send({ action: 'addNote', text })
    setText('')
  }

  return (
    <section>
      <h2 className="text-base">Нотатки</h2>

      {editable && (
        <form onSubmit={add} className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              // Enter з модифікатором — швидкий спосіб не тягнутись до кнопки.
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) add(e)
            }}
            rows={3}
            placeholder="Що варто памʼятати про цей проєкт…"
            className="w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 py-2.5 text-[0.9375rem] outline-none transition-colors placeholder:text-faint focus:border-accent"
          />
          <div className="mt-2 flex items-center gap-3">
            <button type="submit" disabled={busy || !text.trim()} className="btn btn-sm btn-primary">
              {busy ? 'Додаю…' : 'Додати'}
            </button>
            <span className="text-xs text-faint">⌘ + Enter</span>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="mt-4 text-sm text-faint">Поки порожньо.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="card group p-4">
              <div className="flex items-start justify-between gap-4">
                <p className="whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink">
                  {note.text}
                </p>
                {editable && (
                  <button
                    type="button"
                    onClick={() => send({ action: 'removeNote', id: note.id })}
                    disabled={busy}
                    aria-label="Видалити нотатку"
                    className="btn btn-sm btn-quiet shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                  >
                    ✕
                  </button>
                )}
              </div>
              <time dateTime={note.at} className="mt-2 block text-xs text-faint">
                {WHEN.format(new Date(note.at))}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
