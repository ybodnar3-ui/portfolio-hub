import fs from 'node:fs'
import path from 'node:path'
import type { Project, TimeData } from './types'

const DATA_DIR = path.join(process.cwd(), 'data')

export function assertWritable(): void {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('read-only')
  }
}

/* Запис через тимчасовий файл і rename — щоб перерваний запис
   не лишив покалічений JSON. */
function write(file: string, value: unknown): void {
  assertWritable()
  const full = path.join(DATA_DIR, file)
  const tmp = `${full}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n')
  fs.renameSync(tmp, full)
}

export function writeProjects(projects: Project[]): void {
  write('projects.json', projects)
}

export function writeTime(data: TimeData): void {
  write('time.json', data)
}
