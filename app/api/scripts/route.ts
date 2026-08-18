import { NextResponse } from 'next/server'
import { execFile } from 'node:child_process'
import path from 'node:path'
import { promisify } from 'node:util'

const run = promisify(execFile)

/**
 * Виконувати можна тільки те, що є в цьому списку. Імʼя скрипта приходить
 * з браузера, тому підставляти його в команду напряму не можна: список
 * перетворює довільний рядок на фіксований шлях.
 */
const SCRIPTS = {
  scan: { file: 'scan.mjs', label: 'Сканування диска', timeout: 120_000 },
  health: { file: 'health.mjs', label: 'Перевірка посилань', timeout: 180_000 },
  shots: { file: 'shots.mjs', label: 'Знімки екрана', timeout: 900_000 },
} as const

export type ScriptName = keyof typeof SCRIPTS

export async function POST(request: Request) {
  // Скрипти пишуть у data/ і ганяють Playwright — на проді їх бути не може.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'read-only' }, { status: 403 })
  }

  const { name } = (await request.json()) as { name?: string }
  const script = SCRIPTS[name as ScriptName]
  if (!script) {
    return NextResponse.json({ error: 'unknown script' }, { status: 400 })
  }

  const started = Date.now()
  try {
    const { stdout, stderr } = await run(
      process.execPath,
      [path.join(process.cwd(), 'scripts', script.file)],
      { cwd: process.cwd(), timeout: script.timeout, maxBuffer: 4 * 1024 * 1024 },
    )
    return NextResponse.json({
      ok: true,
      label: script.label,
      output: (stdout + stderr).trim(),
      seconds: Math.round((Date.now() - started) / 100) / 10,
    })
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; message?: string; killed?: boolean }
    return NextResponse.json(
      {
        ok: false,
        label: script.label,
        // Вивід віддаємо навіть коли впало: у ньому й лежить причина.
        output: ((e.stdout ?? '') + (e.stderr ?? '') || e.message || 'Невідома помилка').trim(),
        timedOut: e.killed === true,
      },
      { status: 500 },
    )
  }
}
