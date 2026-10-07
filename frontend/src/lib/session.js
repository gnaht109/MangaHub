const KEY = 'mangahub.session'
const EVENT = 'mangahub:session'

// The backend answers an expired JWT with HTTP 500, so expiry is checked here before the token is ever sent.
function isExpired(token) {
  try {
    const part = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { exp } = JSON.parse(atob(part))
    return typeof exp !== 'number' || exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

export function getSession() {
  let session = null
  try {
    session = JSON.parse(localStorage.getItem(KEY))
  } catch {
    session = null
  }
  if (!session?.token || !session.user) return null
  if (isExpired(session.token)) {
    clearSession()
    return null
  }
  return session
}

export function setSession({ token, userId, fullName, email, role }) {
  const session = { token, user: { userId, fullName, email, role } }
  localStorage.setItem(KEY, JSON.stringify(session))
  window.dispatchEvent(new Event(EVENT))
  return session
}

export function clearSession() {
  localStorage.removeItem(KEY)
  window.dispatchEvent(new Event(EVENT))
}

export function onSessionChange(listener) {
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}
