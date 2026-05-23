# Plano de Implementação — Saldo em Espera (Escrow)

**Escopo:** Reter o valor das encomendas até confirmação de entrega. Novo fluxo de estados na encomenda, lógica de liberação automática e UI financeira com dois blocos de saldo.

**Base:** [Prompt -02.md](file:///c:/Users/Pczão/Desktop/cata-log-platform/Prompts/Prompt%20-02.md)

---

## Análise do Estado Atual

### StatusEncomenda (enum existente)

```
AGUARDANDO_ARTESAO → AGUARDANDO_COMPRADOR → PRECO_ACORDADO
                                              ↘ CANCELADO_ESTORNO_TOTAL
                                              ↘ CANCELADO_COM_TAXA
```

**Faltam:** `EM_PRODUCAO`, `ENVIADO`, `ENTREGUE` — necessários para o fluxo de escrow.

### Modelo Artesao

Já possui `saldo_rendimentos` (`BigDecimal`, default `ZERO`) — será usado como **saldo disponível**.

### Modelo EncomendaPersonalizada

Já possui `valor_retido` (`BigDecimal`) — campo de escrow já mapeado no JPA. Precisa verificar se a coluna existe no banco (migration).

### FinanceiroArtesaoResponse (DTO)

Já possui `saldoDisponivel`. **Falta:** `saldoEmEspera`.

### Flutter FinanceiroResponse (model)

Possui `saldoDisponivel`. **Falta:** `saldoEmEspera`.

### Flutter FinanceiroTab (UI)

Card de saldo único ("Saldo disponível"). **Falta:** segundo bloco "Saldo em espera".

---

## Ficheiros Impactados

| Ficheiro | Ação | Camada |
|:---|:---|:---|
| `db/migration/V22__add_escrow_status_and_column.sql` | **NEW** | Database |
| [StatusEncomenda.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/model/enums/StatusEncomenda.java) | MODIFY | Backend — Enum |
| [EncomendaRepository.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/repository/EncomendaRepository.java) | MODIFY | Backend — Repository |
| [EncomendaService.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/service/EncomendaService.java) | MODIFY | Backend — Service |
| [FinanceiroArtesaoService.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/service/FinanceiroArtesaoService.java) | MODIFY | Backend — Service |
| [FinanceiroArtesaoResponse.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/dto/FinanceiroArtesaoResponse.java) | MODIFY | Backend — DTO |
| [EncomendaController.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/controller/EncomendaController.java) | MODIFY | Backend — Controller |
| [financeiro_response.dart](file:///c:/Users/Pczão/Desktop/cata-log-platform/cata-log-platform-mobile/lib/models/financeiro_response.dart) | MODIFY | Mobile — Model |
| [financeiro_provider.dart](file:///c:/Users/Pczão/Desktop/cata-log-platform/cata-log-platform-mobile/lib/providers/financeiro_provider.dart) | MODIFY | Mobile — Provider |
| [financeiro_tab.dart](file:///c:/Users/Pczão/Desktop/cata-log-platform/cata-log-platform-mobile/lib/screens/tabs/financeiro_tab.dart) | MODIFY | Mobile — UI |

---

## Etapas de Implementação

### Etapa 1 — Migration Flyway (Database)

**Ficheiro:** `db/migration/V22__add_escrow_status_and_column.sql` — **NOVO**

O campo `valor_retido` já existe na entity JPA (`EncomendaPersonalizada.java`, L57). Precisa garantir que a coluna existe no banco. Verificar a migration V7 (create encomenda):

```sql
-- Adicionar coluna valor_retido se não existir (pode já existir pela V11)
ALTER TABLE tb_encomenda_personalizada
    ADD COLUMN IF NOT EXISTS valor_retido NUMERIC(10,2) DEFAULT 0;
```

> Os novos valores do enum (`EM_PRODUCAO`, `ENVIADO`, `ENTREGUE`) não precisam de migration — o campo `status` é `VARCHAR(50)` com `@Enumerated(EnumType.STRING)`.

---

### Etapa 2 — StatusEncomenda (Enum)

**Ficheiro:** [StatusEncomenda.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/model/enums/StatusEncomenda.java)

Adicionar 3 novos estados **após** `PRECO_ACORDADO`, **antes** dos cancelamentos:

```java
public enum StatusEncomenda {
    AGUARDANDO_ARTESAO,
    AGUARDANDO_COMPRADOR,
    PRECO_ACORDADO,

    /** Artesão iniciou a produção. Valor retido em escrow. */
    EM_PRODUCAO,

    /** Peça enviada ao comprador. Aguardando confirmação de entrega. */
    ENVIADO,

    /** Entrega confirmada. Valor liberado para saldo disponível do artesão. */
    ENTREGUE,

    CANCELADO_ESTORNO_TOTAL,
    CANCELADO_COM_TAXA
}
```

**Novo fluxo completo:**

```
AGUARDANDO_ARTESAO → AGUARDANDO_COMPRADOR → PRECO_ACORDADO → EM_PRODUCAO → ENVIADO → ENTREGUE
```

---

### Etapa 3 — EncomendaService (Transições de Estado + Escrow)

**Ficheiro:** [EncomendaService.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/service/EncomendaService.java)

**3.1 — Modificar `aceitarEncomenda`** (L89-L110):

Quando o comprador aceita (`PRECO_ACORDADO`), **reter o valor** no campo `valor_retido`:

```java
encomenda.setStatus(StatusEncomenda.PRECO_ACORDADO);
encomenda.setValorRetido(encomenda.getPrecoProposto());
encomenda.setDataAceite(LocalDateTime.now());
```

**3.2 — Novo método `iniciarProducao`:**

```java
@Transactional
public EncomendaResponse iniciarProducao(Long encomendaId) {
    Long artesaoId = securityUtils.getUsuarioLogadoId();
    EncomendaPersonalizada encomenda = buscarEncomenda(encomendaId);

    validarOwnershipArtesao(encomenda, artesaoId);
    validarTransicao(encomenda, StatusEncomenda.PRECO_ACORDADO, "EM_PRODUCAO");

    encomenda.setStatus(StatusEncomenda.EM_PRODUCAO);
    return toResponse(encomendaRepository.save(encomenda));
}
```

**3.3 — Novo método `marcarEnviado`:**

```java
@Transactional
public EncomendaResponse marcarEnviado(Long encomendaId) {
    Long artesaoId = securityUtils.getUsuarioLogadoId();
    EncomendaPersonalizada encomenda = buscarEncomenda(encomendaId);

    validarOwnershipArtesao(encomenda, artesaoId);
    validarTransicao(encomenda, StatusEncomenda.EM_PRODUCAO, "ENVIADO");

    encomenda.setStatus(StatusEncomenda.ENVIADO);
    return toResponse(encomendaRepository.save(encomenda));
}
```

**3.4 — Novo método `confirmarEntrega`:**

Rota protegida — **apenas ADMIN** pode confirmar entrega (requisito RN do prompt).

```java
@Transactional
public EncomendaResponse confirmarEntrega(Long encomendaId) {
    EncomendaPersonalizada encomenda = buscarEncomenda(encomendaId);
    validarTransicao(encomenda, StatusEncomenda.ENVIADO, "ENTREGUE");

    encomenda.setStatus(StatusEncomenda.ENTREGUE);

    // Liberar escrow → saldo disponível
    BigDecimal valorRetido = encomenda.getValorRetido();
    if (valorRetido != null && valorRetido.compareTo(BigDecimal.ZERO) > 0) {
        Artesao artesao = encomenda.getArtesao();
        BigDecimal saldoAtual = artesao.getSaldoRendimentos() != null
                ? artesao.getSaldoRendimentos() : BigDecimal.ZERO;
        artesao.setSaldoRendimentos(saldoAtual.add(valorRetido));
        artesaoRepository.save(artesao);
        encomenda.setValorRetido(BigDecimal.ZERO);
    }

    return toResponse(encomendaRepository.save(encomenda));
}
```

**3.5 — Métodos auxiliares privados:**

```java
private void validarOwnershipArtesao(EncomendaPersonalizada encomenda, Long artesaoId) {
    if (!encomenda.getArtesao().getId().equals(artesaoId)) {
        throw new SecurityException("Você não tem permissão para alterar esta encomenda.");
    }
}

private void validarTransicao(EncomendaPersonalizada encomenda, StatusEncomenda esperado, String destino) {
    if (encomenda.getStatus() != esperado) {
        throw new EstadoEncomendaInvalidoException(
                "Transição para " + destino + " requer status " + esperado + ". Atual: " + encomenda.getStatus());
    }
}
```

**Injeção adicional necessária:** `ArtesaoRepository` (para persistir saldo ao liberar escrow).

---

### Etapa 4 — EncomendaController (Novos Endpoints)

**Ficheiro:** [EncomendaController.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/controller/EncomendaController.java)

Adicionar 3 endpoints:

```java
@PutMapping("/{id}/producao")
@PreAuthorize("hasAuthority('ARTESAO')")
public ResponseEntity<EncomendaResponse> iniciarProducao(@PathVariable Long id) {
    return ResponseEntity.ok(encomendaService.iniciarProducao(id));
}

@PutMapping("/{id}/enviar")
@PreAuthorize("hasAuthority('ARTESAO')")
public ResponseEntity<EncomendaResponse> marcarEnviado(@PathVariable Long id) {
    return ResponseEntity.ok(encomendaService.marcarEnviado(id));
}

@PutMapping("/{id}/entregue")
@PreAuthorize("hasAuthority('ADMIN')")
public ResponseEntity<EncomendaResponse> confirmarEntrega(@PathVariable Long id) {
    return ResponseEntity.ok(encomendaService.confirmarEntrega(id));
}
```

> **Decisão:** `PUT /{id}/entregue` restrito a `ADMIN` conforme regra de negócio do prompt — "evento seguro via admin ou webhook de transportadora".

---

### Etapa 5 — EncomendaRepository (Query de Escrow)

**Ficheiro:** [EncomendaRepository.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/repository/EncomendaRepository.java)

Adicionar query para somar `valor_retido` de encomendas ativas do artesão:

```java
@Query("SELECT COALESCE(SUM(e.valorRetido), 0) FROM EncomendaPersonalizada e " +
       "WHERE e.artesao.id = :artesaoId " +
       "AND e.status IN (br.com.catalog.api.model.enums.StatusEncomenda.PRECO_ACORDADO, " +
       "br.com.catalog.api.model.enums.StatusEncomenda.EM_PRODUCAO, " +
       "br.com.catalog.api.model.enums.StatusEncomenda.ENVIADO)")
BigDecimal sumValorRetidoByArtesaoId(@Param("artesaoId") Long artesaoId);
```

---

### Etapa 6 — FinanceiroArtesaoResponse (DTO)

**Ficheiro:** [FinanceiroArtesaoResponse.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/dto/FinanceiroArtesaoResponse.java)

Adicionar campo `saldoEmEspera` (L20-L21):

```java
private BigDecimal saldoDisponivel;
private BigDecimal saldoEmEspera;
private List<MovimentacaoResponse> movimentacoes;
```

---

### Etapa 7 — FinanceiroArtesaoService (Calcular Escrow)

**Ficheiro:** [FinanceiroArtesaoService.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/service/FinanceiroArtesaoService.java)

**7.1 — Adicionar cálculo do saldo em espera** no método `calcularFinanceiro()` (antes do `return`, ~L142):

```java
BigDecimal saldoEmEspera = encomendaRepository.sumValorRetidoByArtesaoId(artesaoId);
```

**7.2 — Incluir no builder** (L142-L149):

```java
return FinanceiroArtesaoResponse.builder()
        .faturamentoMes(faturamentoMes)
        .faturamentoMesAnterior(faturamentoMesAnterior)
        .totalVendasMes(totalVendasMes)
        .saldoDisponivel(artesao.getSaldoRendimentos() != null
                ? artesao.getSaldoRendimentos() : BigDecimal.ZERO)
        .saldoEmEspera(saldoEmEspera)
        .movimentacoes(movimentacoes)
        .build();
```

---

### Etapa 8 — Flutter: Model (financeiro_response.dart)

**Ficheiro:** [financeiro_response.dart](file:///c:/Users/Pczão/Desktop/cata-log-platform/cata-log-platform-mobile/lib/models/financeiro_response.dart)

Adicionar campo `saldoEmEspera`:

```dart
class FinanceiroResponse {
  final double faturamentoMes;
  final double faturamentoMesAnterior;
  final int totalVendasMes;
  final double saldoDisponivel;
  final double saldoEmEspera;          // ← NOVO
  final List<MovimentacaoResponse> movimentacoes;

  FinanceiroResponse({
    required this.faturamentoMes,
    required this.faturamentoMesAnterior,
    required this.totalVendasMes,
    required this.saldoDisponivel,
    required this.saldoEmEspera,        // ← NOVO
    required this.movimentacoes,
  });

  factory FinanceiroResponse.fromJson(Map<String, dynamic> json) {
    return FinanceiroResponse(
      // ... campos existentes ...
      saldoEmEspera: (json['saldoEmEspera'] as num?)?.toDouble() ?? 0,  // ← NOVO
      // ...
    );
  }
}
```

---

### Etapa 9 — Flutter: Provider (financeiro_provider.dart)

**Ficheiro:** [financeiro_provider.dart](file:///c:/Users/Pczão/Desktop/cata-log-platform/cata-log-platform-mobile/lib/providers/financeiro_provider.dart)

Sem alterações estruturais necessárias — o `FinanceiroProvider` já carrega `FinanceiroResponse` via `carregarFinanceiro()`. O novo campo `saldoEmEspera` é acessado via `provider.financeiro!.saldoEmEspera` na UI.

O provider já suporta:
- ✅ Loading state (`isLoading`)
- ✅ Error handling (`errorMessage`)
- ✅ Pull-to-refresh (`carregarFinanceiro()` já é chamado no `RefreshIndicator`)

---

### Etapa 10 — Flutter: UI (financeiro_tab.dart)

**Ficheiro:** [financeiro_tab.dart](file:///c:/Users/Pczão/Desktop/cata-log-platform/cata-log-platform-mobile/lib/screens/tabs/financeiro_tab.dart)

**Substituir o card de saldo único** (L210-L273) por dois cards lado a lado:

```
┌─────────────────────────────────────────────┐
│  Saldo Disponível  │   Saldo em Espera      │
│  R$ 1.250,00       │   R$ 450,00            │
│  ✓ Pronto p/ saque │   ⏳ Retido até entrega │
└─────────────────────────────────────────────┘
```

**Design:**
- **Saldo Disponível:** Fundo branco, ícone `account_balance_wallet`, cor `AppColors.tertiary` (destaque principal).
- **Saldo em Espera:** Fundo cinza suave, ícone `hourglass_empty`, cor `AppColors.onSurfaceVariant`, com `Tooltip` explicando: *"Valor retido até a entrega da encomenda"*.
- Layout: `Row` com dois `Expanded` widgets, separados por `SizedBox(width: 12)`.

---

## Novos Endpoints na API

| Method | Endpoint | Auth | Description |
|:---|:---|:---|:---|
| `PUT` | `/api/v1/encomendas/{id}/producao` | ARTESAO | Iniciar produção da encomenda |
| `PUT` | `/api/v1/encomendas/{id}/enviar` | ARTESAO | Marcar encomenda como enviada |
| `PUT` | `/api/v1/encomendas/{id}/entregue` | ADMIN | Confirmar entrega e liberar escrow |

---

## Fluxo Completo do Escrow

```
1. Comprador cria encomenda          → AGUARDANDO_ARTESAO
2. Artesão envia contraproposta      → AGUARDANDO_COMPRADOR (precoProposto definido)
3. Comprador aceita                  → PRECO_ACORDADO (valorRetido = precoProposto)
4. Artesão inicia produção           → EM_PRODUCAO
5. Artesão marca como enviado        → ENVIADO
6. Admin confirma entrega            → ENTREGUE
   └─ valorRetido transferido para artesao.saldoRendimentos
   └─ encomenda.valorRetido zerado
```

---

## Contrato do DTO Financeiro (Atualizado)

```json
{
  "faturamentoMes": 2500.00,
  "faturamentoMesAnterior": 1800.00,
  "totalVendasMes": 5,
  "saldoDisponivel": 1250.00,
  "saldoEmEspera": 450.00,
  "movimentacoes": [
    {
      "tipo": "VENDA",
      "descricao": "Cerâmica Artesanal",
      "detalhe": "Venda direta",
      "valor": 150.00,
      "data": "23 Mai"
    }
  ]
}
```

---

## Ordem de Execução

```
1. V22__add_escrow_status_and_column.sql  → Garantir coluna valor_retido
2. StatusEncomenda.java                   → Novos estados
3. EncomendaRepository.java              → Query sumValorRetido
4. EncomendaService.java                 → Transições + liberação escrow
5. EncomendaController.java              → 3 novos endpoints
6. FinanceiroArtesaoResponse.java        → Campo saldoEmEspera
7. FinanceiroArtesaoService.java         → Calcular escrow
8. financeiro_response.dart              → Campo saldoEmEspera
9. financeiro_tab.dart                   → UI dois cards de saldo
```

---

## Verificação

| Teste | Método |
|:---|:---|
| Migration roda | Startup da API sem erro Flyway |
| Compilação backend | `mvnw.cmd compile` sem erros |
| Fluxo completo | Criar encomenda → contraproposta → aceitar → produção → enviar → entregue |
| Escrow retém valor | Após aceitar: `valorRetido > 0`, `saldoRendimentos` inalterado |
| Escrow libera valor | Após entregue: `valorRetido = 0`, `saldoRendimentos += valor` |
| API financeira | `GET /artesaos/me/financeiro` retorna `saldoEmEspera` > 0 com encomendas ativas |
| Flutter model | `FinanceiroResponse.fromJson` parseia `saldoEmEspera` |
| Flutter UI | FinanceiroTab exibe dois cards de saldo com valores corretos |
| Pull-to-refresh | Arrastar para baixo recarrega dados financeiros |
| Permissão entrega | `PUT /entregue` com token ARTESAO retorna 403 |
