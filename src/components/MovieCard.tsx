'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { MovieWithRating } from '@/types'

interface MovieCardProps {
  movie: MovieWithRating
  onClick: () => void
  isActive: boolean
}

export function MovieCard({ movie, onClick, isActive }: MovieCardProps) {
  return (
    <motion.div
      onClick={onClick}
      className="relative cursor-pointer select-none overflow-hidden rounded-2xl shadow-2xl"
      style={{ width: '100%', aspectRatio: '2/3' }}
      animate={{
        scale: isActive ? 1 : 0.88,
        opacity: isActive ? 1 : 0.5,
      }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      whileHover={isActive ? { scale: 1.02 } : {}}
      whileTap={isActive ? { scale: 0.98 } : {}}
    >
      {movie.cover_image ? (
        <Image
          src={movie.cover_image}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 80vw, 400px"
          priority
        />
      ) : (
        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
          <span className="text-zinc-500 text-6xl">🎬</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h2 className="text-white font-bold text-xl leading-tight mb-2 line-clamp-2">
          {movie.title}
        </h2>

        <div className="flex items-center gap-3">
          {movie.avg_rating !== null ? (
            <>
              <div className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-amber-400 font-bold text-lg">{movie.avg_rating}</span>
              </div>
              <span className="text-white/50 text-sm">
                {movie.rating_count} {movie.rating_count === 1 ? 'betyg' : 'betyg'}
              </span>
            </>
          ) : (
            <span className="text-white/40 text-sm italic">Inga betyg än</span>
          )}
          {movie.release_year && (
            <span className="text-white/40 text-sm ml-auto">{movie.release_year}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
