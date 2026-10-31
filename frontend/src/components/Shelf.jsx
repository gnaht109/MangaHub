import VolumeCard from './VolumeCard.jsx'
import styles from './Shelf.module.css'

export default function Shelf({ items, salePrices }) {
  return (
    <ul className={styles.shelf}>
      {items.map((manga) => (
        <li key={manga.id} className={styles.slot}><VolumeCard manga={manga} sale={salePrices?.get(String(manga.id))} /></li>
      ))}
    </ul>
  )
}

export function ShelfSkeleton({ count = 5 }) {
  return (
    <div role="status" aria-label="Loading volumes">
      <ul className={styles.shelf}>
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className={styles.slot}><div className={styles.ghost} /></li>
        ))}
      </ul>
    </div>
  )
}
