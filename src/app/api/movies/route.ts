import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getServiceClient, supabase } from '@/lib/supabase'
import { extractFromTmdbOrImdb, isTmdbCompatibleUrl } from '@/lib/tmdb'
import { extractMovieFromUrl } from '@/lib/ai-extract'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET() {
  const { data, error } = await supabase
    .from('movies_with_ratings')
    .select('*')
    .order('avg_rating', { ascending: false, nullsFirst: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, {
    headers: {
      // CDN caches for 60s; stale responses served for up to 5 min while revalidating in background
      'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
    },
  })
}

export async function POST(req: NextRequest) {
  const isAdmin = await requireAdmin(req)
  if (!isAdmin) return NextResponse.json({ error: 'Obehörig' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL krävs' }, { status: 400 })

  let metadata
  if (isTmdbCompatibleUrl(url)) {
    metadata = await extractFromTmdbOrImdb(url)
  }
  if (!metadata) {
    metadata = await extractMovieFromUrl(url)
  }

  const db = getServiceClient()
  const baseSlug = slugify(metadata.title)
  let slug = baseSlug
  let attempt = 0

  while (true) {
    const { data: existing } = await db
      .from('movies')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (!existing) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const { data, error } = await db
    .from('movies')
    .insert({ ...metadata, slug, source_url: url })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
