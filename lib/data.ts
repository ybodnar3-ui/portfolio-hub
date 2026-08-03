import fs from 'node:fs'
import path from 'node:path'
import type { Project, Feature, TimeData } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')

function read<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')) as T
}

export function getProjects(): Project[] {
  return read<Project[]>('projects.json')
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug)
}

export function getFeatures(): Feature[] {
  return read<Feature[]>('features.json')
}

export function getFeature(slug: string): Feature | undefined {
  return getFeatures().find((f) => f.slug === slug)
}

export function getTimeData(): TimeData {
  return read<TimeData>('time.json')
}

/**
 * Знімок є не в кожного проєкту: deck і doc не знімаються взагалі,
 * а вебпроєкт міг не знятись через помилку. Перевіряємо на сервері,
 * щоб на вітрині не було битих картинок.
 */
export function hasShot(slug: string): boolean {
  return fs.existsSync(path.join(process.cwd(), 'public', 'shots', `${slug}.webp`))
}
