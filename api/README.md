# Phoneme Activity Builder — API

A Next.js app used purely as a REST API (no pages) — it serves `frontend/`, backed by PostgreSQL via Prisma. Originally scaffolded with `create-next-app`.

## Running

Usually run via `docker compose up` from the repo root, which also starts Postgres and the frontend. To run standalone:

```bash
npm install
cp .env.example .env   # adjust DATABASE_URL if needed
npx prisma migrate dev
npx prisma db seed
npm run dev             # http://localhost:4000
```

## Endpoints

| Route | Methods |
|---|---|
| `/api/health` | `GET` — process + database connectivity check |
| `/api/phonemes`, `/api/phonemes/:id` | `GET`, `POST`, `PATCH`, `DELETE` |
| `/api/words`, `/api/words/:id` | `GET`, `POST`, `PATCH`, `DELETE` |
| `/api/word-lists`, `/api/word-lists/:id` | `GET`, `POST`, `PATCH`, `DELETE` |
| `/api/activities`, `/api/activities/:id` | `GET`, `POST`, `PATCH`, `DELETE` |
| `/api/activities/:id/generate` | `GET` — samples words fresh from the activity's word list and returns everything the frontend needs to render/export it |

All routes validate request bodies with Zod (`lib/validation.ts`) and return errors as consistent JSON via a shared handler (`lib/http.ts`), and are all marked `export const dynamic = "force-dynamic"` so responses are never cached — every request reads live from Postgres.

## Data model

See `prisma/schema.prisma`. In short: `Phoneme` → `WordPhoneme` (ordered join table, supports multi-character symbols) → `Word` → `WordListEntry` → `WordList` → `Activity` (references a word list rather than storing its own words, so activities regenerate from whatever the list currently contains).

## Seeding

`prisma/seed.ts` populates the full phoneme word corpus plus a small "Starter Set" word list. It only runs if the database is empty (checked in `entrypoint.sh` / on `npx prisma db seed`), so it won't overwrite data created through the API.
