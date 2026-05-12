import 'package:flutter/foundation.dart';
import '../models/encomenda_response.dart';
import '../services/encomenda_service.dart';

/// Provider central de gestao de encomendas do artesao.
/// Gere a lista, loading, erros e operacao de contraproposta.
class EncomendaProvider extends ChangeNotifier {
  final EncomendaService _encomendaService = EncomendaService();

  List<EncomendaResponse> _encomendas = [];
  bool _isLoading = false;
  String? _errorMessage;

  // ─── Getters ───

  List<EncomendaResponse> get encomendas => _encomendas;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  /// Quantidade de encomendas aguardando resposta do artesao.
  int get totalAguardando =>
      _encomendas.where((e) => e.isAguardandoArtesao).length;

  /// Quantidade de propostas enviadas ao comprador.
  int get totalEnviadas =>
      _encomendas.where((e) => e.isAguardandoComprador).length;

  /// Quantidade de encomendas com preco acordado.
  int get totalAcordadas =>
      _encomendas.where((e) => e.isPrecoAcordado).length;

  // ─── Carregar Encomendas ───

  /// Carrega as encomendas do artesao autenticado (GET /encomendas/artesao).
  Future<void> carregarEncomendas() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _encomendas = await _encomendaService.getEncomendasArtesao();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── Responder Orcamento (Contraproposta) ───

  /// Envia a contraproposta do artesao para uma encomenda.
  /// Retorna true se sucesso, false se erro.
  Future<bool> responderOrcamento({
    required int encomendaId,
    required double precoProposto,
    required int tempoProducaoDias,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final atualizada = await _encomendaService.enviarContraproposta(
        id: encomendaId,
        precoProposto: precoProposto,
        tempoProducaoDias: tempoProducaoDias,
      );

      // Atualiza o item localmente
      final index = _encomendas.indexWhere((e) => e.id == encomendaId);
      if (index != -1) {
        _encomendas[index] = atualizada;
      }

      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
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
