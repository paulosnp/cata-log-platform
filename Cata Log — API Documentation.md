# Cata Log — API Documentation
### v1.0 | Hub de Visibilidade para Microempreendedores da Cultura Pernambucana

---

## 1. Visão Geral

| Item | Valor |
|---|---|
| **Base URL** | `http://localhost:8080/api/v1` |
| **Content-Type** | `application/json` |
| **Autenticação** | JWT Bearer Token |
| **Versão** | Spring Boot 3.3.5, Java 17 |
| **Total de Endpoints** | 60 |

---

## 2. Autenticação e Autorização

### 2.1 JWT Token

Todas as rotas protegidas exigem o header:

```
Authorization: Bearer <token>
```

O token é obtido via endpoints de login (`/auth/{perfil}/login`) e expira em **24 horas**.

### 2.2 Perfis (RBAC)

| Perfil | Descrição | Acesso |
|---|---|---|
| **Público** | Sem autenticação | Vitrine, login, registro |
| **COMPRADOR** | Cliente final | Carrinho, pedidos, avaliações, desejos, encomendas, cotação frete |
| **ARTESAO** | Produtor/vendedor | CRUD produtos, envio de frete, encomendas, cotação frete |
| **ADMIN** | Administrador | Painel completo (permissões granulares) |

### 2.3 Permissões Granulares do Admin

| Permissão | Escopo |
|---|---|
| `GERENCIAR_ADMINS` | Criar, listar e editar permissões de admins |
| `GERENCIAR_ARTESAOS` | Verificar e gerenciar artesãos |
| `GERENCIAR_COMPRADORES` | Bloquear/desbloquear compradores |
| `VER_DASHBOARD` | Métricas gerais da plataforma |
| `VER_RELATORIOS` | Faturamento e top artesãos |

---

## 3. Dicionário de Erros

| Código | Significado | Quando ocorre |
|---|---|---|
| `400` | Bad Request | Validação falhou (campos obrigatórios, formato inválido) |
| `401` | Unauthorized | Token ausente ou expirado |
| `403` | Forbidden | Perfil sem permissão para a rota |
| `404` | Not Found | Recurso não encontrado |
| `409` | Conflict | Duplicidade (e-mail já cadastrado, etc.) |
| `500` | Internal Server Error | Erro inesperado no servidor |

**Estrutura padrão de erro:**

```json
{
  "timestamp": "2026-05-05T22:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Campo 'email' é obrigatório",
  "path": "/api/v1/auth/artesao/registrar"
}
```

---

## 4. Referência de Endpoints

### 4.1 Autenticação (`/auth`) — 8 endpoints

#### POST `/auth/artesao/registrar` — Público

```json
// Request
{
  "nome": "Maria Silva",
  "email": "maria@atelie.com",
  "senha": "Senha@123",
  "cpf": "12345678901",
  "telefone": "81999999999",
  "nomeAtelie": "Ateliê da Maria",
  "cep": "50030230",
  "estado": "PE",
  "cidade": "Recife"
}
// Response 201
{ "mensagem": "Artesão cadastrado com sucesso." }
```

#### POST `/auth/comprador/registrar` — Público

```json
// Request
{
  "nome": "João Souza",
  "email": "joao@email.com",
  "senha": "Senha@123",
  "cpf": "98765432100",
  "telefone": "81988888888",
  "cep": "20040020"
}
// Response 201
{ "mensagem": "Comprador cadastrado com sucesso." }
```

#### POST `/auth/artesao/login` — Público

```json
// Request
{ "email": "maria@atelie.com", "senha": "Senha@123" }
// Response 200
{ "token": "eyJhbGciOiJIUzI1NiIs...", "tipo": "Bearer" }
```

#### POST `/auth/comprador/login` — Público

```json
// Request
{ "email": "joao@email.com", "senha": "Senha@123" }
// Response 200
{ "token": "eyJhbGciOiJIUzI1NiIs...", "tipo": "Bearer" }
```

#### POST `/auth/admin/login` — Público

```json
// Request
{ "email": "admin@catalog.com", "senha": "Admin@123" }
// Response 200
{ "token": "eyJhbGciOiJIUzI1NiIs...", "tipo": "Bearer" }
```

#### POST `/auth/trocar-senha` — Autenticado

```json
// Request
{ "senhaAtual": "Senha@123", "novaSenha": "NovaSenha@456" }
// Response 200
{ "mensagem": "Senha atualizada com sucesso." }
```

#### POST `/auth/esqueci-senha` — Público

```json
// Request
{ "email": "maria@atelie.com" }
// Response 200
{ "mensagem": "Se o e-mail existir, um código de recuperação foi enviado." }
```

#### POST `/auth/redefinir-senha` — Público

```json
// Request
{ "email": "maria@atelie.com", "pin": "123456", "novaSenha": "NovaSenha@789" }
// Response 200
{ "mensagem": "Senha redefinida com sucesso." }
```

---

### 4.2 Catálogo de Produtos (`/produtos`) — 11 endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/produtos` | Público | Listar vitrine (paginada) |
| `GET` | `/produtos/vitrine` | Público | Busca avançada (termo, categoria, preço) |
| `GET` | `/produtos/{id}` | Público | Detalhe do produto |
| `GET` | `/produtos/meus` | ARTESAO | Meus produtos |
| `POST` | `/produtos` | ARTESAO | Criar produto |
| `PUT` | `/produtos/{id}` | ARTESAO | Atualizar produto |
| `DELETE` | `/produtos/{id}` | ARTESAO | Desativar produto |
| `PATCH` | `/produtos/{id}/promocao` | ARTESAO | Aplicar promoção |
| `PATCH` | `/produtos/{id}/vendido` | ARTESAO | Marcar como vendido |
| `POST` | `/produtos/{id}/imagens` | ARTESAO | Upload de imagem |
| `DELETE` | `/produtos/{id}/imagens/{imagemId}` | ARTESAO | Remover imagem |

#### POST `/produtos` — ARTESAO

```json
// Request
{
  "nome": "Vaso de Barro Caruaru",
  "descricao": "Peça artesanal feita à mão",
  "preco": 89.90,
  "quantidadeEstoque": 5,
  "categoriaId": 1,
  "pesoGramas": 500,
  "alturaCm": 20,
  "larguraCm": 15,
  "comprimentoCm": 15,
  "pecaUnica": true
}
// Response 201
{
  "id": 1,
  "nome": "Vaso de Barro Caruaru",
  "preco": 89.90,
  "artesao": "Ateliê da Maria",
  "categoria": "Cerâmica",
  "imagens": []
}
```

#### GET `/produtos/vitrine?termo=vaso&precoMax=100` — Público

```json
// Response 200
{
  "content": [
    { "id": 1, "nome": "Vaso de Barro Caruaru", "preco": 89.90 }
  ],
  "totalElements": 1,
  "totalPages": 1
}
```

---

### 4.3 Categorias (`/categorias`) — 7 endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/categorias` | Público | Listar ativas |
| `GET` | `/categorias/{id}` | Público | Detalhe |
| `GET` | `/categorias/busca?nome=` | Público | Buscar por nome |
| `GET` | `/categorias/admin` | ADMIN | Listar todas (incluindo inativas) |
| `POST` | `/categorias` | ADMIN | Criar |
| `PUT` | `/categorias/{id}` | ADMIN | Atualizar |
| `DELETE` | `/categorias/{id}` | ADMIN | Desativar |

---

### 4.4 Artesãos (`/artesaos`) — 1 endpoint

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/artesaos/vitrine?nome=` | Público | Buscar artesãos |

---

### 4.5 Carrinho (`/carrinho`) — 4 endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/carrinho` | COMPRADOR | Ver carrinho |
| `POST` | `/carrinho/itens` | COMPRADOR | Adicionar item |
| `DELETE` | `/carrinho/itens/{produtoId}` | COMPRADOR | Remover item |
| `DELETE` | `/carrinho` | COMPRADOR | Limpar carrinho |

#### POST `/carrinho/itens` — COMPRADOR

```json
// Request
{ "produtoId": 1, "quantidade": 2 }
// Response 200
{
  "itens": [
    { "produtoId": 1, "nome": "Vaso de Barro", "quantidade": 2, "precoUnitario": 89.90 }
  ],
  "total": 179.80
}
```

---

### 4.6 Pedidos (`/pedidos`) — 2 endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/pedidos/checkout` | COMPRADOR | Fechar pedido (converte carrinho) |
| `GET` | `/pedidos/meus` | COMPRADOR | Listar meus pedidos |

#### POST `/pedidos/checkout` — COMPRADOR

```json
// Response 201
{
  "id": 1,
  "valorTotal": 179.80,
  "taxaPlataforma": 17.98,
  "valorLiquidoArtesao": 161.82,
  "statusPagamento": "PENDENTE",
  "statusEntrega": "AGUARDANDO_ENVIO",
  "itens": [
    { "produtoId": 1, "nome": "Vaso de Barro", "quantidade": 2 }
  ]
}
```

---

### 4.7 Avaliações (`/produtos/{id}/avaliacoes`) — 2 endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/produtos/{id}/avaliacoes` | COMPRADOR | Avaliar produto |
| `GET` | `/produtos/{id}/avaliacoes` | Público | Listar avaliações |

#### POST `/produtos/1/avaliacoes` — COMPRADOR

```json
// Request
{ "nota": 5, "comentario": "Produto maravilhoso!" }
// Response 201
{ "id": 1, "nota": 5, "comentario": "Produto maravilhoso!", "comprador": "João" }
```

---

### 4.8 Lista de Desejos (`/desejos`) — 3 endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/desejos/{produtoId}` | COMPRADOR | Favoritar produto |
| `DELETE` | `/desejos/{produtoId}` | COMPRADOR | Desfavoritar |
| `GET` | `/desejos` | COMPRADOR | Listar favoritos |

---

### 4.9 Encomendas Personalizadas (`/encomendas`) — 5 endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/encomendas` | COMPRADOR | Solicitar encomenda |
| `PUT` | `/encomendas/{id}/contraproposta` | ARTESAO | Enviar contraproposta |
| `PUT` | `/encomendas/{id}/aceitar` | COMPRADOR | Aceitar encomenda |
| `GET` | `/encomendas/comprador` | COMPRADOR | Minhas encomendas |
| `GET` | `/encomendas/artesao` | ARTESAO | Encomendas recebidas |

#### POST `/encomendas` — COMPRADOR

```json
// Request
{
  "artesaoId": 1,
  "descricao": "Quero um vaso personalizado com meu nome",
  "orcamentoMaximo": 200.00
}
// Response 201
{
  "id": 1,
  "status": "PENDENTE",
  "descricao": "Quero um vaso personalizado com meu nome",
  "orcamentoMaximo": 200.00
}
```

---

### 4.10 Chat (`/chat`) — 1 endpoint

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `GET` | `/chat/token` | COMPRADOR / ARTESAO | Gerar token Stream Chat |

---

### 4.11 Logística — Melhor Envio (`/logistica`) — 2 endpoints

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/logistica/cotacao` | COMPRADOR / ARTESAO | Cotação de frete |
| `POST` | `/logistica/envio` | ARTESAO | Gerar envio completo (etiqueta) |

#### POST `/logistica/cotacao` — COMPRADOR ou ARTESAO

```json
// Request
{
  "cepOrigem": "50030230",
  "cepDestino": "20040020",
  "peso": 0.5,
  "altura": 20,
  "largura": 15,
  "comprimento": 15
}
// Response 200
[
  { "id": 1, "nome": "PAC", "valor": 23.50, "prazoDias": 8 },
  { "id": 2, "nome": "SEDEX", "valor": 45.90, "prazoDias": 3 }
]
```

#### POST `/logistica/envio` — ARTESAO

```json
// Request
{
  "pedidoId": 1,
  "servicoId": 1,
  "nomeDestinatario": "João Souza",
  "enderecoDestinatario": "Rua das Flores, 123",
  "cidadeDestinatario": "Rio de Janeiro",
  "estadoDestinatario": "RJ",
  "cepDestinatario": "20040020",
  "peso": 0.5,
  "altura": 20,
  "largura": 15,
  "comprimento": 15
}
// Response 200
{
  "shipmentId": "abc-123-def",
  "codigoRastreio": "ME123456789BR",
  "urlEtiqueta": "https://sandbox.melhorenvio.com.br/imprimir/pdf/abc-123",
  "status": "ENVIADO"
}
```

---

### 4.12 Pagamentos — Mercado Pago (`/pagamentos`) — 1 endpoint

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/pagamentos/{pedidoId}` | COMPRADOR | Gerar link de pagamento MP |

*(O endpoint de pagamento chama o SDK do Mercado Pago e retorna o `initPoint` — link de checkout.)*

---

### 4.13 Webhooks (`/webhooks`) — 1 endpoint

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/webhooks/mercadopago` | Público | Receber notificação do MP |

> Chamado automaticamente pelo Mercado Pago. Consulta a API do MP, extrai `status` e atualiza o `StatusPagamento` do Pedido.

---

### 4.14 Painel Admin (`/admin`) — 12 endpoints

| Método | Rota | Permissão | Descrição |
|---|---|---|---|
| `POST` | `/admin/registrar` | GERENCIAR_ADMINS | Registrar admin |
| `GET` | `/admin/admins` | GERENCIAR_ADMINS | Listar admins |
| `PUT` | `/admin/admins/{id}/permissoes` | GERENCIAR_ADMINS | Editar permissões |
| `GET` | `/admin/dashboard` | VER_DASHBOARD | Métricas gerais |
| `GET` | `/admin/artesaos` | GERENCIAR_ARTESAOS | Listar artesãos |
| `PUT` | `/admin/artesaos/{id}/verificar` | GERENCIAR_ARTESAOS | Verificar artesão |
| `PUT` | `/admin/artesaos/{id}/remover-verificacao` | GERENCIAR_ARTESAOS | Remover verificação |
| `GET` | `/admin/compradores` | GERENCIAR_COMPRADORES | Listar compradores |
| `PUT` | `/admin/compradores/{id}/bloquear` | GERENCIAR_COMPRADORES | Bloquear |
| `PUT` | `/admin/compradores/{id}/desbloquear` | GERENCIAR_COMPRADORES | Desbloquear |
| `GET` | `/admin/relatorios/faturamento` | VER_RELATORIOS | Faturamento por período |
| `GET` | `/admin/relatorios/top-artesaos` | VER_RELATORIOS | Top artesãos |

#### GET `/admin/dashboard` — VER_DASHBOARD

```json
// Response 200
{
  "totalArtesaos": 42,
  "totalCompradores": 156,
  "totalProdutos": 320,
  "totalPedidos": 89,
  "faturamentoTotal": 12450.00
}
```

#### GET `/admin/relatorios/faturamento?inicio=2026-01-01T00:00&fim=2026-05-05T23:59`

```json
// Response 200
{
  "periodo": { "inicio": "2026-01-01", "fim": "2026-05-05" },
  "totalBruto": 25000.00,
  "totalTaxas": 2500.00,
  "totalLiquido": 22500.00,
  "totalPedidos": 89
}
```

---

## 5. Testando os Fluxos Principais (Postman)

### Fluxo 1 — Onboarding e Login

```bash
### Passo 1: Registrar Artesão
POST http://localhost:8080/api/v1/auth/artesao/registrar
Content-Type: application/json

{
  "nome": "Maria Silva",
  "email": "maria@atelie.com",
  "senha": "Senha@123",
  "cpf": "12345678901",
  "telefone": "81999999999",
  "nomeAtelie": "Ateliê da Maria",
  "cep": "50030230",
  "estado": "PE",
  "cidade": "Recife"
}
→ 201 Created

### Passo 2: Login do Artesão
POST http://localhost:8080/api/v1/auth/artesao/login
Content-Type: application/json

{ "email": "maria@atelie.com", "senha": "Senha@123" }
→ 200 OK { "token": "eyJ..." }
# Copie o token para os próximos passos
```

### Fluxo 2 — Gestão de Catálogo

```bash
### Passo 1: Criar Produto (JWT do Artesão)
POST http://localhost:8080/api/v1/produtos
Authorization: Bearer {TOKEN_ARTESAO}
Content-Type: application/json

{
  "nome": "Vaso de Barro Caruaru",
  "descricao": "Peça artesanal feita à mão em barro",
  "preco": 89.90,
  "quantidadeEstoque": 5,
  "categoriaId": 1,
  "pesoGramas": 500,
  "alturaCm": 20,
  "larguraCm": 15,
  "comprimentoCm": 15,
  "pecaUnica": false
}
→ 201 Created { "id": 1, ... }

### Passo 2: Listar Meus Produtos
GET http://localhost:8080/api/v1/produtos/meus
Authorization: Bearer {TOKEN_ARTESAO}
→ 200 OK { "content": [...], "totalElements": 1 }

### Passo 3: Aplicar Promoção
PATCH http://localhost:8080/api/v1/produtos/1/promocao
Authorization: Bearer {TOKEN_ARTESAO}
Content-Type: application/json

{ "precoPromocional": 69.90, "ativo": true }
→ 200 OK
```

### Fluxo 3 — Compra Completa (End-to-End)

```bash
### Passo 1: Registrar e Logar Comprador
POST http://localhost:8080/api/v1/auth/comprador/registrar
Content-Type: application/json

{
  "nome": "João Souza",
  "email": "joao@email.com",
  "senha": "Senha@123",
  "cpf": "98765432100",
  "telefone": "81988888888",
  "cep": "20040020"
}

POST http://localhost:8080/api/v1/auth/comprador/login
{ "email": "joao@email.com", "senha": "Senha@123" }
→ { "token": "eyJ..." }

### Passo 2: Adicionar ao Carrinho
POST http://localhost:8080/api/v1/carrinho/itens
Authorization: Bearer {TOKEN_COMPRADOR}
Content-Type: application/json

{ "produtoId": 1, "quantidade": 1 }
→ 200 OK { "itens": [...], "total": 89.90 }

### Passo 3: Cotação de Frete
POST http://localhost:8080/api/v1/logistica/cotacao
Authorization: Bearer {TOKEN_COMPRADOR}
Content-Type: application/json

{
  "cepOrigem": "50030230",
  "cepDestino": "20040020",
  "peso": 0.5,
  "altura": 20,
  "largura": 15,
  "comprimento": 15
}
→ 200 OK [
  { "id": 1, "nome": "PAC", "valor": 23.50, "prazoDias": 8 },
  { "id": 2, "nome": "SEDEX", "valor": 45.90, "prazoDias": 3 }
]

### Passo 4: Fechar Pedido
POST http://localhost:8080/api/v1/pedidos/checkout
Authorization: Bearer {TOKEN_COMPRADOR}
→ 201 Created { "id": 1, "valorTotal": 89.90, "statusPagamento": "PENDENTE" }

### Passo 5: Gerar Link de Pagamento (Mercado Pago)
POST http://localhost:8080/api/v1/pagamentos/1
Authorization: Bearer {TOKEN_COMPRADOR}
→ 200 OK "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=..."

### Passo 6 (Artesão): Gerar Envio após pagamento aprovado
POST http://localhost:8080/api/v1/logistica/envio
Authorization: Bearer {TOKEN_ARTESAO}
Content-Type: application/json

{
  "pedidoId": 1,
  "servicoId": 1,
  "nomeDestinatario": "João Souza",
  "enderecoDestinatario": "Rua das Flores, 123",
  "cidadeDestinatario": "Rio de Janeiro",
  "estadoDestinatario": "RJ",
  "cepDestinatario": "20040020",
  "peso": 0.5,
  "altura": 20,
  "largura": 15,
  "comprimento": 15
}
→ 200 OK {
  "shipmentId": "abc-123",
  "codigoRastreio": "ME123456789BR",
  "urlEtiqueta": "https://sandbox.melhorenvio.com.br/imprimir/pdf/abc-123",
  "status": "ENVIADO"
}
```

### Fluxo 4 — Moderação (Admin)

```bash
### Passo 1: Login Admin
POST http://localhost:8080/api/v1/auth/admin/login
Content-Type: application/json

{ "email": "admin@catalog.com", "senha": "Admin@123" }
→ { "token": "eyJ..." }

### Passo 2: Dashboard
GET http://localhost:8080/api/v1/admin/dashboard
Authorization: Bearer {TOKEN_ADMIN}
→ 200 OK { "totalArtesaos": 42, "totalPedidos": 89, ... }

### Passo 3: Relatório de Faturamento
GET http://localhost:8080/api/v1/admin/relatorios/faturamento?inicio=2026-01-01T00:00:00&fim=2026-05-05T23:59:59
Authorization: Bearer {TOKEN_ADMIN}
→ 200 OK { "totalBruto": 25000.00, "totalTaxas": 2500.00 }

### Passo 4: Top Artesãos
GET http://localhost:8080/api/v1/admin/relatorios/top-artesaos?limite=5
Authorization: Bearer {TOKEN_ADMIN}
→ 200 OK [
  { "artesaoId": 1, "nome": "Ateliê da Maria", "totalVendas": 45, "faturamento": 5200.00 }
]

### Passo 5: Verificar Artesão
PUT http://localhost:8080/api/v1/admin/artesaos/1/verificar
Authorization: Bearer {TOKEN_ADMIN}
→ 200 OK { "id": 1, "verificado": true }
```

---

## 6. Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `POSTGRES_DB` | Nome do banco | `catalog_db` |
| `POSTGRES_USER` | Usuário do banco | `catalog_user` |
| `POSTGRES_PASSWORD` | Senha do banco | `catalog_pass` |
| `STREAM_CHAT_API_KEY` | Chave Stream Chat | `e78m62ehrtr2` |
| `STREAM_CHAT_API_SECRET` | Secret Stream Chat | `s73sept...` |
| `MAIL_HOST` | Servidor SMTP | `sandbox.smtp.mailtrap.io` |
| `MAIL_PORT` | Porta SMTP | `587` |
| `MAIL_USERNAME` | Usuário SMTP | `db8459f...` |
| `MAIL_PASSWORD` | Senha SMTP | `a83796e...` |
| `MAIL_FROM` | Remetente | `nao-responda@catalog.com` |
| `MERCADOPAGO_ACCESS_TOKEN` | Token MP | `APP_USR-xxx...` |
| `MELHORENVIO_TOKEN` | Token ME | `eyJ0eXAi...` |

---

## 7. Referência Expandida

### Paginação

Endpoints que retornam listas usam `Page<T>` do Spring Data. Parâmetros de query:

| Parâmetro | Default | Descrição |
|---|---|---|
| `page` | 0 | Número da página (zero-indexed) |
| `size` | 20 | Itens por página |
| `sort` | - | Ordenação (ex: `sort=preco,desc`) |

```json
// Resposta paginada padrão
{
  "content": [ ... ],
  "pageable": { "pageNumber": 0, "pageSize": 20 },
  "totalElements": 42,
  "totalPages": 3,
  "first": true,
  "last": false
}
```

---

## Enums do Sistema

### StatusPagamento
| Valor | Descrição |
|---|---|
| `PENDENTE` | Aguardando pagamento |
| `APROVADO` | Pago com sucesso |
| `RECUSADO` | Pagamento recusado |
| `CANCELADO` | Cancelado |
| `REEMBOLSADO` | Devolvido ao comprador |

### StatusEntrega
| Valor | Descrição |
|---|---|
| `AGUARDANDO_ENVIO` | Pedido pago, aguardando artesão gerar envio |
| `ENVIADO` | Etiqueta gerada, pacote despachado |
| `EM_TRANSITO` | Em rota de entrega |
| `ENTREGUE` | Recebido pelo comprador |
| `DEVOLVIDO` | Devolvido ao artesão |

### StatusEncomenda
| Valor | Descrição |
|---|---|
| `PENDENTE` | Aguardando resposta do artesão |
| `CONTRAPROPOSTA` | Artesão enviou contraproposta |
| `ACEITA` | Comprador aceitou |
| `RECUSADA` | Recusada |
| `CONCLUIDA` | Finalizada |

---

## Endpoints Detalhados — Autenticação

### POST `/auth/artesao/registrar`

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `nome` | String | ✅ | min 3 chars |
| `email` | String | ✅ | formato email, único |
| `senha` | String | ✅ | min 8 chars |
| `cpf` | String | ✅ | 11 dígitos, único |
| `telefone` | String | ✅ | - |
| `nomeAtelie` | String | ✅ | - |
| `cep` | String | ✅ | 8-9 chars |
| `estado` | String | ❌ | 2 chars (UF) |
| `cidade` | String | ❌ | - |

**Erro 409** — E-mail já cadastrado:
```json
{ "status": 409, "message": "E-mail já está em uso." }
```

### POST `/auth/comprador/registrar`

| Campo | Tipo | Obrigatório |
|---|---|---|
| `nome` | String | ✅ |
| `email` | String | ✅ |
| `senha` | String | ✅ |
| `cpf` | String | ✅ |
| `telefone` | String | ✅ |
| `cep` | String | ✅ |

### POST `/auth/{perfil}/login`

```json
// Request
{ "email": "user@email.com", "senha": "Senha@123" }

// Response 200
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "tipo": "Bearer" }

// Erro 401
{ "status": 401, "message": "Credenciais inválidas." }
```

### POST `/auth/esqueci-senha`

```json
// Request
{ "email": "user@email.com" }
// Response 200 (sempre, por segurança)
{ "mensagem": "Se o e-mail existir, um código de recuperação foi enviado." }
```
> O PIN de 6 dígitos é enviado por e-mail real (SMTP).

### POST `/auth/redefinir-senha`

```json
// Request
{ "email": "user@email.com", "pin": "482917", "novaSenha": "NovaSenha@456" }
// Response 200
{ "mensagem": "Senha redefinida com sucesso." }
// Erro 400
{ "status": 400, "message": "Código de verificação inválido ou expirado." }
```

---

## Endpoints Detalhados — Produtos

### POST `/produtos` — Criar (ARTESAO)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `nome` | String | ✅ | Nome do produto |
| `descricao` | String | ❌ | Descrição detalhada |
| `preco` | BigDecimal | ✅ | Preço em BRL |
| `quantidadeEstoque` | Integer | ✅ | Quantidade disponível |
| `categoriaId` | Long | ✅ | ID da categoria |
| `pesoGramas` | Integer | ❌ | Peso em gramas |
| `alturaCm` | Integer | ❌ | Altura em cm |
| `larguraCm` | Integer | ❌ | Largura em cm |
| `comprimentoCm` | Integer | ❌ | Comprimento em cm |
| `pecaUnica` | Boolean | ❌ | Se é peça única |

```json
// Response 201
{
  "id": 1,
  "nome": "Vaso de Barro Caruaru",
  "descricao": "Peça artesanal feita à mão em barro",
  "preco": 89.90,
  "precoPromocional": null,
  "quantidadeEstoque": 5,
  "pecaUnica": false,
  "vendido": false,
  "categoria": { "id": 1, "nome": "Cerâmica" },
  "artesao": { "id": 1, "nomeAtelie": "Ateliê da Maria" },
  "imagens": [],
  "criadoEm": "2026-05-05T22:00:00"
}
```

### GET `/produtos/vitrine` — Busca Avançada (Público)

| Query Param | Tipo | Descrição |
|---|---|---|
| `termo` | String | Busca no nome e descrição |
| `categoriaId` | Long | Filtro por categoria |
| `precoMin` | BigDecimal | Preço mínimo |
| `precoMax` | BigDecimal | Preço máximo |
| `page` | int | Página |
| `size` | int | Itens por página |

```
GET /produtos/vitrine?termo=vaso&categoriaId=1&precoMin=50&precoMax=200&page=0&size=10
```

### PATCH `/produtos/{id}/promocao` — Aplicar Promoção (ARTESAO)

```json
// Request
{ "precoPromocional": 69.90, "ativo": true }

// Response 200 — produto com precoPromocional atualizado
```

### POST `/produtos/{id}/imagens` — Upload (ARTESAO)

```
Content-Type: multipart/form-data
Field: arquivo (file, max 5MB, formatos: jpg, png, webp)
Limite: 5 imagens por produto
```

---

## Endpoints Detalhados — Carrinho

### GET `/carrinho` — Ver Carrinho (COMPRADOR)

```json
// Response 200
{
  "itens": [
    {
      "produtoId": 1,
      "nome": "Vaso de Barro",
      "quantidade": 2,
      "precoUnitario": 89.90,
      "subtotal": 179.80
    }
  ],
  "total": 179.80
}
```

### POST `/carrinho/itens` — Adicionar Item (COMPRADOR)

```json
// Request
{ "produtoId": 1, "quantidade": 2 }
// Erro 400 — Estoque insuficiente
{ "status": 400, "message": "Estoque insuficiente para o produto." }
```

---

## Endpoints Detalhados — Encomendas

### POST `/encomendas` — Solicitar (COMPRADOR)

```json
// Request
{
  "artesaoId": 1,
  "descricao": "Quero um vaso personalizado azul com meu nome 'João'",
  "orcamentoMaximo": 200.00
}
// Response 201
{
  "id": 1,
  "status": "PENDENTE",
  "descricao": "Quero um vaso personalizado azul com meu nome 'João'",
  "orcamentoMaximo": 200.00,
  "comprador": "João Souza",
  "artesao": "Ateliê da Maria",
  "criadoEm": "2026-05-05T22:00:00"
}
```

### PUT `/encomendas/{id}/contraproposta` — Artesão Responde (ARTESAO)

```json
// Request
{
  "valorProposto": 180.00,
  "prazoEstimadoDias": 15,
  "observacao": "Consigo fazer, mas preciso de 15 dias."
}
// Response 200 — encomenda com status CONTRAPROPOSTA
```

### PUT `/encomendas/{id}/aceitar` — Comprador Aceita (COMPRADOR)

```json
// Response 200 — encomenda com status ACEITA
```

---

## Endpoints Detalhados — Logística

### POST `/logistica/cotacao` — Cotação de Frete

| Campo | Tipo | Obrigatório | Validação |
|---|---|---|---|
| `cepOrigem` | String | ✅ | CEP válido |
| `cepDestino` | String | ✅ | CEP válido |
| `peso` | Double | ✅ | Em kg (> 0) |
| `altura` | Integer | ✅ | Em cm (≥ 1) |
| `largura` | Integer | ✅ | Em cm (≥ 1) |
| `comprimento` | Integer | ✅ | Em cm (≥ 1) |

```json
// Response 200 — Lista de transportadoras disponíveis
[
  { "id": 1, "nome": "PAC", "valor": 23.50, "prazoDias": 8 },
  { "id": 2, "nome": "SEDEX", "valor": 45.90, "prazoDias": 3 },
  { "id": 17, "nome": ".Package", "valor": 18.20, "prazoDias": 10 }
]

// Erro 500 — API Melhor Envio offline
{ "status": 500, "message": "Serviço de frete temporariamente indisponível." }
```

### POST `/logistica/envio` — Gerar Envio Completo (ARTESAO)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `pedidoId` | Long | ✅ | ID do pedido no Cata Log |
| `servicoId` | Integer | ✅ | ID da transportadora (do /cotacao) |
| `nomeDestinatario` | String | ✅ | Nome do comprador |
| `enderecoDestinatario` | String | ✅ | Endereço completo |
| `cidadeDestinatario` | String | ✅ | Cidade |
| `estadoDestinatario` | String | ✅ | UF (2 chars) |
| `cepDestinatario` | String | ✅ | CEP |
| `peso` | Double | ✅ | Em kg |
| `altura` | Integer | ✅ | Em cm |
| `largura` | Integer | ✅ | Em cm |
| `comprimento` | Integer | ✅ | Em cm |

**Fluxo interno (4 chamadas ao Melhor Envio):**
```
1. POST /cart         → Insere frete no carrinho ME
2. POST /checkout     → Compra o frete (debita saldo)
3. POST /generate     → Gera etiqueta + rastreio
4. POST /print        → Retorna URL do PDF
→ Salva codigoRastreioMe no Pedido
→ Muda StatusEntrega para ENVIADO
```

```json
// Response 200
{
  "shipmentId": "abc-123-def-456",
  "codigoRastreio": "ME123456789BR",
  "urlEtiqueta": "https://sandbox.melhorenvio.com.br/imprimir/pdf/abc-123",
  "status": "ENVIADO"
}
```

---

## Endpoints Detalhados — Admin

### POST `/admin/registrar` — Criar Admin (GERENCIAR_ADMINS)

```json
// Request
{
  "nome": "Carlos Admin",
  "email": "carlos@catalog.com",
  "senha": "Admin@123",
  "permissoes": ["VER_DASHBOARD", "VER_RELATORIOS"]
}
// Response 201
{ "mensagem": "Administrador registrado com sucesso." }
```

### PUT `/admin/admins/{id}/permissoes` — Editar Permissões (GERENCIAR_ADMINS)

```json
// Request
{
  "permissoes": ["VER_DASHBOARD", "VER_RELATORIOS", "GERENCIAR_ARTESAOS"]
}
// Response 200
{
  "id": 2,
  "nome": "Carlos Admin",
  "email": "carlos@catalog.com",
  "permissoes": ["VER_DASHBOARD", "VER_RELATORIOS", "GERENCIAR_ARTESAOS"]
}

// Erro 400 — Auto-edição bloqueada
{ "status": 400, "message": "Você não pode alterar suas próprias permissões." }

// Erro 400 — Último admin com GERENCIAR_ADMINS
{ "status": 400, "message": "Deve existir ao menos um admin com GERENCIAR_ADMINS." }
```

### GET `/admin/relatorios/faturamento` — Faturamento (VER_RELATORIOS)

```
GET /admin/relatorios/faturamento?inicio=2026-01-01T00:00:00&fim=2026-05-05T23:59:59
```

```json
// Response 200
{
  "periodo": { "inicio": "2026-01-01T00:00:00", "fim": "2026-05-05T23:59:59" },
  "totalBruto": 25000.00,
  "totalTaxas": 2500.00,
  "totalLiquido": 22500.00,
  "totalPedidos": 89
}
```

### GET `/admin/relatorios/top-artesaos?limite=5` — Top Artesãos (VER_RELATORIOS)

```json
// Response 200
[
  { "artesaoId": 1, "nome": "Ateliê da Maria", "totalVendas": 45, "faturamento": 5200.00 },
  { "artesaoId": 3, "nome": "Barro & Arte", "totalVendas": 32, "faturamento": 3800.00 }
]
```

---

## Webhooks — Mercado Pago

### POST `/webhooks/mercadopago` — Público

O Mercado Pago chama este endpoint automaticamente via query params:

```
POST /webhooks/mercadopago?type=payment&data.id=12345678
```

**Processamento interno:**
1. Verifica `type == "payment"` e `data.id` não nulo
2. `GET https://api.mercadopago.com/v1/payments/{data.id}` (com Bearer token)
3. Extrai `status` e `external_reference` (= pedidoId)
4. Mapeia status MP → StatusPagamento Cata Log
5. Salva `idTransacaoMp` no Pedido
6. Sempre retorna `200 OK` (obrigatório pelo MP)

| Status MP | StatusPagamento |
|---|---|
| `approved` | APROVADO |
| `rejected` | RECUSADO |
| `pending` / `in_process` | PENDENTE |
| `cancelled` | CANCELADO |
| `refunded` / `charged_back` | REEMBOLSADO |

---

## Integrações Externas

| Serviço | Uso | Ambiente |
|---|---|---|
| **Mercado Pago** | Checkout Pro (pagamentos) | Sandbox |
| **Melhor Envio** | Cotação + etiquetas de frete | Sandbox |
| **Stream Chat** | Chat em tempo real | Produção |
| **Mailtrap** | E-mails (PIN de recuperação) | Sandbox |

---

## Segurança — Resumo

- ✅ JWT stateless (sem sessão no servidor)
- ✅ Senhas com BCrypt
- ✅ RBAC granular com `@PreAuthorize`
- ✅ CORS restrito a `localhost:3000/3001`
- ✅ Webhooks públicos (exigido pelo MP)
- ✅ Secrets via variáveis de ambiente (zero hardcoded)
- ✅ RestTemplate com timeout (10s connect, 30s read)
- ✅ `.env` no `.gitignore`
