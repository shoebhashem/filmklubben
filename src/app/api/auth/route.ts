import { NextRequest, NextResponse } from 'next/server'
import { signAdminToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (!password) {
    return NextResponse.json({ error: 'Lösenord krävs' }, { status: 400 })
  }

  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json({ error: 'Serverkonfigurationsfel' }, { status: 500 })
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Felaktigt lösenord' }, { status: 401 })
  }

  const token = await signAdminToken()
  return NextResponse.json({ token })
}
