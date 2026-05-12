import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../providers/produto_provider.dart';

class NovaObraScreen extends StatefulWidget {
  const NovaObraScreen({super.key});

  @override
  State<NovaObraScreen> createState() => _NovaObraScreenState();
}

class _NovaObraScreenState extends State<NovaObraScreen> {
  final _formKey = GlobalKey<FormState>();
  final _tituloController = TextEditingController();
  final _precoController = TextEditingController();
  final _descricaoController = TextEditingController();
  final _materialController = TextEditingController();
  bool _pecaUnica = false;
  bool _isSubmitting = false;
  int? _categoriaSelecionadaId;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<ProdutoProvider>(context, listen: false);
      if (provider.categorias.isEmpty) {
        provider.carregarCategorias();
      }
    });
  }

  @override
  void dispose() {
    _tituloController.dispose();
    _precoController.dispose();
    _descricaoController.dispose();
    _materialController.dispose();
    super.dispose();
  }

  Future<void> _submitNovoProduto() async {
    if (!_formKey.currentState!.validate()) return;

    if (_categoriaSelecionadaId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Selecione uma categoria.',
            style: GoogleFonts.manrope(fontSize: 14),
          ),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
        ),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    final dados = <String, dynamic>{
      'nome': _tituloController.text.trim(),
      'preco': double.tryParse(
              _precoController.text.replaceAll(',', '.')) ??
          0,
      'categoriaId': _categoriaSelecionadaId,
      'pecaUnica': _pecaUnica,
    };

    final descricao = _descricaoController.text.trim();
    if (descricao.isNotEmpty) dados['descricao'] = descricao;

    final material = _materialController.text.trim();
    if (material.isNotEmpty) dados['material'] = material;

    final provider = Provider.of<ProdutoProvider>(context, listen: false);
    final sucesso = await provider.adicionarProduto(dados);

    if (!mounted) return;

    setState(() => _isSubmitting = false);

    if (sucesso) {
      Navigator.of(context).pop(true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_outline,
                  color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  '"${_tituloController.text.trim()}" adicionada à vitrine!',
                  style: GoogleFonts.manrope(
                      fontSize: 14, fontWeight: FontWeight.w500),
                ),
              ),
            ],
          ),
          backgroundColor: AppColors.statusOrcamentoEnviado,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          ),
        ),
      );
    } else if (provider.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error_outline,
                  color: AppColors.onError, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  provider.errorMessage!,
                  style: GoogleFonts.manrope(fontSize: 14),
                ),
              ),
            ],
          ),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          ),
        ),
      );
      provider.clearError();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Nova Obra'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ─── Upload de Fotos (placeholder) ───
              GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text(
                          '📷 Upload de imagem disponível na próxima versão'),
                    ),
                  );
                },
                child: Container(
                  width: double.infinity,
                  height: 200,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceContainerLow,
                    borderRadius:
                        BorderRadius.circular(AppTheme.radiusLg),
                    border: Border.all(
                      color:
                          AppColors.outlineVariant.withValues(alpha: 0.3),
                      width: 2,
                      strokeAlign: BorderSide.strokeAlignInside,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: AppColors.primaryContainer
                              .withValues(alpha: 0.2),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.add_a_photo_outlined,
                          size: 28,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Adicionar fotos da sua obra',
                        style: GoogleFonts.manrope(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'JPG, PNG • Máx. 5 fotos',
                        style: GoogleFonts.manrope(
                          fontSize: 12,
                          color: AppColors.onSurfaceVariant,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // ─── Nome ───
              _buildLabel('Nome da Obra'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _tituloController,
                style: GoogleFonts.manrope(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: AppColors.onSurface,
                ),
                decoration: const InputDecoration(
                  hintText: 'Ex: Vaso de Cerâmica Rústica',
                  prefixIcon: Icon(
                    Icons.palette_outlined,
                    size: 20,
                    color: AppColors.onSurfaceVariant,
                  ),
                ),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return 'Informe o nome da obra';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // ─── Categoria (da API) ───
              _buildLabel('Categoria'),
              const SizedBox(height: 8),
              Consumer<ProdutoProvider>(
                builder: (context, provider, _) {
                  if (provider.categorias.isEmpty) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Row(
                        children: [
                          const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            'Carregando categorias...',
                            style: GoogleFonts.manrope(
                              fontSize: 13,
                              color: AppColors.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: provider.categorias.map((cat) {
                      final selected =
                          cat.id == _categoriaSelecionadaId;
                      return GestureDetector(
                        onTap: () => setState(
                            () => _categoriaSelecionadaId = cat.id),
                        child: AnimatedContainer(
                          duration:
                              const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: selected
                                ? AppColors.primary
                                : AppColors.surfaceContainerHigh,
                            borderRadius: BorderRadius.circular(
                                AppTheme.radiusFull),
                          ),
                          child: Text(
                            cat.nome,
                            style: GoogleFonts.manrope(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: selected
                                  ? AppColors.onPrimary
                                  : AppColors.onSurface,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  );
                },
              ),
              const SizedBox(height: 24),

              // ─── Preco ───
              _buildLabel('Preço (R\$)'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _precoController,
                keyboardType: const TextInputType.numberWithOptions(
                    decimal: true),
                inputFormatters: [
                  FilteringTextInputFormatter.allow(
                      RegExp(r'[\d,.]')),
                ],
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 22,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
                decoration: InputDecoration(
                  hintText: '0,00',
                  hintStyle: GoogleFonts.plusJakartaSans(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: AppColors.onSurfaceVariant
                        .withValues(alpha: 0.3),
                  ),
                  prefixIcon: Padding(
                    padding:
                        const EdgeInsets.only(left: 16, right: 8),
                    child: Text(
                      'R\$',
                      style: GoogleFonts.manrope(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.onSurfaceVariant,
                      ),
                    ),
                  ),
                  prefixIconConstraints: const BoxConstraints(
                      minWidth: 0, minHeight: 0),
                ),
                validator: (val) {
                  if (val == null || val.isEmpty) {
                    return 'Informe o preço';
                  }
                  final parsed =
                      double.tryParse(val.replaceAll(',', '.'));
                  if (parsed == null || parsed <= 0) {
                    return 'Preço inválido';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 24),

              // ─── Descricao ───
              _buildLabel('Descrição (opcional)'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descricaoController,
                maxLines: 3,
                style: GoogleFonts.manrope(
                  fontSize: 14,
                  color: AppColors.onSurface,
                ),
                decoration: const InputDecoration(
                  hintText:
                      'Conte a história desta peça, materiais usados, dimensões...',
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 24),

              // ─── Material ───
              _buildLabel('Material (opcional)'),
              const SizedBox(height: 8),
              TextFormField(
                controller: _materialController,
                style: GoogleFonts.manrope(
                  fontSize: 14,
                  color: AppColors.onSurface,
                ),
                decoration: const InputDecoration(
                  hintText: 'Ex: Cerâmica, barro, tinta natural',
                  prefixIcon: Icon(
                    Icons.texture_outlined,
                    size: 20,
                    color: AppColors.onSurfaceVariant,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // ─── Peca Unica ───
              Container(
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
                        color:
                            AppColors.tertiary.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.diamond_outlined,
                        color: AppColors.tertiary,
                        size: 22,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Peça Única',
                            style: GoogleFonts.manrope(
                              fontSize: 15,
                              fontWeight: FontWeight.w700,
                              color: AppColors.onSurface,
                            ),
                          ),
                          Text(
                            'Exclusiva, sem reprodução',
                            style: GoogleFonts.manrope(
                              fontSize: 12,
                              color: AppColors.onSurfaceVariant,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: _pecaUnica,
                      onChanged: (v) =>
                          setState(() => _pecaUnica = v),
                      activeThumbColor: AppColors.primary,
                      activeTrackColor: AppColors.primaryContainer
                          .withValues(alpha: 0.5),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 36),

              // ─── Botao Publicar ───
              SizedBox(
                width: double.infinity,
                height: 56,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: AppColors.primaryGradient,
                    borderRadius:
                        BorderRadius.circular(AppTheme.radiusMd),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary
                            .withValues(alpha: 0.3),
                        blurRadius: 24,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: ElevatedButton.icon(
                    onPressed:
                        _isSubmitting ? null : _submitNovoProduto,
                    icon: _isSubmitting
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor:
                                  AlwaysStoppedAnimation<Color>(
                                AppColors.onPrimary,
                              ),
                            ),
                          )
                        : const Icon(Icons.publish_rounded,
                            size: 20),
                    label: Text(
                      _isSubmitting
                          ? 'Publicando...'
                          : 'Publicar na Vitrine',
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      foregroundColor: AppColors.onPrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(
                            AppTheme.radiusMd),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: GoogleFonts.manrope(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        letterSpacing: 0.5,
        color: AppColors.onSurface,
      ),
    );
  }
}
