package br.com.catalog.api.exception;

public class EstadoEncomendaInvalidoException extends RuntimeException {

    public EstadoEncomendaInvalidoException(String mensagem) {
        super(mensagem);
    }
}
