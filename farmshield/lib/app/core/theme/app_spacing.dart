import 'package:flutter/material.dart';

/// Centralized layout metrics, radius, and shadows for FarmShield
class AppSpacing {
  AppSpacing._();

  // Spacing Scale
  static const double xs = 4.0;
  static const double sm = 8.0;
  static const double md = 12.0;
  static const double lg = 16.0;
  static const double xl = 20.0;
  static const double xxl = 24.0;
  static const double xxxl = 32.0;

  // Corner Radius
  static const double radiusXs = 6.0;
  static const double radiusSm = 10.0;
  static const double radiusMd = 14.0;
  static const double radiusLg = 18.0;
  static const double radiusXl = 24.0;
  static const double radiusFull = 999.0;

  // Common Border Radii
  static BorderRadius roundedXs = BorderRadius.circular(radiusXs);
  static BorderRadius roundedSm = BorderRadius.circular(radiusSm);
  static BorderRadius roundedMd = BorderRadius.circular(radiusMd);
  static BorderRadius roundedLg = BorderRadius.circular(radiusLg);
  static BorderRadius roundedXl = BorderRadius.circular(radiusXl);
  static BorderRadius roundedFull = BorderRadius.circular(radiusFull);

  // Elevation & Shadows (using withValues to avoid precision deprecation)
  static List<BoxShadow> shadowSubtle = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.03),
      blurRadius: 10,
      offset: const Offset(0, 2),
    ),
  ];

  static List<BoxShadow> shadowCard = [
    BoxShadow(
      color: const Color(0xFF0F172A).withValues(alpha: 0.05),
      blurRadius: 16,
      offset: const Offset(0, 4),
    ),
  ];

  static List<BoxShadow> shadowElevated = [
    BoxShadow(
      color: const Color(0xFF0F172A).withValues(alpha: 0.08),
      blurRadius: 24,
      offset: const Offset(0, 8),
    ),
  ];

  static List<BoxShadow> shadowPrimary = [
    BoxShadow(
      color: const Color(0xFF0E4D2B).withValues(alpha: 0.25),
      blurRadius: 18,
      offset: const Offset(0, 6),
    ),
  ];
}
