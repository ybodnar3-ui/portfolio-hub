import Link from 'next/link'
import type { Feature } from '@/lib/types'

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Link
      href={`/lab/${feature.slug}`}
      className="card card-interactive group flex h-full flex-col justify-between p-5"
    >
      <div>
        <h2 className="text-base font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-accent">
          {feature.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{feature.summary}</p>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <ul className="flex flex-wrap gap-x-3 gap-y-1">
          {feature.tags.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
        </ul>
        <span className="shrink-0 text-[0.6875rem] text-faint">
          {feature.fromProject}
        </span>
      </div>
    </Link>
  )
}
