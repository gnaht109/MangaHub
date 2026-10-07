import { describe, it, expect, vi } from 'vitest'
import { getSession, setSession, clearSession, onSessionChange } from './session.js'
import { makeToken, customer } from '../test/fixtures.js'

describe('session', () => {
  it('round-trips a login response', () => {
    const token = makeToken()
    setSession({ token, tokenType: 'Bearer', ...customer })
    expect(getSession()).toEqual({ token, user: customer })
  })

  it('drops an expired token and removes it from storage', () => {
    setSession({ token: makeToken(-10), ...customer })
    expect(getSession()).toBeNull()
    expect(localStorage.getItem('mangahub.session')).toBeNull()
  })

  it('treats corrupt storage as signed out', () => {
    localStorage.setItem('mangahub.session', '{not json')
    expect(getSession()).toBeNull()
    localStorage.setItem('mangahub.session', JSON.stringify({ token: 'garbage', user: customer }))
    expect(getSession()).toBeNull()
  })

  it('notifies listeners on set and clear', () => {
    const listener = vi.fn()
    const off = onSessionChange(listener)
    setSession({ token: makeToken(), ...customer })
    clearSession()
    off()
    setSession({ token: makeToken(), ...customer })
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
