'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', label: 'Роботи' },
  { href: '/lab', label: 'Lab' },
  { href: '/board', label: 'Дошка' },
]

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-[color-mix(in_oklab,var(--bg)_82%,transparent)] backdrop-blur-xl">
      <div
        className="flex items-center justify-between gap-6 py-4"
        style={{ paddingInline: 'var(--gutter)' }}
      >
        <Link
          href="/"
          className="font-serif text-lg tracking-tight text-ink"
          aria-label="На головну"
        >
          Portfolio<span className="text-accent">.</span>
        </Link>

        <nav aria-label="Основна навігація">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-active={active}
                    aria-current={active ? 'page' : undefined}
                    className={`link-underline text-[0.8125rem] tracking-[0.06em] transition-colors duration-300 ${
                      active
                        ? 'text-ink'
                        : 'text-muted hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Слот під <TimerHud /> — заповнюється в Задачі 17 */}
        <div className="hidden min-w-0 justify-end sm:flex sm:basis-40" />
      </div>
    </header>
  )
}
