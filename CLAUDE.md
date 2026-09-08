# Filmklubben — Claude Code Instructions

## Project Purpose
A movie club website for a group of friends who take turns picking a movie, watch it, then meet to discuss. The site tracks watched movies, lets anyone rate them (no login required), and shows which movie got the highest club rating. UI is in Swedish.

## Tech Stack
| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSR + API routes in one repo, Netlify-compatible |
| Database | Supabase (PostgreSQL) | Generous free tier, row-level security, REST API |
| Styling | Tailwind CSS + shadcn/ui | Utility-first, consistent, mobile-ready |
| Animations | Framer Motion + Embla Carousel | GPU-accelerated, touch/swipe support |
| Movie data | TMDB API + Claude Haiku fallback | TMDB for IMDb/TMDB URLs; AI for any other URL |
| Auth | bcrypt + JWT (jose) | Single admin account via env var password |
| Hosting | Netlify + GitHub Actions | Push-to-main auto-deploy |

## Folder Structure
```
src/
├── app/
│   ├── page.tsx               # Home — movie carousel
│   ├── movies/[id]/page.tsx   # Movie detail view
│   ├── admin/
│   │   ├── page.tsx           # Admin dashboard (add/manage movies)
│   │   └── login/page.tsx     # Admin login
│   └── api/
│       ├── auth/route.ts      # POST → JWT
│       ├── movies/            # GET (public), POST (admin only)
│       ├── ratings/route.ts   # POST (public, session-based)
│       └── extract/route.ts   # POST url → structured movie metadata
├── components/
│   ├── MovieCarousel.tsx      # Embla-based swipeable carousel
│   ├── MovieCard.tsx          # Card shown in carousel
│   ├── MovieDetail.tsx        # Full detail modal/page
│   ├── StarRating.tsx         # 1–10 rating widget
│   └── ui/                    # shadcn components
├── lib/
│   ├── supabase.ts            # Supabase client (browser + server)
│   ├── auth.ts                # JWT sign/verify, middleware helpers
│   ├── tmdb.ts                # TMDB API wrapper
│   └── ai-extract.ts          # Claude Haiku URL extraction
└── types/index.ts             # Shared TypeScript types
```

## Coding Conventions
- **TypeScript strict mode** — no `any`, no implicit returns
- **Named exports** everywhere (no default exports except Next.js pages/layouts)
- **File naming:** `kebab-case` for files, `PascalCase` for components
- **Imports:** `@/` alias for all internal imports
- **API routes:** always validate input with Zod; return `{ error: string }` on failure
- **No comments** unless the WHY is non-obvious
- **Swedish UI strings** — all user-facing text in Swedish

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=       # From Supabase project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # From Supabase project settings
SUPABASE_SERVICE_KEY=           # Service role key (server-only, never expose)
ADMIN_PASSWORD=                 # Plain text; stored hashed in env as ADMIN_PASSWORD_HASH
ADMIN_PASSWORD_HASH=            # bcrypt hash of ADMIN_PASSWORD (generate once)
JWT_SECRET=                     # Random 32-char string for signing tokens
TMDB_API_KEY=                   # From themoviedb.org Settings → API
ANTHROPIC_API_KEY=              # From console.anthropic.com
```

## Running Locally
```bash
npm install
cp .env.example .env.local      # fill in your values
npm run dev                     # http://localhost:3000
```

## Deployment
- Push to `main` → GitHub Actions triggers → deploys to Netlify
- Set all env vars in Netlify dashboard (Site Settings → Environment Variables)
- See `.github/workflows/deploy.yml`

## Key Architecture Decisions
- **Session-based ratings:** UUID generated in browser `localStorage`; `UNIQUE(movie_id, session_id)` in DB prevents double-voting per browser
- **Movie extraction flow:** parse URL domain → if TMDB/IMDb, call TMDB API directly; otherwise fetch HTML and send to Claude Haiku for structured extraction
- **Admin auth:** single account, password set via env var, bcrypt-hashed, returns short-lived JWT (8h) stored in `localStorage`
- **No SSR for admin:** admin pages are client components; JWT is checked client-side before API calls
