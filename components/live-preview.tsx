'use client'

import { useState } from 'react'
import type { Project } from '@/lib/types'
import { EMBEDDABLE_KINDS } from '@/lib/types'
import { KIND_LABEL } from '@/lib/labels'

export function LivePreview({ project, hasShot }: { project: Project; hasShot: boolean }) {
  const [live, setLive] = useState(false)
  const canGoLive =
    EMBEDDABLE_KINDS.includes(project.kind) && !!project.liveUrl && project.health !== 'broken'

  // У скрейпера чи бота немає інтерфейсу, тому й скріншот показувати нема сенсу:
  // навіть якщо файл випадково зʼявиться, картка малює стек, а не порожній кадр.
  const showShot = hasShot && project.kind !== 'tool'

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden bg-surface"
      onMouseEnter={() => canGoLive && setLive(true)}
      onMouseLeave={() => setLive(false)}
    >
      {showShot ? (
        <img
          src={`/shots/${project.slug}.webp`}
          alt={project.title}
          className="h-full w-full object-cover object-top transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] group-hover:opacity-90"
          loading="lazy"
        />
      ) : project.kind === 'tool' ? (
        <ToolFace project={project} />
      ) : (
        <Placeholder project={project} />
      )}

      {live && (
        <iframe
          src={project.liveUrl!}
          title={project.title}
          className="absolute inset-0 h-full w-full border-0"
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
        />
      )}

      {/* Плівковий градієнт донизу, щоб підпис під карткою не відривався від зображення */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-bg/70 to-transparent" />
    </div>
  )
}

/**
 * Обличчя проєкту без UI. Показуємо те, що в нього справді є, — стек.
 * Моноширинний список читається як вивід у терміналі й не прикидається сайтом.
 */
function ToolFace({ project }: { project: Project }) {
  const stack = project.stack.slice(0, 5)

  return (
    <div className="flex h-full w-full flex-col justify-between bg-surface p-6">
      <span className="eyebrow">{KIND_LABEL.tool}</span>

      {stack.length > 0 ? (
        <ul className="space-y-1 font-mono text-[0.8125rem] text-muted">
          {stack.map((item) => (
            <li key={item} className="truncate">
              <span className="text-faint">›</span> {item}
            </li>
          ))}
        </ul>
      ) : (
        <span className="font-serif text-2xl text-muted">{project.title}</span>
      )}
    </div>
  )
}

function Placeholder({ project }: { project: Project }) {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-surface p-6">
      <span className="eyebrow">{KIND_LABEL[project.kind]}</span>
      <span className="font-serif text-3xl leading-tight text-muted">{project.title}</span>
    </div>
  )
}
