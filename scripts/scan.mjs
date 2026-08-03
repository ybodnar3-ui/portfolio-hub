import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { mergeProjects } from '../lib/merge.mjs'

/**
 * Шукає проєкти на диску. Коренів кілька, бо робота розкидана: лендінги лежать
 * у ~/Claude, а репозиторії — просто в домашній папці, часто вкладені двічі
 * (~/some-project/some-project після clone).
 */
const HOME = os.homedir()
const ROOTS = (process.env.SCAN_ROOTS ?? `${HOME}:${path.join(HOME, 'Claude')}`)
  .split(':')
  .filter(Boolean)

const DATA = path.join(process.cwd(), 'data', 'projects.json')
const MAX_DEPTH = 2

/** Системні папки, бекапи й сам хаб. */
const SKIP = new Set([
  'node_modules', 'docs', 'portfolio', 'portfolio-hub', 'aquastar-backup',
  'Library', 'Applications', 'Desktop', 'Documents', 'Downloads', 'Movies',
  'Music', 'Pictures', 'Public', 'Movies', 'Sites', 'Claude',
])

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

function isoDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

/** Дата останнього коміту точніша за mtime: touch файлу не міняє її. */
function lastCommitDate(dir) {
  try {
    return execFileSync('git', ['-C', dir, 'log', '-1', '--format=%cs'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

function remoteUrl(dir) {
  try {
    return execFileSync('git', ['-C', dir, 'remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

function looksLikeProject(dir) {
  return ['.git', 'package.json', 'requirements.txt', 'pyproject.toml', 'index.html']
    .some((marker) => fs.existsSync(path.join(dir, marker)))
}

const normalize = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, '')

/**
 * На другому рівні приймаємо тільки подвійне вкладення після `git clone`
 * (`~/some-project/some-project`). Інакше в улов потрапляють внутрішні папки
 * уже відомих проєктів — `medcentar/landing`, `medcentar/site` тощо.
 * Порівняння нестроге: буває `best_secret_scraper/best_secret_scraping`
 * і `restaurant-pwa /restaurant-pwa` з пробілом у назві.
 */
function isCloneWrapper(parentName, childName) {
  const parent = normalize(parentName)
  const child = normalize(childName)
  return parent.startsWith(child) || child.startsWith(parent)
}

function stackOf(dir) {
  const pkg = readJson(path.join(dir, 'package.json'))
  if (pkg) return Object.keys(pkg.dependencies ?? {}).slice(0, 6)

  const requirements = path.join(dir, 'requirements.txt')
  if (fs.existsSync(requirements)) {
    return fs.readFileSync(requirements, 'utf8')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split(/[=<>~[]/)[0].trim())
      .filter(Boolean)
      .slice(0, 6)
  }
  return []
}

function describe(dir, name) {
  const vercel = readJson(path.join(dir, '.vercel', 'project.json'))
  const handoff = readJson(path.join(dir, '.planning', 'HANDOFF.json'))

  const touched =
    lastCommitDate(dir) ||
    (handoff?.timestamp ? isoDate(handoff.timestamp) : '') ||
    isoDate(fs.statSync(dir).mtime)

  return {
    slug: name,
    repo: name,
    title: name,
    localPath: dir.replace(HOME, '~'),
    stack: stackOf(dir),
    liveUrl: vercel?.projectName ? `https://${vercel.projectName}.vercel.app` : null,
    remote: remoteUrl(dir),
    lastTouched: touched,
  }
}

function walk(root, depth, found, seen) {
  if (depth > MAX_DEPTH) return
  let names
  try { names = fs.readdirSync(root) } catch { return }

  for (const name of names) {
    if (name.startsWith('.') || SKIP.has(name)) continue
    const full = path.join(root, name)

    let stat
    try { stat = fs.statSync(full) } catch { continue }
    if (!stat.isDirectory()) continue

    const nested = depth > 1
    if (looksLikeProject(full) && (!nested || isCloneWrapper(path.basename(root), name))) {
      if (!seen.has(name)) {
        seen.add(name)
        found.push(describe(full, name))
      }
      continue
    }

    if (!nested) walk(full, depth + 1, found, seen)
  }
}

function discover() {
  const found = []
  const seen = new Set()
  for (const root of ROOTS) {
    // ~/Claude сканується як корінь окремо, тому в SKIP він є для домашньої папки.
    walk(root, root === path.join(HOME, 'Claude') ? MAX_DEPTH - 1 : 1, found, seen)
  }
  return found
}

const existing = readJson(DATA) ?? []
const discovered = discover()
const merged = mergeProjects(existing, discovered)

fs.writeFileSync(DATA, JSON.stringify(merged, null, 2) + '\n')

const added = merged.length - existing.length
console.log(`Знайдено на диску: ${discovered.length}`)
console.log(`Проєктів у портфоліо: ${merged.length} (нових: ${added})`)

if (added > 0) {
  const known = new Set(existing.map((p) => p.repo || p.slug))
  const fresh = merged.filter((p) => !known.has(p.repo || p.slug))
  console.log(`\nНові картки (origin: practice, статус idea — підвищуй руками):`)
  for (const project of fresh) console.log(`  · ${project.slug}`)
}
