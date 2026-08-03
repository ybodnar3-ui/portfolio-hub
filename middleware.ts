import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.cookies.get('lab')?.value === '1') return NextResponse.next()
  const url = request.nextUrl.clone()
  url.pathname = '/login'
  url.searchParams.set('from', request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

/* API-роути навмисно не в матчері: /api/login має бути доступним, щоб було
   де ввести пароль, а /api/board і /api/time закриті перевіркою на продакшн
   і працюють лише на localhost. */
export const config = { matcher: ['/lab/:path*', '/board'] }
