import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';
import '../../../data/models/geo_risk_model.dart';

class RiskSummaryCard extends StatelessWidget {
  final RiskMetricsSummary summary;
  final RiskTimeRange timeRange;

  const RiskSummaryCard({
    super.key,
    required this.summary,
    required this.timeRange,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm + 2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: AppSpacing.roundedSm,
                ),
                child: const Icon(Icons.analytics_outlined, size: 14, color: AppColors.primary),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Risk Summary (${timeRange.label})',
                  style: AppTypography.labelMedium.copyWith(fontWeight: FontWeight.w700),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.slate100,
                  borderRadius: AppSpacing.roundedSm,
                ),
                child: Text(
                  '${summary.totalAnimalsMapped} Mapped',
                  style: AppTypography.labelSmall.copyWith(
                    color: AppColors.slate700,
                    fontWeight: FontWeight.w600,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: [
              _metricCell(
                title: 'Affected',
                count: '${summary.affectedCount}',
                color: const Color(0xFFEA580C),
                icon: Icons.warning_amber_rounded,
              ),
              const SizedBox(width: 8),
              _metricCell(
                title: 'Deaths',
                count: '${summary.mortalityCount}',
                color: const Color(0xFFDC2626),
                icon: Icons.dangerous_outlined,
              ),
              const SizedBox(width: 8),
              _metricCell(
                title: 'Hotspots',
                count: '${summary.activeHotspots}',
                color: const Color(0xFFD97706),
                icon: Icons.radar_rounded,
              ),
              const SizedBox(width: 8),
              _metricCell(
                title: 'Healthy',
                count: '${summary.healthyCount}',
                color: const Color(0xFF16A34A),
                icon: Icons.check_circle_outline_rounded,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _metricCell({
    required String title,
    required String count,
    required Color color,
    required IconData icon,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.07),
          borderRadius: AppSpacing.roundedSm,
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 12, color: color),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    title,
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.slate600,
                      fontSize: 9.5,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 3),
            Text(
              count,
              style: AppTypography.titleSmall.copyWith(
                color: color,
                fontWeight: FontWeight.w800,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
