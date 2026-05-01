package br.com.catalog.api.exception;

public class ProdutoIndisponivelException extends RuntimeException {

    public ProdutoIndisponivelException(String message) {
        super(message);
    }
}
