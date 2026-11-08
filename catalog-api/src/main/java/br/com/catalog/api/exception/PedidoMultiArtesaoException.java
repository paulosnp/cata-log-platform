package br.com.catalog.api.exception;

/** 409. Pedido com itens de mais de um artesão não pode ter envio gerado por um deles (ver VerificadorPosse#pedidoDoArtesao). */
public class PedidoMultiArtesaoException extends RuntimeException {

    public PedidoMultiArtesaoException() {
        super("Este pedido contém itens de outros artesãos; o envio não pode ser gerado por um único artesão.");
    }
}
