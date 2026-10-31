import { Routes, Route } from 'react-router'
import Layout from './components/Layout.jsx'
import Catalog from './pages/Catalog.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import MangaDetail from './pages/MangaDetail.jsx'
import NotFound from './pages/NotFound.jsx'
import RequireAuth from './auth/RequireAuth.jsx'
import Account from './pages/Account.jsx'
import AdminTitles from './pages/AdminTitles.jsx'
import AdminNewTitle from './pages/AdminNewTitle.jsx'
import FlashSale from './pages/FlashSale.jsx'
import Cart from './pages/Cart.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Catalog />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="manga/:id" element={<MangaDetail />} />
        <Route path="account" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="admin" element={<RequireAuth role="ADMIN"><AdminTitles /></RequireAuth>} />
        <Route path="admin/titles/new" element={<RequireAuth role="ADMIN"><AdminNewTitle /></RequireAuth>} />
        <Route path="flash-sale" element={<FlashSale />} />
        <Route path="cart" element={<RequireAuth><Cart /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
