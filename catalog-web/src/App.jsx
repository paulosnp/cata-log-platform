import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ToastProvider } from './components/common/Toast';
import MainLayout from './components/layout/MainLayout';
import PrivateRoute from './components/layout/PrivateRoute';
import HomePage from './pages/HomePage';
import VitrinePage from './pages/VitrinePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/checkout/CheckoutPage';
import PaymentSuccessPage from './pages/checkout/PaymentSuccessPage';
import PaymentFailurePage from './pages/checkout/PaymentFailurePage';
import PaymentPendingPage from './pages/checkout/PaymentPendingPage';
import OrdersPage from './pages/OrdersPage';
import EncomendaPage from './pages/EncomendaPage';
import EncomendaDetalhePage from './pages/EncomendaDetalhePage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ChatProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <Routes>
                  <Route path="/" element={<MainLayout />}>
                    {/* ── Rotas Públicas ── */}
                    <Route index element={<HomePage />} />
                    <Route path="vitrine" element={<VitrinePage />} />
                    <Route path="produto/:id" element={<ProductPage />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="registro" element={<RegisterPage />} />
                    <Route path="esqueci-senha" element={<ForgotPasswordPage />} />
                    <Route path="carrinho" element={<CartPage />} />
                    <Route path="desejos" element={<WishlistPage />} />

                    {/* ── Feedback de Pagamento (públicas — MP redireciona aqui) ── */}
                    <Route path="pagamento/sucesso" element={<PaymentSuccessPage />} />
                    <Route path="pagamento/falha" element={<PaymentFailurePage />} />
                    <Route path="pagamento/pendente" element={<PaymentPendingPage />} />

                    {/* ── Rotas Protegidas ── */}
                    <Route element={<PrivateRoute />}>
                      <Route path="checkout" element={<CheckoutPage />} />
                      <Route path="pedidos" element={<OrdersPage />} />
                      <Route path="encomendas" element={<EncomendaPage />} />
                      <Route path="encomendas/:id" element={<EncomendaDetalhePage />} />
                    </Route>

                    {/* ── Catch-all ── */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </ChatProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
