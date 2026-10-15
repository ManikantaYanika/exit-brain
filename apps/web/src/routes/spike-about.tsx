import { pageMeta } from './meta'

export const meta = () =>
  pageMeta({
    path: '/spike-about',
    title: 'Spike page — Exit Brain',
    description: 'Second prerendered page used only to verify the W1 rendering spike.',
  })

export default function Route() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Spike: second prerendered page</h1>
      <p className="mt-3 text-muted">This text must appear in build/client/spike-about/index.html.</p>
    </section>
  )
}
