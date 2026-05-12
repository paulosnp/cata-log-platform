import 'package:flutter/foundation.dart';
import '../core/storage/secure_storage.dart';
import '../models/login_response.dart';
import '../services/auth_service.dart';

/// Provider central de autenticação.
/// Gere o estado de login, loading, erro e sessão persistida.
class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  LoginResponse? _user;
  bool _isLoading = false;
  String? _errorMessage;

  // ─── Getters ───

  LoginResponse? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // ─── Login ───

  /// Realiza login com email e senha.
  /// Atualiza [isAuthenticated], [isLoading] e [errorMessage].
  Future<void> login(String email, String senha) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _user = await _authService.login(email, senha);
      _errorMessage = null;
    } catch (e) {
      _user = null;
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── Registro ───

  String? _successMessage;
  String? get successMessage => _successMessage;

  /// Registra um novo artesão na plataforma.
  /// Atualiza [isLoading], [errorMessage] e [successMessage].
  Future<bool> registrar({
    required String nomeAtelie,
    required String email,
    required String senha,
    required String cep,
    String? telefoneWhatsapp,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();

    try {
      _successMessage = await _authService.registrar(
        nomeAtelie: nomeAtelie,
        email: email,
        senha: senha,
        cep: cep,
        telefoneWhatsapp: telefoneWhatsapp,
      );
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─── Verificação de Sessão (Auto-login) ───

  /// Chamado na SplashScreen para verificar se existe uma sessão ativa.
  /// Reconstrói o [_user] a partir do SecureStorage se o token existir.
  Future<void> checkAuthStatus() async {
    final token = await SecureStorage.getToken();
    final userData = await SecureStorage.getUserData();

    if (token != null && token.isNotEmpty && userData != null) {
      try {
        _user = LoginResponse.fromJsonString(userData);
      } catch (_) {
        // Dados corrompidos — limpar tudo
        await SecureStorage.clearAll();
        _user = null;
      }
    } else {
      _user = null;
    }

    notifyListeners();
  }

  // ─── Logout ───

  /// Limpa toda a sessão e redireciona para login.
  Future<void> logout() async {
    await SecureStorage.clearAll();
    _user = null;
    _errorMessage = null;
    notifyListeners();
  }

  // ─── Utilidades ───

  /// Limpa a mensagem de erro (ex: depois de mostrar o SnackBar).
  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
