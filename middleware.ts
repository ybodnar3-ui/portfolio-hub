import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.cookies.get('lab')?.value === '1') return NextResponse.next()

  /* API відповідає кодом, а не редіректом. Інакше POST на /api/… їхав би
     на /login, який POST не приймає, і клієнт отримував би 405 —
     повідомлення, з якого неможливо зрозуміти, що бракує саме входу. */
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Потрібен вхід' }, { status: 401 })
  }

  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

/* Публічної частини більше немає — закритий весь хаб.
   Виняток тільки для /login, /api/login і статики: інакше не було б
   де ввести пароль. */
export const config = {
  matcher: ['/((?!login|api/login|_next|favicon.ico|features|shots).*)'],
}
