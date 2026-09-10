import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';
import '../../../data/models/health_models.dart';
import '../views/herd_health_view.dart';

class HerdHealthCard extends StatelessWidget {
  final HerdHealthSummary summary;
  final VoidCallback? onRefresh;

  const HerdHealthCard({
    super.key,
    required this.summary,
    this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    Color riskColor;
    if (summary.herdRiskScore >= 70) {
      riskColor = AppColors.danger;
    } else if (summary.herdRiskScore >= 45) {
      riskColor = AppColors.warningDark;
    } else if (summary.herdRiskScore >= 25) {
      riskColor = AppColors.warning;
    } else {
      riskColor = AppColors.success;
    }

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Bar
          Row(
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: AppColors.primarySoft,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shield_outlined, color: AppColors.primary, size: 18),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Herd Health Intelligence',
                            style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            '${summary.species.capitalizeFirst} Herd (${summary.totalAnimals} Head)',
                            style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted, fontSize: 11),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              InkWell(
                onTap: () => Get.to(() => HerdHealthView(initialSpecies: summary.species)),
                borderRadius: AppSpacing.roundedSm,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  child: Row(
                    children: [
                      Text(
                        'Details',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                      const Icon(Icons.chevron_right_rounded, size: 16, color: AppColors.primary),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Cluster Outbreak Signal Warning (if detected)
          if (summary.activeClusterAlerts.isNotEmpty) ...[
            const SizedBox(height: AppSpacing.md),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.danger.withValues(alpha: 0.1),
                borderRadius: AppSpacing.roundedSm,
                border: Border.all(color: AppColors.danger.withValues(alpha: 0.35)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.emergency_rounded, color: AppColors.danger, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      summary.activeClusterAlerts.first,
                      style: AppTypography.labelSmall.copyWith(
                        color: AppColors.danger,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: AppSpacing.md),

          // Health Proportion Multi-color Progress Bar
          ClipRRect(
            borderRadius: AppSpacing.roundedFull,
            child: SizedBox(
              height: 10,
              child: summary.totalAnimals == 0
                  ? Container(color: AppColors.slate200)
                  : Row(
                      children: [
                        if (summary.healthyCount > 0)
                          Expanded(
                            flex: summary.healthyCount,
                            child: Container(color: AppColors.success),
                          ),
                        if (summary.underObservationCount > 0)
                          Expanded(
                            flex: summary.underObservationCount,
                            child: Container(color: AppColors.warning),
                          ),
                        if (summary.affectedCount > 0)
                          Expanded(
                            flex: summary.affectedCount,
                            child: Container(color: AppColors.warningDark),
                          ),
                        if (summary.criticalCount > 0)
                          Expanded(
                            flex: summary.criticalCount,
                            child: Container(color: AppColors.danger),
                          ),
                        if (summary.deceasedCount > 0)
                          Expanded(
                            flex: summary.deceasedCount,
                            child: Container(color: AppColors.slate500),
                          ),
                      ],
                    ),
            ),
          ),

          const SizedBox(height: AppSpacing.sm),

          // Counts Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildCountLegend('Healthy', summary.healthyCount, AppColors.success),
              _buildCountLegend('Observation', summary.underObservationCount, AppColors.warning),
              _buildCountLegend('Affected', summary.affectedCount, AppColors.warningDark),
              _buildCountLegend('Critical', summary.criticalCount, AppColors.danger),
            ],
          ),

          const Divider(height: 24),

          // Bottom Metrics: Risk Score & Vaccination Coverage
          Row(
            children: [
              // Risk Index
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: riskColor.withValues(alpha: 0.08),
                    borderRadius: AppSpacing.roundedSm,
                    border: Border.all(color: riskColor.withValues(alpha: 0.25)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Herd Risk Index', style: AppTypography.labelSmall.copyWith(fontSize: 10)),
                          Text(
                            '${summary.herdRiskScore}/100',
                            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: riskColor),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        summary.herdRiskLevel,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: riskColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Vaccination Coverage
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSubtle,
                    borderRadius: AppSpacing.roundedSm,
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Vax Coverage', style: AppTypography.labelSmall.copyWith(fontSize: 10)),
                          Text(
                            '${summary.vaccinationCoveragePct.toStringAsFixed(0)}%',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: AppColors.success),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Core Enzootic Vax',
                        style: AppTypography.labelSmall.copyWith(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Explainable Rationale Text
          Text(
            summary.riskRationale,
            style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted, fontSize: 11),
          ),
        ],
      ),
    );
  }

  Widget _buildCountLegend(String label, int count, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 7,
          height: 7,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 4),
        Text(
          '$label: ',
          style: AppTypography.labelSmall.copyWith(fontSize: 10, color: AppColors.textMuted),
        ),
        Text(
          '$count',
          style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: color),
        ),
      ],
    );
  }
}
