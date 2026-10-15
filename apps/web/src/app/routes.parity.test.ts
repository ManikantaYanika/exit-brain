import { existsSync } from 'node:fs'
import { join } from 'node:path'
import type { RouteObject } from 'react-router'
import { describe, expect, it } from 'vitest'
import buildRoutes from '../routes'
import { routes as runtimeRoutes } from './routes'

/**
 * The app is built from src/routes.ts (framework mode), while tests and the single-file prototype
 * render src/app/routes.tsx. This test keeps the two URL trees identical.
 */
type ConfigEntry = { path?: string; index?: boolean; file: string; children?: ConfigEntry[] }

const join2 = (base: string, path?: string) =>
  path ? `${base.replace(/\/$/, '')}/${path}`.replace(/\/+/g, '/') : base

function fromConfig(entries: ConfigEntry[], base = '/'): string[] {
  return entries.flatMap((e) => {
    const here = join2(base, e.path)
    const self = e.index || (e.path !== undefined && !e.children?.length) ? [here] : []
    return [...self, ...fromConfig(e.children ?? [], here)]
  })
}

function fromRuntime(entries: RouteObject[], base = '/'): string[] {
  return entries.flatMap((e) => {
    const here = join2(base, e.path)
    const self = e.index || (e.path !== undefined && !e.children?.length) ? [here] : []
    return [...self, ...fromRuntime(e.children ?? [], here)]
  })
}

/** Build-only routes with no runtime equivalent: prerendered resource and the static 404 file. */
const BUILD_ONLY = new Set(['/sitemap.xml', '/404'])

describe('route parity (src/routes.ts ↔ src/app/routes.tsx)', () => {
  const config = buildRoutes as unknown as ConfigEntry[]

  it('defines the same URLs', () => {
    const built = new Set(fromConfig(config).filter((p) => !BUILD_ONLY.has(p)))
    const runtime = new Set(fromRuntime(runtimeRoutes))
    expect([...built].sort()).toEqual([...runtime].sort())
  })

  it('points every route at a file that exists', () => {
    const files = (function collect(es: ConfigEntry[]): string[] {
      return es.flatMap((e) => [e.file, ...collect(e.children ?? [])])
    })(config)
    for (const f of files) expect(existsSync(join(process.cwd(), 'src', f)), f).toBe(true)
  })
})
