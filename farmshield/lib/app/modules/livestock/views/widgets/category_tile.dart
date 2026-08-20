import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class CategoryTile extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;
  final Color activeColor;
  final Color? tileColor;
  final Color? textColor;

  const CategoryTile({
    Key? key,
    required this.label,
    required this.icon,
    required this.isSelected,
    required this.onTap,
    this.activeColor = Colors.green,
    this.tileColor,
    this.textColor,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOutCubic,
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          gradient: isSelected && tileColor == null
              ? LinearGradient(
                  colors: [activeColor, activeColor.withOpacity(0.8)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                )
              : null,
          color: isSelected ? (tileColor ?? activeColor) : (tileColor ?? Colors.white),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            if (isSelected)
              BoxShadow(
                color: (tileColor ?? activeColor).withOpacity(0.4),
                blurRadius: 12,
                offset: const Offset(0, 6),
              )
            else
              BoxShadow(
                color: Colors.black.withOpacity(0.03),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
          ],
          border: Border.all(
            color: isSelected ? Colors.transparent : Colors.grey.shade100,
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected ? (textColor ?? Colors.white) : Colors.grey.shade600,
            ),
            const SizedBox(width: 10),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? (textColor ?? Colors.white) : Colors.grey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
