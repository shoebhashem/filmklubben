'use client'

import { useEffect, useState } from 'react'
import { MovieCarousel } from '@/components/MovieCarousel'
import { MovieDetail } from '@/components/MovieDetail'
import { MovieWithRating } from '@/types'
import { Skeleton } from '@/components/ui/skeleton'

export default function HomePage() {
  const [movies, setMovies] = useState<MovieWithRating[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<MovieWithRating | null>(null)

  useEffect(() => {
    const CACHE_KEY = 'filmklubben_movies_cache'
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        setMovies(JSON.parse(cached))
        setLoading(false)
      }
    } catch {
      // localStorage unavailable
    }

    fetch('/api/movies')
      .then((r) => r.json())
      .then((data) => {
        const movies = Array.isArray(data) ? data : []
        setMovies(movies)
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(movies)) } catch { /* ignore */ }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const topMovie = movies[0]

  return (
    <main className="min-h-dvh bg-zinc-950 text-white flex flex-col">
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">🎬 Filmklubben</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Vi tittar. Vi diskuterar. Vi betygsätter.</p>
        </div>
        <a href="/admin" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
          Admin
        </a>
      </header>

      {topMovie && (
        <div className="px-6 py-2 mb-2">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <div>
              <p className="text-amber-400 text-xs font-medium">Bäst betygsatt</p>
              <p className="text-white text-sm font-bold">{topMovie.title}</p>
            </div>
            {topMovie.avg_rating && (
              <span className="ml-auto text-amber-400 font-bold text-lg">{Number(topMovie.avg_rating).toFixed(1)}</span>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center py-4">
        {loading ? (
          <div className="flex gap-4 justify-center">
            <Skeleton className="rounded-2xl bg-zinc-800" style={{ width: 'min(72vw, 340px)', aspectRatio: '2/3' }} />
          </div>
        ) : (
          <MovieCarousel movies={movies} onSelectMovie={setSelected} />
        )}
      </div>

      <footer className="text-center pb-6 text-zinc-700 text-xs">
        {movies.length > 0 && `${movies.length} filmer sedda`}
      </footer>

      <MovieDetail
        movie={selected}
        onClose={() => setSelected(null)}
        onRatingUpdate={(movieId, avgRating, ratingCount) => {
          setMovies((prev) =>
            prev.map((m) => m.id === movieId ? { ...m, avg_rating: avgRating, rating_count: ratingCount } : m)
          )
        }}
      />
    </main>
  )
}
