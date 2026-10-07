import { Routes, Route } from 'react-router'
import Layout from './components/Layout.jsx'
import NotFound from './pages/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
