import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'
import { sampleManga } from '../test/fixtures.js'
import { listFlashSales } from '../lib/flashSale.js'
import { listManga } from '../lib/manga.js'

vi.mock('../lib/flashSale.js', () => ({ listFlashSales: vi.fn() }))
vi.mock('../lib/manga.js', () => ({ listManga: vi.fn(), getManga: vi.fn(), createManga: vi.fn() }))
vi.mock('../lib/cart.js', () => ({ getCart: vi.fn(async () => ({ id: 1, items: [], subTotal: 0 })), addCartItem: vi.fn(), removeCartItem: vi.fn() }))

const item = (mangaId, discountedPrice, limit, sold, id = mangaId) => ({ id, flashSaleId: 1, mangaId, discountedPrice, saleQuantityLimit: limit, quantitySold: sold })
const sale = (over) => ({ id: 1, name: 'Autumn drop', status: 'ACTIVE', startDate: '2026-10-30', endDate: '2026-11-03', items: [], ...over })

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 9, 31, 12))
  listManga.mockResolvedValue(sampleManga)
})
afterEach(() => vi.useRealTimers())

describe('Flash Sale page', () => {
  it('shows a running sale with its items', async () => {
    listFlashSales.mockResolvedValue([sale({ items: [item('m1', 15000, 10, 4), item('m2', 12000, 5, 5)] })])
    renderApp('/flash-sale')
    expect(await screen.findByRole('heading', { name: 'Autumn drop' })).toBeTruthy()
    expect(screen.getByText('30 Oct – 3 Nov')).toBeTruthy()
    expect(screen.getByText('3 days left')).toBeTruthy()
    const link = screen.getByRole('link', { name: /Đảo Hải Tặc/ })
    expect(link.getAttribute('href')).toBe('/manga/m1')
    expect(within(link).getByText(/15\.000/)).toBeTruthy()
    expect(within(link).getByText(/25\.000/).tagName).toBe('S')
    expect(within(link).getByText('6 left')).toBeTruthy()
    const gone = screen.getByRole('link', { name: /Naruto/ })
    expect(within(gone).getByText('Sold out')).toBeTruthy()
    expect(within(gone).queryByText(/left/)).toBeNull()
  })

  it('shows an upcoming sale and hides ended ones', async () => {
    listFlashSales.mockResolvedValue([
      sale({ id: 2, name: 'Winter drop', status: 'UPCOMING', startDate: '2026-11-03', endDate: '2026-11-05', items: [item('m3', 30000, 5, 0)] }),
      sale({ id: 3, name: 'Old drop', status: 'ENDED' }),
      sale({ id: 4, name: 'Pulled drop', status: 'CANCELLED' }),
    ])
    renderApp('/flash-sale')
    expect(await screen.findByRole('heading', { name: 'Winter drop' })).toBeTruthy()
    expect(screen.getByText('Starts in 3 days')).toBeTruthy()
    expect(screen.queryByText('Old drop')).toBeNull()
    expect(screen.queryByText('Pulled drop')).toBeNull()
  })

  it('keeps the header of a sale with no items', async () => {
    listFlashSales.mockResolvedValue([sale()])
    renderApp('/flash-sale')
    expect(await screen.findByRole('heading', { name: 'Autumn drop' })).toBeTruthy()
    expect(screen.getByText('No volumes in this sale yet.')).toBeTruthy()
  })

  it('says so when there are no sales', async () => {
    listFlashSales.mockResolvedValue([])
    renderApp('/flash-sale')
    expect(await screen.findByText('No flash sales right now.')).toBeTruthy()
  })

  it('offers Try again when loading fails', async () => {
    listFlashSales.mockRejectedValueOnce(new Error('boom'))
    renderApp('/flash-sale')
    expect(await screen.findByText('boom')).toBeTruthy()
    listFlashSales.mockResolvedValue([])
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByText('No flash sales right now.')).toBeTruthy()
  })

  it('keeps the obi legend and Notify me', async () => {
    listFlashSales.mockResolvedValue([])
    renderApp('/flash-sale')
    expect(screen.getByRole('heading', { level: 1, name: 'Flash sales' })).toBeTruthy()
    const legend = screen.getByRole('list', { name: 'Obi states' })
    expect(legend.querySelectorAll('li')).toHaveLength(4)
    expect(legend.textContent).not.toMatch(/\d/)
    await userEvent.click(screen.getByRole('button', { name: 'Notify me' }))
    expect(screen.getByText("Notifications aren't available yet.")).toBeTruthy()
  })
})
