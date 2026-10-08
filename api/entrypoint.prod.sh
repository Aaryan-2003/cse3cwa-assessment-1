#!/bin/sh
set -e

node /app/wait-for-postgres.js
echo "Postgres is up."

npx prisma migrate deploy
# Idempotent — the seed script checks for existing data and skips if
# any is found, so this is safe to run on every container start,
# including restarts of an already-seeded production database.
npx prisma db seed

exec npm run start
