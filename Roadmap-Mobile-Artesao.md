# Roadmap — Módulo Mobile do Artesão (Cata Log)

> **Objetivo**: Migrar o protótipo Flutter (UI com mock data) para integração real com a API Spring Boot, mantendo fidelidade total ao Design System "The Curated Archive".

---

## 1. Diagnóstico do Estado Atual

### 1.1 Estrutura do Projeto Flutter

```
lib/
├── main.dart                    # Entry point (MaterialApp → SplashScreen)
├── data/
│   └── mock_data.dart           # ⚠️ Modelos + dados estáticos (será eliminado)
├── screens/
│   ├── splash_screen.dart       # Splash animada
│   ├── login_screen.dart        # Login falso (Future.delayed → Dashboard)
│   ├── dashboard_screen.dart    # Shell com BottomNav + Drawer
│   ├── nova_obra_screen.dart    # Form de criação de produto
│   ├── orcamento_screen.dart    # Form de contraproposta
│   ├── chat_screen.dart         # Chat local (mock mensagens)
│   └── tabs/
│       ├── vitrine_tab.dart     # Listagem de produtos (mockProdutos)
│       ├── encomendas_tab.dart  # Listagem de encomendas (mockEncomendas)
│       └── financeiro_tab.dart  # Dashboard financeiro (dados hardcoded)
└── theme/
    ├── app_colors.dart          # ✅ Tokens de cor alinhados ao Stitch
    └── app_theme.dart           # ✅ ThemeData M3 completo
```

### 1.2 Dependências Atuais (`pubspec.yaml`)

| Pacote | Versão | Uso |
|---|---|---|
| `google_fonts` | ^6.2.1 | Plus Jakarta Sans + Manrope |
| `intl` | ^0.19.0 | Formatação de datas |
| `flutter_svg` | ^2.0.17 | Logo SVG |

### 1.3 Pontos Críticos para Refatoração

| Arquivo | Problema | Impacto |
|---|---|---|
| `mock_data.dart` | Modelos e dados estáticos misturados | Todas as telas dependem dele |
| `login_screen.dart` | `_handleLogin()` → `Future.delayed(1s)` | Sem autenticação real |
| `vitrine_tab.dart` | Consome `mockProdutos` diretamente | Sem API |
| `encomendas_tab.dart` | Consome `mockEncomendas` diretamente | Sem API |
| `financeiro_tab.dart` | Valores hardcoded ("R$ 1.470,00") | Sem endpoint financeiro |
| `chat_screen.dart` | `mockMensagens()` — chat local | Sem Stream Chat |
| `orcamento_screen.dart` | `Future.delayed(800ms)` — sem POST real | Sem API |
| `dashboard_screen.dart` | Drawer com nome/email hardcoded | Sem perfil do artesão |

---

## 2. Arquitetura e Gestão de Estado

### 2.1 Padrão Recomendado: **Repository + Provider**

Escolhemos **Provider** (não Riverpod/BLoC) por ser o padrão recomendado pelo Flutter, com baixa curva de aprendizado e suficiente para a escala do projeto.

```
lib/
├── core/
│   ├── api/
│   │   ├── api_client.dart          # Dio com interceptors (JWT, baseUrl)
│   │   └── api_exceptions.dart      # Exceções tipadas
│   └── storage/
│       └── secure_storage.dart      # Wrapper do flutter_secure_storage
├── models/
│   ├── produto.dart                 # fromJson / toJson
│   ├── encomenda.dart
│   ├── login_response.dart
│   └── ...
├── repositories/
│   ├── auth_repository.dart         # POST /auth/artesao/login, esqueci-senha, etc.
│   ├── produto_repository.dart      # GET /produtos/meus, POST /produtos, etc.
│   ├── encomenda_repository.dart    # GET /encomendas/artesao, PUT /contraproposta
│   └── chat_repository.dart         # GET /chat/token
├── providers/
│   ├── auth_provider.dart           # ChangeNotifier: login, logout, user state
│   ├── produto_provider.dart        # ChangeNotifier: CRUD produtos
│   ├── encomenda_provider.dart      # ChangeNotifier: listagem + ações
│   └── chat_provider.dart           # ChangeNotifier: StreamChat client
├── screens/                         # (existente — refatorar consumo)
└── theme/                           # (existente — manter)
```

### 2.2 Fluxo de Dados

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌───────────┐
│  Screen  │────▶│   Provider   │────▶│  Repository  │────▶│  API (Dio) │
│ (Widget) │◀────│ (Notifier)   │◀────│  (Data)      │◀────│  (HTTP)   │
└─────────┘     └──────────────┘     └─────────────┘     └───────────┘
```

### 2.3 Armazenamento Seguro do JWT

```dart
// core/storage/secure_storage.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'jwt_token';
  static const _userKey = 'user_data';

  static Future<void> saveToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  static Future<String?> getToken() =>
      _storage.read(key: _tokenKey);

  static Future<void> clearAll() =>
      _storage.deleteAll();
}
```

### 2.4 Interceptor JWT (Dio)

```dart
// core/api/api_client.dart
class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: 'https://api.catalog.com/api/v1',  // ou env variable
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await SecureStorage.getToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (error, handler) {
        if (error.response?.statusCode == 401) {
          // Token expirado → forçar logout
          SecureStorage.clearAll();
          // Navegar para login
        }
        handler.next(error);
      },
    ));
  }
}
```

### 2.5 Novas Dependências Necessárias

```yaml
# pubspec.yaml — Adições
dependencies:
  provider: ^6.1.2              # Gestão de estado
  dio: ^5.7.0                   # HTTP client
  flutter_secure_storage: ^9.2.4 # Armazenamento seguro JWT
  stream_chat_flutter: ^8.3.0   # Chat em tempo real (Sprint 4)
  image_picker: ^1.1.2          # Upload de imagens (Sprint 2)
  cached_network_image: ^3.4.1  # Cache de imagens
```

---

## 3. Mapeamento de Sprints

---

### Sprint 1 — Autenticação (Auth)

> **Objetivo**: Login real, persistência de sessão e recuperação de senha.

#### Endpoints Envolvidos

| Método | Rota | Descrição | Role |
|---|---|---|---|
| `POST` | `/auth/artesao/login` | Login com email + senha | Público |
| `POST` | `/auth/esqueci-senha` | Solicitar PIN de recuperação | Público |
| `POST` | `/auth/verificar-pin` | Validar PIN sem consumir | Público |
| `POST` | `/auth/redefinir-senha` | Redefinir senha com PIN | Público |
| `POST` | `/auth/trocar-senha` | Troca obrigatória no 1° acesso | JWT |

#### Tarefas

| # | Tarefa | Arquivo | Detalhe |
|---|---|---|---|
| 1.1 | Adicionar dependências | `pubspec.yaml` | `provider`, `dio`, `flutter_secure_storage` |
| 1.2 | Criar `ApiClient` | `core/api/api_client.dart` | Dio + interceptor JWT |
| 1.3 | Criar `SecureStorage` | `core/storage/secure_storage.dart` | Wrapper `flutter_secure_storage` |
| 1.4 | Criar `LoginResponse` model | `models/login_response.dart` | `id`, `token`, `role`, `nome`, `senhaTemporaria` |
| 1.5 | Criar `AuthRepository` | `repositories/auth_repository.dart` | Métodos: `login()`, `esqueciSenha()`, `verificarPin()`, `redefinirSenha()` |
| 1.6 | Criar `AuthProvider` | `providers/auth_provider.dart` | Estado: `user`, `isAuthenticated`, `isLoading`, `error` |
| 1.7 | Registrar providers no `main.dart` | `main.dart` | `MultiProvider` wrapping `MaterialApp` |
| 1.8 | Refatorar `LoginScreen` | `screens/login_screen.dart` | `_handleLogin()` → `AuthProvider.login()` com tratamento de erro |
| 1.9 | Criar tela de Recuperação de Senha | `screens/forgot_password_screen.dart` | Stepper 3 passos (email → PIN → nova senha) |
| 1.10 | Refatorar `SplashScreen` | `screens/splash_screen.dart` | Verificar token no storage → auto-login ou redirecionar |
| 1.11 | Refatorar Drawer (perfil) | `screens/dashboard_screen.dart` | Mostrar `user.nome` e `user.email` do provider |
| 1.12 | Implementar Logout | `dashboard_screen.dart` | `AuthProvider.logout()` → limpar storage → navegar para login |
| 1.13 | Tratar `senhaTemporaria` | `login_screen.dart` | Se `true`, redirecionar para tela de troca obrigatória |

#### Critérios de Aceite
- [ ] Login com credenciais reais funciona
- [ ] Token JWT é salvo no `flutter_secure_storage`
- [ ] Auto-login funciona ao reabrir o app
- [ ] Logout limpa storage e redireciona
- [ ] Recuperação de senha (3 passos) funciona end-to-end
- [ ] Erros de autenticação são exibidos com feedback visual

---

### Sprint 2 — Catálogo (Meus Produtos)

> **Objetivo**: Listar, criar, editar, promover e marcar produtos como vendidos via API.

#### Endpoints Envolvidos

| Método | Rota | Descrição | Role |
|---|---|---|---|
| `GET` | `/produtos/meus?page=0&size=20` | Listar meus produtos (paginado) | ARTESAO |
| `POST` | `/produtos` | Criar produto | ARTESAO |
| `PUT` | `/produtos/{id}` | Atualizar produto | ARTESAO |
| `DELETE` | `/produtos/{id}` | Desativar produto (soft delete) | ARTESAO |
| `PATCH` | `/produtos/{id}/vendido` | Marcar peça única como vendida | ARTESAO |
| `PATCH` | `/produtos/{id}/promocao` | Aplicar/remover promoção | ARTESAO |
| `POST` | `/produtos/{id}/imagens` | Upload de imagem (multipart) | ARTESAO |
| `DELETE` | `/produtos/{id}/imagens/{imgId}` | Remover imagem | ARTESAO |
| `GET` | `/categorias` | Listar categorias (para select) | Público |

#### Tarefas

| # | Tarefa | Arquivo | Detalhe |
|---|---|---|---|
| 2.1 | Criar model `Produto` | `models/produto.dart` | `fromJson()` com todos campos da `ProdutoResponse` |
| 2.2 | Criar model `Categoria` | `models/categoria.dart` | `id`, `nome` |
| 2.3 | Criar `ProdutoRepository` | `repositories/produto_repository.dart` | CRUD completo + imagens |
| 2.4 | Criar `CategoriaRepository` | `repositories/categoria_repository.dart` | `listar()` |
| 2.5 | Criar `ProdutoProvider` | `providers/produto_provider.dart` | Lista paginada, loading, refresh |
| 2.6 | Refatorar `VitrineTab` | `screens/tabs/vitrine_tab.dart` | `Consumer<ProdutoProvider>` em vez de `mockProdutos` |
| 2.7 | Refatorar `NovaObraScreen` | `screens/nova_obra_screen.dart` | `POST /produtos` + upload imagem |
| 2.8 | Criar tela `EditarObraScreen` | `screens/editar_obra_screen.dart` | `PUT /produtos/{id}` + gestão de imagens |
| 2.9 | Implementar "Marcar como Vendida" | `vitrine_tab.dart` | `PATCH /produtos/{id}/vendido` |
| 2.10 | Implementar Promoções | `vitrine_tab.dart` ou nova tela | `PATCH /produtos/{id}/promocao` |
| 2.11 | Pull-to-refresh + paginação | `vitrine_tab.dart` | `RefreshIndicator` + scroll infinito |
| 2.12 | Imagem placeholder → `cached_network_image` | Todos os cards | Cache local das imagens de produto |
| 2.13 | Eliminar `mock_data.dart` (parcial) | `data/mock_data.dart` | Remover `Produto`, `mockProdutos` |

#### Critérios de Aceite
- [ ] Listagem de produtos carrega da API com paginação
- [ ] Criação de produto com upload de imagem funciona
- [ ] Edição e exclusão (soft delete) funcionam
- [ ] "Marcar como Vendida" faz PATCH real
- [ ] Pull-to-refresh atualiza a lista
- [ ] States de loading, empty e error são tratados

---

### Sprint 3 — Negócios (Encomendas + Financeiro)

> **Objetivo**: Listar encomendas do artesão, enviar contraproposta via API e popular o financeiro.

#### Endpoints Envolvidos

| Método | Rota | Descrição | Role |
|---|---|---|---|
| `GET` | `/encomendas/artesao?page=0&size=20` | Listar minhas encomendas | ARTESAO |
| `GET` | `/encomendas/{id}` | Detalhe da encomenda | ARTESAO/COMPRADOR |
| `PUT` | `/encomendas/{id}/contraproposta` | Enviar orçamento (preço + prazo) | ARTESAO |
| `POST` | `/logistica/envio` | Gerar envio (Melhor Envio) | ARTESAO |
| `POST` | `/logistica/cotacao` | Cotação de frete | ARTESAO/COMPRADOR |

#### Tarefas

| # | Tarefa | Arquivo | Detalhe |
|---|---|---|---|
| 3.1 | Criar model `Encomenda` | `models/encomenda.dart` | `fromJson()` com status enum mapping |
| 3.2 | Criar `EncomendaRepository` | `repositories/encomenda_repository.dart` | `listar()`, `buscarPorId()`, `enviarContraproposta()` |
| 3.3 | Criar `EncomendaProvider` | `providers/encomenda_provider.dart` | Lista paginada + ações |
| 3.4 | Refatorar `EncomendasTab` | `screens/tabs/encomendas_tab.dart` | `Consumer<EncomendaProvider>` em vez de `mockEncomendas` |
| 3.5 | Refatorar `OrcamentoScreen` | `screens/orcamento_screen.dart` | `PUT /encomendas/{id}/contraproposta` real |
| 3.6 | Mapear status corretamente | `encomendas_tab.dart` | Status do backend: `AGUARDANDO_ARTESAO`, `PRECO_ACORDADO`, `CONTRAPROPOSTA_ENVIADA`, etc. |
| 3.7 | Criar `FinanceiroProvider` | `providers/financeiro_provider.dart` | Agregar dados de pedidos/encomendas para o dashboard |
| 3.8 | Refatorar `FinanceiroTab` | `screens/tabs/financeiro_tab.dart` | Consumir dados reais (vendas do mês, movimentações) |
| 3.9 | Criar tela de detalhe da encomenda | `screens/encomenda_detalhe_screen.dart` | Timeline de status + dados do comprador |
| 3.10 | Eliminar `mock_data.dart` (total) | `data/mock_data.dart` | Remover `Encomenda`, `Mensagem`, `mockEncomendas`, `mockMensagens` |

#### Critérios de Aceite
- [ ] Listagem de encomendas carrega da API com paginação
- [ ] Enviar contraproposta faz PUT real e atualiza a lista
- [ ] Financeiro mostra dados reais (ou zeros para artesão novo)
- [ ] Navegação entre status funciona corretamente
- [ ] `mock_data.dart` é completamente eliminado

---

### Sprint 4 — Integrações (Chat + Configurações)

> **Objetivo**: Chat em tempo real via Stream Chat e telas de configuração de integrações.

#### Endpoints Envolvidos

| Método | Rota | Descrição | Role |
|---|---|---|---|
| `GET` | `/chat/token` | Obter token do Stream Chat | ARTESAO/COMPRADOR |
| `GET` | `/encomendas/{id}` | Obter `streamChannelId` | ARTESAO/COMPRADOR |

#### Tarefas

| # | Tarefa | Arquivo | Detalhe |
|---|---|---|---|
| 4.1 | Adicionar `stream_chat_flutter` | `pubspec.yaml` | SDK do Stream Chat para Flutter |
| 4.2 | Criar `ChatRepository` | `repositories/chat_repository.dart` | `getToken()` → `GET /chat/token` |
| 4.3 | Criar `ChatProvider` | `providers/chat_provider.dart` | `StreamChatClient.connectUser()` com token da API |
| 4.4 | Refatorar `ChatScreen` | `screens/chat_screen.dart` | Substituir chat mock por `StreamChannel` + `StreamMessageListView` |
| 4.5 | Conectar chat à encomenda | `encomendas_tab.dart` | Ao tocar na encomenda com `PRECO_ACORDADO`, abrir o canal real |
| 4.6 | Criar tela Editar Perfil | `screens/settings/perfil_screen.dart` | Exibir dados do artesão + editar nome/foto |
| 4.7 | Criar tela Configurar Recebimentos | `screens/settings/pagamentos_screen.dart` | Placeholder para vincular Mercado Pago |
| 4.8 | Criar tela Configurar Logística | `screens/settings/logistica_screen.dart` | Placeholder para vincular Melhor Envio |
| 4.9 | Integrar Drawer com telas reais | `dashboard_screen.dart` | Navegação do drawer → novas telas |
| 4.10 | Push Notifications (FCM) | `main.dart` + config nativa | Notificar o artesão de novas encomendas e mensagens |

#### Critérios de Aceite
- [ ] Chat em tempo real funciona entre artesão (mobile) e comprador (web)
- [ ] Mensagens persistem e são carregadas ao reabrir
- [ ] Telas de configuração estão acessíveis pelo drawer
- [ ] Drawer mostra dados reais do artesão logado

---

## 4. Design System — Alinhamento com o Stitch MCP

### 4.1 Status Atual: Já Alinhado

O protótipo Flutter **já implementa corretamente** os tokens do Design System "The Curated Archive":

| Token | Stitch (Web) | Flutter (Mobile) | Status |
|---|---|---|---|
| **Primary** | `#B12300` | `Color(0xFFB12300)` | ✅ |
| **Primary Container** | `#FF7859` | `Color(0xFFFF7859)` | ✅ |
| **Background** | `#FFF4F3` | `Color(0xFFFFF4F3)` | ✅ |
| **On Surface** | `#4E2123` | `Color(0xFF4E2123)` | ✅ |
| **Headline Font** | Plus Jakarta Sans | `GoogleFonts.plusJakartaSans()` | ✅ |
| **Body Font** | Manrope | `GoogleFonts.manrope()` | ✅ |
| **Border Radius (md)** | 12px | `radiusMd = 12.0` | ✅ |
| **Surface Container** | M3 scale | 6 níveis implementados | ✅ |

### 4.2 Divergências a Corrigir

| Item | Problema | Ação |
|---|---|---|
| **Font Web (Inter)** | O web usa Inter; o mobile usa Manrope | Manter Manrope no mobile (decisão de plataforma) — não é um bug |
| **Gradients** | Web não usa gradients; mobile usa `primaryGradient` em botões/FAB | Manter — é um refinamento mobile-first válido |
| **Status Colors** | Hardcoded fora do `AppColors` | Já estão em `AppColors` (`statusAguardando`, `statusOrcamentoEnviado`, `statusVendido`) — ✅ |

### 4.3 Estratégia de Garantia Contínua

Para manter o alinhamento durante as sprints:

1. **Nunca usar cores hexadecimais diretamente** nos widgets — sempre referir `AppColors.*`
2. **Nunca usar `GoogleFonts.*` com valores hardcoded** — preferir `Theme.of(context).textTheme.*` quando possível
3. **Centralizar raios de borda** via `AppTheme.radius*` constantes
4. **Se o Stitch atualizar tokens**, alterar **apenas** `app_colors.dart` e `app_theme.dart` — toda a app reflete automaticamente

---

## 5. Mapeamento Completo API → Tela

| Tela Flutter | Endpoint(s) | Mock Atual |
|---|---|---|
| `LoginScreen` | `POST /auth/artesao/login` | `Future.delayed(1s)` |
| `ForgotPasswordScreen` (nova) | `POST /auth/esqueci-senha` → `POST /auth/verificar-pin` → `POST /auth/redefinir-senha` | Inexistente |
| `SplashScreen` | Verificar token no storage | Navega direto para login |
| `VitrineTab` | `GET /produtos/meus` | `mockProdutos` |
| `NovaObraScreen` | `POST /produtos` + `POST /produtos/{id}/imagens` | Sem submit real |
| `EditarObraScreen` (nova) | `PUT /produtos/{id}` | Inexistente (placeholder no menu) |
| `EncomendasTab` | `GET /encomendas/artesao` | `mockEncomendas` |
| `OrcamentoScreen` | `PUT /encomendas/{id}/contraproposta` | `Future.delayed(800ms)` |
| `ChatScreen` | `GET /chat/token` → Stream Chat SDK | `mockMensagens()` |
| `FinanceiroTab` | Agregação de dados de pedidos | Valores hardcoded |
| Drawer (perfil) | `LoginResponse` do provider | Nome/email hardcoded |

---

## 6. Cronograma Estimado

| Sprint | Duração | Pré-requisito |
|---|---|---|
| **Sprint 1 — Auth** | 3-4 dias | Nenhum |
| **Sprint 2 — Catálogo** | 4-5 dias | Sprint 1 concluída |
| **Sprint 3 — Negócios** | 3-4 dias | Sprint 2 concluída |
| **Sprint 4 — Integrações** | 4-5 dias | Sprint 3 concluída + Stream Chat configurado no backend |

**Total estimado**: 14-18 dias de desenvolvimento

---

## 7. Checklist de Conclusão

- [ ] `mock_data.dart` completamente eliminado
- [ ] Nenhum `Future.delayed` simulando chamadas de rede
- [ ] Todos os endpoints da API mapeados e consumidos
- [ ] JWT armazenado via `flutter_secure_storage`
- [ ] Auto-login funcional
- [ ] Tratamento de erros com feedback visual (SnackBar/Dialog)
- [ ] Pull-to-refresh em todas as listagens
- [ ] Paginação (scroll infinito) em Vitrine e Encomendas
- [ ] Chat real via Stream Chat SDK
- [ ] Design System tokens 100% centralizados em `app_colors.dart` e `app_theme.dart`
