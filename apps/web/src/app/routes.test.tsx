import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'
import { routes } from './routes'

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
}

describe('routes', () => {
  it('renders the shell and home page', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Exit Brain' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /evidence first/i })).toBeInTheDocument()
  })

  it('renders not found for unknown paths', () => {
    renderAt('/does-not-exist')
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument()
  })
})
