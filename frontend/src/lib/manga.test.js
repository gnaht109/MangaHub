import { describe, it, expect, vi } from 'vitest'
import { listManga, getManga, createManga } from './manga.js'
import { login, signup } from './auth.js'

function spyFetch(body) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify(body), { status: 200 }))
}

describe('manga and auth endpoints', () => {
  it('lists manga from /api/manga', async () => {
    const spy = spyFetch({ data: [] })
    await listManga()
    expect(spy.mock.calls[0][0]).toBe('/api/manga')
  })

  it('encodes the id when fetching one title', async () => {
    const spy = spyFetch({ data: {} })
    await getManga('a/b')
    expect(spy.mock.calls[0][0]).toBe('/api/manga/a%2Fb')
  })

  it('posts a new title', async () => {
    const spy = spyFetch({ data: { id: 'm9' } })
    await createManga({ title: 'T', author: 'A', description: null, basePrice: 45000 })
    expect(spy.mock.calls[0][1].method).toBe('POST')
    expect(JSON.parse(spy.mock.calls[0][1].body)).toEqual({ title: 'T', author: 'A', description: null, basePrice: 45000 })
  })

  it('posts credentials to the auth endpoints', async () => {
    const spy = spyFetch({ token: 't' })
    await login({ email: 'a@b.co', password: 'x' })
    await signup({ fullName: 'A', email: 'a@b.co', password: 'x' })
    expect(spy.mock.calls.map((c) => c[0])).toEqual(['/api/auth/login', '/api/auth/signup'])
  })
})
