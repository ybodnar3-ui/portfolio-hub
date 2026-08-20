#!/usr/bin/env node
/**
 * Таймер із терміналу — там, де ти реально працюєш.
 *
 *   t                    показати, що зараз іде
 *   t aqua               почати (нечіткий пошук за назвою й слагом)
 *   t stop               зупинити
 *   t stop 90            зупинити й записати 90 хвилин замість виміряних
 *   t add aqua 2.5 опис  записати 2,5 години заднім числом
 *   t ls                 останні сесії
 *
 * Ходить через API запущеного хаба, а не пише у файли напряму: інакше
 * відкрита вкладка показувала б застарілий стан.
 */
import fs from 'node:fs'
import path from 'node:path'

const PORT = process.env.HUB_PORT ?? '3007'
const BASE = `http://localhost:${PORT}`
const ROOT = path.resolve(import.meta.dirname, '..')

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  blue: (s) => `\x1b[34m${s}\x1b[0m`,
}

function projects() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'projects.json'), 'utf8'))
}

function formatDuration(minutes) {
  if (minutes <= 0) return '0 хв'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} хв`
  if (!m) return `${h} год`
  return `${h} год ${m} хв`
}

const since = (iso) => Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))

async function api(body) {
  let response
  try {
    response = await fetch(`${BASE}/api/time`, {
      method: body ? 'POST' : 'GET',
      headers: { 'content-type': 'application/json', cookie: 'lab=1' },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    console.error(c.red('Хаб не відповідає.'), c.dim(`Очікував на ${BASE}`))
    console.error(c.dim('Запусти: npm run dev -- -p ' + PORT))
    process.exit(1)
  }
  if (!response.ok) {
    const text = await response.text()
    console.error(c.red(`Помилка ${response.status}:`), text.slice(0, 200))
    process.exit(1)
  }
  return response.json()
}

/** Нечіткий пошук: спершу точний слаг, далі входження в слаг чи назву. */
function findProject(query) {
  const list = projects()
  const q = query.toLowerCase()

  const exact = list.find((p) => p.slug === q)
  if (exact) return exact

  const hits = list.filter(
    (p) => p.slug.toLowerCase().includes(q) || p.title.toLowerCase().includes(q),
  )
  if (hits.length === 1) return hits[0]

  if (hits.length === 0) {
    console.error(c.red(`Не знайшов проєкт «${query}».`))
  } else {
    console.error(c.red(`«${query}» підходить до кількох:`))
    for (const p of hits) console.error('  ', p.slug, c.dim('— ' + p.title))
  }
  process.exit(1)
}

const titleOf = (slug) => projects().find((p) => p.slug === slug)?.title ?? slug

async function status() {
  const data = await api()
  if (!data.running) {
    const today = new Date().toISOString().slice(0, 10)
    const mins = data.entries
      .filter((e) => e.startedAt.slice(0, 10) === today)
      .reduce((s, e) => s + e.minutes, 0)
    console.log(c.dim('Таймер не йде.'), mins ? c.dim(`Сьогодні записано ${formatDuration(mins)}.`) : '')
    return
  }
  const mins = since(data.running.startedAt)
  console.log(c.green('●'), c.bold(titleOf(data.running.projectSlug)), c.blue(formatDuration(mins)))
}

async function start(query) {
  const project = findProject(query)
  const before = await api()
  const data = await api({ action: 'start', projectSlug: project.slug })

  if (before.running && before.running.projectSlug !== project.slug) {
    const stopped = data.entries.at(-1)
    console.log(c.dim('Зупинив'), titleOf(before.running.projectSlug),
      c.dim(`— записано ${formatDuration(stopped?.minutes ?? 0)}`))
  }
  console.log(c.green('▶'), c.bold(project.title), c.dim('пішов'))
}

async function stop(override) {
  const before = await api()
  if (!before.running) {
    console.log(c.dim('Таймер і так не йде.'))
    return
  }
  const slug = before.running.projectSlug
  const data = await api({
    action: 'stop',
    ...(override !== undefined ? { overrideMinutes: override } : {}),
  })
  const entry = data.entries.at(-1)
  console.log(c.red('■'), c.bold(titleOf(slug)), c.blue(formatDuration(entry?.minutes ?? 0)),
    entry?.source === 'manual' ? c.dim('(вручну)') : '')
}

async function add(query, hoursRaw, ...noteParts) {
  const project = findProject(query)
  const hours = parseFloat(String(hoursRaw).replace(',', '.'))
  const minutes = Math.round(hours * 60)
  if (!Number.isFinite(minutes) || minutes <= 0) {
    console.error(c.red('Скільки годин? Наприклад: t add aqua 2.5 "форма"'))
    process.exit(1)
  }
  await api({
    action: 'addManual',
    projectSlug: project.slug,
    minutes,
    note: noteParts.join(' '),
    date: new Date().toISOString().slice(0, 10),
  })
  console.log(c.green('+'), c.bold(project.title), c.blue(formatDuration(minutes)), c.dim('записано'))
}

async function list() {
  const data = await api()
  const recent = [...data.entries].reverse().slice(0, 12)
  if (!recent.length) return console.log(c.dim('Сесій ще немає.'))
  for (const e of recent) {
    console.log(
      c.dim(e.startedAt.slice(0, 10)),
      titleOf(e.projectSlug).padEnd(28).slice(0, 28),
      c.blue(formatDuration(e.minutes).padStart(11)),
      c.dim(e.note || ''),
    )
  }
}

const [command, ...rest] = process.argv.slice(2)

if (!command) await status()
else if (command === 'stop') await stop(rest[0] ? Number(rest[0]) : undefined)
else if (command === 'ls') await list()
else if (command === 'add') await add(...rest)
else if (command === 'help' || command === '--help') {
  console.log(`  t                    що зараз іде
  t <проєкт>           почати
  t stop [хвилин]      зупинити
  t add <проєкт> <год> [опис]
  t ls                 останні сесії`)
} else await start(command)
