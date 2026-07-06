#!/usr/bin/env bash
# Deploys the offervane-signup Worker to Cloudflare via the API.
# Idempotent: creates the KV namespace only if missing, re-PUTs the script,
# keeps any secrets already set (keep_bindings), enables the workers.dev route.
#
# Usage:
#   export CF_API_TOKEN=...   # or: source ~/truecatholic/.env
#   ./deploy.sh
set -euo pipefail

ACCT="78066c99bf21dc264ce704967f272a7b"
NAME="offervane-signup"
KV_TITLE="offervane-signups"
API="https://api.cloudflare.com/client/v4/accounts/$ACCT"
AUTH=(-H "Authorization: Bearer $CF_API_TOKEN")
DIR="$(cd "$(dirname "$0")" && pwd)"

echo "== KV namespace =="
KV_ID=$(curl -s "${AUTH[@]}" "$API/storage/kv/namespaces?per_page=100" |
  python3 -c "import json,sys; r=json.load(sys.stdin)['result']; print(next((n['id'] for n in r if n['title']=='$KV_TITLE'), ''))")
if [ -z "$KV_ID" ]; then
  KV_ID=$(curl -s -X POST "${AUTH[@]}" -H "Content-Type: application/json" \
    -d "{\"title\":\"$KV_TITLE\"}" "$API/storage/kv/namespaces" |
    python3 -c "import json,sys; print(json.load(sys.stdin)['result']['id'])")
  echo "created $KV_TITLE ($KV_ID)"
else
  echo "exists $KV_TITLE ($KV_ID)"
fi

echo "== worker script =="
METADATA=$(python3 - "$KV_ID" <<'EOF'
import json, sys
print(json.dumps({
    "main_module": "worker.js",
    "compatibility_date": "2026-06-01",
    "bindings": [
        {"type": "kv_namespace", "name": "SIGNUPS", "namespace_id": sys.argv[1]},
        {"type": "plain_text", "name": "NOTIFY_TO", "text": "michaelkrontz@gmail.com"},
    ],
    # keep RESEND_API_KEY (and any other secrets) across redeploys
    "keep_bindings": ["secret_text"],
}))
EOF
)
curl -s -X PUT "${AUTH[@]}" \
  -F "metadata=$METADATA;type=application/json" \
  -F "worker.js=@$DIR/offervane-signup.js;type=application/javascript+module" \
  "$API/workers/scripts/$NAME" |
  python3 -c "import json,sys; d=json.load(sys.stdin); print('deploy ok' if d['success'] else d['errors']); sys.exit(0 if d['success'] else 1)"

echo "== workers.dev route =="
curl -s -X POST "${AUTH[@]}" -H "Content-Type: application/json" \
  -d '{"enabled": true}' "$API/workers/scripts/$NAME/subdomain" |
  python3 -c "import json,sys; d=json.load(sys.stdin); print('route ok' if d['success'] else d['errors'])"

URL="https://$NAME.truecatholicai.workers.dev"
echo "== smoke test =="
sleep 3
curl -s "$URL" && echo
echo
echo "Live at $URL"
echo "To enable the notification email, set the Resend key once:"
echo "  npx wrangler secret put RESEND_API_KEY --name $NAME"
echo "(type the key at the interactive prompt; piping an unexported var uploads an empty string)"
