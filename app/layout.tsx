import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { TimerProvider } from '@/components/timer-provider'
import { getProjects } from '@/lib/data'

/* Один шрифт на весь інтерфейс. Inter зроблений саме під екранні UI:
   великий x-height, чіткі форми на дрібних кеглях і повна кирилиця.
   Заголовки відрізняються вагою й розміром, а не іншою гарнітурою. */
const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

/* Моноширинний тільки там, де він щось означає: код і стек. */
const mono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Хаб — внутрішній',
  description: 'Внутрішній інструмент: дошка стану проєктів, облік часу і бібліотека фіч.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const titles = Object.fromEntries(getProjects().map((p) => [p.slug, p.title]))

  return (
    <html
      lang="uk"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TimerProvider titles={titles}>
          <SiteHeader />
          {children}
        </TimerProvider>
      </body>
    </html>
  )
}
