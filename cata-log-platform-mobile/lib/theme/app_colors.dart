import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color primary = Color(0xFFB12300);
  static const Color primaryDim = Color(0xFF9B1E00);
  static const Color primaryContainer = Color(0xFFFF7859);
  static const Color onPrimary = Color(0xFFFFEFEC);
  static const Color onPrimaryContainer = Color(0xFF4A0900);

  static const Color secondary = Color(0xFFA0373E);
  static const Color secondaryDim = Color(0xFF902B34);
  static const Color secondaryContainer = Color(0xFFFFC3C2);
  static const Color onSecondary = Color(0xFFFFEFEE);
  static const Color onSecondaryContainer = Color(0xFF85232C);

  static const Color tertiary = Color(0xFF803F9E);
  static const Color tertiaryContainer = Color(0xFFDC95FB);
  static const Color onTertiary = Color(0xFFFEEEFF);
  static const Color onTertiaryContainer = Color(0xFF50086F);

  static const Color error = Color(0xFFB41340);
  static const Color errorContainer = Color(0xFFF74B6D);
  static const Color onError = Color(0xFFFFEFEF);

  static const Color background = Color(0xFFFFF4F3);
  static const Color onBackground = Color(0xFF4E2123);
  static const Color surface = Color(0xFFFFF4F3);
  static const Color onSurface = Color(0xFF4E2123);
  static const Color onSurfaceVariant = Color(0xFF834C4D);
  static const Color surfaceBright = Color(0xFFFFF4F3);
  static const Color surfaceContainerLowest = Color(0xFFFFFFFF);
  static const Color surfaceContainerLow = Color(0xFFFFEDEC);
  static const Color surfaceContainer = Color(0xFFFFE1E1);
  static const Color surfaceContainerHigh = Color(0xFFFFDAD9);
  static const Color surfaceContainerHighest = Color(0xFFFFD2D2);
  static const Color surfaceDim = Color(0xFFFFC7C6);
  static const Color surfaceTint = Color(0xFFB12300);
  static const Color surfaceVariant = Color(0xFFFFD2D2);

  static const Color outline = Color(0xFFA26767);
  static const Color outlineVariant = Color(0xFFDF9C9C);

  static const Color inverseSurface = Color(0xFF240305);
  static const Color inversePrimary = Color(0xFFFF5630);
  static const Color inverseOnSurface = Color(0xFFCD8C8C);

  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primary, primaryContainer],
  );

  static const LinearGradient subtleGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [background, surfaceContainerLow],
  );

  static const Color statusAguardando = Color(0xFFE8A317);
  static const Color statusOrcamentoEnviado = Color(0xFF2E7D32);
  static const Color statusVendido = Color(0xFF6D4C41);
}
