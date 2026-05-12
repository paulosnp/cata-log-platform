# Sprint 2 — Catalogo (Meus Produtos): Relatorio de Conclusao

> **Modulo**: Mobile do Artesao — Cata Log  
> **Data**: 12/05/2026  
> **Status**: Concluida — pronta para teste

---

## 1. Objetivo

Substituir os dados mockados (mock_data.dart) na aba "Minha Vitrine" e na tela "Nova Obra" por chamadas reais a API Spring Boot, permitindo ao artesao listar, criar e marcar produtos como vendidos via endpoints REST autenticados.

---

## 2. Endpoints Integrados

| Metodo | Rota | Acao | Tela |
|---|---|---|---|
| GET | `/api/v1/produtos/meus` | Listar produtos do artesao | VitrineTab |
| POST | `/api/v1/produtos` | Criar novo produto | NovaObraScreen |
| PATCH | `/api/v1/produtos/{id}/vendido` | Marcar como vendido | VitrineTab (dialog) |
| DELETE | `/api/v1/produtos/{id}` | Desativar produto | (preparado, sem UI) |
| GET | `/api/v1/categorias` | Listar categorias ativas | NovaObraScreen |

---

## 3. Entregas

### 3.1 Ficheiros Criados (5)

| Ficheiro | Camada | Descricao |
|---|---|---|
| `lib/models/produto_response.dart` | Model | DTO com 27 campos espelhando ProdutoResponse do backend. Inclui `fromJson()` e getter `primeiraImagemUrl` |
| `lib/models/categoria_response.dart` | Model | DTO simples (id, nome, descricao, ativo) |
| `lib/services/produto_service.dart` | Service | `getMeusProdutos()`, `criarProduto()`, `marcarVendido()`, `deletarProduto()` com tratamento de erros PT-BR |
| `lib/services/categoria_service.dart` | Service | `listarAtivas()` — GET /categorias |
| `lib/providers/produto_provider.dart` | State | ChangeNotifier com listas de produtos/categorias, getters computados (totalAtivos, totalPecasUnicas, totalVendidos), CRUD completo |

### 3.2 Ficheiros Editados (4)

| Ficheiro | Mudanca |
|---|---|
| `lib/main.dart` | +`ProdutoProvider` no MultiProvider |
| `lib/screens/tabs/vitrine_tab.dart` | Removido import mock_data. Usa `Consumer<ProdutoProvider>`. Stats chips dinamicos. Loading spinner, empty state ("Nenhuma obra ainda") e error state com botao "Tentar novamente". Cards usam `produto.nome` e `produto.primeiraImagemUrl`. "Marcar como Vendida" chama API real |
| `lib/screens/nova_obra_screen.dart` | Removido import mock_data. Categorias carregadas da API via Consumer. `_categoriaSelecionada` mudou de String para int (categoriaId). Adicionado campo "Material". Submit chama `produtoProvider.adicionarProduto()` com dados reais. Validacao de preco melhorada |
| `lib/data/mock_data.dart` | Removida classe `Produto` e lista `mockProdutos` (ficaram apenas Encomenda/Mensagem para Sprint 3) |

---

## 4. Mapeamento Mock → API

| Campo Mock (antigo) | Campo API (novo) | Notas |
|---|---|---|
| `produto.id` (String) | `produto.id` (int) | Tipo alterado |
| `produto.titulo` | `produto.nome` | Renomeado |
| `produto.preco` (double) | `produto.preco` (double) | Mesmo tipo |
| `produto.imagemUrl` (String) | `produto.imagensUrls` (List) | Agora e lista, getter `primeiraImagemUrl` |
| `produto.ativo` | `produto.ativo` | Direto |
| `produto.pecaUnica` | `produto.pecaUnica` | Direto |
| `produto.vendido` | `produto.vendido` | Agora via PATCH API |
| — | `produto.categoriaNome` | Novo campo |
| — | `produto.material` | Novo campo + input na UI |

---

## 5. Estados da UI

### VitrineTab

| Estado | Comportamento |
|---|---|
| Loading | CircularProgressIndicator centrado |
| Vazio | Icone palette + "Nenhuma obra ainda" + instrucao |
| Erro | Icone wifi_off + mensagem de erro + botao "Tentar novamente" |
| Com dados | Lista de ProdutoCards com stats chips dinamicos |

### NovaObraScreen

| Estado | Comportamento |
|---|---|
| Categorias loading | Spinner inline + "Carregando categorias..." |
| Sem categoria selecionada | SnackBar "Selecione uma categoria" |
| Submissao | Botao mostra "Publicando..." com spinner |
| Sucesso | Navigator.pop + SnackBar verde |
| Erro | SnackBar vermelho com mensagem da API |

---

## 6. Validacao Tecnica

| Check | Resultado |
|---|---|
| `flutter analyze` | No issues found! |
| Design System intacto | Cores, fontes, gradients, animacoes — tudo preservado |
| mock_data.dart limpo | Classe Produto e mockProdutos removidos |
| Compilacao | Zero erros, zero warnings |

---

## 7. Como Testar

### Pre-requisitos
1. API rodando: `docker compose up -d --build catalog-api`
2. Artesao de teste logado (ex: `artesao.mobile@catalog.com` / `Teste@123`)

### Cenarios

| # | Cenario | Acao | Resultado Esperado |
|---|---|---|---|
| 1 | Listar produtos | Login → Dashboard → tab Vitrine | Produtos do artesao carregados da API |
| 2 | Vitrine vazia | Artesao sem produtos | Empty state elegante |
| 3 | Stats corretos | Verificar chips | Ativos/Pecas Unicas/Vendidos contam corretamente |
| 4 | Criar produto | FAB "+" → preencher form → Publicar | Produto criado via API, lista atualiza |
| 5 | Categorias API | Abrir Nova Obra | Chips carregados da API (nao hardcoded) |
| 6 | Campo obrigatorio | Submeter sem nome ou preco | Validacao local impede |
| 7 | Sem categoria | Submeter sem selecionar categoria | SnackBar "Selecione uma categoria" |
| 8 | Marcar vendida | Menu "..." → Marcar como Vendida → Confirmar | PATCH API, badge muda para "VENDIDA" |
| 9 | Erro de rede | Desligar Docker e abrir vitrine | Error state com botao retry |

---

## 8. O que NAO foi implementado (intencional)

- **Upload de imagens**: Placeholder mantido ("Disponivel na proxima versao"). Sprint futura
- **Edicao de produto**: Botao "Editar" mostra SnackBar "Em breve". Sprint futura
- **Paginacao infinita**: Carrega todos (size=100). Scroll infinito numa iteracao futura
- **Dimensoes/Peso**: Campos opcionais do backend, nao adicionados ao form para nao sobrecarregar a UI

---

## 9. Proximos Passos

- **Sprint 3**: Encomendas (integrar encomendas_tab.dart com API real)
- **Sprint futura**: Upload de imagens (POST /produtos/{id}/imagens com FormData)
- **Sprint futura**: Edicao de produto (PUT /produtos/{id})
