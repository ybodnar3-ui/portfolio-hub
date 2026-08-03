import type { Project, TimeEntry } from '@/lib/types'
import { totalMinutes, formatDuration } from '@/lib/time'

/**
 * Відповідає на питання «скільки просити за наступний лендінг».
 * Не гроші, а години: ціну автор рахує сам.
 */

interface Row {
  project: Project
  type: string
  minutes: number
}

const NO_TYPE = 'без типу'

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

function hours(minutes: number): number {
  return Math.round((minutes / 60) * 10) / 10
}

export function TimeSummary({
  projects,
  entries,
}: {
  projects: Project[]
  entries: TimeEntry[]
}) {
  const rows: Row[] = projects
    .map((project) => ({
      project,
      type: project.tags[0] ?? NO_TYPE,
      minutes: totalMinutes(entries, project.slug),
    }))
    .filter((row) => row.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)

  if (rows.length === 0) {
    return <p className="text-sm text-faint">Ще немає записаного часу.</p>
  }

  const byType = new Map<string, number[]>()
  for (const row of rows) {
    const list = byType.get(row.type) ?? []
    list.push(row.minutes)
    byType.set(row.type, list)
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <section>
        <h3 className="eyebrow">По проєктах</h3>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="pb-2 font-normal text-faint">Назва</th>
              <th className="pb-2 font-normal text-faint">Тип</th>
              <th className="pb-2 text-right font-normal text-faint">Витрачено</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.project.slug} className="border-b border-line/60">
                <td className="py-2.5 pr-3 text-ink">{row.project.title}</td>
                <td className="py-2.5 pr-3 text-muted">{row.type}</td>
                <td className="num py-2.5 text-right text-ink">{formatDuration(row.minutes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h3 className="eyebrow">Вилки за типом</h3>
        <ul className="mt-4 space-y-3">
          {[...byType.entries()].map(([type, minutes]) => {
            const min = hours(Math.min(...minutes))
            const max = hours(Math.max(...minutes))

            return (
              <li key={type} className="flex items-baseline justify-between gap-4 border-b border-line/60 pb-2.5 text-sm">
                <span className="text-ink">{type}</span>
                {minutes.length === 1 ? (
                  // Діапазон з одного значення вводив би в оману.
                  <span className="num text-muted">
                    {min} год · <span className="text-faint">одна робота</span>
                  </span>
                ) : (
                  <span className="num text-muted">
                    {min}–{max} год ·{' '}
                    <span className="text-faint">медіана {hours(median(minutes))}</span>
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
