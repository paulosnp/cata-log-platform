import 'package:dio/dio.dart';
import '../core/api/api_client.dart';
import '../models/financeiro_response.dart';

/// Serviço responsável pelos dados financeiros do artesão.
class FinanceiroService {
  final Dio _dio = ApiClient().dio;

  /// Obtém o resumo financeiro do artesão autenticado.
  /// GET /artesaos/me/financeiro
  Future<FinanceiroResponse> getFinanceiro() async {
    try {
      final response = await _dio.get('/artesaos/me/financeiro');
      return FinanceiroResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao carregar dados financeiros.';
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
    final responseData = e.response?.data;

    if (responseData is Map && responseData.containsKey('mensagem')) {
      return responseData['mensagem'];
    }

    switch (statusCode) {
      case 401:
        return 'Sessão expirada. Faça login novamente.';
      case 403:
        return 'Sem permissão para acessar dados financeiros.';
      case 500:
        return 'Erro interno do servidor.';
      default:
        return 'Erro de conexão. Tente novamente.';
    }
  }
}
