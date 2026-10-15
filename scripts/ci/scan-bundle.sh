#!/usr/bin/env bash
# Fail if the built frontend bundle contains secret material (security-and-privacy.md T3).
# Checks: JWTs whose payload says role=service_role, full-length sb_secret_ keys, PEM private keys.
# Usage: scripts/ci/scan-bundle.sh apps/web/dist
set -euo pipefail
DIST="${1:?usage: scan-bundle.sh <dist-dir>}"
[ -d "$DIST" ] || { echo "no such dir: $DIST"; exit 2; }

python3 - "$DIST" <<'PY'
import base64, json, pathlib, re, sys

dist = pathlib.Path(sys.argv[1])
jwt_re = re.compile(rb'eyJ[A-Za-z0-9_-]{10,}\.([A-Za-z0-9_-]{10,})\.[A-Za-z0-9_-]{10,}')
secret_re = re.compile(rb'sb_secret_[A-Za-z0-9_-]{20,}')
pem_re = re.compile(rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----')

problems = []
files = [p for p in dist.rglob('*') if p.is_file()]
for f in files:
    data = f.read_bytes()
    for m in jwt_re.finditer(data):
        seg = m.group(1) + b'=' * (-len(m.group(1)) % 4)
        try:
            payload = json.loads(base64.urlsafe_b64decode(seg))
        except Exception:
            continue
        if isinstance(payload, dict) and payload.get('role') == 'service_role':
            problems.append(f'{f}: service_role JWT')
    if secret_re.search(data):
        problems.append(f'{f}: sb_secret_ key')
    if pem_re.search(data):
        problems.append(f'{f}: PEM private key')

if problems:
    print('SECRET MATERIAL IN BUNDLE:')
    print('\n'.join(problems))
    sys.exit(1)
print(f'bundle clean: {len(files)} files scanned')
PY
