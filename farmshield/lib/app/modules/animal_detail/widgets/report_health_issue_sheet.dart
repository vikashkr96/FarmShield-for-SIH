import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/services/clinical_triage_service.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../data/models/health_models.dart';

class ReportHealthIssueSheet extends StatefulWidget {
  final Map<String, dynamic> animalData;
  final Future<void> Function({
    required Set<String> symptoms,
    required TriageAssessment triage,
    double? bodyTemperatureC,
    String? notes,
  }) onSubmit;

  const ReportHealthIssueSheet({
    super.key,
    required this.animalData,
    required this.onSubmit,
  });

  static Future<void> show(
    BuildContext context, {
    required Map<String, dynamic> animalData,
    required Future<void> Function({
      required Set<String> symptoms,
      required TriageAssessment triage,
      double? bodyTemperatureC,
      String? notes,
    }) onSubmit,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => ReportHealthIssueSheet(
        animalData: animalData,
        onSubmit: onSubmit,
      ),
    );
  }

  @override
  State<ReportHealthIssueSheet> createState() => _ReportHealthIssueSheetState();
}

class _ReportHealthIssueSheetState extends State<ReportHealthIssueSheet> {
  final Set<String> _selectedSymptoms = {};
  final TextEditingController _tempController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();
  final ClinicalTriageService _triageService = ClinicalTriageService();

  bool _isSubmitting = false;

  TriageAssessment get _currentAssessment {
    final temp = double.tryParse(_tempController.text.trim());
    final species = widget.animalData['species']?.toString();
    return _triageService.evaluateTriage(
      selectedSymptoms: _selectedSymptoms,
      bodyTemperatureC: temp,
      species: species,
    );
  }

  @override
  void dispose() {
    _tempController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  void _toggleSymptom(String key) {
    setState(() {
      if (_selectedSymptoms.contains(key)) {
        _selectedSymptoms.remove(key);
      } else {
        _selectedSymptoms.add(key);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final assessment = _currentAssessment;
    final animalCode = widget.animalData['animal_code'] ?? 'ANIMAL';
    final species = (widget.animalData['species'] ?? 'Livestock').toString().toUpperCase();

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusXl)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.lg,
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.9,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header Drag Handle
          const SizedBox(height: 12),
          Container(
            width: 44,
            height: 4,
            decoration: BoxDecoration(
              color: AppColors.slate300,
              borderRadius: AppSpacing.roundedFull,
            ),
          ),
          const SizedBox(height: 12),

          // Title Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.healing_rounded, color: AppColors.warningDark, size: 22),
                        const SizedBox(width: 8),
                        Text(
                          'Report Health Issue',
                          style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Target: $animalCode • $species',
                      style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
          ),
          const Divider(height: 16),

          // Scrollable Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Step 1: Select Observed Symptoms
                  Text(
                    '1. Select Observed Symptoms',
                    style: AppTypography.titleSmall.copyWith(color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Tap all clinical signs visible during inspection:',
                    style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: ClinicalTriageService.symptomCatalog.entries.map((entry) {
                      final isSelected = _selectedSymptoms.contains(entry.key);
                      final isAlarming = entry.key.contains('fever') ||
                          entry.key.contains('blister') ||
                          entry.key.contains('throat') ||
                          entry.key.contains('death');

                      return FilterChip(
                        selected: isSelected,
                        label: Text(
                          entry.value,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                            color: isSelected
                                ? (isAlarming ? Colors.white : AppColors.primary)
                                : AppColors.textPrimary,
                          ),
                        ),
                        selectedColor: isAlarming ? AppColors.danger : AppColors.primarySoft,
                        checkmarkColor: isAlarming ? Colors.white : AppColors.primary,
                        backgroundColor: AppColors.surfaceSubtle,
                        shape: RoundedRectangleBorder(
                          borderRadius: AppSpacing.roundedSm,
                          side: BorderSide(
                            color: isSelected
                                ? (isAlarming ? AppColors.danger : AppColors.primary)
                                : AppColors.border,
                          ),
                        ),
                        onSelected: (_) => _toggleSymptom(entry.key),
                      );
                    }).toList(),
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Step 2: Body Temperature (Optional Vitals)
                  Text(
                    '2. Body Temperature (Optional)',
                    style: AppTypography.titleSmall.copyWith(color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _tempController,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: InputDecoration(
                            hintText: 'e.g. 39.8',
                            prefixIcon: const Icon(Icons.thermostat_rounded, size: 20, color: AppColors.warningDark),
                            suffixText: '°C',
                            isDense: true,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            border: OutlineInputBorder(
                              borderRadius: AppSpacing.roundedSm,
                              borderSide: const BorderSide(color: AppColors.border),
                            ),
                          ),
                          onChanged: (_) => setState(() {}),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Normal range:\n38.5°C – 39.5°C (101.5 – 103°F)',
                          style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: AppSpacing.lg),

                  // Step 3: Transparent Rule-Based Triage Assessment Card
                  _buildTriageCard(assessment),

                  const SizedBox(height: AppSpacing.lg),

                  // Step 4: Additional Clinical Notes
                  Text(
                    '3. Additional Field Notes',
                    style: AppTypography.titleSmall.copyWith(color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _notesController,
                    maxLines: 2,
                    decoration: InputDecoration(
                      hintText: 'Add remarks on feed intake, pen conditions, or affected herd mates...',
                      isDense: true,
                      contentPadding: const EdgeInsets.all(12),
                      border: OutlineInputBorder(
                        borderRadius: AppSpacing.roundedSm,
                        borderSide: const BorderSide(color: AppColors.border),
                      ),
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xl),
                ],
              ),
            ),
          ),

          // Bottom Action Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: 12),
            decoration: const BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            child: AppButton(
              label: _isSubmitting ? 'Recording Report...' : 'Log & Apply Triage Status',
              icon: Icons.check_circle_rounded,
              isFullWidth: true,
              isLoading: _isSubmitting,
              onPressed: _isSubmitting
                  ? null
                  : () async {
                      if (_selectedSymptoms.isEmpty && _tempController.text.trim().isEmpty) {
                        Get.snackbar(
                          'Select Symptoms',
                          'Please select at least one observed sign or record a body temperature.',
                          snackPosition: SnackPosition.BOTTOM,
                        );
                        return;
                      }

                      setState(() => _isSubmitting = true);
                      try {
                        final temp = double.tryParse(_tempController.text.trim());
                        await widget.onSubmit(
                          symptoms: _selectedSymptoms,
                          triage: assessment,
                          bodyTemperatureC: temp,
                          notes: _notesController.text.trim().isNotEmpty
                              ? _notesController.text.trim()
                              : null,
                        );
                        if (mounted) {
                          Get.back();
                        }
                      } finally {
                        if (mounted) {
                          setState(() => _isSubmitting = false);
                        }
                      }
                    },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTriageCard(TriageAssessment assessment) {
    Color cardBorderColor;
    Color headerBg;
    switch (assessment.urgency) {
      case TriageUrgency.urgent:
        cardBorderColor = AppColors.danger;
        headerBg = AppColors.danger.withValues(alpha: 0.12);
        break;
      case TriageUrgency.high:
        cardBorderColor = AppColors.warningDark;
        headerBg = AppColors.warningDark.withValues(alpha: 0.12);
        break;
      case TriageUrgency.moderate:
        cardBorderColor = AppColors.warning;
        headerBg = AppColors.warning.withValues(alpha: 0.12);
        break;
      case TriageUrgency.low:
        cardBorderColor = AppColors.success;
        headerBg = AppColors.success.withValues(alpha: 0.12);
        break;
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: AppSpacing.roundedMd,
        border: Border.all(color: cardBorderColor, width: 1.5),
        boxShadow: AppSpacing.shadowSubtle,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Banner
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: headerBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusMd - 1)),
            ),
            child: Row(
              children: [
                Icon(assessment.urgency.icon, color: cardBorderColor, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    assessment.urgency.label.toUpperCase(),
                    style: TextStyle(
                      color: cardBorderColor,
                      fontWeight: FontWeight.w800,
                      fontSize: 13,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: AppSpacing.roundedXs,
                    border: Border.all(color: cardBorderColor.withValues(alpha: 0.4)),
                  ),
                  child: Text(
                    'Clinical Triage',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: cardBorderColor),
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Suspected Condition
                if (assessment.suspectedConditions.isNotEmpty) ...[
                  Text(
                    'Suspected Indication:',
                    style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    assessment.suspectedConditions.join(' / '),
                    style: AppTypography.titleSmall.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 10),
                ],

                // Why? Transparent Rationale
                if (assessment.rationalePoints.isNotEmpty) ...[
                  Text(
                    'Explainable Clinical Triggers:',
                    style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 4),
                  ...assessment.rationalePoints.map((r) => Padding(
                        padding: const EdgeInsets.only(bottom: 3),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('• ', style: TextStyle(fontWeight: FontWeight.bold, color: AppColors.textMuted)),
                            Expanded(
                              child: Text(r, style: AppTypography.bodySmall.copyWith(fontSize: 11)),
                            ),
                          ],
                        ),
                      )),
                  const SizedBox(height: 10),
                ],

                // Actionable Biosecurity Recommendations
                if (assessment.recommendedActions.isNotEmpty) ...[
                  Text(
                    'Immediate Response Advice:',
                    style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                  ),
                  const SizedBox(height: 4),
                  ...assessment.recommendedActions.map((a) => Padding(
                        padding: const EdgeInsets.only(bottom: 3),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Icon(Icons.arrow_right_rounded, size: 16, color: AppColors.primary),
                            Expanded(
                              child: Text(
                                a,
                                style: AppTypography.bodySmall.copyWith(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                            ),
                          ],
                        ),
                      )),
                ],

                // Isolation Banner Alert
                if (assessment.requiresImmediateIsolation) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.danger.withValues(alpha: 0.1),
                      borderRadius: AppSpacing.roundedSm,
                      border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.shield_outlined, color: AppColors.danger, size: 16),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Immediate Physical Quarantine Recommended',
                            style: AppTypography.labelSmall.copyWith(
                              color: AppColors.danger,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
