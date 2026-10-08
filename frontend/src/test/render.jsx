import { render } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { AuthProvider } from '../auth/AuthContext.jsx'
import ErrorBoundary from '../components/ErrorBoundary.jsx'
import AppRoutes from '../routes.jsx'

function LocationProbe() {
  const { pathname, search } = useLocation()
  return <p data-testid="location" hidden>{pathname + search}</p>
}

export function renderApp(route = '/') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
        <LocationProbe />
      </MemoryRouter>
    </AuthProvider>,
  )
}
