import { Outlet } from 'react-router'
import Header from './Header.jsx'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <Header />
      <main id="main" className={styles.main}><Outlet /></main>
      <footer className={styles.footer}>
        <div className="page">
          <p className="condensed">MangaHub</p>
          <p className={styles.note}>Printed manga, volume by volume. A course project.</p>
        </div>
      </footer>
    </>
  )
}
