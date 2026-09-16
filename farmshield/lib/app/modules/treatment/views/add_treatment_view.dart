import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_header_bar.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../data/models/farm_models.dart';
import '../controllers/treatment_controller.dart';

class AddTreatmentView extends StatefulWidget {
  const AddTreatmentView({super.key});

  @override
  State<AddTreatmentView> createState() => _AddTreatmentViewState();
}

class _AddTreatmentViewState extends State<AddTreatmentView> {
  final TreatmentController controller = Get.find<TreatmentController>();

  late final TextEditingController _doseController;
  late final TextEditingController _indicationController;
  late final TextEditingController _notesController;
  final RxString _doseUnit = 'mg/kg'.obs;

  @override
  void initState() {
    super.initState();
    _doseController = TextEditingController(text: '10.0');
    _indicationController = TextEditingController(text: 'Clinical Mastitis');
    _notesController = TextEditingController();
  }

  @override
  void dispose() {
    _doseController.dispose();
    _indicationController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppHeaderBar(
        title: 'Record Clinical Treatment',
        subtitle: 'AMU Logging & ML Compliance Check',
      ),
      body: Obx(() {
        if (controller.isLoading.value && controller.medicines.isEmpty) {
          return const Center(child: CircularProgressIndicator(color: AppColors.primary));
        }

        return SingleChildScrollView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Livestock & Medication
              _buildSectionHeader('1. Patient & Medication', Icons.pets_rounded),
              const SizedBox(height: AppSpacing.sm),
              _buildAnimalDropdown(),
              const SizedBox(height: AppSpacing.md),
              _buildMedicineDropdown(),
              const SizedBox(height: AppSpacing.sm),
              _buildLiveDrugBadge(),

              const SizedBox(height: AppSpacing.xl),

              // 2. Dosage & Administration
              _buildSectionHeader('2. Dosage & Administration', Icons.vaccines_rounded),
              const SizedBox(height: AppSpacing.sm),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    flex: 3,
                    child: AppTextField(
                      controller: _doseController,
                      label: 'Dose Amount',
                      hint: '10.0',
                      prefixIcon: Icons.scale_rounded,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    flex: 2,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Unit', style: AppTypography.labelSmall),
                        const SizedBox(height: 6),
                        Obx(() => Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: AppSpacing.roundedMd,
                                border: Border.all(color: AppColors.border),
                              ),
                              child: DropdownButtonHideUnderline(
                                child: DropdownButton<String>(
                                  value: _doseUnit.value,
                                  isExpanded: true,
                                  items: ['mg/kg', 'ml', 'g', 'IU']
                                      .map((e) => DropdownMenuItem(value: e, child: Text(e, style: AppTypography.bodySmall)))
                                      .toList(),
                                  onChanged: (val) {
                                    if (val != null) _doseUnit.value = val;
                                  },
                                ),
                              ),
                            )),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              _buildRouteSelector(),
              const SizedBox(height: AppSpacing.md),
              _buildDurationSelector(),
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _indicationController,
                label: 'Clinical Diagnosis / Indication',
                hint: 'e.g. Acute Mastitis in Right Quarter',
                prefixIcon: Icons.medical_services_outlined,
              ),
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _notesController,
                label: 'Veterinary Notes (Optional)',
                hint: 'e.g. Administer after morning milking cycle',
                prefixIcon: Icons.notes_rounded,
                maxLines: 2,
              ),

              const SizedBox(height: AppSpacing.xl),

              // 3. Product Affected & Safety Preview
              _buildSectionHeader('3. Product Affected & Safety Preview', Icons.verified_user_rounded),
              const SizedBox(height: AppSpacing.sm),
              _buildProductSelector(),
              const SizedBox(height: AppSpacing.md),
              _buildDatePicker(context),
              const SizedBox(height: AppSpacing.md),
              _buildSafetyCalculationCard(),

              const SizedBox(height: AppSpacing.xxl),

              // Submit Action
              Obx(() => AppButton(
                    label: 'Save Treatment & Trigger Withhold',
                    icon: Icons.shield_rounded,
                    isLoading: controller.isLoading.value,
                    isFullWidth: true,
                    height: 52,
                    onPressed: () {
                      if (controller.selectedAnimalId.value.isEmpty || controller.selectedMedicineId.value.isEmpty) {
                        Get.snackbar('Input Required', 'Please select an animal and medication',
                            snackPosition: SnackPosition.BOTTOM);
                        return;
                      }

                      final dose = double.tryParse(_doseController.text.trim()) ?? 10.0;
                      final duration = controller.selectedDuration.value;
                      final start = controller.selectedStartDate.value;
                      final end = start.add(Duration(days: duration));

                      controller.submitTreatment(Treatment(
                        animalId: controller.selectedAnimalId.value,
                        medicineId: controller.selectedMedicineId.value,
                        doseAmount: dose,
                        doseUnit: _doseUnit.value,
                        route: controller.selectedRoute.value,
                        frequency: controller.selectedFrequency.value,
                        durationDays: duration,
                        startDate: start,
                        endDate: end,
                        indication: _indicationController.text.trim(),
                        productAffected: controller.selectedProduct.value,
                        notes: _notesController.text.trim(),
                      ));
                    },
                  )),
              const SizedBox(height: AppSpacing.xl),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 8),
        Text(title, style: AppTypography.titleSmall),
      ],
    );
  }

  Widget _buildAnimalDropdown() {
    return Obx(() => Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppSpacing.roundedMd,
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: controller.selectedAnimalId.value.isEmpty ? null : controller.selectedAnimalId.value,
              hint: Text('Select Animal (Tag / Breed)', style: AppTypography.bodySmall),
              isExpanded: true,
              items: controller.animals
                  .map((a) => DropdownMenuItem(
                        value: a.id ?? a.animalCode ?? '',
                        child: Text(
                          '${a.animalCode ?? "Tag"} • ${a.breed ?? a.species?.capitalizeFirst ?? "Cattle"}',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ))
                  .toList(),
              onChanged: (val) {
                if (val != null) controller.selectedAnimalId.value = val;
              },
            ),
          ),
        ));
  }

  Widget _buildMedicineDropdown() {
    return Obx(() => Container(
          padding: const EdgeInsets.symmetric(horizontal: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: AppSpacing.roundedMd,
            border: Border.all(color: AppColors.border),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              value: controller.selectedMedicineId.value.isEmpty ? null : controller.selectedMedicineId.value,
              hint: Text('Select Prescribed Medication', style: AppTypography.bodySmall),
              isExpanded: true,
              items: controller.medicines
                  .map((m) => DropdownMenuItem(
                        value: m.id ?? m.name ?? '',
                        child: Text(
                          '${m.name ?? "Drug"} (${m.activeIngredient ?? ""})',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textPrimary,
                            fontWeight: FontWeight.w600,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ))
                  .toList(),
              onChanged: (val) {
                if (val != null) controller.selectedMedicineId.value = val;
              },
            ),
          ),
        ));
  }

  Widget _buildLiveDrugBadge() {
    return Obx(() {
      final med = controller.selectedMedicine.value;
      if (med == null) return const SizedBox.shrink();

      return Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: AppColors.primarySoft,
          borderRadius: AppSpacing.roundedSm,
          border: Border.all(color: AppColors.accent.withValues(alpha: 0.3)),
        ),
        child: Row(
          children: [
            const Icon(Icons.info_outline_rounded, color: AppColors.primary, size: 16),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Class: ${med.antimicrobialClass ?? "Beta-lactam"} • Strength: ${med.strength ?? "150mg/ml"}',
                style: AppTypography.labelSmall.copyWith(
                  color: AppColors.primaryDark,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildRouteSelector() {
    final routes = ['Injection (IM/SC)', 'Oral / Drench', 'Intramammary', 'Topical / Dip'];
    return Obx(() => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Administration Route', style: AppTypography.labelSmall),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: routes.map((r) {
                final isSelected = controller.selectedRoute.value == r;
                return ChoiceChip(
                  label: Text(
                    r,
                    style: AppTypography.labelSmall.copyWith(
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) controller.selectedRoute.value = r;
                  },
                  selectedColor: AppColors.primary,
                  backgroundColor: AppColors.surface,
                  side: BorderSide(
                    color: isSelected ? AppColors.primary : AppColors.border,
                  ),
                );
              }).toList(),
            ),
          ],
        ));
  }

  Widget _buildDurationSelector() {
    final durations = [1, 3, 5, 7, 10];
    return Obx(() => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Course Duration (Days)', style: AppTypography.labelSmall),
            const SizedBox(height: 6),
            Row(
              children: durations.map((d) {
                final isSelected = controller.selectedDuration.value == d;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      label: Text(
                        '$d Day${d > 1 ? "s" : ""}',
                        style: AppTypography.labelSmall.copyWith(
                          fontSize: 10.5,
                          color: isSelected ? Colors.white : AppColors.textSecondary,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) controller.selectedDuration.value = d;
                      },
                      selectedColor: AppColors.primary,
                      backgroundColor: AppColors.surface,
                      side: BorderSide(
                        color: isSelected ? AppColors.primary : AppColors.border,
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ));
  }

  Widget _buildProductSelector() {
    final products = [
      {'key': 'milk', 'label': 'Milk', 'icon': Icons.local_drink_rounded},
      {'key': 'meat', 'label': 'Meat', 'icon': Icons.restaurant_rounded},
      {'key': 'all', 'label': 'All Produce', 'icon': Icons.all_inbox_rounded},
    ];

    return Obx(() => Row(
          children: products.map((p) {
            final isSelected = controller.selectedProduct.value == p['key'];
            return Expanded(
              child: GestureDetector(
                onTap: () => controller.selectedProduct.value = p['key'] as String,
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primarySoft : AppColors.surface,
                    borderRadius: AppSpacing.roundedMd,
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.border,
                      width: isSelected ? 1.5 : 1.0,
                    ),
                  ),
                  child: Column(
                    children: [
                      Icon(
                        p['icon'] as IconData,
                        size: 20,
                        color: isSelected ? AppColors.primary : AppColors.slate400,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        p['label'] as String,
                        style: AppTypography.labelSmall.copyWith(
                          color: isSelected ? AppColors.primary : AppColors.textSecondary,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ));
  }

  Widget _buildDatePicker(BuildContext context) {
    return Obx(() => InkWell(
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: controller.selectedStartDate.value,
              firstDate: DateTime(2022),
              lastDate: DateTime.now().add(const Duration(days: 14)),
            );
            if (date != null) controller.selectedStartDate.value = date;
          },
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: AppSpacing.roundedMd,
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.calendar_month_rounded, color: AppColors.primary, size: 18),
                    const SizedBox(width: 8),
                    Text('Start Date', style: AppTypography.bodySmall),
                  ],
                ),
                Text(
                  DateFormat('EEE, dd MMM yyyy').format(controller.selectedStartDate.value),
                  style: AppTypography.labelSmall.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ));
  }

  Widget _buildSafetyCalculationCard() {
    return Obx(() {
      final days = controller.estimatedWithdrawalDays;
      final clearanceDate = controller.estimatedClearanceDate;
      final formattedClearance = DateFormat('EEE, dd MMM yyyy').format(clearanceDate);

      return AppCard(
        color: AppColors.warningBg,
        borderColor: AppColors.warning.withValues(alpha: 0.3),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.lock_clock_rounded, color: AppColors.warning, size: 18),
                    const SizedBox(width: 6),
                    Text(
                      'AI MRL Withhold Calculator',
                      style: AppTypography.labelMedium.copyWith(
                        color: AppColors.warning,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: AppSpacing.roundedXs,
                  ),
                  child: Text(
                    'FSSAI / Codex',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.warning,
                      fontSize: 9.5,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Required Withhold: $days Days post-course completion.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textPrimary),
            ),
            Text(
              'Projected Safe Harvest Date: $formattedClearance',
              style: AppTypography.labelSmall.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      );
    });
  }
}
