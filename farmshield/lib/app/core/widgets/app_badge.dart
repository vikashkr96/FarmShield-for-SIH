import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../theme/app_colors.dart';
import '../theme/app_spacing.dart';

enum AppBadgeVariant { success, warning, danger, info, neutral }

/// Standard semantic badge / chip for animal and medical statuses
class AppBadge extends StatelessWidget {
  final String label;
  final AppBadgeVariant variant;
  final IconData? icon;
  final bool isSmall;

  const AppBadge({
    super.key,
    required this.label,
    this.variant = AppBadgeVariant.neutral,
    this.icon,
    this.isSmall = false,
  });

  factory AppBadge.fromStatus(String status) {
    final s = status.toLowerCase().trim();

    String formattedLabel;
    if (s == 'under_treatment' || s == 'treatment') {
      formattedLabel = 'UNDER TREATMENT';
    } else if (s == 'withhold_active' || s == 'withholding') {
      formattedLabel = 'WITHHOLD ACTIVE';
    } else if (s == 'healthy' || s == 'clear' || s == 'cleared') {
      formattedLabel = 'HEALTHY';
    } else if (s == 'critical' || s == 'severe') {
      formattedLabel = 'CRITICAL';
    } else if (s == 'quarantined' || s == 'quarantine') {
      formattedLabel = 'QUARANTINED';
    } else if (s == 'sick') {
      formattedLabel = 'SICK / MONITOR';
    } else {
      formattedLabel = status.replaceAll('_', ' ').toUpperCase();
    }

    if (s.contains('safe') || s.contains('clear') || s.contains('healthy') || s.contains('passed')) {
      return AppBadge(
        label: formattedLabel,
        variant: AppBadgeVariant.success,
        icon: Icons.check_circle_rounded,
      );
    } else if (s.contains('withhold') || s.contains('treatment') || s.contains('active') || s.contains('warning') || s.contains('moderate')) {
      return AppBadge(
        label: formattedLabel,
        variant: AppBadgeVariant.warning,
        icon: Icons.schedule_rounded,
      );
    } else if (s.contains('critical') || s.contains('danger') || s.contains('sick') || s.contains('exceeded') || s.contains('quarantine')) {
      return AppBadge(
        label: formattedLabel,
        variant: AppBadgeVariant.danger,
        icon: Icons.warning_rounded,
      );
    } else {
      return AppBadge(
        label: formattedLabel,
        variant: AppBadgeVariant.neutral,
        icon: Icons.info_outline_rounded,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    Color border;

    switch (variant) {
      case AppBadgeVariant.success:
        bg = AppColors.successBg;
        fg = AppColors.success;
        border = AppColors.success.withValues(alpha: 0.2);
        break;
      case AppBadgeVariant.warning:
        bg = AppColors.warningBg;
        fg = AppColors.warning;
        border = AppColors.warning.withValues(alpha: 0.25);
        break;
      case AppBadgeVariant.danger:
        bg = AppColors.dangerBg;
        fg = AppColors.danger;
        border = AppColors.danger.withValues(alpha: 0.25);
        break;
      case AppBadgeVariant.info:
        bg = AppColors.infoBg;
        fg = AppColors.info;
        border = AppColors.info.withValues(alpha: 0.2);
        break;
      case AppBadgeVariant.neutral:
        bg = AppColors.slate100;
        fg = AppColors.slate700;
        border = AppColors.slate200;
        break;
    }

    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isSmall ? 8 : 10,
        vertical: isSmall ? 3 : 5,
      ),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: AppSpacing.roundedFull,
        border: Border.all(color: border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: isSmall ? 11 : 13, color: fg),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: GoogleFonts.poppins(
              fontSize: isSmall ? 10 : 11.5,
              fontWeight: FontWeight.w600,
              color: fg,
              letterSpacing: 0.3,
            ),
          ),
        ],
      ),
    );
  }
}
