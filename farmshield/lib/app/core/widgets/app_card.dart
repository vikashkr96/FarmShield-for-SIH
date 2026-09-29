import 'package:flutter/material.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

/// Reusable polished card container with border, subtle shadow, and optional onTap animation
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final Color? color;
  final Color? borderColor;
  final double? borderRadius;
  final List<BoxShadow>? boxShadow;
  final Gradient? gradient;

  const AppCard({
    super.key,
    required this.child,
    this.padding,
    this.margin,
    this.onTap,
    this.color,
    this.borderColor,
    this.borderRadius,
    this.boxShadow,
    this.gradient,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final effectiveRadius = BorderRadius.circular(borderRadius ?? AppSpacing.radiusLg);
    final cardBg = color ?? theme.cardTheme.color ?? AppColors.surface;
    final cardBorder = borderColor ?? AppColors.border;

    Widget cardBody = Container(
      margin: margin,
      decoration: BoxDecoration(
        color: gradient == null ? cardBg : null,
        gradient: gradient,
        borderRadius: effectiveRadius,
        border: Border.all(
          color: cardBorder,
          width: 1.0,
        ),
        boxShadow: boxShadow ?? AppSpacing.shadowCard,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: effectiveRadius,
        child: InkWell(
          onTap: onTap,
          borderRadius: effectiveRadius,
          splashColor: theme.colorScheme.primary.withValues(alpha: 0.08),
          highlightColor: theme.colorScheme.primary.withValues(alpha: 0.04),
          child: Padding(
            padding: padding ?? const EdgeInsets.all(AppSpacing.lg),
            child: child,
          ),
        ),
      ),
    );

    return cardBody;
  }
}
