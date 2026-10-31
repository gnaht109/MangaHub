import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../auth/AuthContext.jsx'
import { useCart } from '../cart/CartContext.jsx'
import { cx } from '../lib/cx.js'
import styles from './Header.module.css'

const NAV = [
  { to: '/', label: 'Catalog', end: true },
  { to: '/flash-sale', label: 'Flash Sale' },
  { to: '/cart', label: 'Cart' },
]

const linkClass = ({ isActive }) => cx('condensed', styles.link, isActive && styles.active)

export default function Header() {
  const { user, isAdmin } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  useEffect(() => setQuery(params.get('q') ?? ''), [params])
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  function onSearch(event) {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/')
    close()
  }

  return (
    <header className={styles.band}>
      <div className={cx('page', styles.inner)}>
        <Link to="/" className={cx('condensed', styles.wordmark)} onClick={close}>MangaHub</Link>
        <button
          type="button"
          className={cx('condensed', styles.toggle)}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((value) => !value)}
        >
          Menu
        </button>
        <div id="site-menu" className={cx(styles.menu, open && styles.open)}>
          <nav aria-label="Main">
            <ul className={styles.nav}>
              {NAV.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.end} className={linkClass} onClick={close}>{item.label}
                    {item.to === '/cart' && count > 0 && (
                      <>
                        <span className="visually-hidden">, {count} {count === 1 ? 'item' : 'items'}</span>
                        <span className={styles.count} aria-hidden="true">{count}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <form role="search" className={styles.search} onSubmit={onSearch}>
            <label htmlFor="header-search" className="visually-hidden">Search the store</label>
            <input
              id="header-search"
              type="search"
              className={styles.searchInput}
              placeholder="Search manga"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" className={cx('condensed', styles.searchButton)}>Search</button>
          </form>
          <div className={styles.account}>
            {isAdmin && <NavLink to="/admin" className={linkClass} onClick={close}>Admin</NavLink>}
            {user
              ? <NavLink to="/account" className={cx(styles.link, styles.name)} onClick={close}>{user.fullName}</NavLink>
              : <NavLink to="/login" className={linkClass} onClick={close}>Sign in</NavLink>}
          </div>
        </div>
      </div>
    </header>
  )
}
