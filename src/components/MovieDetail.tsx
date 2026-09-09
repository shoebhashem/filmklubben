'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Calendar, Film } from 'lucide-react'
import { MovieWithRating } from '@/types'
import { StarRating } from './StarRating'
import { getSessionId } from '@/lib/session'
import { Badge } from '@/components/ui/badge'

interface MovieDetailProps {
  movie: MovieWithRating | null
  onClose: () => void
  onRatingUpdate?: (movieId: string, avgRating: number | null, ratingCount: number) => void
}

export function MovieDetail({ movie, onClose, onRatingUpdate }: MovieDetailProps) {
  const [myRating, setMyRating] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [avgRating, setAvgRating] = useState<number | null>(null)
  const [ratingCount, setRatingCount] = useState(0)

  useEffect(() => {
    if (!movie) return
    setAvgRating(movie.avg_rating)
    setRatingCount(movie.rating_count)
    setSubmitted(false)
    setMyRating(null)

    const sessionId = getSessionId()
    fetch(`/api/ratings?movieId=${movie.id}&sessionId=${sessionId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.rating !== null) {
          setMyRating(d.rating)
          setSubmitted(true)
        }
      })
      .catch(() => {})
  }, [movie])

  async function submitRating(rating: number) {
    if (!movie) return
    setMyRating(rating)
    setSubmitting(true)
    try {
      const sessionId = getSessionId()
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: movie.id, sessionId, rating }),
      })
      if (res.ok) {
        setSubmitted(true)
        const refreshed = await fetch(`/api/movies/${movie.id}`).then((r) => r.json())
        setAvgRating(refreshed.avg_rating)
        setRatingCount(refreshed.rating_count)
        onRatingUpdate?.(movie.id, refreshed.avg_rating, refreshed.rating_count)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {movie && (
        <motion.div
          key="backdrop"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          <motion.div
            key="panel"
            className="relative z-10 bg-zinc-900 w-full sm:max-w-lg sm:rounded-2xl overflow-hidden max-h-[92dvh] flex flex-col"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-56 sm:h-72 flex-shrink-0">
              {movie.cover_image ? (
                <Image src={movie.cover_image} alt={movie.title} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-6xl">🎬</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 rounded-full p-2 text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              <h2 className="text-white text-2xl font-bold leading-tight mb-2">{movie.title}</h2>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.release_year && (
                  <span className="flex items-center gap-1 text-zinc-400 text-sm">
                    <Calendar size={13} />
                    {movie.release_year}
                  </span>
                )}
                {movie.runtime && (
                  <span className="flex items-center gap-1 text-zinc-400 text-sm">
                    <Clock size={13} />
                    {movie.runtime} min
                  </span>
                )}
                {movie.director && (
                  <span className="flex items-center gap-1 text-zinc-400 text-sm">
                    <Film size={13} />
                    {movie.director}
                  </span>
                )}
              </div>

              {movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {movie.genres.map((g) => (
                    <Badge key={g} variant="secondary" className="bg-zinc-800 text-zinc-300 text-xs">
                      {g}
                    </Badge>
                  ))}
                </div>
              )}

              {movie.synopsis && (
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">{movie.synopsis}</p>
              )}

              {movie.cast_members.length > 0 && (
                <p className="text-zinc-500 text-xs mb-6">
                  <span className="text-zinc-400">Skådespelare: </span>
                  {movie.cast_members.join(', ')}
                </p>
              )}

              <div className="border-t border-zinc-800 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-zinc-400 text-sm">Klubbens betyg</span>
                  {avgRating !== null ? (
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span className="text-amber-400 font-bold">{avgRating}</span>
                      <span className="text-zinc-500 text-xs">({ratingCount})</span>
                    </div>
                  ) : (
                    <span className="text-zinc-500 text-sm italic">Inga betyg än</span>
                  )}
                </div>

                <div className="bg-zinc-800/60 rounded-xl p-4">
                  <p className="text-zinc-300 text-sm font-medium mb-3">
                    {submitted ? 'Ditt betyg' : 'Sätt ditt betyg'}
                  </p>
                  <StarRating
                    value={myRating}
                    onChange={submitting ? undefined : submitRating}
                    readonly={submitting}
                  />
                  {submitted && (
                    <p className="text-amber-400/80 text-xs mt-2">
                      Du har satt {myRating}/10 — klicka igen för att ändra
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
