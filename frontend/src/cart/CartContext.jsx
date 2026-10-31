import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { getCart, addCartItem, removeCartItem, setCartItemQuantity } from '../lib/cart.js'

const CartContext = createContext(null)
const SIGNED_OUT = { cart: null, status: 'idle', error: null }

export function CartProvider({ children }) {
  const userId = useAuth().user?.userId
  const [state, setState] = useState({ ...SIGNED_OUT, owner: userId })
  const [pending, setPending] = useState(false)
  const busy = useRef(false)
  const current = useRef(userId) // results for any other user are dropped

  // keepCart: refresh keeps the cart on screen while reloading; a user's first load starts empty.
  function load(owner, isActive, keepCart) {
    setState((s) => ({ owner, cart: keepCart ? s.cart : null, status: 'loading', error: null }))
    return getCart()
      .then((cart) => isActive() && setState({ owner, cart, status: 'ready', error: null }))
      .catch((error) => isActive() && setState({ owner, cart: null, status: 'error', error }))
  }

  useEffect(() => {
    current.current = userId
    busy.current = false
    setPending(false)
    if (!userId) return
    let active = true
    load(userId, () => active)
    return () => { active = false }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function mutate(call) {
    if (busy.current) return { ok: false, error: null }
    const owner = userId
    busy.current = true
    setPending(true)
    try {
      const cart = await call()
      if (current.current === owner) setState({ owner, cart, status: 'ready', error: null })
      return { ok: true, error: null }
    } catch (error) {
      return { ok: false, error }
    } finally {
      if (current.current === owner) {
        busy.current = false
        setPending(false)
      }
    }
  }

  // Derived so no render ever shows another user's cart (or any cart while signed out).
  const { cart, status, error } = !userId ? SIGNED_OUT
    : state.owner === userId ? state : { cart: null, status: 'loading', error: null }
  const value = {
    cart, status, error, pending,
    count: cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    add: (mangaId, quantity = 1) => mutate(() => addCartItem(mangaId, quantity)),
    remove: (mangaId) => mutate(() => removeCartItem(mangaId)),
    setQuantity: (mangaId, quantity) => mutate(() => setCartItemQuantity(mangaId, quantity)),
    refresh: () => (userId ? load(userId, () => current.current === userId, true) : Promise.resolve()),
  }
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside <CartProvider>')
  return value
}
