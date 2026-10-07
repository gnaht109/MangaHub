import { Navigate, useLocation } from 'react-router'
import { useAuth } from './AuthContext.jsx'
import NotFound from '../pages/NotFound.jsx'

export default function RequireAuth({ role, children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?next=${next}`} replace />
  }
  if (role && user.role !== role) return <NotFound />
  return children
}
