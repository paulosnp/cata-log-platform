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

  // ─── Genérico (para integrações e outros dados) ───

  static Future<void> write(String key, String value) =>
      _storage.write(key: key, value: value);

  static Future<String?> read(String key) =>
      _storage.read(key: key);

  // ─── Limpeza (Logout) ───

  static Future<void> clearAll() => _storage.deleteAll();
}
