'use client'

import { useEffect, useRef, useState } from 'react'

const HOVER_TARGETS = '[data-cursor="hover"], a, button, input, select, textarea'

/**
 * Кільце, що доганяє курсор, і точка, прибита до нього.
 * Не рендериться на дотику. При prefers-reduced-motion кільце
 * не згладжується — їде рівно за вказівником.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false)
  const ring = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return
    setEnabled(true)
    document.documentElement.classList.add('has-cursor')
    return () => document.documentElement.classList.remove('has-cursor')
  }, [])

  useEffect(() => {
    if (!enabled) return

    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = { x: 0, y: 0 }
    const eased = { x: 0, y: 0 }
    let live = false
    let hovering = false
    let frame = 0

    function place(node: HTMLDivElement | null, x: number, y: number) {
      if (node) node.style.transform = `translate3d(${x}px, ${y}px, 0)`
    }

    function onMove(event: MouseEvent) {
      target.x = event.clientX
      target.y = event.clientY
      place(dot.current, target.x, target.y)
      if (!smooth) place(ring.current, target.x, target.y)

      if (!live) {
        // Перший рух: ставимо кільце на місце й аж тоді показуємо, щоб
        // воно не мигнуло в лівому верхньому куті.
        eased.x = target.x
        eased.y = target.y
        place(ring.current, eased.x, eased.y)
        live = true
        if (ring.current) ring.current.style.opacity = '1'
        if (dot.current) dot.current.style.opacity = '1'
      }

      const over = !!(event.target as Element | null)?.closest?.(HOVER_TARGETS)
      if (over !== hovering) {
        hovering = over
        ring.current?.classList.toggle('is-hover', over)
      }
    }

    function tick() {
      if (live) {
        eased.x += (target.x - eased.x) * 0.18
        eased.y += (target.y - eased.y) * 0.18
        place(ring.current, eased.x, eased.y)
      }
      frame = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    if (smooth) frame = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden />
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  )
}
