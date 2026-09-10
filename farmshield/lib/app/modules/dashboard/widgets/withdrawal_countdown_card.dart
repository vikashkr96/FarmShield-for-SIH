import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../controllers/dashboard_controller.dart';

class WithdrawalCountdownCard extends StatelessWidget {
  final DashboardController controller;

  const WithdrawalCountdownCard({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    return Obx(() {
      if (controller.activeWithdrawals.isEmpty) return const SizedBox.shrink();

      final firstWithdrawal = controller.activeWithdrawals.first;
      final endDate = firstWithdrawal['end_date'] as DateTime;
      final remaining = controller.getRemainingTime(endDate);

      if (remaining.inSeconds <= 0) return const SizedBox.shrink();

      final days = remaining.inDays;
      final hours = remaining.inHours % 24;
      final minutes = remaining.inMinutes % 60;
      final seconds = remaining.inSeconds % 60;

      const totalDurationSeconds = 5 * 24 * 3600;
      final progress = (1.0 - (remaining.inSeconds / totalDurationSeconds)).clamp(0.0, 1.0);

      return Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1E0A0E), Color(0xFF2E1015), Color(0xFF3F141B)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: AppSpacing.roundedXl,
          border: Border.all(color: AppColors.danger.withValues(alpha: 0.4), width: 1.2),
          boxShadow: [
            BoxShadow(
              color: AppColors.danger.withValues(alpha: 0.2),
              blurRadius: 18,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              children: [
                Stack(
                  alignment: Alignment.center,
                  children: [
                    SizedBox(
                      width: 46,
                      height: 46,
                      child: CircularProgressIndicator(
                        value: progress,
                        backgroundColor: Colors.white.withValues(alpha: 0.1),
                        valueColor: const AlwaysStoppedAnimation<Color>(AppColors.danger),
                        strokeWidth: 4.0,
                      ),
                    ),
                    const Icon(Icons.lock_clock_rounded, color: Colors.redAccent, size: 20)
                        .animate(onPlay: (c) => c.repeat(reverse: true))
                        .scale(begin: const Offset(0.9, 0.9), end: const Offset(1.15, 1.15), duration: const Duration(seconds: 1)),
                  ],
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.danger.withValues(alpha: 0.2),
                              borderRadius: AppSpacing.roundedXs,
                              border: Border.all(color: AppColors.danger.withValues(alpha: 0.5)),
                            ),
                            child: Text(
                              'WITHHOLD ${(firstWithdrawal['product']?.toString() ?? 'MILK').toUpperCase()}',
                              style: AppTypography.labelSmall.copyWith(
                                color: Colors.redAccent,
                                fontWeight: FontWeight.w800,
                                fontSize: 9.5,
                              ),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Text(
                            'Tag: ${firstWithdrawal['animal_code'] ?? "COW-102"}',
                            style: AppTypography.titleSmall.copyWith(color: Colors.white),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        firstWithdrawal['product']?.toString().toLowerCase() == 'meat'
                            ? 'dont_sell_meat'.tr
                            : 'dont_sell_milk'.tr,
                        style: AppTypography.bodySmall.copyWith(
                          color: Colors.white.withValues(alpha: 0.85),
                          fontSize: 11,
                          height: 1.25,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.md),
            Container(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 6),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.35),
                borderRadius: AppSpacing.roundedMd,
                border: Border.all(color: AppColors.danger.withValues(alpha: 0.2)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _countdownPod(days.toString().padLeft(2, '0'), 'DAYS'),
                  _separator(),
                  _countdownPod(hours.toString().padLeft(2, '0'), 'HOURS'),
                  _separator(),
                  _countdownPod(minutes.toString().padLeft(2, '0'), 'MINS'),
                  _separator(),
                  _countdownPod(seconds.toString().padLeft(2, '0'), 'SECS', isLivePulse: true),
                ],
              ),
            ),
          ],
        ),
      ).animate().fadeIn().scale(delay: const Duration(milliseconds: 150));
    });
  }

  Widget _countdownPod(String value, String unit, {bool isLivePulse = false}) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
          decoration: BoxDecoration(
            color: isLivePulse ? AppColors.danger.withValues(alpha: 0.25) : Colors.white.withValues(alpha: 0.08),
            borderRadius: AppSpacing.roundedSm,
            border: Border.all(
              color: isLivePulse ? AppColors.danger : Colors.white.withValues(alpha: 0.15),
            ),
          ),
          child: Text(
            value,
            style: GoogleFonts.shareTechMono(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isLivePulse ? Colors.redAccent : Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 3),
        Text(
          unit,
          style: AppTypography.labelSmall.copyWith(
            color: Colors.white.withValues(alpha: 0.55),
            fontSize: 9,
          ),
        ),
      ],
    );
  }

  Widget _separator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        ':',
        style: GoogleFonts.shareTechMono(color: Colors.redAccent, fontSize: 16, fontWeight: FontWeight.bold),
      ),
    );
  }
}
