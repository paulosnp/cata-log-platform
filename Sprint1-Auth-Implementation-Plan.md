# Sprint 1 — Auth: Plano de Implementação

> **Tech Lead**: Módulo Mobile do Artesão — Cata Log  
> **Stack**: Flutter 3.7+ · Dio · Provider · flutter_secure_storage  
> **API Target**: Spring Boot — `POST /api/v1/auth/artesao/login`

---

## 1. Contrato da API (Source of Truth)

### `POST /api/v1/auth/artesao/login`

**Request Body** (`LoginRequest`):
```json
{
  "email": "artesao@email.com",
  "senha": "MinhaSenh@123"
}
```

**Response 200** (`LoginResponse`):
```json
{
  "id": 1,
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "role": "ARTESAO",
  "nome": "Ateliê Mãos de Barro",
  "senhaTemporaria": false
}
```

**Erros possíveis**:
| HTTP | Causa | Mensagem para o usuário |
|---|---|---|
| 401 | Email/senha incorretos | "E-mail ou senha incorretos." |
| 403 | Conta bloqueada (`ativo = false`) | "Sua conta está bloqueada." |
| 400 | Validação (email vazio, etc.) | "Preencha todos os campos." |

---

## 2. Arquitetura de Ficheiros (Novos)

```
lib/
├── core/
│   ├── api/
│   │   └── api_client.dart            # NOVO — Dio + Interceptor JWT
│   └── storage/
│       └── secure_storage.dart        # NOVO — Wrapper flutter_secure_storage
├── models/
│   └── login_response.dart            # NOVO — DTO com fromJson()
├── services/
│   └── auth_service.dart              # NOVO — Chamadas HTTP de auth
├── providers/
│   └── auth_provider.dart             # NOVO — ChangeNotifier (estado global)
├── screens/
│   ├── splash_screen.dart             # EDITAR — checkAuthStatus()
│   ├── login_screen.dart              # EDITAR — Consumer<AuthProvider>
│   └── dashboard_screen.dart          # EDITAR — Drawer dinâmico + logout
├── main.dart                          # EDITAR — MultiProvider
└── pubspec.yaml                       # EDITAR — Novas dependências
```

---

## 3. Ordem de Execução (9 Steps)

### Step 1 — Dependências (`pubspec.yaml`)

**Ação**: Adicionar ao bloco `dependencies`:
```yaml
  dio: ^5.7.0
  flutter_secure_storage: ^9.2.4
  provider: ^6.1.2
```

**Validação**: `flutter pub get` sem erros.

---

### Step 2 — SecureStorage (`lib/core/storage/secure_storage.dart`)

**Ação**: Criar wrapper estático para `FlutterSecureStorage`.

**Métodos**:
| Método | Retorno | Descrição |
|---|---|---|
| `saveToken(String)` | `Future<void>` | Salva JWT |
| `getToken()` | `Future<String?>` | Lê JWT (null se inexistente) |
| `saveUserData(String)` | `Future<void>` | Salva JSON do user |
| `getUserData()` | `Future<String?>` | Lê JSON do user |
| `clearAll()` | `Future<void>` | Limpa tudo (logout) |

**Chaves**:
- `catalog_jwt_token`
- `catalog_user_data`

---

### Step 3 — ApiClient (`lib/core/api/api_client.dart`)

**Ação**: Criar singleton do Dio com:
- `baseUrl`: `http://10.0.2.2:8080/api/v1` (emulador Android)
- `connectTimeout`: 15s
- `receiveTimeout`: 15s
- `contentType`: `application/json`

**Interceptor**:
- `onRequest`: Lê token do `SecureStorage` → injeta `Authorization: Bearer <token>` se existir
- `onError`: Se `statusCode == 401` → limpa storage (token expirado)

**Exposição**: `Dio get dio` para os services consumirem.

---

### Step 4 — Model (`lib/models/login_response.dart`)

**Ação**: Criar classe `LoginResponse` com:

```dart
class LoginResponse {
  final int id;
  final String token;
  final String role;
  final String nome;
  final bool senhaTemporaria;

  factory LoginResponse.fromJson(Map<String, dynamic> json) { ... }
  Map<String, dynamic> toJson() { ... }
}
```

**Nota**: `toJson()` necessário para serializar no `SecureStorage`.

---

### Step 5 — AuthService (`lib/services/auth_service.dart`)

**Ação**: Criar service stateless que recebe o `ApiClient`.

**Métodos**:
| Método | HTTP | Rota | Retorno |
|---|---|---|---|
| `login(email, senha)` | POST | `/auth/artesao/login` | `LoginResponse` |

**Responsabilidade**:
1. Faz `POST` com body `{ "email": ..., "senha": ... }`
2. Parseia a `LoginResponse` da resposta
3. Salva o `token` no `SecureStorage`
4. Salva o `userJson` no `SecureStorage`
5. Retorna o `LoginResponse`

**Tratamento de erro**:
- `DioException` com `statusCode` → lançar mensagem em português
- Fallback: "Erro de conexão. Tente novamente."

---

### Step 6 — AuthProvider (`lib/providers/auth_provider.dart`)

**Ação**: Criar `ChangeNotifier` com:

**Estado**:
| Campo | Tipo | Default |
|---|---|---|
| `_user` | `LoginResponse?` | `null` |
| `_isLoading` | `bool` | `false` |
| `_errorMessage` | `String?` | `null` |

**Getters**:
- `bool get isAuthenticated` → `_user != null`
- `LoginResponse? get user` → `_user`
- `bool get isLoading` → `_isLoading`
- `String? get errorMessage` → `_errorMessage`

**Métodos**:
| Método | Ação |
|---|---|
| `login(email, senha)` | Chama `AuthService.login()` → atualiza `_user` / `_errorMessage` |
| `checkAuthStatus()` | Lê token do storage → se existir, reconstrói `_user` → `notifyListeners()` |
| `logout()` | `SecureStorage.clearAll()` → `_user = null` → `notifyListeners()` |
| `clearError()` | `_errorMessage = null` → `notifyListeners()` |

---

### Step 7 — main.dart (MultiProvider)

**Ação**: Wrapping do `MaterialApp` com `MultiProvider`:

```dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => AuthProvider()),
  ],
  child: MaterialApp(...)
)
```

**Sem alterar** nenhuma propriedade do `MaterialApp` existente (theme, title, debug banner).

---

### Step 8 — LoginScreen (Refatoração)

**Mudanças**:
1. **Remove**: `Future.delayed(1s)` do `_handleLogin()`
2. **Adiciona**: `final authProvider = Provider.of<AuthProvider>(context, listen: false)`
3. **`_handleLogin()`**:
   - Validação local (email/senha não vazios)
   - `await authProvider.login(email, senha)`
   - Se `authProvider.isAuthenticated` → navega para `DashboardScreen`
   - Se `authProvider.errorMessage != null` → mostra `SnackBar` com erro
4. **Loading state**: Usa `Consumer<AuthProvider>` para o botão → mostra `CircularProgressIndicator` quando `isLoading == true`
5. **"Esqueci a minha senha"**: Permanece como está (implementação futura)

**UI inalterada**: Gradients, animações de fade/slide, layout do formulário — tudo mantido.

---

### Step 9 — SplashScreen (Auto-login)

**Mudanças**:
1. **Remove**: `Future.delayed(2s)` → `_navigateToLogin()` fixo
2. **Adiciona**: Após a animação iniciar, chama `authProvider.checkAuthStatus()`
3. **Decisão de rota**:
   - Se `isAuthenticated` → navega para `DashboardScreen`
   - Se não → navega para `LoginScreen`
4. **Delay mínimo**: Mantém 2s de splash para a animação completar antes de navegar

**UI inalterada**: Gradient, logo SVG, animação de scale/fade — tudo mantido.

---

### Step 9.1 — DashboardScreen (Drawer dinâmico)

**Mudanças**:
1. **Drawer**: Substituir nome hardcoded `'Ateliê Mãos de Barro'` por `authProvider.user?.nome`
2. **Drawer**: Substituir email hardcoded `'atelie.maos@email.com'` por dados do user
3. **Logout**: `_handleLogout()` chama `authProvider.logout()` antes de navegar para login

---

## 4. Diagrama de Fluxo

```
┌─────────────────┐
│   SplashScreen   │
│ (animação 2s)    │
└────────┬────────┘
         │
    checkAuthStatus()
         │
    ┌────▼────┐
    │ Token?  │
    └────┬────┘
     Yes │     No
    ┌────▼──┐ ┌──▼────┐
    │Dashbd │ │ Login │
    └───────┘ └───┬───┘
                  │
             _handleLogin()
                  │
           POST /auth/artesao/login
                  │
           ┌──────▼──────┐
           │  200 OK?    │
           └──────┬──────┘
            Yes   │    No
           ┌──────▼──┐ ┌──▼────────┐
           │ Save JWT │ │ SnackBar  │
           │ → Dashbd │ │ (erro)    │
           └─────────┘ └───────────┘
```

---

## 5. Ficheiros Tocados (Resumo)

| Ficheiro | Ação | Linhas Estimadas |
|---|---|---|
| `pubspec.yaml` | EDITAR | +3 deps |
| `lib/core/storage/secure_storage.dart` | CRIAR | ~35 linhas |
| `lib/core/api/api_client.dart` | CRIAR | ~55 linhas |
| `lib/models/login_response.dart` | CRIAR | ~40 linhas |
| `lib/services/auth_service.dart` | CRIAR | ~55 linhas |
| `lib/providers/auth_provider.dart` | CRIAR | ~75 linhas |
| `lib/main.dart` | EDITAR | +6 linhas |
| `lib/screens/splash_screen.dart` | EDITAR | ~15 linhas alteradas |
| `lib/screens/login_screen.dart` | EDITAR | ~20 linhas alteradas |
| `lib/screens/dashboard_screen.dart` | EDITAR | ~10 linhas alteradas |

**Total**: 6 ficheiros novos + 4 editados = **~310 linhas de código novo/alterado**

---

## 6. Checklist de Validação

- [ ] `flutter pub get` sem erros
- [ ] App compila e abre no emulador
- [ ] SplashScreen → verifica token → redireciona corretamente
- [ ] Login com credenciais válidas → navega para Dashboard
- [ ] Login com credenciais inválidas → SnackBar com mensagem de erro
- [ ] Token JWT persistido no `flutter_secure_storage`
- [ ] Fechar e reabrir app → auto-login (vai direto para Dashboard)
- [ ] Logout → limpa token → volta para Login
- [ ] Drawer mostra nome do artesão logado
- [ ] Design System intacto (cores, fontes, gradients, animações)
