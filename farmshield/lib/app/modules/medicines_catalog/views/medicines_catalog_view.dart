import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../data/models/farm_models.dart';
import '../controllers/medicines_catalog_controller.dart';

class MedicinesCatalogView extends GetView<MedicinesCatalogController> {
  const MedicinesCatalogView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Veterinary Formulary & MRLs',
          style: AppTypography.titleMedium.copyWith(color: Colors.white),
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(64),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, AppSpacing.sm),
            child: Container(
              height: 46,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppSpacing.roundedMd,
                boxShadow: AppSpacing.shadowSubtle,
              ),
              child: TextField(
                onChanged: (value) => controller.searchQuery.value = value,
                style: AppTypography.bodyMedium,
                decoration: InputDecoration(
                  isDense: true,
                  hintText: 'Search medication brand, active compound, class...',
                  hintStyle: AppTypography.bodySmall,
                  prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary, size: 20),
                  contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  border: InputBorder.none,
                  filled: false,
                ),
              ),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          _buildFilterChips(),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator(color: AppColors.primary));
              }
              final list = controller.filteredMedicines;
              if (list.isEmpty) {
                return AppEmptyState(
                  icon: Icons.medication_liquid_rounded,
                  title: 'No Medications Found',
                  description: 'No veterinary drugs matched your search criteria.',
                  actionLabel: 'Add New Drug',
                  onAction: () => controller.showAddMedicineSheet(),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, 80),
                itemCount: list.length,
                physics: const BouncingScrollPhysics(),
                itemBuilder: (context, index) => _buildMedicineCard(list[index]),
              );
            }),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => controller.showAddMedicineSheet(),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded, size: 20),
        label: Text('Add Drug & MRL', style: AppTypography.labelMedium.copyWith(color: Colors.white)),
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 50,
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: ListView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        children: controller.antimicrobialClasses.map((c) {
          return Obx(() {
            final isSelected = controller.selectedClass.value == c;
            return Padding(
              padding: const EdgeInsets.only(right: AppSpacing.sm),
              child: ChoiceChip(
                label: Text(
                  c,
                  style: AppTypography.labelSmall.copyWith(
                    color: isSelected ? Colors.white : AppColors.textSecondary,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
                selected: isSelected,
                onSelected: (_) => controller.selectedClass.value = c,
                selectedColor: AppColors.primary,
                backgroundColor: AppColors.surface,
                side: BorderSide(
                  color: isSelected ? AppColors.primary : AppColors.border,
                ),
              ),
            );
          });
        }).toList(),
      ),
    );
  }

  Widget _buildMedicineCard(Medicine medicine) {
    final isCia = controller.isCIA(medicine.antimicrobialClass);
    final rules = medicine.rules ?? [];

    final milkRule = rules.firstWhereOrNull((r) => r.product?.toLowerCase() == 'milk');
    final aquaRule = rules.firstWhereOrNull((r) => r.product?.toLowerCase() == 'aquaculture' || r.product?.toLowerCase() == 'fish');

    return AppCard(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      borderColor: isCia ? AppColors.danger.withValues(alpha: 0.35) : AppColors.border,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 68,
            height: 68,
            decoration: BoxDecoration(
              borderRadius: AppSpacing.roundedMd,
              color: AppColors.primarySoft,
              image: medicine.imageUrl != null
                  ? DecorationImage(image: NetworkImage(medicine.imageUrl!), fit: BoxFit.cover)
                  : null,
            ),
            child: medicine.imageUrl == null
                ? const Icon(Icons.medication_liquid_rounded, size: 30, color: AppColors.primary)
                : null,
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        medicine.name ?? 'Unknown Medicine',
                        style: AppTypography.titleSmall.copyWith(fontSize: 14),
                      ),
                    ),
                    if (isCia)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.dangerBg,
                          borderRadius: AppSpacing.roundedXs,
                          border: Border.all(color: AppColors.danger.withValues(alpha: 0.3)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.warning_amber_rounded, size: 12, color: AppColors.danger),
                            const SizedBox(width: 4),
                            Text(
                              'WHO CIA',
                              style: AppTypography.labelSmall.copyWith(
                                color: AppColors.danger,
                                fontSize: 9.5,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  '${medicine.activeIngredient ?? "Active Ingredient"} • ${medicine.strength ?? ""}',
                  style: AppTypography.bodySmall,
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSubtle,
                    borderRadius: AppSpacing.roundedXs,
                  ),
                  child: Text(
                    medicine.antimicrobialClass ?? 'Veterinary Therapeutic',
                    style: AppTypography.labelSmall.copyWith(
                      fontSize: 10,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    if (milkRule != null && milkRule.withdrawalDays != null)
                      _mrlTag('Milk W/D: ${milkRule.withdrawalDays}d', AppColors.warning, AppColors.warningBg),
                    if (aquaRule != null && aquaRule.withdrawalDays != null)
                      _mrlTag('Aqua W/D: ${aquaRule.withdrawalDays}d', AppColors.info, AppColors.infoBg),
                    if (milkRule != null && milkRule.mrl != null)
                      _mrlTag('MRL: ${milkRule.mrl} µg/kg', AppColors.success, AppColors.successBg),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _mrlTag(String text, Color color, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: AppSpacing.roundedXs,
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Text(
        text,
        style: AppTypography.labelSmall.copyWith(color: color, fontSize: 10),
      ),
    );
  }
}
