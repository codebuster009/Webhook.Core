#!/usr/bin/env sh
# Usage: API_URL=http://localhost:3000 PARTNER_ID=... ./scripts/manual-ingest-smoke.sh
set -e
API_URL="${API_URL:-http://localhost:3000}"
if [ -z "$PARTNER_ID" ]; then
  echo "Set PARTNER_ID to a real partner id"
  exit 1
fi
EXT="ext_$(date +%s)_$$"
curl -s -o /tmp/in1.json -w "%{http_code}" -X POST "$API_URL/api/v1/events" \
  -H "Content-Type: application/json" \
  -d "{\"external_id\":\"$EXT\",\"partner_id\":\"$PARTNER_ID\",\"transaction_id\":\"txn_smoke\",\"event_type\":\"TXN_SCREENED\",\"payload\":{}}" \
  | tee /tmp/code1.txt >/dev/null
CODE=$(cat /tmp/code1.txt)
echo "First ingest HTTP $CODE"
curl -s -o /tmp/in2.json -w "%{http_code}" -X POST "$API_URL/api/v1/events" \
  -H "Content-Type: application/json" \
  -d "{\"external_id\":\"$EXT\",\"partner_id\":\"$PARTNER_ID\",\"transaction_id\":\"txn_smoke\",\"event_type\":\"TXN_SCREENED\",\"payload\":{}}" \
  | tee /tmp/code2.txt >/dev/null
CODE2=$(cat /tmp/code2.txt)
echo "Duplicate ingest HTTP $CODE2 (expect 200)"
