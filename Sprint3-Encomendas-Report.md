# Sprint 3 — Encomendas: Relatorio de Conclusao

> **Modulo**: Mobile do Artesao — Cata Log  
> **Data**: 12/05/2026  
> **Status**: Concluida — pronta para teste

---

## 1. Objetivo

Substituir os dados mockados (mock_data.dart) na aba "Encomendas" e na tela "Enviar Orcamento" por chamadas reais a API Spring Boot, permitindo ao artesao listar encomendas recebidas e enviar contrapropostas de preco/prazo aos clientes.

---

## 2. Endpoints Integrados

| Metodo | Rota | Acao | Tela |
|---|---|---|---|
| GET | `/api/v1/encomendas/artesao` | Listar encomendas do artesao | EncomendasTab |
| PUT | `/api/v1/encomendas/{id}/contraproposta` | Enviar preco + prazo ao comprador | OrcamentoScreen |

---

## 3. Entregas

### 3.1 Ficheiros Criados (3)

| Ficheiro | Camada | Descricao |
|---|---|---|
| `lib/models/encomenda_response.dart` | Model | DTO com 14 campos + getters de conveniencia (`isAguardandoArtesao`, `inicialComprador`, `descricaoExibicao`) |
| `lib/services/encomenda_service.dart` | Service | `getEncomendasArtesao()` e `enviarContraproposta()` com tratamento de erros completo |
| `lib/providers/encomenda_provider.dart` | State | ChangeNotifier com listas, stats getters (`totalAguardando`, `totalEnviadas`, `totalAcordadas`), `carregarEncomendas()` e `responderOrcamento()` |

### 3.2 Ficheiros Editados (5)

| Ficheiro | Mudanca |
|---|---|
| `lib/main.dart` | +`EncomendaProvider` no MultiProvider |
| `lib/screens/tabs/encomendas_tab.dart` | Removido mock_data. `Consumer<EncomendaProvider>`. Stats chips (Pendentes/Enviadas/Acordadas). Loading/empty/error states. `_StatusBadge` expandido para os 5 status do enum |
| `lib/screens/orcamento_screen.dart` | Recebe `EncomendaResponse`. Removido campo Observacoes (nao faz parte do request). Submit via `provider.responderOrcamento()`. Adicionada secao "Observacoes do cliente" (readonly) |
| `lib/screens/chat_screen.dart` | Tipo `Encomenda` → `EncomendaResponse`. Mapeados `nomeCliente→nomeComprador`, `pecaReferencia→descricaoExibicao` |
| `lib/data/mock_data.dart` | Removidas classe `Encomenda` e lista `mockEncomendas`. Restam apenas `Mensagem` e `mockMensagens` (chat) |

---

## 4. Mapeamento de Status (Enum Backend → UI)

| Status (backend) | Label (UI) | Cor | Acao no card |
|---|---|---|---|
| `AGUARDANDO_ARTESAO` | Aguardando | Amarelo (`statusAguardando`) | "Enviar Orcamento" → OrcamentoScreen |
| `AGUARDANDO_COMPRADOR` | Proposta Enviada | Verde (`statusOrcamentoEnviado`) | "Abrir Chat" → ChatScreen |
| `PRECO_ACORDADO` | Acordo Firmado | Vermelho (`primary`) | "Abrir Chat" → ChatScreen |
| `CANCELADO_ESTORNO_TOTAL` | Cancelada | Cinza (`outlineVariant`) | Sem acao |
| `CANCELADO_COM_TAXA` | Cancelada (taxa) | Vermelho escuro (`error`) | Sem acao |

---

## 5. Mapeamento Mock → API

| Mock (antigo) | API (novo) |
|---|---|
| `encomenda.id` (String) | `encomenda.id` (int) |
| `encomenda.nomeCliente` | `encomenda.nomeComprador` |
| `encomenda.pecaReferencia` | `encomenda.nomeProdutoReferencia` / `observacoesCliente` |
| `encomenda.status` (`ORCAMENTO_ENVIADO`) | `encomenda.status` (`AGUARDANDO_COMPRADOR`) |
| `encomenda.precoProposto` | `encomenda.precoProposto` |
| `encomenda.prazoDias` | `encomenda.tempoProducaoDias` |

---

## 6. Estados da UI

### EncomendasTab

| Estado | Comportamento |
|---|---|
| Loading | CircularProgressIndicator centrado |
| Vazio | Icone assignment + "Sem encomendas" + texto explicativo |
| Erro | Icone wifi_off + mensagem + botao "Tentar novamente" |
| Com dados | Stats chips + Lista de EncomendaCards |

### OrcamentoScreen

| Estado | Comportamento |
|---|---|
| Observacoes do cliente | Card amarelo readonly (se houver) |
| Submissao | Botao mostra "Enviando..." com spinner |
| Sucesso | Navigator.pop(true) + SnackBar verde |
| Erro | SnackBar vermelho com mensagem da API |

---

## 7. Validacao Tecnica

| Check | Resultado |
|---|---|
| `flutter analyze` | No issues found! |
| Design System intacto | Cores, fontes, gradients — tudo preservado |
| mock_data.dart limpo | Apenas Mensagem/mockMensagens restam |
| Compilacao | Zero erros, zero warnings |

---

## 8. Como Testar

### Pre-requisitos
1. API rodando: `docker compose up -d --build catalog-api`
2. Artesao de teste logado
3. Ter encomendas criadas por um comprador (precisa de um comprador no sistema)

### Cenarios

| # | Cenario | Acao | Resultado Esperado |
|---|---|---|---|
| 1 | Listar encomendas | Login → Dashboard → tab Encomendas | Encomendas carregadas da API |
| 2 | Sem encomendas | Artesao sem encomendas | Empty state elegante |
| 3 | Stats corretos | Verificar chips | Pendentes/Enviadas/Acordadas contam corretamente |
| 4 | Enviar orcamento | Toque em encomenda "Aguardando" → preencher preco+prazo → Enviar | PUT contraproposta, status muda para "Proposta Enviada" |
| 5 | Validacao | Submeter sem preco ou prazo | Validacao local impede |
| 6 | Abrir chat | Toque em encomenda "Proposta Enviada" | Abre ChatScreen |
| 7 | Cancelada | Encomenda cancelada | Card sem botao de acao |
| 8 | Erro de rede | Desligar Docker e abrir tab | Error state com botao retry |

---

## 9. O que NAO foi implementado (intencional)

- **Chat real**: Mensagens continuam mockadas. Integracao com Stream/WebSocket sera sprint dedicada
- **Aceitar encomenda** (PUT /aceitar): Acao do comprador, nao do artesao
- **Paginacao infinita**: Carrega todos (size=100)

---

## 10. Estado do mock_data.dart

```
Antes (Sprint 0):  Produto, Encomenda, Mensagem + mockProdutos, mockEncomendas, mockMensagens
Apos Sprint 2:     Encomenda, Mensagem + mockEncomendas, mockMensagens
Apos Sprint 3:     Mensagem + mockMensagens  ← APENAS CHAT MOCKADO
```

---

## 11. Proximos Passos

- **Sprint 4**: Chat real (Stream/WebSocket)
- **Sprint futura**: Upload de imagens (POST /produtos/{id}/imagens)
- **Sprint futura**: Edicao de produto (PUT /produtos/{id})
- **Sprint futura**: Tela "Esqueci a senha"
