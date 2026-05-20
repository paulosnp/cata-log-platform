import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../providers/produto_provider.dart';
import '../../models/produto_response.dart';
import '../../core/api/api_client.dart';
import '../editar_obra_screen.dart';
import '../dialogs/excluir_obra_dialog.dart';

class VitrineTab extends StatefulWidget {
  const VitrineTab({super.key});

  @override
  State<VitrineTab> createState() => _VitrineTabState();
}

class _VitrineTabState extends State<VitrineTab> {
  @override
  void initState() {
    super.initState();
    // Carrega os produtos do artesao ao entrar na tab
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<ProdutoProvider>(context, listen: false);
      if (provider.produtos.isEmpty) {
        provider.carregarMeusProdutos();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ProdutoProvider>(
      builder: (context, provider, _) {
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () => provider.carregarMeusProdutos(),
          child: CustomScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // ─── Header ───
            SliverToBoxAdapter(
              child: Container(
                padding: EdgeInsets.only(
                  top: MediaQuery.of(context).padding.top + 16,
                  left: 24,
                  right: 24,
                  bottom: 24,
                ),
                decoration: const BoxDecoration(
                  gradient: AppColors.subtleGradient,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SvgPicture.asset(
                      'assets/images/logo.svg',
                      height: 40,
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Minha Vitrine',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 28,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.56,
                        color: AppColors.onSurface,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Gerencie seus produtos e o status da sua galeria.',
                      style: GoogleFonts.manrope(
                        fontSize: 14,
                        color: AppColors.onSurfaceVariant,
                        height: 1.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // ─── Stats ───
            SliverToBoxAdapter(
              child: Padding(
                padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                child: Row(
                  children: [
                    _StatChip(
                      label: 'Ativos',
                      value: provider.totalAtivos.toString(),
                      color: AppColors.primary,
                    ),
                    const SizedBox(width: 12),
                    _StatChip(
                      label: 'Peças Únicas',
                      value: provider.totalPecasUnicas.toString(),
                      color: AppColors.tertiary,
                    ),
                    const SizedBox(width: 12),
                    _StatChip(
                      label: 'Vendidos',
                      value: provider.totalVendidos.toString(),
                      color: AppColors.statusVendido,
                    ),
                  ],
                ),
              ),
            ),

            // ─── Conteudo ───
            if (provider.isLoading)
              const SliverFillRemaining(
                child: Center(
                  child: CircularProgressIndicator(
                    color: AppColors.primary,
                  ),
                ),
              )
            else if (provider.errorMessage != null)
              SliverFillRemaining(
                child: _buildErrorState(provider),
              )
            else if (provider.produtos.isEmpty)
              SliverFillRemaining(
                child: _buildEmptyState(),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(24, 8, 24, 100),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final produto = provider.produtos[index];
                      return _ProdutoCard(
                        produto: produto,
                        onMenuAction: (action) =>
                            _handleMenuAction(action, produto),
                      );
                    },
                    childCount: provider.produtos.length,
                  ),
                ),
              ),
          ],
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.primaryContainer.withValues(alpha: 0.15),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.palette_outlined,
                size: 40,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Nenhuma obra ainda',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Toque no botão "+" para adicionar\nsua primeira criação à vitrine.',
              textAlign: TextAlign.center,
              style: GoogleFonts.manrope(
                fontSize: 14,
                height: 1.6,
                color: AppColors.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(ProdutoProvider provider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.wifi_off_rounded,
              size: 48,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              provider.errorMessage ?? 'Erro desconhecido',
              textAlign: TextAlign.center,
              style: GoogleFonts.manrope(
                fontSize: 14,
                color: AppColors.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: () => provider.carregarMeusProdutos(),
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

  void _handleMenuAction(String action, ProdutoResponse produto) {
    switch (action) {
      case 'editar':
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => EditarObraScreen(produto: produto),
          ),
        );
        break;
      case 'excluir':
        ExcluirObraDialog.show(context, produto);
        break;
      case 'vender':
        _confirmarVenda(produto);
        break;
    }
  }

  void _confirmarVenda(ProdutoResponse produto) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Confirmar Venda'),
        content: Text(
          'Deseja marcar "${produto.nome}" como vendida?\n\nEsta ação indicará que a peça única já foi comercializada.',
          style: GoogleFonts.manrope(
            fontSize: 14,
            height: 1.6,
            color: AppColors.onSurfaceVariant,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Cancelar',
              style: GoogleFonts.manrope(
                fontWeight: FontWeight.w600,
                color: AppColors.onSurfaceVariant,
              ),
            ),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final provider =
                  Provider.of<ProdutoProvider>(context, listen: false);
              final sucesso = await provider.marcarVendido(produto.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      sucesso
                          ? '🎉 "${produto.nome}" marcada como vendida!'
                          : 'Erro ao marcar como vendida.',
                    ),
                  ),
                );
              }
            },
            child: const Text('Confirmar'),
          ),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatChip({
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: color,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.manrope(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.3,
                color: color.withValues(alpha: 0.8),
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _ProdutoCard extends StatelessWidget {
  final ProdutoResponse produto;
  final Function(String action) onMenuAction;

  const _ProdutoCard({
    required this.produto,
    required this.onMenuAction,
  });

  void _showContextMenu(BuildContext context) {
    final bool showVenderOption = produto.pecaUnica && !produto.vendido;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: BoxDecoration(
          color: AppColors.surfaceContainerLowest,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(AppTheme.radiusXl),
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.onSurface.withValues(alpha: 0.1),
              blurRadius: 30,
              offset: const Offset(0, -8),
            ),
          ],
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                margin: const EdgeInsets.only(top: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.outlineVariant.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              Padding(
                padding: const EdgeInsets.fromLTRB(24, 20, 24, 8),
                child: Row(
                  children: [
                    ClipRRect(
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusSm),
                      child: SizedBox(
                        width: 44,
                        height: 44,
                        child: _buildImage(produto.primeiraImagemUrl, 20),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            produto.nome,
                            style: GoogleFonts.manrope(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppColors.onSurface,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'R\$ ${produto.preco.toStringAsFixed(2).replaceAll('.', ',')}',
                            style: GoogleFonts.manrope(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Container(
                  height: 1,
                  color: AppColors.outlineVariant.withValues(alpha: 0.15),
                ),
              ),

              const SizedBox(height: 4),

              _BottomSheetOption(
                icon: Icons.edit_outlined,
                label: 'Editar Obra',
                onTap: () {
                  Navigator.pop(ctx);
                  onMenuAction('editar');
                },
              ),

              if (showVenderOption)
                _BottomSheetOption(
                  icon: Icons.check_circle_outline,
                  label: 'Marcar como Vendida',
                  onTap: () {
                    Navigator.pop(ctx);
                    onMenuAction('vender');
                  },
                ),

              // ─── Opção destrutiva: Excluir ───
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Container(
                  height: 1,
                  color: AppColors.outlineVariant.withValues(alpha: 0.12),
                ),
              ),
              _BottomSheetOption(
                icon: Icons.delete_outline_rounded,
                label: 'Excluir Obra',
                isDestructive: true,
                onTap: () {
                  Navigator.pop(ctx);
                  onMenuAction('excluir');
                },
              ),

              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildImage(String? url, double iconSize) {
    if (url != null && url.isNotEmpty) {
      // Resolve URL relativa (/imagens/...) para URL absoluta
      String resolvedUrl = url;
      if (!url.startsWith('http')) {
        final base = kIsWeb
            ? 'http://localhost:8080'
            : ApiClient.serverBaseUrl.replaceAll('/api/v1', '');
        resolvedUrl = '$base$url';
      }
      return Image.network(
        resolvedUrl,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => Container(
          color: AppColors.surfaceContainerHigh,
          child: Icon(
            Icons.image_outlined,
            size: iconSize,
            color: AppColors.onSurfaceVariant,
          ),
        ),
      );
    }
    return Container(
      color: AppColors.surfaceContainerHigh,
      child: Icon(
        Icons.image_outlined,
        size: iconSize,
        color: AppColors.onSurfaceVariant,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        boxShadow: [
          BoxShadow(
            color: AppColors.onSurface.withValues(alpha: 0.05),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(AppTheme.radiusMd),
            ),
            child: AspectRatio(
              aspectRatio: 16 / 10,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  _buildImage(produto.primeiraImagemUrl, 48),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 60,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withValues(alpha: 0.15),
                          ],
                        ),
                      ),
                    ),
                  ),
                  if (produto.pecaUnica)
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: produto.vendido
                              ? AppColors.statusVendido
                              : AppColors.tertiary,
                          borderRadius:
                              BorderRadius.circular(AppTheme.radiusFull),
                        ),
                        child: Text(
                          produto.vendido ? 'VENDIDA' : 'PEÇA ÚNICA',
                          style: GoogleFonts.manrope(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 0.8,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),

          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 8, 12),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        produto.nome,
                        style: GoogleFonts.manrope(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'R\$ ${produto.preco.toStringAsFixed(2).replaceAll('.', ',')}',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                ),
                Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () => _showContextMenu(context),
                    borderRadius:
                        BorderRadius.circular(AppTheme.radiusFull),
                    child: Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Icon(
                        Icons.more_vert,
                        size: 22,
                        color: AppColors.onSurfaceVariant
                            .withValues(alpha: 0.7),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _BottomSheetOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final bool isDestructive;

  const _BottomSheetOption({
    required this.icon,
    required this.label,
    required this.onTap,
    this.isDestructive = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = isDestructive ? AppColors.error : AppColors.primary;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(AppTheme.radiusSm),
                ),
                child: Icon(
                  icon,
                  size: 20,
                  color: color,
                ),
              ),
              const SizedBox(width: 16),
              Text(
                label,
                style: GoogleFonts.manrope(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: isDestructive ? AppColors.error : AppColors.onSurface,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
