import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useAuth } from '../auth/AuthContext.jsx'
import { useCart } from '../cart/CartContext.jsx'
import { getManga } from '../lib/manga.js'
import { listFlashSales } from '../lib/flashSale.js'
import { activePrices } from '../lib/sales.js'
import { formatPrice } from '../lib/format.js'
import { cx } from '../lib/cx.js'
import Obi from '../components/Obi.jsx'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import styles from './MangaDetail.module.css'

export default function MangaDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { add, pending } = useCart()
  const navigate = useNavigate()
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ status: 'loading', manga: null, error: null })
  const [sales, setSales] = useState([])
  const [cartNote, setCartNote] = useState(null) // null | { ok: true } | { error: message }

  useEffect(() => {
    let active = true
    setState({ status: 'loading', manga: null, error: null })
    setCartNote(null)
    getManga(id)
      .then((manga) => active && setState({ status: 'ready', manga, error: null }))
      .catch((error) => active && setState({ status: error.status === 404 ? 'notfound' : 'error', manga: null, error }))
    return () => { active = false }
  }, [id, attempt])

  useEffect(() => {
    let active = true
    setSales([]) // never show the previous volume's price
    // Sales are decoration: on failure, the base price renders and no error is shown.
    listFlashSales().then((list) => active && setSales(list ?? [])).catch(() => {})
    return () => { active = false }
  }, [id])

  async function addToCart() {
    if (!user) return navigate(`/login?next=${encodeURIComponent(`/manga/${id}`)}`)
    const { ok, error } = await add(id, 1)
    if (ok) setCartNote({ ok: true })
    else if (error) setCartNote({ error: error.message })
  }

  if (state.status === 'loading') {
    return (
      <div className={cx('page', styles.layout)} role="status" aria-label="Loading volume">
        <div className={styles.jacket} />
        <div className={styles.ghostInfo} />
      </div>
    )
  }

  if (state.status === 'notfound') {
    return (
      <div className={cx('page', styles.message)}>
        <Notice title="This volume isn't in the catalog." action={<Button to="/">Back to catalog</Button>} />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className={cx('page', styles.message)}>
        <Notice tone="error" title="Couldn't load this volume" action={<Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>Try again</Button>}>
          {state.error.message}
        </Notice>
      </div>
    )
  }

  const { manga } = state
  const sale = activePrices(sales).get(String(manga.id))
  return (
    <article className={cx('page', styles.layout)}>
      <div className={styles.jacket}>
        {manga.coverImage
          ? <img src={manga.coverImage} alt="" className={styles.cover} />
          : <span className={cx('condensed', styles.proof)} aria-hidden="true">{manga.title}</span>}
        {sale ? (
          <Obi variant="sale" className={styles.jacketObi}>
            <span>{formatPrice(sale.discountedPrice)}</span>
            <span className={cx(styles.micro, styles.was)}>
              Flash sale
              <s><span className="visually-hidden">Regular price </span>{formatPrice(manga.basePrice)}</s>
            </span>
          </Obi>
        ) : (
          <Obi className={styles.jacketObi}>
            <span>{formatPrice(manga.basePrice)}</span>
            <span className={styles.micro}>Printed volume</span>
          </Obi>
        )}
      </div>

      <div className={styles.info}>
        <h1 className={styles.title}>{manga.title}</h1>
        <p className={styles.author}>{manga.author}</p>
        <p className={cx(styles.description, !manga.description && styles.muted)}>
          {manga.description || 'No description yet.'}
        </p>
        <div className={styles.actions}>
          <Button onClick={addToCart} disabled={pending}>Add to cart</Button>
          <Button to="/" variant="secondary">Back to catalog</Button>
        </div>
        {cartNote?.ok && (
          <Notice title="Added to your cart." action={<Button to="/cart" variant="quiet">View cart</Button>} />
        )}
        {cartNote?.error && <Notice tone="error" title="Couldn't add to your cart">{cartNote.error}</Notice>}
      </div>
    </article>
  )
}
