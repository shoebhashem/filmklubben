'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MovieCard } from './MovieCard'
import { MovieWithRating } from '@/types'

interface MovieCarouselProps {
  movies: MovieWithRating[]
  onSelectMovie: (movie: MovieWithRating) => void
}

export function MovieCarousel({ movies, onSelectMovie }: MovieCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    skipSnaps: false,
  })
  const [selectedIndex, setSelectedIndex] = useState(0)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  if (movies.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <p>Inga filmer tillagda än.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4" style={{ touchAction: 'pan-y' }}>
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="flex-shrink-0"
              style={{ width: 'min(72vw, 340px)' }}
            >
              <MovieCard
                movie={movie}
                isActive={index === selectedIndex}
                onClick={() => {
                  if (index === selectedIndex) {
                    onSelectMovie(movie)
                  } else {
                    emblaApi?.scrollTo(index)
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white transition-colors"
        aria-label="Föregående film"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/80 rounded-full p-2 text-white transition-colors"
        aria-label="Nästa film"
      >
        <ChevronRight size={20} />
      </button>

      <div className="flex justify-center gap-1.5 mt-4">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'bg-amber-400 w-6 h-2'
                : 'bg-zinc-600 hover:bg-zinc-400 w-2 h-2'
            }`}
            aria-label={`Gå till film ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
