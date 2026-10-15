#!/usr/bin/env bash
# Run migrations + pgTAP tests against a plain local Postgres (no Docker).
# Use when `supabase start` isn't available. The real gate is `supabase test db` in CI.
# Requires: psql, a Postgres 15+ superuser connection, pgTAP extension installed.
# Usage: PGURL=postgres://postgres@localhost:5432/postgres scripts/local-db/test-db.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PGURL="${PGURL:-postgres://postgres@localhost:5432/postgres}"
DB=exitbrain_test
psql "$PGURL" -q -c "drop database if exists $DB" -c "create database $DB"
TEST_URL="${PGURL%/*}/$DB"
psql "$TEST_URL" -v ON_ERROR_STOP=1 -q -f "$ROOT/scripts/local-db/supabase_shim.sql"
for f in "$ROOT"/supabase/migrations/*.sql; do
  echo "applying $(basename "$f")"
  psql "$TEST_URL" -v ON_ERROR_STOP=1 -q -f "$f"
done
psql "$TEST_URL" -q -c "create extension if not exists pgtap"
fail=0
for t in "$ROOT"/supabase/tests/*.test.sql; do
  out=$(psql "$TEST_URL" -q -X -t -A -f "$t" 2>&1 | grep -E '^(ok|not ok|1\.\.|#)')
  echo "$out" | grep -E '^(not ok|#)' && fail=1
  echo "$(basename "$t"): $(echo "$out" | grep -cE '^ok') passed, plan $(echo "$out" | head -1)"
done
exit $fail
