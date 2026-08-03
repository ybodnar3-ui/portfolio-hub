'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { TimeData } from '@/lib/types'
import { isLongSession, minutesBetween } from '@/lib/time'
import { LongSessionDialog } from './long-session-dialog'

/**
 * Один стан таймера на весь застосунок.
 *
 * Провайдера немає в списку файлів ТЗ, але без нього кнопка на картці й HUD
 * у шапці опитували б сервер кожен окремо й показували б розбіжні дані.
 * Інваріант «один таймер» має бути видимий однаково скрізь, а не тільки
 * дотриманий на сервері. Тут же живе єдиний екземпляр діалогу довгої сесії —
 * інакше його могли б відкрити двічі.
 */

interface TimerContext {
  data: TimeData | null
  /** Тікає раз на секунду, поки таймер запущено. */
  now: number
  start: (projectSlug: string) => Promise<void>
  /** Назва потрібна лише щоб діалог довгої сесії було про що написати. */
  requestStop: (projectTitle: string) => Promise<void>
}

const Ctx = createContext<TimerContext | null>(null)

export function useTimer(): TimerContext {
  const value = useContext(Ctx)
  if (!value) throw new Error('useTimer поза TimerProvider')
  return value
}

interface Pending {
  projectTitle: string
  startedAt: string
  measuredMinutes: number
}

export function TimerProvider({
  titles,
  children,
}: {
  /** slug → назва. Потрібна діалогу забутого таймера: він спрацьовує сам,
      без картки поруч, і має чим назвати проєкт. */
  titles: Record<string, string>
  children: React.ReactNode
}) {
  const router = useRouter()
  const [data, setData] = useState<TimeData | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [pending, setPending] = useState<Pending | null>(null)
  const [dayChecked, setDayChecked] = useState(false)

  const running = data?.running ?? null

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/time')
      if (response.ok) setData(await response.json())
    } catch {
      // Мовчки: без даних таймера сторінка лишається робочою.
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Годинник тікає тільки коли є що рахувати.
  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  const send = useCallback(
    async (body: unknown) => {
      const response = await fetch('/api/time', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (response.ok) {
        setData(await response.json())
        router.refresh()
      }
    },
    [router],
  )

  const start = useCallback(
    async (projectSlug: string) => {
      await send({ action: 'start', projectSlug })
    },
    [send],
  )

  const requestStop = useCallback(
    async (projectTitle: string) => {
      if (!running) return
      const measured = minutesBetween(running.startedAt, new Date().toISOString())

      // Довгу сесію не пишемо мовчки — питаємо, скільки з неї справді робота.
      if (isLongSession(measured)) {
        setPending({ projectTitle, startedAt: running.startedAt, measuredMinutes: measured })
        return
      }
      await send({ action: 'stop' })
    },
    [running, send],
  )

  // Таймер, забутий з попереднього календарного дня, ловимо при відкритті хаба.
  useEffect(() => {
    if (!running || dayChecked) return
    setDayChecked(true)

    const started = new Date(running.startedAt)
    const today = new Date()
    const sameDay =
      started.getFullYear() === today.getFullYear() &&
      started.getMonth() === today.getMonth() &&
      started.getDate() === today.getDate()

    if (sameDay) return

    setPending({
      projectTitle: titles[running.projectSlug] ?? running.projectSlug,
      startedAt: running.startedAt,
      measuredMinutes: minutesBetween(running.startedAt, today.toISOString()),
    })
  }, [running, dayChecked, titles])

  return (
    <Ctx.Provider value={{ data, now, start, requestStop }}>
      {children}
      {pending && (
        <LongSessionDialog
          projectTitle={pending.projectTitle}
          startedAt={pending.startedAt}
          measuredMinutes={pending.measuredMinutes}
          onWrite={async (minutes) => {
            await send({ action: 'stop', overrideMinutes: minutes })
            setPending(null)
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </Ctx.Provider>
  )
}
