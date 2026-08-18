import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/data'
import { writeProjects } from '@/lib/write'
import { BOARD_COLUMNS } from '@/lib/status'
import { blankProject, slugify, uniqueSlug } from '@/lib/projects'
import type { ProjectKind, ProjectOrigin, ProjectStatus } from '@/lib/types'

const KINDS: ProjectKind[] = ['web', 'app', 'tool', 'deck', 'doc']
const ORIGINS: ProjectOrigin[] = ['client', 'product', 'study', 'practice']

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'read-only' }, { status: 403 })
  }

  const body = (await request.json()) as {
    title?: string
    kind?: ProjectKind
    origin?: ProjectOrigin
    status?: ProjectStatus
  }

  const title = (body.title ?? '').trim()
  if (!title) {
    return NextResponse.json({ error: 'Назва обовʼязкова' }, { status: 400 })
  }

  const kind = KINDS.includes(body.kind as ProjectKind) ? body.kind! : 'web'
  const origin = ORIGINS.includes(body.origin as ProjectOrigin) ? body.origin! : 'client'
  const status = BOARD_COLUMNS.some((c) => c.id === body.status) ? body.status! : 'idea'

  const projects = getProjects()
  // Слаг має бути унікальним: він і ключ, і адреса сторінки.
  const slug = uniqueSlug(slugify(title), projects.map((p) => p.slug))
  const today = new Date().toISOString().slice(0, 10)

  const project = blankProject({ slug, title, kind, origin, status }, today)
  writeProjects([...projects, project])

  return NextResponse.json({ ok: true, slug }, { status: 201 })
}
