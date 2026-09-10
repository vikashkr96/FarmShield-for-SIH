import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/services/cloudinary_service.dart';
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
import '../widgets/edit_animal_bottom_sheet.dart';

class AnimalDetailView extends GetView<AnimalDetailController> {
  const AnimalDetailView({super.key});

  void _openEditBottomSheet(BuildContext context) {
    final currentData = controller.state;
    if (currentData == null) return;

    EditAnimalBottomSheet.show(
      context,
      animalData: currentData,
      onSave: (updated) => controller.updateAnimalDetails(updated),
    );
  }

  void _showImageSourcePicker(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusLg)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.slate300,
                  borderRadius: AppSpacing.roundedFull,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Change Animal Photo',
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 12),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primarySoft,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.camera_alt_rounded, color: AppColors.primary, size: 20),
                ),
                title: const Text('Take New Photo', style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: const Text('Capture using device camera'),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _pickAndPreviewImage(context, ImageSource.camera);
                },
              ),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primarySoft,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.photo_library_rounded, color: AppColors.primary, size: 20),
                ),
                title: const Text('Choose from Gallery / Files', style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: const Text('Select a JPG, PNG, or WebP photo'),
                onTap: () {
                  Navigator.of(ctx).pop();
                  _pickAndPreviewImage(context, ImageSource.gallery);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _pickAndPreviewImage(BuildContext context, ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 1600,
        maxHeight: 1600,
      );

      if (pickedFile == null) return;

      final bytes = await pickedFile.readAsBytes();
      final validationError = CloudinaryService().validateImage(
        bytes: bytes,
        fileName: pickedFile.name,
      );

      if (validationError != null) {
        Get.snackbar('Invalid Image', validationError, snackPosition: SnackPosition.BOTTOM);
        return;
      }

      if (!context.mounted) return;

      // Show Visual Confirmation Dialog before uploading
      _showUploadPreviewDialog(context, bytes, pickedFile.name);
    } catch (e) {
      Get.log('Image pick error: $e');
      Get.snackbar('Image Error', 'Could not open image picker: $e', snackPosition: SnackPosition.BOTTOM);
    }
  }

  void _showUploadPreviewDialog(BuildContext context, Uint8List bytes, String fileName) {
    final sizeKb = (bytes.lengthInBytes / 1024).toStringAsFixed(0);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedLg),
        backgroundColor: Colors.white,
        title: Text(
          'Confirm New Photo',
          style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 160,
              height: 160,
              decoration: BoxDecoration(
                borderRadius: AppSpacing.roundedMd,
                border: Border.all(color: AppColors.border, width: 1.5),
              ),
              child: ClipRRect(
                borderRadius: AppSpacing.roundedMd,
                child: Image.memory(
                  bytes,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            const SizedBox(height: 12),
            Text(
              '$fileName ($sizeKb KB)',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 6),
            Text(
              'This photo will be uploaded to Cloudinary and saved to the animal record.',
              style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted),
              textAlign: TextAlign.center,
            ),
          ],
        ),
        actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        actions: [
          Row(
            children: [
              Expanded(
                child: AppButton(
                  label: 'Cancel',
                  variant: AppButtonVariant.outline,
                  height: 44,
                  onPressed: () => Navigator.of(ctx).pop(),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: AppButton(
                  label: 'Upload Photo',
                  variant: AppButtonVariant.primary,
                  height: 44,
                  onPressed: () {
                    Navigator.of(ctx).pop();
                    controller.uploadAnimalPhotoBytes(
                      bytes: bytes,
                      fileName: fileName,
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppHeaderBar(
        title: 'Animal Profile',
        subtitle: 'Digital Passport & Medical History',
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.18),
                borderRadius: AppSpacing.roundedSm,
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.edit_outlined, size: 16, color: Colors.white),
                  const SizedBox(width: 4),
                  Text('Edit', style: AppTypography.labelSmall.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            tooltip: 'Edit Animal Details',
            onPressed: () => _openEditBottomSheet(context),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: controller.obx(
        (data) => SingleChildScrollView(
          child: Column(
            children: [
              _buildHeroHeader(context, data!),
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

  Widget _buildHeroHeader(BuildContext context, Map<String, dynamic> animal) {
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
          // Circular Avatar with interactive camera badge & upload indicator
          Obx(() {
            final isUploading = controller.isUploading.value;
            return Stack(
              alignment: Alignment.center,
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
                      key: ValueKey(imageUrl),
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => const Center(
                        child: Icon(Icons.pets, size: 48, color: Colors.white70),
                      ),
                    ),
                  ),
                ),
                if (isUploading)
                  Container(
                    width: 124,
                    height: 124,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.black.withValues(alpha: 0.6),
                    ),
                    child: const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.accent,
                        strokeWidth: 3,
                      ),
                    ),
                  ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: isUploading ? null : () => _showImageSourcePicker(context),
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: AppColors.accent,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black26,
                            blurRadius: 6,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.camera_alt_rounded, color: AppColors.primaryDark, size: 18),
                    ),
                  ),
                ),
              ],
            );
          }),
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
            onPressed: () => Get.toNamed(Routes.ANIMAL_PASSPORT, arguments: qrToken),
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
            Row(
              children: [
                const Icon(Icons.history_edu_rounded, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Text('Medical & Treatment History', style: AppTypography.titleSmall),
              ],
            ),
            Text(
              '${treatments.length} logged',
              style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted),
            ),
          ],
        ),
        const SizedBox(height: AppSpacing.md),
        if (treatments.isEmpty)
          AppCard(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Center(
              child: Column(
                children: [
                  const Icon(Icons.shield_outlined, size: 36, color: AppColors.success),
                  const SizedBox(height: 8),
                  Text('Clean Health Record', style: AppTypography.titleSmall),
                  const SizedBox(height: 2),
                  Text(
                    'No antimicrobial treatments administered to this animal.',
                    style: AppTypography.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                ],
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
              final medName = t['medicine']?['name'] ?? t['medicine_name'] ?? 'Antimicrobial';
              final activeIng = t['medicine']?['active_ingredient'] ?? t['active_ingredient'] ?? 'Active Substance';
              final dose = '${t['dose'] ?? ""} ${t['dose_unit'] ?? ""}';
              final startDate = _formatDate(t['start_date']);

              return Padding(
                padding: const EdgeInsets.only(bottom: AppSpacing.md),
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
                        if (index < treatments.length - 1)
                          Container(
                            width: 2,
                            height: 64,
                            color: AppColors.border,
                          ),
                      ],
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: Transform.translate(
                        offset: const Offset(0, -4),
                        child: AppCard(
                          padding: const EdgeInsets.all(AppSpacing.md),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text(
                                    medName,
                                    style: AppTypography.titleSmall.copyWith(fontSize: 13),
                                  ),
                                  Text(
                                    startDate,
                                    style: AppTypography.labelSmall.copyWith(color: AppColors.slate400),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 2),
                              Text(activeIng, style: AppTypography.bodySmall),
                              const SizedBox(height: 8),
                              Wrap(
                                spacing: 8,
                                children: [
                                  _treatmentTag(Icons.medication_outlined, dose),
                                  if (t['indication'] != null)
                                    _treatmentTag(Icons.healing_outlined, t['indication']),
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
}
