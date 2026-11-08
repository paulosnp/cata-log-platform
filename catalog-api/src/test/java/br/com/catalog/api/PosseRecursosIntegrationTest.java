package br.com.catalog.api;

import br.com.catalog.api.model.*;
import br.com.catalog.api.model.enums.StatusEntrega;
import br.com.catalog.api.repository.*;
import br.com.catalog.api.security.JwtService;
import br.com.catalog.api.service.TokenBlacklistService;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.preference.Preference;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedConstruction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * IDOR: GET /encomendas/{id}, POST /logistica/envio e POST /pagamentos/{pedidoId}.
 * Dono acessa; outro usuário do mesmo papel recebe 404 (igual a ID inexistente); ADMIN onde faz sentido.
 */
@SpringBootTest(properties = "jwt.secret=" + PosseRecursosIntegrationTest.SEGREDO_TESTE)
@ActiveProfiles("test")
@AutoConfigureMockMvc
class PosseRecursosIntegrationTest {

    static final String SEGREDO_TESTE = "segredo-somente-para-testes-com-mais-de-32-bytes-0123456789";
    private static final long ID_INEXISTENTE = 999_999L;

    @Autowired MockMvc mvc;
    @Autowired JwtService jwtService;
    @Autowired ArtesaoRepository artesaoRepository;
    @Autowired CompradorRepository compradorRepository;
    @Autowired CategoriaRepository categoriaRepository;
    @Autowired ProdutoRepository produtoRepository;
    @Autowired PedidoRepository pedidoRepository;
    @Autowired EncomendaRepository encomendaRepository;

    @MockBean RestTemplate restTemplate;                  // Melhor Envio
    @MockBean TokenBlacklistService tokenBlacklistService; // Redis

    Artesao artesao;
    Artesao outroArtesao;
    Comprador comprador;
    Comprador outroComprador;
    Pedido pedido;        // só itens de `artesao`
    Pedido pedidoMisto;   // itens de `artesao` e `outroArtesao`
    EncomendaPersonalizada encomenda;

    @BeforeEach
    void dados() {
        String s = UUID.randomUUID().toString().substring(0, 8);
        artesao = artesaoRepository.save(novoArtesao("a1-" + s));
        outroArtesao = artesaoRepository.save(novoArtesao("a2-" + s));
        comprador = compradorRepository.save(novoComprador("c1-" + s));
        outroComprador = compradorRepository.save(novoComprador("c2-" + s));

        Categoria categoria = categoriaRepository.save(Categoria.builder().nome("cat-" + s).build());
        Produto produto = produtoRepository.save(novoProduto(artesao, categoria));
        Produto produtoOutro = produtoRepository.save(novoProduto(outroArtesao, categoria));

        pedido = pedidoRepository.save(novoPedido(comprador, produto));
        pedidoMisto = pedidoRepository.save(novoPedido(comprador, produto, produtoOutro));
        encomenda = encomendaRepository.save(EncomendaPersonalizada.builder()
                .comprador(comprador).artesao(artesao).observacoesCliente("teste").build());
    }

    // ======================== GET /api/v1/encomendas/{id} ========================

    @Test
    void encomenda_compradorDono_200() throws Exception {
        buscarEncomenda(encomenda.getId(), tokenComprador(comprador))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(encomenda.getId().intValue()));
    }

    @Test
    void encomenda_artesaoDono_200() throws Exception {
        buscarEncomenda(encomenda.getId(), tokenArtesao(artesao)).andExpect(status().isOk());
    }

    @Test
    void encomenda_outroComprador_404() throws Exception {
        buscarEncomenda(encomenda.getId(), tokenComprador(outroComprador)).andExpect(status().isNotFound());
    }

    @Test
    void encomenda_outroArtesao_404() throws Exception {
        buscarEncomenda(encomenda.getId(), tokenArtesao(outroArtesao)).andExpect(status().isNotFound());
    }

    @Test
    void encomenda_admin_200() throws Exception {
        buscarEncomenda(encomenda.getId(), tokenAdmin()).andExpect(status().isOk());
    }

    @Test
    void encomenda_inexistente_404() throws Exception {
        buscarEncomenda(ID_INEXISTENTE, tokenComprador(comprador)).andExpect(status().isNotFound());
    }

    // ======================== POST /api/v1/logistica/envio ========================

    @Test
    void envio_artesaoDono_200_marcaEnviado() throws Exception {
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("{\"id\":\"ship-1\",\"url\":\"https://etiqueta.test\"}"));

        gerarEnvio(pedido.getId(), tokenArtesao(artesao))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ENVIADO"));

        assertThat(statusEntrega(pedido)).isEqualTo(StatusEntrega.ENVIADO);
    }

    @Test
    void envio_outroArtesao_404_naoAlteraPedido() throws Exception {
        gerarEnvio(pedido.getId(), tokenArtesao(outroArtesao)).andExpect(status().isNotFound());

        verifyNoInteractions(restTemplate);
        assertThat(statusEntrega(pedido)).isEqualTo(StatusEntrega.AGUARDANDO_ENVIO);
    }

    @Test
    void envio_inexistente_404() throws Exception {
        gerarEnvio(ID_INEXISTENTE, tokenArtesao(artesao)).andExpect(status().isNotFound());
    }

    @Test
    void envio_pedidoComItensDeOutroArtesao_409() throws Exception {
        gerarEnvio(pedidoMisto.getId(), tokenArtesao(artesao)).andExpect(status().isConflict());

        verifyNoInteractions(restTemplate);
        assertThat(statusEntrega(pedidoMisto)).isEqualTo(StatusEntrega.AGUARDANDO_ENVIO);
    }

    // ======================== POST /api/v1/pagamentos/{pedidoId} ========================

    @Test
    void pagamento_compradorDono_200() throws Exception {
        Preference preference = mock(Preference.class);
        when(preference.getInitPoint()).thenReturn("https://mp.test/checkout");

        try (MockedConstruction<PreferenceClient> ignored = mockConstruction(PreferenceClient.class,
                (client, ctx) -> when(client.create(any(PreferenceRequest.class))).thenReturn(preference))) {
            gerarPagamento(pedido.getId(), tokenComprador(comprador))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.paymentUrl").value("https://mp.test/checkout"));
        }
    }

    @Test
    void pagamento_outroComprador_404_semChamarMercadoPago() throws Exception {
        try (MockedConstruction<PreferenceClient> mp = mockConstruction(PreferenceClient.class)) {
            gerarPagamento(pedido.getId(), tokenComprador(outroComprador)).andExpect(status().isNotFound());
            assertThat(mp.constructed()).isEmpty();
        }
    }

    @Test
    void pagamento_inexistente_404() throws Exception {
        gerarPagamento(ID_INEXISTENTE, tokenComprador(comprador)).andExpect(status().isNotFound());
    }

    // ======================== helpers ========================

    private ResultActions buscarEncomenda(long id, String token) throws Exception {
        return mvc.perform(autenticado(get("/api/v1/encomendas/{id}", id), token));
    }

    private ResultActions gerarPagamento(long pedidoId, String token) throws Exception {
        return mvc.perform(autenticado(post("/api/v1/pagamentos/{id}", pedidoId), token));
    }

    private ResultActions gerarEnvio(long pedidoId, String token) throws Exception {
        String body = """
                {"pedidoId": %d, "servicoId": 1, "nomeDestinatario": "Fulano",
                 "enderecoDestinatario": "Rua A, 1", "cidadeDestinatario": "Recife",
                 "estadoDestinatario": "PE", "cepDestinatario": "50000-000",
                 "peso": 1.0, "altura": 10, "largura": 10, "comprimento": 10}
                """.formatted(pedidoId);
        return mvc.perform(autenticado(post("/api/v1/logistica/envio"), token)
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private MockHttpServletRequestBuilder autenticado(MockHttpServletRequestBuilder req, String token) {
        return req.header("Authorization", "Bearer " + token);
    }

    private String tokenArtesao(Artesao a) {
        return jwtService.generateToken(a.getEmail(), "ARTESAO", a.getId());
    }

    private String tokenComprador(Comprador c) {
        return jwtService.generateToken(c.getEmail(), "COMPRADOR", c.getId());
    }

    private String tokenAdmin() {
        return jwtService.generateToken("admin@teste.local", "ADMIN", 1L);
    }

    private StatusEntrega statusEntrega(Pedido p) {
        return pedidoRepository.findById(p.getId()).orElseThrow().getStatusEntrega();
    }

    private static Artesao novoArtesao(String nome) {
        return Artesao.builder().email(nome + "@teste.local").senha("x").nomeAtelie(nome)
                .cep("50000-000").cidade("Recife").estado("PE").build();
    }

    private static Comprador novoComprador(String nome) {
        return Comprador.builder().nome(nome).email(nome + "@teste.local").senha("x").build();
    }

    private static Produto novoProduto(Artesao a, Categoria c) {
        return Produto.builder().nome("produto").preco(BigDecimal.TEN).artesao(a).categoria(c).build();
    }

    private static Pedido novoPedido(Comprador c, Produto... produtos) {
        Pedido p = Pedido.builder().comprador(c).valorTotal(BigDecimal.TEN)
                .taxaPlataforma(BigDecimal.ONE).valorLiquidoArtesao(new BigDecimal("9")).build();
        for (Produto produto : produtos) {
            p.getItens().add(ItemPedido.builder().pedido(p).produto(produto)
                    .quantidade(1).precoUnitario(BigDecimal.TEN).build());
        }
        return p;
    }
}
