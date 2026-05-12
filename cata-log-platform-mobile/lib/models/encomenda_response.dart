/// Modelo que espelha o EncomendaResponse do backend Spring Boot.
/// Inclui todos os campos retornados pelo GET /encomendas/artesao.
class EncomendaResponse {
  final int id;
  final String status;
  final String? observacoesCliente;
  final double? precoProposto;
  final int? tempoProducaoDias;
  final String? streamChannelId;
  final int? compradorId;
  final String? nomeComprador;
  final int? artesaoId;
  final String? nomeArtesao;
  final int? produtoReferenciaId;
  final String? nomeProdutoReferencia;
  final String? criadoEm;
  final String? atualizadoEm;

  EncomendaResponse({
    required this.id,
    required this.status,
    this.observacoesCliente,
    this.precoProposto,
    this.tempoProducaoDias,
    this.streamChannelId,
    this.compradorId,
    this.nomeComprador,
    this.artesaoId,
    this.nomeArtesao,
    this.produtoReferenciaId,
    this.nomeProdutoReferencia,
    this.criadoEm,
    this.atualizadoEm,
  });

  factory EncomendaResponse.fromJson(Map<String, dynamic> json) {
    return EncomendaResponse(
      id: json['id'] as int,
      status: json['status'] as String,
      observacoesCliente: json['observacoesCliente'] as String?,
      precoProposto: (json['precoProposto'] as num?)?.toDouble(),
      tempoProducaoDias: json['tempoProducaoDias'] as int?,
      streamChannelId: json['streamChannelId'] as String?,
      compradorId: json['compradorId'] as int?,
      nomeComprador: json['nomeComprador'] as String?,
      artesaoId: json['artesaoId'] as int?,
      nomeArtesao: json['nomeArtesao'] as String?,
      produtoReferenciaId: json['produtoReferenciaId'] as int?,
      nomeProdutoReferencia: json['nomeProdutoReferencia'] as String?,
      criadoEm: json['criadoEm'] as String?,
      atualizadoEm: json['atualizadoEm'] as String?,
    );
  }

  /// Verifica se esta encomenda aguarda resposta do artesao.
  bool get isAguardandoArtesao => status == 'AGUARDANDO_ARTESAO';

  /// Verifica se esta encomenda aguarda aceite do comprador.
  bool get isAguardandoComprador => status == 'AGUARDANDO_COMPRADOR';

  /// Verifica se o preco foi acordado.
  bool get isPrecoAcordado => status == 'PRECO_ACORDADO';

  /// Verifica se foi cancelada (qualquer tipo).
  bool get isCancelada =>
      status == 'CANCELADO_ESTORNO_TOTAL' || status == 'CANCELADO_COM_TAXA';

  /// Descricao para exibir no card — produto referencia ou observacoes.
  String get descricaoExibicao =>
      nomeProdutoReferencia ?? observacoesCliente ?? 'Encomenda personalizada';

  /// Inicial do nome do comprador para o avatar.
  String get inicialComprador =>
      (nomeComprador?.isNotEmpty == true) ? nomeComprador![0].toUpperCase() : '?';
}
