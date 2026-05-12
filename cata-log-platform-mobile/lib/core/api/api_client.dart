import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../storage/secure_storage.dart';

/// Cliente HTTP centralizado com interceptor automático de JWT.
///
/// Configuração de URL:
/// - Flutter Web (chrome): usa localhost (mesmo host do browser)
/// - APK (dispositivo físico): usa o IP/domínio do servidor
///
/// Para alterar o endereço do servidor, mude [serverBaseUrl] antes de usar.
class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  /// URL base do servidor para dispositivos físicos (APK).
  /// Altere para o IP/domínio real do seu servidor.
  /// Exemplos:
  ///   - Rede local: 'http://192.168.1.100:8080/api/v1'
  ///   - Servidor online: 'https://api.catalog.com.br/api/v1'
  static String serverBaseUrl = 'https://prismcode.site/api/v1';

  late final Dio dio;

  ApiClient._internal() {
    // Web usa localhost (browser e API no mesmo host)
    // APK usa o IP/domínio configurado em serverBaseUrl
    final baseUrl = kIsWeb
        ? 'http://localhost:8080/api/v1'
        : serverBaseUrl;

    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        contentType: 'application/json',
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Token expirado ou inválido — limpar sessão
            await SecureStorage.clearAll();
          }
          handler.next(error);
        },
      ),
    );
  }
}

