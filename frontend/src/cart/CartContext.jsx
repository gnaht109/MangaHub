import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { getCart, addCartItem, removeCartItem } from '../lib/cart.js'

const CartContext = createContext(null)
const SIGNED_OUT = { cart: null, status: 'idle', error: null }

export function CartProvider({ children }) {
  const userId = useAuth().user?.userId
  const [state, setState] = useState(SIGNED_OUT)
  const [pending, setPending] = useState(false)
  const busy = useRef(false)

  function load(isActive = () => true) {
    setState((s) => ({ ...s, status: 'loading', error: null }))
    return getCart()
      .then((cart) => isActive() && setState({ cart, status: 'ready', error: null }))
      .catch((error) => isActive() && setState({ cart: null, status: 'error', error }))
  }

  useEffect(() => {
    if (!userId) return
    let active = true
    load(() => active)
    return () => { active = false }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function mutate(call) {
    if (busy.current) return { ok: false, error: null }
    busy.current = true
    setPending(true)
    try {
      const cart = await call()
      setState({ cart, status: 'ready', error: null })
      return { ok: true, error: null }
    } catch (error) {
      return { ok: false, error }
    } finally {
      busy.current = false
      setPending(false)
    }
  }

  // Derived while signed out so sign-out clears the cart immediately.
  const { cart, status, error } = userId ? state : SIGNED_OUT
  const value = {
    cart, status, error, pending,
    count: cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    add: (mangaId, quantity = 1) => mutate(() => addCartItem(mangaId, quantity)),
    remove: (mangaId) => mutate(() => removeCartItem(mangaId)),
    refresh: () => (userId ? load() : Promise.resolve()),
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside <CartProvider>')
  return value
}
