# End-to-end & accessibility tests

Playwright tests covering both the frontend (UI flows) and the backend
(API logic), plus an automated accessibility pass with axe-core.

## Running

The app must already be running — these tests don't start it
themselves. Either:

```bash
# from the repo root
docker compose up --build
```

or run `npm run dev` in `api/` and `frontend/` separately.

Then, from this directory:

```bash
npm install
npm test            # headless run of every project
npm run test:ui     # interactive UI mode
npm run report      # open the HTML report from the last run
```

By default tests target `http://localhost:3000` (frontend) and
`http://localhost:4000` (api). Override with `FRONTEND_URL` /
`API_URL` env vars if your stack is running elsewhere.

## Structure

| Path | Covers |
|---|---|
| `tests/api/` | Backend logic directly — health check, Words CRUD + validation, Activities CRUD and the type/field rules, generation success/failure (including that it's reflected in `/api/stats`) |
| `tests/frontend/` | UI flows — navigation, Manage Content CRUD (words, word lists), the Wordle activity picker, the dashboard |
| `tests/accessibility/` | axe-core scan (WCAG 2.1 A/AA) of every main page — fails on any serious/critical violation; full results are attached to the HTML report for anything below that |

Run `npm run report` after a test run and open the accessibility
test's attachments to see the full axe-core findings per page, not
just the pass/fail.

## Lighthouse

See [`LIGHTHOUSE.md`](./LIGHTHOUSE.md) for a Lighthouse run against
`/manage` — scores, a real bug it caught (a silently-failing
`sendBeacon` call, invisible to the Playwright/curl-based API tests
since neither enforces CORS), what changed, and verification that the
fix actually works in a real browser, not just that Lighthouse stopped
complaining.

```bash
npx lighthouse http://localhost:3000/manage --view
```
