import { assertEquals, assertMatch, assertRejects } from './assert.ts'
import { acceptInvite } from '../api-accept-invite/handler.ts'
import { createOrg } from '../api-create-org/handler.ts'
import { invite } from '../api-invite/handler.ts'
import { HttpError } from '../_shared/http.ts'
import { sha256Hex } from '../_shared/tokens.ts'
import type { UserScopedContext } from '../_shared/types.ts'

type RpcResult = { data: unknown; error: { code?: string; message?: string } | null }

/** Fake user-scoped context that records RPC calls. No service-role client exists on it. */
function fakeCtx(result: RpcResult, user: { id: string } | null = { id: 'u1' }) {
  const calls: { fn: string; args: Record<string, unknown> }[] = []
  const ctx: UserScopedContext = {
    userClaims: user,
    supabase: {
      rpc(fn, args) {
        calls.push({ fn, args })
        return Promise.resolve(result)
      },
    },
  }
  return { ctx, calls }
}

const post = (body: unknown, type = 'application/json') =>
  new Request('http://localhost/fn', {
    method: 'POST',
    headers: { 'content-type': type },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })

// ---------- api-create-org ----------
Deno.test('create-org: valid body calls create_organization and returns 201', async () => {
  const { ctx, calls } = fakeCtx({ data: 'org-1', error: null })
  const res = await createOrg(post({ name: '  Acme  ', size_band: '51-150' }), ctx)
  assertEquals(res.status, 201)
  assertEquals(await res.json(), { org_id: 'org-1' })
  assertEquals(calls[0], {
    fn: 'create_organization',
    args: { p_name: 'Acme', p_size_band: '51-150', p_timezone: 'Asia/Kolkata' },
  })
})

Deno.test('create-org: rejects short name, bad size band and bad tz', async () => {
  const { ctx, calls } = fakeCtx({ data: 'x', error: null })
  for (
    const body of [{ name: 'A' }, { name: 'Acme', size_band: '9000' }, {
      name: 'Acme',
      timezone: 'Nope/Nope',
    }]
  ) {
    const err = await assertRejects(() => createOrg(post(body), ctx), HttpError)
    assertEquals(err.status, 400)
  }
  assertEquals(calls.length, 0)
})

Deno.test('create-org: non-JSON content type is rejected', async () => {
  const { ctx } = fakeCtx({ data: 'x', error: null })
  const err = await assertRejects(() => createOrg(post('name=Acme', 'text/plain'), ctx), HttpError)
  assertEquals(err.status, 400)
})

Deno.test('create-org: missing user -> 401', async () => {
  const { ctx } = fakeCtx({ data: 'x', error: null }, null)
  const err = await assertRejects(() => createOrg(post({ name: 'Acme' }), ctx), HttpError)
  assertEquals(err.status, 401)
})

// ---------- api-invite ----------
Deno.test('invite: stores only the hash and returns link with token in fragment', async () => {
  const { ctx, calls } = fakeCtx({ data: { id: 'inv-1', expires_at: '2026-10-22T00:00:00Z' }, error: null })
  const res = await invite(
    post({ org_id: '0a000000-0000-4000-8000-00000000000a', email: ' New@Acme.dev ', role: 'manager' }),
    ctx,
    'https://app.exitbrain.dev',
  )
  assertEquals(res.status, 201)
  const body = await res.json()
  const match = /^https:\/\/app\.exitbrain\.dev\/invite\/accept#token=([A-Za-z0-9_-]{43})$/.exec(
    body.invite_url,
  )
  if (!match) throw new Error(`bad invite_url: ${body.invite_url}`)
  const token = match[1]!

  const args = calls[0]!.args
  assertEquals(calls[0]!.fn, 'create_invitation')
  assertEquals(args.p_email, 'new@acme.dev')
  assertEquals(args.p_role, 'manager')
  assertEquals(args.p_token_hash, await sha256Hex(token))
  // raw token never sent to the database
  assertEquals(Object.values(args).includes(token), false)
})

Deno.test('invite: owner role and bad email rejected before DB call', async () => {
  const { ctx, calls } = fakeCtx({ data: null, error: null })
  for (
    const body of [
      { org_id: '0a000000-0000-4000-8000-00000000000a', email: 'a@b.dev', role: 'owner' },
      { org_id: '0a000000-0000-4000-8000-00000000000a', email: 'not-an-email', role: 'viewer' },
      { org_id: 'not-a-uuid', email: 'a@b.dev', role: 'viewer' },
    ]
  ) {
    const err = await assertRejects(() => invite(post(body), ctx, 'https://app.exitbrain.dev'), HttpError)
    assertEquals(err.status, 400)
  }
  assertEquals(calls.length, 0)
})

Deno.test('invite: RLS denial -> 403, duplicate -> 409', async () => {
  const body = { org_id: '0a000000-0000-4000-8000-00000000000a', email: 'a@b.dev', role: 'viewer' }
  const denied = fakeCtx({
    data: null,
    error: { code: '42501', message: 'only owners and admins can invite' },
  })
  assertEquals(
    (await assertRejects(() => invite(post(body), denied.ctx, 'https://x.dev'), HttpError)).status,
    403,
  )
  const dup = fakeCtx({ data: null, error: { code: '23505', message: 'duplicate' } })
  assertEquals(
    (await assertRejects(() => invite(post(body), dup.ctx, 'https://x.dev'), HttpError)).status,
    409,
  )
})

// ---------- api-accept-invite ----------
Deno.test('accept-invite: success returns org_id', async () => {
  const { ctx, calls } = fakeCtx({ data: 'org-1', error: null })
  const token = 'tok_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  const res = await acceptInvite(post({ token }), ctx)
  assertEquals(res.status, 200)
  assertEquals(await res.json(), { org_id: 'org-1' })
  assertEquals(calls[0], { fn: 'accept_invitation', args: { p_token: token } })
})

Deno.test('accept-invite: invalid token -> generic 400', async () => {
  const { ctx } = fakeCtx({ data: null, error: { code: '22023', message: 'invalid invitation' } })
  const err = await assertRejects(
    () => acceptInvite(post({ token: 'x'.repeat(43) }), ctx),
    HttpError,
  )
  assertEquals(err.status, 400)
  assertMatch(err.message, /invalid, expired or for a different email/)
})

Deno.test('accept-invite: short token rejected before DB call', async () => {
  const { ctx, calls } = fakeCtx({ data: 'org-1', error: null })
  await assertRejects(() => acceptInvite(post({ token: 'short' }), ctx), HttpError)
  assertEquals(calls.length, 0)
})

Deno.test('readJson: oversized declared body rejected before reading', async () => {
  const { ctx, calls } = fakeCtx({ data: 'org-1', error: null })
  const req = new Request('http://localhost/fn', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'content-length': String(1024 * 1024) },
    body: JSON.stringify({ name: 'Acme' }),
  })
  const err = await assertRejects(() => createOrg(req, ctx), HttpError)
  assertEquals(err.status, 413)
  assertEquals(calls.length, 0)
})
