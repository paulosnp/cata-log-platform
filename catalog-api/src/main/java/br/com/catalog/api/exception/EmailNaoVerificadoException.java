package br.com.catalog.api.exception;

public class EmailNaoVerificadoException extends RuntimeException {

    public EmailNaoVerificadoException() {
        super("E-mail pendente de verificação. Verifique sua caixa de entrada para ativar a conta.");
    }

    public EmailNaoVerificadoException(String message) {
        super(message);
    }
}
