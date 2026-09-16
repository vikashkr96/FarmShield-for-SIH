import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';
import '../../../data/models/health_models.dart';

class WeatherRiskCard extends StatelessWidget {
  final WeatherRiskData? weatherData;
  final bool isLoading;
  final VoidCallback? onRefresh;

  const WeatherRiskCard({
    super.key,
    required this.weatherData,
    this.isLoading = false,
    this.onRefresh,
  });

  @override
  Widget build(BuildContext context) {
    if (weatherData == null && isLoading) {
      return AppCard(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: const Center(
          child: Padding(
            padding: EdgeInsets.all(16.0),
            child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
          ),
        ),
      );
    }

    final data = weatherData ?? WeatherRiskData.fallback();

    Color vectorColor;
    switch (data.vectorRiskLevel) {
      case 'EXTREME':
        vectorColor = AppColors.danger;
        break;
      case 'HIGH':
        vectorColor = AppColors.warningDark;
        break;
      case 'MODERATE':
        vectorColor = AppColors.warning;
        break;
      default:
        vectorColor = AppColors.success;
    }

    Color thiColor;
    switch (data.heatStressCategory) {
      case 'Emergency':
      case 'Danger':
        thiColor = AppColors.danger;
        break;
      case 'Alert':
        thiColor = AppColors.warning;
        break;
      default:
        thiColor = AppColors.success;
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
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primarySoft,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.cloud_outlined, color: AppColors.primary, size: 20),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Meteorological Risk Intelligence',
                            style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            'Live Open-Meteo • Pune Surveillance Cluster',
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
              if (onRefresh != null)
                IconButton(
                  icon: const Icon(Icons.refresh_rounded, size: 18, color: AppColors.slate500),
                  tooltip: 'Update Weather Risk',
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                  onPressed: onRefresh,
                ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // 4 Metric Tiles: Temp, Humidity, Precip, Wind
          Row(
            children: [
              _buildMetricTile(
                icon: Icons.thermostat_rounded,
                label: 'Temperature',
                value: '${data.temperatureC.toStringAsFixed(1)}°C',
                color: AppColors.primary,
              ),
              const SizedBox(width: 8),
              _buildMetricTile(
                icon: Icons.water_drop_outlined,
                label: 'Rel. Humidity',
                value: '${data.humidityPct.toStringAsFixed(0)}%',
                color: const Color(0xFF0284C7),
              ),
              const SizedBox(width: 8),
              _buildMetricTile(
                icon: Icons.grain_rounded,
                label: 'Precipitation',
                value: '${data.precipitationMm.toStringAsFixed(1)} mm',
                color: const Color(0xFF4F46E5),
              ),
              const SizedBox(width: 8),
              _buildMetricTile(
                icon: Icons.air_rounded,
                label: 'Wind Speed',
                value: '${data.windSpeedKmh.toStringAsFixed(0)} km/h',
                color: AppColors.slate600,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Dual Risk Meters: THI Heat Stress & Vector Multiplier
          Row(
            children: [
              // THI Meter
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: thiColor.withValues(alpha: 0.08),
                    borderRadius: AppSpacing.roundedSm,
                    border: Border.all(color: thiColor.withValues(alpha: 0.25)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('THI Index', style: AppTypography.labelSmall.copyWith(fontSize: 10)),
                          Text(
                            data.thi.toStringAsFixed(1),
                            style: TextStyle(fontWeight: FontWeight.w800, color: thiColor, fontSize: 13),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${data.heatStressCategory} Heat Stress',
                        style: TextStyle(fontWeight: FontWeight.w700, color: thiColor, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Vector Proliferation Meter
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: vectorColor.withValues(alpha: 0.08),
                    borderRadius: AppSpacing.roundedSm,
                    border: Border.all(color: vectorColor.withValues(alpha: 0.25)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Vector Proliferation', style: AppTypography.labelSmall.copyWith(fontSize: 10)),
                          Text(
                            '${data.epidemicMultiplier}x',
                            style: TextStyle(fontWeight: FontWeight.w800, color: vectorColor, fontSize: 13),
                          ),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${data.vectorRiskLevel} Vector Surge',
                        style: TextStyle(fontWeight: FontWeight.w700, color: vectorColor, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          // Vulnerable Diseases List
          if (data.vulnerableDiseases.isNotEmpty) ...[
            const SizedBox(height: 12),
            Text(
              'Climate-Vulnerable Enzootic Pathogens:',
              style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 4),
            ...data.vulnerableDiseases.map(
              (d) => Padding(
                padding: const EdgeInsets.only(bottom: 3),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('• ', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.warningDark)),
                    Expanded(
                      child: Text(d, style: AppTypography.bodySmall.copyWith(fontSize: 11)),
                    ),
                  ],
                ),
              ),
            ),
          ],

          const SizedBox(height: 10),

          // Climate Advisory Banner
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.surfaceSubtle,
              borderRadius: AppSpacing.roundedSm,
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.lightbulb_outline_rounded, size: 16, color: AppColors.primary),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    data.climateAdvisory,
                    style: AppTypography.bodySmall.copyWith(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMetricTile({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
        decoration: BoxDecoration(
          color: AppColors.surfaceSubtle,
          borderRadius: AppSpacing.roundedSm,
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: [
            Icon(icon, size: 16, color: color),
            const SizedBox(height: 4),
            Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 11),
              textAlign: TextAlign.center,
            ),
            Text(
              label,
              style: AppTypography.labelSmall.copyWith(fontSize: 9, color: AppColors.textMuted),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
