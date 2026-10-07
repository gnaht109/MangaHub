import { cx } from '../lib/cx.js'
import styles from './Obi.module.css'

export default function Obi({ variant = 'normal', as: Tag = 'div', className, children, ...rest }) {
  return (
    <Tag className={cx(styles.obi, styles[variant], className)} {...rest}>
      {children}
    </Tag>
  )
}
