import 'package:dio/dio.dart';
import '../core/api/api_client.dart';
import '../models/artesao_perfil_response.dart';

/// Serviço responsável pelas operações de perfil do artesão.
class ArtesaoService {
  final Dio _dio = ApiClient().dio;

  /// Obtém o perfil do artesão autenticado.
  /// GET /artesaos/me
  Future<ArtesaoPerfilResponse> getMeuPerfil() async {
    try {
      final response = await _dio.get('/artesaos/me');
      return ArtesaoPerfilResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao carregar perfil.';
    }
  }

  /// Atualiza o perfil do artesão autenticado.
  /// PUT /artesaos/me
  Future<ArtesaoPerfilResponse> atualizarPerfil(
      Map<String, dynamic> dados) async {
    try {
      final response = await _dio.put('/artesaos/me', data: dados);
      return ArtesaoPerfilResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao atualizar perfil.';
    }
  }

  /// Faz upload da foto de perfil do artesão.
  /// POST /artesaos/me/foto (multipart/form-data, chave: "arquivo")
  /// Aceita bytes + filename para compatibilidade Web e Mobile.
  Future<ArtesaoPerfilResponse> uploadFotoPerfil(
      List<int> bytes, String filename) async {
    try {
      final formData = FormData.fromMap({
        'arquivo': MultipartFile.fromBytes(
          bytes,
          filename: filename,
        ),
      });

      final response = await _dio.post(
        '/artesaos/me/foto',
        data: formData,
        options: Options(
          sendTimeout: const Duration(seconds: 60),
          receiveTimeout: const Duration(seconds: 60),
        ),
      );

      return ArtesaoPerfilResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao enviar foto de perfil.';
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
      case 400:
        return 'Dados inválidos. Verifique os campos.';
      case 401:
        return 'Sessão expirada. Faça login novamente.';
      case 403:
        return 'Sem permissão para esta ação.';
      case 404:
        return 'Perfil não encontrado.';
      case 500:
        return 'Erro interno do servidor.';
      default:
        return 'Erro de conexão. Tente novamente.';
    }
  }
}
