import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import PrivateRoute from '../components/layout/PrivateRoute';
import HomePage from '../pages/HomePage';
import VitrinePage from '../pages/VitrinePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ProductPage from '../pages/ProductPage';
import NotFoundPage from '../pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // ── Rotas Públicas ──
      { index: true, element: <HomePage /> },
      { path: 'vitrine', element: <VitrinePage /> },
      { path: 'produto/:id', element: <ProductPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'registro', element: <RegisterPage /> },
      { path: 'esqueci-senha', element: <ForgotPasswordPage /> },

      // ── Rotas Protegidas (requer autenticação) ──
      {
        element: <PrivateRoute />,
        children: [
          // Sprint 3 — Carrinho e Desejos
          // { path: 'carrinho', element: <CartPage /> },
          // { path: 'desejos', element: <WishlistPage /> },

          // Sprint 4 — Checkout e Pedidos
          // { path: 'checkout', element: <CheckoutPage /> },
          // { path: 'pedidos', element: <OrdersPage /> },
        ],
      },

      // ── Catch-all ──
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
