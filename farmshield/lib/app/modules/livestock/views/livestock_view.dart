import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/values/breed_assets.dart';
import '../../../core/widgets/app_badge.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../core/widgets/app_loading_skeleton.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../data/models/farm_models.dart';
import '../../../routes/app_pages.dart';
import '../controllers/livestock_controller.dart';

class LivestockView extends GetView<LivestockController> {
  const LivestockView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Livestock Registry',
          style: AppTypography.titleMedium.copyWith(color: Colors.white),
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: 'Refresh Inventory',
            onPressed: () => controller.fetchAnimals(),
          ),
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(4),
              decoration: const BoxDecoration(
                color: AppColors.accent,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.add_rounded, color: AppColors.primaryDark, size: 20),
            ),
            tooltip: 'Register Animal',
            onPressed: () => _showAddAnimalDialog(context),
          ),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSpeciesFilterBar(),
          Padding(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.xs),
            child: Obx(() => Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${controller.selectedSpecies.value.capitalizeFirst} Herd',
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    Text(
                      '${controller.state?.length ?? 0} animals',
                      style: AppTypography.labelSmall.copyWith(
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                )),
          ),
          Expanded(
            child: controller.obx(
              (animals) {
                if (animals == null || animals.isEmpty) {
                  return AppEmptyState(
                    icon: Icons.pets_rounded,
                    title: 'No Livestock Found',
                    description: 'No animals registered in this category yet. Tap below to register your first animal.',
                    actionLabel: 'Register Animal',
                    onAction: () => _showAddAnimalDialog(context),
                  );
                }

                return RefreshIndicator(
                  color: AppColors.primary,
                  onRefresh: () => controller.fetchAnimals(),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.sm),
                    itemCount: animals.length,
                    physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
                    itemBuilder: (context, index) {
                      final animal = animals[index];
                      return _buildAnimalCard(animal, index);
                    },
                  ),
                );
              },
              onLoading: ListView.builder(
                padding: const EdgeInsets.all(AppSpacing.lg),
                itemCount: 4,
                itemBuilder: (context, index) => Padding(
                  padding: const EdgeInsets.only(bottom: AppSpacing.md),
                  child: AppLoadingSkeleton.card(height: 100),
                ),
              ),
              onError: (err) => AppEmptyState.error(
                message: err,
                onRetry: () => controller.fetchAnimals(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpeciesFilterBar() {
    final List<Map<String, dynamic>> categories = [
      {'id': 'all', 'label': 'All Herd', 'icon': Icons.grid_view_rounded},
      {'id': 'cow', 'label': 'Cattle', 'icon': Icons.pets_rounded},
      {'id': 'buffalo', 'label': 'Buffalo', 'icon': Icons.pets_outlined},
      {'id': 'goat', 'label': 'Goat', 'icon': Icons.cruelty_free_rounded},
      {'id': 'sheep', 'label': 'Sheep', 'icon': Icons.cruelty_free_outlined},
      {'id': 'fishery', 'label': 'Fishery', 'icon': Icons.water_rounded},
    ];

    return Container(
      color: AppColors.surface,
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        child: Obx(() => Row(
              children: categories.map<Widget>((cat) {
                final isSelected = controller.selectedSpecies.value == cat['id'];
                return Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.sm),
                  child: GestureDetector(
                    onTap: () => controller.selectedSpecies.value = cat['id'],
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 180),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? AppColors.primary : AppColors.surfaceSubtle,
                        borderRadius: AppSpacing.roundedFull,
                        border: Border.all(
                          color: isSelected ? AppColors.primary : AppColors.border,
                          width: 1.0,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            cat['icon'] as IconData,
                            size: 16,
                            color: isSelected ? Colors.white : AppColors.textSecondary,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            cat['label'] as String,
                            style: AppTypography.labelSmall.copyWith(
                              color: isSelected ? Colors.white : AppColors.textSecondary,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            )),
      ),
    );
  }

  Widget _buildAnimalCard(Animal animal, int index) {
    final breed = animal.breed ?? 'Indigenous Breed';
    final species = animal.species ?? 'cow';
    final imageUrl = animal.imageUrl ?? BreedAssetHelper.getBreedImage(breed, species);

    return AppCard(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      padding: const EdgeInsets.all(AppSpacing.md),
      onTap: () => Get.toNamed(Routes.ANIMAL_DETAIL, arguments: animal),
      child: Row(
        children: [
          Hero(
            tag: 'animal_image_${animal.id ?? animal.animalCode}',
            child: Container(
              width: 74,
              height: 74,
              decoration: BoxDecoration(
                color: AppColors.slate100,
                borderRadius: AppSpacing.roundedMd,
                border: Border.all(color: AppColors.border, width: 1.0),
              ),
              child: ClipRRect(
                borderRadius: AppSpacing.roundedMd,
                child: Image.network(
                  imageUrl,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => const Center(
                    child: Icon(Icons.pets, size: 28, color: AppColors.slate400),
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      animal.animalCode ?? 'TAG-000',
                      style: AppTypography.codeTag.copyWith(
                        fontSize: 14,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    AppBadge.fromStatus(animal.healthStatus ?? 'Healthy'),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  '${species.capitalizeFirst} • $breed',
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    _metricPill(Icons.scale_rounded, '${animal.weightKg ?? "N/A"} kg'),
                    const SizedBox(width: AppSpacing.sm),
                    _metricPill(
                      Icons.calendar_today_rounded,
                      animal.dob != null ? DateFormat('MMM yyyy').format(animal.dob!) : 'Age N/A',
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: AppColors.slate400, size: 20),
        ],
      ),
    ).animate().fadeIn(delay: Duration(milliseconds: index * 30)).slideX(begin: 0.1);
  }

  Widget _metricPill(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.surfaceSubtle,
        borderRadius: AppSpacing.roundedXs,
        border: Border.all(color: AppColors.border, width: 0.8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: AppColors.slate500),
          const SizedBox(width: 4),
          Text(
            text,
            style: AppTypography.labelSmall.copyWith(
              fontSize: 10,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }

  void _showAddAnimalDialog(BuildContext context) {
    final codeCtrl = TextEditingController();
    final breedCtrl = TextEditingController();
    final weightCtrl = TextEditingController();
    final species = 'cow'.obs;
    final purpose = 'milk'.obs;

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        constraints: BoxConstraints(maxHeight: Get.height * 0.85),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusXl)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Register New Livestock', style: AppTypography.titleMedium),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              GestureDetector(
                onTap: () => _showImageSourceSheet(context),
                child: Obx(() => Container(
                      height: 120,
                      decoration: BoxDecoration(
                        color: AppColors.surfaceSubtle,
                        borderRadius: AppSpacing.roundedLg,
                        border: Border.all(color: AppColors.border, width: 1.5),
                      ),
                      child: controller.selectedImage.value != null
                          ? ClipRRect(
                              borderRadius: AppSpacing.roundedLg,
                              child: Image.file(controller.selectedImage.value!, fit: BoxFit.cover),
                            )
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.add_a_photo_rounded, size: 32, color: AppColors.primary),
                                const SizedBox(height: 6),
                                Text(
                                  'Attach Animal Photo',
                                  style: AppTypography.labelSmall.copyWith(color: AppColors.primary),
                                ),
                              ],
                            ),
                    )),
              ),
              const SizedBox(height: AppSpacing.md),
              Text('Species Category', style: AppTypography.labelSmall),
              const SizedBox(height: 6),
              Obx(() => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: AppSpacing.roundedMd,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: species.value,
                        isExpanded: true,
                        items: ['cow', 'buffalo', 'goat', 'sheep', 'fishery', 'other']
                            .map((e) => DropdownMenuItem(value: e, child: Text(e.capitalizeFirst!)))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) species.value = val;
                        },
                      ),
                    ),
                  )),
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: codeCtrl,
                label: 'Animal Code / Ear Tag ID',
                hint: 'e.g. COW-GIR-09',
                prefixIcon: Icons.tag_rounded,
              ),
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: breedCtrl,
                label: 'Breed Name',
                hint: 'e.g. Gir / Sahiwal / Murrah',
                prefixIcon: Icons.category_rounded,
              ),
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: weightCtrl,
                label: 'Live Weight (kg)',
                hint: '350',
                prefixIcon: Icons.scale_rounded,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
              ),
              const SizedBox(height: AppSpacing.md),
              Text('Production Purpose', style: AppTypography.labelSmall),
              const SizedBox(height: 6),
              Obx(() => Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: AppSpacing.roundedMd,
                      border: Border.all(color: AppColors.border),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: purpose.value,
                        isExpanded: true,
                        items: ['milk', 'draught', 'breeding', 'aquaculture', 'other']
                            .map((e) => DropdownMenuItem(value: e, child: Text(e.capitalizeFirst!)))
                            .toList(),
                        onChanged: (val) {
                          if (val != null) purpose.value = val;
                        },
                      ),
                    ),
                  )),
              const SizedBox(height: AppSpacing.xl),
              Obx(() => AppButton(
                    label: 'Register Animal',
                    icon: Icons.check_circle_outline_rounded,
                    isLoading: controller.isUploading.value,
                    isFullWidth: true,
                    onPressed: () {
                      final code = codeCtrl.text.trim();
                      if (code.isEmpty) {
                        Get.snackbar('Input Error', 'Please enter an ear tag or animal code',
                            snackPosition: SnackPosition.BOTTOM);
                        return;
                      }

                      controller.registerAnimal(Animal(
                        animalCode: code,
                        species: species.value,
                        breed: breedCtrl.text.trim().isEmpty ? 'Indigenous' : breedCtrl.text.trim(),
                        weightKg: double.tryParse(weightCtrl.text.trim()),
                        purpose: purpose.value,
                        healthStatus: 'Healthy',
                        dob: DateTime.now(),
                      ));
                    },
                  )),
              const SizedBox(height: AppSpacing.lg),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  void _showImageSourceSheet(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusXl)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Select Image Source', style: AppTypography.titleMedium),
            const SizedBox(height: AppSpacing.lg),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _sourceButton(Icons.camera_alt_rounded, 'Camera', () {
                  Get.back();
                  controller.pickImage(ImageSource.camera);
                }),
                _sourceButton(Icons.photo_library_rounded, 'Gallery', () {
                  Get.back();
                  controller.pickImage(ImageSource.gallery);
                }),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
          ],
        ),
      ),
    );
  }

  Widget _sourceButton(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: AppSpacing.roundedLg,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.primarySoft,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: AppColors.primary, size: 28),
          ),
          const SizedBox(height: 6),
          Text(label, style: AppTypography.labelMedium),
        ],
      ),
    );
  }
}
