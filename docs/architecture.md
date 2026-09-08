# Filmklubben — Architecture

## Data Model (Supabase / PostgreSQL)

```sql
CREATE TABLE movies (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  cover_image  TEXT,
  synopsis     TEXT,
  genres       TEXT[],
  director     TEXT,
  cast_members TEXT[],
  release_year INTEGER,
  runtime      INTEGER,        -- minutes
  source_url   TEXT NOT NULL,  -- original URL pasted by admin
  tmdb_id      TEXT,
  added_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ratings (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id   UUID REFERENCES movies(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,   -- UUID from visitor's localStorage
  rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10),
  ip_hash    TEXT,            -- SHA-256 of IP, for spam signals only
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(movie_id, session_id)
);

-- Convenience view: movies with pre-computed average rating
CREATE VIEW movies_with_ratings AS
SELECT
  m.*,
  ROUND(AVG(r.rating), 1)  AS avg_rating,
  COUNT(r.id)               AS rating_count
FROM movies m
LEFT JOIN ratings r ON r.movie_id = m.id
GROUP BY m.id;
```

## API Contract

### Public endpoints
| Method | Path | Description |
|---|---|---|
| GET | `/api/movies` | List all movies with avg rating; sorted by avg_rating desc |
| GET | `/api/movies/[id]` | Single movie with rating details |
| POST | `/api/ratings` | Submit or update a rating |

### Admin endpoints (require `Authorization: Bearer <jwt>`)
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth` | `{ password }` → `{ token }` |
| POST | `/api/movies` | `{ url }` → extracts + saves movie |
| DELETE | `/api/movies/[id]` | Remove a movie |

### Request/Response shapes

**POST /api/ratings**
```json
// Request
{ "movieId": "uuid", "sessionId": "uuid", "rating": 8 }
// Response
{ "id": "uuid", "rating": 8, "updatedAt": "iso-string" }
```

**POST /api/movies (admin)**
```json
// Request
{ "url": "https://www.imdb.com/title/tt0111161/" }
// Response — the saved movie object
{ "id": "uuid", "title": "The Shawshank Redemption", "slug": "the-shawshank-redemption", ... }
```

## Auth Flow

```
Admin enters password
  → POST /api/auth { password }
  → Server: bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  → If match: sign JWT({ role: "admin" }, JWT_SECRET, { expiresIn: "8h" })
  → Return { token }
  → Client: localStorage.setItem("filmklubben_admin_token", token)

Protected API call:
  → Client: Authorization: Bearer <token>
  → Server middleware: jose.jwtVerify(token, JWT_SECRET)
  → If valid: continue; else 401
```

## Movie Extraction Flow

```
Admin pastes URL
  → POST /api/extract { url }
  → Server:
      if hostname includes "themoviedb.org" or "imdb.com":
        extract ID from URL path
        call TMDB /find or /movie endpoint
        map response to MovieMetadata shape
      else:
        fetch(url) → HTML string
        send to Claude Haiku:
          "Extract movie metadata as JSON: title, synopsis, genres,
           director, cast, release_year, runtime, cover_image_url"
        parse JSON from response
  → Return MovieMetadata
  → Admin confirms → POST /api/movies saves to DB
```

## Rating System

- Visitor's first page load: check `localStorage.getItem("filmklubben_session")`
- If absent: `crypto.randomUUID()` → store in `localStorage`
- Rating submit: `{ movieId, sessionId, rating }` → DB upsert on `(movie_id, session_id)`
- Allows updating own rating; prevents duplicate rows per browser
- `ip_hash` is logged for monitoring but never used to block (friend group context)

## Supabase Row-Level Security

```sql
-- Movies: anyone can read, only service role can write
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON movies FOR SELECT USING (true);
CREATE POLICY "service write" ON movies FOR ALL USING (auth.role() = 'service_role');

-- Ratings: anyone can read/insert/update their own session
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON ratings FOR SELECT USING (true);
CREATE POLICY "public insert" ON ratings FOR INSERT WITH CHECK (true);
CREATE POLICY "own update" ON ratings FOR UPDATE USING (true);
```

## Deployment

```
GitHub (main branch)
  → GitHub Actions: npm ci && npm run build → Netlify CLI deploy
  → Netlify: serves Next.js via @netlify/next adapter
  → Supabase: hosted PostgreSQL (no deploy step needed)
```
