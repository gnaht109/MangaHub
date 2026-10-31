import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'
import { signInAs, customer } from '../test/fixtures.js'
import { getCart, removeCartItem } from '../lib/cart.js'

vi.mock('../lib/cart.js', () => ({ getCart: vi.fn(), addCartItem: vi.fn(), removeCartItem: vi.fn() }))

const item = (mangaId, title, quantity, unitPrice) => ({ id: mangaId, mangaId, title, quantity, unitPrice, lineTotal: quantity * unitPrice })
const full = {
  id: 1,
  items: [item('m1', 'Đảo Hải Tặc', 2, 25000), item('m2', 'Naruto', 1, 22000)],
  subTotal: 72000,
}

describe('Cart page', () => {
  beforeEach(() => {
    signInAs(customer)
    getCart.mockResolvedValue(full)
  })

  it('lists rows with title link, quantity, unit price, line total and the subtotal', async () => {
    renderApp('/cart')
    const link = await screen.findByRole('link', { name: 'Đảo Hải Tặc' })
    expect(link.getAttribute('href')).toBe('/manga/m1')
    const row = link.closest('li')
    expect(within(row).getByText('Qty 2')).toBeTruthy()
    expect(within(row).getByText('25.000 ₫ each')).toBeTruthy()
    expect(within(row).getByText('50.000 ₫')).toBeTruthy()
    const summary = screen.getByRole('complementary', { name: 'Summary' })
    expect(within(summary).getByText('72.000 ₫')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Checkout opens soon' }).disabled).toBe(true)
  })

  it('removes an item and shows the returned cart', async () => {
    removeCartItem.mockResolvedValue({ id: 1, items: [full.items[1]], subTotal: 22000 })
    renderApp('/cart')
    await userEvent.click(await screen.findByRole('button', { name: 'Remove Đảo Hải Tặc' }))
    expect(removeCartItem).toHaveBeenCalledWith('m1')
    await vi.waitFor(() => expect(screen.queryByRole('link', { name: 'Đảo Hải Tặc' })).toBeNull())
    expect(screen.getByRole('link', { name: 'Naruto' })).toBeTruthy()
  })

  it('keeps the list and shows an error when remove fails', async () => {
    removeCartItem.mockRejectedValue(new Error('Could not remove that item.'))
    renderApp('/cart')
    await userEvent.click(await screen.findByRole('button', { name: 'Remove Naruto' }))
    expect(await screen.findByText('Could not remove that item.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Naruto' })).toBeTruthy()
  })

  it('shows the empty state with a catalog link', async () => {
    getCart.mockResolvedValue({ id: 1, items: [], subTotal: 0 })
    renderApp('/cart')
    expect(await screen.findByText('Your cart is empty.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Browse catalog' }).getAttribute('href')).toBe('/')
    expect(screen.queryByText(/being built/)).toBeNull()
  })

  it('shows a load error and refetches on Try again', async () => {
    getCart.mockRejectedValueOnce(new Error('Cart is unavailable.'))
    renderApp('/cart')
    expect(await screen.findByText('Cart is unavailable.')).toBeTruthy()
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('link', { name: 'Naruto' })).toBeTruthy()
    expect(getCart).toHaveBeenCalledTimes(2)
  })

  it('sends guests to sign in', async () => {
    localStorage.clear()
    sessionStorage.clear()
    renderApp('/cart')
    expect((await screen.findByTestId('location')).textContent).toBe('/login?next=%2Fcart')
  })
})
