import { startTransition } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthContext.jsx'
import PageTitle from '../components/PageTitle.jsx'
import Button from '../components/Button.jsx'
import styles from './Admin.module.css'

export default function Account() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function onSignOut() {
    startTransition(() => {
      navigate('/')
      signOut()
    })
  }

  return (
    <>
      <PageTitle>Account</PageTitle>
      <div className={`page ${styles.body}`}>
        <dl className={styles.details}>
          <dt>Name</dt><dd>{user.fullName}</dd>
          <dt>Email</dt><dd>{user.email}</dd>
          <dt>Role</dt><dd>{user.role}</dd>
        </dl>
        <Button variant="secondary" onClick={onSignOut}>Sign out</Button>
      </div>
    </>
  )
}
