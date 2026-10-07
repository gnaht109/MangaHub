import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../auth/AuthContext.jsx'
import { signup } from '../lib/auth.js'
import { validateSignup } from '../lib/validate.js'
import { safeNext } from '../lib/nav.js'
import PageTitle from '../components/PageTitle.jsx'
import Field from '../components/Field.jsx'
import Button from '../components/Button.jsx'
import Notice from '../components/Notice.jsx'
import styles from './AuthForm.module.css'

export default function Signup() {
  const { user, signIn } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [values, setValues] = useState({ fullName: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [pending, setPending] = useState(false)

  if (user) return <Navigate to={next} replace />

  const set = (name) => (event) => setValues((v) => ({ ...v, [name]: event.target.value }))

  async function onSubmit(event) {
    event.preventDefault()
    if (pending) return
    const found = validateSignup(values)
    setErrors(found)
    if (Object.keys(found).length) return
    setPending(true)
    setServerError(null)
    try {
      signIn(await signup({ fullName: values.fullName.trim(), email: values.email.trim(), password: values.password }))
      navigate(next, { replace: true })
    } catch (error) {
      setServerError(error.message)
      setPending(false)
    }
  }

  return (
    <>
      <PageTitle>Create account</PageTitle>
      <div className={styles.wrap}>
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          {serverError && <Notice tone="error" title="Couldn't create the account">{serverError}</Notice>}
          <Field label="Full name" autoComplete="name" value={values.fullName} onChange={set('fullName')} error={errors.fullName} />
          <Field label="Email" type="email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
          <Field label="Password" type="password" autoComplete="new-password" value={values.password} onChange={set('password')} error={errors.password} />
          <Button type="submit" disabled={pending}>{pending ? 'Creating account…' : 'Create account'}</Button>
          <p className={styles.switch}>Already have an account? <Link to={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link></p>
        </form>
      </div>
    </>
  )
}
