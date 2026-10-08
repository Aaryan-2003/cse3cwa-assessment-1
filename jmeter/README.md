# JMeter load test

`phoneme-builder-load-test.jmx` exercises the `api` container's
real endpoints under concurrent load: 20 virtual users, 10 loops each
(200 requests per sampler), ramped up over 5 seconds.

Each loop:
1. `GET /api/health`
2. `GET /api/words`
3. `GET /api/activities` — the first activity's id is extracted and
   reused below
4. `GET /api/activities/{id}/generate` — the endpoint that reads the
   word list, picks words, and logs a `GenerationEvent`; the one most
   worth watching for response-time degradation under load
5. `GET /api/stats` — the dashboard's own aggregation query

Every request has a "response code = 200" assertion, so failures are
immediately visible as red/failed samples, not just slow ones.

## Prerequisites

- The app running — `docker compose up --build` (or the prod compose
  file) from the repo root
- [Apache JMeter](https://jmeter.apache.org/download_jmeter.cgi)
  installed (needs a Java runtime — JMeter's installer/zip includes
  everything else). This wasn't runnable inside the sandboxed
  environment this test plan was authored in (no internet access to
  Apache's servers, and the only locally available package was a
  broken decade-old build) — run it on your own machine, which is the
  normal way to use JMeter anyway.

## Running it (GUI — best for the demo video)

1. Open JMeter, then **File → Open** → select
   `jmeter/phoneme-builder-load-test.jmx`
2. If your app isn't on `localhost:4000`, edit the `API_HOST`/`API_PORT`
   user-defined variables at the top of the Test Plan
3. Click the green ▶ Run button
4. Open **Summary Report** and **Aggregate Report** in the left tree —
   these show request counts, average/min/max response time, error %,
   and throughput per endpoint. This view is what to show on screen.

## Running it from the command line (generates an HTML dashboard)

```bash
jmeter -n -t phoneme-builder-load-test.jmx -l results.jtl -e -o report
```

Open `report/index.html` in a browser afterward — a full visual
dashboard (response time graphs, throughput, error rate) good for
screen-recording.

## What to look for / discuss in the video

- **Error %** should be 0 — every assertion passing means the API
  held up correctly under concurrent load, not just under one request
  at a time
- **`/generate`'s average response time** vs the simpler `GET`
  endpoints — it does more work (reads the word list, shuffles,
  queries phonemes for hints, writes a `GenerationEvent`), so a higher
  but still reasonable number here is expected and worth explaining
  rather than hiding
- **Throughput** (requests/sec) — gives a concrete number for "how
  much load can this handle" rather than a vague impression

## Results and report files

`results.jtl` and `report/` are gitignored (they're generated,
machine- and run-specific) — regenerate them with the commands above
before recording.
