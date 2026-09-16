import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';
import '../../../data/models/geo_risk_model.dart';
import '../../../data/models/health_models.dart';

class DiseaseTrendChart extends StatelessWidget {
  final List<DiseaseTrendPoint> trendPoints;
  final RiskTimeRange selectedRange;
  final String selectedDisease;
  final ValueChanged<RiskTimeRange> onRangeChanged;
  final ValueChanged<String> onDiseaseChanged;

  const DiseaseTrendChart({
    super.key,
    required this.trendPoints,
    required this.selectedRange,
    required this.selectedDisease,
    required this.onRangeChanged,
    required this.onDiseaseChanged,
  });

  @override
  Widget build(BuildContext context) {
    int totalCases = 0;
    int totalDeaths = 0;
    int totalRecovered = 0;

    for (var p in trendPoints) {
      totalCases += p.caseCount;
      totalDeaths += p.mortalityCount;
      totalRecovered += p.recoveredCount;
    }

    final cfrPct = totalCases > 0 ? (totalDeaths / totalCases) * 100 : 0.0;

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primarySoft,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.stacked_line_chart_rounded, color: AppColors.primary, size: 20),
                  ),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Historical Disease Surveillance',
                        style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700),
                      ),
                      Text(
                        'Epidemic Curves & Incidence Velocity',
                        style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted, fontSize: 11),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Time Range Filter Row
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: RiskTimeRange.values.map((range) {
                final isSelected = selectedRange == range;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ChoiceChip(
                    label: Text(
                      range.label,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: AppColors.surfaceSubtle,
                    shape: RoundedRectangleBorder(
                      borderRadius: AppSpacing.roundedSm,
                      side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
                    ),
                    onSelected: (_) => onRangeChanged(range),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 8),

          // Disease Filter Chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: ['All', 'FMD', 'LSD', 'HS', 'Mastitis'].map((dis) {
                final isSelected = selectedDisease == dis;
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: FilterChip(
                    label: Text(
                      dis == 'All' ? 'All Pathogens' : dis,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected ? AppColors.primary : AppColors.textSecondary,
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: AppColors.primarySoft,
                    backgroundColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: AppSpacing.roundedFull,
                      side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
                    ),
                    onSelected: (_) => onDiseaseChanged(dis),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // 3 Summary Metric Badges: Cases, Recoveries, Fatality Rate
          Row(
            children: [
              _buildStatTile('Total Cases', '$totalCases', AppColors.warningDark),
              const SizedBox(width: 8),
              _buildStatTile('Recoveries', '$totalRecovered', AppColors.success),
              const SizedBox(width: 8),
              _buildStatTile('Fatality (CFR)', '${cfrPct.toStringAsFixed(1)}%', AppColors.danger),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // Trend Bars Visualization
          if (trendPoints.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Text('No historical disease incidents recorded in this window.', style: AppTypography.bodySmall),
              ),
            )
          else
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Incidence Timeline Distribution',
                  style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 10),
                SizedBox(
                  height: 110,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    itemCount: trendPoints.length,
                    itemBuilder: (context, index) {
                      final p = trendPoints[index];
                      final dateStr = DateFormat('dd MMM').format(p.date);
                      final int maxVal = 8;
                      final barHeight = ((p.caseCount / maxVal) * 65).clamp(8.0, 70.0);

                      return Container(
                        width: 44,
                        margin: const EdgeInsets.only(right: 8),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            Text(
                              '${p.caseCount}',
                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              height: barHeight,
                              width: 14,
                              decoration: BoxDecoration(
                                color: p.mortalityCount > 0 ? AppColors.danger : AppColors.primary,
                                borderRadius: const BorderRadius.vertical(top: Radius.circular(3)),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              dateStr,
                              style: const TextStyle(fontSize: 9, color: AppColors.textMuted),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _buildStatTile(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: AppSpacing.roundedSm,
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: color),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: AppTypography.labelSmall.copyWith(fontSize: 9, color: AppColors.textMuted),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
