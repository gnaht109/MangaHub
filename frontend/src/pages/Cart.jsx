import { useState } from 'react'
import { Link } from 'react-router'
import PageTitle from '../components/PageTitle.jsx'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import { useCart } from '../cart/CartContext.jsx'
import { formatPrice } from '../lib/format.js'
import styles from './Shells.module.css'

export default function Cart() {
  const { cart, status, error, pending, remove, refresh } = useCart()
  const [removeError, setRemoveError] = useState(null)

  async function onRemove(mangaId) {
    setRemoveError(null)
    const result = await remove(mangaId)
    if (result.error) setRemoveError(result.error)
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
        {removeError && <Notice tone="error" title="Couldn't remove that item.">{removeError.message}</Notice>}
        <ul className={styles.rows}>
          {cart.items.map((item) => (
            <li key={item.id} className={styles.row}>
              <div className={styles.thumb} aria-hidden="true">{item.title}</div>
              <div className={styles.info}>
                <Link to={`/manga/${item.mangaId}`} className={styles.itemTitle}>{item.title}</Link>
                <span className={styles.meta}>Qty {item.quantity}</span>
                <span className={styles.meta}>{formatPrice(item.unitPrice)} each</span>
              </div>
              <div className={styles.lineEnd}>
                <span className={styles.lineTotal}>{formatPrice(item.lineTotal)}</span>
                <Button variant="quiet" disabled={pending} onClick={() => onRemove(item.mangaId)} aria-label={`Remove ${item.title}`}>Remove</Button>
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
