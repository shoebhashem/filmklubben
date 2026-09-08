-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

CREATE TABLE movies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  cover_image  TEXT,
  synopsis     TEXT,
  genres       TEXT[] DEFAULT '{}',
  director     TEXT,
  cast_members TEXT[] DEFAULT '{}',
  release_year INTEGER,
  runtime      INTEGER,
  source_url   TEXT NOT NULL,
  tmdb_id      TEXT,
  added_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id   UUID REFERENCES movies(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
  ip_hash    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(movie_id, session_id)
);

CREATE VIEW movies_with_ratings AS
SELECT
  m.*,
  ROUND(AVG(r.rating)::NUMERIC, 1) AS avg_rating,
  COUNT(r.id)::INTEGER              AS rating_count
FROM movies m
LEFT JOIN ratings r ON r.movie_id = m.id
GROUP BY m.id;

-- Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read movies"  ON movies  FOR SELECT USING (true);
CREATE POLICY "service write movies" ON movies FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "public read ratings"   ON ratings FOR SELECT USING (true);
CREATE POLICY "public insert ratings" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "public update ratings" ON ratings FOR UPDATE USING (true);
