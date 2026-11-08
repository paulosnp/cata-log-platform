package br.com.catalog.api;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

/** A API não pode subir sem JWT_SECRET (sem default versionado) nem com segredo vazio. */
class JwtSecretObrigatorioTest {

    private static final String PERFIL = "--spring.profiles.active=test";
    private static final String DB = "--spring.datasource.url=jdbc:h2:mem:jwt-boot;MODE=PostgreSQL";
    private static final String PORTA = "--server.port=0";

    @Test
    void naoSobeSemJwtSecret() {
        assumeTrue(System.getenv("JWT_SECRET") == null, "JWT_SECRET definido no ambiente do teste");

        assertThatThrownBy(() -> SpringApplication.run(CatalogApiApplication.class, PERFIL, DB, PORTA))
                .hasStackTraceContaining("JWT_SECRET");
    }

    @Test
    void naoSobeComJwtSecretVazio() {
        assertThatThrownBy(() -> SpringApplication.run(CatalogApiApplication.class, PERFIL, DB, PORTA, "--jwt.secret="))
                .hasStackTraceContaining("validarSegredo");
    }
}
