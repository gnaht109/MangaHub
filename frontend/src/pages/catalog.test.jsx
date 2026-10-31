import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'
import { sampleManga, signInAs, admin } from '../test/fixtures.js'
import { ApiError } from '../lib/api.js'
import { listManga } from '../lib/manga.js'
import { listFlashSales } from '../lib/flashSale.js'

const item = (mangaId, discountedPrice, limit = 10, sold = 0) => ({ id: mangaId, flashSaleId: 1, mangaId, discountedPrice, saleQuantityLimit: limit, quantitySold: sold })
const sale = (over) => ({ id: 1, name: 'Autumn drop', status: 'ACTIVE', startDate: '2026-10-30', endDate: '2026-11-03', items: [], ...over })

vi.mock('../lib/flashSale.js', () => ({ listFlashSales: vi.fn(async () => []) }))
vi.mock('../lib/manga.js', () => ({ listManga: vi.fn(), getManga: vi.fn(), createManga: vi.fn() }))
vi.mock('../lib/cart.js', () => ({ getCart: vi.fn(async () => ({ id: 1, items: [], subTotal: 0 })), addCartItem: vi.fn(), removeCartItem: vi.fn() }))

describe('Catalog', () => {
  it('shows the hook and every volume, with no strip when nothing is on sale', async () => {
    listManga.mockResolvedValue(sampleManga)
    renderApp('/')
    expect(screen.getByRole('heading', { level: 1, name: 'Printed manga, volume by volume.' })).toBeTruthy()
    expect(screen.getByText('Browse the catalog, open a title, add it to your cart.')).toBeTruthy()
    expect(await screen.findByText('3 volumes')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: /printed volume/i })).toHaveLength(3)
    expect(screen.queryByRole('link', { name: /live now/i })).toBeNull()
  })

  it('shows the sale price, struck base price and a strip for an active sale', async () => {
    listManga.mockResolvedValue(sampleManga)
    listFlashSales.mockResolvedValue([sale({ items: [item('m1', 15000), item('m2', 12000, 5, 5)] })])
    renderApp('/')
    const strip = await screen.findByRole('link', { name: /flash sales — live now/i })
    expect(strip.getAttribute('href')).toBe('/flash-sale')
    const card = screen.getByRole('link', { name: /Đảo Hải Tặc/ })
    expect(within(card).getByText('15.000 ₫')).toBeTruthy()
    expect(within(card).getByText(/25\.000/).tagName).toBe('S')
    expect(within(card).queryByText('Printed volume')).toBeNull()
    const soldOut = screen.getByRole('link', { name: /Naruto/ })
    expect(within(soldOut).getByText('22.000 ₫')).toBeTruthy()
    expect(within(soldOut).getByText('Printed volume')).toBeTruthy()
    expect(within(screen.getByRole('link', { name: /Monster/ })).getByText('Printed volume')).toBeTruthy()
  })

  it('keeps the strip for an active sale whose items are all sold out', async () => {
    listManga.mockResolvedValue(sampleManga)
    listFlashSales.mockResolvedValue([sale({ items: [item('m1', 15000, 5, 5)] })])
    renderApp('/')
    expect(await screen.findByRole('link', { name: /flash sales — live now/i })).toBeTruthy()
  })

  it('shows no strip for an upcoming sale', async () => {
    listManga.mockResolvedValue(sampleManga)
    listFlashSales.mockResolvedValue([sale({ status: 'UPCOMING', items: [item('m1', 15000)] })])
    renderApp('/')
    await screen.findByText('3 volumes')
    await waitFor(() => expect(listFlashSales).toHaveBeenCalled())
    expect(screen.queryByRole('link', { name: /live now/i })).toBeNull()
  })

  it('still shows every volume at base price when flash sales fail to load', async () => {
    listManga.mockResolvedValue(sampleManga)
    listFlashSales.mockRejectedValue(new ApiError(0, "Can't reach the server."))
    renderApp('/')
    expect(await screen.findByText('3 volumes')).toBeTruthy()
    await waitFor(() => expect(listFlashSales).toHaveBeenCalled())
    expect(screen.getAllByRole('link', { name: /printed volume/i })).toHaveLength(3)
    expect(screen.queryByRole('alert')).toBeNull()
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
