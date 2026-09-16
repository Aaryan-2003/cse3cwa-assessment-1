# Phoneme Activity Builder — Frontend

The builder UI, built with Next.js (App Router, TypeScript, Tailwind CSS). Originally scaffolded with `create-next-app`. Talks to the `api/` app over HTTP — see `src/lib/api.ts` for the typed client used by every page.

## Running

Usually run via `docker compose up` from the repo root, which also starts the API and Postgres. To run standalone against an already-running API:

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if the API isn't on localhost:4000
npm run dev                   # http://localhost:3000
```

## Pages

| Route | Purpose |
|---|---|
| `/` | Home |
| `/wordle` | Play a configured Wordle activity, switch between activities via a dropdown, download as standalone HTML |
| `/word-search` | Same, for Word Search activities |
| `/manage` | Teacher-facing CRUD for Words, Word lists, and Activities — everything here is saved to the database and consumed directly by the pages above |
| `/about` | Project info / video walkthrough |
| `/settings` | App preferences |

## Structure

```
src/app/            pages (App Router)
src/components/      shared UI, including components/manage/* (Words/WordLists/Activities managers)
src/lib/             API client (api.ts), puzzle generation, HTML export logic
```
