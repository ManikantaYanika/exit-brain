import { z } from './deps.ts'
import { HttpError } from './http.ts'

const MAX_BODY_BYTES = 16 * 1024

/** Parse and validate a JSON body. Rejects oversized, non-JSON and invalid payloads with 400. */
export async function readJson<S extends z.ZodType>(req: Request, schema: S): Promise<z.infer<S>> {
  const type = req.headers.get('content-type') ?? ''
  if (!type.toLowerCase().includes('application/json')) {
    throw new HttpError(400, 'bad_request', 'Content-Type must be application/json')
  }
  // Reject early on the declared size so a huge body is never buffered into memory.
  const declared = Number(req.headers.get('content-length') ?? '0')
  if (declared > MAX_BODY_BYTES) {
    throw new HttpError(413, 'bad_request', 'Request body too large')
  }
  const text = await req.text()
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    throw new HttpError(400, 'bad_request', 'Request body too large')
  }
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new HttpError(400, 'bad_request', 'Body is not valid JSON')
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    const where = first?.path.length ? `${first.path.join('.')}: ` : ''
    throw new HttpError(400, 'bad_request', `${where}${first?.message ?? 'Invalid request'}`)
  }
  return parsed.data
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
    return true
  } catch {
    return false
  }
}
