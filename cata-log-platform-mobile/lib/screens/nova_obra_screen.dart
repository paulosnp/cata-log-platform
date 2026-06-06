
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../theme/app_snackbar.dart';
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
  String _statusText = '';
  int? _categoriaSelecionadaId;

  // ─── Image Picker ───
  final ImagePicker _picker = ImagePicker();
  final List<XFile> _imagensSelecionadas = [];
  static const int _maxImagens = 5;

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

  // ─── Selecionar Imagens ───

  Future<void> _selecionarImagens() async {
    if (_imagensSelecionadas.length >= _maxImagens) {
      _showSnackBar('Limite de $_maxImagens fotos atingido.', isError: true);
      return;
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.surfaceContainerLowest,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.outlineVariant.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Adicionar fotos',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: AppColors.onSurface,
                ),
              ),
              const SizedBox(height: 20),
              _BottomSheetOption(
                icon: Icons.photo_library_rounded,
                label: 'Galeria',
                subtitle: 'Escolher da galeria de fotos',
                onTap: () {
                  Navigator.pop(ctx);
                  _pickFromGallery();
                },
              ),
              const SizedBox(height: 8),
              _BottomSheetOption(
                icon: Icons.camera_alt_rounded,
                label: 'Câmera',
                subtitle: 'Tirar uma foto agora',
                onTap: () {
                  Navigator.pop(ctx);
                  _pickFromCamera();
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickFromGallery() async {
    try {
      final remaining = _maxImagens - _imagensSelecionadas.length;
      final images = await _picker.pickMultiImage(
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (images.isNotEmpty) {
        setState(() {
          final toAdd = images.take(remaining).toList();
          _imagensSelecionadas.addAll(toAdd);
          if (images.length > remaining) {
            _showSnackBar(
              'Apenas $remaining foto(s) adicionada(s). Limite: $_maxImagens.',
              isError: false,
            );
          }
        });
      }
    } on PlatformException catch (_) {
      if (mounted) {
        _showSnackBar(
          'Permissão negada. Ative o acesso à galeria nas configurações.',
          isError: true,
        );
      }
    }
  }

  Future<void> _pickFromCamera() async {
    try {
      final photo = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (photo != null) {
        setState(() => _imagensSelecionadas.add(photo));
      }
    } on PlatformException catch (_) {
      if (mounted) {
        _showSnackBar(
          'Permissão negada. Ative o acesso à câmera nas configurações.',
          isError: true,
        );
      }
    }
  }

  void _removerImagem(int index) {
    setState(() => _imagensSelecionadas.removeAt(index));
  }

  // ─── Submit ───

  Future<void> _submitNovoProduto() async {
    if (!_formKey.currentState!.validate()) return;

    if (_categoriaSelecionadaId == null) {
      _showSnackBar('Selecione uma categoria.', isError: true);
      return;
    }

    setState(() {
      _isSubmitting = true;
      _statusText = 'Publicando...';
    });

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

    // 1. Criar o produto
    final produto = await provider.adicionarProduto(dados);

    if (!mounted) return;

    if (produto == null) {
      setState(() {
        _isSubmitting = false;
        _statusText = '';
      });
      _showSnackBar(provider.errorMessage ?? 'Erro ao criar produto.',
          isError: true);
      provider.clearError();
      return;
    }

    // 2. Upload das imagens (se existirem)
    if (_imagensSelecionadas.isNotEmpty) {
      final total = _imagensSelecionadas.length;
      setState(() =>
          _statusText = 'Enviando fotos... (0/$total)');

      bool allUploadsOk = true;
      for (int i = 0; i < total; i++) {
        if (!mounted) return;
        setState(() =>
            _statusText = 'Enviando fotos... (${i + 1}/$total)');

        try {
          await provider.uploadImagensProduto(
            produto.id,
            [_imagensSelecionadas[i]],
          );
        } catch (_) {
          allUploadsOk = false;
        }
      }

      if (!mounted) return;

      if (!allUploadsOk) {
        _showSnackBar(
          'Produto criado, mas algumas fotos falharam. Tente reenviá-las.',
          isError: true,
        );
      }
    }

    if (!mounted) return;

    setState(() {
      _isSubmitting = false;
      _statusText = '';
    });

    Navigator.of(context).pop(true);
    AppSnackBar.showSuccess(
      context,
      '"${_tituloController.text.trim()}" adicionada à vitrine!',
    );
  }

  void _showSnackBar(String message, {required bool isError}) {
    if (isError) {
      AppSnackBar.showError(context, message);
    } else {
      AppSnackBar.showSuccess(context, message);
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
              // ─── Upload de Fotos ───
              _buildImageSelector(),
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
                          ? _statusText
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

  // ─── Image Selector Widget ───

  Widget _buildImageSelector() {
    if (_imagensSelecionadas.isEmpty) {
      return GestureDetector(
        onTap: _selecionarImagens,
        child: Container(
          width: double.infinity,
          height: 200,
          decoration: BoxDecoration(
            color: AppColors.surfaceContainerLow,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            border: Border.all(
              color: AppColors.outlineVariant.withValues(alpha: 0.3),
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
                'JPG, PNG • Máx. $_maxImagens fotos',
                style: GoogleFonts.manrope(
                  fontSize: 12,
                  color: AppColors.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      );
    }

    // Preview com imagens selecionadas
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Fotos (${_imagensSelecionadas.length}/$_maxImagens)',
              style: GoogleFonts.manrope(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.onSurface,
              ),
            ),
            if (_imagensSelecionadas.length < _maxImagens)
              TextButton.icon(
                onPressed: _selecionarImagens,
                icon: const Icon(Icons.add_rounded, size: 18),
                label: Text(
                  'Adicionar',
                  style: GoogleFonts.manrope(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                ),
              ),
          ],
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 120,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _imagensSelecionadas.length,
            itemBuilder: (context, index) {
              return Padding(
                padding: EdgeInsets.only(
                  right: index < _imagensSelecionadas.length - 1
                      ? 10
                      : 0,
                ),
                child: Stack(
                  children: [
                    ClipRRect(
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusMd),
                      child: FutureBuilder<Uint8List>(
                        future: _imagensSelecionadas[index].readAsBytes(),
                        builder: (context, snapshot) {
                          if (snapshot.hasData) {
                            return Image.memory(
                              snapshot.data!,
                              width: 120,
                              height: 120,
                              fit: BoxFit.cover,
                            );
                          }
                          return const SizedBox(
                            width: 120,
                            height: 120,
                            child: Center(
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.primary,
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    // Botão remover
                    Positioned(
                      top: 4,
                      right: 4,
                      child: GestureDetector(
                        onTap: () => _removerImagem(index),
                        child: Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: AppColors.error.withValues(alpha: 0.9),
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.close_rounded,
                            size: 14,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    // Badge primeira foto
                    if (index == 0)
                      Positioned(
                        bottom: 4,
                        left: 4,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 6,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.inverseSurface
                                .withValues(alpha: 0.7),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            'Capa',
                            style: GoogleFonts.manrope(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: AppColors.inverseOnSurface,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
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

// ─── Bottom Sheet Option ───

class _BottomSheetOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final String subtitle;
  final VoidCallback onTap;

  const _BottomSheetOption({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        child: Padding(
          padding: const EdgeInsets.symmetric(
              horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primaryContainer
                      .withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: AppColors.primary, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: GoogleFonts.manrope(
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onSurface,
                      ),
                    ),
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
              const Icon(
                Icons.chevron_right_rounded,
                color: AppColors.onSurfaceVariant,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
