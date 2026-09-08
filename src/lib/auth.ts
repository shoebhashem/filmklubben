import { SignJWT, jwtVerify } from 'jose'
import { NextRequest } from 'next/server'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(secret)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function requireAdmin(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return false
  return verifyAdminToken(auth.slice(7))
}
