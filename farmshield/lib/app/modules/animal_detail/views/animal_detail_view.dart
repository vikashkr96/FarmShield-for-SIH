import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/values/breed_assets.dart';
import '../../../core/widgets/app_badge.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../core/widgets/app_header_bar.dart';
import '../../../core/widgets/app_loading_skeleton.dart';
import '../../../routes/app_pages.dart';
import '../controllers/animal_detail_controller.dart';

class AnimalDetailView extends GetView<AnimalDetailController> {
  const AnimalDetailView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppHeaderBar(
        title: 'Animal Profile',
        subtitle: 'Digital Passport & Medical History',
      ),
      body: controller.obx(
        (data) => SingleChildScrollView(
          // physics: const Ph,
          child: Column(
            children: [
              _buildHeroHeader(data!),
              _buildSafetyBanner(data),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
                child: Column(
                  children: [
                    _buildQRCodeSection(data),
                    const SizedBox(height: AppSpacing.xl),
                    _buildMedicalTimeline(data['treatments'] ?? []),
                    const SizedBox(height: AppSpacing.xxl),
                  ],
                ),
              ),
            ],
          ),
        ),
        onLoading: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            children: [
              AppLoadingSkeleton.card(height: 220),
              const SizedBox(height: AppSpacing.lg),
              AppLoadingSkeleton.card(height: 80),
              const SizedBox(height: AppSpacing.lg),
              AppLoadingSkeleton.card(height: 260),
            ],
          ),
        ),
        onError: (err) => AppEmptyState.error(
          message: err ?? 'Could not load animal profile',
          onRetry: () => controller.fetchAnimalFullProfile(controller.animalId),
        ),
      ),
    );
  }

  Widget _buildHeroHeader(Map<String, dynamic> animal) {
    final breed = animal['breed']?.toString() ?? 'Indigenous';
    final species = animal['species']?.toString() ?? 'cow';
    final imageUrl = animal['image_url'] ?? BreedAssetHelper.getBreedImage(breed, species);

    return Container(
      padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.lg, AppSpacing.lg, AppSpacing.xxl),
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(AppSpacing.radiusXl)),
      ),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              Container(
                width: 124,
                height: 124,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 3.5),
                  boxShadow: AppSpacing.shadowElevated,
                ),
                child: ClipOval(
                  child: Image.network(
                    imageUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => const Center(
                      child: Icon(Icons.pets, size: 48, color: Colors.white70),
                    ),
                  ),
                ),
              ),
              GestureDetector(
                onTap: () => _pickImage(ImageSource.camera),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: AppColors.accent,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt_rounded, color: AppColors.primaryDark, size: 18),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            animal['animal_code'] ?? 'N/A',
            style: AppTypography.codeTag.copyWith(
              fontSize: 24,
              color: Colors.white,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            '$breed • ${species.toUpperCase()}',
            style: AppTypography.bodySmall.copyWith(
              color: Colors.white.withValues(alpha: 0.85),
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _heroStat('DOB', _formatDate(animal['dob'])),
              _heroStat('Weight', '${animal['weight'] ?? animal['weight_kg'] ?? "N/A"} kg'),
              _heroStat('Status', animal['health_status'] ?? 'Healthy', isStatus: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _heroStat(String label, String value, {bool isStatus = false}) {
    return Column(
      children: [
        Text(
          label,
          style: AppTypography.labelSmall.copyWith(
            color: Colors.white.withValues(alpha: 0.65),
            fontSize: 11,
          ),
        ),
        const SizedBox(height: 4),
        if (isStatus)
          AppBadge.fromStatus(value)
        else
          Text(
            value,
            style: AppTypography.titleSmall.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
      ],
    );
  }

  Widget _buildSafetyBanner(Map<String, dynamic> data) {
    final bool isActive = controller.isWithdrawalActive(data['withdrawals'] ?? []);
    final int hours = controller.getRemainingHours(data['withdrawals'] ?? []);

    return Transform.translate(
      offset: const Offset(0, -18),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        child: AppCard(
          padding: const EdgeInsets.all(AppSpacing.md),
          borderColor: isActive
              ? AppColors.danger.withValues(alpha: 0.4)
              : AppColors.success.withValues(alpha: 0.3),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: isActive ? AppColors.dangerBg : AppColors.successBg,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isActive ? Icons.warning_rounded : Icons.verified_rounded,
                  color: isActive ? AppColors.danger : AppColors.success,
                  size: 24,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isActive ? 'WITHDRAWAL ACTIVE' : 'MRL CLEARED • SAFE',
                      style: AppTypography.titleSmall.copyWith(
                        color: isActive ? AppColors.danger : AppColors.success,
                        fontWeight: FontWeight.w800,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isActive
                          ? 'Safe to harvest/sell milk in $hours hours'
                          : 'Livestock product compliant with national food safety limits',
                      style: AppTypography.bodySmall,
                    ),
                  ],
                ),
              ),
              if (isActive)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.dangerBg,
                    borderRadius: AppSpacing.roundedSm,
                  ),
                  child: Text(
                    '${hours}h',
                    style: AppTypography.labelLarge.copyWith(
                      color: AppColors.danger,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQRCodeSection(Map<String, dynamic> animal) {
    final qrToken = animal['qr_token'] ?? 'FS-${animal['animal_code'] ?? "DEMO"}';

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.qr_code_2_rounded, color: AppColors.primary, size: 22),
                  const SizedBox(width: 8),
                  Text('Digital Ear Tag Passport', style: AppTypography.titleSmall),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.share_outlined, size: 20, color: AppColors.primary),
                tooltip: 'Share QR',
                onPressed: () {
                  Get.snackbar('Passport', 'Digital passport token copied: $qrToken',
                      snackPosition: SnackPosition.BOTTOM);
                },
              ),
            ],
          ),
          const Divider(height: 24),
          Center(
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppSpacing.roundedLg,
                border: Border.all(color: AppColors.border),
                boxShadow: AppSpacing.shadowSubtle,
              ),
              child: QrImageView(
                data: qrToken,
                version: QrVersions.auto,
                size: 180.0,
                gapless: false,
                eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Color(0xFF0F172A)),
                dataModuleStyle: const QrDataModuleStyle(
                  dataModuleShape: QrDataModuleShape.square,
                  color: Color(0xFF0F172A),
                ),
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            qrToken,
            style: AppTypography.codeTagSmall.copyWith(
              color: AppColors.textSecondary,
              letterSpacing: 1.5,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          AppButton(
            label: 'Verify in Regulator Registry',
            variant: AppButtonVariant.outline,
            isFullWidth: true,
            icon: Icons.verified_outlined,
            onPressed: () => Get.toNamed(Routes.ANIMAL_PASSPORT),
          ),
        ],
      ),
    );
  }

  Widget _buildMedicalTimeline(List<dynamic> treatments) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Clinical & Treatment History', style: AppTypography.titleMedium),
            Text(
              '${treatments.length} logged',
              style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        if (treatments.isEmpty)
          AppCard(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Center(
              child: Text(
                'No antimicrobial treatments recorded yet.',
                style: AppTypography.bodySmall,
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: treatments.length,
            itemBuilder: (context, index) {
              final t = treatments[index];
              final medicine = t['medicine'] ?? {};
              return IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 12,
                          height: 12,
                          decoration: const BoxDecoration(
                            color: AppColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                        Expanded(
                          child: Container(
                            width: 2,
                            color: index == treatments.length - 1
                                ? Colors.transparent
                                : AppColors.primarySoft,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: AppSpacing.lg),
                        child: AppCard(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(
                                      medicine['name'] ?? 'Antimicrobial Drug',
                                      style: AppTypography.titleSmall.copyWith(fontSize: 14),
                                    ),
                                  ),
                                  Text(
                                    t['start_date'] != null
                                        ? DateFormat('dd MMM yyyy').format(DateTime.parse(t['start_date']))
                                        : 'N/A',
                                    style: AppTypography.labelSmall.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(
                                '${medicine['active_ingredient'] ?? "Active Compound"} • ${medicine['antimicrobial_class'] ?? "Antibiotic"}',
                                style: AppTypography.bodySmall,
                              ),
                              const Divider(height: 18),
                              Row(
                                children: [
                                  _treatmentTag(Icons.scale_rounded, 'Dose: ${t['dose']} ${t['dose_unit'] ?? "mg/kg"}'),
                                  const SizedBox(width: 8),
                                  _treatmentTag(
                                    Icons.medical_services_rounded,
                                    t['indication'] != null
                                        ? t['indication'].toString().replaceAll('_', ' ').capitalizeFirst!
                                        : 'Clinical Care',
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _treatmentTag(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: AppSpacing.roundedXs,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.slate500),
          const SizedBox(width: 4),
          Text(text, style: AppTypography.labelSmall.copyWith(fontSize: 10)),
        ],
      ),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'N/A';
    try {
      return DateFormat('dd MMM yyyy').format(DateTime.parse(date.toString()));
    } catch (_) {
      return date.toString();
    }
  }

  void _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 70);
    if (pickedFile != null) {
      controller.uploadAnimalPhoto(File(pickedFile.path));
    }
  }
}
