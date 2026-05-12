/// Modelo que espelha o ProdutoResponse do backend Spring Boot.
/// Inclui todos os campos retornados pelo GET /produtos/meus.
class ProdutoResponse {
  final int id;
  final String nome;
  final String? descricao;
  final double preco;
  final double? precoComDesconto;
  final int? percentualDesconto;
  final bool emPromocao;
  final bool pecaUnica;
  final bool vendido;
  final bool ativo;
  final String? material;
  final int? pesoGramas;
  final int? comprimentoCm;
  final int? larguraCm;
  final int? alturaCm;
  final int? tempoProducaoDias;
  final String? categoriaNome;
  final int? categoriaId;
  final String? artesaoNomeAtelie;
  final int? artesaoId;
  final bool? artesaoSeloVerificado;
  final double? notaMedia;
  final int? totalAvaliacoes;
  final List<String> imagensUrls;
  final String? criadoEm;

  ProdutoResponse({
    required this.id,
    required this.nome,
    this.descricao,
    required this.preco,
    this.precoComDesconto,
    this.percentualDesconto,
    this.emPromocao = false,
    this.pecaUnica = false,
    this.vendido = false,
    this.ativo = true,
    this.material,
    this.pesoGramas,
    this.comprimentoCm,
    this.larguraCm,
    this.alturaCm,
    this.tempoProducaoDias,
    this.categoriaNome,
    this.categoriaId,
    this.artesaoNomeAtelie,
    this.artesaoId,
    this.artesaoSeloVerificado,
    this.notaMedia,
    this.totalAvaliacoes,
    this.imagensUrls = const [],
    this.criadoEm,
  });

  factory ProdutoResponse.fromJson(Map<String, dynamic> json) {
    return ProdutoResponse(
      id: json['id'] as int,
      nome: json['nome'] as String,
      descricao: json['descricao'] as String?,
      preco: (json['preco'] as num).toDouble(),
      precoComDesconto: (json['precoComDesconto'] as num?)?.toDouble(),
      percentualDesconto: json['percentualDesconto'] as int?,
      emPromocao: json['emPromocao'] as bool? ?? false,
      pecaUnica: json['pecaUnica'] as bool? ?? false,
      vendido: json['vendido'] as bool? ?? false,
      ativo: json['ativo'] as bool? ?? true,
      material: json['material'] as String?,
      pesoGramas: json['pesoGramas'] as int?,
      comprimentoCm: json['comprimentoCm'] as int?,
      larguraCm: json['larguraCm'] as int?,
      alturaCm: json['alturaCm'] as int?,
      tempoProducaoDias: json['tempoProducaoDias'] as int?,
      categoriaNome: json['categoriaNome'] as String?,
      categoriaId: json['categoriaId'] as int?,
      artesaoNomeAtelie: json['artesaoNomeAtelie'] as String?,
      artesaoId: json['artesaoId'] as int?,
      artesaoSeloVerificado: json['artesaoSeloVerificado'] as bool?,
      notaMedia: (json['notaMedia'] as num?)?.toDouble(),
      totalAvaliacoes: json['totalAvaliacoes'] as int?,
      imagensUrls: (json['imagensUrls'] as List<dynamic>?)
              ?.map((e) => e as String)
              .toList() ??
          [],
      criadoEm: json['criadoEm'] as String?,
    );
  }

  /// URL da primeira imagem ou null se nao houver.
  String? get primeiraImagemUrl =>
      imagensUrls.isNotEmpty ? imagensUrls.first : null;
}
