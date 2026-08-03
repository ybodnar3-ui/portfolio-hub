import { getProjects, getTimeData } from '@/lib/data'
import { BOARD_COLUMNS, groupByColumn, isStale } from '@/lib/status'
import { totalMinutes } from '@/lib/time'
import { BoardColumn, type BoardItem } from '@/components/board-column'
import { TimeSummary } from '@/components/time-summary'
import type { ProjectStatus } from '@/lib/types'

/* Обовʼязково: після запису в JSON дошка має показувати свіжий стан без перезбірки. */
export const dynamic = 'force-dynamic'

export const metadata = { title: 'Дошка — стан проєктів' }

export default function BoardPage() {
  const projects = getProjects()
  const { entries } = getTimeData()
  const now = new Date()
  const grouped = groupByColumn(projects)

  const enriched = Object.fromEntries(
    BOARD_COLUMNS.map((column) => [
      column.id,
      grouped[column.id].map((project) => ({
        project,
        spent: totalMinutes(entries, project.slug),
        stale: isStale(project, now),
      })),
    ]),
  ) as Record<ProjectStatus, BoardItem[]>

  /* На Vercel картки не перетягуються — це очікувана поведінка, а не баг:
     API-роути запису там повертають 403. */
  const editable = process.env.NODE_ENV !== 'production'

  return (
    <main className="flex min-h-0 flex-1 flex-col pb-12 pt-14">
      <header className="pb-10" style={{ paddingInline: 'var(--gutter)' }}>
        <p className="eyebrow">Приватне</p>
        <h1 className="mt-4 text-[clamp(2.25rem,6vw,4.5rem)]">Дошка</h1>

        {/* Згорнуте за замовчуванням, щоб не тіснити дошку. */}
        <details className="mt-10 border-t border-line pt-5">
          <summary
            className="cursor-pointer list-none text-[0.8125rem] tracking-[0.06em] text-muted transition-colors duration-300 hover:text-ink"
          >
            Скільки годин пішло <span className="text-faint">— база для розрахунку ціни</span>
          </summary>
          <div className="pt-8">
            <TimeSummary projects={projects} entries={entries} />
          </div>
        </details>
      </header>

      <div
        className="flex gap-5 overflow-x-auto pb-6"
        style={{ paddingInline: 'var(--gutter)' }}
      >
        {BOARD_COLUMNS.map((column) => (
          <BoardColumn
            key={column.id}
            column={column}
            items={enriched[column.id]}
            editable={editable}
          />
        ))}
      </div>
    </main>
  )
}
