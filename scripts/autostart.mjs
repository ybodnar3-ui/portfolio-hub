#!/usr/bin/env node
/**
 * Автозапуск хаба через launchd.
 *
 *   node scripts/autostart.mjs install     поставити й запустити
 *   node scripts/autostart.mjs uninstall   зупинити й прибрати
 *   node scripts/autostart.mjs status      подивитись стан
 *
 * Чому саме `next dev`, а не продакшн-збірка: усі роути запису перевіряють
 * `NODE_ENV !== 'production'`. `next start` виставляє production примусово,
 * тобто в постійно запущеному хабі не працювали б ні таймер, ні редагування.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const LABEL = 'com.ybodnar.portfolio-hub'
const PORT = process.env.HUB_PORT ?? '3007'
const ROOT = path.resolve(import.meta.dirname, '..')
const AGENTS = path.join(os.homedir(), 'Library', 'LaunchAgents')
const PLIST = path.join(AGENTS, `${LABEL}.plist`)
const LOGS = path.join(ROOT, 'logs')
const TARGET = `gui/${process.getuid()}`

const plist = () => `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>WorkingDirectory</key><string>${ROOT}</string>

  <!-- Через логін-шелл, щоб підхопився PATH з node і npm. -->
  <key>ProgramArguments</key>
  <array>
    <string>/bin/sh</string>
    <string>-lc</string>
    <string>exec npm run dev -- -p ${PORT}</string>
  </array>

  <key>RunAtLoad</key><true/>
  <!-- Піднімати назад, якщо процес упав. -->
  <key>KeepAlive</key><true/>
  <!-- Щоб не крутити рестарт у циклі, коли щось справді зламано. -->
  <key>ThrottleInterval</key><integer>15</integer>

  <key>StandardOutPath</key><string>${path.join(LOGS, 'hub.log')}</string>
  <key>StandardErrorPath</key><string>${path.join(LOGS, 'hub.err.log')}</string>
</dict>
</plist>
`

const launchctl = (...args) => {
  try {
    return execFileSync('launchctl', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  } catch (error) {
    return error.stdout ?? error.message ?? ''
  }
}

const loaded = () => launchctl('print', `${TARGET}/${LABEL}`).includes(LABEL)

function install() {
  fs.mkdirSync(AGENTS, { recursive: true })
  fs.mkdirSync(LOGS, { recursive: true })

  if (loaded()) launchctl('bootout', `${TARGET}/${LABEL}`)
  fs.writeFileSync(PLIST, plist())
  launchctl('bootstrap', TARGET, PLIST)
  launchctl('kickstart', `${TARGET}/${LABEL}`)

  console.log('Поставлено:', PLIST)
  console.log(`Хаб підніматиметься сам при вході в систему, на http://localhost:${PORT}`)
  console.log('Логи:', path.join(LOGS, 'hub.log'))
  console.log('\nПрибрати: npm run autostart:uninstall')
}

function uninstall() {
  if (loaded()) launchctl('bootout', `${TARGET}/${LABEL}`)
  if (fs.existsSync(PLIST)) fs.unlinkSync(PLIST)
  console.log('Автозапуск прибрано. Сам сервер, якщо він зараз працює, зупиниться.')
}

function status() {
  if (!fs.existsSync(PLIST)) return console.log('Автозапуск не встановлений.')
  const info = launchctl('print', `${TARGET}/${LABEL}`)
  const pid = info.match(/pid = (\d+)/)?.[1]
  const state = info.match(/state = (\w+)/)?.[1]
  console.log('Встановлений:', PLIST)
  console.log('Стан:', state ?? 'невідомо', pid ? `(pid ${pid})` : '')
}

const command = process.argv[2]
if (command === 'install') install()
else if (command === 'uninstall') uninstall()
else if (command === 'status') status()
else {
  console.log('Використання: node scripts/autostart.mjs install | uninstall | status')
  process.exit(1)
}
