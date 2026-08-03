import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

const DATA = path.join(process.cwd(), 'data', 'projects.json')
const OUT = path.join(process.cwd(), 'public', 'shots')

fs.mkdirSync(OUT, { recursive: true })

/** Розгортає ~ і знаходить HTML: сам файл, або index.html усередині папки. */
function localTarget(localPath) {
  if (!localPath) return null
  const full = localPath.replace(/^~/, os.homedir())
  if (!fs.existsSync(full)) return null
  if (full.endsWith('.html')) return full
  const index = path.join(full, 'index.html')
  return fs.existsSync(index) ? index : null
}

/* Знімаємо тільки те, що має інтерфейс. Скрейпери й боти (kind: tool),
   презентації та звіти малюють свою картку без скріншота. */
const SHOOTABLE = new Set(['web', 'app'])

function resolveUrl(project) {
  if (!SHOOTABLE.has(project.kind)) return null
  if (project.liveUrl && project.health !== 'broken') return project.liveUrl
  const local = localTarget(project.localPath)
  return local ? pathToFileURL(local).href : null
}

const projects = JSON.parse(fs.readFileSync(DATA, 'utf8'))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

let taken = 0
for (const project of projects) {
  const url = resolveUrl(project)
  if (!url) {
    console.log(`— ${project.slug} — нема що знімати`)
    continue
  }
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 })
    await page.waitForTimeout(1500) // дати анімаціям появи відпрацювати
    await page.screenshot({
      path: path.join(OUT, `${project.slug}.webp`),
      type: 'webp',
      quality: 80,
    })
    taken++
    console.log(`✓ ${project.slug} — ${url.startsWith('file:') ? 'локально' : 'live'}`)
  } catch (error) {
    console.log(`✗ ${project.slug} — ${error.message}`)
  }
}

await browser.close()
console.log(`\nЗнято: ${taken}`)
