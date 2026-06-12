import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin (login page) — always accessible
  if (pathname === '/admin') return NextResponse.next()

  // All other /admin/* pages require a valid session
  if (pathname.startsWith('/admin/')) {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Admin API routes — return 401 if not authenticated
  if (pathname.startsWith('/api/admin/') && !pathname.includes('/login')) {
    const token = request.cookies.get(COOKIE_NAME)?.value
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
