'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number | null
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)

  const sizePx = size === 'sm' ? 16 : size === 'lg' ? 28 : 22
  const display = hovered ?? value ?? 0

  return (
    <div className="flex items-center gap-0.5" aria-label={`Betyg: ${value ?? 'ej betygsatt'} av 10`}>
      {Array.from({ length: 10 }, (_, i) => {
        const star = i + 1
        const filled = star <= display
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(null)}
            className={`transition-transform ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125'}`}
            aria-label={`${star} av 10`}
          >
            <svg
              width={sizePx}
              height={sizePx}
              viewBox="0 0 24 24"
              fill={filled ? '#f59e0b' : 'none'}
              stroke={filled ? '#f59e0b' : '#6b7280'}
              strokeWidth={1.5}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
