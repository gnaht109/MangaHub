import { getSession, clearSession } from './session.js'

const GENERIC = 'Something went wrong. Please try again.'

export class ApiError extends Error {
  constructor(status, message, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  const session = getSession()
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (session) headers.Authorization = `Bearer ${session.token}`

  let response
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, "Can't reach the server.")
  }

  const text = await response.text()
  let json = null
  if (text) {
    try {
      json = JSON.parse(text)
    } catch {
      json = null
    }
  }

  if (!response.ok) {
    // 401 = the token is no longer accepted; 403 = valid token, not allowed (keep the session).
    if (session && response.status === 401) clearSession()
    throw new ApiError(response.status, json?.message || GENERIC, json?.code)
  }

  return json && typeof json === 'object' && 'data' in json ? json.data : json
}
