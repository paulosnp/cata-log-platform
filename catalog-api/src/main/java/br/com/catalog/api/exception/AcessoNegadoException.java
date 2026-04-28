package br.com.catalog.api.exception;

public class AcessoNegadoException extends RuntimeException {

    public AcessoNegadoException() {
        super("Você não tem permissão para acessar este recurso.");
    }

    public AcessoNegadoException(String message) {
        super(message);
    }
}
