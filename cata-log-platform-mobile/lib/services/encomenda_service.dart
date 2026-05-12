import 'package:dio/dio.dart';
import '../core/api/api_client.dart';
import '../models/encomenda_response.dart';

/// Servico responsavel pelas operacoes de encomendas com a API.
class EncomendaService {
  final Dio _dio = ApiClient().dio;

  /// Lista as encomendas do artesao autenticado.
  /// GET /encomendas/artesao?page=X&size=Y
  Future<List<EncomendaResponse>> getEncomendasArtesao({
    int page = 0,
    int size = 100,
  }) async {
    try {
      final response = await _dio.get(
        '/encomendas/artesao',
        queryParameters: {'page': page, 'size': size},
      );

      final List<dynamic> content = response.data['content'] as List<dynamic>;
      return content
          .map((json) => EncomendaResponse.fromJson(json))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao carregar encomendas.';
    }
  }

  /// Envia a contraproposta do artesao para uma encomenda.
  /// PUT /encomendas/{id}/contraproposta
  Future<EncomendaResponse> enviarContraproposta({
    required int id,
    required double precoProposto,
    required int tempoProducaoDias,
  }) async {
    try {
      final response = await _dio.put(
        '/encomendas/$id/contraproposta',
        data: {
          'precoProposto': precoProposto,
          'tempoProducaoDias': tempoProducaoDias,
        },
      );
      return EncomendaResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao enviar contraproposta.';
    }
  }

  /// Traduz erros do Dio para mensagens amigaveis.
  String _handleError(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Servidor indisponivel. Verifique sua conexao.';
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Sem conexao com a internet.';
    }

    final statusCode = e.response?.statusCode;
    final responseData = e.response?.data;

    if (responseData is Map && responseData.containsKey('mensagem')) {
      return responseData['mensagem'];
    }

    switch (statusCode) {
      case 400:
        return 'Dados invalidos. Verifique os campos.';
      case 403:
        return 'Voce nao tem permissao para esta acao.';
      case 404:
        return 'Encomenda nao encontrada.';
      case 409:
        return 'Esta encomenda ja foi respondida.';
      case 500:
        return 'Erro interno do servidor.';
      default:
        return 'Erro de conexao. Tente novamente.';
    }
  }
}
