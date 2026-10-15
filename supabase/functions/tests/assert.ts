// Tiny assertion helpers on node:assert — no remote test dependency to download or pin.
import nodeAssert from 'node:assert/strict'

export function assert(cond: unknown, msg?: string): asserts cond {
  nodeAssert.ok(cond, msg)
}
export function assertEquals<T>(actual: T, expected: T, msg?: string): void {
  nodeAssert.deepStrictEqual(actual, expected, msg)
}
export function assertNotEquals<T>(actual: T, expected: T, msg?: string): void {
  nodeAssert.notDeepStrictEqual(actual, expected, msg)
}
export function assertMatch(actual: string, re: RegExp, msg?: string): void {
  nodeAssert.match(actual, re, msg)
}
// deno-lint-ignore no-explicit-any
type ErrorClass<E> = new (...args: any[]) => E

export function assertThrows<E extends Error>(fn: () => unknown, cls: ErrorClass<E>, includes?: string): E {
  try {
    fn()
  } catch (e) {
    nodeAssert.ok(e instanceof cls, `expected ${cls.name}, got ${String(e)}`)
    if (includes) nodeAssert.ok((e as Error).message.includes(includes), `message: ${(e as Error).message}`)
    return e as E
  }
  throw new Error('expected function to throw')
}
export async function assertRejects<E extends Error>(
  fn: () => Promise<unknown>,
  cls: ErrorClass<E>,
): Promise<E> {
  try {
    await fn()
  } catch (e) {
    nodeAssert.ok(e instanceof cls, `expected ${cls.name}, got ${String(e)}`)
    return e as E
  }
  throw new Error('expected promise to reject')
}
