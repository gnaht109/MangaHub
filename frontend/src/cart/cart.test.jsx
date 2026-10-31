import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { AuthProvider } from '../auth/AuthContext.jsx'
import { CartProvider, useCart } from './CartContext.jsx'
import { ApiError } from '../lib/api.js'
import { getCart, addCartItem, removeCartItem } from '../lib/cart.js'
import { signInAs, customer, admin } from '../test/fixtures.js'
import { clearSession } from '../lib/session.js'

vi.mock('../lib/cart.js', () => ({ getCart: vi.fn(), addCartItem: vi.fn(), removeCartItem: vi.fn() }))

const cart = {
  id: 1,
  items: [
    { id: 1, mangaId: 1, title: 'A', quantity: 1, unitPrice: 10, lineTotal: 10 },
    { id: 2, mangaId: 2, title: 'B', quantity: 2, unitPrice: 10, lineTotal: 20 },
  ],
  subTotal: 30,
}
const bigger = { ...cart, items: [{ ...cart.items[0], quantity: 5 }], subTotal: 50 }

let ctx
let counts = []
function Probe() {
  ctx = useCart()
  counts.push(ctx.count)
  return <p data-testid="s">{ctx.status}:{ctx.count}</p>
}
const mount = () => render(<AuthProvider><CartProvider><Probe /></CartProvider></AuthProvider>)

describe('CartProvider', () => {
  beforeEach(() => {
    getCart.mockResolvedValue(cart)
    addCartItem.mockResolvedValue(bigger)
    removeCartItem.mockResolvedValue({ ...cart, items: [], subTotal: 0 })
  })

  it('loads the cart and counts quantities when signed in', async () => {
    signInAs(customer)
    mount()
    await waitFor(() => expect(screen.getByTestId('s').textContent).toBe('ready:3'))
  })

  it('does not call the api when signed out', () => {
    mount()
    expect(getCart).not.toHaveBeenCalled()
    expect(ctx.cart).toBeNull()
    expect(ctx.count).toBe(0)
    expect(ctx.status).toBe('idle')
  })

  it('clears the cart on sign-out', async () => {
    signInAs(customer)
    mount()
    await waitFor(() => expect(ctx.count).toBe(3))
    act(() => clearSession())
    expect(ctx.cart).toBeNull()
    expect(ctx.count).toBe(0)
    expect(ctx.status).toBe('idle')
  })

  it('add replaces the cart and resolves ok', async () => {
    signInAs(customer)
    mount()
    await waitFor(() => expect(ctx.count).toBe(3))
    let res
    await act(async () => { res = await ctx.add(1, 5) })
    expect(addCartItem).toHaveBeenCalledWith(1, 5)
    expect(res).toEqual({ ok: true, error: null })
    expect(ctx.count).toBe(5)
  })

  it('add failure resolves with the error and keeps the cart', async () => {
    signInAs(customer)
    mount()
    await waitFor(() => expect(ctx.count).toBe(3))
    const err = new ApiError(409, 'Out of stock')
    addCartItem.mockRejectedValue(err)
    let res
    await act(async () => { res = await ctx.add(1) })
    expect(res).toEqual({ ok: false, error: err })
    expect(ctx.count).toBe(3)
    expect(ctx.status).toBe('ready')
    expect(ctx.error).toBeNull()
  })

  it('remove replaces the cart', async () => {
    signInAs(customer)
    mount()
    await waitFor(() => expect(ctx.count).toBe(3))
    await act(async () => { await ctx.remove(1) })
    expect(removeCartItem).toHaveBeenCalledWith(1)
    expect(ctx.count).toBe(0)
  })

  it('ignores a mutation while another is pending', async () => {
    signInAs(customer)
    mount()
    await waitFor(() => expect(ctx.count).toBe(3))
    let release
    addCartItem.mockReturnValue(new Promise((r) => { release = r }))
    let first, second
    await act(async () => {
      first = ctx.add(1)
      second = await ctx.add(1)
    })
    expect(second).toEqual({ ok: false, error: null })
    expect(addCartItem).toHaveBeenCalledTimes(1)
    await act(async () => { release(bigger); await first })
  })

  it('a 401 load error ends in error state without retrying', async () => {
    signInAs(customer)
    getCart.mockImplementation(async () => { await Promise.resolve(); clearSession(); throw new ApiError(401, 'Expired') })
    mount()
    await waitFor(() => expect(getCart).toHaveBeenCalled())
    await waitFor(() => expect(ctx.status).toBe('idle'))
    expect(ctx.cart).toBeNull()
    expect(ctx.count).toBe(0)
    expect(getCart).toHaveBeenCalledTimes(1)
  })

  it('a load error without sign-out sets status error', async () => {
    signInAs(customer)
    const err = new ApiError(500, 'Boom')
    getCart.mockRejectedValue(err)
    mount()
    await waitFor(() => expect(ctx.status).toBe('error'))
    expect(ctx.error).toBe(err)
    expect(ctx.count).toBe(0)
  })

  it('never shows the previous user cart to the next user', async () => {
    signInAs(customer)
    mount()
    await waitFor(() => expect(ctx.count).toBe(3))
    act(() => clearSession())
    getCart.mockReturnValue(new Promise(() => {}))
    counts = []
    act(() => signInAs(admin))
    expect(ctx.cart).toBeNull()
    expect(ctx.count).toBe(0)
    expect(ctx.status).toBe('loading')
    expect(counts).not.toContain(3) // after the first sign-out render
  })

  it('drops a late mutation response from the previous user and lets the next user add', async () => {
    signInAs(customer)
    mount()
    await waitFor(() => expect(ctx.count).toBe(3))
    let release
    addCartItem.mockReturnValueOnce(new Promise((r) => { release = r }))
    let first
    act(() => { first = ctx.add(1) })
    act(() => clearSession())
    getCart.mockResolvedValue({ id: 2, items: [], subTotal: 0 })
    act(() => signInAs(admin))
    await waitFor(() => expect(ctx.status).toBe('ready'))
    await act(async () => { release(bigger); await first })
    expect(ctx.count).toBe(0)
    expect(ctx.pending).toBe(false)
    addCartItem.mockResolvedValue({ ...cart, id: 2 })
    let res
    await act(async () => { res = await ctx.add(2) })
    expect(res.ok).toBe(true)
    expect(addCartItem).toHaveBeenCalledTimes(2)
    expect(ctx.count).toBe(3)
  })

  it('drops a stale refresh after a user switch', async () => {
    signInAs(customer)
    mount()
    await waitFor(() => expect(ctx.count).toBe(3))
    let release
    getCart.mockReturnValueOnce(new Promise((r) => { release = r }))
    let p
    act(() => { p = ctx.refresh() })
    act(() => clearSession())
    getCart.mockResolvedValue({ id: 2, items: [], subTotal: 0 })
    act(() => signInAs(admin))
    await waitFor(() => expect(ctx.status).toBe('ready'))
    await act(async () => { release(cart); await p })
    expect(ctx.count).toBe(0)
  })

  it('useCart outside the provider throws', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/CartProvider/)
  })
})
