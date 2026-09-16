#!/bin/sh
set -e

node /app/wait-for-postgres.js
echo "Postgres is up."

npx prisma migrate deploy
npx prisma db seed

exec npm run dev
