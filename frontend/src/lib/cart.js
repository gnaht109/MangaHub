import { request } from './api.js'

export const getCart = () => request('/api/cart')
export const addCartItem = (mangaId, quantity, flashSaleItemId) =>
  request('/api/cart/items', { method: 'POST', body: { mangaId, quantity, ...(flashSaleItemId != null && { flashSaleItemId }) } })
export const removeCartItem = (cartItemId) => request(`/api/cart/items/${encodeURIComponent(cartItemId)}`, { method: 'DELETE' })
export const setCartItemQuantity = (cartItemId, quantity) => request(`/api/cart/items/${encodeURIComponent(cartItemId)}`, { method: 'PUT', body: { quantity } })
