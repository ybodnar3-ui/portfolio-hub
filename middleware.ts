import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.cookies.get('lab')?.value === '1') return NextResponse.next()
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

/* Публічної частини більше немає — закритий весь хаб.
   Виняток тільки для /login, статики й /api/login: інакше не було б
   де ввести пароль. */
export const config = {
  matcher: ['/((?!login|api/login|_next|favicon.ico|features|shots).*)'],
}
