import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import PrivateRoute from './components/PrivateRoute'
import AdminLayout from './components/layout/AdminLayout'
import LoginPage from './pages/LoginPage'
import TrocarSenhaPage from './pages/TrocarSenhaPage'
import DashboardPage from './pages/DashboardPage'
import ArtesaosPage from './pages/ArtesaosPage'
import CompradoresPage from './pages/CompradoresPage'
import CategoriasPage from './pages/CategoriasPage'
import EncomendasPage from './pages/EncomendasPage'
import AdminsPage from './pages/AdminsPage'
import LogsPage from './pages/LogsPage'

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/trocar-senha" element={<TrocarSenhaPage />} />

            <Route element={<PrivateRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="artesaos" element={<ArtesaosPage />} />
                <Route path="compradores" element={<CompradoresPage />} />
                <Route path="categorias" element={<CategoriasPage />} />
                <Route path="encomendas" element={<EncomendasPage />} />
                <Route path="administradores" element={<AdminsPage />} />
                <Route path="logs" element={<LogsPage />} />
              </Route>
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
