package br.com.catalog.api.exception;

public class CarrinhoVazioException extends RuntimeException {

    public CarrinhoVazioException() {
        super("O carrinho está vazio. Adicione produtos antes de realizar o checkout.");
    }
}
