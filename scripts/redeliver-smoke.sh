#!/usr/bin/env sh
set -e
API_URL="${API_URL:-http://localhost:3000}"
ID="${1:?event id required}"
curl -s -X POST "$API_URL/api/v1/events/$ID/redeliver" | head -c 500
echo
