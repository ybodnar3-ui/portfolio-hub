'use client'

import { useState } from 'react'

/* Без бібліотеки підсвітки — вона тягне вагу заради косметики.
   Моноширинний шрифт і читабельні відступи достатні. */
export function CodePanel({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lines = code.split('\n').length

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3">
        <span className="num eyebrow">index.html · {lines} рядків</span>
        <button
          type="button"
          onClick={copy}
          className="btn btn-sm btn-quiet"
        >
          {copied ? 'Скопійовано' : 'Копіювати код'}
        </button>
      </div>
      <pre className="max-h-[60vh] overflow-auto bg-raised p-5 font-mono text-[0.8125rem] leading-relaxed text-ink/85">
        <code>{code}</code>
      </pre>
    </div>
  )
}
