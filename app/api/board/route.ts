import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/data'
import { writeProjects } from '@/lib/write'
import { BOARD_COLUMNS } from '@/lib/status'
import type { ProjectStatus } from '@/lib/types'

export async function PATCH(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'read-only' }, { status: 403 })
  }

  const { slug, status } = (await request.json()) as { slug: string; status: ProjectStatus }

  if (!BOARD_COLUMNS.some((c) => c.id === status)) {
    return NextResponse.json({ error: 'unknown status' }, { status: 400 })
  }

  const projects = getProjects()
  const target = projects.find((p) => p.slug === slug)
  if (!target) return NextResponse.json({ error: 'unknown project' }, { status: 404 })

  target.status = status
  writeProjects(projects)
  return NextResponse.json({ ok: true })
}
