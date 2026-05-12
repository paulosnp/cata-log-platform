import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_theme.dart';
import '../../providers/encomenda_provider.dart';
import '../../models/encomenda_response.dart';
import '../orcamento_screen.dart';
import '../chat_screen.dart';

class EncomendasTab extends StatefulWidget {
  const EncomendasTab({super.key});

  @override
  State<EncomendasTab> createState() => _EncomendasTabState();
}

class _EncomendasTabState extends State<EncomendasTab> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<EncomendaProvider>(context, listen: false);
      if (provider.encomendas.isEmpty) {
        provider.carregarEncomendas();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<EncomendaProvider>(
      builder: (context, provider, _) {
        return CustomScrollView(
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
                            Icons.assignment_rounded,
                            color: AppColors.onPrimary,
                            size: 22,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Encomendas',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 22,
                              fontWeight: FontWeight.w700,
                              color: AppColors.onSurface,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Gerencie seus pedidos personalizados.',
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
            if (!provider.isLoading && provider.encomendas.isNotEmpty)
              SliverToBoxAdapter(
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                  child: Row(
                    children: [
                      _StatChip(
                        label: 'Pendentes',
                        value: provider.totalAguardando.toString(),
                        color: AppColors.statusAguardando,
                      ),
                      const SizedBox(width: 12),
                      _StatChip(
                        label: 'Enviadas',
                        value: provider.totalEnviadas.toString(),
                        color: AppColors.statusOrcamentoEnviado,
                      ),
                      const SizedBox(width: 12),
                      _StatChip(
                        label: 'Acordadas',
                        value: provider.totalAcordadas.toString(),
                        color: AppColors.primary,
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
            else if (provider.encomendas.isEmpty)
              SliverFillRemaining(
                child: _buildEmptyState(),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 100),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final encomenda = provider.encomendas[index];
                      return _EncomendaCard(
                        encomenda: encomenda,
                        onTap: () => _handleEncomendaTap(encomenda),
                      );
                    },
                    childCount: provider.encomendas.length,
                  ),
                ),
              ),
          ],
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
                color: AppColors.statusAguardando.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.assignment_outlined,
                size: 40,
                color: AppColors.statusAguardando,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Sem encomendas',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.onSurface,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Não tens novas encomendas.\nQuando um cliente solicitar uma peça,\nela aparecerá aqui.',
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

  Widget _buildErrorState(EncomendaProvider provider) {
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
              onPressed: () => provider.carregarEncomendas(),
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

  void _handleEncomendaTap(EncomendaResponse encomenda) async {
    if (encomenda.isAguardandoArtesao) {
      final result = await Navigator.of(context).push<bool>(
        MaterialPageRoute(
          builder: (_) => OrcamentoScreen(encomenda: encomenda),
        ),
      );
      if (result == true && mounted) {
        // Recarrega e abre o chat
        final provider =
            Provider.of<EncomendaProvider>(context, listen: false);
        provider.carregarEncomendas();
      }
    } else if (!encomenda.isCancelada) {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => ChatScreen(encomenda: encomenda),
        ),
      );
    }
  }
}

// ─── Stats Chip ───

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

// ─── Encomenda Card ───

class _EncomendaCard extends StatelessWidget {
  final EncomendaResponse encomenda;
  final VoidCallback onTap;

  const _EncomendaCard({
    required this.encomenda,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(18),
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
            // Cabecalho: avatar + nome + badge
            Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.12),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      encomenda.inicialComprador,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: _statusColor,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        encomenda.nomeComprador ?? 'Cliente',
                        style: GoogleFonts.manrope(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: AppColors.onSurface,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '#${encomenda.id}',
                        style: GoogleFonts.manrope(
                          fontSize: 12,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
                _StatusBadge(status: encomenda.status),
              ],
            ),
            const SizedBox(height: 14),

            // Descricao
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.surfaceContainerLow,
                borderRadius: BorderRadius.circular(AppTheme.radiusSm),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.palette_outlined,
                    size: 18,
                    color: AppColors.onSurfaceVariant,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      encomenda.descricaoExibicao,
                      style: GoogleFonts.manrope(
                        fontSize: 13,
                        color: AppColors.onSurfaceVariant,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // Preco e prazo (se ja respondida)
            if (encomenda.precoProposto != null) ...[
              const SizedBox(height: 14),
              Row(
                children: [
                  _InfoTag(
                    icon: Icons.payments_outlined,
                    label:
                        'R\$ ${encomenda.precoProposto!.toStringAsFixed(2).replaceAll('.', ',')}',
                  ),
                  const SizedBox(width: 12),
                  if (encomenda.tempoProducaoDias != null)
                    _InfoTag(
                      icon: Icons.schedule_outlined,
                      label: '${encomenda.tempoProducaoDias} dias',
                    ),
                ],
              ),
            ],

            // Acao
            if (!encomenda.isCancelada) ...[
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    encomenda.isAguardandoArtesao
                        ? 'Enviar Orçamento'
                        : 'Abrir Chat',
                    style: GoogleFonts.manrope(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: AppColors.primary,
                    ),
                  ),
                  const SizedBox(width: 4),
                  const Icon(
                    Icons.arrow_forward_ios_rounded,
                    size: 14,
                    color: AppColors.primary,
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Color get _statusColor {
    switch (encomenda.status) {
      case 'AGUARDANDO_ARTESAO':
        return AppColors.statusAguardando;
      case 'AGUARDANDO_COMPRADOR':
        return AppColors.statusOrcamentoEnviado;
      case 'PRECO_ACORDADO':
        return AppColors.primary;
      case 'CANCELADO_ESTORNO_TOTAL':
        return AppColors.outlineVariant;
      case 'CANCELADO_COM_TAXA':
        return AppColors.error;
      default:
        return AppColors.onSurfaceVariant;
    }
  }
}

// ─── Status Badge ───

class _StatusBadge extends StatelessWidget {
  final String status;
  const _StatusBadge({required this.status});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: _color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(AppTheme.radiusFull),
      ),
      child: Text(
        _label,
        style: GoogleFonts.manrope(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 0.3,
          color: _color,
        ),
      ),
    );
  }

  String get _label {
    switch (status) {
      case 'AGUARDANDO_ARTESAO':
        return 'Aguardando';
      case 'AGUARDANDO_COMPRADOR':
        return 'Proposta Enviada';
      case 'PRECO_ACORDADO':
        return 'Acordo Firmado';
      case 'CANCELADO_ESTORNO_TOTAL':
        return 'Cancelada';
      case 'CANCELADO_COM_TAXA':
        return 'Cancelada (taxa)';
      default:
        return status;
    }
  }

  Color get _color {
    switch (status) {
      case 'AGUARDANDO_ARTESAO':
        return AppColors.statusAguardando;
      case 'AGUARDANDO_COMPRADOR':
        return AppColors.statusOrcamentoEnviado;
      case 'PRECO_ACORDADO':
        return AppColors.primary;
      case 'CANCELADO_ESTORNO_TOTAL':
        return AppColors.outlineVariant;
      case 'CANCELADO_COM_TAXA':
        return AppColors.error;
      default:
        return AppColors.onSurfaceVariant;
    }
  }
}

// ─── Info Tag ───

class _InfoTag extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoTag({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: AppColors.onSurfaceVariant),
        const SizedBox(width: 4),
        Text(
          label,
          style: GoogleFonts.manrope(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AppColors.onSurface,
          ),
        ),
      ],
    );
  }
}
