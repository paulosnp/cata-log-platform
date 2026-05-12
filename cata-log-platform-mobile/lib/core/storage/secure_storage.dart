import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Wrapper centralizado para armazenamento seguro de dados sensíveis.
/// Utiliza flutter_secure_storage (Keychain no iOS, EncryptedSharedPreferences no Android).
class SecureStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  static const _tokenKey = 'catalog_jwt_token';
  static const _userKey = 'catalog_user_data';

  // ─── Token JWT ───

  static Future<void> saveToken(String token) =>
      _storage.write(key: _tokenKey, value: token);

  static Future<String?> getToken() =>
      _storage.read(key: _tokenKey);

  // ─── Dados do Utilizador (JSON serializado) ───

  static Future<void> saveUserData(String userJson) =>
      _storage.write(key: _userKey, value: userJson);

  static Future<String?> getUserData() =>
      _storage.read(key: _userKey);

  // ─── Limpeza (Logout) ───

  static Future<void> clearAll() => _storage.deleteAll();
}
