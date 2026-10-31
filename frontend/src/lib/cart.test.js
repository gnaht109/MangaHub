import { describe, it, expect, vi, beforeEach } from 'vitest'
import { request } from './api.js'
import { getCart, addCartItem, removeCartItem } from './cart.js'

vi.mock('./api.js', () => ({ request: vi.fn() }))

describe('cart endpoints', () => {
  beforeEach(() => request.mockResolvedValue({}))

  it('gets the cart', async () => {
    await getCart()
    expect(request).toHaveBeenCalledWith('/api/cart')
  })

  it('posts an item', async () => {
    await addCartItem(7, 2)
    expect(request).toHaveBeenCalledWith('/api/cart/items', { method: 'POST', body: { mangaId: 7, quantity: 2 } })
  })

  it('deletes an item with an encoded id', async () => {
    await removeCartItem('a/b')
    expect(request).toHaveBeenCalledWith('/api/cart/items/a%2Fb', { method: 'DELETE' })
  })
})
