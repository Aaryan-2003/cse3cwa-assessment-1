# Lighthouse findings and what changed

Ran against `/manage` (the most complex page — forms, tables, dynamic
content) via `npx lighthouse http://localhost:3000/manage`, served by
`next dev` (not a production build — see note on Performance below).

## Before

| Category | Score |
|---|---|
| Accessibility | 100 |
| Best Practices | 96 |
| SEO | 100 |
| Performance | 46 (dev-mode artifact — see note) |

One real issue, surfaced by the `errors-in-console` audit (Best
Practices):

> Access to resource at 'http://localhost:4000/api/page-views' from
> origin 'http://localhost:3000' has been blocked by CORS policy:
> Response to preflight request doesn't pass access control check:
> The value of the 'Access-Control-Allow-Credentials' header in the
> response is '' which must be 'true' when the request's credentials
> mode is 'include'.

This was a genuine bug, not a false positive: `recordPageView()`
(`frontend/src/lib/api.ts`) sent its payload via `navigator.sendBeacon`
as a `Blob` with `type: "application/json"`. That content type isn't
CORS-safelisted, so the browser forced a preflight — and `sendBeacon`
requests are always sent in credentialed mode for cross-origin
targets, which that preflight failed since the API never sends
`Access-Control-Allow-Credentials`. The request was silently dropped
on every real page visit in every browser; the "average time on page"
dashboard stat had effectively never been populated. This specific
failure mode is invisible to the Playwright `request`/`curl`-based API
tests in this suite, since neither of those enforces CORS — it only
showed up once something exercised a real browser.

(Axe-core, run separately via the Playwright `accessibility` project
in this same folder, independently confirms accessibility: 0 serious
or critical violations across every page.)

## What changed

`frontend/src/lib/api.ts` — `recordPageView` now sends the beacon as
`{ type: "text/plain" }` instead of `"application/json"`. `text/plain`
is CORS-safelisted, so no preflight is triggered and no credentials
requirement applies; the API's `request.json()` parses the body the
same way regardless of the `Content-Type` header it arrives with, so
nothing on the backend needed to change.

## After

| Category | Score |
|---|---|
| Accessibility | 100 |
| Best Practices | 100 |
| `errors-in-console` | 0 findings (was failing) |

Verified the fix actually works, not just that Lighthouse stopped
complaining: ran the Playwright test that navigates across six pages
in a real browser and checked `/api/stats` before/after —
`pageViews.count` went from 1 to 8, matching the number of route
changes. Before the fix this number never moved no matter how much
the app was used in a real browser.

## On the Performance score

46 is expected and not representative of production behaviour: this
was run against `next dev` (Turbopack dev server — unminified JS, no
code splitting/caching, live HMR websocket), not `next build && next
start`. Nearly every flagged audit (`unminified-javascript`,
`valid-source-maps`, `bootup-time`, `mainthread-work-breakdown`) is a
dev-mode-only characteristic. A meaningful performance comparison
would require running Lighthouse against a production build instead.
