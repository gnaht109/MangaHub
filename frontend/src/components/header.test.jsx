import { describe, it, beforeEach, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'
import { listManga } from '../lib/manga.js'
import { getCart } from '../lib/cart.js'
import { signInAs, admin, customer } from '../test/fixtures.js'

vi.mock('../lib/manga.js', () => ({ listManga: vi.fn(), getManga: vi.fn(), createManga: vi.fn() }))
vi.mock('../lib/cart.js', () => ({ getCart: vi.fn(async () => ({ id: 1, items: [], subTotal: 0 })), addCartItem: vi.fn(), removeCartItem: vi.fn() }))

describe('Header and layout', () => {
  beforeEach(() => listManga.mockResolvedValue([]))

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

  it.each([
    [[{ mangaId: 1, quantity: 2 }, { mangaId: 2, quantity: 1 }], 'Cart, 3 items'],
    [[{ mangaId: 1, quantity: 1 }], 'Cart, 1 item'],
  ])('labels the Cart link with the volume count', async (items, name) => {
    getCart.mockResolvedValue({ id: 1, items, subTotal: 0 })
    signInAs(customer)
    renderApp('/nowhere')
    expect(await screen.findByRole('link', { name })).toBeTruthy()
  })

  it.each([
    ['empty', () => getCart.mockResolvedValue({ id: 1, items: [], subTotal: 0 }), true],
    ['errored', () => getCart.mockRejectedValue(new Error('x')), true],
    ['signed out', () => {}, false],
  ])('shows a plain Cart link when %s', async (_, setup, signedIn) => {
    setup()
    if (signedIn) signInAs(customer)
    renderApp('/nowhere')
    await waitFor(() => expect(getCart).toHaveBeenCalledTimes(signedIn ? 1 : 0))
    await new Promise((r) => setTimeout(r, 0))
    expect(screen.getByRole('link', { name: 'Cart' })).toBeTruthy()
  })

  it('submits header search to the catalog query', async () => {
    renderApp('/nowhere')
    await userEvent.type(screen.getByLabelText('Search the store'), '  naruto ')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(screen.getByTestId('location').textContent).toBe('/?q=naruto')
  })

  it('clears the search box when navigating away from ?q', async () => {
    renderApp('/?q=naruto')
    const input = screen.getByLabelText('Search the store')
    expect(input.value).toBe('naruto')
    await userEvent.click(screen.getByRole('link', { name: 'Catalog' }))
    await waitFor(() => expect(input.value).toBe(''))
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
