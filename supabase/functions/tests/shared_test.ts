import { assert, assertEquals, assertMatch, assertNotEquals, assertThrows } from './assert.ts'
import { appOrigin, corsHeaders } from '../_shared/config.ts'
import { handle, HttpError, mapDbError } from '../_shared/http.ts'
import { generateToken, sha256Hex } from '../_shared/tokens.ts'
import { isValidTimeZone } from '../_shared/validate.ts'

Deno.test('sha256Hex matches Postgres encode(sha256(convert_to(t, UTF8)), hex)', async () => {
  // Value produced by Postgres 16 for the same input (see rls_core.test.sql invite token).
  assertEquals(
    await sha256Hex('tok_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'),
    '7c8cb03b1816f8633160ab25ee682801b1c19060598fc84c89b9a555e274a7b8',
  )
  // NIST test vector
  assertEquals(await sha256Hex('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
})

Deno.test('generateToken is 43-char base64url and unique', () => {
  const a = generateToken()
  const b = generateToken()
  assertMatch(a, /^[A-Za-z0-9_-]{43}$/)
  assertNotEquals(a, b)
})

Deno.test('mapDbError maps SQLSTATE codes to safe HTTP errors', () => {
  assertEquals(mapDbError({ code: '42501', message: 'policy x on table y' }).status, 403)
  assertEquals(
    mapDbError({ code: '42501', message: 'policy x on table y' }).message.includes('policy'),
    false,
  )
  assertEquals(mapDbError({ code: '28000' }).status, 401)
  assertEquals(mapDbError({ code: '23505' }).status, 409)
  assertEquals(mapDbError({ code: '23514' }).status, 422)
  const unknown = mapDbError({ code: 'XX000', message: 'internal SQL detail' }, 'Could not do it')
  assertEquals(unknown.status, 500)
  assertEquals(unknown.message, 'Could not do it')
})

Deno.test('appOrigin requires a bare origin', () => {
  const env = (v?: string) => ({ get: () => v })
  assertEquals(appOrigin(env('https://app.exitbrain.dev')), 'https://app.exitbrain.dev')
  assertEquals(appOrigin(env('http://localhost:5173/')), 'http://localhost:5173')
  assertThrows(() => appOrigin(env(undefined)), Error, 'APP_ORIGIN is not set')
  assertThrows(() => appOrigin(env('https://app.exitbrain.dev/path')), Error, 'bare origin')
})

Deno.test('corsHeaders never uses a wildcard origin', () => {
  const h = corsHeaders('https://app.exitbrain.dev')
  assertEquals(h['Access-Control-Allow-Origin'], 'https://app.exitbrain.dev')
  assert(!Object.values(h).includes('*'))
})

Deno.test('isValidTimeZone', () => {
  assert(isValidTimeZone('Asia/Kolkata'))
  assert(!isValidTimeZone('Mars/Olympus'))
})

Deno.test('handle(): wrong method -> 405 envelope', async () => {
  const h = handle('t', 'POST', () => Promise.resolve(new Response('ok')))
  const res = await h(new Request('http://x', { method: 'GET' }), {})
  assertEquals(res.status, 405)
  assertEquals((await res.json()).error.code, 'method_not_allowed')
})

Deno.test('handle(): unexpected errors are hidden', async () => {
  const h = handle('t', 'POST', () => Promise.reject(new Error('db password is hunter2')))
  const res = await h(new Request('http://x', { method: 'POST' }), {})
  assertEquals(res.status, 500)
  const body = await res.text()
  assert(!body.includes('hunter2'))
})

Deno.test('handle(): HttpError becomes envelope', async () => {
  const h = handle('t', 'POST', () => Promise.reject(new HttpError(403, 'forbidden', 'nope')))
  const res = await h(new Request('http://x', { method: 'POST' }), {})
  assertEquals(res.status, 403)
  assertEquals(await res.json(), { error: { code: 'forbidden', message: 'nope' } })
})
