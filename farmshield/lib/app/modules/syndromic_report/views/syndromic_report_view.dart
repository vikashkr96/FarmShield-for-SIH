import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_header_bar.dart';
import '../../../core/widgets/app_text_field.dart';
import '../controllers/syndromic_report_controller.dart';

class SyndromicReportView extends GetView<SyndromicReportController> {
  const SyndromicReportView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppHeaderBar(
        title: 'Emergency Disease Report',
        subtitle: 'Syndromic Surveillance & Rapid Outbreak Alert',
        backgroundColor: AppColors.danger,
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Offline Resilience Banner
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.dangerBg,
                borderRadius: AppSpacing.roundedMd,
                border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.cloud_sync_rounded, color: AppColors.danger, size: 22),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Zero-Connectivity Resilience',
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.danger,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Reports save locally and dispatch immediately once internet connectivity resumes.',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.danger,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.lg),

            // Step 1: Species Selector
            _sectionTitle('1. Affected Species Category', Icons.pets_rounded),
            const SizedBox(height: AppSpacing.sm),
            Obx(
              () => Wrap(
                spacing: 8,
                runSpacing: 8,
                children: ['cow', 'buffalo', 'goat', 'sheep', 'poultry'].map((sp) {
                  final isSel = controller.selectedSpecies.value == sp;
                  return ChoiceChip(
                    label: Text(
                      sp.toUpperCase(),
                      style: AppTypography.labelSmall.copyWith(
                        color: isSel ? Colors.white : AppColors.textSecondary,
                        fontWeight: isSel ? FontWeight.bold : FontWeight.w500,
                      ),
                    ),
                    selected: isSel,
                    selectedColor: AppColors.danger,
                    backgroundColor: AppColors.surface,
                    side: BorderSide(
                      color: isSel ? AppColors.danger : AppColors.border,
                    ),
                    onSelected: (_) => controller.selectedSpecies.value = sp,
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Step 2: Clinical Symptoms
            _sectionTitle('2. Observed Clinical Symptoms', Icons.healing_rounded),
            const SizedBox(height: AppSpacing.sm),
            AppCard(
              padding: const EdgeInsets.symmetric(vertical: 6),
              child: Obx(
                () => Column(
                  children: controller.symptoms.keys.map((sym) {
                    final label = sym.replaceAll('_', ' ').capitalizeFirst!;
                    final isChecked = controller.symptoms[sym] ?? false;
                    return CheckboxListTile(
                      title: Text(label, style: AppTypography.bodyMedium),
                      value: isChecked,
                      activeColor: AppColors.danger,
                      dense: true,
                      shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedSm),
                      onChanged: (_) => controller.toggleSymptom(sym),
                    );
                  }).toList(),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xl),

            // Step 3: Herd Impact Counters
            _sectionTitle('3. Epidemiological Impact', Icons.group_outlined),
            const SizedBox(height: AppSpacing.sm),
            Row(
              children: [
                Expanded(
                  child: AppTextField(
                    initialValue: '1',
                    label: 'Affected Animals',
                    prefixIcon: Icons.sick_outlined,
                    keyboardType: TextInputType.number,
                    onChanged: (val) => controller.affectedCount.value = int.tryParse(val) ?? 1,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: AppTextField(
                    initialValue: '0',
                    label: 'Mortality / Deaths',
                    prefixIcon: Icons.heart_broken_outlined,
                    keyboardType: TextInputType.number,
                    onChanged: (val) => controller.mortalityCount.value = int.tryParse(val) ?? 0,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),

            // Step 4: Real-time Guidance Box
            Obx(() {
              if (controller.offlineAdvice.value.isEmpty) return const SizedBox.shrink();
              return AppCard(
                color: AppColors.warningBg,
                borderColor: AppColors.warning.withValues(alpha: 0.3),
                margin: const EdgeInsets.only(bottom: AppSpacing.lg),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.shield_outlined, color: AppColors.warning, size: 22),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Immediate Biosecurity Advisory',
                            style: AppTypography.labelSmall.copyWith(
                              color: AppColors.warning,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            controller.offlineAdvice.value,
                            style: AppTypography.bodySmall.copyWith(
                              color: AppColors.slate800,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              );
            }),

            // Submit Button
            Obx(
              () => AppButton(
                label: 'Transmit Surveillance Report',
                variant: AppButtonVariant.danger,
                icon: Icons.send_rounded,
                isLoading: controller.isSubmitting.value,
                isFullWidth: true,
                height: 52,
                onPressed: controller.submitReport,
              ),
            ),
            const SizedBox(height: AppSpacing.xxl),
          ],
        ),
      ),
    );
  }

  Widget _sectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.danger),
        const SizedBox(width: 8),
        Text(title, style: AppTypography.titleSmall),
      ],
    );
  }
}
