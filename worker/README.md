# offervane-signup worker

The form endpoint for the marketing site's `/trial` page. A single Cloudflare
Worker on Michael's Cloudflare account:

- `POST /` validates the submission and writes it to the `offervane-signups`
  KV namespace. Every signup is stored, always, before anything else happens.
- If the `RESEND_API_KEY` secret is set, it then emails the signup to
  `NOTIFY_TO` (michaelkrontz@gmail.com) via Resend, with reply-to set to the
  prospect. Without the key it logs and no-ops; nothing is lost either way.
- A hidden `phone` honeypot field marks bot submissions: stored under a
  `spam:` key prefix for visibility, never emailed.
- CORS is locked to offervane.com, the github.io fallback, and localhost dev
  ports.

Live URL: `https://offervane-signup.truecatholicai.workers.dev`
(also the `ENDPOINT` constant in `src/trial.js`; change both together)

## Deploy

```sh
source ~/truecatholic/.env   # provides CF_API_TOKEN
./deploy.sh
```

Idempotent. Creates the KV namespace on first run, re-uploads the script after
that, and preserves secrets across redeploys via `keep_bindings`.

## One-time: enable the notification email

```sh
npx wrangler secret put RESEND_API_KEY --name offervane-signup
```

Type the key at the interactive prompt. Do not pipe it in from a shell
variable unless the variable is exported; an unexported var silently uploads
an empty string.

Optional overrides (plain bindings, edit deploy.sh): `NOTIFY_TO` for the
destination address, `RESEND_FROM` for the sender. The default sender is
Resend's shared onboarding address, which only delivers to the Resend account
owner; that is exactly the notification-to-Michael use case. A branded sender
and the prospect auto-reply email both wait until offervane.com DNS lands and
the domain is verified in Resend.

## Reading signups

Cloudflare dashboard: Workers and Pages, KV, `offervane-signups`. Keys sort by
timestamp: `signup:<ISO time>:<id>`. Or from the Pi:

```sh
source ~/truecatholic/.env
ACCT=78066c99bf21dc264ce704967f272a7b
NS=$(curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCT/storage/kv/namespaces" |
  python3 -c "import json,sys; print(next(n['id'] for n in json.load(sys.stdin)['result'] if n['title']=='offervane-signups'))")
curl -s -H "Authorization: Bearer $CF_API_TOKEN" \
  "https://api.cloudflare.com/client/v4/accounts/$ACCT/storage/kv/namespaces/$NS/keys?prefix=signup:"
```
