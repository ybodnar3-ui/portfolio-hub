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
      <form onSubmit={submit} className="card reveal w-full max-w-sm p-8">
        <p className="eyebrow">Внутрішній хаб</p>
        <h1 className="mt-3 text-3xl">Пароль</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Хаб закритий цілком. Це бар&apos;єр від випадкового відвідувача, не автентифікація.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
          aria-label="Пароль"
          aria-invalid={!!error}
          className="mt-7 w-full rounded-[var(--radius-sm)] border border-line-strong bg-surface px-3 py-2.5 text-base text-ink outline-none transition-colors duration-200 placeholder:text-faint focus:border-accent"
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
          className="btn btn-primary mt-6 w-full"
        >
          {busy ? 'Перевіряю…' : 'Увійти'}
        </button>
      </form>
    </main>
  )
}
