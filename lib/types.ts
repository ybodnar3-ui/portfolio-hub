export type ProjectStatus =
  | 'idea' | 'in-progress' | 'finishing' | 'needs-fix' | 'done' | 'archived'

/**
 * web  — сайт або лендінг, можна показати в iframe
 * app  — вебзастосунок чи PWA, теж показується в iframe, якщо задеплоєний
 * tool — скрейпер, парсер, бот: публічного UI немає, показувати нема чого
 * deck — презентація (PDF/PPTX)
 * doc  — звіт або документ
 */
export type ProjectKind = 'web' | 'app' | 'tool' | 'deck' | 'doc'

/** Показувати в iframe має сенс тільки для цих типів. */
export const EMBEDDABLE_KINDS: ProjectKind[] = ['web', 'app']

/**
 * Звідки взявся проєкт. Це не етап роботи (для нього є status), а відповідь
 * на питання «чи це справжня робота». На публічну вітрину йдуть client і product.
 *
 * client   — робота під замовника
 * product  — власний продукт або інструмент, зроблений не на замовлення
 * study    — навчальне завдання
 * practice — проба технології, клон, експеримент
 */
export type ProjectOrigin = 'client' | 'product' | 'study' | 'practice'

export type Health = 'ok' | 'broken' | 'unknown'

/** Нотатка до проєкту: те, що не лізе в опис, але шкода забути. */
export interface ProjectNote {
  id: string
  at: string        // ISO
  text: string
}

export interface Project {
  slug: string
  /**
   * Назва папки чи репозиторію. Саме за нею звіряється scan.mjs.
   * Тримається окремо від slug, щоб публічний слаг можна було знеособити
   * («relations-crm» замість «emmanuil-project»), і сканер усе одно
   * впізнавав проєкт, а не додавав дубль.
   */
  repo: string | null
  title: string
  tagline: string
  story: string
  kind: ProjectKind
  origin: ProjectOrigin
  stack: string[]
  liveUrl: string | null
  localPath: string
  tags: string[]
  status: ProjectStatus
  featureSlugs: string[]
  nextStep: string
  blocker: string
  lastTouched: string   // YYYY-MM-DD, автогенерується
  health: Health        // автогенерується; unknown = немає liveUrl
  notes: ProjectNote[]
}

export interface Feature {
  slug: string
  title: string
  summary: string
  tags: string[]
  fromProject: string
  deps: string[]        // порожньо = ванільний JS
}

export interface TimeEntry {
  id: string
  projectSlug: string
  startedAt: string     // ISO
  endedAt: string       // ISO
  minutes: number       // зберігається явно, не рахується з дат
  note: string
  source: 'timer' | 'manual'
}

export interface RunningTimer {
  projectSlug: string
  startedAt: string     // ISO
}

export interface TimeData {
  running: RunningTimer | null
  entries: TimeEntry[]
}
