import type { Metadata } from 'next'
import { Cormorant_Garamond, Manrope } from 'next/font/google'
import './globals.css'
import { CustomCursor } from '@/components/custom-cursor'
import { SiteHeader } from '@/components/site-header'

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
  title: 'Portfolio — Юра Боднар',
  description:
    'Усі vibe-coding проєкти в одному місці: вітрина робіт, бібліотека фіч і дошка стану.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="uk"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="grain flex min-h-full flex-col">
        <CustomCursor />
        <SiteHeader />
        {children}
      </body>
    </html>
  )
}
