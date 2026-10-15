/**
 * Runtime config for Edge Functions. CORS is restricted to the app origin
 * (security-and-privacy.md §5.9) instead of the library default.
 */

export function appOrigin(env: { get(key: string): string | undefined } = Deno.env): string {
  const origin = env.get('APP_ORIGIN')
  if (!origin) throw new Error('APP_ORIGIN is not set')
  const url = new URL(origin)
  if (url.origin !== origin.replace(/\/$/, '')) {
    throw new Error('APP_ORIGIN must be a bare origin like https://app.example.com')
  }
  return url.origin
}

export function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  }
}
