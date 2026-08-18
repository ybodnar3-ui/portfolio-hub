import { getProjects, getTimeData } from '@/lib/data'
import { isStale } from '@/lib/status'
import { totalMinutes } from '@/lib/time'
import { type BoardItem } from '@/components/board-column'
import { BoardFilter } from '@/components/board-filter'
import { TimeSummary } from '@/components/time-summary'
import { NewProject } from '@/components/new-project'
import { RunScripts } from '@/components/run-scripts'

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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl">Дошка</h1>
            <p className="mt-2 text-sm text-muted">
              {projects.length} проєктів · {active} в роботі
              {flagged > 0 && <> · <span className="text-stale">{flagged} потребують уваги</span></>}
            </p>
          </div>

          {/* На телефоні зведення і кнопки стають окремим рядом під заголовком,
              а не тиснуться в той самий, де вони не вміщаються. */}
          <div className="flex items-end justify-between gap-4 sm:justify-end sm:gap-6">
            <Stat label="Записано часу" value={`${Math.round(tracked / 60)} год`} />
            <div className="flex flex-wrap justify-end gap-2">
              {editable && <RunScripts />}
              {editable && <NewProject />}
            </div>
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
    <div className="shrink-0">
      <p className="eyebrow whitespace-nowrap">{label}</p>
      <p className="num mt-1 whitespace-nowrap text-2xl font-semibold text-ink sm:text-3xl">{value}</p>
    </div>
  )
}
