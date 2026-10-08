import { useState } from 'react'
import { createManga } from '../lib/manga.js'
import { validateTitle } from '../lib/validate.js'
import PageTitle from '../components/PageTitle.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import styles from './Admin.module.css'

const EMPTY = { title: '', author: '', description: '', basePrice: '' }

export default function AdminNewTitle() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [pending, setPending] = useState(false)
  const [created, setCreated] = useState(null)

  const set = (name) => (event) => setValues((v) => ({ ...v, [name]: event.target.value }))

  async function onSubmit(event) {
    event.preventDefault()
    if (pending) return
    const found = validateTitle(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setPending(true)
    setServerError(null)
    setCreated(null)
    try {
      const manga = await createManga({
        title: values.title.trim(),
        author: values.author.trim(),
        description: values.description.trim() || null,
        basePrice: Number(values.basePrice.trim()),
      })
      setCreated(manga)
      setValues(EMPTY)
    } catch (error) {
      setServerError(error.message)
    } finally {
      setPending(false)
    }
  }

  return (
    <>
      <PageTitle>Admin · New title</PageTitle>
      <div className={`page ${styles.body}`}>
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {created && (
            <Notice
              title="Title added"
              action={<><Button to={`/manga/${created.id}`} variant="secondary">View on store</Button><Button to="/admin" variant="quiet">Back to titles</Button></>}
            >
              {created.title} is now on the shelf. Fill the form again to add another.
            </Notice>
          )}
          {serverError && <Notice tone="error" title="Couldn't add the title">{serverError}</Notice>}
          <Field label="Title" value={values.title} onChange={set('title')} error={errors.title} />
          <Field label="Author" value={values.author} onChange={set('author')} error={errors.author} />
          <Field label="Description" multiline value={values.description} onChange={set('description')} />
          <Field label="Base price (VND)" inputMode="numeric" value={values.basePrice} onChange={set('basePrice')} error={errors.basePrice} />
          <div className={styles.toolbar}>
            <Button type="submit" disabled={pending}>{pending ? 'Adding…' : 'Add title'}</Button>
            <Button to="/admin" variant="secondary">Cancel</Button>
          </div>
        </form>
      </div>
    </>
  )
}
