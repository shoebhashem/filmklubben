'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Trash2, Plus, LogOut, Loader2, ExternalLink } from 'lucide-react'
import { getAdminToken, clearAdminToken } from '@/lib/session'
import { MovieWithRating } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminPage() {
  const router = useRouter()
  const [movies, setMovies] = useState<MovieWithRating[]>([])
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const authHeaders = useCallback(() => {
    const token = getAdminToken()
    return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  }, [])

  useEffect(() => {
    const token = getAdminToken()
    if (!token) {
      router.replace('/admin/login')
      return
    }
    loadMovies()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadMovies() {
    setLoading(true)
    const data = await fetch('/api/movies').then((r) => r.json())
    setMovies(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function addMovie(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setAdding(true)
    setAddError('')

    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) {
          clearAdminToken()
          router.replace('/admin/login')
          return
        }
        setAddError(data.error ?? 'Kunde inte lägga till film')
        return
      }

      setUrl('')
      await loadMovies()
    } catch {
      setAddError('Nätverksfel — försök igen')
    } finally {
      setAdding(false)
    }
  }

  async function deleteMovie(id: string) {
    setDeleteId(id)
    try {
      const res = await fetch(`/api/movies/${id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (res.status === 401) {
        clearAdminToken()
        router.replace('/admin/login')
        return
      }
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.id !== id))
      }
    } finally {
      setDeleteId(null)
    }
  }

  function logout() {
    clearAdminToken()
    router.push('/')
  }

  return (
    <main className="min-h-dvh bg-zinc-950 text-white px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Admin</h1>
          <p className="text-zinc-500 text-sm">Filmklubben</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/"
            className="inline-flex items-center px-3 py-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            ← Webbplatsen
          </a>
          <Button onClick={logout} variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            <LogOut size={15} className="mr-1.5" />
            Logga ut
          </Button>
        </div>
      </div>

      <section className="bg-zinc-900 rounded-2xl p-5 mb-8">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Plus size={18} className="text-amber-400" />
          Lägg till film
        </h2>
        <form onSubmit={addMovie} className="space-y-3">
          <div>
            <Label htmlFor="movie-url" className="text-zinc-400 text-sm">
              Film-URL (IMDb, TMDB eller annan sida)
            </Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="movie-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.imdb.com/title/tt0111161/"
                className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
              />
              <Button
                type="submit"
                disabled={adding || !url.trim()}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold whitespace-nowrap"
              >
                {adding ? (
                  <>
                    <Loader2 size={15} className="animate-spin mr-1.5" />
                    Hämtar…
                  </>
                ) : (
                  'Lägg till'
                )}
              </Button>
            </div>
          </div>
          {addError && <p className="text-red-400 text-sm">{addError}</p>}
          {adding && (
            <p className="text-zinc-500 text-xs">
              Hämtar filmdata — detta kan ta några sekunder…
            </p>
          )}
        </form>
      </section>

      <section>
        <h2 className="font-bold text-lg mb-4">
          Alla filmer{' '}
          <span className="text-zinc-500 font-normal text-sm">({movies.length})</span>
        </h2>

        {loading ? (
          <div className="text-zinc-500 text-sm">Laddar…</div>
        ) : movies.length === 0 ? (
          <div className="text-zinc-600 text-sm text-center py-8">
            Inga filmer tillagda ännu.
          </div>
        ) : (
          <div className="space-y-3">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="bg-zinc-900 rounded-xl p-3 flex items-center gap-3"
              >
                {movie.cover_image && (
                  <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image src={movie.cover_image} alt={movie.title} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{movie.title}</p>
                  <p className="text-zinc-500 text-xs">
                    {movie.release_year ?? '—'}
                    {movie.avg_rating !== null && ` · ★ ${movie.avg_rating}`}
                    {` · ${movie.rating_count} betyg`}
                  </p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <a
                    href={movie.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <button
                    onClick={() => deleteMovie(movie.id)}
                    disabled={deleteId === movie.id}
                    className="p-2 text-zinc-600 hover:text-red-400 transition-colors disabled:opacity-40"
                  >
                    {deleteId === movie.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
