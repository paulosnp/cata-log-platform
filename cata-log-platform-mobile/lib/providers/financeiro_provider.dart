import 'package:flutter/foundation.dart';
import '../models/financeiro_response.dart';
import '../services/financeiro_service.dart';

/// Provider de gestão dos dados financeiros do artesão.
class FinanceiroProvider extends ChangeNotifier {
  final FinanceiroService _financeiroService = FinanceiroService();

  FinanceiroResponse? _financeiro;
  bool _isLoading = false;
  String? _errorMessage;

  // ─── Getters ───

  FinanceiroResponse? get financeiro => _financeiro;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // ─── Carregar Financeiro ───

  /// Carrega o resumo financeiro do artesão (GET /artesaos/me/financeiro).
  Future<void> carregarFinanceiro() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _financeiro = await _financeiroService.getFinanceiro();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── Utilidades ───

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
