package br.com.catalog.api.exception;

/** 404. Usada também quando o recurso existe mas é de outro usuário, para não revelar o ID. */
public class RecursoNaoEncontradoException extends RuntimeException {

    public RecursoNaoEncontradoException(String message) {
        super(message);
    }
}
