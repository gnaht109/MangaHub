import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'
import { signInAs, admin, customer } from '../test/fixtures.js'

describe('Header and layout', () => {
  it('shows nav and Sign in for guests', () => {
    renderApp('/nowhere')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(nav.textContent).toContain('Catalog')
    expect(nav.textContent).toContain('Flash Sale')
    expect(nav.textContent).toContain('Cart')
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull()
  })

  it('shows the user name, and Admin only for admins', () => {
    signInAs(customer)
    const { unmount } = renderApp('/nowhere')
    expect(screen.getByRole('link', { name: 'Minh Nguyen' }).getAttribute('href')).toBe('/account')
    expect(screen.queryByRole('link', { name: 'Admin' })).toBeNull()
    unmount()
    signInAs(admin)
    renderApp('/nowhere')
    expect(screen.getByRole('link', { name: 'Admin' }).getAttribute('href')).toBe('/admin')
  })

  it('submits header search to the catalog query', async () => {
    renderApp('/nowhere')
    await userEvent.type(screen.getByLabelText('Search the store'), '  naruto ')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(screen.getByTestId('location').textContent).toBe('/?q=naruto')
  })

  it('toggles the mobile menu state', async () => {
    renderApp('/nowhere')
    const toggle = screen.getByRole('button', { name: 'Menu' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    await userEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })

  it('renders NotFound for unknown routes', () => {
    renderApp('/nowhere')
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy()
  })
})
