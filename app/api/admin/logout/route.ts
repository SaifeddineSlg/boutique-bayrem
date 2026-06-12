import { type NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Redirect to login page after logout (works for HTML form submit)
  const response = NextResponse.redirect(new URL('/admin', request.url), { status: 303 })
  response.cookies.delete(COOKIE_NAME)
  return response
}
