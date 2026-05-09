# Cata Log — Roadmap de Desenvolvimento Frontend (Vitrine Web)

> **Stack**: React 19 + Vite 8 + Tailwind CSS 4 + Axios + React Router Dom + Lucide React
> **Design System**: "The Curated Archive" (Google Stitch — Projeto "Página Inicial Cata Log")
> **Backend**: Spring Boot 3.3.5 @ `http://localhost:8080/api/v1` (60 endpoints, JWT + RBAC)

---

## Arquitetura de Pastas (`src/`)

```
src/
├── assets/                  # Logo, ícones estáticos, fontes
│   └── logo.svg
├── components/
│   ├── common/              # Componentes reutilizáveis (Design System)
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── ProductCard.jsx
│   │   ├── Spinner.jsx
│   │   └── Modal.jsx
│   ├── layout/              # Shell da aplicação
│   │   ├── MainLayout.jsx
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── cart/                 # Componentes do carrinho
│   │   ├── CartDrawer.jsx
│   │   └── CartItem.jsx
│   ├── product/             # Componentes de produto
│   │   ├── ProductGallery.jsx
│   │   ├── ProductInfo.jsx
│   │   └── ProductReviews.jsx
│   └── checkout/            # Componentes do checkout
│       ├── ShippingCalculator.jsx
│       └── OrderSummary.jsx
├── contexts/                # Context API (global state)
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── hooks/                   # Custom hooks
│   ├── useAuth.js
│   └── useCart.js
├── pages/                   # Páginas (1 por rota)
│   ├── HomePage.jsx
│   ├── ProductPage.jsx
│   ├── CartPage.jsx
│   ├── CheckoutPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── OrdersPage.jsx
│   ├── WishlistPage.jsx
│   └── NotFoundPage.jsx
├── services/                # Camada de API
│   ├── api.js               # Axios instance + interceptors
│   ├── authService.js
│   ├── productService.js
│   ├── cartService.js
│   ├── orderService.js
│   └── shippingService.js
├── routes/
│   └── AppRoutes.jsx        # Configuração de rotas
├── App.jsx
├── main.jsx
└── index.css                # Tailwind + Design tokens
```

---

## Fases do Roadmap

### ✅ FASE 1 — Fundação (Sprint Atual)
**Objetivo**: Skeleton navegável com design system aplicado.

| Entrega | Arquivo | Requisito |
|---|---|---|
| Axios configurado com interceptor JWT | `services/api.js` | Infraestrutura |
| React Router com rotas placeholder | `routes/AppRoutes.jsx` | RF-VIT06 |
| Layout base (Navbar + Footer + Outlet) | `components/layout/*` | RF-VIT01 |
| Design tokens no Tailwind (cores, fontes, sombras) | `index.css` + `vite.config.js` | Design System |
| Página Home placeholder | `pages/HomePage.jsx` | RF-VIT01 |

---

### 📋 FASE 2 — Autenticação e Vitrine (Próxima)
**Objetivo**: Login/Registro funcional + Grid de produtos.

| Entrega | Arquivo | Requisito |
|---|---|---|
| AuthContext + useAuth hook | `contexts/AuthContext.jsx` | RF-VIT06 |
| Telas de Login e Registro | `pages/LoginPage.jsx`, `RegisterPage.jsx` | RF-VIT06 |
| Rota protegida (PrivateRoute) | `routes/AppRoutes.jsx` | RNF-ADM01 |
| ProductCard com selo verificado + badge oferta | `components/common/ProductCard.jsx` | RF-VIT01 |
| Grid da vitrine com filtros e busca | `pages/HomePage.jsx` | RF-VIT01 |
| Service de produtos (vitrine, busca, detalhe) | `services/productService.js` | RF-VIT01, RF-VIT02 |

**Endpoints consumidos**:
- `POST /auth/comprador/login`
- `POST /auth/comprador/registrar`
- `GET /produtos/vitrine`
- `GET /produtos/{id}`
- `GET /categorias`

---

### 📋 FASE 3 — Produto, Carrinho e Desejos
**Objetivo**: Página de detalhe do produto + carrinho funcional.

| Entrega | Arquivo | Requisito |
|---|---|---|
| Página de detalhe com galeria + ficha técnica | `pages/ProductPage.jsx` | RF-VIT02 |
| Sistema de avaliações (estrelas + comentários) | `components/product/ProductReviews.jsx` | RF-VIT02 |
| CartContext + CartDrawer (drawer lateral) | `contexts/CartContext.jsx`, `components/cart/*` | RF-VIT03 |
| Lista de desejos (favoritos) | `pages/WishlistPage.jsx` | RF-VIT02 |

**Endpoints consumidos**:
- `GET /produtos/{id}`
- `GET /produtos/{id}/avaliacoes`
- `POST /produtos/{id}/avaliacoes`
- `POST /carrinho/itens`
- `GET /carrinho`
- `DELETE /carrinho/itens/{produtoId}`
- `POST /desejos/{produtoId}`
- `GET /desejos`

---

### 📋 FASE 4 — Checkout, Pagamento e Encomendas
**Objetivo**: Fluxo completo de compra + encomendas personalizadas.

| Entrega | Arquivo | Requisito |
|---|---|---|
| Calculadora de frete (Melhor Envio) | `components/checkout/ShippingCalculator.jsx` | RF-VIT04 |
| Página de checkout com resumo | `pages/CheckoutPage.jsx` | RF-VIT04 |
| Integração Mercado Pago (link de pagamento) | `services/orderService.js` | RF-VIT04 |
| Modal de encomenda personalizada | `components/common/Modal.jsx` | RF-VIT05, RF-VIT07 |
| Página de "Meus Pedidos" | `pages/OrdersPage.jsx` | RF-VIT03 |

**Endpoints consumidos**:
- `POST /logistica/cotacao`
- `POST /pedidos/checkout`
- `POST /pagamentos/{pedidoId}`
- `POST /encomendas`
- `GET /encomendas/comprador`
- `GET /pedidos/meus`

---

### 📋 FASE 5 — Polimento e Deploy
**Objetivo**: UX premium, responsividade, SEO e Docker.

| Entrega | Requisito |
|---|---|
| Animações e micro-interações (hover, skeleton loaders) | UX |
| Responsividade mobile-first completa | UX |
| SEO (meta tags, Open Graph, sitemap) | GER |
| Tratamento global de erros (toast notifications) | UX |
| Docker build otimizado (multi-stage + nginx) | GER |
| Testes E2E dos fluxos críticos | GER |

---

## Design System — Tokens Visuais (do Google Stitch)

| Token | Valor |
|---|---|
| **Primary** | `#b22300` |
| **Primary Container** | `#dc340a` |
| **Background** | `#faf9f7` |
| **Surface** | `#faf9f7` |
| **Surface Container Low** | `#f4f3f1` |
| **Surface Container** | `#efeeec` |
| **Surface Container High** | `#e9e8e6` |
| **On Background** | `#1a1c1b` |
| **On Surface Variant** | `#5c4039` |
| **Outline** | `#916f68` |
| **Outline Variant** | `#e5beb5` |
| **Error/Tertiary** | `#b61722` |
| **Headline Font** | Manrope |
| **Body Font** | Inter |
| **Corner Radius** | 12px (md), 16px (lg) |
| **Ambient Shadow** | `0 12px 32px rgba(26,28,27,0.06)` |
