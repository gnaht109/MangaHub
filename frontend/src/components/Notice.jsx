import { cx } from '../lib/cx.js'
import styles from './Notice.module.css'

export default function Notice({ tone = 'info', title, children, action }) {
  return (
    <section className={cx(styles.notice, styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      {title && <h2 className={cx('condensed', styles.title)}>{title}</h2>}
      {children && <div className={styles.body}>{children}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </section>
  )
}
