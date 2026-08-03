import { getProjects, getTimeData } from '@/lib/data'
import { BOARD_COLUMNS, groupByColumn, isStale } from '@/lib/status'
import { totalMinutes } from '@/lib/time'
import { BoardColumn, type BoardItem } from '@/components/board-column'
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

  return (
    <main className="flex min-h-0 flex-1 flex-col pb-12 pt-14">
      <header className="pb-10" style={{ paddingInline: 'var(--gutter)' }}>
        <p className="eyebrow">Приватне</p>
        <h1 className="mt-4 text-[clamp(2.25rem,6vw,4.5rem)]">Дошка</h1>
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
            editable={false}
          />
        ))}
      </div>
    </main>
  )
}
