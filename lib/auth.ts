/**
 * Auth helpers — use Web Crypto so they work in Edge (middleware)
 * AND in Node.js (API routes / Server Components).
 */

const COOKIE_NAME = 'admin_session'

// Hash a string with SHA-256 → hex string
async function sha256(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str)
  const buffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Returns the expected cookie value for the given password.
 * Cookie = SHA-256(password + AUTH_SECRET)
 */
export async function buildToken(password: string): Promise<string> {
  const secret = process.env.AUTH_SECRET || 'bayrem-default-secret'
  return sha256(password + secret)
}

/**
 * Verifies a token against the configured ADMIN_PASSWORD.
 */
export async function verifyToken(token: string): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD || 'bayrem2024'
  const expected = await buildToken(password)
  return token === expected
}

export { COOKIE_NAME }
