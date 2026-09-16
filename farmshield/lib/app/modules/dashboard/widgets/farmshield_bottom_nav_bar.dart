import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../controllers/nav_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';

class FarmShieldBottomNavBar extends StatelessWidget {
  FarmShieldBottomNavBar({super.key});

  final NavController nav = Get.find<NavController>();

  @override
  Widget build(BuildContext context) {
    final rawInset = MediaQuery.of(context).viewPadding.bottom;
    final bottomInset = rawInset > 20 ? rawInset : 8.0;

    return Obx(() {
      return Container(
        height: 68 + bottomInset,
        padding: EdgeInsets.fromLTRB(16, 8, 16, bottomInset),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(AppSpacing.radiusXl),
            topRight: Radius.circular(AppSpacing.radiusXl),
          ),
          border: const Border(
            top: BorderSide(color: AppColors.border, width: 1.0),
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF0F172A).withValues(alpha: 0.06),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _navItem(Icons.dashboard_outlined, Icons.dashboard_rounded, "Home", 0),
            _navItem(Icons.pets_outlined, Icons.pets_rounded, "Livestock", 1),
            _navItem(Icons.calendar_today_outlined, Icons.calendar_month_rounded, "Withdrawals", 2),
            _navItem(Icons.assessment_outlined, Icons.assessment_rounded, "Reports", 3),
            _navItem(Icons.map_outlined, Icons.map_rounded, "Risk Map", 4),
          ],
        ),
      );
    });
  }

  Widget _navItem(IconData outlineIcon, IconData filledIcon, String label, int index) {
    final isSelected = nav.selectedIndex.value == index;

    return GestureDetector(
      onTap: () => nav.selectedIndex.value = index,
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 12 : 8,
          vertical: 6,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primarySoft : Colors.transparent,
          borderRadius: AppSpacing.roundedFull,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedScale(
              scale: isSelected ? 1.08 : 1.0,
              duration: const Duration(milliseconds: 200),
              child: Icon(
                isSelected ? filledIcon : outlineIcon,
                size: isSelected ? 21 : 20,
                color: isSelected ? AppColors.primary : AppColors.slate500,
              ),
            ),
            if (isSelected) ...[
              const SizedBox(width: 6),
              Text(
                label,
                style: AppTypography.labelSmall.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.w700,
                  fontSize: 11.5,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
