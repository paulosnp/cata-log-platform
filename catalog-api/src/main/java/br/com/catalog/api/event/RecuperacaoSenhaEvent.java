package br.com.catalog.api.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RecuperacaoSenhaEvent {

    private final String email;
    private final String pin;
}
