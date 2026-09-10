import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../controllers/nav_controller.dart';
import '../../../routes/app_pages.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../core/widgets/app_loading_skeleton.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../calendar/views/withdrawal_calendar_view.dart';
import '../../livestock/views/livestock_view.dart';
import '../../reports/views/reports_view.dart';
import '../controllers/dashboard_controller.dart';
import '../widgets/amu_analytics_sheet.dart';
import '../widgets/dashboard_kpi_card.dart';
import '../widgets/farmshield_bottom_nav_bar.dart';
import '../widgets/herd_heatmap_card.dart';
import '../widgets/quick_actions_grid.dart';
import '../widgets/withdrawal_countdown_card.dart';

class DashboardView extends GetView<DashboardController> {
  const DashboardView({super.key});

  @override
  Widget build(BuildContext context) {
    final nav = Get.find<NavController>();

    return Obx(() {
      final selectedIndex = nav.selectedIndex.value;

      return Scaffold(
        backgroundColor: AppColors.background,
        body: IndexedStack(
          index: selectedIndex,
          children: [
            _buildDashboardBody(context),
            const LivestockView(),
            const WithdrawalCalendarView(),
            const ReportsView(),
          ],
        ),
        floatingActionButton: _buildScanQrFab(context),
        floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
        bottomNavigationBar: FarmShieldBottomNavBar(),
      );
    });
  }

  Widget _buildScanQrFab(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0, right: 4.0),
      child: Tooltip(
        message: 'Scan Animal QR',
        child: Material(
          color: Colors.transparent,
          shape: const CircleBorder(),
          elevation: 6,
          shadowColor: const Color(0xFF1B5E20).withValues(alpha: 0.4),
          child: Ink(
            width: 60,
            height: 60,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              gradient: LinearGradient(
                colors: [Color(0xFF2E7D32), Color(0xFF1B5E20)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: Color(0x331B5E20),
                  blurRadius: 14,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            child: InkWell(
              customBorder: const CircleBorder(),
              splashColor: AppColors.accent.withValues(alpha: 0.3),
              highlightColor: Colors.white.withValues(alpha: 0.1),
              onTap: () => Get.toNamed(Routes.QR_SCANNER),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 46,
                    height: 46,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: AppColors.accent.withValues(alpha: 0.4),
                        width: 1.5,
                      ),
                    ),
                  ),
                  const Icon(
                    Icons.qr_code_scanner_rounded,
                    color: AppColors.accent,
                    size: 28,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDashboardBody(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        titleSpacing: 16,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.15),
                borderRadius: AppSpacing.roundedSm,
              ),
              child: const Icon(Icons.shield_rounded, color: AppColors.accent, size: 20),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'FarmShield',
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    fontSize: 18,
                    letterSpacing: 0.3,
                  ),
                ),
                Text(
                  'Livestock Safety & MRL Portal',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    color: Colors.white.withValues(alpha: 0.8),
                    fontWeight: FontWeight.w400,
                  ),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          _buildLanguageSwitcher(),
          Obx(() {
            final alertCount = controller.alerts.length;
            return Stack(
              alignment: Alignment.center,
              children: [
                IconButton(
                  icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                  onPressed: () => _showAlertsDialog(context),
                ),
                if (alertCount > 0)
                  Positioned(
                    right: 8,
                    top: 10,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.danger,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                      child: Text(
                        '$alertCount',
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            );
          }),
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white70),
            onPressed: () => _showLogoutDialog(),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: controller.obx(
        (state) => RefreshIndicator(
          color: AppColors.primary,
          onRefresh: () => controller.loadDashboardData(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                DashboardKpiCard(state: state!),
                const SizedBox(height: AppSpacing.lg),
                WithdrawalCountdownCard(controller: controller),
                const SizedBox(height: AppSpacing.xl),
                _buildSectionHeader('herd_risk_heatmap'.tr, Icons.grid_view_rounded),
                const SizedBox(height: AppSpacing.md),
                HerdHeatmapCard(controller: controller),
                const SizedBox(height: AppSpacing.xl),
                _buildSectionHeader('quick_actions'.tr, Icons.bolt_rounded),
                const SizedBox(height: AppSpacing.md),
                const QuickActionsGrid(),
                const SizedBox(height: AppSpacing.xl),
                _buildSectionHeader('amu_breakdown'.tr, Icons.pie_chart_rounded),
                const SizedBox(height: AppSpacing.md),
                AmuAnalyticsSheet(
                  classBreakdown: state.classBreakdown,
                  amuTrendData: controller.amuTrendData,
                ),
                const SizedBox(height: AppSpacing.xl),
                _buildSectionHeader('recent_alerts'.tr, Icons.warning_amber_rounded),
                const SizedBox(height: AppSpacing.md),
                _buildAlertList(),
                const SizedBox(height: AppSpacing.xxl),
              ],
            ),
          ),
        ),
        onLoading: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            children: [
              AppLoadingSkeleton.card(height: 180),
              const SizedBox(height: AppSpacing.lg),
              AppLoadingSkeleton.card(height: 120),
              const SizedBox(height: AppSpacing.lg),
              AppLoadingSkeleton.card(height: 140),
            ],
          ),
        ),
        onError: (error) => AppEmptyState.error(
          message: error,
          onRetry: () => controller.loadDashboardData(),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    final cleanTitle = title.contains('_')
        ? title.split('_').map((w) => w.capitalizeFirst ?? w).join(' ')
        : title;
    return Row(
      children: [
        Icon(icon, size: 18, color: AppColors.primary),
        const SizedBox(width: 8),
        Text(
          cleanTitle,
          style: AppTypography.titleMedium.copyWith(
            fontWeight: FontWeight.w700,
            letterSpacing: -0.2,
          ),
        ),
      ],
    );
  }

  Widget _buildLanguageSwitcher() {
    return Obx(() {
      final isHindi = controller.currentLocale.value.languageCode == 'hi';
      return TextButton(
        onPressed: () => controller.toggleLanguage(),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.15),
            borderRadius: AppSpacing.roundedSm,
          ),
          child: Text(
            isHindi ? 'EN' : 'हिंदी',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
          ),
        ),
      );
    });
  }

  void _showLogoutDialog() {
    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedLg),
        title: Text('Sign Out', style: AppTypography.titleMedium),
        content: Text(
          'Are you sure you want to log out of FarmShield? You will need to sign in again to access the portal.',
          style: AppTypography.bodyMedium,
        ),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('Cancel', style: AppTypography.labelMedium.copyWith(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () {
              Get.back();
              Get.find<AuthController>().signOut();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.danger,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: AppSpacing.roundedSm),
            ),
            child: Text('Sign Out', style: AppTypography.labelMedium.copyWith(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildAlertList() {
    return Obx(() {
      if (controller.alerts.isEmpty) {
        return AppCard(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              const Icon(Icons.check_circle_outline_rounded, color: AppColors.success, size: 24),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Text(
                  'No active clinical or regulatory alerts at this time.',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                ),
              ),
            ],
          ),
        );
      }

      return ListView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: controller.alerts.length.clamp(0, 3),
        itemBuilder: (context, index) {
          final alert = controller.alerts[index];
          final color = _getAlertColor(alert.type);

          return Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.sm),
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: AppSpacing.roundedMd,
              border: Border.all(color: color.withValues(alpha: 0.25), width: 1.0),
              boxShadow: AppSpacing.shadowSubtle,
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(_getAlertIcon(alert.type), color: color, size: 18),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        alert.title ?? 'Alert',
                        style: AppTypography.titleSmall.copyWith(fontSize: 13),
                      ),
                      Text(
                        alert.message ?? '',
                        style: AppTypography.bodySmall,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ).animate().slideX(begin: 0.15, delay: Duration(milliseconds: index * 60));
        },
      );
    });
  }

  void _showAlertsDialog(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(AppSpacing.xl),
        constraints: BoxConstraints(maxHeight: Get.height * 0.75),
        decoration: const BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusXl)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.1),
                        borderRadius: AppSpacing.roundedSm,
                      ),
                      child: const Icon(Icons.notifications_active_rounded, color: AppColors.primary, size: 20),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Text(
                      'Live Safety Alerts',
                      style: AppTypography.titleMedium,
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close_rounded),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            Expanded(
              child: Obx(() {
                if (controller.alerts.isEmpty) {
                  return AppEmptyState(
                    icon: Icons.check_circle_outline_rounded,
                    title: 'All Clear',
                    description: 'No active safety alerts for this livestock facility.',
                    iconColor: AppColors.success,
                  );
                }

                return ListView.builder(
                  itemCount: controller.alerts.length,
                  itemBuilder: (context, index) {
                    final alert = controller.alerts[index];
                    final color = _getAlertColor(alert.type);
                    return Container(
                      margin: const EdgeInsets.only(bottom: AppSpacing.md),
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.04),
                        borderRadius: AppSpacing.roundedMd,
                        border: Border.all(color: color.withValues(alpha: 0.2)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: color.withValues(alpha: 0.12),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(_getAlertIcon(alert.type), color: color, size: 18),
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
                                      alert.title ?? 'Alert',
                                      style: AppTypography.titleSmall.copyWith(fontSize: 13),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: color,
                                        borderRadius: AppSpacing.roundedXs,
                                      ),
                                      child: Text(
                                        alert.type ?? 'INFO',
                                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  alert.message ?? '',
                                  style: AppTypography.bodySmall,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              }),
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
  }

  Color _getAlertColor(String? type) {
    switch (type?.toUpperCase()) {
      case 'CRITICAL':
        return AppColors.danger;
      case 'WARNING':
        return AppColors.warning;
      default:
        return AppColors.info;
    }
  }

  IconData _getAlertIcon(String? type) {
    switch (type?.toUpperCase()) {
      case 'CRITICAL':
        return Icons.error_outline_rounded;
      case 'WARNING':
        return Icons.warning_amber_rounded;
      default:
        return Icons.info_outline_rounded;
    }
  }
}
