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
