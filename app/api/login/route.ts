import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const expected = process.env.LAB_PASSWORD
  if (!expected) {
    // Без цього незаданий env дає вічний 401 без жодного пояснення.
    return NextResponse.json(
      { ok: false, error: 'LAB_PASSWORD не заданий' },
      { status: 500 },
    )
  }

  const { password } = await request.json()
  if (password !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set('lab', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  return response
}
