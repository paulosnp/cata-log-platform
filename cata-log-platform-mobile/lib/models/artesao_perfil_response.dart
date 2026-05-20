/// Modelo que espelha o ArtesaoPerfilResponse do backend.
/// Campos do perfil do artesão autenticado.
class ArtesaoPerfilResponse {
  final int id;
  final String email;
  final String? nomeAtelie;
  final String? biografia;
  final String? telefoneWhatsapp;
  final String? cep;
  final String? estado;
  final String? cidade;
  final bool seloVerificado;
  final bool emailVerificado;
  final String? fotoUrl;
  final String? criadoEm;

  ArtesaoPerfilResponse({
    required this.id,
    required this.email,
    this.nomeAtelie,
    this.biografia,
    this.telefoneWhatsapp,
    this.cep,
    this.estado,
    this.cidade,
    this.seloVerificado = false,
    this.emailVerificado = false,
    this.fotoUrl,
    this.criadoEm,
  });

  factory ArtesaoPerfilResponse.fromJson(Map<String, dynamic> json) {
    return ArtesaoPerfilResponse(
      id: json['id'] as int,
      email: json['email'] as String,
      nomeAtelie: json['nomeAtelie'] as String?,
      biografia: json['biografia'] as String?,
      telefoneWhatsapp: json['telefoneWhatsapp'] as String?,
      cep: json['cep'] as String?,
      estado: json['estado'] as String?,
      cidade: json['cidade'] as String?,
      seloVerificado: json['seloVerificado'] as bool? ?? false,
      emailVerificado: json['emailVerificado'] as bool? ?? false,
      fotoUrl: json['fotoUrl'] as String?,
      criadoEm: json['criadoEm'] as String?,
    );
  }
}
