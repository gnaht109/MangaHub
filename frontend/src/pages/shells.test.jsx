import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'

describe('shells', () => {
  it('Flash Sale explains the mechanic with the four obi states and no fake data', async () => {
    renderApp('/flash-sale')
    expect(screen.getByRole('heading', { level: 1, name: 'Flash sales' })).toBeTruthy()
    const legend = screen.getByRole('list', { name: 'Obi states' })
    expect(legend.querySelectorAll('li')).toHaveLength(4)
    expect(legend.textContent).not.toMatch(/\d/)
    await userEvent.click(screen.getByRole('button', { name: 'Notify me' }))
    expect(screen.getByText("Notifications aren't available yet.")).toBeTruthy()
  })

  it('Cart is honestly empty with checkout disabled', () => {
    renderApp('/cart')
    expect(screen.getByRole('heading', { level: 1, name: 'Cart' })).toBeTruthy()
    expect(screen.getByText('Your cart is empty.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Checkout opens soon' }).disabled).toBe(true)
    expect(screen.getByRole('link', { name: 'Browse catalog' }).getAttribute('href')).toBe('/')
  })
})
