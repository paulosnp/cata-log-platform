package br.com.catalog.api.exception;

public class EmailJaCadastradoException extends RuntimeException {

    public EmailJaCadastradoException() {
        super("E-mail já cadastrado na plataforma.");
    }

    public EmailJaCadastradoException(String message) {
        super(message);
    }
}
