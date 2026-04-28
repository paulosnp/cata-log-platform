package br.com.catalog.api.exception;

public class ProdutoNaoEncontradoException extends RuntimeException {

    public ProdutoNaoEncontradoException() {
        super("Produto não encontrado.");
    }

    public ProdutoNaoEncontradoException(Long id) {
        super("Produto não encontrado com ID: " + id);
    }
}
