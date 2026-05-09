import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import PrivateRoute from '../components/layout/PrivateRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // ── Rotas Públicas ──
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'registro', element: <RegisterPage /> },
      { path: 'esqueci-senha', element: <ForgotPasswordPage /> },

      // ── Rotas Protegidas (requer autenticação) ──
      {
        element: <PrivateRoute />,
        children: [
          // Fase 3 — Produto, Carrinho e Desejos
          // { path: 'carrinho', element: <CartPage /> },
          // { path: 'desejos', element: <WishlistPage /> },

          // Fase 4 — Checkout e Pedidos
          // { path: 'checkout', element: <CheckoutPage /> },
          // { path: 'pedidos', element: <OrdersPage /> },
        ],
      },

      // ── Rotas Públicas (futuras) ──
      // { path: 'produto/:id', element: <ProductPage /> },

      // ── Catch-all ──
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
