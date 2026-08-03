'use client'

import { useState } from 'react'
import type { Project } from '@/lib/types'

const KIND_LABEL = { web: 'Сайт', deck: 'Презентація', doc: 'Документ' } as const

export function LivePreview({ project, hasShot }: { project: Project; hasShot: boolean }) {
  const [live, setLive] = useState(false)
  const canGoLive = project.kind === 'web' && !!project.liveUrl && project.health !== 'broken'

  return (
    <div
      className="relative aspect-[16/10] overflow-hidden bg-surface"
      onMouseEnter={() => canGoLive && setLive(true)}
      onMouseLeave={() => setLive(false)}
    >
      {hasShot ? (
        <img
          src={`/shots/${project.slug}.webp`}
          alt={project.title}
          className="h-full w-full object-cover object-top transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02] group-hover:opacity-90"
          loading="lazy"
        />
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

function Placeholder({ project }: { project: Project }) {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-surface p-6">
      <span className="eyebrow">{KIND_LABEL[project.kind]}</span>
      <span className="font-serif text-3xl leading-tight text-muted">{project.title}</span>
    </div>
  )
}
