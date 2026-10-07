import { useId } from 'react'
import styles from './Field.module.css'

export default function Field({ label, error, id, multiline = false, ...inputProps }) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = `${fieldId}-error`
  const Control = multiline ? 'textarea' : 'input'
  return (
    <div className={styles.field}>
      <label htmlFor={fieldId} className={styles.label}>{label}</label>
      <Control
        id={fieldId}
        className={styles.control}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        rows={multiline ? 5 : undefined}
        {...inputProps}
      />
      {error && <p id={errorId} className={styles.error}>{error}</p>}
    </div>
  )
}
