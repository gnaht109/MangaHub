import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { listManga } from '../lib/manga.js'
import { formatPrice } from '../lib/format.js'
import PageTitle from '../components/PageTitle.jsx'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import styles from './Admin.module.css'

export default function AdminTitles() {
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({ status: 'loading', items: [], error: null })

  useEffect(() => {
    let active = true
    setState({ status: 'loading', items: [], error: null })
    listManga()
      .then((items) => active && setState({ status: 'ready', items: items ?? [], error: null }))
      .catch((error) => active && setState({ status: 'error', items: [], error }))
    return () => { active = false }
  }, [attempt])

  return (
    <>
      <PageTitle kicker="Admin">Titles</PageTitle>
      <div className={`page ${styles.body}`}>
        <div className={styles.toolbar}>
          <Button to="/admin/titles/new">Add title</Button>
        </div>
        {state.status === 'loading' && <p role="status">Loading titles…</p>}
        {state.status === 'error' && (
          <Notice tone="error" title="Couldn't load titles" action={<Button variant="secondary" onClick={() => setAttempt((n) => n + 1)}>Try again</Button>}>
            {state.error.message}
          </Notice>
        )}
        {state.status === 'ready' && state.items.length === 0 && <Notice title="No titles yet." />}
        {state.status === 'ready' && state.items.length > 0 && (
          <table className={styles.table}>
            <thead>
              <tr><th scope="col">Title</th><th scope="col">Author</th><th scope="col" className={styles.num}>Price</th><th scope="col"><span className="visually-hidden">Store page</span></th></tr>
            </thead>
            <tbody>
              {state.items.map((manga) => (
                <tr key={manga.id}>
                  <td>{manga.title}</td>
                  <td>{manga.author}</td>
                  <td className={styles.num}>{formatPrice(manga.basePrice)}</td>
                  <td><Link to={`/manga/${manga.id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
