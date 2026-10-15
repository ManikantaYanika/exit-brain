/**
 * Invitation tokens: 32 random bytes, base64url (43 chars). Only sha256(token) is stored;
 * the raw token goes to the invitee in the link and nowhere else (T11).
 * The hash MUST match Postgres: encode(sha256(convert_to(token, 'UTF8')), 'hex').
 */

export function generateToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength))
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}
