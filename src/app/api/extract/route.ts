import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { extractFromTmdbOrImdb, isTmdbCompatibleUrl } from '@/lib/tmdb'
import { extractMovieFromUrl } from '@/lib/ai-extract'

export async function POST(req: NextRequest) {
  const isAdmin = await requireAdmin(req)
  if (!isAdmin) return NextResponse.json({ error: 'Obehörig' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL krävs' }, { status: 400 })

  try {
    let metadata = null

    if (isTmdbCompatibleUrl(url)) {
      metadata = await extractFromTmdbOrImdb(url)
    }

    if (!metadata) {
      metadata = await extractMovieFromUrl(url)
    }

    return NextResponse.json(metadata)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Okänt fel'
    return NextResponse.json({ error: `Kunde inte extrahera filmdata: ${message}` }, { status: 500 })
  }
}
