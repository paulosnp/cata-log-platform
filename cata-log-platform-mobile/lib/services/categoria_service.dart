import 'package:dio/dio.dart';
import '../core/api/api_client.dart';
import '../models/categoria_response.dart';

/// Servico responsavel por operacoes de categorias com a API.
class CategoriaService {
  final Dio _dio = ApiClient().dio;

  /// Lista todas as categorias ativas.
  /// GET /categorias
  Future<List<CategoriaResponse>> listarAtivas() async {
    try {
      final response = await _dio.get('/categorias');
      final List<dynamic> data = response.data as List<dynamic>;
      return data.map((json) => CategoriaResponse.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao carregar categorias.';
    }
  }

  String _handleError(DioException e) {
    if (e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return 'Servidor indisponivel.';
    }
    if (e.type == DioExceptionType.connectionError) {
      return 'Sem conexao com a internet.';
    }
    return 'Erro ao carregar categorias.';
  }
}
