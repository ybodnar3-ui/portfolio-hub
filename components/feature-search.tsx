'use client'

import { useMemo, useState } from 'react'
import type { Feature } from '@/lib/types'
import { FeatureCard } from './feature-card'

/** Весь список тримається в памʼяті: 5-50 фіч не потребують серверного пошуку. */
export function FeatureSearch({ features }: { features: Feature[] }) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState<string | null>(null)

  const tags = useMemo(
    () => [...new Set(features.flatMap((f) => f.tags))].sort(),
    [features],
  )

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return features.filter((f) => {
      if (tag && !f.tags.includes(tag)) return false
      if (!q) return true
      return (
        f.title.toLowerCase().includes(q) ||
        f.summary.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [features, query, tag])

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Пошук фічі…"
        aria-label="Пошук фічі"
        className="w-full max-w-md rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3.5 py-2.5 text-base text-ink outline-none transition-colors duration-200 placeholder:text-faint focus:border-accent"
      />

      {tags.length > 0 && (
        <div
          role="group"
          aria-label="Фільтр за тегом"
          className="mt-5 flex flex-wrap items-center gap-2"
        >
          <FilterButton active={tag === null} onClick={() => setTag(null)}>
            Усі
          </FilterButton>
          {tags.map((t) => (
            <FilterButton key={t} active={tag === t} onClick={() => setTag(t)}>
              {t}
            </FilterButton>
          ))}
        </div>
      )}

      <p className="num mt-6 text-xs text-faint">
        {shown.length} із {features.length}
      </p>

      {shown.length === 0 ? (
        <p className="mt-8 text-base font-semibold text-muted">Нічого не знайшлось.</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((f) => (
            <FeatureCard key={f.slug} feature={f} />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-active={active}
      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-quiet'}`}
    >
      {children}
    </button>
  )
}
