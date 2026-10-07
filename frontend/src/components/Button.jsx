import { Link } from 'react-router'
import { cx } from '../lib/cx.js'
import styles from './Button.module.css'

export default function Button({ variant = 'primary', to, className, ...rest }) {
  const classes = cx(styles.button, styles[variant], className)
  if (to) return <Link to={to} className={classes} {...rest} />
  return <button type="button" className={classes} {...rest} />
}
