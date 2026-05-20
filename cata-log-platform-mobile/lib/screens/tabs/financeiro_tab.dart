import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../providers/financeiro_provider.dart';

class FinanceiroTab extends StatefulWidget {
  const FinanceiroTab({super.key});

  @override
  State<FinanceiroTab> createState() => _FinanceiroTabState();
}

class _FinanceiroTabState extends State<FinanceiroTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider =
          Provider.of<FinanceiroProvider>(context, listen: false);
      if (provider.financeiro == null && !provider.isLoading) {
        provider.carregarFinanceiro();
      }
    });
  }

  String _formatCurrency(double value) {
    final isNegative = value < 0;
    final abs = value.abs();
    final formatted = abs.toStringAsFixed(2).replaceAll('.', ',');

    // Adicionar separador de milhar
    final parts = formatted.split(',');
    final intPart = parts[0].replaceAllMapped(
      RegExp(r'(\d)(?=(\d{3})+(?!\d))'),
      (match) => '${match[1]}.',
    );

    final prefix = isNegative ? '-R\$ ' : 'R\$ ';
    return '$prefix$intPart,${parts[1]}';
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<FinanceiroProvider>(
      builder: (context, provider, _) {
        return RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () => provider.carregarFinanceiro(),
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
                      Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              gradient: AppColors.primaryGradient,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(
                              Icons.payments_rounded,
                              color: AppColors.onPrimary,
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              'Financeiro',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: AppColors.onSurface,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Resumo Financeiro',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 28,
                          fontWeight: FontWeight.w700,
                          letterSpacing: -0.56,
                          color: AppColors.onSurface,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Acompanhe seus ganhos e movimentações.',
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

              // ─── Conteúdo Dinâmico ───
              if (provider.isLoading && provider.financeiro == null)
                const SliverFillRemaining(
                  child: Center(
                    child: CircularProgressIndicator(
                      color: AppColors.primary,
                    ),
                  ),
                )
              else if (provider.errorMessage != null &&
                  provider.financeiro == null)
                SliverFillRemaining(
                  child: _buildErrorState(provider),
                )
              else
                ..._buildFinanceiroContent(provider),
            ],
          ),
        );
      },
    );
  }

  List<Widget> _buildFinanceiroContent(FinanceiroProvider provider) {
    final fin = provider.financeiro!;

    return [
      // ─── Card de Faturamento ───
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius:
                  BorderRadius.circular(AppTheme.radiusLg),
              boxShadow: [
                BoxShadow(
                  color:
                      AppColors.primary.withValues(alpha: 0.3),
                  blurRadius: 32,
                  offset: const Offset(0, 12),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Vendas do mês',
                  style: GoogleFonts.manrope(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.onPrimary
                        .withValues(alpha: 0.8),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _formatCurrency(fin.faturamentoMes),
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 36,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onPrimary,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    _RevenueDetail(
                      icon: Icons.trending_up_rounded,
                      label: 'Variação',
                      value: _buildVariacaoText(fin.variacao),
                    ),
                    const SizedBox(width: 24),
                    _RevenueDetail(
                      icon: Icons.shopping_bag_outlined,
                      label: 'Vendas',
                      value: '${fin.totalVendasMes} ${fin.totalVendasMes == 1 ? 'peça' : 'peças'}',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),

      // ─── Saldo Disponível ───
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 0),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surfaceContainerLowest,
              borderRadius:
                  BorderRadius.circular(AppTheme.radiusMd),
              boxShadow: [
                BoxShadow(
                  color: AppColors.onSurface
                      .withValues(alpha: 0.04),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.tertiary
                        .withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.account_balance_wallet_outlined,
                    color: AppColors.tertiary,
                    size: 22,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment:
                        CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Saldo disponível',
                        style: GoogleFonts.manrope(
                          fontSize: 12,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                      Text(
                        _formatCurrency(fin.saldoDisponivel),
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),

      // ─── Título Movimentações ───
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 28, 24, 12),
          child: Text(
            'Últimas Movimentações',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: AppColors.onSurface,
            ),
          ),
        ),
      ),

      // ─── Lista de Movimentações ou Empty State ───
      if (fin.movimentacoes.isEmpty)
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 100),
            child: _buildEmptyState(),
          ),
        )
      else
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 100),
          sliver: SliverList(
            delegate: SliverChildBuilderDelegate(
              (context, index) {
                final mov = fin.movimentacoes[index];
                return _TransactionItem(
                  title: mov.descricao,
                  subtitle: mov.detalhe,
                  value: mov.isIncoming
                      ? '+${_formatCurrency(mov.valor)}'
                      : _formatCurrency(mov.valor),
                  date: mov.data,
                  isIncoming: mov.isIncoming,
                );
              },
              childCount: fin.movimentacoes.length,
            ),
          ),
        ),
    ];
  }

  String _buildVariacaoText(double? variacao) {
    if (variacao == null) return 'Novo!';
    final sign = variacao >= 0 ? '+' : '';
    return '$sign${variacao.toStringAsFixed(0)}%';
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(32),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppTheme.radiusLg),
        boxShadow: [
          BoxShadow(
            color: AppColors.onSurface.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.primaryContainer
                  .withValues(alpha: 0.2),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.storefront_outlined,
              size: 32,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Nenhuma venda ainda',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: AppColors.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Quando você realizar suas primeiras vendas,\nas movimentações aparecerão aqui.',
            textAlign: TextAlign.center,
            style: GoogleFonts.manrope(
              fontSize: 13,
              color: AppColors.onSurfaceVariant,
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(FinanceiroProvider provider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline_rounded,
              size: 48,
              color: AppColors.error,
            ),
            const SizedBox(height: 16),
            Text(
              provider.errorMessage!,
              textAlign: TextAlign.center,
              style: GoogleFonts.manrope(
                fontSize: 14,
                color: AppColors.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 20),
            OutlinedButton.icon(
              onPressed: () => provider.carregarFinanceiro(),
              icon: const Icon(Icons.refresh_rounded, size: 18),
              label: const Text('Tentar novamente'),
            ),
          ],
        ),
      ),
    );
  }
}

class _RevenueDetail extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _RevenueDetail({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon,
            size: 18,
            color: AppColors.onPrimary.withValues(alpha: 0.7)),
        const SizedBox(width: 6),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: GoogleFonts.manrope(
                fontSize: 11,
                color:
                    AppColors.onPrimary.withValues(alpha: 0.7),
              ),
            ),
            Text(
              value,
              style: GoogleFonts.manrope(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.onPrimary,
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _TransactionItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final String value;
  final String date;
  final bool isIncoming;

  const _TransactionItem({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.date,
    required this.isIncoming,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        boxShadow: [
          BoxShadow(
            color:
                AppColors.onSurface.withValues(alpha: 0.03),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: isIncoming
                  ? AppColors.statusOrcamentoEnviado
                      .withValues(alpha: 0.1)
                  : AppColors.error.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              isIncoming
                  ? Icons.arrow_downward_rounded
                  : Icons.arrow_upward_rounded,
              size: 20,
              color: isIncoming
                  ? AppColors.statusOrcamentoEnviado
                  : AppColors.error,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: GoogleFonts.manrope(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurface,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: GoogleFonts.manrope(
                    fontSize: 12,
                    color: AppColors.onSurfaceVariant,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                value,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: isIncoming
                      ? AppColors.statusOrcamentoEnviado
                      : AppColors.error,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                date,
                style: GoogleFonts.manrope(
                  fontSize: 11,
                  color: AppColors.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
