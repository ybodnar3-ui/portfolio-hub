import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject, getProjects, getFeatures, getTimeData, hasShot } from '@/lib/data'
import { totalMinutes, formatDuration } from '@/lib/time'
import { KIND_LABEL, ORIGIN_LABEL } from '@/lib/labels'
import { ProjectEditor } from '@/components/project-editor'
import { ProjectNotes } from '@/components/project-notes'

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }))
}

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

  // Дошка пише в JSON тільки на localhost — редагування теж.
  const editable = process.env.NODE_ENV !== 'production'

  return (
    <main className="pb-20" style={{ paddingInline: 'var(--gutter)' }}>
      <div className="pt-10">
        <Link href="/" className="btn btn-sm btn-quiet -ml-2">
          ← На дошку
        </Link>
      </div>

      <header className="reveal border-b border-line pb-8 pt-8">
        <p className="eyebrow">
          {KIND_LABEL[project.kind]} · {ORIGIN_LABEL[project.origin]} ·{' '}
          {formatDate(project.lastTouched)}
        </p>
        <h1 className="mt-3 text-[clamp(1.9rem,4vw,3rem)]">{project.title}</h1>
        <p className="mt-2 max-w-[52ch] text-base text-muted">
          {project.tagline}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn btn-primary">
              Відкрити сайт
              <span aria-hidden>↗</span>
            </a>
          )}
          {editable && <ProjectEditor project={project} />}
        </div>
      </header>

      <div className="grid gap-x-12 gap-y-10 py-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="reveal">
          <p className="max-w-[68ch] text-[0.95rem] leading-[1.75] text-ink/85">{project.story}</p>

          <div className="mt-10">
            <ProjectNotes slug={project.slug} notes={project.notes} editable={editable} />
          </div>

          {hasShot(project.slug) && (
            <img
              src={`/shots/${project.slug}.webp`}
              alt={`Знімок: ${project.title}`}
              className="card mt-8 w-full overflow-hidden"
              loading="lazy"
            />
          )}
        </div>

        <aside className="card space-y-7 self-start p-5">
          <Facts label="Стек" items={project.stack} />
          <Facts label="Теги" items={project.tags} />

          <section>
            <h2 className="eyebrow">Витрачено</h2>
            <p className="num mt-2 text-3xl font-semibold text-ink">{formatDuration(spent)}</p>

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
        <section className="border-t border-line pt-8">
          <h2 className="eyebrow">Фічі звідси</h2>
          <ul className="mt-6 divide-y divide-line">
            {features.map((feature) => (
              <li key={feature.slug}>
                <Link
                  href={`/lab/${feature.slug}`}
                  className="group flex items-baseline justify-between gap-6 rounded-[var(--radius-sm)] px-2 py-4 transition-colors hover:bg-raised"
                >
                  <span className="text-[0.9375rem] font-semibold text-ink transition-colors duration-200 group-hover:text-accent">
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
      <ul className="mt-2 flex flex-wrap">
        {items.map((item) => (
          <li key={item} className="chip mr-1.5 mb-1.5">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
