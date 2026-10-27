import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const { error } = await supabase.from('movies').select('id').limit(1)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, {
      status: 500,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  return NextResponse.json({ ok: true, ts: new Date().toISOString() }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
