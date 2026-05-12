# Sprint 3 — Encomendas: Plano de Implementacao

> **Tech Lead**: Modulo Mobile do Artesao — Cata Log  
> **Stack**: Flutter 3.7+ · Dio · Provider  
> **Dependencia**: Sprints 1/1.1/2/2.1 concluidas (Auth + Catalogo + Login Redesign)

---

## 1. Contratos da API (Source of Truth)

### 1.1 `GET /api/v1/encomendas/artesao` (ARTESAO)

**Headers**: `Authorization: Bearer <token>` (injetado automaticamente)

**Query Params** (paginacao Spring Boot):
| Param | Tipo | Default |
|---|---|---|
| `page` | int | 0 |
| `size` | int | 20 |

**Response 200** (`Page<EncomendaResponse>`):
```json
{
  "content": [
    {
      "id": 1,
      "status": "AGUARDANDO_ARTESAO",
      "observacoesCliente": "Quero um vaso com tons terrosos, 30cm",
      "precoProposto": null,
      "tempoProducaoDias": null,
      "streamChannelId": "encomenda-1",
      "compradorId": 5,
      "nomeComprador": "Ana Beatriz",
      "artesaoId": 3,
      "nomeArtesao": "Atelie Maos de Barro",
      "produtoReferenciaId": 1,
      "nomeProdutoReferencia": "Vaso Marajoara Pintado a Mao",
      "criadoEm": "2026-05-10T14:30:00",
      "atualizadoEm": "2026-05-10T14:30:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0
}
```

---

### 1.2 Enum `StatusEncomenda` (Maquina de Estados)

```
AGUARDANDO_ARTESAO → AGUARDANDO_COMPRADOR → PRECO_ACORDADO
                                          ↘ CANCELADO_ESTORNO_TOTAL
                                          ↘ CANCELADO_COM_TAXA
```

| Status | Label PT-BR | Cor | Contexto |
|---|---|---|---|
| `AGUARDANDO_ARTESAO` | Aguardando | `statusAguardando` (amarelo) | Artesao precisa enviar contraproposta |
| `AGUARDANDO_COMPRADOR` | Proposta Enviada | `statusOrcamentoEnviado` (verde) | Comprador precisa aceitar |
| `PRECO_ACORDADO` | Acordo Firmado | `primary` (vermelho) | Preco aceito, producao pode comecar |
| `CANCELADO_ESTORNO_TOTAL` | Cancelada | `outlineVariant` (cinza) | Cancelamento sem taxa |
| `CANCELADO_COM_TAXA` | Cancelada (taxa) | `error` (vermelho escuro) | Cancelamento com taxa |

---

### 1.3 `PUT /api/v1/encomendas/{id}/contraproposta` (ARTESAO)

**Request Body** (`ContrapropostaRequest`):
```json
{
  "precoProposto": 340.00,
  "tempoProducaoDias": 15
}
```

| Campo | Tipo | Obrigatorio | Validacao |
|---|---|---|---|
| `precoProposto` | BigDecimal | Sim | `@NotNull @Min(1)` |
| `tempoProducaoDias` | Integer | Sim | `@NotNull @Min(1)` |

**Response 200**: `EncomendaResponse` (com status atualizado para `AGUARDANDO_COMPRADOR`)

---

## 2. Arquitetura de Ficheiros

```
lib/
├── models/
│   ├── login_response.dart             # Sprint 1
│   ├── produto_response.dart           # Sprint 2
│   ├── categoria_response.dart         # Sprint 2
│   └── encomenda_response.dart         # NOVO — DTO EncomendaResponse
├── services/
│   ├── auth_service.dart               # Sprint 1
│   ├── produto_service.dart            # Sprint 2
│   ├── categoria_service.dart          # Sprint 2
│   └── encomenda_service.dart          # NOVO — GET artesao + PUT contraproposta
├── providers/
│   ├── auth_provider.dart              # Sprint 1
│   ├── produto_provider.dart           # Sprint 2
│   └── encomenda_provider.dart         # NOVO — Estado das encomendas
├── screens/
│   ├── tabs/
│   │   └── encomendas_tab.dart         # EDITAR — Consumer<EncomendaProvider>
│   ├── orcamento_screen.dart           # EDITAR — PUT /contraproposta via provider
│   └── chat_screen.dart                # EDITAR — Receber EncomendaResponse em vez de Encomenda mock
├── data/
│   └── mock_data.dart                  # EDITAR — Remover Encomenda + mockEncomendas
└── main.dart                           # EDITAR — Registrar EncomendaProvider
```

---

## 3. Ordem de Execucao (7 Steps)

### Step 1 — Modelo EncomendaResponse (`lib/models/encomenda_response.dart`)

**Acao**: Criar classe com todos os campos do DTO do backend.

```dart
class EncomendaResponse {
  final int id;
  final String status;
  final String? observacoesCliente;
  final double? precoProposto;
  final int? tempoProducaoDias;
  final String? streamChannelId;
  final int? compradorId;
  final String? nomeComprador;
  final int? artesaoId;
  final String? nomeArtesao;
  final int? produtoReferenciaId;
  final String? nomeProdutoReferencia;
  final String? criadoEm;
  final String? atualizadoEm;

  factory EncomendaResponse.fromJson(Map<String, dynamic> json) { ... }
}
```

---

### Step 2 — EncomendaService (`lib/services/encomenda_service.dart`)

| Metodo | HTTP | Rota | Retorno |
|---|---|---|---|
| `getEncomendasArtesao({page, size})` | GET | `/encomendas/artesao` | `List<EncomendaResponse>` |
| `enviarContraproposta(int id, double preco, int dias)` | PUT | `/encomendas/{id}/contraproposta` | `EncomendaResponse` |

---

### Step 3 — EncomendaProvider (`lib/providers/encomenda_provider.dart`)

**Estado**:
| Campo | Tipo | Default |
|---|---|---|
| `_encomendas` | `List<EncomendaResponse>` | `[]` |
| `_isLoading` | `bool` | `false` |
| `_errorMessage` | `String?` | `null` |

**Metodos**:
| Metodo | Acao |
|---|---|
| `carregarEncomendas()` | GET /encomendas/artesao → atualiza lista |
| `responderOrcamento(int id, double preco, int dias)` | PUT contraproposta → recarrega lista |

**Getters**:
- `int get totalAguardando` → filtro `AGUARDANDO_ARTESAO`
- `int get totalEnviadas` → filtro `AGUARDANDO_COMPRADOR`

---

### Step 4 — main.dart (Registrar EncomendaProvider)

**Acao**: Adicionar ao `MultiProvider`:

```dart
ChangeNotifierProvider(create: (_) => EncomendaProvider()),
```

---

### Step 5 — Refatorar encomendas_tab.dart

**Remover**:
- `import '../../data/mock_data.dart'`
- Todas as referencias a `mockEncomendas` e classe `Encomenda`

**Adicionar**:
- `import 'package:provider/provider.dart'`
- `import '../../providers/encomenda_provider.dart'`
- `import '../../models/encomenda_response.dart'`

**Mudancas de logica**:
1. `initState()` → chamar `encomendaProvider.carregarEncomendas()`
2. Lista de cards → `Consumer<EncomendaProvider>` com loading/empty/error states
3. `_StatusBadge` → mapear TODOS os 5 status do enum (nao so 2)
4. Cards → trocar `encomenda.nomeCliente` por `encomenda.nomeComprador`
5. Cards → trocar `encomenda.pecaReferencia` por `encomenda.nomeProdutoReferencia ?? encomenda.observacoesCliente`
6. Cards → trocar `encomenda.prazoDias` por `encomenda.tempoProducaoDias`
7. `_handleEncomendaTap` → passar `EncomendaResponse` em vez de `Encomenda`

**Mapeamento Mock → API**:
| Mock (antigo) | API (novo) |
|---|---|
| `encomenda.id` (String) | `encomenda.id` (int) |
| `encomenda.nomeCliente` | `encomenda.nomeComprador` |
| `encomenda.pecaReferencia` | `encomenda.nomeProdutoReferencia` / `observacoesCliente` |
| `encomenda.status` (`ORCAMENTO_ENVIADO`) | `encomenda.status` (`AGUARDANDO_COMPRADOR`) |
| `encomenda.precoProposto` | `encomenda.precoProposto` |
| `encomenda.prazoDias` | `encomenda.tempoProducaoDias` |

---

### Step 6 — Refatorar orcamento_screen.dart

**Remover**:
- `import '../data/mock_data.dart'`
- Mutacao direta do objeto mock (`widget.encomenda.status = ...`)
- `Future.delayed` simulado

**Adicionar**:
- `import 'package:provider/provider.dart'`
- `import '../providers/encomenda_provider.dart'`
- `import '../models/encomenda_response.dart'`

**Mudancas de logica**:
1. Tipo do campo `encomenda` muda de `Encomenda` para `EncomendaResponse`
2. `_submitOrcamento()`:
   - Coleta preco e prazo dos controllers
   - Chama `encomendaProvider.responderOrcamento(id, preco, dias)`
   - Sucesso → `Navigator.pop(true)` + SnackBar verde
   - Erro → SnackBar vermelho
3. Card de info → trocar `nomeCliente` por `nomeComprador`
4. Card de info → trocar `pecaReferencia` por `nomeProdutoReferencia ?? observacoesCliente`
5. Remover campo "Observacoes" (nao faz parte do `ContrapropostaRequest`)

---

### Step 7 — Refatorar chat_screen.dart + Limpar mock_data.dart

**chat_screen.dart**:
- Tipo `Encomenda` → `EncomendaResponse`
- Trocar `encomenda.nomeCliente` → `encomenda.nomeComprador`
- Manter mensagens mockadas (chat real e Sprint futura com Stream)

**mock_data.dart**:
- Remover classe `Encomenda` e `mockEncomendas`
- Manter apenas `Mensagem` e `mockMensagens` (para o chat por enquanto)

---

## 4. Diagrama de Fluxo

```
┌───────────────────────────┐
│      DashboardScreen       │
│  Tab 1: EncomendasTab      │
└──────────┬────────────────┘
           │
    carregarEncomendas()
           │
    GET /encomendas/artesao
           │
    ┌──────▼──────┐
    │  Loading?   │
    └──────┬──────┘
     Sim   │    Nao
    ┌──────▼──┐ ┌──▼────────┐
    │Spinner  │ │ Lista=0?  │
    └─────────┘ └──────┬────┘
              Sim │       Nao
         ┌────────▼──┐ ┌──▼──────────────┐
         │Empty State│ │ EncomendaCards   │
         └───────────┘ │ (API data)      │
                       └──────┬──────────┘
                              │
              ┌───────────────┼──────────────┐
              │               │              │
     status=AGUARDANDO     status=outros
              │               │
     OrcamentoScreen      ChatScreen
              │
    Preenche preco + prazo
              │
    PUT /{id}/contraproposta
              │
         ┌────▼────┐
         │Sucesso? │
         └────┬────┘
        Sim   │    Nao
    ┌─────────▼──┐ ┌──▼─────────┐
    │pop + reload│ │SnackBar err│
    │→ ChatScreen│ └────────────┘
    └────────────┘
```

---

## 5. Ficheiros Tocados (Resumo)

| Ficheiro | Acao | Linhas Estimadas |
|---|---|---|
| `lib/models/encomenda_response.dart` | CRIAR | ~55 linhas |
| `lib/services/encomenda_service.dart` | CRIAR | ~65 linhas |
| `lib/providers/encomenda_provider.dart` | CRIAR | ~75 linhas |
| `lib/main.dart` | EDITAR | +2 linhas |
| `lib/screens/tabs/encomendas_tab.dart` | EDITAR | ~100 linhas alteradas |
| `lib/screens/orcamento_screen.dart` | EDITAR | ~50 linhas alteradas |
| `lib/screens/chat_screen.dart` | EDITAR | ~10 linhas alteradas |
| `lib/data/mock_data.dart` | EDITAR | Remover Encomenda + mockEncomendas |

**Total**: 3 ficheiros novos + 5 editados = **~360 linhas de codigo novo/alterado**

---

## 6. Decisoes de Design

1. **Chat**: O chat continuara a usar dados mockados nesta sprint. A integracao com Stream (ou WebSocket) sera feita numa sprint dedicada.
2. **Status Badges**: Expandidos de 2 estados (Aguardando/Enviado) para 5 estados reais do enum.
3. **Campo Observacoes**: Removido do `OrcamentoScreen` porque nao faz parte do `ContrapropostaRequest` (so tem `precoProposto` e `tempoProducaoDias`).
4. **Paginacao**: Carrega todos com `size=100` inicialmente. Scroll infinito fica para iteracao futura.

---

## 7. Checklist de Validacao

- [ ] `flutter analyze` sem erros
- [ ] App compila e abre
- [ ] Login → Dashboard → EncomendasTab carrega encomendas da API
- [ ] EncomendasTab com 0 encomendas → mostra empty state
- [ ] Badges de status mostram cores corretas para todos os 5 estados
- [ ] Toque em encomenda AGUARDANDO_ARTESAO → abre OrcamentoScreen
- [ ] Preencher preco/prazo → "Enviar Orcamento" → PUT /contraproposta → sucesso
- [ ] Apos enviar → lista atualiza, status muda para AGUARDANDO_COMPRADOR
- [ ] Toque em encomenda com status diferente → abre ChatScreen
- [ ] Design System intacto
- [ ] mock_data.dart nao contem mais Encomenda/mockEncomendas
