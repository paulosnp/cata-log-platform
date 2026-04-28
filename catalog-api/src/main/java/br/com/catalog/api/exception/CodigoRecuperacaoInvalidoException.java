package br.com.catalog.api.exception;

public class CodigoRecuperacaoInvalidoException extends RuntimeException {

    public CodigoRecuperacaoInvalidoException() {
        super("Código de recuperação inválido ou expirado.");
    }

    public CodigoRecuperacaoInvalidoException(String message) {
        super(message);
    }
}
