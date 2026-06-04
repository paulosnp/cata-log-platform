import 'dart:convert';
import 'package:flutter/foundation.dart';
import '../core/storage/secure_storage.dart';
import '../models/login_response.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  LoginResponse? _user;
  bool _isLoading = false;
  String? _errorMessage;

  LoginResponse? get user => _user;
  bool get isAuthenticated => _user != null;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

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

  String? _successMessage;
  String? get successMessage => _successMessage;

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

  Future<void> checkAuthStatus() async {
    final token = await SecureStorage.getToken();
    final userData = await SecureStorage.getUserData();

    if (token != null && token.isNotEmpty && userData != null) {
      if (_isTokenExpired(token)) {
        await SecureStorage.clearAll();
        _user = null;
        notifyListeners();
        return;
      }

      try {
        _user = LoginResponse.fromJsonString(userData);
      } catch (_) {
        await SecureStorage.clearAll();
        _user = null;
      }
    } else {
      _user = null;
    }

    notifyListeners();
  }

  bool _isTokenExpired(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return true;

      final payload = parts[1];
      final normalized = base64.normalize(payload);
      final decoded = utf8.decode(base64.decode(normalized));
      final map = json.decode(decoded) as Map<String, dynamic>;

      final exp = map['exp'] as int?;
      if (exp == null) return true;

      final expiry = DateTime.fromMillisecondsSinceEpoch(exp * 1000);
      return DateTime.now().isAfter(expiry);
    } catch (_) {
      return true;
    }
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
