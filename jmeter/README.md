# JMeter load test

`phoneme-builder-load-test.jmx` exercises the `api` container's real
endpoints under concurrent load, at **multiple staged user counts**
(required: the assessment asks for behaviour to be compared across
several traffic levels, not a single run).

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

## Running at staged load levels (required)

Open the plan once (**File → Open** → `phoneme-builder-load-test.jmx`),
then for **each row below**: click **Concurrent Users** in the left
tree, change **Number of Threads (users)**, **Ramp-up period
(seconds)**, and **Loop Count**, click the green ▶ Run button, then
read **Aggregate Report** in the left tree and note (or screenshot)
its Average response time, Error %, and Throughput columns before
moving to the next stage.

| Stage | Threads (users) | Ramp-up (s) | Loop Count | ≈ Requests per endpoint |
|---|---|---|---|---|
| x1 | 1 | 1 | 3 | 3 |
| x10 | 10 | 2 | 3 | 30 |
| x100 | 100 | 10 | 3 | 300 |
| x1000 | 1000 | 60 | 1 | 1,000 |
| x10000 | 10000 | 120 | 1 | 10,000 |

**Clear results between stages** — the toolbar's broom/eraser icon
(or **Run → Clear All**) — so one stage's numbers don't mix into the
next.

**About the x10000 row**: this is genuinely a lot of concurrent
connections for a single Next.js dev server + Postgres container on
one laptop. If it stalls, times out, or the machine struggles:
that's a legitimate result, not a failure of the test — note it as
the system's practical breaking point on this hardware, use the
largest stage that *did* complete cleanly as the top comparison point,
and say so explicitly in the video ("the assessment allows equivalent
staged levels — on this hardware, x2000 was the practical ceiling
before response times became unusable"). Running the x1000/x10000
stages against the **production** compose stack
(`docker-compose.prod.yml`) rather than the dev one will hold up
noticeably better, since `next dev` carries real overhead `next start`
doesn't.

## Running from the command line instead (generates an HTML dashboard)

Repeat per stage, changing `-JTHREADS`/`-JRAMP`/`-JLOOPS` to match the
table above — these override the Thread Group's values without
needing to edit the file:

```bash
jmeter -n -t phoneme-builder-load-test.jmx \
  -JTHREADS=100 -JRAMP=10 -JLOOPS=3 \
  -l results-x100.jtl -e -o report-x100
```

(Only works if the Thread Group's fields are set to reference
`${__P(THREADS,1)}` etc. instead of literal numbers — the GUI method
above is simpler and doesn't require that, so it's the one documented
step by step.)

Open `report-x100/index.html` (etc per stage) in a browser — a full
visual dashboard (response time graphs, throughput, error rate) good
for screen-recording.

## What to look for / discuss in the video

Show at least 3 of the 5 stages' Aggregate Reports (e.g. x1, x100,
x1000) side by side or in sequence, and talk through the trend, not
just one snapshot:

- **Error %** — should stay at 0 through the lower stages; if/when it
  stops being 0, that's the system starting to fail under load, worth
  calling out explicitly
- **Average response time** — should climb as load increases; compare
  `/generate`'s number (it does real work — reads the word list,
  shuffles, queries phonemes, writes a `GenerationEvent`) against the
  simpler `GET` endpoints at the same stage, and compare the same
  endpoint across stages
- **Throughput** (requests/sec) — typically rises then plateaus as the
  system saturates; a flattening or dropping throughput curve across
  stages is the actual "how does it behave under load" answer the
  rubric is asking for

## Results and report files

`*.jtl` and `report*/` folders are gitignored (generated,
machine- and run-specific) — regenerate them with the steps above
before recording.
