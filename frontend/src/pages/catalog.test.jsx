import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'
import { sampleManga, signInAs, admin } from '../test/fixtures.js'
import { ApiError } from '../lib/api.js'
import { listManga } from '../lib/manga.js'

vi.mock('../lib/manga.js', () => ({ listManga: vi.fn(), getManga: vi.fn(), createManga: vi.fn() }))
vi.mock('../lib/cart.js', () => ({ getCart: vi.fn(async () => ({ id: 1, items: [], subTotal: 0 })), addCartItem: vi.fn(), removeCartItem: vi.fn() }))

describe('Catalog', () => {
  it('shows the hook, the flash sale strip and every volume', async () => {
    listManga.mockResolvedValue(sampleManga)
    renderApp('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Printed manga, volume by volume.' })).toBeTruthy()
    expect(screen.getByRole('link', { name: /flash sales — coming soon/i }).getAttribute('href')).toBe('/flash-sale')
    expect(await screen.findByText('3 volumes')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /printed volume/i })).toHaveLength(3)
  })

  it('filters by ?q ignoring accents', async () => {
    listManga.mockResolvedValue(sampleManga)
    renderApp('/?q=dao')
    expect(await screen.findByText('1 match for “dao”')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Đảo Hải Tặc' })).toBeTruthy()
  })

  it('searches from the hook and clears with Browse all', async () => {
    listManga.mockResolvedValue(sampleManga)
    renderApp('/')
    await screen.findByText('3 volumes')
    await userEvent.type(screen.getByLabelText('Search title or author'), 'zzz{Enter}')
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/?q=zzz'))
    expect(screen.getByText('No volumes match “zzz”.')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Browse all' }))
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/'))
    expect(screen.getByText('3 volumes')).toBeTruthy()
  })

  it('shows an empty catalog, with an add action for admins', async () => {
    listManga.mockResolvedValue([])
    signInAs(admin)
    renderApp('/')
    expect(await screen.findByText('No volumes yet.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Add the first title' }).getAttribute('href')).toBe('/admin/titles/new')
  })

  it('asks guests to sign in when the API refuses anonymous access', async () => {
    listManga.mockRejectedValue(new ApiError(403, 'Something went wrong. Please try again.'))
    renderApp('/')
    expect(await screen.findByText('Sign in to browse the catalog')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Sign in to browse' }).getAttribute('href')).toBe('/login?next=%2F')
  })

  it('offers retry on other errors', async () => {
    listManga.mockRejectedValueOnce(new ApiError(0, "Can't reach the server.")).mockResolvedValueOnce(sampleManga)
    renderApp('/')
    expect((await screen.findByRole('alert')).textContent).toContain("Can't reach the server.")
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('3 volumes')).toBeTruthy()
    expect(listManga).toHaveBeenCalledTimes(2)
  })
})
