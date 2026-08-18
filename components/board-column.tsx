'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, ProjectStatus } from '@/lib/types'
import { BoardCard } from './board-card'

export interface BoardItem {
  project: Project
  spent: number
  stale: boolean
}

export function BoardColumn({
  column,
  items,
  editable = false,
}: {
  column: { id: ProjectStatus; label: string }
  items: BoardItem[]
  editable?: boolean
}) {
  const router = useRouter()
  const [over, setOver] = useState(false)

  async function drop(event: React.DragEvent) {
    event.preventDefault()
    setOver(false)
    if (!editable) return

    const slug = event.dataTransfer.getData('text/plain')
    if (!slug || items.some((i) => i.project.slug === slug)) return

    const response = await fetch('/api/board', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug, status: column.id }),
    })

    if (response.ok) router.refresh()
  }

  return (
    <section
      className="flex w-[20rem] shrink-0 flex-col rounded-[var(--radius)] bg-raised/60 p-3"
      onDragOver={(event) => {
        if (!editable) return
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
        setOver(true)
      }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
    >
      <header className="flex items-center justify-between gap-3 px-1 pb-3">
        <h2 className="text-sm font-medium text-ink">{column.label}</h2>
        <span className="num chip">{items.length}</span>
      </header>

      <div
        className={`flex flex-1 flex-col gap-3 rounded-[var(--radius-sm)] transition-colors duration-200 ${
          over ? 'bg-accent-soft outline-2 outline-dashed outline-accent/50' : ''
        }`}
      >
        {items.length === 0 ? (
          // Порожня колонка не зникає — інакше дошка стрибає при кожному переносі.
          <p className="rounded-[var(--radius-sm)] border border-dashed border-line px-4 py-8 text-center text-xs text-faint">
            Порожньо
          </p>
        ) : (
          items.map((item) => (
            <BoardCard
              key={item.project.slug}
              project={item.project}
              spent={item.spent}
              stale={item.stale}
              editable={editable}
            />
          ))
        )}
      </div>
    </section>
  )
}
