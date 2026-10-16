#!/usr/bin/env bash
# Runs real nginx against apps/web/build/client with deploy/nginx/exit-brain.conf and checks
# status codes. Usage: bash scripts/ci/test-nginx.sh [build_dir] [port]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
BUILD="$(cd "${1:-$ROOT/apps/web/build/client}" && pwd)"
PORT="${2:-8080}"
WORK="$(mktemp -d)"
sed -e "s#root /srv/exit-brain/web;#root $BUILD;#" -e "s#listen 8080;#listen $PORT;#" \
  "$ROOT/deploy/nginx/exit-brain.conf" > "$WORK/site.conf"
cat > "$WORK/nginx.conf" <<CONF
worker_processes 1;
pid $WORK/nginx.pid;
error_log $WORK/error.log;
events { worker_connections 64; }
http {
  include /etc/nginx/mime.types;
  access_log off;
  client_body_temp_path $WORK; proxy_temp_path $WORK; fastcgi_temp_path $WORK; uwsgi_temp_path $WORK; scgi_temp_path $WORK;
  include $WORK/site.conf;
}
CONF
nginx -t -c "$WORK/nginx.conf" -p "$WORK" 2>&1 | tail -1
nginx -c "$WORK/nginx.conf" -p "$WORK"
trap 'nginx -s stop -c "$WORK/nginx.conf" -p "$WORK" 2>/dev/null || true' EXIT
fail=0
check() { # path expected-status [must-contain]
  local body status
  body="$(curl -s --noproxy '*' -w '\n%{http_code}' "http://127.0.0.1:$PORT$1")"
  status="${body##*$'\n'}"; body="${body%$'\n'*}"
  if [[ "$status" != "$2" ]] || { [[ -n "${3:-}" ]] && ! grep -q "$3" <<<"$body"; }; then
    echo "FAIL $1 -> $status (want $2${3:+, containing '$3'})"; fail=1
  else echo "ok   $1 -> $status"; fi
}
check /                               200 'When a senior engineer leaves'
check /how-it-works                   200 'How a handover works'
check /features                       200 'Built for the people who carry a handover'
check /security                       200 'Security and responsible use'
check /why-exit-brain                 200 'A departure is a predictable risk'
check /services                       200 'Founder-led services'
check /about                          200 'About Exit Brain'
check /about/founder                  200 'Preview, not published'
check /contact                        200 'This form isn'
check /help                           200 'Help centre'
check /privacy                        200 'Draft, pending legal review'
check /terms                          200 'Draft, pending legal review'
check /how-it-works/nope              404 'Page not found'
check /about/nope                     404 'Page not found'
check /sitemap.xml                    200 '<urlset'
check /signin                         200 '__reactRouterContext'
check /demo                           200 '__reactRouterContext'
check /app                            200 '__reactRouterContext'
check /app/transitions/t-ravi/answers 200 '__reactRouterContext'
check /does-not-exist                 404 'Page not found'
check /spike-about                    404 'Page not found'
check /fonts/OFL.txt                  200 'SIL Open Font License'
js="$(grep -oE '/assets/entry\.client-[^"]+\.js' "$BUILD/index.html" | head -1)"
enc="$(curl -s --noproxy '*' -H 'Accept-Encoding: gzip' -o /dev/null -D - "http://127.0.0.1:$PORT$js" | tr -d '\r' | awk -F': ' 'tolower($1)=="content-encoding"{print $2}')"
if [[ "$enc" == "gzip" ]]; then echo "ok   $js served gzip"; else echo "FAIL $js not compressed (got '${enc:-none}')"; fail=1; fi
exit $fail
