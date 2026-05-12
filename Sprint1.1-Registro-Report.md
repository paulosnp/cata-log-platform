# Sprint 1.1 — Registro do Artesao: Relatorio de Conclusao

> **Modulo**: Mobile do Artesao — Cata Log  
> **Data**: 12/05/2026  
> **Status**: Concluida — pronta para teste

---

## 1. Objetivo

Implementar o fluxo de auto-registro do artesao no app mobile, permitindo que novos artesaos criem conta diretamente pelo app sem necessidade de intervencao do admin.

**Endpoint**: `POST /api/v1/auth/artesao/registrar`

---

## 2. Contrato da API

**Request Body** (`ArtesaoRegistroRequest`):
```json
{
  "nomeAtelie": "Atelie Maos de Barro",
  "email": "artesao@email.com",
  "senha": "MinhaSenh@123",
  "cep": "50010000",
  "telefoneWhatsapp": "81999990000"
}
```

| Campo | Tipo | Obrigatorio | Validacao |
|---|---|---|---|
| `nomeAtelie` | String | Sim | `@NotBlank` |
| `email` | String | Sim | `@NotBlank @Email` |
| `senha` | String | Sim | `@NotBlank @Size(min=6)` |
| `cep` | String | Sim | `@NotBlank` |
| `telefoneWhatsapp` | String | Nao | — |

**Response 201**: `{ "mensagem": "Artesao cadastrado com sucesso." }`

---

## 3. Entregas

### 3.1 Ficheiros Editados (3)

| Ficheiro | Mudanca |
|---|---|
| `lib/services/auth_service.dart` | +metodo `registrar()` — `POST /auth/artesao/registrar` com todos os campos do DTO. Tratamento de erro 409 (email duplicado) |
| `lib/providers/auth_provider.dart` | +metodo `registrar()` com estados `isLoading`, `errorMessage`, `successMessage`. Retorna `bool` para a UI decidir o fluxo |
| `lib/screens/login_screen.dart` | +import `RegistroScreen`. Link "Cadastre-se aqui" agora navega para a tela de registro |

### 3.2 Ficheiros Criados (1)

| Ficheiro | Descricao |
|---|---|
| `lib/screens/registro_screen.dart` | Tela de registro completa com formulario de 6 campos, validacao local, animacoes fade/slide e estilo identico ao login |

### 3.3 Seed de Teste

| Ficheiro | Descricao |
|---|---|
| `V21__seed_artesao_mobile.sql` | Artesao de teste para o mobile (`artesao.mobile@catalog.com` / `Teste@123`) com 2 produtos vinculados. Adicionado ao `.gitignore` |

---

## 4. Tela de Registro — Campos

| Campo | Icone | Tipo Input | Validacao |
|---|---|---|---|
| Nome do Atelie | `store_outlined` | Texto | Obrigatorio |
| E-mail | `email_outlined` | Email | Obrigatorio + formato valido |
| Senha | `lock_outline` | Password (toggle visibilidade) | Obrigatorio + min 6 chars |
| Confirmar Senha | `lock_outline` | Password (toggle visibilidade) | Deve coincidir com senha |
| CEP | `location_on_outlined` | Numerico (max 8 digitos) | Obrigatorio + 8 digitos |
| WhatsApp | `phone_outlined` | Phone | Opcional |

---

## 5. Fluxo do Usuario

```
LoginScreen
    |
    v
"Cadastre-se aqui" (GestureDetector)
    |
    v
RegistroScreen (push)
    |
    v
Preenche formulario → "Criar Conta"
    |
    v
POST /auth/artesao/registrar
    |
    ├── 201 → SnackBar verde "Cadastro realizado com sucesso!"
    |         → Navigator.pop() → volta ao LoginScreen
    |
    ├── 409 → SnackBar vermelho "Este e-mail ja esta cadastrado."
    |
    ├── 400 → SnackBar vermelho "Preencha todos os campos corretamente."
    |
    └── Sem rede → SnackBar vermelho "Sem conexao com a internet."
```

---

## 6. Validacao Tecnica

| Check | Resultado |
|---|---|
| `flutter analyze` | No issues found! |
| Design System | Mesmas cores, fontes, gradients e animacoes do login |
| Navegacao | Login → Registro → Login (ida e volta funcional) |
| Tratamento de erros | 400, 409, timeout, sem rede — todos cobertos |

---

## 7. Como Testar

### Cenarios

| # | Cenario | Acao | Resultado Esperado |
|---|---|---|---|
| 1 | Registro valido | Preencher todos os campos e submeter | SnackBar verde + volta ao login |
| 2 | Email duplicado | Usar email ja existente | SnackBar: "Este e-mail ja esta cadastrado." |
| 3 | Senha curta | Senha com menos de 6 chars | Validacao local impede submit |
| 4 | Senhas diferentes | Confirmar senha diferente | Validacao local: "As senhas nao coincidem" |
| 5 | CEP invalido | CEP com menos de 8 digitos | Validacao local: "CEP invalido" |
| 6 | Registrar e logar | Criar conta → voltar → logar | Login funciona com as novas credenciais |
| 7 | "Ja tem conta" | Clicar "Faca login" | Navigator.pop() → volta ao login |

---

## 8. Proximos Passos

- Sprint 2: Catalogo (CRUD de produtos via API)
- Pendente: Tela "Esqueci a senha" (3 passos: email → PIN → nova senha)
- Pendente: Troca obrigatoria de senha temporaria (`senhaTemporaria: true`)
