import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listFlashSales } from '../lib/flashSale.js'
import { listManga } from '../lib/manga.js'
import { joinSales, saleDaysLabel, formatDateRange } from '../lib/sales.js'
import { formatPrice } from '../lib/format.js'
import { cx } from '../lib/cx.js'
import PageTitle from '../components/PageTitle.jsx'
import Obi from '../components/Obi.jsx'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import styles from './Shells.module.css'
import sale from './FlashSale.module.css'

const STATES = [
  { variant: 'upcoming', label: 'Upcoming', obi: 'Sale opens soon', meaning: 'Announced, not live yet.' },
  { variant: 'sale', label: 'Live', obi: 'Sale price · Limited', meaning: 'On sale while the limited quantity lasts.' },
  { variant: 'soldout', label: 'Sold out', obi: 'Sold out', meaning: 'The sale quantity is gone.' },
  { variant: 'normal', label: 'Regular', obi: 'Printed volume', meaning: 'Everyday catalog price.' },
]

function SaleItem({ item, upcoming }) {
  const { manga } = item
  return (
    <li>
      <Link to={`/manga/${manga.id}`} className={sale.card}>
        <div className={sale.jacket}>
          <span className={cx('condensed', sale.proof)} aria-hidden="true">{manga.title}</span>
          <Obi variant={item.soldOut ? 'soldout' : upcoming ? 'upcoming' : 'sale'} className={sale.obi}>
            {item.soldOut ? <span className={sale.price}>Sold out</span> : (
              <>
                <span className={sale.price}>{formatPrice(item.discountedPrice)}</span>
                <span className={sale.micro}>
                  <s><span className={sale.hidden}>Regular price </span>{formatPrice(manga.basePrice)}</s>
                  <span>{item.remaining} left</span>
                </span>
              </>
            )}
          </Obi>
        </div>
        <h3 className={sale.title}>{manga.title}</h3>
      </Link>
    </li>
  )
}

function SaleBlock({ s, today }) {
  const upcoming = s.status === 'UPCOMING'
  return (
    <section className={cx(sale.block, upcoming && sale.quiet)} aria-labelledby={`sale-${s.id}`}>
      <header className={sale.head}>
        <h2 id={`sale-${s.id}`} className={cx('condensed', sale.name)}>{s.name}</h2>
        <p className={sale.dates}>{formatDateRange(s)}</p>
        <Obi variant={upcoming ? 'upcoming' : 'sale'} className={sale.label}>{saleDaysLabel(s, today)}</Obi>
      </header>
      {s.items.length === 0
        ? <p className={sale.none}>No volumes in this sale yet.</p>
        : <ul className={sale.items}>{s.items.map((i) => <SaleItem key={i.id} item={i} upcoming={upcoming} />)}</ul>}
    </section>
  )
}

export default function FlashSale() {
  const [notified, setNotified] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ status: 'loading', sales: [], error: null })

  useEffect(() => {
    let active = true
    setState({ status: 'loading', sales: [], error: null })
    Promise.all([listFlashSales(), listManga()])
      .then(([sales, manga]) => active && setState({ status: 'ready', sales: joinSales(sales ?? [], manga ?? []), error: null }))
      .catch((error) => active && setState({ status: 'error', sales: [], error }))
    return () => { active = false }
  }, [attempt])

  const today = new Date()
  return (
    <>
      <PageTitle variant="sale">Flash sales</PageTitle>
      <div className={`page ${styles.body}`}>
        <p className={styles.lead}>
          Limited-quantity drops on printed volumes. Each volume shows its sale price and how many are left.
        </p>
        {state.status === 'loading' && <div className={sale.skeleton} aria-hidden="true" />}
        {state.status === 'error' && (
          <Notice tone="error" title="Couldn't load flash sales" action={<Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>Try again</Button>}>
            {state.error.message}
          </Notice>
        )}
        {state.status === 'ready' && state.sales.length === 0 && (
          <Notice title="No flash sales right now.">Check back soon, or browse the regular catalog.</Notice>
        )}
        {state.sales.map((s) => <SaleBlock key={s.id} s={s} today={today} />)}
        <ul className={styles.legend} aria-label="Obi states">
          {STATES.map((s) => (
            <li key={s.variant} className={styles.legendItem}>
              <Obi variant={s.variant} className={styles.legendObi}>{s.obi}</Obi>
              <p className={styles.legendLabel}>{s.label}</p>
              <p className={styles.legendMeaning}>{s.meaning}</p>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Button onClick={() => setNotified(true)}>Notify me</Button>
          <Button to="/" variant="secondary">Browse catalog</Button>
        </div>
        {notified && <Notice title="Notifications aren't available yet.">Check this page again when flash sales launch.</Notice>}
      </div>
    </>
  )
}
