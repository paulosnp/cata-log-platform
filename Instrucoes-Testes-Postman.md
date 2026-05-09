# Instruções para Testes da API Cata Log — Postman (Claude)

## Contexto

Você está testando a API REST "Cata Log" (Spring Boot) em `http://localhost:8080/api/v1`.
A API usa JWT Bearer Token para autenticação. Existem 3 perfis: ARTESAO, COMPRADOR e ADMIN.

**REGRA CRÍTICA**: Cada request que precisa de autenticação DEVE incluir o header:
```
Authorization: Bearer {{token_variavel}}
```

---

## CREDENCIAIS DO AMBIENTE

```
Admin:      admin@catalog.com.br    / CatalogAdmin123!
Artesão:    (registrar antes)
Comprador:  (registrar antes)
```

---

## ORDEM DE EXECUÇÃO OBRIGATÓRIA

Os testes DEVEM ser executados nesta ordem exata. Cada passo depende de dados criados no anterior. Salve IDs e tokens retornados para usar nos passos seguintes.

---

## PASSO 1 — Registrar Artesão

```
POST /api/v1/auth/artesao/registrar
Content-Type: application/json
(sem Authorization)

{
  "nomeAtelie": "Ateliê Teste Postman",
  "email": "artesao_teste@email.com",
  "senha": "Senha@123",
  "cep": "50030-230"
}
```

**Assertions**: Aceitar `201` (criado) OU `409` (já existe). Ambos são sucesso.

---

## PASSO 2 — Login Artesão

```
POST /api/v1/auth/artesao/login
Content-Type: application/json
(sem Authorization)

{
  "email": "artesao_teste@email.com",
  "senha": "Senha@123"
}
```

**Assertions**: Status `200`. A resposta contém `token`, `role` e `nome`.

**AÇÃO OBRIGATÓRIA**: Salvar `response.body.token` como variável `tokenArtesao`.

---

## PASSO 3 — Registrar Comprador

```
POST /api/v1/auth/comprador/registrar
Content-Type: application/json
(sem Authorization)

{
  "nome": "João Teste",
  "email": "joao_teste@email.com",
  "senha": "Senha@123"
}
```

**Assertions**: Aceitar `201` OU `409`.

---

## PASSO 4 — Login Comprador

```
POST /api/v1/auth/comprador/login
Content-Type: application/json
(sem Authorization)

{
  "email": "joao_teste@email.com",
  "senha": "Senha@123"
}
```

**Assertions**: Status `200`.

**AÇÃO OBRIGATÓRIA**: Salvar `response.body.token` como variável `tokenComprador`.

---

## PASSO 5 — Login Admin

```
POST /api/v1/auth/admin/login
Content-Type: application/json
(sem Authorization)

{
  "email": "admin@catalog.com.br",
  "senha": "CatalogAdmin123!"
}
```

**Assertions**: Status `200`.

**AÇÃO OBRIGATÓRIA**: Salvar `response.body.token` como variável `tokenAdmin`.

---

## PASSO 6 — Criar Produto (Artesão)

```
POST /api/v1/produtos
Content-Type: application/json
Authorization: Bearer {{tokenArtesao}}

{
  "nome": "Vaso de Barro Artesanal",
  "descricao": "Peça artesanal feita à mão em barro",
  "preco": 89.90,
  "categoriaId": 1,
  "pecaUnica": false,
  "pesoGramas": 1200,
  "alturaCm": 30,
  "larguraCm": 15,
  "comprimentoCm": 15
}
```

**Assertions**: Status `201`. Resposta contém `id`, `nome`, `preco`.

**AÇÃO OBRIGATÓRIA**: Salvar `response.body.id` como variável `produtoId`.

---

## PASSO 7 — Atualizar Produto (Artesão)

```
PUT /api/v1/produtos/{{produtoId}}
Content-Type: application/json
Authorization: Bearer {{tokenArtesao}}

{
  "nome": "Vaso de Barro Caruaru Premium",
  "descricao": "Peça artesanal feita à mão em barro - edição premium",
  "preco": 99.90,
  "categoriaId": 1,
  "pecaUnica": false
}
```

**Assertions**: Status `200`.

---

## PASSO 8 — Listar Meus Produtos (Artesão)

```
GET /api/v1/produtos/meus
Authorization: Bearer {{tokenArtesao}}
```

**Assertions**: Status `200`. Resposta é paginada (contém `content`, `totalElements`).

---

## PASSO 9 — Buscar Produto por ID (Público)

```
GET /api/v1/produtos/{{produtoId}}
(sem Authorization — rota pública)
```

**Assertions**: Status `200`. Resposta contém `id`, `nome`.

---

## PASSO 10 — Aplicar Promoção (Artesão)

**ATENÇÃO**: O DTO real usa os campos `emPromocao` (Boolean) e `percentualDesconto` (Integer 1-99).
NÃO use `precoPromocional` ou `ativo` — esses campos não existem.

```
PATCH /api/v1/produtos/{{produtoId}}/promocao
Content-Type: application/json
Authorization: Bearer {{tokenArtesao}}

{
  "emPromocao": true,
  "percentualDesconto": 20
}
```

**Assertions**: Status `200`.

---

## PASSO 11 — Remover Promoção (Artesão)

```
PATCH /api/v1/produtos/{{produtoId}}/promocao
Content-Type: application/json
Authorization: Bearer {{tokenArtesao}}

{
  "emPromocao": false,
  "percentualDesconto": 0
}
```

**Assertions**: Status `200`.

---

## PASSO 12 — Upload Imagem (Artesão)

```
POST /api/v1/produtos/{{produtoId}}/imagens
Content-Type: multipart/form-data
Authorization: Bearer {{tokenArtesao}}

Field: "arquivo" = (qualquer arquivo JPG/PNG/WebP, max 5MB)
```

**Assertions**: Status `201`. Resposta contém `imagens` (array com pelo menos 1 item).

**AÇÃO OBRIGATÓRIA**: Salvar `response.body.imagens[0].id` como variável `imagemId`.

**NOTA**: Para testar no Postman sem um arquivo real, você pode PULAR este teste ou usar um arquivo de exemplo. Se não tiver arquivo, aceite skip.

---

## PASSO 13 — Deletar Imagem (Artesão)

```
DELETE /api/v1/produtos/{{produtoId}}/imagens/{{imagemId}}
Authorization: Bearer {{tokenArtesao}}
```

**Assertions**: Status `200`. Só execute se o PASSO 12 tiver passado.

---

## PASSO 14 — Vitrine Pública

```
GET /api/v1/produtos/vitrine
(sem Authorization — rota pública)
```

**Assertions**: Status `200`. Resposta é paginada.

---

## PASSO 15 — Vitrine com Filtros

```
GET /api/v1/produtos/vitrine?categoriaId=1&precoMin=10&precoMax=500
(sem Authorization — rota pública)
```

**Assertions**: Status `200`.

---

## PASSO 16 — Listar Categorias (Público)

```
GET /api/v1/categorias
(sem Authorization — rota pública)
```

**Assertions**: Status `200`. Resposta é uma lista de categorias.

---

## PASSO 17 — Criar Categoria (Admin)

```
POST /api/v1/categorias
Content-Type: application/json
Authorization: Bearer {{tokenAdmin}}

{
  "nome": "Teste Postman",
  "descricao": "Categoria criada pelo teste automatizado"
}
```

**Assertions**: Aceitar `201` (criado) OU `409` (já existe).

**AÇÃO OBRIGATÓRIA**: Se `201`, salvar `response.body.id` como `categoriaTesteId`.

---

## PASSO 18 — Atualizar Categoria (Admin)

Só execute se PASSO 17 retornou `201`.

```
PUT /api/v1/categorias/{{categoriaTesteId}}
Content-Type: application/json
Authorization: Bearer {{tokenAdmin}}

{
  "nome": "Teste Postman Atualizado",
  "descricao": "Categoria atualizada pelo teste automatizado"
}
```

**Assertions**: Status `200`.

---

## PASSO 19 — Deletar Categoria (Admin)

Só execute se PASSO 17 retornou `201`.

```
DELETE /api/v1/categorias/{{categoriaTesteId}}
Authorization: Bearer {{tokenAdmin}}
```

**Assertions**: Status `200`. Resposta contém `"mensagem"`.

---

## PASSO 20 — Adicionar ao Carrinho (Comprador)

```
POST /api/v1/carrinho/itens
Content-Type: application/json
Authorization: Bearer {{tokenComprador}}

{
  "produtoId": {{produtoId}},
  "quantidade": 2
}
```

**Assertions**: Status `200`.

---

## PASSO 21 — Ver Carrinho (Comprador)

```
GET /api/v1/carrinho
Authorization: Bearer {{tokenComprador}}
```

**Assertions**: Status `200`. Resposta contém `itens` (array) e `total`.

---

## PASSO 22 — Remover Item do Carrinho (Comprador)

O endpoint de remoção usa o `produtoId` no path (não o itemId).

```
DELETE /api/v1/carrinho/itens/{{produtoId}}
Authorization: Bearer {{tokenComprador}}
```

**Assertions**: Status `200`.

---

## PASSO 23 — Re-adicionar e Fazer Checkout (Comprador)

Primeiro, adicionar novamente:
```
POST /api/v1/carrinho/itens
Content-Type: application/json
Authorization: Bearer {{tokenComprador}}

{
  "produtoId": {{produtoId}},
  "quantidade": 1
}
```

Depois, checkout:
```
POST /api/v1/pedidos/checkout
Authorization: Bearer {{tokenComprador}}
(sem body)
```

**Assertions**: Status `201`. Resposta contém `id`, `status`, `linkPagamento`.

**AÇÃO OBRIGATÓRIA**: Salvar `response.body.id` como `pedidoId`.

---

## PASSO 24 — Listar Meus Pedidos (Comprador)

```
GET /api/v1/pedidos/meus
Authorization: Bearer {{tokenComprador}}
```

**Assertions**: Status `200`. Resposta é uma lista.

---

## PASSO 25 — Criar Encomenda (Comprador)

**ATENÇÃO**: Os campos do DTO real são `artesaoId`, `produtoReferenciaId` (opcional) e `observacoesCliente`. NÃO use `descricao` ou `orcamentoMaximo`.

Primeiro, descubra o ID do artesão. Use o produto criado — o artesão é o dono.

```
POST /api/v1/encomendas
Content-Type: application/json
Authorization: Bearer {{tokenComprador}}

{
  "artesaoId": 1,
  "observacoesCliente": "Quero um vaso personalizado azul com meu nome 'João'"
}
```

**Assertions**: Status `201`. Resposta contém `id`, `status` = `"PENDENTE"`.

**AÇÃO OBRIGATÓRIA**: Salvar `response.body.id` como `encomendaId`.

---

## PASSO 26 — Listar Encomendas do Comprador

```
GET /api/v1/encomendas/comprador
Authorization: Bearer {{tokenComprador}}
```

**Assertions**: Status `200`. Resposta é paginada.

---

## PASSO 27 — Contraproposta (Artesão)

**ATENÇÃO**: Os campos do DTO real são `precoProposto` (BigDecimal) e `tempoProducaoDias` (Integer). NÃO use `valorProposto` ou `prazoEstimadoDias`.

```
PUT /api/v1/encomendas/{{encomendaId}}/contraproposta
Content-Type: application/json
Authorization: Bearer {{tokenArtesao}}

{
  "precoProposto": 180.00,
  "tempoProducaoDias": 15
}
```

**Assertions**: Status `200`. Status da encomenda muda para `"CONTRAPROPOSTA"`.

---

## PASSO 28 — Aceitar Encomenda (Comprador)

```
PUT /api/v1/encomendas/{{encomendaId}}/aceitar
Authorization: Bearer {{tokenComprador}}
(sem body)
```

**Assertions**: Status `200`. Status da encomenda muda para `"ACEITA"`.

---

## PASSO 29 — Dashboard Admin

```
GET /api/v1/admin/dashboard
Authorization: Bearer {{tokenAdmin}}
```

**Assertions**: Status `200`. Resposta contém métricas.

---

## PASSO 30 — Relatório de Faturamento (Admin)

```
GET /api/v1/admin/relatorios/faturamento?inicio=2025-01-01T00:00:00&fim=2027-12-31T23:59:59
Authorization: Bearer {{tokenAdmin}}
```

**Assertions**: Status `200`.

---

## PASSO 31 — Top Artesãos (Admin)

```
GET /api/v1/admin/relatorios/top-artesaos?limite=5
Authorization: Bearer {{tokenAdmin}}
```

**Assertions**: Status `200`. Resposta é uma lista.

---

## PASSO 32 — Verificar Artesão (Admin)

```
PUT /api/v1/admin/artesaos/1/verificar
Authorization: Bearer {{tokenAdmin}}
```

**Assertions**: Status `200`.

---

## PASSO 33 — Cotação de Frete (Artesão ou Comprador)

```
POST /api/v1/logistica/cotacao
Content-Type: application/json
Authorization: Bearer {{tokenArtesao}}

{
  "cepOrigem": "50030230",
  "cepDestino": "01001000",
  "peso": 1.2,
  "altura": 30,
  "largura": 15,
  "comprimento": 15
}
```

**Assertions**: Aceitar `200` (lista de opções de frete) OU `500` (Melhor Envio offline no sandbox). Ambos são comportamentos válidos.

---

## PASSO 34 — Webhook Mercado Pago (Público)

```
POST /api/v1/webhooks/mercadopago?type=payment&data.id=12345678
Content-Type: application/json
(sem Authorization — rota pública)

{}
```

**Assertions**: Status `200` (sempre retorna 200, mesmo se o pagamento não existir internamente).

---

## PASSO 35 — Trocar Senha (Artesão autenticado)

```
POST /api/v1/auth/trocar-senha
Content-Type: application/json
Authorization: Bearer {{tokenArtesao}}

{
  "senhaAtual": "Senha@123",
  "novaSenha": "NovaSenha@456"
}
```

**Assertions**: Status `200`.

**AÇÃO PÓS**: Fazer login novamente com a nova senha para obter novo token:
```
POST /api/v1/auth/artesao/login
{ "email": "artesao_teste@email.com", "senha": "NovaSenha@456" }
```

---

## PASSO 36 — Redefinir Senha (via PIN)

**NOTA**: Este é um fluxo de 2 etapas. A 1ª envia PIN por e-mail real (Mailtrap).

Etapa 1 — Solicitar PIN:
```
POST /api/v1/auth/esqueci-senha
Content-Type: application/json
(sem Authorization)

{
  "email": "artesao_teste@email.com"
}
```

**Assertions**: Status `200` (sempre retorna 200, por segurança).

Etapa 2 — Redefinir com PIN:
**NOTA**: O PIN é enviado por e-mail real. Em ambiente de teste sandbox sem acesso ao Mailtrap, este teste deve ser marcado como SKIP. Não há como simular o PIN.

---

## TESTES DE CENÁRIOS DE ERRO

### Acesso Sem Token → espera 403

```
GET /api/v1/carrinho
(sem Authorization)
```

**Assertions**: Status `403` (Spring Security retorna 403, NÃO 401).

### Artesão Acessa Rota de Admin → espera 403

```
GET /api/v1/admin/dashboard
Authorization: Bearer {{tokenArtesao}}
```

**Assertions**: Status `403`.

### Produto Inexistente → espera 404

```
GET /api/v1/produtos/999999
(sem Authorization — rota GET pública)
```

**Assertions**: Status `404`.

### Produto Campos Inválidos → espera 400

```
POST /api/v1/produtos
Content-Type: application/json
Authorization: Bearer {{tokenArtesao}}

{
  "nome": "",
  "preco": -10
}
```

**Assertions**: Status `400` (Spring @Valid retorna 400, NÃO 422).

---

## RESUMO DE STATUS CODES DA API

| Cenário | Status Real |
|---|---|
| Criação com sucesso | `201` |
| Operação com sucesso | `200` |
| Recurso já existe | `409` |
| Validação falhou (@Valid) | `400` |
| Sem token / token inválido | `403` |
| Token válido, sem permissão | `403` |
| Recurso não encontrado | `404` |

**NOTA**: Esta API retorna `403` (não `401`) quando não há token. Isso é comportamento padrão do Spring Security. NÃO espere `401` em nenhum cenário, exceto credenciais erradas no login.

---

## CAMPOS CRÍTICOS — NOMES CORRETOS DOS DTOs

| DTO | Campos CORRETOS | Campos ERRADOS (não usar) |
|---|---|---|
| PromocaoRequest | `emPromocao`, `percentualDesconto` | ~~precoPromocional~~, ~~ativo~~ |
| NovaEncomendaRequest | `artesaoId`, `observacoesCliente`, `produtoReferenciaId` | ~~descricao~~, ~~orcamentoMaximo~~ |
| ContrapropostaRequest | `precoProposto`, `tempoProducaoDias` | ~~valorProposto~~, ~~prazoEstimadoDias~~ |
| CotacaoFreteRequest | `cepOrigem`, `cepDestino`, `peso`, `altura`, `largura`, `comprimento` | ~~cep_origem~~ (sem snake_case) |
| ItemCarrinhoRequest | `produtoId`, `quantidade` | — |
| TrocarSenhaRequest | `senhaAtual`, `novaSenha` | ~~senhaAntiga~~ |
| ProdutoRequest | `nome`, `descricao`, `preco`, `categoriaId` | `quantidadeEstoque` NÃO existe |

---

## CHECKLIST FINAL

- [ ] Todos os 3 logins executaram ANTES dos requests autenticados
- [ ] Os tokens foram salvos em variáveis e reutilizados
- [ ] IDs dinâmicos (produtoId, encomendaId, pedidoId) foram salvos dos responses anteriores
- [ ] Criações que podem conflitar aceitam `201 ou 409`
- [ ] Nenhum request espera `401` (exceto login com senha errada)
- [ ] Nenhum request espera `422` (API retorna `400`)
- [ ] Upload de imagem usa `multipart/form-data` com campo `"arquivo"`
- [ ] Checkout (`POST /pedidos/checkout`) NÃO tem body
- [ ] Webhook é público e SEMPRE retorna `200`
- [ ] Redefinir senha via PIN é SKIP (precisa de acesso ao e-mail real)
