import { request } from './api.js'

export const getCart = () => request('/api/cart')
export const addCartItem = (mangaId, quantity) => request('/api/cart/items', { method: 'POST', body: { mangaId, quantity } })
export const removeCartItem = (mangaId) => request(`/api/cart/items/${encodeURIComponent(mangaId)}`, { method: 'DELETE' })
export const setCartItemQuantity = (mangaId, quantity) => request(`/api/cart/items/${encodeURIComponent(mangaId)}`, { method: 'PUT', body: { quantity } })
