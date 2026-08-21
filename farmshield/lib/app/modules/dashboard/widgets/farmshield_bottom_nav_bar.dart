import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../controllers/nav_controller.dart';

class FarmShieldBottomNavBar extends StatelessWidget {
  FarmShieldBottomNavBar({super.key});

  final NavController nav = Get.find<NavController>();

  @override
  Widget build(BuildContext context) {
    final rawInset = MediaQuery.of(context).viewPadding.bottom;
    final bottomInset = rawInset > 24 ? rawInset : 0;

    return Obx(() {
      return Container(
        height: 72 + bottomInset.toDouble(),
        padding: EdgeInsets.fromLTRB(
          16,
          8,
          16,
          8 + bottomInset.toDouble(),
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(28),
            topRight: Radius.circular(28),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.08),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _navItem(Icons.home_outlined, Icons.home_rounded, "Home", 0),
            _navItem(Icons.pets_outlined, Icons.pets_rounded, "Livestock", 1),
            _navItem(Icons.calendar_month_outlined, Icons.calendar_month_rounded, "Withdrawals", 2),
            _navItem(Icons.assessment_outlined, Icons.assessment_rounded, "Reports", 3),
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
        curve: Curves.easeInOut,
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 18 : 12,
          vertical: isSelected ? 10 : 8,
        ),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFFE8F5E9) // FarmShield Light Emerald
              : const Color(0xFFF1F5F9), // Slate Soft Gray
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? filledIcon : outlineIcon,
              size: isSelected ? 24 : 22,
              color: isSelected ? const Color(0xFF1B5E20) : Colors.blueGrey.shade600,
            ),
            if (isSelected) ...[
              const SizedBox(width: 8),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF1B5E20),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
