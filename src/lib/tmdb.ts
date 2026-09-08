import { MovieMetadata } from '@/types'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780'
const API_KEY = process.env.TMDB_API_KEY!

function extractImdbId(url: string): string | null {
  const match = url.match(/imdb\.com\/title\/(tt\d+)/)
  return match ? match[1] : null
}

function extractTmdbId(url: string): string | null {
  const match = url.match(/themoviedb\.org\/movie\/(\d+)/)
  return match ? match[1] : null
}

async function fetchTmdbMovie(tmdbId: string): Promise<MovieMetadata> {
  const res = await fetch(
    `${TMDB_BASE}/movie/${tmdbId}?api_key=${API_KEY}&append_to_response=credits&language=sv-SE`,
  )
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  const data = await res.json()

  const director =
    data.credits?.crew?.find((c: { job: string; name: string }) => c.job === 'Director')?.name ?? null

  const cast_members: string[] =
    data.credits?.cast
      ?.slice(0, 6)
      .map((c: { name: string }) => c.name) ?? []

  return {
    title: data.title,
    cover_image: data.poster_path ? `${TMDB_IMAGE_BASE}${data.poster_path}` : null,
    synopsis: data.overview || null,
    genres: (data.genres ?? []).map((g: { name: string }) => g.name),
    director,
    cast_members,
    release_year: data.release_date ? parseInt(data.release_date.slice(0, 4)) : null,
    runtime: data.runtime || null,
    tmdb_id: String(data.id),
  }
}

export async function extractFromTmdbOrImdb(url: string): Promise<MovieMetadata | null> {
  const tmdbId = extractTmdbId(url)
  if (tmdbId) return fetchTmdbMovie(tmdbId)

  const imdbId = extractImdbId(url)
  if (imdbId) {
    const findRes = await fetch(
      `${TMDB_BASE}/find/${imdbId}?api_key=${API_KEY}&external_source=imdb_id`,
    )
    if (!findRes.ok) return null
    const findData = await findRes.json()
    const movie = findData.movie_results?.[0]
    if (!movie) return null
    return fetchTmdbMovie(String(movie.id))
  }

  return null
}

export function isTmdbCompatibleUrl(url: string): boolean {
  return url.includes('imdb.com') || url.includes('themoviedb.org')
}
