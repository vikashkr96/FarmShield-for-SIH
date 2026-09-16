import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../data/models/geo_risk_model.dart';

class RiskPointDetailCard extends StatelessWidget {
  final AnimalRiskPoint point;
  final VoidCallback onClose;
  final VoidCallback onViewProfile;

  const RiskPointDetailCard({
    super.key,
    required this.point,
    required this.onClose,
    required this.onViewProfile,
  });

  Color _getSeverityColor(RiskSeverity severity) {
    switch (severity) {
      case RiskSeverity.critical:
        return const Color(0xFFDC2626);
      case RiskSeverity.high:
        return const Color(0xFFEA580C);
      case RiskSeverity.moderate:
        return const Color(0xFFD97706);
      case RiskSeverity.low:
        return const Color(0xFF0284C7);
      case RiskSeverity.healthy:
        return const Color(0xFF16A34A);
    }
  }

  String _getSeverityLabel(RiskSeverity severity) {
    switch (severity) {
      case RiskSeverity.critical:
        return 'CRITICAL SEVERITY';
      case RiskSeverity.high:
        return 'HIGH RISK / TREATMENT';
      case RiskSeverity.moderate:
        return 'MODERATE RISK';
      case RiskSeverity.low:
        return 'MONITORED';
      case RiskSeverity.healthy:
        return 'VERIFIED HEALTHY';
    }
  }

  @override
  Widget build(BuildContext context) {
    final sevColor = _getSeverityColor(point.severity);

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      borderColor: sevColor.withValues(alpha: 0.35),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header: Badge + Close
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                decoration: BoxDecoration(
                  color: sevColor.withValues(alpha: 0.12),
                  borderRadius: AppSpacing.roundedSm,
                  border: Border.all(color: sevColor.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: BoxDecoration(color: sevColor, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      _getSeverityLabel(point.severity),
                      style: AppTypography.labelSmall.copyWith(
                        color: sevColor,
                        fontWeight: FontWeight.w800,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
              const Spacer(),
              Text(
                DateFormat('dd MMM, hh:mm a').format(point.eventDate),
                style: AppTypography.labelSmall.copyWith(color: AppColors.slate400, fontSize: 10.5),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: onClose,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.slate100,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.close_rounded, size: 16, color: AppColors.slate600),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // Title & Location
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      point.animalCode != null
                          ? 'Animal #${point.animalCode}'
                          : (point.suspectedDisease ?? '${point.species.toUpperCase()} Incident'),
                      style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.location_on_outlined, size: 13, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            point.farmName ?? point.locationName ?? 'Surveillance Sector',
                            style: AppTypography.bodySmall.copyWith(fontSize: 11.5, color: AppColors.slate600),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: AppSpacing.roundedSm,
                ),
                child: Text(
                  point.species.toUpperCase(),
                  style: AppTypography.labelSmall.copyWith(
                    color: AppColors.primaryDark,
                    fontWeight: FontWeight.w800,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 18),

          // Stats row
          Row(
            children: [
              _metricTile('Affected', '${point.affectedCount}', sevColor),
              _metricTile('Mortality', '${point.mortalityCount}', point.mortalityCount > 0 ? AppColors.danger : AppColors.slate600),
              _metricTile('Status', point.status.replaceAll('_', ' ').toUpperCase(), AppColors.slate700),
            ],
          ),

          // Symptoms badges if available
          if (point.symptoms.isNotEmpty) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 4,
              children: point.symptoms.entries.where((e) => e.value).map((e) {
                final label = e.key.replaceAll('_', ' ').split(' ').map((w) => w[0].toUpperCase() + w.substring(1)).join(' ');
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.slate100,
                    borderRadius: AppSpacing.roundedSm,
                    border: Border.all(color: AppColors.slate200),
                  ),
                  child: Text(
                    label,
                    style: AppTypography.labelSmall.copyWith(fontSize: 9.5, color: AppColors.slate600),
                  ),
                );
              }).toList(),
            ),
          ],

          const SizedBox(height: 14),

          // Actions
          AppButton(
            label: point.animalCode != null ? 'View Animal Profile (#${point.animalCode})' : 'Open Animal Registry Record',
            icon: Icons.pets_rounded,
            onPressed: onViewProfile,
          ),
        ],
      ),
    );
  }

  Widget _metricTile(String label, String value, Color valueColor) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: AppTypography.labelSmall.copyWith(color: AppColors.slate400, fontSize: 10)),
          const SizedBox(height: 1),
          Text(
            value,
            style: AppTypography.titleSmall.copyWith(
              color: valueColor,
              fontWeight: FontWeight.w700,
              fontSize: 12.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
