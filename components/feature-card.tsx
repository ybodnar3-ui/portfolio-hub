import Link from 'next/link'
import type { Feature } from '@/lib/types'

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Link
      href={`/lab/${feature.slug}`}
      className="group flex h-full flex-col justify-between border border-line bg-surface p-6 transition-colors duration-500 hover:border-line-strong hover:bg-raised"
    >
      <div>
        <h2 className="font-serif text-2xl leading-tight text-ink transition-colors duration-300 group-hover:text-accent">
          {feature.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{feature.summary}</p>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {feature.tags.map((tag) => (
            <li key={tag} className="text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
              {tag}
            </li>
          ))}
        </ul>
        <span className="shrink-0 text-[0.6875rem] uppercase tracking-[0.14em] text-faint">
          {feature.fromProject}
        </span>
      </div>
    </Link>
  )
}
