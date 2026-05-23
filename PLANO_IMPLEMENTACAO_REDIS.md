# Plano de Implementação — Redis (JWT Blacklist + Cache Vitrine)

**Escopo:** Introduzir Redis no Cata Log para resolver dois problemas estruturais — invalidação de tokens JWT após logout e cache das queries públicas da vitrine.

**Base:** [Prompt - 01.md](file:///c:/Users/Pczão/Desktop/cata-log-platform/Prompts/Prompt%20-%2001.md)

---

## Análise dos Ficheiros Impactados

| Ficheiro | Ação | Impacto |
|:---|:---|:---|
| [docker-compose.yml](file:///c:/Users/Pczão/Desktop/cata-log-platform/docker-compose.yml) | MODIFY | Adicionar serviço `redis` |
| [pom.xml](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/pom.xml) | MODIFY | Adicionar `spring-boot-starter-data-redis` |
| [application.properties](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/resources/application.properties) | MODIFY | Adicionar configurações de conexão Redis |
| [CatalogApiApplication.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/CatalogApiApplication.java) | MODIFY | Adicionar `@EnableCaching` |
| `config/RedisConfig.java` | **NEW** | `RedisTemplate<String, String>` + `CacheManager` |
| `service/TokenBlacklistService.java` | **NEW** | Guardar token no Redis com TTL = tempo restante do JWT |
| [JwtService.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/security/JwtService.java) | MODIFY | Expor método `getExpirationMillis(token)` para cálculo do TTL |
| [JwtAuthenticationFilter.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/security/JwtAuthenticationFilter.java) | MODIFY | Verificar blacklist antes de autenticar |
| [AuthController.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/controller/AuthController.java) | MODIFY | Adicionar endpoint `POST /api/v1/auth/logout` |
| [SecurityConfig.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/security/SecurityConfig.java) | MODIFY | Permitir rota `/api/v1/auth/logout` (já coberta por `/api/v1/auth/**`) |
| [ProdutoService.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/service/ProdutoService.java) | MODIFY | `@Cacheable` nas leituras + `@CacheEvict` nas escritas |
| [.env.example](file:///c:/Users/Pczão/Desktop/cata-log-platform/.env.example) | MODIFY | Documentar variáveis Redis |

---

## Etapas de Implementação

### Etapa 1 — Infraestrutura Docker

**Ficheiro:** `docker-compose.yml`

Adicionar serviço Redis **antes** do serviço `catalog-api`:

```yaml
  redis:
    image: redis:alpine
    container_name: catalog-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    networks:
      - catalog-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
```

Atualizar `catalog-api.depends_on` para incluir:

```yaml
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
```

Atualizar `catalog-api.environment` para incluir:

```yaml
      REDIS_HOST: redis
      REDIS_PORT: 6379
```

---

### Etapa 2 — Dependência Maven

**Ficheiro:** `pom.xml`

Adicionar após a dependência `spring-boot-starter-validation` (linha 43):

```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-redis</artifactId>
        </dependency>
```

> `spring-boot-starter-data-redis` já inclui Lettuce como client padrão. `commons-pool2` não é necessário a menos que se configure pool de conexões (não é o caso para este volume).

---

### Etapa 3 — Configuração de Conexão

**Ficheiro:** `application.properties`

Adicionar bloco Redis após as configurações JWT (linha 29):

```properties
# Redis
spring.data.redis.host=${REDIS_HOST:localhost}
spring.data.redis.port=${REDIS_PORT:6379}
spring.cache.type=redis
spring.cache.redis.time-to-live=300000
```

- `time-to-live=300000` → TTL padrão do cache = 5 minutos para entradas da vitrine.
- Host/port configuráveis via env vars para funcionar tanto em local quanto em Docker.

---

### Etapa 4 — Classe de Configuração Redis

**Ficheiro:** `config/RedisConfig.java` — **NOVO**

```java
package br.com.catalog.api.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@EnableCaching
public class RedisConfig {

    @Bean
    public RedisTemplate<String, String> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, String> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);
        template.setKeySerializer(new StringRedisSerializer());
        template.setValueSerializer(new StringRedisSerializer());
        return template;
    }
}
```

> `@EnableCaching` fica nesta classe de configuração, **não** na `CatalogApiApplication` — mantém separação de responsabilidades. A `CatalogApiApplication.java` **não será alterada**.

---

### Etapa 5 — TokenBlacklistService

**Ficheiro:** `service/TokenBlacklistService.java` — **NOVO**

```java
package br.com.catalog.api.service;

import br.com.catalog.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "bl:";

    private final RedisTemplate<String, String> redisTemplate;
    private final JwtService jwtService;

    public void blacklist(String token) {
        long ttlMillis = jwtService.getRemainingExpirationMillis(token);
        if (ttlMillis <= 0) return;
        redisTemplate.opsForValue()
                .set(BLACKLIST_PREFIX + token, "1", ttlMillis, TimeUnit.MILLISECONDS);
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(BLACKLIST_PREFIX + token));
    }
}
```

**Design:**
- Prefixo `bl:` evita colisões de chave com outros usos futuros do Redis.
- TTL = tempo restante do JWT → após expiração natural, a chave é auto-removida pelo Redis.
- Tokens já expirados são ignorados (`ttlMillis <= 0`).

---

### Etapa 6 — Expor TTL no JwtService

**Ficheiro:** [JwtService.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/security/JwtService.java)

Adicionar método público (após `isTokenValid`, ~linha 72):

```java
    public long getRemainingExpirationMillis(String token) {
        Date expiration = extractClaim(token, Claims::getExpiration);
        return expiration.getTime() - System.currentTimeMillis();
    }
```

---

### Etapa 7 — Verificação de Blacklist no Filter

**Ficheiro:** [JwtAuthenticationFilter.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/security/JwtAuthenticationFilter.java)

**Alterações:**

1. Injetar `TokenBlacklistService` via construtor (Lombok `@RequiredArgsConstructor` já cobre):

```java
    private final JwtService jwtService;
    private final TokenBlacklistService tokenBlacklistService;
```

2. Alterar a condição na linha 44 para incluir verificação de blacklist:

```java
        if (jwtService.isTokenValid(token)
                && !tokenBlacklistService.isBlacklisted(token)
                && SecurityContextHolder.getContext().getAuthentication() == null) {
```

**Resultado:** Token na blacklist → filtro não autentica → Spring Security retorna 401.

---

### Etapa 8 — Endpoint de Logout

**Ficheiro:** [AuthController.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/controller/AuthController.java)

Adicionar:

```java
    private final TokenBlacklistService tokenBlacklistService;
```

E o endpoint:

```java
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            tokenBlacklistService.blacklist(authHeader.substring(7));
        }
        return ResponseEntity.ok(Map.of("mensagem", "Logout realizado com sucesso."));
    }
```

> A rota `/api/v1/auth/logout` já está coberta pelo `permitAll()` em `/api/v1/auth/**` no [SecurityConfig.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/security/SecurityConfig.java#L41). Mas semanticamente deveria ser **autenticada** — o logout só faz sentido com um token válido. Decisão abaixo.

> **Decisão técnica:** O endpoint de logout precisa do token para invalidá-lo. Duas opções:
> 1. Manter como `permitAll()` (coberto pelo wildcard existente) — funciona, mas aceita requests sem token.
> 2. Tornar a rota autenticada excluindo-a do wildcard.
>
> **Recomendação:** Manter `permitAll()` e tratar graciosamente a ausência do header (já feito no código acima). Alterar o wildcard para excluir logout seria uma mudança desnecessária na SecurityConfig.

---

### Etapa 9 — Cache da Vitrine

**Ficheiro:** [ProdutoService.java](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/service/ProdutoService.java)

**9.1 — `@Cacheable` nas leituras públicas:**

| Método | Linha | Anotação |
|:---|:---|:---|
| `listarVitrine` | 49 | `@Cacheable(value = "produtosVitrine", key = "'list:' + #pageable.pageNumber + ':' + #pageable.pageSize + ':' + #pageable.sort")` |
| `buscarVitrine` | 55 | `@Cacheable(value = "produtosVitrine", key = "'search:' + #termo + ':' + #categoriaId + ':' + #precoMin + ':' + #precoMax + ':' + #emPromocao + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")` |
| `listarVitrinePorCategoria` | 81 | `@Cacheable(value = "produtosVitrine", key = "'cat:' + #categoriaId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")` |

**9.2 — `@CacheEvict` nas escritas que alteram o catálogo:**

| Método | Linha | Anotação |
|:---|:---|:---|
| `criarProduto` | 102 | `@CacheEvict(value = "produtosVitrine", allEntries = true)` |
| `atualizarProduto` | 131 | `@CacheEvict(value = "produtosVitrine", allEntries = true)` |
| `deletarProduto` | 155 | `@CacheEvict(value = "produtosVitrine", allEntries = true)` |
| `aplicarPromocao` | 163 | `@CacheEvict(value = "produtosVitrine", allEntries = true)` |
| `marcarVendido` | 183 | `@CacheEvict(value = "produtosVitrine", allEntries = true)` |
| `uploadImagem` | 198 | `@CacheEvict(value = "produtosVitrine", allEntries = true)` |
| `removerImagem` | 223 | `@CacheEvict(value = "produtosVitrine", allEntries = true)` |

> **Nota:** `ProdutoResponse` precisa implementar `Serializable` para ser armazenado no Redis. `Page` do Spring já é serializable.

**9.3 — Serialização:**

O DTO [ProdutoResponse](file:///c:/Users/Pczão/Desktop/cata-log-platform/catalog-api/src/main/java/br/com/catalog/api/dto/ProdutoResponse.java) precisa implementar `java.io.Serializable`. Verificar se já implementa; caso contrário, adicionar.

---

### Etapa 10 — Variáveis de Ambiente

**Ficheiro:** `.env.example`

Adicionar:

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Ficheiro:** `.env`

Adicionar as mesmas variáveis com valores para ambiente local/produção.

---

## Ordem de Execução

```
1. docker-compose.yml  → Serviço Redis
2. pom.xml             → Dependência Maven
3. application.properties → Conexão Redis
4. RedisConfig.java    → Template + @EnableCaching
5. JwtService.java     → getRemainingExpirationMillis()
6. TokenBlacklistService.java → Blacklist com TTL
7. JwtAuthenticationFilter.java → Verificação blacklist
8. AuthController.java → POST /logout
9. ProdutoResponse.java → Serializable (se necessário)
10. ProdutoService.java → @Cacheable + @CacheEvict
11. .env / .env.example → Variáveis Redis
```

---

## Verificação

| Teste | Método |
|:---|:---|
| Redis sobe no Docker | `docker compose up redis` + `redis-cli ping` → `PONG` |
| API conecta ao Redis | Startup sem erros de conexão |
| Logout invalida token | `POST /auth/logout` → mesmo token retorna 401 em qualquer rota protegida |
| TTL correto | Verificar no Redis: `TTL bl:<token>` ≈ tempo restante do JWT |
| Cache funciona | Primeira chamada `/produtos/vitrine` → query SQL. Segunda → sem SQL (log `show-sql=true`) |
| Evict funciona | `POST /produtos` → query SQL na próxima consulta à vitrine |
| Compilação | `mvnw.cmd compile` sem erros |
