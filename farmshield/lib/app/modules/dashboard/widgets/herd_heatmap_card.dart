import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../data/models/farm_models.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/values/breed_assets.dart';
import '../../../core/widgets/app_card.dart';
import '../../../routes/app_pages.dart';
import '../controllers/dashboard_controller.dart';

class HerdHeatmapCard extends StatelessWidget {
  final DashboardController controller;

  const HerdHeatmapCard({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      final animals = controller.animals;
      if (animals.isEmpty) {
        return AppCard(
          padding: const EdgeInsets.all(AppSpacing.xl),
          child: Center(
            child: Text(
              'No animals registered in herd yet',
              style: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted),
            ),
          ),
        );
      }

      int redCount = 0;
      int yellowCount = 0;
      int greenCount = 0;

      for (var a in animals) {
        final st = controller.getAnimalStatus(a);
        if (st == 'RED') {
          redCount++;
        } else if (st == 'YELLOW') {
          yellowCount++;
        } else {
          greenCount++;
        }
      }

      final avatarSize = (Get.width * 0.105).clamp(36.0, 44.0);

      return AppCard(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _heatmapPill('Healthy', greenCount, AppColors.success, AppColors.successBg),
                _heatmapPill('Monitor', yellowCount, AppColors.warning, AppColors.warningBg),
                _heatmapPill('Withheld', redCount, AppColors.danger, AppColors.dangerBg),
              ],
            ),
            const Divider(height: 24),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 5,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 0.72,
              ),
              itemCount: animals.length.clamp(0, 20),
              itemBuilder: (context, index) {
                final animal = animals[index];
                final status = controller.getAnimalStatus(animal);
                Color statusColor;
                if (status == 'RED') {
                  statusColor = AppColors.danger;
                } else if (status == 'YELLOW') {
                  statusColor = AppColors.warning;
                } else {
                  statusColor = AppColors.success;
                }

                final imageUrl = animal.imageUrl ?? BreedAssetHelper.getBreedImage(animal.breed, animal.species);

                return GestureDetector(
                  onTap: () => _showAnimalSheet(context, animal, statusColor),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: avatarSize,
                        height: avatarSize,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: statusColor, width: 2.2),
                          boxShadow: [
                            BoxShadow(
                              color: statusColor.withValues(alpha: 0.2),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: Image.network(
                            imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) => Icon(Icons.pets, size: 18, color: statusColor),
                          ),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        animal.animalCode ?? 'TAG',
                        style: AppTypography.codeTagSmall.copyWith(
                          fontSize: 9.5,
                          color: AppColors.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ).animate().scale(delay: Duration(milliseconds: index * 20));
              },
            ),
          ],
        ),
      );
    });
  }

  Widget _heatmapPill(String label, int count, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: AppSpacing.roundedSm,
        border: Border.all(color: textColor.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 7,
            height: 7,
            decoration: BoxDecoration(shape: BoxShape.circle, color: textColor),
          ),
          const SizedBox(width: 5),
          Text(
            '$count $label',
            style: AppTypography.labelSmall.copyWith(
              color: textColor,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  void _showAnimalSheet(BuildContext context, Animal animal, Color statusColor) {
    final imageUrl = animal.imageUrl ?? BreedAssetHelper.getBreedImage(animal.breed, animal.species);

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
            Container(
              width: 36,
              height: 4,
              margin: const EdgeInsets.only(bottom: AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.slate300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Row(
              children: [
                CircleAvatar(
                  radius: 34,
                  backgroundColor: statusColor.withValues(alpha: 0.1),
                  backgroundImage: NetworkImage(imageUrl),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tag: ${animal.animalCode ?? "N/A"}',
                        style: AppTypography.titleMedium,
                      ),
                      Text(
                        '${animal.species?.capitalizeFirst} • ${animal.breed ?? "Indigenous Breed"}',
                        style: AppTypography.bodySmall,
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: statusColor.withValues(alpha: 0.12),
                          borderRadius: AppSpacing.roundedXs,
                        ),
                        child: Text(
                          animal.healthStatus != null
                              ? animal.healthStatus!.replaceAll('_', ' ').toUpperCase()
                              : 'HEALTHY',
                          style: AppTypography.labelSmall.copyWith(
                            color: statusColor,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.xl),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Get.back(),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedMd),
                    ),
                    child: Text('Close', style: AppTypography.labelMedium),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Get.back();
                      Get.toNamed(Routes.ANIMAL_DETAIL, arguments: animal);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedMd),
                      elevation: 0,
                    ),
                    child: Text('Full Profile', style: AppTypography.labelMedium.copyWith(color: Colors.white)),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }
}
