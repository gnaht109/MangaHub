import { useState } from 'react'
import { Link } from 'react-router'
import PageTitle from '../components/PageTitle.jsx'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import { useCart } from '../cart/CartContext.jsx'
import { formatPrice } from '../lib/format.js'
import styles from './Shells.module.css'

export default function Cart() {
  const { cart, status, error, pending, remove, setQuantity, refresh } = useCart()
  const [changeError, setChangeError] = useState(null)

  async function change(call) {
    setChangeError(null)
    const result = await call
    if (result.error) setChangeError(result.error)
  }

  let items
  if (!cart && status === 'error') {
    items = (
      <Notice tone="error" title="We couldn't load your cart." action={<Button onClick={refresh}>Try again</Button>}>
        {error?.message}
      </Notice>
    )
  } else if (!cart) {
    items = <div role="status" aria-label="Loading your cart" className={styles.skeleton} />
  } else if (cart.items.length === 0) {
    items = <Notice title="Your cart is empty." action={<Button to="/">Browse catalog</Button>} />
  } else {
    items = (
      <>
        {changeError && <Notice tone="error" title="Couldn't update your cart.">{changeError.message}</Notice>}
        <ul className={styles.rows}>
          {cart.items.map((item) => (
            <li key={item.id} className={styles.row}>
              <div className={styles.thumb} aria-hidden="true">{item.title}</div>
              <div className={styles.info}>
                <Link to={`/manga/${item.mangaId}`} className={styles.itemTitle}>{item.title}</Link>
                <div className={styles.stepper}>
                  <Button variant="secondary" disabled={pending || item.quantity <= 1} onClick={() => change(setQuantity(item.mangaId, item.quantity - 1))} aria-label={`Decrease quantity of ${item.title}`}>−</Button>
                  <span className={styles.qty}>{item.quantity}</span>
                  <Button variant="secondary" disabled={pending} onClick={() => change(setQuantity(item.mangaId, item.quantity + 1))} aria-label={`Increase quantity of ${item.title}`}>+</Button>
                </div>
                <span className={styles.meta}>{formatPrice(item.unitPrice)} each</span>
              </div>
              <div className={styles.lineEnd}>
                <span className={styles.lineTotal}>{formatPrice(item.lineTotal)}</span>
                <Button variant="quiet" disabled={pending} onClick={() => change(remove(item.mangaId))} aria-label={`Remove ${item.title}`}>Remove</Button>
              </div>
            </li>
          ))}
        </ul>
      </>
    )
  }

  return (
    <>
      <PageTitle>Cart</PageTitle>
      <div className={`page ${styles.cart}`}>
        <section aria-label="Items">{items}</section>
        <aside className={styles.summary} aria-label="Summary">
          <h2 className="condensed">Summary</h2>
          <dl className={styles.totals}>
            <dt>Subtotal</dt><dd>{cart ? formatPrice(cart.subTotal) : '—'}</dd>
          </dl>
          <Button disabled>Checkout opens soon</Button>
        </aside>
      </div>
    </>
  )
}
