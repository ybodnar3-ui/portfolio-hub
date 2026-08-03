export type ProjectStatus =
  | 'idea' | 'in-progress' | 'finishing' | 'needs-fix' | 'done' | 'archived'

/** web — можна показати в iframe. deck — презентація (PDF/PPTX). doc — звіт/документ. */
export type ProjectKind = 'web' | 'deck' | 'doc'

export type Health = 'ok' | 'broken' | 'unknown'

export interface Project {
  slug: string
  title: string
  tagline: string
  story: string
  kind: ProjectKind
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
