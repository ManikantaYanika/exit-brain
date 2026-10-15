/**
 * Error envelope + Postgres error mapping shared by all Edge Functions.
 * Response shape on failure: { "error": { "code": string, "message": string } }
 * Internal details (SQL text, stack traces, tokens) never leave the function.
 */

export type ErrorCode =
  | 'bad_request'
  | 'unauthenticated'
  | 'forbidden'
  | 'not_found'
  | 'method_not_allowed'
  | 'conflict'
  | 'unprocessable'
  | 'internal'

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ErrorCode,
    message: string,
  ) {
    super(message)
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
}

export function errorResponse(err: HttpError): Response {
  return json({ error: { code: err.code, message: err.message } }, err.status)
}

/** Minimal shape of a PostgREST / Postgres error as returned by supabase-js. */
export interface DbError {
  code?: string
  message?: string
}

/**
 * Map Postgres SQLSTATE codes raised by our RLS / RPCs to HTTP errors.
 * Messages are deliberately generic where detail could help an attacker.
 */
export function mapDbError(error: DbError, fallbackMessage = 'Request failed'): HttpError {
  switch (error.code) {
    case '28000':
      return new HttpError(401, 'unauthenticated', 'Sign in required')
    case '42501':
      return new HttpError(403, 'forbidden', 'You do not have permission to do this')
    case '22023':
      return new HttpError(400, 'bad_request', error.message ?? fallbackMessage)
    case '23505':
      return new HttpError(409, 'conflict', error.message ?? 'Already exists')
    case '23514':
    case '23503':
    case '22P02':
      return new HttpError(422, 'unprocessable', error.message ?? fallbackMessage)
    default:
      return new HttpError(500, 'internal', fallbackMessage)
  }
}

/** Structured log line (NFR-10). Never pass tokens or request bodies here. */
export function log(fn: string, fields: Record<string, unknown>): void {
  console.log(JSON.stringify({ fn, ts: new Date().toISOString(), ...fields }))
}

type Handler<C> = (req: Request, ctx: C) => Promise<Response>

/** Enforce method, convert thrown HttpErrors to envelopes, hide unexpected errors. */
export function handle<C>(fn: string, method: 'POST' | 'GET', handler: Handler<C>): Handler<C> {
  return async (req, ctx) => {
    const started = Date.now()
    try {
      if (req.method !== method) {
        throw new HttpError(405, 'method_not_allowed', `Use ${method}`)
      }
      const res = await handler(req, ctx)
      log(fn, { status: res.status, ms: Date.now() - started })
      return res
    } catch (err) {
      if (err instanceof HttpError) {
        log(fn, { status: err.status, code: err.code, ms: Date.now() - started })
        return errorResponse(err)
      }
      log(fn, { status: 500, code: 'internal', ms: Date.now() - started, error: String(err).slice(0, 200) })
      return errorResponse(new HttpError(500, 'internal', 'Unexpected error'))
    }
  }
}
