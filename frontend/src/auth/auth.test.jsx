import { describe, it, expect } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import RequireAuth from './RequireAuth.jsx'
import { signInAs, customer, admin, makeToken } from '../test/fixtures.js'

function Where() {
  const { pathname, search } = useLocation()
  return <p data-testid="where">{pathname + search}</p>
}

function renderGuarded(role) {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={['/admin?tab=1']}>
        <Routes>
          <Route path="/admin" element={<RequireAuth role={role}><p>secret</p></RequireAuth>} />
          <Route path="/login" element={<Where />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('RequireAuth', () => {
  it('sends guests to login with next', () => {
    renderGuarded()
    expect(screen.getByTestId('where').textContent).toBe('/login?next=%2Fadmin%3Ftab%3D1')
  })

  it('shows NotFound to a signed-in user without the role', () => {
    signInAs(customer)
    renderGuarded('ADMIN')
    expect(screen.queryByText('secret')).toBeNull()
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeTruthy()
  })

  it('renders children for the right role', () => {
    signInAs(admin)
    renderGuarded('ADMIN')
    expect(screen.getByText('secret')).toBeTruthy()
  })
})

describe('useAuth', () => {
  function Probe() {
    const { user, isAdmin, signIn, signOut } = useAuth()
    return (
      <>
        <p data-testid="user">{user ? `${user.fullName}:${isAdmin}` : 'guest'}</p>
        <button onClick={() => signIn({ token: makeToken(), ...admin })}>in</button>
        <button onClick={signOut}>out</button>
      </>
    )
  }

  it('updates when signing in and out', () => {
    render(<AuthProvider><Probe /></AuthProvider>)
    expect(screen.getByTestId('user').textContent).toBe('guest')
    act(() => screen.getByText('in').click())
    expect(screen.getByTestId('user').textContent).toBe('Admin Tester:true')
    act(() => screen.getByText('out').click())
    expect(screen.getByTestId('user').textContent).toBe('guest')
  })
})
