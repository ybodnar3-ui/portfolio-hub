import type { ProjectKind, ProjectOrigin } from './types'

export const KIND_LABEL: Record<ProjectKind, string> = {
  web: 'Сайт',
  app: 'Вебзастосунок',
  tool: 'Інструмент',
  deck: 'Презентація',
  doc: 'Документ',
}

export const ORIGIN_LABEL: Record<ProjectOrigin, string> = {
  client: 'Під замовника',
  product: 'Своє',
  study: 'Навчання',
  practice: 'Проба',
}
