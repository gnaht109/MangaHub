import PageTitle from '../components/PageTitle.jsx'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import styles from './Shells.module.css'

export default function Cart() {
  return (
    <>
      <PageTitle>Cart</PageTitle>
      <div className={`page ${styles.cart}`}>
        <section aria-label="Items">
          <Notice title="Your cart is empty." action={<Button to="/">Browse catalog</Button>}>
            Cart and checkout are being built.
          </Notice>
        </section>
        <aside className={styles.summary} aria-label="Summary">
          <h2 className="condensed">Summary</h2>
          <dl className={styles.totals}>
            <dt>Subtotal</dt><dd>—</dd>
          </dl>
          <Button disabled>Checkout opens soon</Button>
        </aside>
      </div>
    </>
  )
}
