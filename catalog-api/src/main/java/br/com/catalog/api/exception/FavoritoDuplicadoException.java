package br.com.catalog.api.exception;

public class FavoritoDuplicadoException extends RuntimeException {

    public FavoritoDuplicadoException() {
        super("Este produto já está nos seus favoritos.");
    }
}
