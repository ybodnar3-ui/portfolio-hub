import fs from 'node:fs'
import path from 'node:path'

const DATA = path.join(process.cwd(), 'data', 'projects.json')
const TIMEOUT_MS = 10_000

const projects = JSON.parse(fs.readFileSync(DATA, 'utf8'))

async function check(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    return res.ok ? 'ok' : 'broken'
  } catch {
    return 'broken'
  } finally {
    clearTimeout(timer)
  }
}

for (const project of projects) {
  if (!project.liveUrl) {
    project.health = 'unknown'
    continue
  }
  project.health = await check(project.liveUrl)
  const mark = project.health === 'ok' ? '✓' : '✗'
  console.log(`${mark} ${project.slug} — ${project.liveUrl}`)
}

fs.writeFileSync(DATA, JSON.stringify(projects, null, 2) + '\n')

const broken = projects.filter((p) => p.health === 'broken')
console.log(broken.length ? `\nЗламано: ${broken.map((p) => p.slug).join(', ')}` : '\nВсе живе.')
