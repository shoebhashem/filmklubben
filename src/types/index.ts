export interface Movie {
  id: string
  title: string
  slug: string
  cover_image: string | null
  synopsis: string | null
  genres: string[]
  director: string | null
  cast_members: string[]
  release_year: number | null
  runtime: number | null
  source_url: string
  tmdb_id: string | null
  added_at: string
}

export interface MovieWithRating extends Movie {
  avg_rating: number | null
  rating_count: number
}

export interface Rating {
  id: string
  movie_id: string
  session_id: string
  rating: number
  created_at: string
  updated_at: string
}

export interface MovieMetadata {
  title: string
  cover_image: string | null
  synopsis: string | null
  genres: string[]
  director: string | null
  cast_members: string[]
  release_year: number | null
  runtime: number | null
  tmdb_id: string | null
}
