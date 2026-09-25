import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../controllers/nav_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../routes/app_pages.dart';

class QuickActionsGrid extends StatelessWidget {
  const QuickActionsGrid({super.key});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: 4,
      mainAxisSpacing: 14,
      crossAxisSpacing: 12,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _actionItem('livestock'.tr, Icons.pets_rounded, AppColors.primary, () {
          Get.find<NavController>().changePage(1);
        }),
        _actionItem('withdrawals'.tr, Icons.calendar_month_rounded, const Color(0xFF15803D), () {
          Get.find<NavController>().changePage(2);
        }),
        _actionItem('add_treatment'.tr, Icons.add_moderator_rounded, AppColors.danger, () {
          Get.toNamed(Routes.ADD_TREATMENT);
        }),
        _actionItem('safety_passport'.tr, Icons.qr_code_scanner_rounded, const Color(0xFFD97706), () {
          Get.toNamed(Routes.ANIMAL_PASSPORT);
        }),
        _actionItem('Emergency', Icons.warning_amber_rounded, const Color(0xFFDC2626), () {
          Get.toNamed(Routes.SYNDROMIC_REPORT);
        }),
        _actionItem('risk_assess'.tr, Icons.auto_graph_rounded, const Color(0xFF2563EB), () {
          Get.toNamed(Routes.RISK_ASSESSMENT);
        }),
        _actionItem('medicine_browser'.tr, Icons.medication_liquid_rounded, const Color(0xFF7C3AED), () {
          Get.toNamed(Routes.MEDICINES_CATALOG);
        }),
        _actionItem('reports'.tr, Icons.assessment_rounded, const Color(0xFF0D9488), () {
          Get.find<NavController>().changePage(3);
        }),
      ],
    );
  }

  Widget _actionItem(String title, IconData icon, Color color, VoidCallback onTap) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: AppSpacing.roundedMd,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(11),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: AppSpacing.roundedMd,
                border: Border.all(color: color.withValues(alpha: 0.2), width: 1.0),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 6),
            Text(
              title,
              style: AppTypography.labelSmall.copyWith(
                fontSize: 10,
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}
