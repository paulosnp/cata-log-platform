import 'package:dio/dio.dart';
import '../core/api/api_client.dart';

/// Serviço responsável pela obtenção do token de chat do Stream.
class ChatService {
  final Dio _dio = ApiClient().dio;

  /// Obtém o token JWT do Stream Chat para o utilizador autenticado.
  /// GET /chat/token
  Future<String> getStreamToken() async {
    try {
      final response = await _dio.get('/chat/token');
      return response.data['token'] as String;
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao obter token do chat.';
    }
  }

  String _handleError(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Servidor indisponível. Verifique sua conexão.';
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Sem conexão com a internet.';
    }

    final statusCode = e.response?.statusCode;
    switch (statusCode) {
      case 401:
        return 'Sessão expirada. Faça login novamente.';
      case 403:
        return 'Sem permissão para acessar o chat.';
      case 500:
        return 'Erro interno do servidor.';
      default:
        return 'Erro de conexão com o chat.';
    }
  }
}
