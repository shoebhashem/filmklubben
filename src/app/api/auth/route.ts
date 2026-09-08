import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signAdminToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password) {
    return NextResponse.json({ error: 'Lösenord krävs' }, { status: 400 })
  }

  const hash = process.env.ADMIN_PASSWORD_HASH
  if (!hash) {
    return NextResponse.json({ error: 'Serverkonfigurationsfel' }, { status: 500 })
  }

  const valid = await bcrypt.compare(password, hash)
  if (!valid) {
    return NextResponse.json({ error: 'Felaktigt lösenord' }, { status: 401 })
  }

  const token = await signAdminToken()
  return NextResponse.json({ token })
}
