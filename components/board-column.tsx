import type { Project, ProjectStatus } from '@/lib/types'
import { BoardCard } from './board-card'

export interface BoardItem {
  project: Project
  spent: number
  stale: boolean
}

export function BoardColumn({
  column,
  items,
  editable = false,
}: {
  column: { id: ProjectStatus; label: string }
  items: BoardItem[]
  editable?: boolean
}) {
  return (
    <section className="flex w-[19rem] shrink-0 flex-col">
      <header className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
        <h2 className="text-[0.8125rem] tracking-[0.12em] text-ink uppercase">{column.label}</h2>
        <span className="num text-xs text-faint">{items.length}</span>
      </header>

      <div className="mt-4 flex flex-col gap-3">
        {items.length === 0 ? (
          // Порожня колонка не зникає — інакше дошка стрибає при кожному переносі.
          <p className="border border-dashed border-line px-4 py-8 text-center text-xs text-faint">
            Порожньо
          </p>
        ) : (
          items.map((item) => (
            <BoardCard
              key={item.project.slug}
              project={item.project}
              spent={item.spent}
              stale={item.stale}
              editable={editable}
            />
          ))
        )}
      </div>
    </section>
  )
}
