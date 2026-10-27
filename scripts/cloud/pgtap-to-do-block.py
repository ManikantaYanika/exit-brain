#!/usr/bin/env python3
"""
Turn a supabase/tests/*.test.sql pgTAP file into ONE rollback-only statement for a hosted
project where we only have an SQL endpoint (Supabase MCP execute_sql / SQL editor), not psql.

- Drops the file's own begin/rollback/finish.
- Wraps the body in a DO block and rewrites top-level `select` to `perform`.
- Ends by RAISING an exception that carries the result, so every change (test users,
  orgs, the pgtap extension itself) is rolled back. Nothing is left in the database.

Read the result from the error text: "TAPRESULT ran=44 failed=0 finish=clean".
Before trusting a run, prove the harness catches failures with a deliberate is(1, 2, ...).

Usage: python3 scripts/cloud/pgtap-to-do-block.py supabase/tests/rls_core.test.sql > /tmp/rls_core.sql
"""
import sys

SKIP = {'begin;', 'rollback;', 'select * from finish();'}
SUMMARY = (
    "raise exception 'TAPRESULT ran=% failed=% finish=%', _get('curr_test'), num_failed(),\n"
    "  coalesce((select string_agg(f, ' / ') from finish() f), 'clean');\n"
)


def convert(text: str) -> str:
    out = []
    lines = text.splitlines()
    for i, line in enumerate(lines):
        if line.strip() in SKIP:
            continue
        if line.startswith('select '):
            prev = next((p for p in reversed(lines[:i]) if p.strip() and not p.strip().startswith('--')), ';')
            if not prev.rstrip().endswith(';'):
                sys.exit(f'line {i + 1}: top-level select continues a previous statement; convert by hand')
            line = 'perform ' + line[len('select '):]
        out.append(line)
    return 'do $tapdo$\nbegin\n' + '\n'.join(out) + '\n' + SUMMARY + 'end\n$tapdo$;\n'


if __name__ == '__main__':
    with open(sys.argv[1], encoding='utf-8') as f:
        sys.stdout.write(convert(f.read()))
