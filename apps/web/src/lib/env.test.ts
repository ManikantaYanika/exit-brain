import { describe, expect, it } from 'vitest'
import { isPrivilegedKey, parseEnv } from './env'

function fakeJwt(payload: Record<string, unknown>): string {
  const b64 = (o: unknown) =>
    btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.signature`
}

const anonKey = fakeJwt({ role: 'anon', iss: 'supabase' })
const serviceKey = fakeJwt({ role: 'service_role', iss: 'supabase' })

describe('parseEnv', () => {
  it('accepts a valid URL and anon key', () => {
    const env = parseEnv({ VITE_SUPABASE_URL: 'http://127.0.0.1:54321', VITE_SUPABASE_ANON_KEY: anonKey })
    expect(env.VITE_SUPABASE_URL).toBe('http://127.0.0.1:54321')
  })

  it('accepts a publishable key', () => {
    expect(() =>
      parseEnv({
        VITE_SUPABASE_URL: 'https://abc.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'sb_publishable_1234567890abcdefghij',
      }),
    ).not.toThrow()
  })

  it('rejects missing values with a helpful message', () => {
    expect(() => parseEnv({})).toThrow(/Invalid frontend environment/)
  })

  it('rejects an invalid URL', () => {
    expect(() => parseEnv({ VITE_SUPABASE_URL: 'not a url', VITE_SUPABASE_ANON_KEY: anonKey })).toThrow(
      /must be a valid URL/,
    )
  })

  it('refuses a service-role JWT in the browser', () => {
    expect(() =>
      parseEnv({ VITE_SUPABASE_URL: 'https://abc.supabase.co', VITE_SUPABASE_ANON_KEY: serviceKey }),
    ).toThrow(/service-role/)
  })

  it('refuses a sb_secret_ key in the browser', () => {
    expect(() =>
      parseEnv({
        VITE_SUPABASE_URL: 'https://abc.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'sb_secret_1234567890abcdefghij',
      }),
    ).toThrow(/service-role/)
  })
})

describe('isPrivilegedKey', () => {
  it('is false for anon and garbage keys', () => {
    expect(isPrivilegedKey(anonKey)).toBe(false)
    expect(isPrivilegedKey('a.b.c')).toBe(false)
    expect(isPrivilegedKey('plain-string')).toBe(false)
  })
})
