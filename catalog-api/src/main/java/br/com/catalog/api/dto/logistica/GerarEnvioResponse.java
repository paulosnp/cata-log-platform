package br.com.catalog.api.dto.logistica;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GerarEnvioResponse {

    private String shipmentId;
    private String codigoRastreio;
    private String urlEtiqueta;
    private String status;
}
