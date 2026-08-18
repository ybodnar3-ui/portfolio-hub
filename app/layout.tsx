import type { Metadata } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { TimerProvider } from '@/components/timer-provider'
import { getProjects } from '@/lib/data'

const display = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
})

const body = Manrope({
  variable: '--font-body',
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
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
      className={`${display.variable} ${body.variable} h-full antialiased`}
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
