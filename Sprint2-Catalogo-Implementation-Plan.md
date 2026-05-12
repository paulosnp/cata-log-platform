# Sprint 2 — Catalogo: Plano de Implementacao

> **Tech Lead**: Modulo Mobile do Artesao — Cata Log  
> **Stack**: Flutter 3.7+ · Dio · Provider  
> **Dependencia**: Sprint 1/1.1 concluidas (Auth + ApiClient + JWT Interceptor)

---

## 1. Contratos da API (Source of Truth)

### 1.1 `GET /api/v1/produtos/meus` (ARTESAO)

**Headers**: `Authorization: Bearer <token>` (injetado automaticamente pelo ApiClient)

**Query Params** (paginacao Spring Boot):
| Param | Tipo | Default | Descricao |
|---|---|---|---|
| `page` | int | 0 | Pagina (0-indexed) |
| `size` | int | 20 | Itens por pagina |

**Response 200** (`Page<ProdutoResponse>`):
```json
{
  "content": [
    {
      "id": 1,
      "nome": "Vaso Marajoara Pintado a Mao",
      "descricao": "Replica artesanal...",
      "preco": 89.90,
      "precoComDesconto": null,
      "percentualDesconto": 0,
      "emPromocao": false,
      "pecaUnica": false,
      "vendido": false,
      "ativo": true,
      "material": "Barro e tinta natural",
      "pesoGramas": 500,
      "comprimentoCm": 15,
      "larguraCm": 15,
      "alturaCm": 20,
      "tempoProducaoDias": 7,
      "categoriaNome": "Ceramica e Barro",
      "categoriaId": 1,
      "artesaoNomeAtelie": "Atelie Maos de Barro",
      "artesaoId": 3,
      "artesaoSeloVerificado": true,
      "notaMedia": 0,
      "totalAvaliacoes": 0,
      "imagensUrls": [],
      "criadoEm": "2026-05-12T15:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "number": 0
}
```

---

### 1.2 `POST /api/v1/produtos` (ARTESAO)

**Request Body** (`ProdutoRequest`):
```json
{
  "nome": "Tigela Rustica",
  "descricao": "Tigela feita a mao...",
  "preco": 65.00,
  "categoriaId": 1,
  "pecaUnica": true,
  "material": "Ceramica esmaltada",
  "pesoGramas": 350,
  "comprimentoCm": 18,
  "larguraCm": 18,
  "alturaCm": 10,
  "tempoProducaoDias": 5
}
```

| Campo | Tipo | Obrigatorio | Validacao |
|---|---|---|---|
| `nome` | String | Sim | `@NotBlank` |
| `descricao` | String | Nao | — |
| `preco` | BigDecimal | Sim | `@NotNull @Positive` |
| `categoriaId` | Long | Sim | `@NotNull` |
| `pecaUnica` | Boolean | Nao | Default false |
| `material` | String | Nao | — |
| `pesoGramas` | Integer | Nao | — |
| `comprimentoCm` | Integer | Nao | — |
| `larguraCm` | Integer | Nao | — |
| `alturaCm` | Integer | Nao | — |
| `tempoProducaoDias` | Integer | Nao | — |

**Response 201**: `ProdutoResponse` (mesmo schema da listagem)

---

### 1.3 `PATCH /api/v1/produtos/{id}/vendido` (ARTESAO)

**Response 200**: `ProdutoResponse` com `vendido: true`

---

### 1.4 `DELETE /api/v1/produtos/{id}` (ARTESAO)

**Response 200**: `{ "mensagem": "Produto desativado com sucesso." }`

---

### 1.5 `GET /api/v1/categorias` (PUBLICA)

**Response 200**: `List<CategoriaResponse>`
```json
[
  { "id": 1, "nome": "Ceramica e Barro", "descricao": "...", "ativo": true },
  { "id": 2, "nome": "Cestaria e Fibras", "descricao": "...", "ativo": true }
]
```

---

## 2. Arquitetura de Ficheiros

```
lib/
├── models/
│   ├── login_response.dart           # Existente (Sprint 1)
│   ├── produto_response.dart         # NOVO — DTO ProdutoResponse
│   └── categoria_response.dart       # NOVO — DTO CategoriaResponse
├── services/
│   ├── auth_service.dart             # Existente (Sprint 1)
│   ├── produto_service.dart          # NOVO — CRUD de produtos
│   └── categoria_service.dart        # NOVO — Listagem de categorias
├── providers/
│   ├── auth_provider.dart            # Existente (Sprint 1)
│   └── produto_provider.dart         # NOVO — Estado dos produtos
├── screens/
│   ├── tabs/
│   │   └── vitrine_tab.dart          # EDITAR — Consumer<ProdutoProvider>
│   └── nova_obra_screen.dart         # EDITAR — Categorias reais + API
├── data/
│   └── mock_data.dart                # EDITAR — Remover Produto + mockProdutos
└── main.dart                         # EDITAR — Registrar ProdutoProvider
```

---

## 3. Ordem de Execucao (8 Steps)

### Step 1 — Modelo ProdutoResponse (`lib/models/produto_response.dart`)

**Acao**: Criar classe com todos os campos do DTO do backend.

```dart
class ProdutoResponse {
  final int id;
  final String nome;
  final String? descricao;
  final double preco;
  final double? precoComDesconto;
  final int? percentualDesconto;
  final bool emPromocao;
  final bool pecaUnica;
  final bool vendido;
  final bool ativo;
  final String? material;
  final int? pesoGramas;
  final int? comprimentoCm;
  final int? larguraCm;
  final int? alturaCm;
  final int? tempoProducaoDias;
  final String? categoriaNome;
  final int? categoriaId;
  final String? artesaoNomeAtelie;
  final int? artesaoId;
  final bool? artesaoSeloVerificado;
  final double? notaMedia;
  final int? totalAvaliacoes;
  final List<String> imagensUrls;
  final String? criadoEm;

  factory ProdutoResponse.fromJson(Map<String, dynamic> json) { ... }
}
```

**Nota**: `preco` e `precoComDesconto` vem como `BigDecimal` do Java — no JSON sao numeros normais.

---

### Step 2 — Modelo CategoriaResponse (`lib/models/categoria_response.dart`)

**Acao**: Criar classe simples:

```dart
class CategoriaResponse {
  final int id;
  final String nome;
  final String? descricao;
  final bool ativo;

  factory CategoriaResponse.fromJson(Map<String, dynamic> json) { ... }
}
```

---

### Step 3 — ProdutoService (`lib/services/produto_service.dart`)

**Acao**: Criar service stateless usando `ApiClient().dio`.

| Metodo | HTTP | Rota | Retorno |
|---|---|---|---|
| `getMeusProdutos({page, size})` | GET | `/produtos/meus?page=X&size=Y` | `List<ProdutoResponse>` |
| `criarProduto(Map<String, dynamic>)` | POST | `/produtos` | `ProdutoResponse` |
| `marcarVendido(int id)` | PATCH | `/produtos/{id}/vendido` | `ProdutoResponse` |
| `deletarProduto(int id)` | DELETE | `/produtos/{id}` | `void` |

**Tratamento de erro**: Reutilizar padrao do `AuthService` (DioException → mensagens PT-BR).

---

### Step 4 — CategoriaService (`lib/services/categoria_service.dart`)

**Acao**: Criar service simples.

| Metodo | HTTP | Rota | Retorno |
|---|---|---|---|
| `listarAtivas()` | GET | `/categorias` | `List<CategoriaResponse>` |

---

### Step 5 — ProdutoProvider (`lib/providers/produto_provider.dart`)

**Estado**:
| Campo | Tipo | Default |
|---|---|---|
| `_produtos` | `List<ProdutoResponse>` | `[]` |
| `_categorias` | `List<CategoriaResponse>` | `[]` |
| `_isLoading` | `bool` | `false` |
| `_errorMessage` | `String?` | `null` |

**Metodos**:
| Metodo | Acao |
|---|---|
| `carregarMeusProdutos()` | GET /produtos/meus → atualiza `_produtos` |
| `carregarCategorias()` | GET /categorias → atualiza `_categorias` |
| `adicionarProduto(Map)` | POST /produtos → sucesso: recarrega lista |
| `marcarVendido(int id)` | PATCH /produtos/{id}/vendido → atualiza item na lista |
| `deletarProduto(int id)` | DELETE /produtos/{id} → remove item da lista |

**Getters**:
- `List<ProdutoResponse> get produtos`
- `List<CategoriaResponse> get categorias`
- `int get totalAtivos` → filtro `ativo && !vendido`
- `int get totalPecasUnicas` → filtro `pecaUnica`
- `int get totalVendidos` → filtro `vendido`

---

### Step 6 — main.dart (Registrar ProdutoProvider)

**Acao**: Adicionar ao `MultiProvider`:

```dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => AuthProvider()),
    ChangeNotifierProvider(create: (_) => ProdutoProvider()),  // NOVO
  ],
  child: MaterialApp(...)
)
```

---

### Step 7 — Refatorar vitrine_tab.dart

**Remover**:
- `import '../../data/mock_data.dart'`
- Todas as referencias a `mockProdutos` e classe `Produto` (mock)

**Adicionar**:
- `import 'package:provider/provider.dart'`
- `import '../../providers/produto_provider.dart'`
- `import '../../models/produto_response.dart'`

**Mudancas de logica**:
1. No `initState()` → chamar `produtoProvider.carregarMeusProdutos()`
2. Stats chips → usar `produtoProvider.totalAtivos`, `.totalPecasUnicas`, `.totalVendidos`
3. Lista de cards → `Consumer<ProdutoProvider>` com estados:
   - `isLoading` → `CircularProgressIndicator` centrado
   - `produtos.isEmpty` → Empty state ("Ainda nao adicionaste nenhuma obra")
   - `produtos` → `SliverList` com `_ProdutoCard` (mesmo visual)
4. `_ProdutoCard` → trocar `produto.titulo` por `produto.nome`, `produto.imagemUrl` por `produto.imagensUrls.first` (com fallback)
5. `_handleMenuAction('vender')` → chamar `produtoProvider.marcarVendido(produto.id)`

**Mapeamento de campos Mock → API**:
| Mock (antigo) | API (novo) |
|---|---|
| `produto.id` (String) | `produto.id` (int) |
| `produto.titulo` | `produto.nome` |
| `produto.preco` (double) | `produto.preco` (double) |
| `produto.imagemUrl` (String) | `produto.imagensUrls` (List — usar `.firstOrNull`) |
| `produto.ativo` (bool) | `produto.ativo` (bool) |
| `produto.pecaUnica` (bool) | `produto.pecaUnica` (bool) |
| `produto.vendido` (bool) | `produto.vendido` (bool) |

---

### Step 8 — Refatorar nova_obra_screen.dart

**Remover**:
- `import '../data/mock_data.dart'`
- `mockProdutos.insert(0, novoProduto)` (logica mock)
- Lista hardcoded `_categorias`

**Adicionar**:
- `import 'package:provider/provider.dart'`
- `import '../providers/produto_provider.dart'`

**Mudancas de logica**:
1. No `initState()` → carregar categorias reais: `produtoProvider.carregarCategorias()`
2. Substituir `_categorias` (hardcoded) por `Consumer<ProdutoProvider>` que le `provider.categorias`
3. `_categoriaSelecionada` muda de `String` para `int?` (o `categoriaId`)
4. `_submitNovoProduto()`:
   - Coleta dados do formulario
   - Monta o `Map<String, dynamic>` com campos do `ProdutoRequest`
   - Chama `produtoProvider.adicionarProduto(dados)`
   - Sucesso → `Navigator.pop(true)` + SnackBar
   - Erro → SnackBar vermelho

**Campos do formulario vs ProdutoRequest**:
| Campo UI atual | Campo API | Acao |
|---|---|---|
| Nome da Obra (`_tituloController`) | `nome` | Renomear internamente |
| Categoria (chips) | `categoriaId` | Trocar de String para ID numerico |
| Preco (`_precoController`) | `preco` | Converter para double |
| Descricao (`_descricaoController`) | `descricao` | Direto |
| Peca Unica (Switch) | `pecaUnica` | Direto |
| Upload de fotos | — | Manter placeholder (Sprint futura) |
| Material | `material` | Campo NAO existe na UI → adicionar (opcional) |
| Dimensoes/Peso | `pesoGramas`, `alturaCm`, etc. | NAO adicionar agora — campos opcionais |

---

## 4. Diagrama de Fluxo

```
┌───────────────────────────┐
│      DashboardScreen       │
│  Tab 0: VitrineTab         │
└──────────┬────────────────┘
           │
    carregarMeusProdutos()
           │
    GET /produtos/meus
           │
    ┌──────▼──────┐
    │  Loading?   │
    └──────┬──────┘
     Sim   │    Nao
    ┌──────▼──┐ ┌──▼────────┐
    │Spinner  │ │ Lista=0?  │
    └─────────┘ └──────┬────┘
              Sim │       Nao
         ┌────────▼──┐ ┌──▼──────────┐
         │Empty State│ │ ProdutoCards │
         └───────────┘ │ (API data)  │
                       └──────┬──────┘
                              │
              ┌───────────────┼────────────┐
              │               │            │
       "Marcar Vendido"  "Editar"    FAB "+"
              │                        │
    PATCH /{id}/vendido        NovaObraScreen
              │                        │
         Atualiza lista         POST /produtos
                                       │
                                Navigator.pop
                                + recarrega lista
```

---

## 5. Ficheiros Tocados (Resumo)

| Ficheiro | Acao | Linhas Estimadas |
|---|---|---|
| `lib/models/produto_response.dart` | CRIAR | ~60 linhas |
| `lib/models/categoria_response.dart` | CRIAR | ~25 linhas |
| `lib/services/produto_service.dart` | CRIAR | ~70 linhas |
| `lib/services/categoria_service.dart` | CRIAR | ~25 linhas |
| `lib/providers/produto_provider.dart` | CRIAR | ~90 linhas |
| `lib/main.dart` | EDITAR | +3 linhas |
| `lib/screens/tabs/vitrine_tab.dart` | EDITAR | ~80 linhas alteradas |
| `lib/screens/nova_obra_screen.dart` | EDITAR | ~50 linhas alteradas |
| `lib/data/mock_data.dart` | EDITAR | Remover classe Produto + mockProdutos |

**Total**: 5 ficheiros novos + 4 editados = **~400 linhas de codigo novo/alterado**

---

## 6. Decisoes de Design

1. **Paginacao**: Na v1 mobile, carregamos todos os produtos com `size=100`. Scroll infinito fica para uma iteracao futura.
2. **Imagens**: O upload de imagens (multipart) NAO sera implementado nesta sprint. O placeholder "Adicionar fotos" fica funcional mas com SnackBar informativo.
3. **Categorias**: Carregadas da API real (`GET /categorias`) em vez de lista hardcoded.
4. **Material**: Campo opcional adicionado ao formulario para alinhar com o backend.
5. **Dimensoes/Peso**: NAO adicionados ao formulario (campos opcionais do backend, podem ser adicionados numa sprint futura para nao sobrecarregar a UI).

---

## 7. Checklist de Validacao

- [ ] `flutter analyze` sem erros
- [ ] App compila e abre
- [ ] Login → Dashboard → VitrineTab carrega produtos da API
- [ ] VitrineTab com 0 produtos → mostra empty state
- [ ] Stats chips (Ativos, Pecas Unicas, Vendidos) refletem dados reais
- [ ] FAB "+" → NovaObraScreen → categorias carregadas da API
- [ ] Preencher formulario → "Publicar" → POST /produtos → sucesso
- [ ] Apos criar produto → lista atualiza automaticamente
- [ ] "Marcar como Vendida" → PATCH funciona → badge muda para "VENDIDA"
- [ ] Design System intacto (cores, fontes, gradients)
- [ ] mock_data.dart nao e mais usado pela Vitrine/NovaObra
