import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:stream_chat_flutter/stream_chat_flutter.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../models/encomenda_response.dart';
import '../providers/chat_provider.dart';

class ChatScreen extends StatefulWidget {
  final EncomendaResponse encomenda;

  const ChatScreen({super.key, required this.encomenda});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  Channel? _channel;
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initChannel();
  }

  Future<void> _initChannel() async {
    final channelId = widget.encomenda.streamChannelId;

    if (channelId == null || channelId.isEmpty) {
      setState(() {
        _isLoading = false;
        _errorMessage = 'Canal de chat não disponível para esta encomenda.';
      });
      return;
    }

    try {
      final chatProvider = Provider.of<ChatProvider>(context, listen: false);

      if (!chatProvider.isConnected) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Chat não conectado. Tente reabrir o app.';
        });
        return;
      }

      final channel = chatProvider.getChannel(channelId);
      await channel.watch();

      if (mounted) {
        setState(() {
          _channel = channel;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Erro ao carregar o chat: $e';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.surfaceContainerLowest,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: AppColors.primaryContainer.withValues(alpha: 0.3),
                shape: BoxShape.circle,
              ),
              child: Center(
                child: Text(
                  widget.encomenda.inicialComprador,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primary,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.encomenda.nomeComprador ?? 'Cliente',
                    style: GoogleFonts.manrope(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: AppColors.onSurface,
                    ),
                  ),
                  Text(
                    '#${widget.encomenda.id}',
                    style: GoogleFonts.manrope(
                      fontSize: 11,
                      color: AppColors.onSurfaceVariant,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.more_vert_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          // ─── Info banner da encomenda ───
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            color: AppColors.surfaceContainerLow,
            child: Row(
              children: [
                const Icon(
                  Icons.palette_outlined,
                  size: 16,
                  color: AppColors.onSurfaceVariant,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.encomenda.descricaoExibicao,
                    style: GoogleFonts.manrope(
                      fontSize: 12,
                      color: AppColors.onSurfaceVariant,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (widget.encomenda.precoProposto != null) ...[
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.statusOrcamentoEnviado
                          .withValues(alpha: 0.1),
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusFull),
                    ),
                    child: Text(
                      'R\$ ${widget.encomenda.precoProposto!.toStringAsFixed(2).replaceAll('.', ',')}',
                      style: GoogleFonts.manrope(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: AppColors.statusOrcamentoEnviado,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),

          // ─── Corpo do chat ───
          Expanded(
            child: _buildChatBody(),
          ),
        ],
      ),
    );
  }

  Widget _buildChatBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: AppColors.primary,
        ),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(48),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: AppColors.statusAguardando.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.chat_bubble_outline_rounded,
                  size: 32,
                  color: AppColors.statusAguardando,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: GoogleFonts.manrope(
                  fontSize: 14,
                  height: 1.5,
                  color: AppColors.onSurfaceVariant,
                ),
              ),
              const SizedBox(height: 20),
              OutlinedButton.icon(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _errorMessage = null;
                  });
                  _initChannel();
                },
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: Text(
                  'Tentar novamente',
                  style: GoogleFonts.manrope(fontWeight: FontWeight.w600),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (_channel == null) {
      return const Center(
        child: Text('Canal não disponível.'),
      );
    }

    return StreamChannel(
      channel: _channel!,
      child: Column(
        children: [
          Expanded(
            child: StreamMessageListView(
              // No Flutter Web, o tap na mensagem abre o modal de acções
              // que causa crash (Navigator.pop em context inválido).
              onMessageTap: kIsWeb ? (message) {} : null,
              messageBuilder:
                  (context, details, messages, defaultMessageWidget) {
                return defaultMessageWidget.copyWith(
                  showUsername: false,
                  showTimestamp: true,
                  borderRadiusGeometry: BorderRadius.only(
                    topLeft: const Radius.circular(18),
                    topRight: const Radius.circular(18),
                    bottomLeft: Radius.circular(
                        details.isMyMessage ? 18 : 4),
                    bottomRight: Radius.circular(
                        details.isMyMessage ? 4 : 18),
                  ),
                );
              },
            ),
          ),
          Container(
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLowest,
              boxShadow: [
                BoxShadow(
                  color: AppColors.onSurface.withValues(alpha: 0.04),
                  blurRadius: 16,
                  offset: const Offset(0, -4),
                ),
              ],
            ),
            child: const StreamMessageInput(
              showCommandsButton: false,
            ),
          ),
        ],
      ),
    );
  }
}
