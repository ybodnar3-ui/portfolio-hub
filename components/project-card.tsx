import Link from 'next/link'
import { hasShot } from '@/lib/data'
import type { Project } from '@/lib/types'
import { LivePreview } from './live-preview'

export function ProjectCard({ project }: { project: Project }) {
  const year = project.lastTouched.slice(0, 4)

  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block focus-visible:outline-offset-8"
    >
      <LivePreview project={project} hasShot={hasShot(project.slug)} />

      <div className="mt-5 flex items-baseline justify-between gap-6 border-t border-line pt-4 transition-colors duration-500 group-hover:border-line-strong">
        <h2 className="font-serif text-3xl leading-none text-ink">{project.title}</h2>
        <span className="num shrink-0 text-xs tracking-[0.18em] text-faint">{year}</span>
      </div>

      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-muted">{project.tagline}</p>

      {project.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
          {project.tags.map((tag) => (
            <li key={tag} className="text-[0.6875rem] tracking-[0.14em] text-faint uppercase">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </Link>
  )
}
