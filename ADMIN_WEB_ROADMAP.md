# ADMIN_WEB_ROADMAP.md

## Visão Geral

Projeto React **independente** (`catalog-admin-web`), separado da vitrine pública (`catalog-web`).  
Domínio de produção: `admin.prismcode.site` — consome a mesma API Backend (Spring Boot) em `/api/v1`.  
Zero dependência de código da vitrine. Ciclos de build, deploy e versionamento independentes.

---

## Arquitetura de Pastas

```
catalog-admin-web/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js          ← (se necessário, Tailwind v4 usa @config)
├── .env                         ← VITE_API_URL=http://localhost:8080/api/v1
├── .env.production              ← VITE_API_URL=/api/v1
├── nginx.conf                   ← SPA fallback + proxy reverso p/ API
├── Dockerfile
└── src/
    ├── main.jsx
    ├── App.jsx                  ← Router raiz com todas as rotas
    ├── index.css                ← Tailwind directives + design tokens
    ├── contexts/
    │   └── AuthContext.jsx      ← Auth admin (login, token, permissões)
    ├── services/
    │   ├── api.js               ← Instância Axios (baseURL, interceptors)
    │   ├── authService.js       ← Endpoints /auth/admin/*
    │   ├── dashboardService.js  ← Endpoints /admin/dashboard, /admin/relatorios/*
    │   ├── artesaoService.js    ← Endpoints /admin/artesaos/*
    │   ├── compradorService.js  ← Endpoints /admin/compradores/*
    │   ├── categoriaService.js  ← Endpoints /categorias (admin CRUD)
    │   ├── encomendaService.js  ← Endpoints /encomendas (admin)
    │   └── adminService.js      ← Endpoints /admin/registrar, /admin/admins/*
    ├── components/
    │   ├── layout/
    │   │   ├── AdminLayout.jsx  ← Sidebar + Topbar + <Outlet/>
    │   │   ├── Sidebar.jsx
    │   │   └── Topbar.jsx
    │   ├── PrivateRoute.jsx     ← Guard: token + ROLE_ADMIN
    │   ├── KpiCard.jsx
    │   ├── DataTable.jsx        ← Tabela genérica (paginação server-side)
    │   ├── ConfirmModal.jsx
    │   ├── CategoryFormModal.jsx
    │   └── PermissionsModal.jsx
    └── pages/
        ├── LoginPage.jsx
        ├── TrocarSenhaPage.jsx
        ├── DashboardPage.jsx
        ├── ArtesaosPage.jsx
        ├── CompradoresPage.jsx
        ├── CategoriasPage.jsx
        ├── EncomendasPage.jsx
        └── AdminsPage.jsx
```

---

## Sprint 7.1 — Setup & Auth

**Objetivo:** Criar o projeto Vite, configurar Tailwind v4, Axios com JWT, guard de rotas, layout shell (Sidebar + Topbar) e login funcional.

### 1. Setup do Projeto

```bash
npm create vite@latest catalog-admin-web -- --template react
cd catalog-admin-web
npm install axios react-router-dom lucide-react
npm install -D tailwindcss @tailwindcss/vite
```

Configurar `vite.config.js` com plugin `@tailwindcss/vite`.

### 2. Variáveis de Ambiente

| Ficheiro | Conteúdo |
|:--|:--|
| `.env` | `VITE_API_URL=http://localhost:8080/api/v1` |
| `.env.production` | `VITE_API_URL=/api/v1` |

### 3. Componentes & Serviços

| Ação | Ficheiro | Descrição |
|:--|:--|:--|
| NEW | `src/services/api.js` | `axios.create({ baseURL: import.meta.env.VITE_API_URL })`. Request interceptor injeta `Bearer` token de `localStorage('admin_token')`. Response interceptor: 401 → limpa storage + redirect `/login`. |
| NEW | `src/services/authService.js` | `loginAdmin(email, senha)` → `POST /auth/admin/login`. `trocarSenha(senhaAtual, novaSenha)` → `POST /auth/trocar-senha`. `logout()` → `POST /auth/logout`. |
| NEW | `src/contexts/AuthContext.jsx` | Estado: `user` (id, email, role, permissoes), `token`, `loading`. Persiste em `localStorage` (`admin_token`, `admin_user`). Expõe `login()`, `logout()`, `hasPermission(perm)`, `isAuthenticated`. |
| NEW | `src/components/PrivateRoute.jsx` | Lê `AuthContext`. Se `!isAuthenticated` → redirect `/login`. Se `user.senhaTemporaria` → redirect `/trocar-senha`. Renderiza `<Outlet/>`. |
| NEW | `src/components/layout/AdminLayout.jsx` | Flex container: `<Sidebar/>` lateral fixa + coluna principal com `<Topbar/>` + `<main><Outlet/></main>`. |
| NEW | `src/components/layout/Sidebar.jsx` | Logo, links de navegação. Renderização condicional por `hasPermission()`. Active state via `useLocation()`. |
| NEW | `src/components/layout/Topbar.jsx` | Email do admin, botão de logout. |
| NEW | `src/pages/LoginPage.jsx` | Form: E-mail + Senha + botão Entrar. **REGRA ESTRITA:** Zero links de "Criar Conta" ou "Registe-se". Nenhum admin se auto-regista. Intercepta `senhaTemporaria === true` → redirect `/trocar-senha`. |
| NEW | `src/pages/TrocarSenhaPage.jsx` | Form: Senha atual + Nova senha + Confirmar. Após sucesso, limpa flag `senhaTemporaria` e redirect `/`. |
| NEW | `src/App.jsx` | `<BrowserRouter>` → `<AuthProvider>` → `<Routes>`. Login público, demais rotas dentro de `<PrivateRoute>` → `<AdminLayout>`. |

### 4. Rotas

| Path | Componente | Guard |
|:--|:--|:--|
| `/login` | `LoginPage` | Público (redirect se autenticado) |
| `/trocar-senha` | `TrocarSenhaPage` | Autenticado (apenas com `senhaTemporaria`) |
| `/` | `AdminLayout` → `PrivateRoute` → `<Outlet/>` | ROLE_ADMIN |

### Contrato de Login

**`POST /auth/admin/login`** → `LoginResponse`:
```json
{ "id": 1, "token": "jwt...", "role": "ADMIN", "nome": "...", "senhaTemporaria": false }
```

O token JWT contém as claims de permissões. O frontend persiste `permissoes` no user object (extraído do JWT ou de endpoint separado).

---

## Sprint 7.2 — Dashboard & Segurança

**Objetivo:** Página inicial com KPIs, faturamento por período, ranking de artesãos. Validar que o Super Admin (V23 Flyway) funciona end-to-end.

### Componentes

| Ação | Ficheiro | Descrição |
|:--|:--|:--|
| NEW | `src/pages/DashboardPage.jsx` | Grid de 4 `KpiCard` (totalArtesaos, totalCompradores, totalProdutos, totalPedidos). Secção faturamento com date range picker (totalFaturamento, taxaPlataforma, totalPedidos). Tabela/lista Top Artesãos. |
| NEW | `src/components/KpiCard.jsx` | Card genérico: ícone (Lucide), label, valor formatado (moeda BRL / número), cor de destaque. |
| NEW | `src/services/dashboardService.js` | Agrega os 3 endpoints de métricas. |

### Serviços Axios

```
GET  /admin/dashboard                               → obterDashboard()
GET  /admin/relatorios/faturamento?inicio=&fim=     → obterFaturamento(inicio, fim)
GET  /admin/relatorios/top-artesaos?limite=5        → obterTopArtesaos(limite)
```

### Contratos de Resposta

| DTO | Campos |
|:--|:--|
| `DashboardResponse` | `totalArtesaos`, `totalCompradores`, `totalProdutos`, `totalPedidos` |
| `FaturamentoResponse` | `totalFaturamento` (BigDecimal), `taxaPlataforma` (BigDecimal), `totalPedidos` (Long) |
| `TopArtesaoResponse` | `artesaoId`, `nomeArtesao`, `totalVendido` (BigDecimal), `quantidadePedidos` (Long) |

### Rotas

| Path | Componente | Permissão |
|:--|:--|:--|
| `/` (index) | `DashboardPage` | `VER_DASHBOARD` |

### Segurança — Super Admin

O Admin Mestre (`paulocardoso64h@gmail.com`) foi inserido via migration `V23__insert_master_admin.sql`:
- Hash BCrypt para a senha definida
- `senha_temporaria = FALSE`
- Todas as 5 permissões: `VER_DASHBOARD`, `GERENCIAR_ARTESAOS`, `GERENCIAR_COMPRADORES`, `VER_RELATORIOS`, `GERENCIAR_ADMINS`

Validação: login com Admin Mestre → dashboard carrega KPIs → confirma fluxo end-to-end.

---

## Sprint 7.3 — Gestão de Artesãos & Compradores

**Objetivo:** Tabelas paginadas (server-side) para listar artesãos e compradores. Ações de verificação de selo e bloqueio.

### Componentes

| Ação | Ficheiro | Descrição |
|:--|:--|:--|
| NEW | `src/components/DataTable.jsx` | Tabela genérica: recebe `columns[]`, `data[]`, `page`, `totalPages`, `onPageChange`. Suporta render customizado por coluna (badges, botões). Paginação integrada. |
| NEW | `src/components/ConfirmModal.jsx` | Modal genérico: título, mensagem, variant (danger/warning), callbacks onConfirm/onCancel. Reutilizável para ações destrutivas. |
| NEW | `src/pages/ArtesaosPage.jsx` | `DataTable` — colunas: Ateliê, Email, Cidade/Estado, Verificado (badge verde/cinza), Criado Em, Ações. Botões: Verificar ✓ / Remover Verificação ✗. `ConfirmModal` antes de cada ação. |
| NEW | `src/pages/CompradoresPage.jsx` | `DataTable` — colunas: Nome, Email, CPF (mascarado), Cidade/Estado, Ativo (badge), Criado Em, Ações. Botões: Bloquear 🔒 / Desbloquear 🔓. `ConfirmModal` antes de cada ação. |
| NEW | `src/services/artesaoService.js` | Chamadas admin de artesãos. |
| NEW | `src/services/compradorService.js` | Chamadas admin de compradores. |

### Serviços Axios

```
GET  /admin/artesaos?page=0&size=20                  → listarArtesaos(page, size)
PUT  /admin/artesaos/{id}/verificar                   → verificarArtesao(id)
PUT  /admin/artesaos/{id}/remover-verificacao          → removerVerificacao(id)
GET  /admin/compradores?page=0&size=20                → listarCompradores(page, size)
PUT  /admin/compradores/{id}/bloquear                  → bloquearComprador(id)
PUT  /admin/compradores/{id}/desbloquear               → desbloquearComprador(id)
```

### Contratos (Spring `Page<T>`)

| DTO | Campos |
|:--|:--|
| `ArtesaoAdminResponse` | `id`, `nomeAtelie`, `email`, `cep`, `cidade`, `estado`, `seloVerificado` (Boolean), `ativo` (Boolean), `criadoEm` |
| `CompradorAdminResponse` | `id`, `nome`, `email`, `cpf`, `cidade`, `estado`, `ativo` (Boolean), `criadoEm` |

Paginação Spring: `{ content: T[], totalPages, totalElements, number, size }`

### Rotas

| Path | Componente | Permissão |
|:--|:--|:--|
| `/artesaos` | `ArtesaosPage` | `GERENCIAR_ARTESAOS` |
| `/compradores` | `CompradoresPage` | `GERENCIAR_COMPRADORES` |

---

## Sprint 7.4 — Gestão de Categorias (CRUD)

**Objetivo:** CRUD completo de categorias com modal de criação/edição e exclusão lógica (desativação).

### Componentes

| Ação | Ficheiro | Descrição |
|:--|:--|:--|
| NEW | `src/pages/CategoriasPage.jsx` | `DataTable` — colunas: ID, Nome, Ativa (badge), Ações. Botão header "Nova Categoria". Botões por linha: Editar (abre `CategoryFormModal` preenchido), Desativar (abre `ConfirmModal`). |
| NEW | `src/components/CategoryFormModal.jsx` | Modal com input `nome`. Modo criação (POST) e edição (PUT) controlado por prop `categoria`. Validação: nome obrigatório. |
| NEW | `src/services/categoriaService.js` | CRUD de categorias (endpoints admin). |

### Serviços Axios

```
GET    /categorias/admin                              → listarTodas()
POST   /categorias              body: { nome }        → criar(nome)
PUT    /categorias/{id}         body: { nome }        → atualizar(id, nome)
DELETE /categorias/{id}                               → desativar(id)
```

### Contrato

`CategoriaResponse` → `{ id, nome, ativa }`

### Rotas

| Path | Componente | Permissão |
|:--|:--|:--|
| `/categorias` | `CategoriasPage` | `ADMIN` (base) |

---

## Sprint 7.5 — Gestão de Encomendas (Liberação Escrow)

**Objetivo:** Tabela de encomendas personalizadas com filtragem por status e ação crítica "Confirmar Entrega" para liberar o pagamento retido do artesão.

### Componentes

| Ação | Ficheiro | Descrição |
|:--|:--|:--|
| NEW | `src/pages/EncomendasPage.jsx` | `DataTable` — colunas: ID, Comprador, Artesão, Descrição, Status (badge colorido), Valor, Ações. Filtro por status (select/tabs). Botão "Confirmar Entrega" visível apenas quando `status === 'ENVIADO'`. `ConfirmModal` com alerta de que esta ação libera o pagamento ao artesão. |
| NEW | `src/services/encomendaService.js` | Chamadas admin de encomendas. |

### Serviços Axios

```
GET  /encomendas/artesao?page=0&size=20               → listarEncomendas(page, size)
PUT  /encomendas/{id}/entregue                         → confirmarEntrega(id)
```

### Contrato

`EncomendaResponse` → `{ id, compradorNome, artesaoNome, descricao, orcamentoMaximo, status, contrapropostaPreco, contapropostaPrazo, canalChatId }`

**Status possíveis:** `PENDENTE`, `CONTRAPROPOSTA`, `ACEITA`, `EM_PRODUCAO`, `ENVIADO`, `ENTREGUE`

### Rotas

| Path | Componente | Permissão |
|:--|:--|:--|
| `/encomendas` | `EncomendasPage` | `ADMIN` (base) |

---

## Sprint 7.6 — Gestão de Administradores

**Objetivo:** Interface exclusiva para o Admin Mestre (ou delegados com `GERENCIAR_ADMINS`) criar novos curadores e gerir permissões granulares.

### Componentes

| Ação | Ficheiro | Descrição |
|:--|:--|:--|
| NEW | `src/pages/AdminsPage.jsx` | `DataTable` — colunas: ID, Email, Senha Temporária (badge), Permissões (chips coloridos), Criado Em, Ações. Botão header "Novo Admin" → abre modal com campo email (chama `POST /admin/registrar`). Botão por linha "Editar Permissões" → abre `PermissionsModal`. **PADRÃO SUPER ADMIN:** Esta é a ÚNICA interface onde novos administradores são criados. Backend gera senha temporária automática e envia por e-mail — novo admin é forçado a trocar na primeira sessão. |
| NEW | `src/components/PermissionsModal.jsx` | Modal com 5 checkboxes (uma por `PermissaoAdmin`). Recebe permissões atuais como estado inicial. Submete `PUT /admin/admins/{id}/permissoes`. |
| NEW | `src/services/adminService.js` | CRUD de administradores. |

### Serviços Axios

```
POST /admin/registrar                  body: { email }        → registrar(email)
GET  /admin/admins                                            → listarTodos()
PUT  /admin/admins/{id}/permissoes     body: { permissoes }   → atualizarPermissoes(id, permissoes)
```

### Contratos

| DTO | Campos |
|:--|:--|
| `AdminResponse` | `id`, `email`, `senhaTemporaria` (Boolean), `permissoes` (Set\<PermissaoAdmin\>), `criadoEm` |

**Enum `PermissaoAdmin`:** `VER_DASHBOARD`, `GERENCIAR_ARTESAOS`, `GERENCIAR_COMPRADORES`, `VER_RELATORIOS`, `GERENCIAR_ADMINS`

### Rotas

| Path | Componente | Permissão |
|:--|:--|:--|
| `/administradores` | `AdminsPage` | `GERENCIAR_ADMINS` |

---

## Mapa Final de Rotas

```
/login               → LoginPage               (público)
/trocar-senha        → TrocarSenhaPage          (autenticado, senhaTemporaria)
/                    → AdminLayout > PrivateRoute
  /                  → DashboardPage            (VER_DASHBOARD)
  /artesaos          → ArtesaosPage             (GERENCIAR_ARTESAOS)
  /compradores       → CompradoresPage          (GERENCIAR_COMPRADORES)
  /categorias        → CategoriasPage           (ADMIN)
  /encomendas        → EncomendasPage           (ADMIN)
  /administradores   → AdminsPage               (GERENCIAR_ADMINS)
```

---

## Decisões Técnicas

- **Projeto independente:** `catalog-admin-web` é um repo/diretório separado de `catalog-web`. Build, deploy e domínio (`admin.prismcode.site`) distintos. Consome a mesma API Spring Boot.
- **Padrão Super Admin (Seed User):** Nenhum admin se auto-regista. Admin Mestre (`paulocardoso64h@gmail.com`) inserido via `V23__insert_master_admin.sql` com todas as 5 permissões. Novos admins criados exclusivamente via `AdminsPage` → `POST /admin/registrar`.
- **Axios isolado:** Instância própria em `src/services/api.js`. Interceptor request injeta JWT. Interceptor response: 401 → limpa `admin_token`/`admin_user` + redirect `/login`.
- **localStorage dedicado:** Chaves `admin_token` e `admin_user` (sem colisão com `catalog_token`/`catalog_user` da vitrine).
- **DataTable genérico:** Componente único de tabela paginada (server-side) reutilizado em todas as páginas de gestão.
- **Permissões granulares:** `Sidebar` e cada página verificam `hasPermission()` antes de renderizar. 403 tratado com toast de erro.
- **Tailwind CSS v4:** Setup via `@tailwindcss/vite` plugin. Design system com tokens customizados em `index.css`.
- **Nginx (produção):** SPA fallback (`try_files $uri /index.html`) + proxy reverso `/api/v1` → backend Spring Boot.
