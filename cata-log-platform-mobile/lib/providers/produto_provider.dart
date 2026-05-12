import 'package:flutter/foundation.dart';
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

  /// Cria um novo produto e recarrega a lista em caso de sucesso.
  /// Retorna true se sucesso, false se erro.
  Future<bool> adicionarProduto(Map<String, dynamic> dados) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _produtoService.criarProduto(dados);
      // Recarrega a lista para incluir o novo produto
      await carregarMeusProdutos();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
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

  // ─── Utilidades ───

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
