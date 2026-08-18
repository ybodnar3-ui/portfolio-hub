'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TimerHud } from './timer-hud'

const NAV = [
  { href: '/', label: 'Дошка' },
  { href: '/lab', label: 'Lab' },
]

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' || pathname.startsWith('/work') : pathname.startsWith(href)
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-md">
      <div
        className="flex items-center gap-8 py-3"
        style={{ paddingInline: 'var(--gutter)' }}
      >
        <Link href="/" className="text-[0.9375rem] font-semibold text-ink" aria-label="На дошку">
          Хаб<span className="text-accent">.</span>
        </Link>

        <nav aria-label="Основна навігація" className="flex-1">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex rounded-[var(--radius-sm)] px-3 py-1.5 text-sm transition-colors duration-200 ${
                      active
                        ? 'bg-accent-soft font-medium text-accent'
                        : 'text-muted hover:bg-raised hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <TimerHud />
      </div>
    </header>
  )
}
