import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../theme/app_snackbar.dart';
import '../providers/artesao_provider.dart';
import '../core/api/api_client.dart';

class PerfilScreen extends StatefulWidget {
  const PerfilScreen({super.key});

  @override
  State<PerfilScreen> createState() => _PerfilScreenState();
}

class _PerfilScreenState extends State<PerfilScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nomeController = TextEditingController();
  final _biografiaController = TextEditingController();
  final _whatsappController = TextEditingController();
  final _cepController = TextEditingController();
  bool _isLoaded = false;
  bool _isUploadingFoto = false;
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _carregarPerfil();
    });
  }

  @override
  void dispose() {
    _nomeController.dispose();
    _biografiaController.dispose();
    _whatsappController.dispose();
    _cepController.dispose();
    super.dispose();
  }

  Future<void> _carregarPerfil() async {
    final provider = Provider.of<ArtesaoProvider>(context, listen: false);
    await provider.carregarPerfil();

    if (mounted && provider.perfil != null) {
      final p = provider.perfil!;
      setState(() {
        _nomeController.text = p.nomeAtelie ?? '';
        _biografiaController.text = p.biografia ?? '';
        _whatsappController.text = p.telefoneWhatsapp ?? '';
        _cepController.text = p.cep ?? '';
        _isLoaded = true;
      });
    }
  }

  Future<void> _selecionarFotoPerfil() async {
    try {
      final photo = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 80,
      );

      if (photo == null || !mounted) return;

      setState(() => _isUploadingFoto = true);

      // Ler bytes do XFile (compatível com Web e Mobile)
      final bytes = await photo.readAsBytes();
      final filename = photo.name;

      if (!mounted) return;

      final provider = Provider.of<ArtesaoProvider>(context, listen: false);
      final sucesso = await provider.uploadFoto(bytes, filename);

      if (!mounted) return;

      setState(() => _isUploadingFoto = false);

      if (sucesso) {
        AppSnackBar.showSuccess(context, 'Foto atualizada!');
      } else {
        AppSnackBar.showError(
          context,
          provider.errorMessage ?? 'Erro ao enviar foto.',
        );
        provider.clearError();
      }
    } on PlatformException catch (_) {
      if (mounted) {
        AppSnackBar.showError(
          context,
          'Permissão negada. Ative o acesso à galeria.',
        );
      }
    }
  }

  Future<void> _salvarPerfil() async {
    if (!_formKey.currentState!.validate()) return;

    final provider = Provider.of<ArtesaoProvider>(context, listen: false);
    final dados = <String, dynamic>{
      'nomeAtelie': _nomeController.text.trim(),
      'biografia': _biografiaController.text.trim(),
      'telefoneWhatsapp': _whatsappController.text.trim(),
      'cep': _cepController.text.trim(),
    };

    final sucesso = await provider.atualizarPerfil(dados);

    if (!mounted) return;

    if (sucesso) {
      AppSnackBar.showSuccess(context, 'Perfil atualizado com sucesso!');
    } else {
      AppSnackBar.showError(
        context,
        provider.errorMessage ?? 'Erro ao atualizar perfil.',
      );
      provider.clearError();
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
        title: Text(
          'Meu Ateliê',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: AppColors.onSurface,
          ),
        ),
        centerTitle: true,
      ),
      body: Consumer<ArtesaoProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading && !_isLoaded) {
            return const Center(
              child: CircularProgressIndicator(
                color: AppColors.primary,
              ),
            );
          }

          if (provider.errorMessage != null && !_isLoaded) {
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
                      onPressed: _carregarPerfil,
                      icon: const Icon(Icons.refresh_rounded, size: 18),
                      label: const Text('Tentar novamente'),
                    ),
                  ],
                ),
              ),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                children: [
                  // ─── Avatar + Info ───
                  _buildProfileHeader(provider),
                  const SizedBox(height: 32),

                  // ─── Formulário ───
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceContainerLowest,
                      borderRadius:
                          BorderRadius.circular(AppTheme.radiusLg),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.onSurface
                              .withValues(alpha: 0.04),
                          blurRadius: 24,
                          offset: const Offset(0, 8),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildLabel('Nome do Ateliê'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _nomeController,
                          style: GoogleFonts.manrope(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                            color: AppColors.onSurface,
                          ),
                          decoration: const InputDecoration(
                            hintText: 'Nome do seu ateliê',
                            prefixIcon: Icon(
                              Icons.storefront_outlined,
                              size: 20,
                              color: AppColors.onSurfaceVariant,
                            ),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Informe o nome do ateliê';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 20),

                        _buildLabel('Biografia'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _biografiaController,
                          maxLines: 4,
                          style: GoogleFonts.manrope(
                            fontSize: 14,
                            color: AppColors.onSurface,
                          ),
                          decoration: const InputDecoration(
                            hintText:
                                'Conte a história do seu ateliê, suas inspirações e técnicas...',
                            alignLabelWithHint: true,
                          ),
                        ),
                        const SizedBox(height: 20),

                        _buildLabel('WhatsApp'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _whatsappController,
                          keyboardType: TextInputType.phone,
                          style: GoogleFonts.manrope(
                            fontSize: 15,
                            color: AppColors.onSurface,
                          ),
                          decoration: const InputDecoration(
                            hintText: '(11) 99999-9999',
                            prefixIcon: Icon(
                              Icons.phone_outlined,
                              size: 20,
                              color: AppColors.onSurfaceVariant,
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),

                        _buildLabel('CEP'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _cepController,
                          keyboardType: TextInputType.number,
                          style: GoogleFonts.manrope(
                            fontSize: 15,
                            color: AppColors.onSurface,
                          ),
                          decoration: InputDecoration(
                            hintText: '00000-000',
                            prefixIcon: const Icon(
                              Icons.location_on_outlined,
                              size: 20,
                              color: AppColors.onSurfaceVariant,
                            ),
                            suffixIcon: provider.perfil?.estado != null
                                ? Padding(
                                    padding:
                                        const EdgeInsets.only(right: 12),
                                    child: Text(
                                      '${provider.perfil!.cidade ?? ''} - ${provider.perfil!.estado ?? ''}',
                                      style: GoogleFonts.manrope(
                                        fontSize: 12,
                                        color:
                                            AppColors.onSurfaceVariant,
                                      ),
                                    ),
                                  )
                                : null,
                            suffixIconConstraints:
                                const BoxConstraints(
                                    minWidth: 0, minHeight: 0),
                          ),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Informe o CEP';
                            }
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 32),

                  // ─── Botão Salvar ───
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
                        onPressed: provider.isLoading
                            ? null
                            : _salvarPerfil,
                        icon: provider.isLoading
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
                            : const Icon(Icons.save_rounded,
                                size: 20),
                        label: Text(
                          provider.isLoading
                              ? 'Salvando...'
                              : 'Salvar Alterações',
                          style: GoogleFonts.manrope(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                          ),
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
          );
        },
      ),
    );
  }

  Widget _buildProfileHeader(ArtesaoProvider provider) {
    final perfil = provider.perfil;
    final inicial = (perfil?.nomeAtelie ?? 'A').substring(0, 1).toUpperCase();
    final hasFoto = perfil?.fotoUrl != null && perfil!.fotoUrl!.isNotEmpty;

    // Construir URL da imagem — strip /api/v1 do serverBaseUrl
    String? fotoFullUrl;
    if (hasFoto) {
      final base = kIsWeb
          ? 'http://localhost:8080'
          : ApiClient.serverBaseUrl.replaceAll('/api/v1', '');
      fotoFullUrl = '$base${perfil.fotoUrl}';
    }

    return Column(
      children: [
        GestureDetector(
          onTap: _isUploadingFoto ? null : _selecionarFotoPerfil,
          child: Stack(
            children: [
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  gradient: hasFoto ? null : AppColors.primaryGradient,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 24,
                      offset: const Offset(0, 8),
                    ),
                  ],
                  image: hasFoto
                      ? DecorationImage(
                          image: NetworkImage(fotoFullUrl!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: _isUploadingFoto
                    ? const Center(
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            AppColors.onPrimary,
                          ),
                        ),
                      )
                    : hasFoto
                        ? null
                        : Center(
                            child: Text(
                              inicial,
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 36,
                                fontWeight: FontWeight.w700,
                                color: AppColors.onPrimary,
                              ),
                            ),
                          ),
              ),
              // Camera overlay
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: AppColors.surfaceContainerLowest,
                      width: 2.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.onSurface.withValues(alpha: 0.15),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons.camera_alt_rounded,
                    size: 16,
                    color: AppColors.onPrimary,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        Text(
          perfil?.nomeAtelie ?? 'Meu Ateliê',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.onSurface,
          ),
        ),
        const SizedBox(height: 4),
        if (perfil?.seloVerificado == true)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.verified_rounded,
                size: 16,
                color: AppColors.primary,
              ),
              const SizedBox(width: 4),
              Text(
                'Verificado',
                style: GoogleFonts.manrope(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        if (perfil?.email != null) ...[
          const SizedBox(height: 4),
          Text(
            perfil!.email,
            style: GoogleFonts.manrope(
              fontSize: 13,
              color: AppColors.onSurfaceVariant,
            ),
          ),
        ],
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
