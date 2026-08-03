'use client'

import Link from 'next/link'
import type { Project } from '@/lib/types'
import { formatDuration } from '@/lib/time'
import { TimerButton } from './timer-button'

export function BoardCard({
  project,
  spent,
  stale,
  editable = false,
}: {
  project: Project
  spent: number
  stale: boolean
  editable?: boolean
}) {
  return (
    <Link
      href={`/work/${project.slug}`}
      data-cursor="hover"
      draggable={editable}
      onDragStart={(event) => {
        if (!editable) return
        // Якір за замовчуванням тягне свій href — підміняємо на слаг.
        event.dataTransfer.setData('text/plain', project.slug)
        event.dataTransfer.effectAllowed = 'move'
      }}
      className={`group block border border-line bg-surface p-4 transition-colors duration-300 hover:border-line-strong hover:bg-raised ${
        editable ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-serif text-xl leading-tight text-ink transition-colors duration-300 group-hover:text-accent">
          {project.title}
        </h3>
        <span className="num shrink-0 pt-1 text-[0.6875rem] tracking-[0.1em] text-faint">
          {project.lastTouched}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <TimerButton
          projectSlug={project.slug}
          projectTitle={project.title}
          editable={editable}
        />
        {spent > 0 && (
          <span className="num text-xs tracking-[0.08em] text-muted">{formatDuration(spent)}</span>
        )}
      </div>

      {project.nextStep && (
        <p className="mt-3 border-l border-line pl-3 text-[0.8125rem] leading-snug text-muted">
          {project.nextStep}
        </p>
      )}

      {/* Прапорці ортогональні колонці: зламатись може і готовий проєкт.
          Колір дублюється значком і текстом — інформація не має залежати
          від того, чи розрізняє людина відтінки. */}
      {(project.health === 'broken' || stale || project.blocker) && (
        <ul className="mt-3 space-y-1.5">
          {project.health === 'broken' && (
            <Flag tone="broken" mark="✕">Сайт не відповідає</Flag>
          )}
          {stale && <Flag tone="stale" mark="◷">Понад 60 днів без роботи</Flag>}
          {project.blocker && <Flag tone="stale" mark="▲">{project.blocker}</Flag>}
        </ul>
      )}
    </Link>
  )
}

function Flag({
  tone,
  mark,
  children,
}: {
  tone: 'broken' | 'stale'
  mark: string
  children: React.ReactNode
}) {
  const color = tone === 'broken' ? 'text-broken' : 'text-stale'
  return (
    <li className={`flex items-start gap-2 text-[0.75rem] leading-snug ${color}`}>
      <span aria-hidden className="pt-px">
        {mark}
      </span>
      <span>{children}</span>
    </li>
  )
}
