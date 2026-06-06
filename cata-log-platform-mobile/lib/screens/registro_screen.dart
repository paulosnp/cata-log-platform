import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../theme/app_snackbar.dart';
import '../providers/auth_provider.dart';
import 'cadastro_verificacao_screen.dart';

class RegistroScreen extends StatefulWidget {
  const RegistroScreen({super.key});

  @override
  State<RegistroScreen> createState() => _RegistroScreenState();
}

class _RegistroScreenState extends State<RegistroScreen>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nomeAtelieController = TextEditingController();
  final _emailController = TextEditingController();
  final _senhaController = TextEditingController();
  final _confirmarSenhaController = TextEditingController();
  final _cepController = TextEditingController();
  final _telefoneController = TextEditingController();
  bool _obscureSenha = true;
  bool _obscureConfirmar = true;

  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOutCubic,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOutCubic,
    ));
    _fadeController.forward();
  }

  @override
  void dispose() {
    _nomeAtelieController.dispose();
    _emailController.dispose();
    _senhaController.dispose();
    _confirmarSenhaController.dispose();
    _cepController.dispose();
    _telefoneController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  Future<void> _handleRegistro() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final sucesso = await authProvider.registrar(
      nomeAtelie: _nomeAtelieController.text.trim(),
      email: _emailController.text.trim(),
      senha: _senhaController.text.trim(),
      cep: _cepController.text.trim(),
      telefoneWhatsapp: _telefoneController.text.trim(),
    );

    if (!mounted) return;

    if (sucesso) {
      AppSnackBar.showSuccess(
        context,
        'Cadastro realizado com sucesso! Faça login para continuar.',
      );
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => CadastroVerificacaoScreen(
            email: _emailController.text.trim(),
            senha: _senhaController.text.trim(),
          ),
        ),
      );
    } else if (authProvider.errorMessage != null) {
      _showError(authProvider.errorMessage!);
      authProvider.clearError();
    }
  }

  void _showError(String message) {
    AppSnackBar.showError(context, message);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.subtleGradient,
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 28),
              child: FadeTransition(
                opacity: _fadeAnimation,
                child: SlideTransition(
                  position: _slideAnimation,
                  child: Form(
                    key: _formKey,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(height: 24),

                        SvgPicture.asset('assets/images/logo.svg', height: 56),
                        const SizedBox(height: 32),

                        Text(
                          'Crie sua conta',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 28,
                            fontWeight: FontWeight.w700,
                            letterSpacing: -0.56,
                            color: AppColors.onSurface,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Cadastre seu atelie e comece a\nvender suas criações.',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.manrope(
                            fontSize: 15,
                            height: 1.6,
                            color: AppColors.onSurfaceVariant,
                          ),
                        ),
                        const SizedBox(height: 32),

                        // Nome do Ateliê
                        _buildField(
                          controller: _nomeAtelieController,
                          label: 'Nome do Atelie',
                          hint: 'Ex: Atelie Maos de Barro',
                          icon: Icons.store_outlined,
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Informe o nome do atelie';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // E-mail
                        _buildField(
                          controller: _emailController,
                          label: 'E-mail',
                          hint: 'seu@email.com',
                          icon: Icons.email_outlined,
                          keyboardType: TextInputType.emailAddress,
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Informe seu e-mail';
                            }
                            if (!val.contains('@') || !val.contains('.')) {
                              return 'E-mail invalido';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Senha
                        _buildField(
                          controller: _senhaController,
                          label: 'Senha',
                          hint: 'Minimo 6 caracteres',
                          icon: Icons.lock_outline,
                          isPassword: true,
                          obscure: _obscureSenha,
                          onToggleObscure: () =>
                              setState(() => _obscureSenha = !_obscureSenha),
                          validator: (val) {
                            if (val == null || val.isEmpty) {
                              return 'Informe uma senha';
                            }
                            if (val.length < 6) {
                              return 'A senha deve ter no minimo 6 caracteres';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Confirmar Senha
                        _buildField(
                          controller: _confirmarSenhaController,
                          label: 'Confirmar Senha',
                          hint: 'Repita a senha',
                          icon: Icons.lock_outline,
                          isPassword: true,
                          obscure: _obscureConfirmar,
                          onToggleObscure: () =>
                              setState(() => _obscureConfirmar = !_obscureConfirmar),
                          validator: (val) {
                            if (val != _senhaController.text) {
                              return 'As senhas nao coincidem';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // CEP
                        _buildField(
                          controller: _cepController,
                          label: 'CEP',
                          hint: '50010-000',
                          icon: Icons.location_on_outlined,
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            LengthLimitingTextInputFormatter(8),
                          ],
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return 'Informe o CEP';
                            }
                            if (val.length < 8) {
                              return 'CEP invalido';
                            }
                            return null;
                          },
                        ),
                        const SizedBox(height: 16),

                        // Telefone (opcional)
                        _buildField(
                          controller: _telefoneController,
                          label: 'WhatsApp (opcional)',
                          hint: '(81) 99999-0000',
                          icon: Icons.phone_outlined,
                          keyboardType: TextInputType.phone,
                        ),
                        const SizedBox(height: 32),

                        // Botão Cadastrar
                        _buildPrimaryButton(),
                        const SizedBox(height: 24),

                        // Voltar para login
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              'Ja tem uma conta? ',
                              style: GoogleFonts.manrope(
                                fontSize: 14,
                                color: AppColors.onSurfaceVariant,
                              ),
                            ),
                            GestureDetector(
                              onTap: () => Navigator.of(context).pop(),
                              child: Text(
                                'Faca login',
                                style: GoogleFonts.manrope(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.primary,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 32),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    bool isPassword = false,
    bool obscure = false,
    VoidCallback? onToggleObscure,
    String? Function(String?)? validator,
    List<TextInputFormatter>? inputFormatters,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            label,
            style: GoogleFonts.manrope(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.5,
              color: AppColors.onSurface,
            ),
          ),
        ),
        TextFormField(
          controller: controller,
          keyboardType: keyboardType,
          obscureText: isPassword ? obscure : false,
          inputFormatters: inputFormatters,
          style: GoogleFonts.manrope(
            fontSize: 15,
            color: AppColors.onSurface,
          ),
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, size: 20, color: AppColors.onSurfaceVariant),
            suffixIcon: isPassword
                ? GestureDetector(
                    onTap: onToggleObscure,
                    child: Icon(
                      obscure
                          ? Icons.visibility_off_outlined
                          : Icons.visibility_outlined,
                      size: 20,
                      color: AppColors.onSurfaceVariant,
                    ),
                  )
                : null,
          ),
          validator: validator,
        ),
      ],
    );
  }

  Widget _buildPrimaryButton() {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, _) {
        final isLoading = authProvider.isLoading;

        return SizedBox(
          width: double.infinity,
          height: 56,
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: AppColors.primaryGradient,
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.3),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: ElevatedButton(
              onPressed: isLoading ? null : _handleRegistro,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.transparent,
                shadowColor: Colors.transparent,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                ),
              ),
              child: isLoading
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor:
                            AlwaysStoppedAnimation<Color>(AppColors.onPrimary),
                      ),
                    )
                  : Text(
                      'Criar Conta',
                      style: GoogleFonts.manrope(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: AppColors.onPrimary,
                      ),
                    ),
            ),
          ),
        );
      },
    );
  }
}
