import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../models/produto_response.dart';
import '../../providers/produto_provider.dart';

/// Dialog de confirmação para exclusão de obra com padrão de segurança GitHub.
/// O utilizador precisa digitar o nome exato da obra para ativar o botão de exclusão.
class ExcluirObraDialog extends StatefulWidget {
  final ProdutoResponse produto;

  const ExcluirObraDialog({super.key, required this.produto});

  /// Exibe o dialog e retorna `true` se a obra foi excluída com sucesso.
  static Future<bool?> show(BuildContext context, ProdutoResponse produto) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (_) => ExcluirObraDialog(produto: produto),
    );
  }

  @override
  State<ExcluirObraDialog> createState() => _ExcluirObraDialogState();
}

class _ExcluirObraDialogState extends State<ExcluirObraDialog> {
  final _controller = TextEditingController();
  bool _isDeleting = false;
  bool _nomeConfere = false;

  @override
  void initState() {
    super.initState();
    _controller.addListener(_onTextChanged);
  }

  @override
  void dispose() {
    _controller.removeListener(_onTextChanged);
    _controller.dispose();
    super.dispose();
  }

  void _onTextChanged() {
    final confere = _controller.text == widget.produto.nome;
    if (confere != _nomeConfere) {
      setState(() => _nomeConfere = confere);
    }
  }

  Future<void> _confirmarExclusao() async {
    if (!_nomeConfere || _isDeleting) return;

    setState(() => _isDeleting = true);

    final provider = Provider.of<ProdutoProvider>(context, listen: false);
    final sucesso = await provider.removerProduto(widget.produto.id);

    if (!mounted) return;

    Navigator.of(context).pop(sucesso);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              sucesso ? Icons.check_circle_outline : Icons.error_outline,
              color: Colors.white,
              size: 20,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                sucesso
                    ? '🗑️ "${widget.produto.nome}" foi excluída com sucesso.'
                    : 'Erro ao excluir a obra. Tente novamente.',
                style: GoogleFonts.manrope(fontSize: 14),
              ),
            ),
          ],
        ),
        backgroundColor:
            sucesso ? AppColors.statusOrcamentoEnviado : AppColors.error,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.surfaceContainerLowest,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
      ),
      titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 0),
      contentPadding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
      actionsPadding: const EdgeInsets.fromLTRB(24, 16, 24, 20),
      title: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.error.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
            ),
            child: const Icon(
              Icons.warning_amber_rounded,
              color: AppColors.error,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Excluir Obra',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.error,
              ),
            ),
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.error.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(AppTheme.radiusSm),
              border: Border.all(
                color: AppColors.error.withValues(alpha: 0.15),
              ),
            ),
            child: RichText(
              text: TextSpan(
                style: GoogleFonts.manrope(
                  fontSize: 13,
                  height: 1.6,
                  color: AppColors.onSurface,
                ),
                children: [
                  const TextSpan(
                    text: 'Atenção: ',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const TextSpan(
                    text:
                        'Esta ação é irreversível. Para confirmar a exclusão, digite o nome exato da obra abaixo:\n\n',
                  ),
                  TextSpan(
                    text: widget.produto.nome,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w800,
                      color: AppColors.error,
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Nome da obra',
            style: GoogleFonts.manrope(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
              color: AppColors.onSurfaceVariant,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _controller,
            enabled: !_isDeleting,
            style: GoogleFonts.manrope(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: AppColors.onSurface,
            ),
            decoration: InputDecoration(
              hintText: 'Digite o nome exato para confirmar',
              hintStyle: GoogleFonts.manrope(
                fontSize: 13,
                color: AppColors.onSurfaceVariant.withValues(alpha: 0.5),
              ),
              filled: true,
              fillColor: AppColors.surfaceContainerLow,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                borderSide: BorderSide(
                  color: _nomeConfere
                      ? AppColors.error
                      : AppColors.outlineVariant.withValues(alpha: 0.3),
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                borderSide: BorderSide(
                  color: _nomeConfere
                      ? AppColors.error.withValues(alpha: 0.5)
                      : AppColors.outlineVariant.withValues(alpha: 0.3),
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                borderSide: BorderSide(
                  color: _nomeConfere ? AppColors.error : AppColors.primary,
                  width: 2,
                ),
              ),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            ),
          ),
        ],
      ),
      actions: [
        Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: _isDeleting ? null : () => Navigator.pop(context),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  foregroundColor: AppColors.onSurfaceVariant,
                  side: BorderSide(
                    color: AppColors.outlineVariant.withValues(alpha: 0.3),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                  ),
                ),
                child: Text(
                  'Cancelar',
                  style: GoogleFonts.manrope(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AnimatedOpacity(
                duration: const Duration(milliseconds: 200),
                opacity: _nomeConfere ? 1.0 : 0.5,
                child: FilledButton(
                  onPressed: _nomeConfere && !_isDeleting
                      ? _confirmarExclusao
                      : null,
                  style: FilledButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    backgroundColor: AppColors.error,
                    foregroundColor: AppColors.onError,
                    disabledBackgroundColor:
                        AppColors.error.withValues(alpha: 0.3),
                    disabledForegroundColor:
                        AppColors.onError.withValues(alpha: 0.5),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusSm),
                    ),
                  ),
                  child: _isDeleting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor:
                                AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Text(
                          'Excluir',
                          style: GoogleFonts.manrope(
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
