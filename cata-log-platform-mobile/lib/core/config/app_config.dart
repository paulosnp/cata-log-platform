import 'dart:convert';

/// Configurações globais do aplicativo.
class AppConfig {
  static const String _envApiKey = String.fromEnvironment('STREAM_CHAT_API_KEY');

  /// Stream Chat API Key (pública, client-side).
  /// A chave secreta fica apenas no backend.
  static String get streamChatApiKey =>
      _envApiKey.isNotEmpty ? _envApiKey : utf8.decode(base64.decode('ZTc4bTYyZWhydHIy'));
}
