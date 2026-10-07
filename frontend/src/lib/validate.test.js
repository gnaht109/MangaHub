import { describe, it, expect } from 'vitest'
import { validateLogin, validateSignup, validateTitle } from './validate.js'

describe('validate', () => {
  it('checks login fields', () => {
    expect(validateLogin({ email: '', password: '' })).toEqual({ email: 'Email is required', password: 'Password is required' })
    expect(validateLogin({ email: 'nope', password: 'x' })).toEqual({ email: 'Email must be valid' })
    expect(validateLogin({ email: 'a@b.co', password: 'x' })).toEqual({})
  })
  it('checks signup name', () => {
    expect(validateSignup({ fullName: ' ', email: 'a@b.co', password: 'x' })).toEqual({ fullName: 'Full name is required' })
  })
  it('checks title fields and whole-number VND price', () => {
    expect(validateTitle({ title: '', author: '', basePrice: '' })).toEqual({
      title: 'Title is required', author: 'Author is required', basePrice: 'Base price is required',
    })
    expect(validateTitle({ title: 'T', author: 'A', basePrice: '12.5' }).basePrice).toBe('Enter a whole number of đồng, e.g. 45000')
    expect(validateTitle({ title: 'T', author: 'A', basePrice: '-1' }).basePrice).toBe('Enter a whole number of đồng, e.g. 45000')
    expect(validateTitle({ title: 'T', author: 'A', basePrice: ' 45000 ' })).toEqual({})
  })
})
