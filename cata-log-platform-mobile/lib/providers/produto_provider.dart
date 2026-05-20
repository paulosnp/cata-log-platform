import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';
import '../models/produto_response.dart';
import '../models/categoria_response.dart';
import '../services/produto_service.dart';
import '../services/categoria_service.dart';

/// Provider central de gestao de produtos e categorias.
/// Gere listas, loading, erros e operacoes CRUD.
class ProdutoProvider extends ChangeNotifier {
  final ProdutoService _produtoService = ProdutoService();
  final CategoriaService _categoriaService = CategoriaService();

  List<ProdutoResponse> _produtos = [];
  List<CategoriaResponse> _categorias = [];
  bool _isLoading = false;
  String? _errorMessage;

  // ─── Getters ───

  List<ProdutoResponse> get produtos => _produtos;
  List<CategoriaResponse> get categorias => _categorias;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  /// Quantidade de produtos ativos e nao vendidos.
  int get totalAtivos => _produtos.where((p) => p.ativo && !p.vendido).length;

  /// Quantidade de pecas unicas.
  int get totalPecasUnicas => _produtos.where((p) => p.pecaUnica).length;

  /// Quantidade de produtos vendidos.
  int get totalVendidos => _produtos.where((p) => p.vendido).length;

  // ─── Carregar Produtos ───

  /// Carrega os produtos do artesao autenticado (GET /produtos/meus).
  Future<void> carregarMeusProdutos() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _produtos = await _produtoService.getMeusProdutos();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── Carregar Categorias ───

  /// Carrega as categorias ativas (GET /categorias).
  Future<void> carregarCategorias() async {
    try {
      _categorias = await _categoriaService.listarAtivas();
      notifyListeners();
    } catch (e) {
      // Erro silencioso — categorias sao auxiliares
      _categorias = [];
    }
  }

  // ─── Criar Produto ───

  /// Cria um novo produto e retorna o ProdutoResponse com ID.
  /// Retorna null se erro.
  Future<ProdutoResponse?> adicionarProduto(Map<String, dynamic> dados) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final produto = await _produtoService.criarProduto(dados);
      // Recarrega a lista para incluir o novo produto
      await carregarMeusProdutos();
      return produto;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  // ─── Upload de Imagens ───

  /// Faz upload de imagem(ns) para um produto.
  /// Aceita XFiles para compatibilidade Web e Mobile.
  /// Retorna true se TODOS os uploads foram bem-sucedidos.
  Future<bool> uploadImagensProduto(
      int produtoId, List<XFile> imagens) async {
    try {
      for (final img in imagens) {
        final bytes = await img.readAsBytes();
        await _produtoService.uploadImagem(produtoId, bytes, img.name);
      }
      await carregarMeusProdutos();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // ─── Marcar como Vendido ───

  /// Marca um produto como vendido (PATCH /produtos/{id}/vendido).
  /// Atualiza o item localmente apos sucesso na API.
  Future<bool> marcarVendido(int id) async {
    try {
      final atualizado = await _produtoService.marcarVendido(id);
      final index = _produtos.indexWhere((p) => p.id == id);
      if (index != -1) {
        _produtos[index] = atualizado;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // ─── Deletar Produto ───

  /// Desativa um produto (DELETE /produtos/{id}).
  /// Remove da lista local apos sucesso.
  Future<bool> deletarProduto(int id) async {
    try {
      await _produtoService.deletarProduto(id);
      _produtos.removeWhere((p) => p.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // ─── Atualizar Produto (Edição) ───

  /// Atualiza os dados em texto de um produto existente.
  /// PUT /produtos/{id} — atualiza o item na lista local após sucesso.
  Future<bool> atualizarProduto(int id, Map<String, dynamic> dados) async {
    try {
      final atualizado = await _produtoService.editarProduto(id, dados);
      final index = _produtos.indexWhere((p) => p.id == id);
      if (index != -1) {
        _produtos[index] = atualizado;
      }
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // ─── Remover Produto (Exclusão com padrão GitHub) ───

  /// Remove um produto permanentemente (DELETE /produtos/{id}).
  /// Remove da lista local após sucesso na API.
  Future<bool> removerProduto(int id) async {
    try {
      await _produtoService.excluirProduto(id);
      _produtos.removeWhere((p) => p.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // ─── Utilidades ───

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
