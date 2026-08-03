'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const from = params.get('from') ?? '/lab'

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        router.push(from)
        router.refresh()
        return
      }

      if (response.status === 401) {
        setError('Невірний пароль')
      } else {
        // Не помилка користувача, а незаповнений .env.local — кажемо прямо.
        const body = await response.json().catch(() => null)
        setError(body?.error ?? `Сервер відповів ${response.status}`)
      }
    } catch {
      setError('Не вдалось достукатись до сервера')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main
      className="flex flex-1 items-center justify-center py-32"
      style={{ paddingInline: 'var(--gutter)' }}
    >
      <form onSubmit={submit} className="reveal w-full max-w-sm">
        <p className="eyebrow">Приватна частина</p>
        <h1 className="mt-4 text-5xl">Пароль</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Lab і Дошка закриті. Це бар&apos;єр від випадкового відвідувача, не автентифікація.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          aria-label="Пароль"
          aria-invalid={!!error}
          className="mt-8 w-full border-b border-line-strong bg-transparent pb-3 text-lg text-ink outline-none transition-colors duration-300 placeholder:text-faint focus:border-accent"
          placeholder="••••••••"
        />

        {error && (
          <p role="alert" className="mt-3 text-sm text-broken">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || !password}
          className="mt-8 w-full border border-line-strong px-6 py-3 text-sm tracking-[0.08em] text-ink transition-colors duration-300 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line-strong disabled:hover:text-ink"
        >
          {busy ? 'Перевіряю…' : 'Увійти'}
        </button>
      </form>
    </main>
  )
}
