import 'package:dio/dio.dart';
import '../core/api/api_client.dart';
import '../models/produto_response.dart';

/// Servico responsavel por todas as operacoes de produtos com a API.
class ProdutoService {
  final Dio _dio = ApiClient().dio;

  /// Lista os produtos do artesao autenticado.
  /// GET /produtos/meus?page=X&size=Y
  Future<List<ProdutoResponse>> getMeusProdutos({
    int page = 0,
    int size = 100,
  }) async {
    try {
      final response = await _dio.get(
        '/produtos/meus',
        queryParameters: {'page': page, 'size': size},
      );

      final List<dynamic> content = response.data['content'] as List<dynamic>;
      return content
          .map((json) => ProdutoResponse.fromJson(json))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao carregar produtos.';
    }
  }

  /// Cria um novo produto.
  /// POST /produtos
  Future<ProdutoResponse> criarProduto(Map<String, dynamic> dados) async {
    try {
      final response = await _dio.post('/produtos', data: dados);
      return ProdutoResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao criar produto.';
    }
  }

  /// Marca um produto como vendido.
  /// PATCH /produtos/{id}/vendido
  Future<ProdutoResponse> marcarVendido(int id) async {
    try {
      final response = await _dio.patch('/produtos/$id/vendido');
      return ProdutoResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao marcar produto como vendido.';
    }
  }

  /// Edita os dados em texto de um produto existente.
  /// PUT /produtos/{id}
  Future<ProdutoResponse> editarProduto(
      int id, Map<String, dynamic> dados) async {
    try {
      final response = await _dio.put('/produtos/$id', data: dados);
      return ProdutoResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao atualizar produto.';
    }
  }

  /// Desativa (deleta logicamente) um produto.
  /// DELETE /produtos/{id}
  Future<void> deletarProduto(int id) async {
    try {
      await _dio.delete('/produtos/$id');
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao remover produto.';
    }
  }

  /// Alias semântico para deletarProduto — usado no fluxo de exclusão.
  /// DELETE /produtos/{id}
  Future<void> excluirProduto(int id) => deletarProduto(id);

  /// Faz upload de uma imagem para um produto.
  /// POST /produtos/{id}/imagens (multipart/form-data, chave: "arquivo")
  /// Aceita bytes + filename para compatibilidade Web e Mobile.
  Future<ProdutoResponse> uploadImagem(
      int produtoId, List<int> bytes, String filename) async {
    try {
      final formData = FormData.fromMap({
        'arquivo': MultipartFile.fromBytes(
          bytes,
          filename: filename,
        ),
      });

      final response = await _dio.post(
        '/produtos/$produtoId/imagens',
        data: formData,
        options: Options(
          sendTimeout: const Duration(seconds: 60),
          receiveTimeout: const Duration(seconds: 60),
        ),
      );

      return ProdutoResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    } catch (e) {
      throw 'Erro ao enviar imagem.';
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
        return 'Produto nao encontrado.';
      case 500:
        return 'Erro interno do servidor.';
      default:
        return 'Erro de conexao. Tente novamente.';
    }
  }
}
