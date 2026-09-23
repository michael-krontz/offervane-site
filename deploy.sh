#!/usr/bin/env bash
# Build and publish the marketing site to the gh-pages branch.
#
#   ./deploy.sh parked   # github.io only, noindex (the state while offervane.com DNS is parked)
#   ./deploy.sh live     # offervane.com: keeps CNAME, indexable robots.txt, sets the
#                        # Pages custom domain + HTTPS via the GitHub API
#
# Run `live` only after offervane.com's DNS points at GitHub Pages
# (A records 185.199.108-111.153 on @, CNAME www -> michael-krontz.github.io);
# it refuses otherwise, because setting the custom domain first would
# redirect the working github.io URL to a domain that doesn't resolve yet.
set -euo pipefail

MODE="${1:-}"
[[ "$MODE" == parked || "$MODE" == live ]] || { echo "usage: $0 parked|live" >&2; exit 2; }

ROOT="$(cd "$(dirname "$0")" && pwd)"
REPO="michael-krontz/offervane-site"
DOMAIN="offervane.com"

if [[ "$MODE" == live ]]; then
  ips=$(curl -4 -s -H 'accept: application/dns-json' "https://cloudflare-dns.com/dns-query?name=$DOMAIN&type=A" |
    python3 -c 'import json,sys; print(" ".join(a["data"] for a in json.load(sys.stdin).get("Answer", [])))')
  if [[ "$ips" != *"185.199.108.153"* ]]; then
    echo "offervane.com resolves to [$ips], not GitHub Pages yet. Fix DNS first." >&2
    exit 1
  fi
fi

cd "$ROOT"
npm run build

OUT="$(mktemp -d)"
cp -r dist/. "$OUT/"
cd "$OUT"
touch .nojekyll
if [[ "$MODE" == live ]]; then
  echo "$DOMAIN" > CNAME
  printf 'User-agent: *\nAllow: /\nSitemap: https://%s/sitemap.xml\n' "$DOMAIN" > robots.txt
else
  rm -f CNAME
  printf 'User-agent: *\nDisallow: /\n' > robots.txt
fi

git init -q -b gh-pages
git add -A
git -c user.name=TrueCatholicAI -c user.email=michaelkrontz@gmail.com commit -qm "Deploy ($MODE) from $(git -C "$ROOT" rev-parse --short HEAD)"
git push -qf "https://michael-krontz@github.com/$REPO.git" gh-pages
echo "pushed gh-pages ($MODE)"

if [[ "$MODE" == live ]]; then
  T=$(grep michael-krontz "$HOME/.git-credentials" | sed -E 's#https://michael-krontz:([^@]*)@.*#\1#')
  api() { curl -4 -s -o /dev/null -w "%{http_code}" -X PUT -H "Authorization: Bearer $T" \
    -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/pages" -d "$1"; }
  echo "custom domain: $(api "{\"cname\":\"$DOMAIN\"}")"
  # GitHub needs a few minutes to issue the certificate before HTTPS can be enforced.
  echo "enforce https: $(api '{"https_enforced":true}') (a 404/422 here just means the cert isn't ready; rerun in ~15 min)"
fi
