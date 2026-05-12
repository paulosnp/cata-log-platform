import 'package:dio/dio.dart';
import '../core/api/api_client.dart';
import '../core/storage/secure_storage.dart';
import '../models/login_response.dart';

/// Serviço responsável por todas as operações de autenticação com a API.
class AuthService {
  final Dio _dio = ApiClient().dio;

  /// Realiza login do artesão e persiste a sessão no storage seguro.
  ///
  /// Retorna [LoginResponse] em caso de sucesso.
  /// Lança [String] com mensagem de erro tratada em caso de falha.
  Future<LoginResponse> login(String email, String senha) async {
    try {
      final response = await _dio.post(
        '/auth/artesao/login',
        data: {
          'email': email,
          'senha': senha,
        },
      );

      final loginResponse = LoginResponse.fromJson(response.data);

      // Persistir sessão no armazenamento seguro
      await SecureStorage.saveToken(loginResponse.token);
      await SecureStorage.saveUserData(loginResponse.toJsonString());

      return loginResponse;
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw 'Erro inesperado. Tente novamente.';
    }
  }

  /// Registra um novo artesão na plataforma.
  ///
  /// Retorna a mensagem de sucesso do backend.
  /// Lança [String] com mensagem de erro tratada em caso de falha.
  Future<String> registrar({
    required String nomeAtelie,
    required String email,
    required String senha,
    required String cep,
    String? telefoneWhatsapp,
  }) async {
    try {
      final data = {
        'nomeAtelie': nomeAtelie,
        'email': email,
        'senha': senha,
        'cep': cep,
      };
      if (telefoneWhatsapp != null && telefoneWhatsapp.isNotEmpty) {
        data['telefoneWhatsapp'] = telefoneWhatsapp;
      }

      final response = await _dio.post('/auth/artesao/registrar', data: data);

      if (response.data is Map && response.data.containsKey('mensagem')) {
        return response.data['mensagem'];
      }
      return 'Cadastro realizado com sucesso.';
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw 'Erro inesperado. Tente novamente.';
    }
  }

  /// Traduz erros do Dio para mensagens amigáveis em português.
  String _handleDioError(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Servidor indisponível. Verifique sua conexão.';
    }

    if (e.type == DioExceptionType.connectionError) {
      return 'Sem conexão com a internet.';
    }

    final statusCode = e.response?.statusCode;
    final responseData = e.response?.data;

    // Tenta extrair mensagem do backend primeiro
    if (responseData is Map && responseData.containsKey('mensagem')) {
      return responseData['mensagem'];
    }

    switch (statusCode) {
      case 400:
        return 'Preencha todos os campos corretamente.';
      case 401:
        return 'E-mail ou senha incorretos.';
      case 403:
        return 'Sua conta está bloqueada. Entre em contato com o suporte.';
      case 409:
        return 'Este e-mail já está cadastrado.';
      case 500:
        return 'Erro interno do servidor. Tente novamente mais tarde.';
      default:
        return 'Erro de conexão. Tente novamente.';
    }
  }
}
