#!/usr/bin/env sh
set -eu

dataset_count="${1:-}"
if [ "$dataset_count" != "1000" ] && [ "$dataset_count" != "12000" ]; then
  echo "Usage: $0 1000|12000" >&2
  exit 2
fi

if [ -z "${USER_EMAIL:-}" ] || [ -z "${USER_PASSWORD:-}" ] ||
  [ -z "${ADMIN_EMAIL:-}" ] || [ -z "${ADMIN_PASSWORD:-}" ]; then
  echo "User and administrator credentials must be set in the environment" >&2
  exit 2
fi

repository_root="$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)"
cd "$repository_root"

compose() {
  COURTLY_API_PORT=3121 COURTLY_WEB_PORT=4191 docker compose \
    -p courtly-performance \
    -f compose.yaml \
    -f compose.performance.yaml \
    "$@"
}

database_state="$(compose exec -T database psql -X -U courtly -d courtly_performance -Atc "SELECT current_database() || '|' || count(*) FROM public.bookings;")"
expected_state="courtly_performance|$dataset_count"
if [ "$database_state" != "$expected_state" ]; then
  echo "Expected $expected_state but found $database_state" >&2
  exit 1
fi

compose exec -T database psql -X -v ON_ERROR_STOP=1 -U courtly -d courtly_performance \
  -c 'VACUUM FULL public.bookings;' \
  -c 'ANALYZE public.bookings;'

for round in 1 2 3; do
  compose exec -T database psql -X -v ON_ERROR_STOP=1 -U courtly -d courtly_performance \
    -c 'ANALYZE public.bookings;' >/dev/null

  result_name="p4-${dataset_count}-r${round}"
  echo "Starting $result_name at $(date -u +%Y-%m-%dT%H:%M:%SZ)"

  summary_path="/results/${result_name}-summary.json"
  summary_file="docs/performance/results/${result_name}-summary.json"
  set +e
  compose --profile performance run --rm \
    -e USER_EMAIL -e USER_PASSWORD -e ADMIN_EMAIL -e ADMIN_PASSWORD \
    k6 run \
    -e BASE_URL=http://backend:3000 \
    -e DATASET_COUNT="$dataset_count" \
    -e K6_SUMMARY_PATH="$summary_path" \
    --out "json=/results/${result_name}.json" \
    /scripts/scenarios.js
  run_status=$?
  set -e

  if [ "$run_status" -ne 0 ]; then
    exit "$run_status"
  fi
  if [ ! -s "$summary_file" ]; then
    echo "k6 did not write a summary for $result_name" >&2
    exit 1
  fi

  gzip -9 -f "docs/performance/results/${result_name}.json"
  echo "Completed $result_name at $(date -u +%Y-%m-%dT%H:%M:%SZ)"
done
