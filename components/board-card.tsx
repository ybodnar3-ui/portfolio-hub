'use client'

import Link from 'next/link'
import type { Project } from '@/lib/types'
import { formatDuration } from '@/lib/time'
import { KIND_LABEL } from '@/lib/labels'
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
  const flags = [
    project.health === 'broken' && { tone: 'broken' as const, text: 'Сайт не відповідає' },
    stale && { tone: 'stale' as const, text: 'Понад 60 днів без роботи' },
    project.blocker && { tone: 'stale' as const, text: project.blocker },
  ].filter(Boolean) as { tone: 'broken' | 'stale'; text: string }[]

  return (
    <div
      draggable={editable}
      onDragStart={(event) => {
        if (!editable) return
        event.dataTransfer.setData('text/plain', project.slug)
        event.dataTransfer.effectAllowed = 'move'
      }}
      className={`card card-interactive p-4 ${editable ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/work/${project.slug}`}
          className="text-[0.9375rem] font-semibold leading-snug text-ink transition-colors duration-200 hover:text-accent"
        >
          {project.title}
        </Link>
        <span className="chip shrink-0">{KIND_LABEL[project.kind]}</span>
      </div>

      {project.nextStep && (
        <p className="mt-3 rounded-[var(--radius-sm)] bg-raised px-3 py-2 text-[0.8125rem] leading-snug text-muted">
          {project.nextStep}
        </p>
      )}

      {/* Прапорці ортогональні колонці: зламатись може і готовий проєкт.
          Колір дублюється значком і текстом — інформація не має залежати
          від того, чи розрізняє людина відтінки. */}
      {flags.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {flags.map((flag, i) => (
            <li
              key={i}
              className={`flex items-start gap-1.5 text-[0.75rem] leading-snug ${
                flag.tone === 'broken' ? 'text-broken' : 'text-stale'
              }`}
            >
              <span aria-hidden className="pt-px">{flag.tone === 'broken' ? '✕' : '◷'}</span>
              <span>{flag.text}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <TimerButton
          projectSlug={project.slug}
          projectTitle={project.title}
          editable={editable}
        />
        <span className="num text-xs text-faint">
          {spent > 0 ? formatDuration(spent) : project.lastTouched}
        </span>
      </div>
    </div>
  )
}
