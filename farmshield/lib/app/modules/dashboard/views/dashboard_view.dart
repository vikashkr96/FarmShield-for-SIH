import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../routes/app_pages.dart';
import '../controllers/dashboard_controller.dart';
import '../../../controllers/nav_controller.dart';
import '../../../data/models/farm_models.dart';
import '../../auth/controllers/auth_controller.dart';
import '../../../core/values/breed_assets.dart';
import '../widgets/farmshield_bottom_nav_bar.dart';
import '../../livestock/views/livestock_view.dart';
import '../../calendar/views/withdrawal_calendar_view.dart';
import '../../reports/views/reports_view.dart';

class DashboardView extends GetView<DashboardController> {
  const DashboardView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final nav = Get.find<NavController>();

    return Obx(() {
      final selectedIndex = nav.selectedIndex.value;

      return Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        body: IndexedStack(
          index: selectedIndex,
          children: [
            _buildDashboardBody(context),
            const LivestockView(),
            const WithdrawalCalendarView(),
            const ReportsView(),
          ],
        ),
        bottomNavigationBar: FarmShieldBottomNavBar(),
      );
    });
  }

  Widget _buildDashboardBody(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        titleSpacing: 16,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(7),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.15),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.shield, color: Colors.greenAccent, size: 20),
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
                    letterSpacing: 0.5,
                  ),
                ),
                Text(
                  'Livestock Safety & MRL Portal',
                  style: GoogleFonts.poppins(
                    fontSize: 10,
                    color: Colors.white70,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1B5E20),
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
                        color: Colors.redAccent,
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
          onRefresh: () => controller.loadDashboardData(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSummaryCard(state!),
                const SizedBox(height: 20),
                _buildWithdrawalCountdown(),
                const SizedBox(height: 24),
                _buildSectionHeader('herd_risk_heatmap'.tr, Icons.grid_view_rounded),
                const SizedBox(height: 12),
                _buildHerdHeatmap(),
                const SizedBox(height: 24),
                _buildSectionHeader('amu_breakdown'.tr, Icons.pie_chart_rounded),
                const SizedBox(height: 12),
                _buildInteractivePieChart(state.classBreakdown),
                const SizedBox(height: 24),
                _buildSectionHeader('AMU Consumption Trend (6mo)', Icons.show_chart_rounded),
                const SizedBox(height: 12),
                _buildTrendLineChart(),
                const SizedBox(height: 24),
                _buildSectionHeader('quick_actions'.tr, Icons.bolt),
                const SizedBox(height: 16),
                _buildActionGrid(),
                const SizedBox(height: 24),
                _buildSectionHeader('recent_alerts'.tr, Icons.warning_amber_rounded),
                const SizedBox(height: 12),
                _buildAlertList(),
              ],
            ),
          ),
        ),
        onLoading: const Center(child: CircularProgressIndicator()),
        onError: (error) => Center(child: Text('Error: $error')),
      ),
    );
  }

  void _showLogoutDialog() {
    Get.dialog(
      AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Logout', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to logout? This will clear all session data.', 
          style: GoogleFonts.poppins()),
        actions: [
          TextButton(
            onPressed: () => Get.back(),
            child: Text('Cancel', style: GoogleFonts.poppins(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              Get.back();
              Get.find<AuthController>().signOut();
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text('Logout', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildLanguageSwitcher() {
    return Obx(() {
      final isHindi = controller.currentLocale.value.languageCode == 'hi';
      return TextButton(
        onPressed: () => controller.toggleLanguage(),
        child: Text(
          isHindi ? 'EN' : 'हिंदी',
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
      );
    });
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.green.shade700),
        const SizedBox(width: 8),
        Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 18, 
            fontWeight: FontWeight.bold, 
            color: Colors.blueGrey.shade800,
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(AmuSummary state) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF042013), Color(0xFF0D472A), Color(0xFF155E38)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: Colors.greenAccent.withOpacity(0.25), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0D472A).withOpacity(0.4),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Stack(
        children: [
          Positioned(
            right: -30,
            top: -30,
            child: Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [Colors.greenAccent.withOpacity(0.18), Colors.transparent],
                ),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: Colors.white.withOpacity(0.2)),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.greenAccent,
                            ),
                          ).animate(onPlay: (c) => c.repeat(reverse: true))
                           .scale(begin: const Offset(0.8, 0.8), end: const Offset(1.3, 1.3), duration: const Duration(seconds: 1)),
                          const SizedBox(width: 8),
                          Text(
                            'MRL SURVEILLANCE • LIVE',
                            style: GoogleFonts.poppins(
                              color: Colors.white.withOpacity(0.95),
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.shield_outlined, color: Colors.greenAccent, size: 20),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      '${state.totalTreatments ?? 0}',
                      style: GoogleFonts.poppins(
                        color: Colors.white,
                        fontSize: 38,
                        fontWeight: FontWeight.w800,
                        height: 1.0,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Text(
                        'total_treatments'.tr,
                        style: GoogleFonts.poppins(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                Row(
                  children: [
                    Expanded(
                      child: _buildGlassPod(
                        icon: Icons.timer_outlined,
                        iconColor: Colors.amberAccent,
                        title: 'active_withdrawals'.tr,
                        value: '${state.activeWithdrawals ?? 0}',
                        highlight: (state.activeWithdrawals ?? 0) > 0,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildGlassPod(
                        icon: Icons.calendar_today_outlined,
                        iconColor: Colors.cyanAccent,
                        title: 'avg_wd_days'.tr,
                        value: '${state.averageWithdrawalDays?.toStringAsFixed(1) ?? "0.0"} d',
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: _buildGlassPod(
                        icon: Icons.verified_user_outlined,
                        iconColor: Colors.greenAccent,
                        title: 'Compliance',
                        value: '99.2%',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fade().slideY(begin: 0.2, duration: const Duration(milliseconds: 400));
  }

  Widget _buildGlassPod({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String value,
    bool highlight = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 12),
      decoration: BoxDecoration(
        color: highlight ? Colors.amber.withOpacity(0.2) : Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: highlight ? Colors.amberAccent.withOpacity(0.5) : Colors.white.withOpacity(0.15),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: iconColor, size: 18),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            title,
            style: GoogleFonts.poppins(color: Colors.white70, fontSize: 10),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildWithdrawalCountdown() {
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
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1F0D11), Color(0xFF2E1217), Color(0xFF3D161D)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: Colors.redAccent.withOpacity(0.5), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.red.withOpacity(0.28),
              blurRadius: 20,
              offset: const Offset(0, 8),
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
                      width: 50,
                      height: 50,
                      child: CircularProgressIndicator(
                        value: progress,
                        backgroundColor: Colors.white.withOpacity(0.12),
                        valueColor: const AlwaysStoppedAnimation<Color>(Colors.redAccent),
                        strokeWidth: 4.5,
                      ),
                    ),
                    const Icon(Icons.lock_clock, color: Colors.redAccent, size: 22)
                        .animate(onPlay: (c) => c.repeat(reverse: true))
                        .scale(begin: const Offset(0.9, 0.9), end: const Offset(1.15, 1.15), duration: const Duration(seconds: 1)),
                  ],
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.redAccent.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: Colors.redAccent.withOpacity(0.6)),
                            ),
                            child: Text(
                              'WITHHOLD MILK',
                              style: GoogleFonts.poppins(color: Colors.redAccent, fontSize: 9, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Tag: ${firstWithdrawal['animal_code'] ?? "COW-102"}',
                            style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'dont_sell_milk'.tr,
                        style: GoogleFonts.poppins(color: Colors.white70, fontSize: 11),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.45),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.redAccent.withOpacity(0.25)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildCountdownPod(days.toString().padLeft(2, '0'), 'DAYS'),
                  _buildCountdownSeparator(),
                  _buildCountdownPod(hours.toString().padLeft(2, '0'), 'HOURS'),
                  _buildCountdownSeparator(),
                  _buildCountdownPod(minutes.toString().padLeft(2, '0'), 'MINS'),
                  _buildCountdownSeparator(),
                  _buildCountdownPod(seconds.toString().padLeft(2, '0'), 'SECS', isLivePulse: true),
                ],
              ),
            ),
          ],
        ),
      ).animate().fadeIn().scale(delay: const Duration(milliseconds: 200));
    });
  }

  Widget _buildCountdownPod(String value, String unit, {bool isLivePulse = false}) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: isLivePulse ? Colors.redAccent.withOpacity(0.25) : Colors.white.withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: isLivePulse ? Colors.redAccent : Colors.white.withOpacity(0.15),
            ),
          ),
          child: Text(
            value,
            style: GoogleFonts.shareTechMono(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isLivePulse ? Colors.redAccent : Colors.white,
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          unit,
          style: GoogleFonts.poppins(color: Colors.white54, fontSize: 9, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }

  Widget _buildCountdownSeparator() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Text(
        ':',
        style: GoogleFonts.shareTechMono(color: Colors.redAccent, fontSize: 18, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildHerdHeatmap() {
    return Obx(() {
      final animals = controller.animals;
      if (animals.isEmpty) {
        return Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(24),
          ),
          child: Center(
            child: Text(
              'No animals registered in herd yet',
              style: GoogleFonts.poppins(color: Colors.blueGrey.shade400, fontSize: 13),
            ),
          ),
        );
      }

      int redCount = 0;
      int yellowCount = 0;
      int greenCount = 0;

      for (var a in animals) {
        final st = controller.getAnimalStatus(a);
        if (st == 'RED') redCount++;
        else if (st == 'YELLOW') yellowCount++;
        else greenCount++;
      }

      final avatarSize = (Get.width * 0.105).clamp(36.0, 44.0);

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 16,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildHeatmapStatusPill('Healthy', greenCount, const Color(0xFF16A34A), const Color(0xFFF0FDF4)),
                _buildHeatmapStatusPill('Monitor', yellowCount, const Color(0xFFD97706), const Color(0xFFFFFBEB)),
                _buildHeatmapStatusPill('Withheld', redCount, const Color(0xFFDC2626), const Color(0xFFFEF2F2)),
              ],
            ),
            const Divider(height: 20),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 5,
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 0.70,
              ),
              itemCount: animals.length.clamp(0, 20),
              itemBuilder: (context, index) {
                final animal = animals[index];
                final status = controller.getAnimalStatus(animal);
                Color statusColor;
                if (status == 'RED') {
                  statusColor = const Color(0xFFDC2626);
                } else if (status == 'YELLOW') {
                  statusColor = const Color(0xFFD97706);
                } else {
                  statusColor = const Color(0xFF16A34A);
                }

                final imageUrl = animal.imageUrl ?? BreedAssetHelper.getBreedImage(animal.breed, animal.species);

                return GestureDetector(
                  onTap: () => _showAnimalTooltip(animal, statusColor),
                  behavior: HitTestBehavior.opaque,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: avatarSize,
                        height: avatarSize,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: statusColor, width: 2.2),
                          boxShadow: [
                            BoxShadow(
                              color: statusColor.withOpacity(0.25),
                              blurRadius: 6,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: Image.network(
                            imageUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Icon(Icons.pets, size: 18, color: statusColor),
                          ),
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        animal.animalCode ?? 'TAG',
                        style: GoogleFonts.poppins(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.blueGrey.shade800),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                      ),
                    ],
                  ),
                ).animate().scale(delay: Duration(milliseconds: index * 25));
              },
            ),
          ],
        ),
      );
    });
  }

  Widget _buildHeatmapStatusPill(String label, int count, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: textColor.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(shape: BoxShape.circle, color: textColor),
          ),
          const SizedBox(width: 6),
          Text(
            '$count $label',
            style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: textColor),
          ),
        ],
      ),
    );
  }

  void _showAnimalTooltip(Animal animal, Color statusColor) {
    final imageUrl = animal.imageUrl ?? BreedAssetHelper.getBreedImage(animal.breed, animal.species);

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Row(
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: statusColor.withOpacity(0.1),
                  backgroundImage: NetworkImage(imageUrl),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Tag: ${animal.animalCode ?? "N/A"}',
                        style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        '${animal.species?.capitalizeFirst} • ${animal.breed ?? "Indigenous Breed"}',
                        style: GoogleFonts.poppins(color: Colors.grey[700], fontWeight: FontWeight.w500),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(
                          color: statusColor.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          animal.healthStatus ?? 'HEALTHY',
                          style: GoogleFonts.poppins(
                            color: statusColor,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Get.back(),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    child: Text('Close', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      Get.back();
                      Get.toNamed(Routes.ANIMAL_DETAIL, arguments: animal.id);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF1B5E20),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      elevation: 0,
                    ),
                    child: Text('Full Profile', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
    );
  }

  Widget _buildInteractivePieChart(List<dynamic>? breakdown) {
    if (breakdown == null || breakdown.isEmpty) return const Center(child: Text('No data'));
    
    final colors = [Colors.blue, Colors.green, Colors.orange, Colors.red, Colors.purple];
    
    return Container(
      height: 220,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: PieChart(
              PieChartData(
                sectionsSpace: 2,
                centerSpaceRadius: 35,
                sections: breakdown.asMap().entries.map((entry) {
                  final idx = entry.key;
                  final val = entry.value;
                  final percentage = (val['percentage'] as num).toDouble();
                  return PieChartSectionData(
                    color: colors[idx % colors.length],
                    value: percentage,
                    title: '${percentage.toInt()}%',
                    radius: 50,
                    titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                  );
                }).toList(),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            flex: 1,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: breakdown.asMap().entries.map((entry) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: Row(
                    children: [
                      Container(width: 10, height: 10, color: colors[entry.key % colors.length]),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          entry.value['drugClass'] ?? 'Unknown', 
                          style: const TextStyle(fontSize: 11),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    ).animate().fadeIn(delay: const Duration(milliseconds: 300));
  }

  Widget _buildTrendLineChart() {
    return Container(
      height: 180,
      padding: const EdgeInsets.fromLTRB(10, 20, 20, 10),
      decoration: BoxDecoration(
        color: Colors.white, 
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: LineChart(
        LineChartData(
          gridData: const FlGridData(show: false),
          titlesData: const FlTitlesData(
            show: true,
            rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
          ),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: controller.amuTrendData.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value['value'])).toList(),
              isCurved: true,
              color: const Color(0xFF1B5E20),
              barWidth: 4,
              dotData: const FlDotData(show: true),
              belowBarData: BarAreaData(show: true, color: Colors.green.withOpacity(0.1)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionGrid() {
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: 4,
      mainAxisSpacing: 16,
      crossAxisSpacing: 16,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _buildActionIcon('livestock'.tr, Icons.pets, Colors.brown, () => Get.find<NavController>().changePage(1)),
        _buildActionIcon('risk_assess'.tr, Icons.analytics, Colors.blue, () => Get.toNamed(Routes.RISK_ASSESSMENT)),
        _buildActionIcon('withdrawals'.tr, Icons.event_note, Colors.green, () => Get.find<NavController>().changePage(2)),
        _buildActionIcon('add_treatment'.tr, Icons.add_moderator, Colors.red, () => Get.toNamed(Routes.ADD_TREATMENT)),
        _buildActionIcon('medicine_browser'.tr, Icons.medication, Colors.indigo, () => Get.toNamed(Routes.MEDICINES_CATALOG)),
        _buildActionIcon('safety_passport'.tr, Icons.qr_code_2, Colors.orange, () => Get.toNamed(Routes.ANIMAL_PASSPORT)),
        _buildActionIcon('lab_results'.tr, Icons.science, Colors.purple, () => Get.toNamed(Routes.LAB_RESULTS)),
        _buildActionIcon('reports'.tr, Icons.assessment, Colors.teal, () => Get.find<NavController>().changePage(3)),
      ],
    );
  }

  Widget _buildActionIcon(String title, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.12), 
              borderRadius: BorderRadius.circular(18),
            ),
            child: Icon(icon, color: color, size: 26),
          ),
          const SizedBox(height: 6),
          Text(
            title, 
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold), 
            textAlign: TextAlign.center, 
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  Widget _buildAlertList() {
    return Obx(() => ListView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: controller.alerts.length.clamp(0, 3),
          itemBuilder: (context, index) {
            final alert = controller.alerts[index];
            final color = _getAlertColor(alert.type);
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: color.withOpacity(0.2)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.02),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle),
                    child: Icon(_getAlertIcon(alert.type), color: color, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(alert.title ?? 'Alert', style: const TextStyle(fontWeight: FontWeight.bold)),
                        Text(alert.message ?? '', style: TextStyle(fontSize: 12, color: Colors.grey.shade600), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                ],
              ),
            ).animate().slideX(begin: 0.2, delay: Duration(milliseconds: index * 100));
          },
        ));
  }

  Color _getAlertColor(String? type) {
    switch (type?.toUpperCase()) {
      case 'CRITICAL': return const Color(0xFFDC2626);
      case 'WARNING': return const Color(0xFFD97706);
      default: return const Color(0xFF2563EB);
    }
  }

  IconData _getAlertIcon(String? type) {
    switch (type?.toUpperCase()) {
      case 'CRITICAL': return Icons.error_outline;
      case 'WARNING': return Icons.warning_amber_rounded;
      default: return Icons.info_outline;
    }
  }

  void _showAlertsDialog(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(24),
        constraints: BoxConstraints(maxHeight: Get.height * 0.75),
        decoration: const BoxDecoration(
          color: Colors.white, 
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
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
                        color: const Color(0xFF1B5E20).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.notifications_active, color: Color(0xFF1B5E20), size: 20),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      'Live Safety Alerts',
                      style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.blueGrey.shade900),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Get.back(),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Obx(() {
                if (controller.alerts.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle_outline, size: 48, color: Colors.green.shade300),
                        const SizedBox(height: 12),
                        Text(
                          'All clear! No active safety alerts.',
                          style: GoogleFonts.poppins(color: Colors.grey.shade600, fontSize: 13),
                        ),
                      ],
                    ),
                  );
                }

                return ListView.builder(
                  itemCount: controller.alerts.length,
                  itemBuilder: (context, index) {
                    final alert = controller.alerts[index];
                    final color = _getAlertColor(alert.type);
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: color.withOpacity(0.04),
                        borderRadius: BorderRadius.circular(18),
                        border: Border.all(color: color.withOpacity(0.2)),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(color: color.withOpacity(0.12), shape: BoxShape.circle),
                            child: Icon(_getAlertIcon(alert.type), color: color, size: 20),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      alert.title ?? 'Alert',
                                      style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.blueGrey.shade900),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(6)),
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
                                  style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade700),
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
}
