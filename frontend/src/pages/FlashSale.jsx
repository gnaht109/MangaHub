import { useState } from 'react'
import PageTitle from '../components/PageTitle.jsx'
import Obi from '../components/Obi.jsx'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import styles from './Shells.module.css'

const STATES = [
  { variant: 'upcoming', label: 'Upcoming', obi: 'Sale opens soon', meaning: 'Announced, not live yet.' },
  { variant: 'sale', label: 'Live', obi: 'Sale price · Limited', meaning: 'On sale while the limited quantity lasts.' },
  { variant: 'soldout', label: 'Sold out', obi: 'Sold out', meaning: 'The sale quantity is gone.' },
  { variant: 'normal', label: 'Regular', obi: 'Printed volume', meaning: 'Everyday catalog price.' },
]

export default function FlashSale() {
  const [notified, setNotified] = useState(false)
  return (
    <>
      <PageTitle variant="sale">Flash sales</PageTitle>
      <div className={`page ${styles.body}`}>
        <p className={styles.lead}>
          Coming soon. Limited-quantity drops on printed volumes. When a sale opens, each volume shows its sale price and how many are left.
        </p>
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
