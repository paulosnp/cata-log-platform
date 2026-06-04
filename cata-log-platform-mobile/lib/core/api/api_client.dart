import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import '../storage/secure_storage.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  static String serverBaseUrl = 'https://prismcode.site/api/v1';

  static final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

  late final Dio dio;

  ApiClient._internal() {
    final baseUrl = kIsWeb
        ? 'http://localhost:8080/api/v1'
        : serverBaseUrl;

    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 15),
        contentType: 'application/json',
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await SecureStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (error, handler) async {
          final status = error.response?.statusCode;
          final path = error.requestOptions.path;
          final isAuthRoute = path.startsWith('/auth/');

          if ((status == 401 || status == 403) && !isAuthRoute) {
            await SecureStorage.clearAll();
            _forceLoginRedirect();
          }

          handler.next(error);
        },
      ),
    );
  }

  void _forceLoginRedirect() {
    final ctx = navigatorKey.currentContext;
    if (ctx == null) return;

    Navigator.of(ctx).pushNamedAndRemoveUntil('/login', (_) => false);
  }
}

