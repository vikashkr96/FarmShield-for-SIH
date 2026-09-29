import 'package:flutter/material.dart';

/// Single source of truth for the primary brand color in FarmShield.
/// Changing this constant propagates throughout the entire application.
const Color kTeal = Color(0xFF7AB7A7);

/// Centralized color palette for FarmShield based on kTeal
class AppColors {
  AppColors._();

  // Primary Brand Shades (Teal / Muted Sage Aesthetic)
  static const Color primary = kTeal;
  static const Color primaryLight = Color(0xFFA3CDC2);
  static const Color primaryDark = Color(0xFF38685C);
  static const Color primarySoft = Color(0xFFEAF5F2);
  static const Color primaryContainer = Color(0xFFDFEFEA);

  // Accent & Secondary
  static const Color accent = Color(0xFF4A9E8D);
  static const Color accentLight = Color(0xFF9FD5C8);
  static const Color accentDark = Color(0xFF266758);

  // Canvas & Surfaces
  static const Color background = Color(0xFFF7FAF9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceElevated = Color(0xFFFFFFFF);
  static const Color surfaceSubtle = Color(0xFFEFF5F3);

  // Text Tokens
  static const Color textPrimary = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF475569);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color textLight = Color(0xFFFFFFFF);

  // Borders & Dividers
  static const Color border = Color(0xFFE0EAE6);
  static const Color borderLight = Color(0xFFECF3F0);
  static const Color borderFocused = kTeal;

  // Semantic & Status
  static const Color success = Color(0xFF16A34A);
  static const Color successBg = Color(0xFFDCFCE7);
  static const Color warning = Color(0xFFD97706);
  static const Color warningDark = Color(0xFFB45309);
  static const Color warningBg = Color(0xFFFEF3C7);
  static const Color danger = Color(0xFFDC2626);
  static const Color dangerBg = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF2563EB);
  static const Color infoBg = Color(0xFFDBEAFE);
  static const Color secondary = Color(0xFF7C3AED);

  // Neutral Scales
  static const Color slate50 = Color(0xFFF8FAFC);
  static const Color slate100 = Color(0xFFF1F5F9);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate500 = Color(0xFF64748B);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate700 = Color(0xFF334155);
  static const Color slate800 = Color(0xFF1E293B);
  static const Color slate900 = Color(0xFF0F172A);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF356A5E), Color(0xFF539485), kTeal],
  );

  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [kTeal, Color(0xFF4A9E8D)],
  );

  static const LinearGradient cardGlow = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0x1A7AB7A7), Color(0x007AB7A7)],
  );
}
