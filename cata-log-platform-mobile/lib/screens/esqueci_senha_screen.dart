import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/app_theme.dart';
import '../services/auth_service.dart';

enum _Step { email, pin, password, done }

class EsqueciSenhaScreen extends StatefulWidget {
  const EsqueciSenhaScreen({super.key});

  @override
  State<EsqueciSenhaScreen> createState() => _EsqueciSenhaScreenState();
}

class _EsqueciSenhaScreenState extends State<EsqueciSenhaScreen>
    with SingleTickerProviderStateMixin {
  final AuthService _authService = AuthService();

  _Step _step = _Step.email;
  bool _isLoading = false;
  String? _error;

  // Email step
  final _emailController = TextEditingController();
  final _emailFocus = FocusNode();

  // PIN step
  final List<TextEditingController> _pinControllers =
      List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _pinFocusNodes = List.generate(6, (_) => FocusNode());
  bool _pinError = false;
  int _resendTimer = 0;
  Timer? _resendTimerRef;
  bool _resending = false;

  // Password step
  final _senhaController = TextEditingController();
  final _confirmarSenhaController = TextEditingController();
  final _senhaFocus = FocusNode();
  final _confirmarSenhaFocus = FocusNode();
  bool _obscureSenha = true;
  bool _obscureConfirmar = true;

  // Animation
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
  }

  @override
  void dispose() {
    _emailController.dispose();
    _emailFocus.dispose();
    for (final c in _pinControllers) {
      c.dispose();
    }
    for (final f in _pinFocusNodes) {
      f.dispose();
    }
    _senhaController.dispose();
    _confirmarSenhaController.dispose();
    _senhaFocus.dispose();
    _confirmarSenhaFocus.dispose();
    _animController.dispose();
    _resendTimerRef?.cancel();
    super.dispose();
  }

  String get _pin => _pinControllers.map((c) => c.text).join();

  bool get _isPasswordValid => _senhaController.text.length >= 6;
  bool get _isPasswordMatch =>
      _senhaController.text == _confirmarSenhaController.text &&
      _confirmarSenhaController.text.isNotEmpty;
  bool get _canSubmitPassword => _isPasswordValid && _isPasswordMatch;

  String _maskEmail(String email) {
    final parts = email.split('@');
    if (parts.length != 2) return email;
    final user = parts[0];
    final domain = parts[1];
    final maskedUser = '${user[0]}***';
    final domainParts = domain.split('.');
    final maskedDomain = '${domainParts[0][0]}***';
    return '$maskedUser@$maskedDomain.${domainParts.sublist(1).join('.')}';
  }

  void _animateStep() {
    _animController.reset();
    _animController.forward();
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

  // ─── API calls ───

  Future<void> _handleSendEmail() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) {
      setState(() => _error = 'Informe seu e-mail.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await _authService.esqueciSenha(email);
      setState(() => _step = _Step.pin);
      _animateStep();
      _startResendTimer();
      _pinFocusNodes[0].requestFocus();
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
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
      await _authService.verificarPin(_emailController.text.trim(), _pin);
      setState(() => _step = _Step.password);
      _animateStep();
      _senhaFocus.requestFocus();
    } catch (e) {
      setState(() {
        _error = e.toString();
        _pinError = true;
      });
      _clearPin();
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleResetPassword() async {
    if (_senhaController.text.length < 6) {
      setState(() => _error = 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (_senhaController.text != _confirmarSenhaController.text) {
      setState(() => _error = 'As senhas não coincidem.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      await _authService.redefinirSenha(
        email: _emailController.text.trim(),
        pin: _pin,
        novaSenha: _senhaController.text,
      );
      setState(() => _step = _Step.done);
      _animateStep();
    } catch (e) {
      final msg = e.toString();
      if (msg.toLowerCase().contains('pin') ||
          msg.toLowerCase().contains('código')) {
        setState(() {
          _error = msg;
          _pinError = true;
          _step = _Step.pin;
        });
        _clearPin();
        _animateStep();
      } else {
        setState(() => _error = msg);
      }
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _handleResend() async {
    if (_resendTimer > 0 || _resending) return;

    setState(() {
      _resending = true;
      _error = null;
    });

    try {
      await _authService.esqueciSenha(_emailController.text.trim());
      _startResendTimer();
    } catch (_) {
      setState(() => _error = 'Erro ao reenviar código.');
    } finally {
      setState(() => _resending = false);
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

  void _goBackToEmail() {
    _clearPin();
    _senhaController.clear();
    _confirmarSenhaController.clear();
    setState(() {
      _step = _Step.email;
      _error = null;
      _pinError = false;
    });
    _animateStep();
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
              // AppBar
              if (_step != _Step.done)
                Padding(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 8, vertical: 4),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () {
                          if (_step == _Step.email) {
                            Navigator.of(context).pop();
                          } else if (_step == _Step.pin) {
                            _goBackToEmail();
                          } else if (_step == _Step.password) {
                            _clearPin();
                            _senhaController.clear();
                            _confirmarSenhaController.clear();
                            setState(() {
                              _step = _Step.pin;
                              _error = null;
                            });
                            _animateStep();
                          }
                        },
                        icon: const Icon(Icons.arrow_back_rounded),
                        color: AppColors.onSurface,
                      ),
                    ],
                  ),
                ),

              // Content
              Expanded(
                child: Center(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 28),
                    child: FadeTransition(
                      opacity: _fadeAnim,
                      child: _buildCurrentStep(),
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

  Widget _buildCurrentStep() {
    switch (_step) {
      case _Step.email:
        return _buildEmailStep();
      case _Step.pin:
        return _buildPinStep();
      case _Step.password:
        return _buildPasswordStep();
      case _Step.done:
        return _buildDoneStep();
    }
  }

  // ─── Stepper ───

  Widget _buildStepper() {
    final labels = ['E-mail', 'Código', 'Nova Senha'];
    final currentIndex = _step == _Step.email
        ? 0
        : _step == _Step.pin
            ? 1
            : 2;

    return Padding(
      padding: const EdgeInsets.only(bottom: 32),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: List.generate(labels.length * 2 - 1, (i) {
          if (i.isOdd) {
            // Connector line
            final lineIndex = i ~/ 2;
            final isCompleted = lineIndex < currentIndex;
            return Container(
              width: 32,
              height: 2,
              margin: const EdgeInsets.only(bottom: 18),
              decoration: BoxDecoration(
                color: isCompleted
                    ? AppColors.primary
                    : AppColors.outlineVariant.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(1),
              ),
            );
          }

          final stepIndex = i ~/ 2;
          final isCompleted = stepIndex < currentIndex;
          final isActive = stepIndex == currentIndex;

          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isCompleted
                      ? AppColors.primary.withValues(alpha: 0.15)
                      : isActive
                          ? AppColors.primary
                          : AppColors.surfaceContainer,
                  boxShadow: isActive
                      ? [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.25),
                            blurRadius: 12,
                            offset: const Offset(0, 4),
                          )
                        ]
                      : null,
                ),
                child: Center(
                  child: isCompleted
                      ? const Icon(Icons.check_rounded,
                          size: 16, color: AppColors.primary)
                      : Text(
                          '${stepIndex + 1}',
                          style: GoogleFonts.manrope(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: isActive
                                ? AppColors.onPrimary
                                : AppColors.outline,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                labels[stepIndex],
                style: GoogleFonts.manrope(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: isActive
                      ? AppColors.primary
                      : isCompleted
                          ? AppColors.onSurfaceVariant
                          : AppColors.outline,
                ),
              ),
            ],
          );
        }),
      ),
    );
  }

  // ─── Error banner ───

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

  // ─── STEP 1: Email ───

  Widget _buildEmailStep() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildStepper(),
        // Icon
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary.withValues(alpha: 0.1),
          ),
          child: const Icon(Icons.mail_outline_rounded,
              size: 26, color: AppColors.primary),
        ),
        const SizedBox(height: 20),
        Text(
          'Esqueceu a senha?',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: AppColors.onSurface,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Informe seu e-mail e enviaremos\num código de recuperação.',
          textAlign: TextAlign.center,
          style: GoogleFonts.manrope(
            fontSize: 14,
            height: 1.6,
            color: AppColors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 28),

        _buildErrorBanner(),

        // Form card
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildLabel('E-mail'),
              const SizedBox(height: 8),
              _buildTextField(
                controller: _emailController,
                focusNode: _emailFocus,
                hint: 'seu@email.com',
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
                onSubmitted: (_) => _handleSendEmail(),
              ),
              const SizedBox(height: 24),
              _buildPrimaryButton(
                label: 'Enviar Código',
                onPressed: _handleSendEmail,
                icon: Icons.arrow_forward_rounded,
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  // ─── STEP 2: PIN ───

  Widget _buildPinStep() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildStepper(),
        // Icon
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary.withValues(alpha: 0.1),
          ),
          child: const Icon(Icons.shield_outlined,
              size: 26, color: AppColors.primary),
        ),
        const SizedBox(height: 20),
        Text(
          'Verifique seu e-mail',
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
              const TextSpan(text: 'Enviamos um código de 6 dígitos para\n'),
              TextSpan(
                text: _maskEmail(_emailController.text.trim()),
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
                  return Container(
                    width: 44,
                    height: 52,
                    margin: EdgeInsets.only(
                      left: i == 0 ? 0 : 6,
                      right: i == 5 ? 0 : 6,
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
                        color: _pinError
                            ? AppColors.error
                            : AppColors.onSurface,
                      ),
                      decoration: InputDecoration(
                        counterText: '',
                        contentPadding:
                            const EdgeInsets.symmetric(vertical: 12),
                        filled: true,
                        fillColor: _pinError
                            ? AppColors.error.withValues(alpha: 0.06)
                            : AppColors.surfaceContainerLow
                                .withValues(alpha: 0.5),
                        border: OutlineInputBorder(
                          borderRadius:
                              BorderRadius.circular(AppTheme.radiusMd),
                          borderSide: BorderSide(
                            color: _pinError
                                ? AppColors.error
                                : AppColors.outlineVariant
                                    .withValues(alpha: 0.2),
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius:
                              BorderRadius.circular(AppTheme.radiusMd),
                          borderSide: BorderSide(
                            color: _pinError
                                ? AppColors.error
                                : AppColors.outlineVariant
                                    .withValues(alpha: 0.2),
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius:
                              BorderRadius.circular(AppTheme.radiusMd),
                          borderSide: BorderSide(
                            color: _pinError
                                ? AppColors.error
                                : AppColors.primary,
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
                  );
                }),
              ),
              const SizedBox(height: 24),
              _buildPrimaryButton(
                label: 'Verificar Código',
                onPressed: _handleVerifyPin,
                icon: Icons.arrow_forward_rounded,
                enabled: _pin.length == 6,
              ),
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
                  onTap: (_resendTimer > 0 || _resending)
                      ? null
                      : _handleResend,
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
                            color: _resendTimer > 0
                                ? AppColors.outline
                                : AppColors.primary,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 12),

        // Back to email
        GestureDetector(
          onTap: _goBackToEmail,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.arrow_back_rounded,
                  size: 14, color: AppColors.primary),
              const SizedBox(width: 4),
              Text(
                'Usar outro e-mail',
                style: GoogleFonts.manrope(
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  // ─── STEP 3: Password ───

  Widget _buildPasswordStep() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildStepper(),
        // Icon
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary.withValues(alpha: 0.1),
          ),
          child: const Icon(Icons.lock_outline_rounded,
              size: 26, color: AppColors.primary),
        ),
        const SizedBox(height: 20),
        Text(
          'Criar nova senha',
          style: GoogleFonts.plusJakartaSans(
            fontSize: 24,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: AppColors.onSurface,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Escolha uma senha segura\npara sua conta.',
          textAlign: TextAlign.center,
          style: GoogleFonts.manrope(
            fontSize: 14,
            height: 1.6,
            color: AppColors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 28),

        _buildErrorBanner(),

        // Form card
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildLabel('Nova senha'),
              const SizedBox(height: 8),
              _buildTextField(
                controller: _senhaController,
                focusNode: _senhaFocus,
                hint: 'Mínimo 6 caracteres',
                icon: Icons.lock_outline,
                isPassword: true,
                obscure: _obscureSenha,
                onToggleObscure: () =>
                    setState(() => _obscureSenha = !_obscureSenha),
                onSubmitted: (_) => _confirmarSenhaFocus.requestFocus(),
              ),
              const SizedBox(height: 16),
              _buildLabel('Confirmar senha'),
              const SizedBox(height: 8),
              _buildTextField(
                controller: _confirmarSenhaController,
                focusNode: _confirmarSenhaFocus,
                hint: 'Digite novamente',
                icon: Icons.lock_outline,
                isPassword: true,
                obscure: _obscureConfirmar,
                onToggleObscure: () =>
                    setState(() => _obscureConfirmar = !_obscureConfirmar),
                onSubmitted: (_) {
                  if (_canSubmitPassword) _handleResetPassword();
                },
              ),
              const SizedBox(height: 20),

              // Validation indicators
              _buildValidationRow(
                'Mínimo 6 caracteres',
                _isPasswordValid,
              ),
              const SizedBox(height: 8),
              _buildValidationRow(
                'Senhas coincidem',
                _isPasswordMatch,
              ),
              const SizedBox(height: 24),

              _buildPrimaryButton(
                label: 'Redefinir Senha',
                onPressed: _handleResetPassword,
                icon: Icons.arrow_forward_rounded,
                enabled: _canSubmitPassword,
              ),
            ],
          ),
        ),
        const SizedBox(height: 32),
      ],
    );
  }

  // ─── STEP 4: Done ───

  Widget _buildDoneStep() {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AppColors.primary.withValues(alpha: 0.12),
          ),
          child: const Icon(Icons.check_circle_rounded,
              size: 40, color: AppColors.primary),
        ),
        const SizedBox(height: 24),
        Text(
          'Senha redefinida\ncom sucesso!',
          textAlign: TextAlign.center,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            letterSpacing: -0.5,
            color: AppColors.onSurface,
            height: 1.3,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'Sua senha foi atualizada.\nFaça login com sua nova senha.',
          textAlign: TextAlign.center,
          style: GoogleFonts.manrope(
            fontSize: 15,
            height: 1.6,
            color: AppColors.onSurfaceVariant,
          ),
        ),
        const SizedBox(height: 36),
        _buildPrimaryButton(
          label: 'Ir para o Login',
          onPressed: () => Navigator.of(context).pop(),
          icon: Icons.arrow_forward_rounded,
        ),
      ],
    );
  }

  // ─── Shared widgets ───

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 2),
      child: Text(
        text,
        style: GoogleFonts.manrope(
          fontSize: 13,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.4,
          color: AppColors.onSurface,
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    bool isPassword = false,
    bool obscure = false,
    VoidCallback? onToggleObscure,
    void Function(String)? onSubmitted,
  }) {
    return TextField(
      controller: controller,
      focusNode: focusNode,
      keyboardType: keyboardType,
      obscureText: isPassword ? obscure : false,
      onSubmitted: onSubmitted,
      onChanged: (_) => setState(() {}),
      style: GoogleFonts.manrope(
        fontSize: 15,
        color: AppColors.onSurface,
      ),
      decoration: InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: AppColors.surfaceContainerLow.withValues(alpha: 0.5),
        prefixIcon:
            Icon(icon, size: 20, color: AppColors.onSurfaceVariant),
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
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          borderSide: BorderSide(
            color: AppColors.outlineVariant.withValues(alpha: 0.2),
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          borderSide: BorderSide(
            color: AppColors.outlineVariant.withValues(alpha: 0.2),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          borderSide: const BorderSide(
            color: AppColors.primary,
            width: 1.5,
          ),
        ),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
    );
  }

  Widget _buildPrimaryButton({
    required String label,
    required VoidCallback onPressed,
    IconData? icon,
    bool enabled = true,
  }) {
    final isEnabled = enabled && !_isLoading;

    return SizedBox(
      width: double.infinity,
      height: 54,
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: isEnabled ? AppColors.primaryGradient : null,
          color: isEnabled ? null : AppColors.surfaceContainerHigh,
          borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          boxShadow: isEnabled
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.25),
                    blurRadius: 20,
                    offset: const Offset(0, 6),
                  ),
                ]
              : null,
        ),
        child: ElevatedButton(
          onPressed: isEnabled ? onPressed : null,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            disabledBackgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppTheme.radiusMd),
            ),
          ),
          child: _isLoading
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    strokeWidth: 2.5,
                    valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.onPrimary),
                  ),
                )
              : Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      label,
                      style: GoogleFonts.manrope(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: isEnabled
                            ? AppColors.onPrimary
                            : AppColors.onSurfaceVariant,
                      ),
                    ),
                    if (icon != null) ...[
                      const SizedBox(width: 8),
                      Icon(
                        icon,
                        size: 20,
                        color: isEnabled
                            ? AppColors.onPrimary
                            : AppColors.onSurfaceVariant,
                      ),
                    ],
                  ],
                ),
        ),
      ),
    );
  }

  Widget _buildValidationRow(String text, bool valid) {
    return Row(
      children: [
        Icon(
          valid ? Icons.check_rounded : Icons.close_rounded,
          size: 16,
          color: valid ? const Color(0xFF2E7D32) : AppColors.onSurfaceVariant,
        ),
        const SizedBox(width: 8),
        Text(
          text,
          style: GoogleFonts.manrope(
            fontSize: 13,
            fontWeight: FontWeight.w500,
            color:
                valid ? const Color(0xFF2E7D32) : AppColors.onSurfaceVariant,
          ),
        ),
      ],
    );
  }
}
