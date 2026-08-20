import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../routes/app_pages.dart';
import '../controllers/dashboard_controller.dart';

class DashboardView extends GetView<DashboardController> {
  const DashboardView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: Text(
          'FarmShield Dashboard',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: Colors.green.shade700,
        elevation: 0,
        actions: [
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
                const SizedBox(height: 24),
                Text(
                  'Quick Actions',
                  style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 16),
                _buildActionGrid(),
                const SizedBox(height: 24),
                Text(
                  'AMU Class Breakdown',
                  style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _buildClassBreakdown(state.classBreakdown),
                const SizedBox(height: 24),
                Text(
                  'Recent Alerts',
                  style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold),
                ),
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

  Widget _buildSummaryCard(dynamic state) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [Colors.green.shade700, Colors.green.shade500],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.green.withOpacity(0.3),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Total Treatments',
            style: GoogleFonts.poppins(color: Colors.white70, fontSize: 14),
          ),
          const SizedBox(height: 8),
          Text(
            '${state.totalTreatments ?? 0}',
            style: GoogleFonts.poppins(
              color: Colors.white,
              fontSize: 32,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildStatItem('Active Withdrawals', '${state.activeWithdrawals ?? 0}'),
              _buildStatItem('Avg W/D Days', '${state.averageWithdrawalDays?.toStringAsFixed(1) ?? "0.0"} d'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.poppins(color: Colors.white70, fontSize: 12),
        ),
        Text(
          value,
          style: GoogleFonts.poppins(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }

  Widget _buildActionGrid() {
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: 2,
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      childAspectRatio: 1.5,
      physics: const NeverScrollableScrollPhysics(),
      children: [
        _buildActionCard(
          'Livestock',
          Icons.pets,
          Colors.brown,
          () => Get.toNamed(Routes.LIVESTOCK),
        ),
        _buildActionCard(
          'Risk Assess',
          Icons.analytics_outlined,
          Colors.blue,
          () => Get.toNamed(Routes.RISK_ASSESSMENT),
        ),
        _buildActionCard(
          'Safety Passport',
          Icons.qr_code_scanner,
          Colors.orange,
          () => Get.toNamed(Routes.ANIMAL_PASSPORT),
        ),
        _buildActionCard(
          'Add Treatment',
          Icons.medical_services_outlined,
          Colors.red,
          () => Get.toNamed(Routes.ADD_TREATMENT),
        ),
        _buildActionCard(
          'Lab Results',
          Icons.biotech_outlined,
          Colors.purple,
          () => Get.toNamed(Routes.LAB_RESULTS),
        ),
        _buildActionCard(
          'Benchmarks',
          Icons.psychology_outlined,
          Colors.teal,
          () => Get.toNamed(Routes.MODELS_INFO),
        ),
      ],
    );
  }

  Widget _buildActionCard(String title, IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(15),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 32),
            const SizedBox(height: 8),
            Text(
              title,
              style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w500),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildClassBreakdown(List<dynamic>? breakdown) {
    if (breakdown == null || breakdown.isEmpty) return const Text('No usage data recorded.');
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(15)),
      child: Column(
        children: breakdown.map((item) {
          final percentage = (item['percentage'] as num?)?.toDouble() ?? 0.0;
          return Padding(
            padding: const EdgeInsets.only(bottom: 8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(item['drugClass'] ?? 'Unknown', style: const TextStyle(fontWeight: FontWeight.w500)),
                    Text('${percentage.toStringAsFixed(1)}%', style: const TextStyle(color: Colors.grey)),
                  ],
                ),
                const SizedBox(height: 4),
                LinearProgressIndicator(
                  value: percentage / 100,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.green.shade400),
                ),
              ],
            ),
          );
        }).toList(),
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
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: _getAlertColor(alert.type).withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Icon(_getAlertIcon(alert.type), color: _getAlertColor(alert.type)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          alert.title ?? 'No Title',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.bold),
                        ),
                        Text(
                          alert.message ?? '',
                          style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade600),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
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
      case 'CRITICAL': return Icons.error;
      case 'WARNING': return Icons.warning;
      default: return Icons.info;
    }
  }

  void _showAlertsDialog(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            Text('All Alerts', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
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
