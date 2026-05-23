import 'package:flutter/foundation.dart';
import 'package:stream_chat_flutter/stream_chat_flutter.dart';
import '../core/config/app_config.dart';
import '../services/chat_service.dart';

/// Provider que gere a instância do Stream Chat Client.
/// Conecta/desconecta o utilizador e fornece canais de mensagens.
class ChatProvider extends ChangeNotifier {
  final ChatService _chatService = ChatService();

  late final StreamChatClient _client;
  bool _isConnected = false;
  String? _errorMessage;

  // ─── Getters ───

  StreamChatClient get client => _client;
  bool get isConnected => _isConnected;
  String? get errorMessage => _errorMessage;

  ChatProvider() {
    _client = StreamChatClient(
      AppConfig.streamChatApiKey,
      logLevel: Level.OFF,
    );
  }

  // ─── Conectar Chat ───

  /// Conecta o utilizador ao Stream Chat.
  /// Busca o token via API (/chat/token) e liga o user ao cliente.
  Future<void> conectarChat({
    required int userId,
    required String userName,
  }) async {
    if (_isConnected) return;

    try {
      debugPrint('[ChatProvider] 1/3 Buscando token do Stream Chat...');
      final token = await _chatService.getStreamToken();
      debugPrint('[ChatProvider] 2/3 Token recebido (${token.length} chars). Conectando user $userId...');

      await _client.connectUser(
        User(
          id: 'artesao_$userId',
          name: userName,
        ),
        token,
      );

      _isConnected = true;
      _errorMessage = null;
      debugPrint('[ChatProvider] 3/3 ✅ Conectado ao Stream Chat com sucesso!');
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      _isConnected = false;
      debugPrint('[ChatProvider] ❌ Erro ao conectar: $e');
      notifyListeners();
    }
  }

  // ─── Desconectar Chat ───

  /// Desconecta o utilizador do Stream Chat (chamado no logout).
  Future<void> desconectarChat() async {
    if (!_isConnected) return;

    try {
      await _client.disconnectUser();
    } catch (e) {
      debugPrint('[ChatProvider] Erro ao desconectar: $e');
    } finally {
      _isConnected = false;
      notifyListeners();
    }
  }

  // ─── Obter Canal ───

  /// Retorna um Channel do Stream Chat pelo ID.
  /// O tipo é 'messaging' (padrão para conversas 1:1).
  Channel getChannel(String channelId, {List<String>? memberIds}) {
    return _client.channel(
      'messaging',
      id: channelId,
      extraData: memberIds != null ? {'members': memberIds} : null,
    );
  }

  @override
  void dispose() {
    _client.dispose();
    super.dispose();
  }
}
