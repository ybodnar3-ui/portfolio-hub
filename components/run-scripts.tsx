'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SCRIPTS = [
  { name: 'scan', label: 'Сканувати диск', hint: 'знайти нові проєкти' },
  { name: 'health', label: 'Перевірити посилання', hint: 'чи живі live URL' },
  { name: 'shots', label: 'Зняти екрани', hint: 'довго: запускає браузер' },
] as const

export function RunScripts() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState<string | null>(null)
  const [result, setResult] = useState<{ ok: boolean; label: string; output: string } | null>(null)

  async function run(name: string) {
    setRunning(name)
    setResult(null)
    try {
      const response = await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await response.json()
      setResult({ ok: !!data.ok, label: data.label ?? name, output: data.output ?? data.error ?? '' })
      if (data.ok) router.refresh()
    } catch {
      setResult({ ok: false, label: name, output: 'Не вдалось достукатись до сервера' })
    } finally {
      setRunning(null)
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="btn btn-default">
        Оновити з диска
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/25 p-6 backdrop-blur-sm">
      <div className="card w-full max-w-lg p-6 shadow-[var(--shadow-md)]">
        <h2 className="text-lg">Оновити з диска</h2>
        <p className="mt-1 text-sm text-muted">
          Те саме, що <code className="rounded bg-raised px-1 font-mono text-[0.8125rem]">npm run …</code> у
          терміналі. Скрипти не чіпають написане руками.
        </p>

        <ul className="mt-5 space-y-2">
          {SCRIPTS.map((script) => (
            <li key={script.name} className="flex items-center justify-between gap-4">
              <span className="text-sm">
                {script.label}
                <span className="ml-2 text-faint">{script.hint}</span>
              </span>
              <button
                type="button"
                onClick={() => run(script.name)}
                disabled={running !== null}
                className="btn btn-sm btn-soft shrink-0"
              >
                {running === script.name ? 'Виконую…' : 'Запустити'}
              </button>
            </li>
          ))}
        </ul>

        {result && (
          <div className="mt-5">
            <p className={`text-sm font-medium ${result.ok ? 'text-accent' : 'text-broken'}`}>
              {result.label} — {result.ok ? 'готово' : 'впало'}
            </p>
            <pre className="mt-2 max-h-56 overflow-auto rounded-[var(--radius-sm)] bg-raised p-3 font-mono text-xs leading-relaxed text-ink/85">
              {result.output || '(без виводу)'}
            </pre>
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={running !== null}
            className="btn btn-default"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  )
}
