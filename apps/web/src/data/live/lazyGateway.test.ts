import { describe, expect, it, vi } from 'vitest'
import type { AuthGateway, Session } from '../auth'
import { createLazyGateway } from './lazyGateway'

const session: Session = {
  userId: 'u1',
  name: 'Asha',
  email: 'a@b.co',
  role: 'manager',
  roleLabel: 'Manager',
  orgName: 'Acme',
  homeTransitionId: null,
  mode: 'live',
}

function fakeGateway() {
  const listeners = new Set<() => void>()
  const g: AuthGateway = {
    mode: 'live',
    getSession: vi.fn(async () => session),
    onChange: vi.fn((l: () => void) => {
      listeners.add(l)
      return () => listeners.delete(l)
    }),
    signIn: vi.fn(async () => session),
    signUp: vi.fn(async () => ({ needsConfirmation: true })),
    sendMagicLink: vi.fn(async () => {}),
    signOut: vi.fn(async () => {}),
    createWorkspace: vi.fn(async () => {}),
  }
  return { g, emit: () => listeners.forEach((l) => l()), listeners }
}

describe('createLazyGateway', () => {
  it('loads nothing until first use', () => {
    const load = vi.fn()
    const lazy = createLazyGateway('live', load)
    expect(lazy.mode).toBe('live')
    expect(load).not.toHaveBeenCalled()
  })

  it('loads once and delegates every call', async () => {
    const { g } = fakeGateway()
    const load = vi.fn(async () => g)
    const lazy = createLazyGateway('live', load)
    expect(await lazy.getSession()).toEqual(session)
    await lazy.signIn('a@b.co', 'pw123456')
    await lazy.signUp({ name: 'A', email: 'a@b.co', password: 'pw123456' })
    await lazy.sendMagicLink('a@b.co')
    await lazy.createWorkspace!({ name: 'Acme' })
    await lazy.signOut()
    expect(load).toHaveBeenCalledTimes(1)
    expect(g.signIn).toHaveBeenCalledWith('a@b.co', 'pw123456')
    expect(g.createWorkspace).toHaveBeenCalledWith({ name: 'Acme' })
  })

  it('subscribes after load and unsubscribes cleanly', async () => {
    const { g, emit, listeners } = fakeGateway()
    const lazy = createLazyGateway('live', async () => g)
    const listener = vi.fn()
    const unsubscribe = lazy.onChange(listener)
    await vi.waitFor(() => expect(listeners.size).toBe(1))
    emit()
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    expect(listeners.size).toBe(0)
  })

  it('an unsubscribe before load completes never subscribes', async () => {
    const { g, listeners } = fakeGateway()
    let resolve!: (x: AuthGateway) => void
    const lazy = createLazyGateway('live', () => new Promise((r) => (resolve = r)))
    const unsubscribe = lazy.onChange(() => {})
    unsubscribe()
    resolve(g)
    await Promise.resolve()
    await Promise.resolve()
    expect(listeners.size).toBe(0)
  })

  it('surfaces load failures to the caller', async () => {
    const lazy = createLazyGateway('live', async () => {
      throw new Error('Invalid frontend environment')
    })
    await expect(lazy.getSession()).rejects.toThrow('Invalid frontend environment')
  })
})
