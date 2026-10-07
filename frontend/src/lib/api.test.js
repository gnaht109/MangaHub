import { describe, it, expect, vi } from 'vitest'
import { request, ApiError } from './api.js'
import { getSession } from './session.js'
import { signInAs, customer } from '../test/fixtures.js'

function mockFetch(status, body) {
  const text = body === undefined ? '' : JSON.stringify(body)
  // a fresh Response per call: a body can only be read once
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(text, { status }))
}

describe('request', () => {
  it('unwraps ApiResponse.data', async () => {
    mockFetch(200, { code: 1000, data: [{ id: 'm1' }] })
    await expect(request('/api/manga')).resolves.toEqual([{ id: 'm1' }])
  })

  it('returns a plain body when there is no data key', async () => {
    mockFetch(200, { token: 't', role: 'CUSTOMER' })
    await expect(request('/api/auth/login', { method: 'POST', body: {} })).resolves.toEqual({ token: 't', role: 'CUSTOMER' })
  })

  it('sends JSON and the bearer token when signed in', async () => {
    const { token } = signInAs(customer)
    const fetchSpy = mockFetch(200, { data: null })
    await request('/api/manga', { method: 'POST', body: { title: 'X' } })
    const [, init] = fetchSpy.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"title":"X"}')
    expect(init.headers.Authorization).toBe(`Bearer ${token}`)
    expect(init.headers['Content-Type']).toBe('application/json')
  })

  it('throws ApiError with the server message', async () => {
    mockFetch(409, { code: 409, message: 'This email already exists.' })
    await expect(request('/api/auth/signup', { method: 'POST', body: {} })).rejects.toMatchObject({
      name: 'ApiError', status: 409, code: 409, message: 'This email already exists.',
    })
  })

  it('uses a generic message when the error body is empty', async () => {
    mockFetch(403)
    const error = await request('/api/manga').catch((e) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(403)
    expect(error.message).toBe('Something went wrong. Please try again.')
  })

  it('reports network failure as status 0', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(request('/api/manga')).rejects.toMatchObject({ status: 0, message: "Can't reach the server." })
  })

  it('clears the session on 401 but keeps it on 403', async () => {
    signInAs(customer)
    mockFetch(403, { message: 'Forbidden Access' })
    await request('/api/manga').catch(() => {})
    expect(getSession()).not.toBeNull()

    mockFetch(401, { message: 'Unauthorized' })
    await request('/api/manga').catch(() => {})
    expect(getSession()).toBeNull()
  })
})
