import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '../test/render.jsx'
import { makeToken, customer, signInAs } from '../test/fixtures.js'
import { ApiError } from '../lib/api.js'
import { login, signup } from '../lib/auth.js'

vi.mock('../lib/flashSale.js', () => ({ listFlashSales: vi.fn(async () => []) }))
vi.mock('../lib/auth.js', () => ({ login: vi.fn(), signup: vi.fn() }))

async function fillLogin() {
  await userEvent.type(screen.getByLabelText('Email'), 'minh@example.com')
  await userEvent.type(screen.getByLabelText('Password'), 'secret')
}

describe('Login', () => {
  it('shows client validation without calling the API', async () => {
    renderApp('/login')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect(screen.getByText('Email is required')).toBeTruthy()
    expect(login).not.toHaveBeenCalled()
  })

  it('shows the server message on bad credentials', async () => {
    login.mockRejectedValue(new ApiError(401, 'Your email or your password is incorrect', 401))
    renderApp('/login')
    await fillLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    expect((await screen.findByRole('alert')).textContent).toContain('Your email or your password is incorrect')
  })

  it('disables the button while pending so it submits once', async () => {
    login.mockReturnValue(new Promise(() => {}))
    renderApp('/login')
    await fillLogin()
    const button = screen.getByRole('button', { name: 'Sign in' })
    await userEvent.click(button)
    await userEvent.click(screen.getByRole('button', { name: 'Signing in…' }))
    expect(login).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Signing in…' }).disabled).toBe(true)
  })

  it('signs in and goes to a safe next path', async () => {
    login.mockResolvedValue({ token: makeToken(), tokenType: 'Bearer', ...customer })
    renderApp('/login?next=%2Fmanga%2Fm1')
    await fillLogin()
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/manga/m1'))
  })

  it('ignores an external next target', () => {
    signInAs(customer)
    renderApp('/login?next=%2F%2Fevil.example')
    expect(screen.getByTestId('location').textContent).toBe('/')
  })
})

describe('Signup', () => {
  it('creates an account and signs in', async () => {
    signup.mockResolvedValue({ token: makeToken(), tokenType: 'Bearer', ...customer })
    renderApp('/signup')
    await userEvent.type(screen.getByLabelText('Full name'), 'Minh Nguyen')
    await userEvent.type(screen.getByLabelText('Email'), 'minh@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(signup).toHaveBeenCalledWith({ fullName: 'Minh Nguyen', email: 'minh@example.com', password: 'secret' })
    await waitFor(() => expect(screen.getByTestId('location').textContent).toBe('/'))
  })

  it('shows a duplicate email error from the server', async () => {
    signup.mockRejectedValue(new ApiError(409, 'This email already exists.', 409))
    renderApp('/signup')
    await userEvent.type(screen.getByLabelText('Full name'), 'Minh')
    await userEvent.type(screen.getByLabelText('Email'), 'minh@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret')
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect((await screen.findByRole('alert')).textContent).toContain('This email already exists.')
  })
})
