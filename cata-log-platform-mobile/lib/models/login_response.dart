import 'dart:convert';

/// Modelo que espelha o LoginResponse do backend Spring Boot.
/// Campos: id, token, role, nome, senhaTemporaria.
class LoginResponse {
  final int id;
  final String token;
  final String role;
  final String nome;
  final bool senhaTemporaria;

  LoginResponse({
    required this.id,
    required this.token,
    required this.role,
    required this.nome,
    required this.senhaTemporaria,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      id: json['id'] as int,
      token: json['token'] as String,
      role: json['role'] as String,
      nome: json['nome'] as String,
      senhaTemporaria: json['senhaTemporaria'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'token': token,
      'role': role,
      'nome': nome,
      'senhaTemporaria': senhaTemporaria,
    };
  }

  /// Serializa para JSON string (para guardar no SecureStorage).
  String toJsonString() => jsonEncode(toJson());

  /// Reconstrói a partir de JSON string (lida do SecureStorage).
  factory LoginResponse.fromJsonString(String jsonString) {
    return LoginResponse.fromJson(jsonDecode(jsonString));
  }
}
