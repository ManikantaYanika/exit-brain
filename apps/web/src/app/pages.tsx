import { Link } from 'react-router'

export function NotFound() {
  return (
    <section className="space-y-2">
      <h1 className="text-xl font-semibold">Page not found</h1>
      <Link to="/" className="text-brand underline">
        Go to transitions
      </Link>
    </section>
  )
}
