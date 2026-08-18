import type { Project, ProjectKind, ProjectNote, ProjectOrigin, ProjectStatus } from './types'

/* Кирилиця в URL виглядає як %D0%90%D0%BA — тому транслітеруємо. */
const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ye', ж: 'zh', з: 'z',
  и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
  р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ь: '', ю: 'yu', я: 'ya', ы: 'y', э: 'e', ъ: '', ё: 'e',
}

export function slugify(input: string): string {
  const slug = input
    .toLowerCase()
    .split('')
    .map((ch) => (ch in TRANSLIT ? TRANSLIT[ch] : ch))
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Порожній слаг зламав би маршрут — краще запасне імʼя, ніж /work/
  return slug || 'project'
}

export function uniqueSlug(slug: string, taken: string[]): string {
  if (!taken.includes(slug)) return slug
  let n = 2
  while (taken.includes(`${slug}-${n}`)) n++
  return `${slug}-${n}`
}

export function blankProject(
  input: { slug: string; title: string; kind: ProjectKind; status: ProjectStatus; origin?: ProjectOrigin },
  today: string,
): Project {
  return {
    slug: input.slug,
    repo: null,
    title: input.title,
    tagline: '',
    story: '',
    kind: input.kind,
    origin: input.origin ?? 'client',
    stack: [],
    liveUrl: null,
    localPath: '',
    tags: [],
    status: input.status,
    featureSlugs: [],
    nextStep: '',
    blocker: '',
    lastTouched: today,
    health: 'unknown',
    notes: [],
  }
}

/**
 * Поля, які людина править руками. Решта — автогенерована
 * (`lastTouched`, `health`), технічна (`repo`, `featureSlugs`)
 * або ключова (`slug`), і через форму не змінюється.
 */
const EDITABLE = [
  'title', 'tagline', 'story', 'kind', 'origin', 'status',
  'liveUrl', 'localPath', 'nextStep', 'blocker', 'stack', 'tags',
] as const

export type ProjectEdits = Partial<Pick<Project, (typeof EDITABLE)[number]>>

export function applyEdits(project: Project, edits: ProjectEdits): Project {
  const next = { ...project }
  for (const field of EDITABLE) {
    // undefined = «не чіпати». Порожній рядок = «очистити».
    if (edits[field] !== undefined) {
      Object.assign(next, { [field]: edits[field] })
    }
  }
  return next
}

function nextNoteId(notes: ProjectNote[]): string {
  const max = notes.reduce((acc, n) => {
    const num = Number(n.id.replace('n_', ''))
    return Number.isFinite(num) && num > acc ? num : acc
  }, 0)
  return `n_${String(max + 1).padStart(4, '0')}`
}

/** Нові нотатки лягають зверху: свіже читається першим. */
export function addNote(project: Project, text: string, nowIso: string): Project {
  const trimmed = text.trim()
  if (!trimmed) return project

  const note: ProjectNote = { id: nextNoteId(project.notes), at: nowIso, text: trimmed }
  return { ...project, notes: [note, ...project.notes] }
}

export function removeNote(project: Project, id: string): Project {
  return { ...project, notes: project.notes.filter((n) => n.id !== id) }
}
