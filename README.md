# Phoneme Activity Builder

A Wordle-style web app builder for Speech Pathology teachers and students. Teachers configure phoneme-based Wordle and Word Search activities and download them as standalone, playable HTML files.

This is a two-part Next.js application:

- **`frontend/`** — the builder UI (Home, About, Wordle, Word Search, Settings)
- **`api/`** — a REST API backed by PostgreSQL (via Prisma) that stores phonemes, words, word lists, and saved activity configurations

## Running with Docker (recommended)

Requires Docker and Docker Compose.

```bash
docker-compose up
```

This builds and starts all three services — `postgres`, `api`, `frontend` — waiting for each to be healthy before starting the next. On first run, the API automatically applies database migrations and seeds the database with the full phoneme word corpus.

- Frontend: http://localhost:3000
- API: http://localhost:4000 (see http://localhost:4000 for a list of endpoints, or http://localhost:4000/api/health)

Data persists in a Docker volume across restarts — the seed script only runs if the database is empty, so it won't overwrite anything you've created via the API.

## Running locally without Docker

Requires Node.js 22+ and a running PostgreSQL instance.

**API:**
```bash
cd api
npm install
cp .env.example .env   # adjust DATABASE_URL if needed
npx prisma migrate dev
npx prisma db seed
npm run dev             # http://localhost:4000
```

**Frontend** (in a separate terminal):
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev             # http://localhost:3000
```

## Project structure

```
frontend/    Next.js app — pages, components, HTML export logic
api/         Next.js app — Prisma schema, CRUD routes, seed data
docker-compose.yml
```

## Tech stack

Next.js (App Router, TypeScript), Tailwind CSS, Prisma, PostgreSQL, Zod, Docker.
