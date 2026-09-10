import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../controllers/nav_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_loading_skeleton.dart';
import '../../../data/models/health_models.dart';
import '../../../data/repositories/farm_repository.dart';

class HerdHealthView extends StatefulWidget {
  final String initialSpecies;
  const HerdHealthView({super.key, this.initialSpecies = 'all'});

  @override
  State<HerdHealthView> createState() => _HerdHealthViewState();
}

class _HerdHealthViewState extends State<HerdHealthView> {
  late String _selectedSpecies;
  final FarmRepository _repository = Get.find<FarmRepository>();
  HerdHealthSummary? _summary;
  bool _isLoading = true;

  final List<String> _speciesList = ['all', 'cow', 'buffalo', 'goat', 'sheep'];

  @override
  void initState() {
    super.initState();
    _selectedSpecies = widget.initialSpecies;
    _fetchSummary();
  }

  Future<void> _fetchSummary() async {
    setState(() => _isLoading = true);
    try {
      final spec = _selectedSpecies == 'all' ? null : _selectedSpecies;
      final data = await _repository.getHerdHealthSummary(species: spec);
      setState(() {
        _summary = data;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Herd Health Intelligence',
          style: AppTypography.titleMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: 'Refresh Herd Analytics',
            onPressed: _fetchSummary,
          ),
        ],
      ),
      body: Column(
        children: [
          // Species Selection Filter
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: _speciesList.map((s) {
                  final isSelected = _selectedSpecies == s;
                  final label = s == 'all' ? 'All Herds' : '${s.capitalizeFirst} Herd';
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(
                        label,
                        style: TextStyle(
                          fontSize: 12,
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
                      onSelected: (_) {
                        setState(() => _selectedSpecies = s);
                        _fetchSummary();
                      },
                    ),
                  );
                }).toList(),
              ),
            ),
          ),
          const Divider(height: 1),

          // Main Body
          Expanded(
            child: _isLoading
                ? Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      children: [
                        AppLoadingSkeleton.card(height: 140),
                        const SizedBox(height: AppSpacing.md),
                        AppLoadingSkeleton.card(height: 180),
                      ],
                    ),
                  )
                : _summary == null
                    ? const Center(child: Text('No herd data available.'))
                    : SingleChildScrollView(
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildRiskMeterCard(_summary!),
                            const SizedBox(height: AppSpacing.lg),
                            _buildStatusDistributionCard(_summary!),
                            const SizedBox(height: AppSpacing.lg),
                            _buildVaccinationAuditCard(_summary!),
                            const SizedBox(height: AppSpacing.lg),
                            _buildBiosecurityActionCard(_summary!),
                            const SizedBox(height: AppSpacing.xl),
                            AppButton(
                              label: 'Inspect Geospatial Outbreak Cluster Map',
                              variant: AppButtonVariant.outline,
                              icon: Icons.map_outlined,
                              isFullWidth: true,
                              onPressed: () {
                                Get.back();
                                Get.find<NavController>().changePage(4); // Switch to Geospatial Map tab
                              },
                            ),
                            const SizedBox(height: AppSpacing.xxl),
                          ],
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildRiskMeterCard(HerdHealthSummary summary) {
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
      padding: const EdgeInsets.all(AppSpacing.lg),
      borderColor: riskColor.withValues(alpha: 0.35),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Herd Epidemiological Risk Index', style: AppTypography.titleSmall),
                  const SizedBox(height: 2),
                  Text(
                    summary.herdRiskLevel.toUpperCase(),
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: riskColor),
                  ),
                ],
              ),
              Container(
                width: 64,
                height: 64,
                decoration: BoxDecoration(
                  color: riskColor.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                  border: Border.all(color: riskColor, width: 2),
                ),
                child: Center(
                  child: Text(
                    '${summary.herdRiskScore}',
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: riskColor),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: AppSpacing.roundedFull,
            child: LinearProgressIndicator(
              value: (summary.herdRiskScore / 100).clamp(0.0, 1.0),
              minHeight: 8,
              backgroundColor: AppColors.slate200,
              valueColor: AlwaysStoppedAnimation<Color>(riskColor),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            summary.riskRationale,
            style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
          ),
          if (summary.activeClusterAlerts.isNotEmpty) ...[
            const SizedBox(height: 12),
            ...summary.activeClusterAlerts.map(
              (alert) => Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.danger.withValues(alpha: 0.1),
                  borderRadius: AppSpacing.roundedSm,
                  border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber_rounded, size: 16, color: AppColors.danger),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        alert,
                        style: AppTypography.labelSmall.copyWith(
                          color: AppColors.danger,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusDistributionCard(HerdHealthSummary summary) {
    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Health Status Distribution', style: AppTypography.titleSmall),
              Text('${summary.totalAnimals} Animals', style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted)),
            ],
          ),
          const Divider(height: 20),
          _buildStatusRow('Healthy & Optimal', summary.healthyCount, summary.healthyPct, AppColors.success),
          const SizedBox(height: 10),
          _buildStatusRow('Under Observation', summary.underObservationCount, summary.observationPct, AppColors.warning),
          const SizedBox(height: 10),
          _buildStatusRow('Affected / In Treatment', summary.affectedCount, summary.affectedPct, AppColors.warningDark),
          const SizedBox(height: 10),
          _buildStatusRow('Critical Attention', summary.criticalCount, summary.criticalPct, AppColors.danger),
          const SizedBox(height: 10),
          _buildStatusRow('Deceased', summary.deceasedCount, summary.deceasedPct, AppColors.slate500),
        ],
      ),
    );
  }

  Widget _buildStatusRow(String title, int count, double pct, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: AppTypography.labelMedium),
            Text(
              '$count (${pct.toStringAsFixed(1)}%)',
              style: TextStyle(fontWeight: FontWeight.w700, color: color, fontSize: 12),
            ),
          ],
        ),
        const SizedBox(height: 4),
        ClipRRect(
          borderRadius: AppSpacing.roundedFull,
          child: LinearProgressIndicator(
            value: (pct / 100).clamp(0.0, 1.0),
            minHeight: 6,
            backgroundColor: AppColors.surfaceSubtle,
            valueColor: AlwaysStoppedAnimation<Color>(color),
          ),
        ),
      ],
    );
  }

  Widget _buildVaccinationAuditCard(HerdHealthSummary summary) {
    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Herd Vaccination Shield', style: AppTypography.titleSmall),
              Text(
                '${summary.vaccinationCoveragePct.toStringAsFixed(0)}% Coverage',
                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.success),
              ),
            ],
          ),
          const Divider(height: 20),
          Text(
            'Target Endemic Diseases Protected:',
            style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: const [
              Chip(
                label: Text('Foot-and-Mouth Disease (FMD)', style: TextStyle(fontSize: 11)),
                backgroundColor: AppColors.successBg,
                avatar: Icon(Icons.check_circle, size: 16, color: AppColors.success),
              ),
              Chip(
                label: Text('Lumpy Skin Disease (LSD)', style: TextStyle(fontSize: 11)),
                backgroundColor: AppColors.successBg,
                avatar: Icon(Icons.check_circle, size: 16, color: AppColors.success),
              ),
              Chip(
                label: Text('Hemorrhagic Septicemia (HS)', style: TextStyle(fontSize: 11)),
                backgroundColor: AppColors.surfaceSubtle,
                avatar: Icon(Icons.schedule, size: 16, color: AppColors.warning),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBiosecurityActionCard(HerdHealthSummary summary) {
    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.verified_user_outlined, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Text('Recommended Biosecurity Actions', style: AppTypography.titleSmall),
            ],
          ),
          const Divider(height: 20),
          _buildActionItem('Quarantine Stall Protocol', 'Keep affected cattle separated by at least 15 meters with dedicated feed bunks.'),
          _buildActionItem('Footbath Disinfection', 'Maintain 4% sodium carbonate or 2% citric acid footbaths at barn entryways.'),
          _buildActionItem('Vector Suppression', 'Spray loafing yards with pyrethroid repellents to suppress Culicoides and biting flies.'),
        ],
      ),
    );
  }

  Widget _buildActionItem(String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.check_box_outlined, size: 16, color: AppColors.primary),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.labelMedium.copyWith(fontWeight: FontWeight.w700)),
                Text(desc, style: AppTypography.bodySmall.copyWith(fontSize: 11, color: AppColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
