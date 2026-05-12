# Sprint 1 — Auth: Relatório de Conclusão

> **Módulo**: Mobile do Artesão — Cata Log  
> **Data**: 12/05/2026  
> **Status**: ✅ Concluída — pronta para teste no emulador

---

## 1. Objetivo da Sprint

Substituir o fluxo de login simulado (mock data com `Future.delayed`) por autenticação real contra a API Spring Boot, com persistência segura de sessão JWT e gestão de estado via Provider.

---

## 2. Entregas Realizadas

### 2.1 Infraestrutura Criada (6 ficheiros novos)

| Ficheiro | Camada | Responsabilidade |
|---|---|---|
| `lib/core/storage/secure_storage.dart` | Core | Wrapper centralizado do `flutter_secure_storage`. Guarda JWT e dados do user em armazenamento encriptado (Keychain/iOS, EncryptedSharedPreferences/Android) |
| `lib/core/api/api_client.dart` | Core | Singleton do `Dio` com `baseUrl` apontando para `http://10.0.2.2:8080/api/v1`. Interceptor automático que injeta `Authorization: Bearer <token>` em todas as requests e limpa a sessão em caso de 401 |
| `lib/models/login_response.dart` | Model | DTO espelhando o `LoginResponse` do backend: `id`, `token`, `role`, `nome`, `senhaTemporaria`. Inclui `fromJson()`, `toJson()` e serialização para string (persistência) |
| `lib/services/auth_service.dart` | Service | Chamada `POST /auth/artesao/login` via Dio. Persiste token + user data no storage. Tratamento de erros traduzido para PT-BR (401 → "E-mail ou senha incorretos", 403 → "Conta bloqueada", timeout → "Servidor indisponível") |
| `lib/providers/auth_provider.dart` | State | `ChangeNotifier` com estados `isLoading`, `errorMessage`, `isAuthenticated`, `user`. Métodos: `login()`, `checkAuthStatus()` (auto-login), `logout()`, `clearError()` |
| `Sprint1-Auth-Implementation-Plan.md` | Doc | Plano de implementação detalhado com 9 steps, contrato da API e checklist |

### 2.2 Ficheiros Refatorados (4 ficheiros editados)

| Ficheiro | O que mudou |
|---|---|
| `pubspec.yaml` | +3 dependências: `dio: ^5.7.0`, `flutter_secure_storage: ^9.2.4`, `provider: ^6.1.2` |
| `lib/main.dart` | `MaterialApp` agora está dentro de `MultiProvider` com `AuthProvider` registado. Nenhuma propriedade visual alterada |
| `lib/screens/splash_screen.dart` | Em vez de `Future.delayed(2s) → LoginScreen`, agora chama `authProvider.checkAuthStatus()`. Se existir token → `DashboardScreen`. Se não → `LoginScreen`. Animações de fade/scale preservadas |
| `lib/screens/login_screen.dart` | `_handleLogin()` agora chama `authProvider.login(email, senha)` em vez de `Future.delayed(1s)`. Botão "Entrar" usa `Consumer<AuthProvider>` para mostrar `CircularProgressIndicator` durante loading. Erros aparecem num `SnackBar` estilizado com ícone de erro. Adicionado submit via tecla Enter no campo de senha |
| `lib/screens/dashboard_screen.dart` | Drawer: nome/email hardcoded substituído por `Consumer<AuthProvider>` que exibe `user.nome` e `user.role` dinâmicos. Logout: agora chama `authProvider.logout()` (limpa storage) antes de navegar |

---

## 3. Arquitetura Implementada

```
┌─────────────────────────────────────────────────┐
│                    main.dart                     │
│           MultiProvider(AuthProvider)             │
└─────────────────┬───────────────────────────────┘
                  │
    ┌─────────────▼─────────────┐
    │       SplashScreen         │
    │   checkAuthStatus()        │
    └──────┬──────────┬─────────┘
     Token │          │ Sem Token
    ┌──────▼───┐  ┌───▼──────────┐
    │Dashboard │  │ LoginScreen   │
    │ (Drawer  │  │ → login()    │
    │  dinâmico│  │ → SnackBar   │
    │  logout) │  │ → Dashboard  │
    └──────────┘  └──────────────┘
```

### Fluxo de Dados

```
LoginScreen → AuthProvider.login()
                   │
            AuthService.login()
                   │
         Dio POST /auth/artesao/login
                   │
         LoginResponse.fromJson()
                   │
      SecureStorage.saveToken() + saveUserData()
                   │
         AuthProvider._user = loginResponse
                   │
         notifyListeners() → UI reage
```

---

## 4. Validação Técnica

| Check | Resultado |
|---|---|
| `flutter pub get` | ✅ Got dependencies! |
| `flutter analyze` | ✅ No issues found! |
| Design System intacto | ✅ Nenhuma cor, fonte, gradient ou animação alterada |
| Mock data eliminado | ⚠️ Parcial — `mock_data.dart` ainda usado pela Vitrine, Encomendas e Chat (Sprint 2-4) |

---

## 5. O que NÃO foi alterado (intencionalmente)

- **`mock_data.dart`** — Continua a ser usado por `vitrine_tab.dart`, `encomendas_tab.dart`, `chat_screen.dart` e `nova_obra_screen.dart`. Será eliminado progressivamente nas Sprints 2-4
- **"Esqueci a minha senha"** — Botão existe na UI mas sem ação. A implementação da tela de recuperação fica para uma sprint futura
- **"Continuar com Google"** — Sem ação (OAuth não está no escopo)
- **"Cadastre-se aqui"** — Sem ação (registro de artesão é feito pelo admin no backend)

---

## 6. Como Testar

### Pré-requisitos
1. API rodando: `docker compose up -d` (na raiz do projeto)
2. Emulador Android aberto ou dispositivo físico conectado

### Passos
```bash
cd cata-log-platform-mobile
flutter run
```

### Cenários de Teste

| # | Cenário | Ação | Resultado Esperado |
|---|---|---|---|
| 1 | Login válido | Email + senha de um artesão seed | Navega para Dashboard, drawer mostra nome do artesão |
| 2 | Login inválido | Email errado ou senha errada | SnackBar vermelho: "E-mail ou senha incorretos." |
| 3 | Campos vazios | Clicar "Entrar" sem preencher | SnackBar: "Preencha o e-mail e a senha." |
| 4 | Auto-login | Fechar e reabrir o app após login | Splash → Dashboard (sem passar pelo login) |
| 5 | Logout | Drawer → "Sair" | Limpa sessão, volta para LoginScreen |
| 6 | API offline | Desligar o Docker e tentar login | SnackBar: "Sem conexão com a internet." |

### Credenciais de Teste (seed data)
> Verificar os artesãos criados na migration `V18__seed_test_data.sql` do backend.

---

## 7. Próxima Sprint

**Sprint 2 — Catálogo (Meus Produtos)**: Ligar a `VitrineTab` ao `GET /produtos/meus`, implementar criação/edição de produtos via `POST/PUT /produtos`, upload de imagens e eliminação do `mockProdutos`.
