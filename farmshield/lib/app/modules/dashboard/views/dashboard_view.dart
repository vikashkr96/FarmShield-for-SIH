import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:intl/intl.dart';
import '../../../routes/app_pages.dart';
import '../controllers/dashboard_controller.dart';
import '../../../data/models/farm_models.dart';

class DashboardView extends GetView<DashboardController> {
  const DashboardView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'dashboard_title'.tr,
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: Colors.green.shade700,
        elevation: 0,
        actions: [
          _buildLanguageSwitcher(),
          IconButton(
            icon: const Icon(Icons.notifications_active),
            onPressed: () => _showAlertsDialog(context),
          ),
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

  Widget _buildLanguageSwitcher() {
    return Obx(() {
      // Accessing currentLocale.value fixes the GetX improper use exception
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
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.green.shade700, Colors.green.shade500],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.green.withOpacity(0.3),
            blurRadius: 15,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('total_treatments'.tr, style: GoogleFonts.poppins(color: Colors.white70, fontSize: 13)),
                  Text('${state.totalTreatments ?? 0}',
                      style: GoogleFonts.poppins(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                ],
              ),
              const Icon(Icons.analytics, color: Colors.white30, size: 48),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStatItem('active_withdrawals'.tr, '${state.activeWithdrawals ?? 0}'),
              _buildStatItem('avg_wd_days'.tr, '${state.averageWithdrawalDays?.toStringAsFixed(1) ?? "0.0"} d'),
            ],
          ),
        ],
      ),
    ).animate().fade().slideY(begin: 0.2, duration: const Duration(milliseconds: 400));
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: GoogleFonts.poppins(color: Colors.white70, fontSize: 11)),
        Text(value, style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }

  Widget _buildWithdrawalCountdown() {
    return Obx(() {
      if (controller.activeWithdrawals.isEmpty) return const SizedBox.shrink();

      final firstWithdrawal = controller.activeWithdrawals.first;
      final endDate = firstWithdrawal['end_date'] as DateTime;
      final remaining = controller.getRemainingTime(endDate);
      
      if (remaining.inSeconds <= 0) return const SizedBox.shrink();

      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.red.shade50,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.red.shade100),
        ),
        child: Row(
          children: [
            const Icon(Icons.timer, color: Colors.red, size: 28)
                .animate(onPlay: (c) => c.repeat())
                .shake(duration: const Duration(seconds: 2)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('dont_sell_milk'.tr, style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                  Text('Animal ID: ${firstWithdrawal['animal_code'] ?? "N/A"}', 
                    style: TextStyle(fontSize: 12, color: Colors.red.shade700),
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            Flexible(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('HH:MM:SS', style: TextStyle(fontSize: 10, color: Colors.red.shade300)),
                  Text(
                    "${remaining.inHours.toString().padLeft(2, '0')}:${(remaining.inMinutes % 60).toString().padLeft(2, '0')}:${(remaining.inSeconds % 60).toString().padLeft(2, '0')}",
                    style: GoogleFonts.shareTechMono(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.red),
                  ),
                ],
              ),
            ),
          ],
        ),
      ).animate().fadeIn().scale(delay: const Duration(milliseconds: 200));
    });
  }

  Widget _buildHerdHeatmap() {
    return Obx(() => Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 5,
          mainAxisSpacing: 10,
          crossAxisSpacing: 10,
        ),
        itemCount: controller.animals.length.clamp(0, 20),
        itemBuilder: (context, index) {
          final animal = controller.animals[index];
          final status = controller.getAnimalStatus(animal);
          Color statusColor;
          switch (status) {
            case 'RED': statusColor = Colors.red; break;
            case 'YELLOW': statusColor = Colors.orange; break;
            default: statusColor = Colors.green;
          }

          return GestureDetector(
            onTap: () => _showAnimalTooltip(animal, statusColor),
            child: Container(
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: statusColor, width: 2),
              ),
              child: CircleAvatar(
                backgroundColor: Colors.grey.shade200,
                backgroundImage: animal.imageUrl != null ? NetworkImage(animal.imageUrl!) : null,
                child: animal.imageUrl == null ? Icon(Icons.pets, size: 16, color: statusColor.withOpacity(0.5)) : null,
              ),
            ),
          ).animate().scale(delay: Duration(milliseconds: index * 50));
        },
      ),
    ));
  }

  void _showAnimalTooltip(Animal animal, Color statusColor) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(25))),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(radius: 40, backgroundImage: animal.imageUrl != null ? NetworkImage(animal.imageUrl!) : null),
            const SizedBox(height: 12),
            Text('Tag: ${animal.animalCode ?? "N/A"}', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
            Text('Status: ${animal.healthStatus ?? "CLEARED"}', style: TextStyle(color: statusColor, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Get.back();
                Get.toNamed(Routes.ANIMAL_DETAIL, arguments: animal);
              },
              child: const Text('View Full History'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInteractivePieChart(List<dynamic>? breakdown) {
    if (breakdown == null || breakdown.isEmpty) return const Center(child: Text('No data'));
    
    final colors = [Colors.blue, Colors.green, Colors.orange, Colors.red, Colors.purple];
    
    return Container(
      height: 220,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
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
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
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
              color: Colors.green.shade600,
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
        _buildActionIcon('livestock'.tr, Icons.pets, Colors.brown, () => Get.toNamed(Routes.LIVESTOCK)),
        _buildActionIcon('risk_assess'.tr, Icons.analytics, Colors.blue, () => Get.toNamed(Routes.RISK_ASSESSMENT)),
        _buildActionIcon('withdrawals'.tr, Icons.event_note, Colors.green, () => Get.toNamed(Routes.CALENDAR)),
        _buildActionIcon('add_treatment'.tr, Icons.add_moderator, Colors.red, () => Get.toNamed(Routes.ADD_TREATMENT)),
        _buildActionIcon('medicine_browser'.tr, Icons.medication, Colors.indigo, () => Get.toNamed(Routes.MEDICINES_CATALOG)),
        _buildActionIcon('safety_passport'.tr, Icons.qr_code_2, Colors.orange, () => Get.toNamed(Routes.ANIMAL_PASSPORT)),
        _buildActionIcon('lab_results'.tr, Icons.science, Colors.purple, () => Get.toNamed(Routes.LAB_RESULTS)),
        _buildActionIcon('reports'.tr, Icons.assessment, Colors.teal, () => Get.toNamed(Routes.REPORTS)),
      ],
    );
  }

  Widget _buildActionIcon(String title, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
            child: Icon(icon, color: color, size: 28),
          ),
          const SizedBox(height: 6),
          Text(title, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold), textAlign: TextAlign.center, maxLines: 1),
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
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: color.withOpacity(0.2)),
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
    switch (type) {
      case 'CRITICAL': return Colors.red;
      case 'WARNING': return Colors.orange;
      default: return Colors.blue;
    }
  }

  IconData _getAlertIcon(String? type) {
    switch (type) {
      case 'CRITICAL': return Icons.error_outline;
      case 'WARNING': return Icons.warning_amber_rounded;
      default: return Icons.info_outline;
    }
  }

  void _showAlertsDialog(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white, 
          borderRadius: BorderRadius.vertical(top: Radius.circular(25))
        ),
        child: Column(
          children: [
            Text('recent_alerts'.tr, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
            const Divider(),
            Expanded(
              child: Obx(() => ListView.builder(
                itemCount: controller.alerts.length,
                itemBuilder: (context, index) {
                  final alert = controller.alerts[index];
                  return ListTile(
                    leading: Icon(_getAlertIcon(alert.type), color: _getAlertColor(alert.type)),
                    title: Text(alert.title ?? ''),
                    subtitle: Text(alert.message ?? ''),
                  );
                },
              )),
            ),
          ],
        ),
      ),
    );
  }
}
