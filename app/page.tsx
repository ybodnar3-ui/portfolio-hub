import { getProjects, getTimeData } from '@/lib/data'
import { isStale } from '@/lib/status'
import { totalMinutes } from '@/lib/time'
import { type BoardItem } from '@/components/board-column'
import { BoardFilter } from '@/components/board-filter'
import { TimeSummary } from '@/components/time-summary'
import { NewProject } from '@/components/new-project'

/* Після запису в JSON дошка має показувати свіжий стан без перезбірки. */
export const dynamic = 'force-dynamic'

export default function BoardPage() {
  const projects = getProjects()
  const { entries } = getTimeData()
  const now = new Date()

  const items: BoardItem[] = projects.map((project) => ({
    project,
    spent: totalMinutes(entries, project.slug),
    stale: isStale(project, now),
  }))

  const editable = process.env.NODE_ENV !== 'production'
  const active = projects.filter((p) => p.status !== 'archived' && p.status !== 'done').length
  const flagged = projects.filter(
    (p) => p.health === 'broken' || p.blocker || isStale(p, now),
  ).length
  const tracked = entries.reduce((sum, e) => sum + e.minutes, 0)

  return (
    <main className="pb-16 pt-10" style={{ paddingInline: 'var(--gutter)' }}>
      <header className="reveal">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl">Дошка</h1>
            <p className="mt-2 text-sm text-muted">
              {projects.length} проєктів · {active} в роботі
              {flagged > 0 && <> · <span className="text-stale">{flagged} потребують уваги</span></>}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <Stat label="Записано часу" value={`${Math.round(tracked / 60)} год`} />
            {editable && <NewProject />}
          </div>
        </div>

        <details className="card mt-8 p-5">
          <summary className="list-none text-sm font-medium text-ink">
            Скільки годин пішло
            <span className="ml-2 font-normal text-faint">база для розрахунку ціни</span>
          </summary>
          <div className="pt-7">
            <TimeSummary projects={projects} entries={entries} />
          </div>
        </details>
      </header>

      <BoardFilter items={items} editable={editable} />
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="eyebrow">{label}</p>
      <p className="num mt-1 text-3xl font-semibold text-ink">{value}</p>
    </div>
  )
}
