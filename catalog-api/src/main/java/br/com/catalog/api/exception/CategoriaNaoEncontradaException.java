package br.com.catalog.api.exception;

public class CategoriaNaoEncontradaException extends RuntimeException {

    public CategoriaNaoEncontradaException() {
        super("Categoria não encontrada.");
    }

    public CategoriaNaoEncontradaException(Long id) {
        super("Categoria não encontrada com ID: " + id);
    }
}
