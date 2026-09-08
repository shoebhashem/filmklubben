import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { movieId, sessionId, rating } = await req.json()

  if (!movieId || !sessionId || typeof rating !== 'number') {
    return NextResponse.json({ error: 'Ogiltiga fält' }, { status: 400 })
  }
  if (rating < 1 || rating > 10) {
    return NextResponse.json({ error: 'Betyg måste vara mellan 1 och 10' }, { status: 400 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  const ipHash = createHash('sha256').update(ip).digest('hex')

  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      { movie_id: movieId, session_id: sessionId, rating, ip_hash: ipHash, updated_at: new Date().toISOString() },
      { onConflict: 'movie_id,session_id' },
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const movieId = searchParams.get('movieId')
  const sessionId = searchParams.get('sessionId')

  if (!movieId || !sessionId) {
    return NextResponse.json({ error: 'movieId och sessionId krävs' }, { status: 400 })
  }

  const { data } = await supabase
    .from('ratings')
    .select('rating')
    .eq('movie_id', movieId)
    .eq('session_id', sessionId)
    .maybeSingle()

  return NextResponse.json({ rating: data?.rating ?? null })
}
