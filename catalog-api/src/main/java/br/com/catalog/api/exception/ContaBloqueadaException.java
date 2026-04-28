package br.com.catalog.api.exception;

public class ContaBloqueadaException extends RuntimeException {

    public ContaBloqueadaException() {
        super("Conta bloqueada pela administração.");
    }

    public ContaBloqueadaException(String message) {
        super(message);
    }
}
