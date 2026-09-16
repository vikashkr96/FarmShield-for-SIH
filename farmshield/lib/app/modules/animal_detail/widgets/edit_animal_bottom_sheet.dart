import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_text_field.dart';

class EditAnimalBottomSheet extends StatefulWidget {
  final Map<String, dynamic> animalData;
  final Future<void> Function(Map<String, dynamic> updatedData) onSave;

  const EditAnimalBottomSheet({
    super.key,
    required this.animalData,
    required this.onSave,
  });

  static Future<void> show(
    BuildContext context, {
    required Map<String, dynamic> animalData,
    required Future<void> Function(Map<String, dynamic> updatedData) onSave,
  }) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => EditAnimalBottomSheet(
        animalData: animalData,
        onSave: onSave,
      ),
    );
  }

  @override
  State<EditAnimalBottomSheet> createState() => _EditAnimalBottomSheetState();
}

class _EditAnimalBottomSheetState extends State<EditAnimalBottomSheet> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _codeController;
  late final TextEditingController _breedController;
  late final TextEditingController _weightController;

  late String _species;
  late String _sex;
  late String _purpose;
  late String _healthStatus;
  DateTime? _dob;

  bool _isSaving = false;

  final List<String> _speciesOptions = ['cow', 'buffalo', 'goat', 'sheep', 'fishery', 'other'];
  final List<String> _purposeOptions = ['milk', 'meat', 'breeding', 'aquaculture', 'other'];
  final List<String> _healthStatusOptions = ['healthy', 'sick', 'under_treatment', 'quarantine'];

  @override
  void initState() {
    super.initState();
    final d = widget.animalData;

    _codeController = TextEditingController(text: d['animal_code']?.toString() ?? '');
    _breedController = TextEditingController(text: d['breed']?.toString() ?? '');
    final weightVal = d['weight'] ?? d['weight_kg'];
    _weightController = TextEditingController(text: weightVal != null ? weightVal.toString() : '');

    _species = (d['species']?.toString().toLowerCase() ?? 'cow');
    if (!_speciesOptions.contains(_species)) _species = 'other';

    _sex = (d['sex']?.toString().toLowerCase() ?? 'female');
    if (_sex != 'male' && _sex != 'female') _sex = 'female';

    _purpose = (d['purpose']?.toString().toLowerCase() ?? 'milk');
    if (!_purposeOptions.contains(_purpose)) _purpose = 'other';

    _healthStatus = (d['health_status']?.toString().toLowerCase() ?? 'healthy');
    if (!_healthStatusOptions.contains(_healthStatus)) _healthStatus = 'healthy';

    if (d['dob'] != null) {
      _dob = DateTime.tryParse(d['dob'].toString());
    }
  }

  @override
  void dispose() {
    _codeController.dispose();
    _breedController.dispose();
    _weightController.dispose();
    super.dispose();
  }

  bool _isFormDirty() {
    final d = widget.animalData;
    final initialCode = d['animal_code']?.toString() ?? '';
    final initialBreed = d['breed']?.toString() ?? '';
    final initialWeight = (d['weight'] ?? d['weight_kg'])?.toString() ?? '';

    return _codeController.text.trim() != initialCode ||
        _breedController.text.trim() != initialBreed ||
        _weightController.text.trim() != initialWeight ||
        _species != (d['species']?.toString().toLowerCase() ?? 'cow') ||
        _sex != (d['sex']?.toString().toLowerCase() ?? 'female') ||
        _purpose != (d['purpose']?.toString().toLowerCase() ?? 'milk') ||
        _healthStatus != (d['health_status']?.toString().toLowerCase() ?? 'healthy');
  }

  Future<void> _handleSave() async {
    if (_isSaving) return;
    if (!_formKey.currentState!.validate()) return;

    final weight = double.tryParse(_weightController.text.trim());
    if (weight == null || weight <= 0) {
      Get.snackbar('Validation', 'Please enter a valid weight in kg (> 0)',
          snackPosition: SnackPosition.BOTTOM);
      return;
    }

    setState(() => _isSaving = true);

    try {
      final updatedData = {
        'animal_code': _codeController.text.trim(),
        'species': _species,
        'breed': _breedController.text.trim(),
        'sex': _sex,
        'weight': weight,
        'purpose': _purpose,
        'health_status': _healthStatus,
        if (_dob != null) 'dob': DateFormat('yyyy-MM-dd').format(_dob!),
      };

      await widget.onSave(updatedData);

      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSaving = false);
        Get.snackbar('Save Error', 'Could not save animal details: $e',
            snackPosition: SnackPosition.BOTTOM);
      }
    }
  }

  void _onDismissRequested() {
    if (_isFormDirty() && !_isSaving) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedMd),
          title: const Text('Discard Changes?'),
          content: const Text('You have unsaved changes. Are you sure you want to discard them?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Keep Editing'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(ctx).pop();
                Navigator.of(context).pop();
              },
              child: const Text('Discard', style: TextStyle(color: AppColors.danger)),
            ),
          ],
        ),
      );
    } else {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusXl)),
      ),
      padding: EdgeInsets.fromLTRB(20, 12, 20, bottomInset + 20),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top drag notch
              Center(
                child: Container(
                  width: 42,
                  height: 4.5,
                  decoration: BoxDecoration(
                    color: AppColors.slate300,
                    borderRadius: AppSpacing.roundedFull,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Title Row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Edit Animal Details',
                          style: AppTypography.titleMedium.copyWith(
                            fontWeight: FontWeight.w800,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          'Update passport identification & biological parameters',
                          style: AppTypography.labelSmall.copyWith(color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded, color: AppColors.slate500),
                    onPressed: _onDismissRequested,
                  ),
                ],
              ),
              const Divider(height: 24),

              // Animal Code / Tag
              AppTextField(
                controller: _codeController,
                label: 'Animal Code / Ear-Tag *',
                hint: 'e.g. COW-101',
                prefixIcon: Icons.tag_rounded,
                validator: (val) => val == null || val.trim().isEmpty ? 'Animal code is required' : null,
              ),
              const SizedBox(height: 14),

              // Species & Breed Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Species *', style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: AppSpacing.roundedMd,
                            border: Border.all(color: AppColors.border),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _species,
                              isExpanded: true,
                              icon: const Icon(Icons.keyboard_arrow_down_rounded, size: 20),
                              items: _speciesOptions.map((s) {
                                return DropdownMenuItem(
                                  value: s,
                                  child: Text(s.capitalizeFirst ?? s, style: AppTypography.bodySmall),
                                );
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _species = val);
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: AppTextField(
                      controller: _breedController,
                      label: 'Breed',
                      hint: 'e.g. Gir, Murrah',
                      prefixIcon: Icons.pets_outlined,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Weight & Sex Row
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: AppTextField(
                      controller: _weightController,
                      label: 'Weight (kg) *',
                      hint: 'e.g. 380',
                      prefixIcon: Icons.monitor_weight_outlined,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      validator: (val) {
                        if (val == null || val.trim().isEmpty) return 'Weight is required';
                        final num = double.tryParse(val.trim());
                        if (num == null || num <= 0) return 'Must be > 0';
                        return null;
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Sex *', style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            Expanded(
                              child: ChoiceChip(
                                label: const Text('Female'),
                                selected: _sex == 'female',
                                onSelected: (val) {
                                  if (val) setState(() => _sex = 'female');
                                },
                                selectedColor: AppColors.primarySoft,
                                labelStyle: TextStyle(
                                  fontSize: 12,
                                  color: _sex == 'female' ? AppColors.primary : AppColors.textSecondary,
                                  fontWeight: _sex == 'female' ? FontWeight.w700 : FontWeight.w500,
                                ),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Expanded(
                              child: ChoiceChip(
                                label: const Text('Male'),
                                selected: _sex == 'male',
                                onSelected: (val) {
                                  if (val) setState(() => _sex = 'male');
                                },
                                selectedColor: AppColors.primarySoft,
                                labelStyle: TextStyle(
                                  fontSize: 12,
                                  color: _sex == 'male' ? AppColors.primary : AppColors.textSecondary,
                                  fontWeight: _sex == 'male' ? FontWeight.w700 : FontWeight.w500,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // Purpose & Date of Birth Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Purpose', style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: AppSpacing.roundedMd,
                            border: Border.all(color: AppColors.border),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _purpose,
                              isExpanded: true,
                              icon: const Icon(Icons.keyboard_arrow_down_rounded, size: 20),
                              items: _purposeOptions.map((p) {
                                return DropdownMenuItem(
                                  value: p,
                                  child: Text(p.capitalizeFirst ?? p, style: AppTypography.bodySmall),
                                );
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) setState(() => _purpose = val);
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Date of Birth', style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w600)),
                        const SizedBox(height: 6),
                        InkWell(
                          onTap: () async {
                            final picked = await showDatePicker(
                              context: context,
                              initialDate: _dob ?? DateTime.now().subtract(const Duration(days: 365)),
                              firstDate: DateTime(2010),
                              lastDate: DateTime.now(),
                            );
                            if (picked != null) {
                              setState(() => _dob = picked);
                            }
                          },
                          borderRadius: AppSpacing.roundedMd,
                          child: Container(
                            height: 48,
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: AppSpacing.roundedMd,
                              border: Border.all(color: AppColors.border),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.calendar_today_rounded, size: 16, color: AppColors.slate500),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    _dob != null ? DateFormat('dd MMM yyyy').format(_dob!) : 'Select Date',
                                    style: AppTypography.bodySmall,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Health Status Chips
              Text('Health Status', style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _healthStatusOptions.map((status) {
                  final isSelected = _healthStatus == status;
                  Color chipColor = AppColors.primary;
                  if (status == 'sick' || status == 'quarantine') chipColor = AppColors.danger;
                  if (status == 'under_treatment') chipColor = AppColors.warning;

                  return ChoiceChip(
                    label: Text(
                      status.replaceAll('_', ' ').capitalizeFirst ?? status,
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected ? Colors.white : AppColors.textPrimary,
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: chipColor,
                    backgroundColor: AppColors.slate100,
                    onSelected: (val) {
                      if (val) setState(() => _healthStatus = status);
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              // Save Action Button
              AppButton(
                label: _isSaving ? 'Saving Changes...' : 'Save Changes',
                isLoading: _isSaving,
                isFullWidth: true,
                height: 48,
                icon: Icons.check_circle_outline_rounded,
                onPressed: _isSaving ? null : _handleSave,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
