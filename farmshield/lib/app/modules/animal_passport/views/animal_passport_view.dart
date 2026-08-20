import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../controllers/animal_passport_controller.dart';

class AnimalPassportView extends GetView<AnimalPassportController> {
  const AnimalPassportView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final searchController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: Text('Safety Verification', style: GoogleFonts.poppins()),
        backgroundColor: Colors.orange.shade800,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: Colors.grey.withOpacity(0.1), blurRadius: 8)],
              ),
              child: TextField(
                controller: searchController,
                decoration: InputDecoration(
                  hintText: 'Scan or Enter QR Token (e.g. QR-COW-101)',
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.search),
                    onPressed: () => controller.fetchPublicPassport(searchController.text),
                  ),
                  border: InputBorder.none,
                ),
              ),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: controller.obx(
                (passport) => SingleChildScrollView(
                  child: Column(
                    children: [
                      _buildPassportHeader(passport!),
                      const SizedBox(height: 20),
                      _buildSafetyStatusCard('Milk Status', passport.milkStatus, passport.isMilkSafe),
                      const SizedBox(height: 12),
                      if (passport.meatStatus != null)
                        _buildSafetyStatusCard('Meat Status', passport.meatStatus, passport.isMeatSafe),
                      const SizedBox(height: 20),
                      _buildDetailCard(passport),
                    ],
                  ),
                ),
                onLoading: const Center(child: CircularProgressIndicator()),
                onEmpty: const Center(child: Text('Enter a QR token to verify food safety.')),
                onError: (err) => Center(child: Text('Error: $err', style: const TextStyle(color: Colors.red))),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPassportHeader(dynamic passport) {
    return Column(
      children: [
        const CircleAvatar(
          radius: 40,
          backgroundColor: Colors.orange,
          child: Icon(Icons.verified_user, size: 40, color: Colors.white),
        ),
        const SizedBox(height: 12),
        Text(
          passport.animalCode ?? 'Unknown',
          style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.bold),
        ),
        Text('${passport.species?.toUpperCase()} • ${passport.breed}',
            style: const TextStyle(color: Colors.grey, letterSpacing: 1.2)),
      ],
    );
  }

  Widget _buildSafetyStatusCard(String title, String? status, bool? isSafe) {
    final bool safe = isSafe ?? false;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: safe ? Colors.green.shade50 : Colors.red.shade50,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(color: safe ? Colors.green : Colors.red, width: 2),
      ),
      child: Row(
        children: [
          Icon(safe ? Icons.check_circle : Icons.warning, color: safe ? Colors.green : Colors.red, size: 32),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14)),
                Text(status ?? 'UNKNOWN',
                    style: GoogleFonts.poppins(
                        fontSize: 18, fontWeight: FontWeight.bold, color: safe ? Colors.green.shade900 : Colors.red.shade900)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailCard(dynamic passport) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Verification Details', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
            const Divider(),
            _buildInfoRow('Health Status', passport.healthStatus ?? 'N/A'),
            _buildInfoRow('Withdrawal Status', passport.withdrawalStatus ?? 'N/A'),
            _buildInfoRow('Remaining Hours', '${passport.remainingWithdrawalHours ?? 0} hrs'),
            if (passport.safeDate != null)
              _buildInfoRow('Safe Date', DateFormat('MMM dd, yyyy HH:mm').format(passport.safeDate!)),
            const SizedBox(height: 10),
            const Text(
              'Verified by Digital Farm Management & Food Safety Standards Portal (FSSAI Compliance)',
              style: TextStyle(fontSize: 10, color: Colors.grey, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
