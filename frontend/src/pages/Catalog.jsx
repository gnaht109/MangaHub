import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from '../auth/AuthContext.jsx'
import { listManga } from '../lib/manga.js'
import { filterManga } from '../lib/search.js'
import { cx } from '../lib/cx.js'
import Obi from '../components/Obi.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import Shelf, { ShelfSkeleton } from '../components/Shelf.jsx'
import styles from './Catalog.module.css'

function countLabel(count, query) {
  if (!query) return `${count} ${count === 1 ? 'volume' : 'volumes'}`
  return `${count} ${count === 1 ? 'match' : 'matches'} for “${query}”`
}

export default function Catalog() {
  const { user, isAdmin } = useAuth()
  const [params, setParams] = useSearchParams()
  const query = (params.get('q') ?? '').trim()
  const [draft, setDraft] = useState(query)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ status: 'loading', items: [], error: null })

  useEffect(() => setDraft(query), [query])

  useEffect(() => {
    let active = true
    setState({ status: 'loading', items: [], error: null })
    listManga()
      .then((items) => active && setState({ status: 'ready', items: items ?? [], error: null }))
      .catch((error) => active && setState({ status: 'error', items: [], error }))
    return () => { active = false }
  }, [attempt])

  function onSearch(event) {
    event.preventDefault()
    const q = draft.trim()
    setParams(q ? { q } : {})
  }

  function browseAll() {
    setParams({})
    document.getElementById('shelf')?.scrollIntoView?.({ behavior: 'smooth' })
  }

  const visible = filterManga(state.items, query)
  const needsSignIn = state.status === 'error' && !user && [401, 403].includes(state.error.status)

  return (
    <>
      <section className={styles.hook} aria-labelledby="hook-title">
        <div className={cx('page', styles.hookGrid)}>
          <h1 id="hook-title" className={cx('condensed', styles.hookTitle)}>Printed manga, volume by volume.</h1>
          <div className={styles.hookSide}>
            <p className={styles.sub}>Browse the catalog, open a title, order when the cart opens.</p>
            <form role="search" className={styles.searchForm} onSubmit={onSearch}>
              <Field label="Search title or author" type="search" value={draft} onChange={(event) => setDraft(event.target.value)} />
              <div className={styles.actions}>
                <Button onClick={browseAll}>Browse all</Button>
                <Button type="submit" variant="secondary">Search</Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <div className="page">
        <Obi as={Link} to="/flash-sale" variant="sale" className={styles.strip}>
          Flash sales — coming soon
        </Obi>
      </div>

      <section id="shelf" className={cx('page', styles.shelfSection)} aria-labelledby="shelf-title">
        <h2 id="shelf-title" className={cx('condensed', styles.shelfTitle)}>
          {state.status === 'ready' ? countLabel(visible.length, query) : 'Catalog'}
        </h2>

        {state.status === 'loading' && <ShelfSkeleton count={5} />}

        {needsSignIn && (
          <Notice title="Sign in to browse the catalog" action={<Button to="/login?next=%2F">Sign in to browse</Button>}>
            The catalog is only open to members right now.
          </Notice>
        )}

        {state.status === 'error' && !needsSignIn && (
          <Notice tone="error" title="Couldn't load the catalog" action={<Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>Try again</Button>}>
            {state.error.message}
          </Notice>
        )}

        {state.status === 'ready' && state.items.length === 0 && (
          <Notice title="No volumes yet." action={isAdmin && <Button to="/admin/titles/new">Add the first title</Button>}>
            Titles appear here as soon as they are added to the store.
          </Notice>
        )}

        {state.status === 'ready' && state.items.length > 0 && visible.length === 0 && (
          <Notice title={`No volumes match “${query}”.`} action={<Button variant="secondary" onClick={() => setParams({})}>Clear search</Button>}>
            Try a shorter title or the author's name.
          </Notice>
        )}

        {visible.length > 0 && <Shelf items={visible} />}
      </section>
    </>
  )
}
