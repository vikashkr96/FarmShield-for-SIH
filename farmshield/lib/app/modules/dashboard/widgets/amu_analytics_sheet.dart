import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';

class AmuAnalyticsSheet extends StatelessWidget {
  final List<dynamic>? classBreakdown;
  final List<dynamic> amuTrendData;

  const AmuAnalyticsSheet({
    super.key,
    required this.classBreakdown,
    required this.amuTrendData,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildPieCard(),
        const SizedBox(height: AppSpacing.lg),
        _buildTrendCard(),
      ],
    );
  }

  Widget _buildPieCard() {
    if (classBreakdown == null || classBreakdown!.isEmpty) {
      return AppCard(
        padding: const EdgeInsets.all(AppSpacing.xl),
        child: Center(
          child: Text('No AMU data logged for current period',
              style: AppTypography.bodySmall),
        ),
      );
    }

    final colors = [
      AppColors.primary,
      AppColors.accent,
      const Color(0xFF3B82F6),
      const Color(0xFFF59E0B),
      const Color(0xFFEF4444),
      const Color(0xFF8B5CF6),
    ];

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Row(
        children: [
          Expanded(
            flex: 3,
            child: SizedBox(
              height: 180,
              child: PieChart(
                PieChartData(
                  sectionsSpace: 2,
                  centerSpaceRadius: 36,
                  sections: classBreakdown!.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final val = entry.value;
                    final percentage = (val['percentage'] as num).toDouble();
                    return PieChartSectionData(
                      color: colors[idx % colors.length],
                      value: percentage,
                      title: '${percentage.toInt()}%',
                      radius: 46,
                      titleStyle: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            flex: 2,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: classBreakdown!.asMap().entries.map((entry) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 3),
                  child: Row(
                    children: [
                      Container(
                        width: 9,
                        height: 9,
                        decoration: BoxDecoration(
                          color: colors[entry.key % colors.length],
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          entry.value['drugClass'] ?? 'Unknown',
                          style: AppTypography.labelSmall.copyWith(
                            fontSize: 10.5,
                            color: AppColors.textSecondary,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 200));
  }

  Widget _buildTrendCard() {
    return AppCard(
      padding: const EdgeInsets.fromLTRB(8, 16, 16, 12),
      child: SizedBox(
        height: 160,
        child: LineChart(
          LineChartData(
            gridData: const FlGridData(show: false),
            titlesData: const FlTitlesData(
              show: true,
              rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
              topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            ),
            borderData: FlBorderData(show: false),
            lineBarsData: [
              LineChartBarData(
                spots: amuTrendData
                    .asMap()
                    .entries
                    .map((e) => FlSpot(e.key.toDouble(), (e.value['value'] as num).toDouble()))
                    .toList(),
                isCurved: true,
                color: AppColors.primary,
                barWidth: 3.5,
                dotData: const FlDotData(show: true),
                belowBarData: BarAreaData(
                  show: true,
                  color: AppColors.primary.withValues(alpha: 0.08),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
