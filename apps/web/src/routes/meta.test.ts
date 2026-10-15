import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { appMeta, pageMeta, SITE_URL } from './meta'

describe('page metadata', () => {
  it('public pages carry title, description, canonical and Open Graph', () => {
    const m = pageMeta({ path: '/', title: 'T', description: 'D' })
    expect(m).toContainEqual({ title: 'T' })
    expect(m).toContainEqual({ name: 'description', content: 'D' })
    expect(m).toContainEqual({ tagName: 'link', rel: 'canonical', href: `${SITE_URL}/` })
    expect(m).toContainEqual({ property: 'og:url', content: `${SITE_URL}/` })
  })

  it('app pages get a tab title and stay out of search results', () => {
    expect(appMeta('Team')).toEqual([{ title: 'Team — Exit Brain' }, { name: 'robots', content: 'noindex' }])
  })

  it('every page route module exports meta', async () => {
    const dir = join(process.cwd(), 'src/routes')
    const pages = readdirSync(dir).filter(
      (f) => f.endsWith('.tsx') && !['site-layout.tsx', 'auth-scope.tsx'].includes(f),
    )
    for (const f of pages) {
      const mod = (await import(`./${f.replace('.tsx', '')}.tsx`)) as { meta?: () => unknown[] }
      expect(typeof mod.meta, f).toBe('function')
      expect(mod.meta!().length, f).toBeGreaterThan(0)
    }
  })
})
