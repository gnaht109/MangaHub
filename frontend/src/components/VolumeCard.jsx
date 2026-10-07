import { Link } from 'react-router'
import Obi from './Obi.jsx'
import { formatPrice } from '../lib/format.js'
import { cx } from '../lib/cx.js'
import styles from './VolumeCard.module.css'

export default function VolumeCard({ manga }) {
  return (
    <Link to={`/manga/${manga.id}`} className={styles.card}>
      <div className={styles.jacket}>
        {manga.coverImage
          ? <img src={manga.coverImage} alt="" className={styles.cover} />
          : <span className={cx('condensed', styles.proof)} aria-hidden="true">{manga.title}</span>}
        <Obi className={styles.obi}>
          <span className={styles.price}>{formatPrice(manga.basePrice)}</span>
          <span className={styles.micro}>Printed volume</span>
        </Obi>
      </div>
      <h3 className={styles.title}>{manga.title}</h3>
      <p className={styles.author}>{manga.author}</p>
    </Link>
  )
}
