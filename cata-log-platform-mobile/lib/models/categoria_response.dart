/// Modelo que espelha o CategoriaResponse do backend.
class CategoriaResponse {
  final int id;
  final String nome;
  final String? descricao;
  final bool ativo;

  CategoriaResponse({
    required this.id,
    required this.nome,
    this.descricao,
    required this.ativo,
  });

  factory CategoriaResponse.fromJson(Map<String, dynamic> json) {
    return CategoriaResponse(
      id: json['id'] as int,
      nome: json['nome'] as String,
      descricao: json['descricao'] as String?,
      ativo: json['ativo'] as bool? ?? true,
    );
  }
}
