import { NextResponse } from 'next/server'
import { getProjects } from '@/lib/data'
import { writeProjects } from '@/lib/write'
import { BOARD_COLUMNS } from '@/lib/status'
import { addNote, applyEdits, removeNote, type ProjectEdits } from '@/lib/projects'
import type { ProjectKind, ProjectOrigin } from '@/lib/types'

const KINDS: ProjectKind[] = ['web', 'app', 'tool', 'deck', 'doc']
const ORIGINS: ProjectOrigin[] = ['client', 'product', 'study', 'practice']

type Body =
  | { action: 'edit'; edits: ProjectEdits }
  | { action: 'addNote'; text: string }
  | { action: 'removeNote'; id: string }
  | { action: 'delete' }

function guard(): NextResponse | null {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'read-only' }, { status: 403 })
  }
  return null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const blocked = guard()
  if (blocked) return blocked

  const { slug } = await params
  const projects = getProjects()
  const index = projects.findIndex((p) => p.slug === slug)
  if (index === -1) {
    return NextResponse.json({ error: 'unknown project' }, { status: 404 })
  }

  const body = (await request.json()) as Body

  if (body.action === 'delete') {
    writeProjects(projects.filter((p) => p.slug !== slug))
    return NextResponse.json({ ok: true, deleted: slug })
  }

  let next = projects[index]

  if (body.action === 'edit') {
    const edits = body.edits ?? {}

    // Перелічувані поля перевіряємо: у JSON не має потрапити щось,
    // чого не знає ані дошка, ані картка.
    if (edits.kind !== undefined && !KINDS.includes(edits.kind)) {
      return NextResponse.json({ error: 'unknown kind' }, { status: 400 })
    }
    if (edits.origin !== undefined && !ORIGINS.includes(edits.origin)) {
      return NextResponse.json({ error: 'unknown origin' }, { status: 400 })
    }
    if (edits.status !== undefined && !BOARD_COLUMNS.some((c) => c.id === edits.status)) {
      return NextResponse.json({ error: 'unknown status' }, { status: 400 })
    }
    if (edits.title !== undefined && !edits.title.trim()) {
      return NextResponse.json({ error: 'Назва не може бути порожньою' }, { status: 400 })
    }

    next = applyEdits(next, edits)
  }

  if (body.action === 'addNote') next = addNote(next, body.text, new Date().toISOString())
  if (body.action === 'removeNote') next = removeNote(next, body.id)

  const updated = [...projects]
  updated[index] = next
  writeProjects(updated)

  return NextResponse.json({ ok: true, project: next })
}
