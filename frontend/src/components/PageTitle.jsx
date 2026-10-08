import Obi from './Obi.jsx'
import { cx } from '../lib/cx.js'
import styles from './PageTitle.module.css'

export default function PageTitle({ variant = 'normal', children }) {
  return (
    <Obi variant={variant} className={styles.band}>
      <div className={cx('page', styles.inner)}>
        <h1 className={cx('condensed', styles.title)}>{children}</h1>
      </div>
    </Obi>
  )
}
