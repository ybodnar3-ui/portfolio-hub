import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject, getProjects, getFeatures, getTimeData, hasShot } from '@/lib/data'
import { totalMinutes, formatDuration } from '@/lib/time'

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }))
}

const KIND_LABEL = { web: 'Сайт', deck: 'Презентація', doc: 'Документ' } as const

/* Без року в Intl: uk-UA дописує « р.», що в верхньому регістрі читається як «Р.». */
const DAY_MONTH = new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long', timeZone: 'UTC' })

function formatDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  return `${DAY_MONTH.format(date)} ${date.getUTCFullYear()}`
}

export default async function WorkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProject(slug)
  if (!project) notFound()

  const features = getFeatures().filter((f) => f.fromProject === slug)
  const { entries } = getTimeData()
  const spent = totalMinutes(entries, slug)
  const sessions = entries
    .filter((e) => e.projectSlug === slug)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))

  return (
    <main className="pb-32" style={{ paddingInline: 'var(--gutter)' }}>
      <div className="pt-10">
        <Link href="/" className="eyebrow link-underline">
          ← Усі роботи
        </Link>
      </div>

      <header className="reveal border-b border-line pb-14 pt-16">
        <p className="eyebrow">
          {KIND_LABEL[project.kind]} · {formatDate(project.lastTouched)}
        </p>
        <h1 className="mt-5 text-[clamp(2.5rem,8vw,6.5rem)]">{project.title}</h1>
        <p className="mt-4 max-w-[40ch] font-serif text-2xl italic text-muted">
          {project.tagline}
        </p>

        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            data-cursor="hover"
            className="mt-10 inline-flex items-center gap-3 border border-line-strong px-6 py-3 text-sm tracking-[0.08em] text-ink transition-colors duration-300 hover:border-accent hover:text-accent"
          >
            Відкрити сайт
            <span aria-hidden>↗</span>
          </a>
        )}
      </header>

      <div className="grid gap-x-16 gap-y-14 py-16 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="reveal">
          <p className="max-w-[62ch] text-base leading-[1.75] text-ink/85">{project.story}</p>

          {hasShot(project.slug) && (
            <img
              src={`/shots/${project.slug}.webp`}
              alt={`Знімок: ${project.title}`}
              className="mt-12 w-full border border-line"
              loading="lazy"
            />
          )}
        </div>

        <aside className="space-y-10 lg:pt-1">
          <Facts label="Стек" items={project.stack} />
          <Facts label="Теги" items={project.tags} />

          <section>
            <h2 className="eyebrow">Витрачено</h2>
            <p className="num mt-3 font-serif text-4xl text-ink">{formatDuration(spent)}</p>

            {sessions.length > 0 ? (
              <ul className="mt-5 space-y-3 border-t border-line pt-4">
                {sessions.map((session) => (
                  <li key={session.id} className="flex items-baseline justify-between gap-4 text-sm">
                    <span className="text-muted">
                      {formatDate(session.startedAt.slice(0, 10))}
                      {session.note && <span className="text-faint"> · {session.note}</span>}
                      {session.source === 'manual' && (
                        <span className="text-faint"> · вручну</span>
                      )}
                    </span>
                    <span className="num shrink-0 text-ink">{formatDuration(session.minutes)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-faint">Сесій ще немає.</p>
            )}
          </section>
        </aside>
      </div>

      {features.length > 0 && (
        <section className="border-t border-line pt-12">
          <h2 className="eyebrow">Фічі звідси</h2>
          <ul className="mt-6 divide-y divide-line">
            {features.map((feature) => (
              <li key={feature.slug}>
                <Link
                  href={`/lab/${feature.slug}`}
                  data-cursor="hover"
                  className="group flex items-baseline justify-between gap-6 py-5"
                >
                  <span className="font-serif text-2xl text-ink transition-colors duration-300 group-hover:text-accent">
                    {feature.title}
                  </span>
                  <span className="max-w-[46ch] text-right text-sm text-muted">
                    {feature.summary}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}

function Facts({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <h2 className="eyebrow">{label}</h2>
      <ul className="mt-3 space-y-1">
        {items.map((item) => (
          <li key={item} className="text-sm text-muted">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
