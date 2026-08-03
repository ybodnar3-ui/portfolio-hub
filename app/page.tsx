import { getProjects } from '@/lib/data'
import { visibleOnShowcase } from '@/lib/status'
import { ProjectCard } from '@/components/project-card'

export default function Home() {
  const projects = visibleOnShowcase(getProjects())

  return (
    <main style={{ paddingInline: 'var(--gutter)' }}>
      <section className="flex min-h-[72vh] flex-col justify-end border-b border-line pb-16 pt-24">
        <p className="eyebrow reveal">Юра Боднар · vibe coding</p>

        <h1
          className="reveal mt-6 max-w-[16ch] text-[clamp(3rem,11vw,9.5rem)] leading-[0.92]"
          style={{ '--delay': '0.08s' } as React.CSSProperties}
        >
          Роблю сайти,
          <br />
          які <em className="font-light italic text-accent">видно</em>
        </h1>

        <div
          className="reveal mt-12 flex flex-wrap items-end justify-between gap-8 border-t border-line pt-6"
          style={{ '--delay': '0.16s' } as React.CSSProperties}
        >
          <p className="max-w-[42ch] text-sm leading-relaxed text-muted">
            Лендінги, магазини й презентації, зібрані за рік. Тут вони живі: наведи на картку —
            і побачиш сам сайт, а не скріншот.
          </p>
          <p className="num font-serif text-5xl text-ink">
            {projects.length}
            <span className="ml-2 align-super text-xs tracking-[0.2em] text-faint">
              РОБІТ
            </span>
          </p>
        </div>
      </section>

      <section className="grid gap-x-10 gap-y-20 py-20 md:grid-cols-2 md:gap-y-28">
        {projects.map((project, i) => (
          <div
            key={project.slug}
            className="reveal-on-scroll"
            /* Кожна друга картка опускається нижче — сітка перестає читатись
               як таблиця й починає читатись як розворот. */
            style={i % 2 === 1 ? { marginTop: 'clamp(0px, 6vw, 5rem)' } : undefined}
          >
            <ProjectCard project={project} />
          </div>
        ))}
      </section>
    </main>
  )
}
