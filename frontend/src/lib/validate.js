const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateLogin({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Email is required'
  else if (!EMAIL.test(email.trim())) errors.email = 'Email must be valid'
  if (!password) errors.password = 'Password is required'
  return errors
}

export function validateSignup(values) {
  const errors = {}
  if (!values.fullName.trim()) errors.fullName = 'Full name is required'
  return { ...errors, ...validateLogin(values) }
}

export function validateTitle({ title, author, basePrice }) {
  const errors = {}
  if (!title.trim()) errors.title = 'Title is required'
  if (!author.trim()) errors.author = 'Author is required'
  if (!basePrice.trim()) errors.basePrice = 'Base price is required'
  else if (!/^\d+$/.test(basePrice.trim())) errors.basePrice = 'Enter a whole number of đồng, e.g. 45000'
  return errors
}
