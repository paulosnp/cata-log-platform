import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../theme/app_snackbar.dart';
import '../services/auth_service.dart';
import '../providers/auth_provider.dart';
import 'dashboard_screen.dart';

class CadastroVerificacaoScreen extends StatefulWidget {
  final String email;
  final String? senha;

  const CadastroVerificacaoScreen({
    super.key,
    required this.email,
    this.senha,
  });

  @override
  State<CadastroVerificacaoScreen> createState() => _CadastroVerificacaoScreenState();
}

class _CadastroVerificacaoScreenState extends State<CadastroVerificacaoScreen>
    with SingleTickerProviderStateMixin {
  final AuthService _authService = AuthService();

  bool _isLoading = false;
  String? _error;
  bool _success = false;

  // PIN step
  final List<TextEditingController> _pinControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _pinFocusNodes = List.generate(6, (_) => FocusNode());
  bool _pinError = false;
  int _resendTimer = 0;
  Timer? _resendTimerRef;
  bool _resending = false;

  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _fadeAnim = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOut,
    );
    _animController.forward();
    _startResendTimer();
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_pinFocusNodes[0].canRequestFocus) {
        _pinFocusNodes[0].requestFocus();
      }
    });
  }

  @override
  void dispose() {
    for (final c in _pinControllers) {
      c.dispose();
    }
    for (final f in _pinFocusNodes) {
      f.dispose();
    }
    _animController.dispose();
    _resendTimerRef?.cancel();
    super.dispose();
  }

  String get _pin => _pinControllers.map((c) => c.text).join();

  String _maskEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;
    final user = parts[0];
    final domain = parts[1];
    final maskedUser = user.length > 1 ? '${user[0]}***' : '***';
    final domainParts = domain.split('.');
    final maskedDomain = domainParts[0].length > 1 ? '${domainParts[0][0]}***' : '***';
    return '$maskedUser@$maskedDomain.${domainParts.sublist(1).join('.')}';
  }

  void _startResendTimer() {
    _resendTimerRef?.cancel();
    setState(() => _resendTimer = 30);
    _resendTimerRef = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) {
        timer.cancel();
        return;
      }
      setState(() {
        _resendTimer--;
        if (_resendTimer <= 0) timer.cancel();
      });
    });
  }

  Future<void> _handleVerifyPin() async {
    if (_pin.length != 6) {
      setState(() => _pinError = true);
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
      _pinError = false;
    });

    try {
      await _authService.verificarCadastro(widget.email, _pin);
      setState(() => _success = true);

      // Aguarda 1.5s mostrando a tela de sucesso antes de navegar
      await Future.delayed(const Duration(milliseconds: 1500));

      if (!mounted) return;

      if (widget.senha != null) {
        // Tenta fazer o login automático do usuário
        final authProvider = Provider.of<AuthProvider>(context, listen: false);
        await authProvider.login(widget.email, widget.senha!);

        if (!mounted) return;

        if (authProvider.isAuthenticated) {
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const DashboardScreen()),
            (route) => false,
          );
          return;
        }
      }

      if (!mounted) return;

      // Se não houver senha ou falhar o login, volta para o login com aviso de sucesso
      AppSnackBar.showSuccess(
        context,
        'Conta ativada com sucesso! Faça login para entrar.',
      );
      Navigator.of(context).pop();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _pinError = true;
      });
      _clearPin();
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleResend() async {
    if (_resendTimer > 0 || _resending) return;

    setState(() {
      _resending = true;
      _error = null;
    });

    try {
      await _authService.reenviarVerificacao(widget.email);
      _startResendTimer();
      
      if (!mounted) return;

      AppSnackBar.showSuccess(
        context,
        'Um novo código foi enviado para seu e-mail.',
      );
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) {
        setState(() => _resending = false);
      }
    }
  }

  void _clearPin() {
    for (final c in _pinControllers) {
      c.clear();
    }
    if (_pinFocusNodes[0].canRequestFocus) {
      _pinFocusNodes[0].requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              AppColors.background,
              AppColors.surfaceContainerLow,
              AppColors.surfaceContainer,
            ],
            stops: [0.0, 0.5, 1.0],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              // Botão voltar (apenas se não tiver transicionado para sucesso)
              if (!_success)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.of(context).pop(),
                        icon: const Icon(Icons.arrow_back_rounded),
                        color: AppColors.onSurface,
                      ),
                    ],
                  ),
                ),

              // Conteúdo central
              Expanded(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 28),
                    child: FadeTransition(
                      opacity: _fadeAnim,
                      child: _success ? _buildSuccessStep() : _buildPinStep(),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPinStep() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Icon
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary.withValues(alpha: 0.1),
          ),
          child: const Icon(Icons.shield_outlined, size: 26, color: AppColors.primary),
        ),
        const SizedBox(height: 20),
        Text(
          'Confirme seu cadastro',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: AppColors.onSurface,
          ),
        ),
        const SizedBox(height: 8),
        RichText(
          textAlign: TextAlign.center,
          text: TextSpan(
            style: GoogleFonts.manrope(
              fontSize: 14,
              height: 1.6,
              color: AppColors.onSurfaceVariant,
            ),
            children: [
              const TextSpan(text: 'Enviamos um código de confirmação de 6 dígitos para\n'),
              TextSpan(
                text: _maskEmail(widget.email),
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppColors.onSurface,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 28),

        _buildErrorBanner(),

        // PIN card
        Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: AppColors.surfaceContainerLowest,
            borderRadius: BorderRadius.circular(AppTheme.radiusLg),
            boxShadow: [
              BoxShadow(
                color: AppColors.onSurface.withValues(alpha: 0.04),
                blurRadius: 32,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            children: [
              // PIN input row
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(6, (i) {
                  return Expanded(
                    child: Container(
                      height: 52,
                      margin: EdgeInsets.only(
                        left: i == 0 ? 0 : 3,
                        right: i == 5 ? 0 : 3,
                      ),
                      child: TextField(
                        controller: _pinControllers[i],
                        focusNode: _pinFocusNodes[i],
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        maxLength: 1,
                        enabled: !_isLoading,
                        inputFormatters: [
                          FilteringTextInputFormatter.digitsOnly,
                        ],
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: _pinError ? AppColors.error : AppColors.onSurface,
                        ),
                        decoration: InputDecoration(
                          counterText: '',
                          contentPadding: const EdgeInsets.symmetric(vertical: 12),
                          filled: true,
                          fillColor: _pinError
                              ? AppColors.error.withValues(alpha: 0.06)
                              : AppColors.surfaceContainerLow.withValues(alpha: 0.5),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                            borderSide: BorderSide(
                              color: _pinError
                                  ? AppColors.error
                                  : AppColors.outlineVariant.withValues(alpha: 0.2),
                            ),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                            borderSide: BorderSide(
                              color: _pinError
                                  ? AppColors.error
                                  : AppColors.outlineVariant.withValues(alpha: 0.2),
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                            borderSide: BorderSide(
                              color: _pinError ? AppColors.error : AppColors.primary,
                              width: 1.5,
                            ),
                          ),
                        ),
                        onChanged: (value) {
                          if (_pinError) setState(() => _pinError = false);
                          if (value.isNotEmpty && i < 5) {
                            _pinFocusNodes[i + 1].requestFocus();
                          }
                          if (value.isEmpty && i > 0) {
                            _pinFocusNodes[i - 1].requestFocus();
                          }
                          // Auto-submit when all 6 digits entered
                          if (_pin.length == 6) {
                            _handleVerifyPin();
                          }
                        },
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 24),
              _buildPrimaryButton(),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Resend
        Text.rich(
          TextSpan(
            style: GoogleFonts.manrope(
              fontSize: 14,
              color: AppColors.onSurfaceVariant,
            ),
            children: [
              const TextSpan(text: 'Não recebeu? '),
              WidgetSpan(
                alignment: PlaceholderAlignment.baseline,
                baseline: TextBaseline.alphabetic,
                child: GestureDetector(
                  onTap: (_resendTimer > 0 || _resending) ? null : _handleResend,
                  child: _resending
                      ? Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            SizedBox(
                              width: 12,
                              height: 12,
                              child: CircularProgressIndicator(
                                strokeWidth: 1.5,
                                color: AppColors.primary.withValues(alpha: 0.6),
                              ),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              'Reenviando...',
                              style: GoogleFonts.manrope(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.outline,
                              ),
                            ),
                          ],
                        )
                      : Text(
                          _resendTimer > 0
                              ? 'Reenviar código (${_resendTimer}s)'
                              : 'Reenviar código',
                          style: GoogleFonts.manrope(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: _resendTimer > 0 ? AppColors.outline : AppColors.primary,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  Widget _buildSuccessStep() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.statusOrcamentoEnviado,
          ),
          child: const Icon(Icons.check_rounded, size: 40, color: Colors.white),
        ),
        const SizedBox(height: 24),
        Text(
          'Conta ativada!',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 28,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: AppColors.onSurface,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          widget.senha != null
              ? 'Seu e-mail foi verificado.\nAcessando a plataforma...'
              : 'Seu e-mail foi verificado.\nRedirecionando...',
          textAlign: TextAlign.center,
          style: GoogleFonts.manrope(
            fontSize: 16,
            height: 1.6,
            color: AppColors.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildErrorBanner() {
    if (_error == null) return const SizedBox.shrink();
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.error.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
        border: Border.all(
          color: AppColors.error.withValues(alpha: 0.2),
        ),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline_rounded,
              size: 18, color: AppColors.error.withValues(alpha: 0.8)),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _error!,
              style: GoogleFonts.manrope(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: AppColors.error,
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPrimaryButton() {
    final enabled = _pin.length == 6;

    return SizedBox(
      width: double.infinity,
      height: 56,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: enabled ? AppColors.primaryGradient : null,
          color: enabled ? null : AppColors.surfaceContainerLow,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          boxShadow: enabled
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.3),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ]
              : null,
        ),
        child: ElevatedButton(
          onPressed: (enabled && !_isLoading) ? _handleVerifyPin : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            ),
          ),
          child: _isLoading
              ? const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.onPrimary),
                  ),
                )
              : Text(
                  'Verificar Código',
                  style: GoogleFonts.manrope(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: enabled ? AppColors.onPrimary : AppColors.outline,
                  ),
                ),
        ),
      ),
    );
  }
}
