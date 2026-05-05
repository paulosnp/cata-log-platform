package br.com.catalog.api.dto.admin;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardResponse {

    private long totalArtesaos;
    private long totalCompradores;
    private long totalProdutos;
    private long totalPedidos;
}
