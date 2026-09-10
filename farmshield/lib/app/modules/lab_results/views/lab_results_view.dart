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
import '../controllers/lab_results_controller.dart';

class LabResultsView extends StatefulWidget {
  const LabResultsView({super.key});

  @override
  State<LabResultsView> createState() => _LabResultsViewState();
}

class _LabResultsViewState extends State<LabResultsView> {
  final LabResultsController controller = Get.find<LabResultsController>();

  late final TextEditingController _analyteController;
  late final TextEditingController _resultController;
  late final TextEditingController _mrlController;
  late final TextEditingController _labNameController;

  @override
  void initState() {
    super.initState();
    _analyteController = TextEditingController(text: 'Amoxicillin Residue Assay');
    _resultController = TextEditingController(text: '12.5');
    _mrlController = TextEditingController(text: '50.0');
    _labNameController = TextEditingController(text: 'NDRI National Residue Testing Laboratory');

    controller.evaluateCompliance(_resultController.text, _mrlController.text);
  }

  @override
  void dispose() {
    _analyteController.dispose();
    _resultController.dispose();
    _mrlController.dispose();
    _labNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppHeaderBar(
        title: 'Analytical Assay Logging',
        subtitle: 'Lab Chemical Residue & MRL Compliance Verification',
      ),
      body: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Patient & Sample Origin
            _sectionHeader('1. Patient & Sample Origin', Icons.pets_rounded),
            const SizedBox(height: AppSpacing.sm),
            _buildAnimalDropdown(),
            const SizedBox(height: AppSpacing.md),
            _buildProductSelector(),

            const SizedBox(height: AppSpacing.xl),

            // 2. Chemical Analyte & Concentration
            _sectionHeader('2. Chemical Analyte & Concentration', Icons.biotech_rounded),
            const SizedBox(height: AppSpacing.sm),
            AppTextField(
              controller: _analyteController,
              label: 'Target Analyte / Residue Molecule',
              hint: 'e.g. Amoxicillin, Enrofloxacin, Tetracycline',
              prefixIcon: Icons.science_outlined,
            ),
            const SizedBox(height: AppSpacing.sm),
            _buildSuggestions(),
            const SizedBox(height: AppSpacing.md),
            Row(
              children: [
                Expanded(
                  child: AppTextField(
                    controller: _resultController,
                    label: 'Measured (µg/kg)',
                    hint: '12.5',
                    prefixIcon: Icons.speed_rounded,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    onChanged: (val) => controller.evaluateCompliance(val, _mrlController.text),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: AppTextField(
                    controller: _mrlController,
                    label: 'MRL Limit (µg/kg)',
                    hint: '50.0',
                    prefixIcon: Icons.gavel_rounded,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    onChanged: (val) => controller.evaluateCompliance(_resultController.text, val),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            _buildLiveComplianceBanner(),

            const SizedBox(height: AppSpacing.xl),

            // 3. Laboratory & Testing Date
            _sectionHeader('3. Laboratory & Test Schedule', Icons.verified_rounded),
            const SizedBox(height: AppSpacing.sm),
            AppTextField(
              controller: _labNameController,
              label: 'Testing Laboratory Facility',
              hint: 'e.g. NDRI Central Animal Health Laboratory',
              prefixIcon: Icons.domain_rounded,
            ),
            const SizedBox(height: AppSpacing.md),
            _buildDatePicker(context),

            const SizedBox(height: AppSpacing.xl),

            // 4. Certificate Attachment
            _sectionHeader('4. Official Lab Certificate', Icons.attach_file_rounded),
            const SizedBox(height: AppSpacing.sm),
            _buildCertificateCard(),

            const SizedBox(height: AppSpacing.xxl),

            // Submit Button
            Obx(() => AppButton(
                  label: 'Save & Sync Lab Test Result',
                  icon: Icons.cloud_upload_rounded,
                  isLoading: controller.isLoading.value,
                  isFullWidth: true,
                  height: 52,
                  onPressed: () {
                    final resultVal = double.tryParse(_resultController.text.trim()) ?? 0.0;
                    final mrlVal = double.tryParse(_mrlController.text.trim()) ?? 50.0;

                    controller.submitLabResults(
                      animalIdOrTag: controller.selectedAnimalId.value,
                      product: controller.selectedProduct.value,
                      analyte: _analyteController.text.trim(),
                      result: resultVal,
                      mrl: mrlVal,
                      laboratory: _labNameController.text.trim(),
                    );
                  },
                )),
            const SizedBox(height: AppSpacing.xl),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title, IconData icon) {
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
              hint: Text('Select Tested Animal', style: AppTypography.bodySmall),
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

  Widget _buildProductSelector() {
    final products = [
      {'key': 'milk', 'label': 'Milk', 'icon': Icons.local_drink_rounded},
      {'key': 'meat', 'label': 'Meat', 'icon': Icons.restaurant_rounded},
      {'key': 'eggs', 'label': 'Eggs', 'icon': Icons.egg_rounded},
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

  Widget _buildSuggestions() {
    final suggestions = ['Amoxicillin', 'Oxytetracycline', 'Enrofloxacin', 'Sulfadiazine'];
    return SizedBox(
      height: 30,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: suggestions.map((s) {
          return Padding(
            padding: const EdgeInsets.only(right: 6),
            child: GestureDetector(
              onTap: () => _analyteController.text = '$s Residue Assay',
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSubtle,
                  borderRadius: AppSpacing.roundedSm,
                  border: Border.all(color: AppColors.border),
                ),
                child: Text(s, style: AppTypography.labelSmall.copyWith(fontSize: 11)),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildLiveComplianceBanner() {
    return Obx(() {
      final isComp = controller.isCompliant.value;
      return AppCard(
        color: isComp ? AppColors.successBg : AppColors.dangerBg,
        borderColor: isComp
            ? AppColors.success.withValues(alpha: 0.3)
            : AppColors.danger.withValues(alpha: 0.3),
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Icon(
              isComp ? Icons.check_circle_rounded : Icons.cancel_rounded,
              color: isComp ? AppColors.success : AppColors.danger,
              size: 22,
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Text(
                controller.complianceMessage.value,
                style: AppTypography.labelMedium.copyWith(
                  color: isComp ? AppColors.success : AppColors.danger,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildDatePicker(BuildContext context) {
    return Obx(() => InkWell(
          borderRadius: AppSpacing.roundedMd,
          onTap: () async {
            final date = await showDatePicker(
              context: context,
              initialDate: controller.selectedDate.value,
              firstDate: DateTime(2020),
              lastDate: DateTime.now(),
            );
            if (date != null) controller.selectedDate.value = date;
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
                    Text('Sample Collection Date', style: AppTypography.bodySmall),
                  ],
                ),
                Text(
                  DateFormat('dd MMM yyyy').format(controller.selectedDate.value),
                  style: AppTypography.labelSmall.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ));
  }

  Widget _buildCertificateCard() {
    return Obx(() => AppCard(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.surfaceSubtle,
                  borderRadius: AppSpacing.roundedSm,
                  image: controller.selectedFile.value != null
                      ? DecorationImage(image: FileImage(controller.selectedFile.value!), fit: BoxFit.cover)
                      : null,
                ),
                child: controller.selectedFile.value == null
                    ? const Icon(Icons.picture_as_pdf_rounded, color: AppColors.primary, size: 24)
                    : null,
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      controller.selectedFile.value != null
                          ? 'Official Certificate Attached'
                          : 'Attach Certificate Scan',
                      style: AppTypography.titleSmall.copyWith(fontSize: 13),
                    ),
                    Text(
                      controller.selectedFile.value != null
                          ? controller.selectedFile.value!.path.split(RegExp(r'[\\/]')).last
                          : 'Supports PDF or high-resolution photo',
                      style: AppTypography.bodySmall,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              AppButton(
                label: controller.selectedFile.value == null ? 'Attach' : 'Change',
                variant: AppButtonVariant.secondary,
                height: 38,
                onPressed: () => controller.pickCertificate(),
              ),
            ],
          ),
        ));
  }
}
