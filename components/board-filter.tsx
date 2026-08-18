'use client'

import { useMemo, useState } from 'react'
import { BOARD_COLUMNS, isStale } from '@/lib/status'
import { KIND_LABEL } from '@/lib/labels'
import { BoardColumn, type BoardItem } from './board-column'
import type { Project, ProjectKind, ProjectStatus } from '@/lib/types'

type Flag = 'all' | 'attention'

/**
 * Фільтрація живе на клієнті: 36 карток тримаються в памʼяті без проблем,
 * а перемальовування без запиту на сервер дає миттєвий відгук.
 */
export function BoardFilter({
  items,
  editable,
}: {
  items: BoardItem[]
  editable: boolean
}) {
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<ProjectKind | 'all'>('all')
  const [flag, setFlag] = useState<Flag>('all')
  const now = useMemo(() => new Date(), [])

  const kinds = useMemo(
    () => [...new Set(items.map((i) => i.project.kind))],
    [items],
  )

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter(({ project }) => {
      if (kind !== 'all' && project.kind !== kind) return false
      if (flag === 'attention') {
        const needs = project.health === 'broken' || !!project.blocker || isStale(project, now)
        if (!needs) return false
      }
      if (!q) return true
      return (
        project.title.toLowerCase().includes(q) ||
        project.tagline.toLowerCase().includes(q) ||
        project.nextStep.toLowerCase().includes(q) ||
        project.tags.some((t) => t.toLowerCase().includes(q)) ||
        project.stack.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [items, query, kind, flag, now])

  const grouped = useMemo(() => {
    const map = Object.fromEntries(BOARD_COLUMNS.map((c) => [c.id, [] as BoardItem[]])) as Record<
      ProjectStatus,
      BoardItem[]
    >
    for (const item of shown) map[item.project.status].push(item)
    return map
  }, [shown])

  const filtered = query.trim() !== '' || kind !== 'all' || flag !== 'all'

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Пошук за назвою, тегом, стеком…"
          aria-label="Пошук проєкту"
          className="w-full max-w-xs rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 py-2 text-sm outline-none transition-colors placeholder:text-faint focus:border-accent"
        />

        <Pill active={kind === 'all'} onClick={() => setKind('all')}>Усі типи</Pill>
        {kinds.map((k) => (
          <Pill key={k} active={kind === k} onClick={() => setKind(k)}>
            {KIND_LABEL[k]}
          </Pill>
        ))}

        <span className="mx-1 h-5 w-px bg-[--color-line]" aria-hidden />

        <Pill active={flag === 'attention'} onClick={() => setFlag(flag === 'attention' ? 'all' : 'attention')}>
          Потребують уваги
        </Pill>

        {filtered && (
          <>
            <span className="num ml-1 text-xs text-faint">
              {shown.length} із {items.length}
            </span>
            <button
              type="button"
              onClick={() => { setQuery(''); setKind('all'); setFlag('all') }}
              className="btn btn-sm btn-quiet"
            >
              Скинути
            </button>
          </>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="mt-10 text-sm text-muted">Нічого не знайшлось.</p>
      ) : (
        <div className="mt-6 flex gap-5 overflow-x-auto pb-6">
          {BOARD_COLUMNS.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              items={grouped[column.id]}
              editable={editable}
            />
          ))}
        </div>
      )}
    </>
  )
}

function Pill({
  active, onClick, children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-quiet'}`}>
      {children}
    </button>
  )
}

export type { Project }
