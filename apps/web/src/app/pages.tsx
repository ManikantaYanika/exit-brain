import { Link } from 'react-router'

export function Home() {
  return (
    <section aria-labelledby="home-title" className="space-y-2">
      <h1 id="home-title" className="text-2xl font-semibold">
        Knowledge transfer, evidence first
      </h1>
      <p className="text-slate-600">Sign-in and onboarding are coming in the next task.</p>
    </section>
  )
}

export function NotFound() {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link to="/" className="text-indigo-700 underline">
        Go home
      </Link>
    </section>
  )
}
