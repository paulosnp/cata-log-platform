import 'package:flutter/foundation.dart';
import '../models/artesao_perfil_response.dart';
import '../services/artesao_service.dart';

/// Provider de gestão do perfil do artesão.
class ArtesaoProvider extends ChangeNotifier {
  final ArtesaoService _artesaoService = ArtesaoService();

  ArtesaoPerfilResponse? _perfil;
  bool _isLoading = false;
  String? _errorMessage;

  // ─── Getters ───

  ArtesaoPerfilResponse? get perfil => _perfil;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // ─── Carregar Perfil ───

  /// Carrega o perfil do artesão (GET /artesaos/me).
  Future<void> carregarPerfil() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _perfil = await _artesaoService.getMeuPerfil();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── Atualizar Perfil ───

  /// Atualiza o perfil do artesão (PUT /artesaos/me).
  /// Retorna true se sucesso.
  Future<bool> atualizarPerfil(Map<String, dynamic> dados) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _perfil = await _artesaoService.atualizarPerfil(dados);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── Upload Foto ───

  /// Faz upload da foto de perfil do artesão.
  /// Retorna true se sucesso.
  Future<bool> uploadFoto(List<int> bytes, String filename) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _perfil = await _artesaoService.uploadFotoPerfil(bytes, filename);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
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
