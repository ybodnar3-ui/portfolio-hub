import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { mergeProjects } from '../lib/merge.mjs'

const ROOT = process.env.SCAN_ROOT ?? path.join(os.homedir(), 'Claude')
const DATA = path.join(process.cwd(), 'data', 'projects.json')
const SKIP = new Set(['docs', 'portfolio', 'node_modules', 'aquastar-backup'])

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

function isoDate(value) {
  return new Date(value).toISOString().slice(0, 10)
}

function discover() {
  const found = []
  for (const name of fs.readdirSync(ROOT)) {
    if (name.startsWith('.') || SKIP.has(name)) continue
    const full = path.join(ROOT, name)
    if (!fs.statSync(full).isDirectory()) continue

    const pkg = readJson(path.join(full, 'package.json'))
    const vercel = readJson(path.join(full, '.vercel', 'project.json'))
    const handoff = readJson(path.join(full, '.planning', 'HANDOFF.json'))

    const touched = handoff?.timestamp
      ? isoDate(handoff.timestamp)
      : isoDate(fs.statSync(full).mtime)

    found.push({
      slug: name,
      title: name,
      localPath: `~/Claude/${name}`,
      stack: pkg ? Object.keys(pkg.dependencies ?? {}).slice(0, 5) : [],
      liveUrl: vercel?.projectName ? `https://${vercel.projectName}.vercel.app` : null,
      lastTouched: touched,
    })
  }
  return found
}

const existing = readJson(DATA) ?? []
const merged = mergeProjects(existing, discover())

fs.writeFileSync(DATA, JSON.stringify(merged, null, 2) + '\n')

const added = merged.length - existing.length
console.log(`Проєктів: ${merged.length} (нових: ${added})`)
