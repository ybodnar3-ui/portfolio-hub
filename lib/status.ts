import type { Project, ProjectStatus } from './types'

export const BOARD_COLUMNS: { id: ProjectStatus; label: string }[] = [
  { id: 'idea', label: 'Ідея' },
  { id: 'in-progress', label: 'В роботі' },
  { id: 'finishing', label: 'Фініш' },
  { id: 'needs-fix', label: 'Треба фікс' },
  { id: 'done', label: 'Готово' },
  { id: 'archived', label: 'Архів' },
]

const STALE_DAYS = 60
const DAY_MS = 86_400_000

export function isStale(project: Project, now: Date): boolean {
  if (project.status === 'done' || project.status === 'archived') return false
  const touched = new Date(`${project.lastTouched}T00:00:00Z`).getTime()
  return (now.getTime() - touched) / DAY_MS > STALE_DAYS
}

export function visibleOnShowcase(projects: Project[]): Project[] {
  return projects
    .filter((p) => p.status !== 'archived')
    .sort((a, b) => b.lastTouched.localeCompare(a.lastTouched))
}

export function groupByColumn(projects: Project[]): Record<ProjectStatus, Project[]> {
  const grouped = Object.fromEntries(
    BOARD_COLUMNS.map((c) => [c.id, [] as Project[]]),
  ) as Record<ProjectStatus, Project[]>
  for (const project of projects) grouped[project.status].push(project)
  return grouped
}
