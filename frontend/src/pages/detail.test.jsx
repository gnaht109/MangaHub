import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'
import { sampleManga, signInAs, customer } from '../test/fixtures.js'
import { ApiError } from '../lib/api.js'
import { getManga } from '../lib/manga.js'
import { addCartItem } from '../lib/cart.js'
import { listFlashSales } from '../lib/flashSale.js'

vi.mock('../lib/manga.js', () => ({ listManga: vi.fn(), getManga: vi.fn(), createManga: vi.fn() }))
vi.mock('../lib/cart.js', () => ({ getCart: vi.fn(async () => ({ id: 1, items: [], subTotal: 0 })), addCartItem: vi.fn(), removeCartItem: vi.fn() }))
vi.mock('../lib/flashSale.js', () => ({ listFlashSales: vi.fn(async () => []) }))

const saleFor = (mangaId, discountedPrice) => ({
  id: 7, status: 'ACTIVE',
  items: [{ id: 11, mangaId, discountedPrice, saleQuantityLimit: 5, quantitySold: 2, availableStock: 3, flashSaleId: 7 }],
})

// One ACTIVE sale holding a single m1 item; the item id doubles as the sale id.
const liveSale = (itemId, discountedPrice, availableStock) => ({
  id: itemId, status: 'ACTIVE',
  items: [{ id: itemId, mangaId: 'm1', discountedPrice, saleQuantityLimit: 10, quantitySold: 0, availableStock, flashSaleId: itemId }],
})
const withStock = (availableStock) => ({ ...sampleManga[0], availableStock })

describe('MangaDetail', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows title, author, price and description', async () => {
    getManga.mockResolvedValue(sampleManga[0])
    renderApp('/manga/m1')
    expect(await screen.findByRole('heading', { level: 1, name: 'Đảo Hải Tặc' })).toBeTruthy()
    expect(getManga).toHaveBeenCalledWith('m1')
    expect(screen.getByText('Eiichiro Oda')).toBeTruthy()
    expect(screen.getAllByText('25.000 ₫')).toHaveLength(1)
    expect(screen.getByText('Pirates.')).toBeTruthy()
  })

  it('says so when there is no description', async () => {
    getManga.mockResolvedValue(sampleManga[1])
    renderApp('/manga/m2')
    expect(await screen.findByText('No description yet.')).toBeTruthy()
  })

  it('shows a not-found notice for MANGA_NOT_FOUND', async () => {
    getManga.mockRejectedValue(new ApiError(404, 'Manga not found', 404))
    renderApp('/manga/missing')
    expect(await screen.findByText("This volume isn't in the catalog.")).toBeTruthy()
  })

  it('sends guests to sign in from Add to cart', async () => {
    getManga.mockResolvedValue(sampleManga[0])
    renderApp('/manga/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Add to cart' }))
    expect(screen.getByTestId('location').textContent).toBe('/login?next=%2Fmanga%2Fm1')
  })

  it('adds to the cart for signed-in users', async () => {
    signInAs(customer)
    getManga.mockResolvedValue(sampleManga[0])
    addCartItem.mockResolvedValue({ id: 1, items: [], subTotal: 0 })
    renderApp('/manga/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Add to cart' }))
    expect(addCartItem).toHaveBeenCalledWith('m1', 1, undefined)
    expect(await screen.findByText('Added to your cart.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'View cart' }).getAttribute('href')).toBe('/cart')
  })

  it('disables Add to cart while the add is pending', async () => {
    signInAs(customer)
    getManga.mockResolvedValue(sampleManga[0])
    addCartItem.mockReturnValue(new Promise(() => {}))
    renderApp('/manga/m1')
    const button = await screen.findByRole('button', { name: 'Add to cart' })
    await userEvent.click(button)
    expect(button.disabled).toBe(true)
  })

  it('shows the server message when the add fails', async () => {
    signInAs(customer)
    getManga.mockResolvedValue(sampleManga[0])
    addCartItem.mockRejectedValue(new ApiError(409, 'Out of stock', 409))
    renderApp('/manga/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Add to cart' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Out of stock')
    expect(screen.queryByText('Added to your cart.')).toBeNull()
  })

  it('shows the flash sale price with the regular price struck through', async () => {
    getManga.mockResolvedValue(sampleManga[0])
    listFlashSales.mockResolvedValue([saleFor('m1', 19000)])
    renderApp('/manga/m1')
    expect(await screen.findByText('19.000 ₫')).toBeTruthy()
    expect(screen.getByText('Flash sale')).toBeTruthy()
    expect(screen.getByText('25.000 ₫').closest('s')).toBeTruthy()
    expect(screen.getByText('Regular price', { exact: false }).className).toContain('visually-hidden')
    expect(screen.queryByText('Printed volume')).toBeNull()
  })

  it('adds the sale item when a flash sale is live', async () => {
    signInAs(customer)
    getManga.mockResolvedValue(sampleManga[0])
    listFlashSales.mockResolvedValue([saleFor('m1', 19000)])
    addCartItem.mockResolvedValue({ id: 1, items: [], subTotal: 0 })
    renderApp('/manga/m1')
    await screen.findByText('19.000 ₫')
    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    expect(addCartItem).toHaveBeenCalledWith('m1', 1, 11)
  })

  it('adds the sale item the page shows even when the URL id differs in form', async () => {
    signInAs(customer)
    getManga.mockResolvedValue(sampleManga[0]) // backend normalises /manga/007 to id m1
    listFlashSales.mockResolvedValue([saleFor('m1', 19000)])
    addCartItem.mockResolvedValue({ id: 1, items: [], subTotal: 0 })
    renderApp('/manga/007')
    await screen.findByText('19.000 ₫')
    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    expect(addCartItem).toHaveBeenCalledWith('007', 1, 11)
  })

  it('adds the cheapest live sale item', async () => {
    signInAs(customer)
    getManga.mockResolvedValue(sampleManga[0])
    listFlashSales.mockResolvedValue([liveSale(11, 19000, 4), liveSale(12, 15000, 4)])
    addCartItem.mockResolvedValue({ id: 1, items: [], subTotal: 0 })
    renderApp('/manga/m1')
    await screen.findByText('15.000 ₫')
    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    expect(addCartItem).toHaveBeenCalledWith('m1', 1, 12)
  })

  it('uses the regular offer when the sale item is sold out', async () => {
    signInAs(customer)
    getManga.mockResolvedValue(withStock(3))
    listFlashSales.mockResolvedValue([liveSale(11, 19000, 0)])
    addCartItem.mockResolvedValue({ id: 1, items: [], subTotal: 0 })
    renderApp('/manga/m1')
    await vi.waitFor(() => expect(listFlashSales).toHaveBeenCalled())
    expect(await screen.findByText('25.000 ₫')).toBeTruthy()
    expect(screen.getByText('Printed volume')).toBeTruthy()
    expect(screen.queryByText('19.000 ₫')).toBeNull()
    expect(screen.getByText('Only 3 left')).toBeTruthy()
    const button = screen.getByRole('button', { name: 'Add to cart' })
    expect(button.disabled).toBe(false)
    await userEvent.click(button)
    expect(addCartItem).toHaveBeenCalledWith('m1', 1, undefined)
  })

  it('skips a sold-out cheaper sale for an in-stock pricier one', async () => {
    signInAs(customer)
    getManga.mockResolvedValue(sampleManga[0])
    listFlashSales.mockResolvedValue([liveSale(12, 15000, 0), liveSale(11, 19000, 4)])
    addCartItem.mockResolvedValue({ id: 1, items: [], subTotal: 0 })
    renderApp('/manga/m1')
    expect(await screen.findByText('19.000 ₫')).toBeTruthy()
    expect(screen.getByText('Only 4 left')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }))
    expect(addCartItem).toHaveBeenCalledWith('m1', 1, 11)
  })

  it('shows Only N left at the threshold of 5', async () => {
    getManga.mockResolvedValue(withStock(5))
    renderApp('/manga/m1')
    expect(await screen.findByText('Only 5 left')).toBeTruthy()
  })

  it('shows no stock line above the threshold', async () => {
    getManga.mockResolvedValue(withStock(6))
    renderApp('/manga/m1')
    await screen.findByRole('button', { name: 'Add to cart' })
    expect(screen.queryByText(/left$/)).toBeNull()
  })

  it('shows Out of stock and blocks the add', async () => {
    signInAs(customer)
    getManga.mockResolvedValue(withStock(0))
    renderApp('/manga/m1')
    const button = await screen.findByRole('button', { name: 'Out of stock' })
    expect(button.disabled).toBe(true)
    await userEvent.click(button)
    expect(addCartItem).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Add to cart' })).toBeNull()
  })

  it('does not send guests to login from Out of stock', async () => {
    getManga.mockResolvedValue(withStock(0))
    renderApp('/manga/m1')
    await userEvent.click(await screen.findByRole('button', { name: 'Out of stock' }))
    expect(screen.getByTestId('location').textContent).toBe('/manga/m1')
  })

  it('uses sale stock over regular stock', async () => {
    getManga.mockResolvedValue(withStock(0))
    listFlashSales.mockResolvedValue([liveSale(11, 19000, 2)])
    renderApp('/manga/m1')
    expect(await screen.findByText('Only 2 left')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Add to cart' }).disabled).toBe(false)
  })

  it('keeps the base price when the sales request fails', async () => {
    getManga.mockResolvedValue(sampleManga[0])
    listFlashSales.mockRejectedValue(new Error('down'))
    renderApp('/manga/m1')
    expect(await screen.findByText('25.000 ₫')).toBeTruthy()
    expect(screen.getByText('Printed volume')).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('ignores sales that do not include this volume', async () => {
    getManga.mockResolvedValue(sampleManga[1])
    listFlashSales.mockResolvedValue([saleFor('m1', 19000)])
    renderApp('/manga/m2')
    expect(await screen.findByText('22.000 ₫')).toBeTruthy()
    expect(listFlashSales).toHaveBeenCalled()
    expect(screen.queryByText('Flash sale')).toBeNull()
  })
})
