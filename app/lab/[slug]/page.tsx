import fs from 'node:fs'
import path from 'node:path'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getFeature, getFeatures } from '@/lib/data'
import { CodePanel } from '@/components/code-panel'

export function generateStaticParams() {
  return getFeatures().map((f) => ({ slug: f.slug }))
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const feature = getFeature(slug)
  if (!feature) notFound()

  const dir = path.join(process.cwd(), 'public', 'features', slug)
  const code = fs.readFileSync(path.join(dir, 'index.html'), 'utf8')
  const notesPath = path.join(dir, 'notes.md')
  const notes = fs.existsSync(notesPath) ? fs.readFileSync(notesPath, 'utf8') : ''

  return (
    <main className="pb-20" style={{ paddingInline: 'var(--gutter)' }}>
      <div className="pt-10">
        <Link href="/lab" className="btn btn-sm btn-quiet -ml-2">
          ← Усі фічі
        </Link>
      </div>

      <header className="reveal border-b border-line pb-8 pt-8">
        <p className="eyebrow">
          з проєкту{' '}
          <Link href={`/work/${feature.fromProject}`} className="text-muted underline decoration-line underline-offset-2 transition-colors hover:text-accent">
            {feature.fromProject}
          </Link>
        </p>
        <h1 className="mt-3 text-[clamp(1.9rem,4vw,2.75rem)]">{feature.title}</h1>
        <p className="mt-2 max-w-[62ch] text-[0.95rem] leading-relaxed text-muted">{feature.summary}</p>

        <ul className="mt-5 flex flex-wrap items-center gap-2">
          {feature.tags.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
          <li className="chip border-accent/30 bg-accent-soft text-accent">
            {feature.deps.length === 0 ? 'без залежностей' : feature.deps.join(' · ')}
          </li>
        </ul>
      </header>

      {/* Той самий файл читається двічі: браузером через src і сервером через
          readFileSync. Це і є інваріант «одне джерело» — код у превʼю і код
          у панелі не можуть розійтись. */}
      <section className="pt-12">
        <h2 className="eyebrow">Демо</h2>
        <iframe
          src={`/features/${slug}/index.html`}
          title={`Демо: ${feature.title}`}
          className="card mt-4 h-[60vh] w-full bg-white"
          sandbox="allow-scripts"
        />
      </section>

      <div className="grid gap-x-10 gap-y-10 pt-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <section>
          <h2 className="eyebrow">Код</h2>
          <div className="mt-4">
            <CodePanel code={code} />
          </div>
        </section>

        {notes && (
          <section>
            <h2 className="eyebrow">Нотатки</h2>
            <Notes source={notes} />
          </section>
        )}
      </div>
    </main>
  )
}

/**
 * Мінімальний рендер markdown: заголовки, списки, абзаци, `код` і **жирне**.
 * Повноцінний парсер тут зайвий — нотатки пишемо самі й у відомому форматі.
 */
function Notes({ source }: { source: string }) {
  const blocks = source.trim().split(/\n{2,}/)

  return (
    <div className="mt-4 space-y-5">
      {blocks.map((block, i) => {
        const heading = block.match(/^(#{1,3})\s+(.*)$/)
        if (heading) {
          return (
            <h3 key={i} className="font-serif text-lg text-ink">
              {heading[2]}
            </h3>
          )
        }

        if (/^[-*]\s/m.test(block)) {
          const items = block.split('\n').filter((l) => /^[-*]\s/.test(l))
          return (
            <ul key={i} className="space-y-2 border-l border-line pl-5">
              {items.map((item, j) => (
                <li key={j} className="text-sm leading-relaxed text-muted">
                  {inline(item.replace(/^[-*]\s/, ''))}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={i} className="text-sm leading-relaxed text-muted">
            {inline(block)}
          </p>
        )
      })}
    </div>
  )
}

function inline(text: string): React.ReactNode[] {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-raised px-1.5 py-0.5 font-mono text-[0.8125rem] text-ink">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-medium text-ink">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}
