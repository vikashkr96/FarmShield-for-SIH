import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../controllers/animal_passport_controller.dart';
import 'qr_scanner_view.dart';

class AnimalPassportView extends GetView<AnimalPassportController> {
  const AnimalPassportView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final searchController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: Text('Safety Verification', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.green.shade700,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.green.shade700,
              borderRadius: const BorderRadius.vertical(bottom: Radius.circular(24)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: TextField(
                      controller: searchController,
                      decoration: InputDecoration(
                        hintText: 'Enter QR Token...',
                        border: InputBorder.none,
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.search),
                          onPressed: () => controller.fetchPublicPassport(searchController.text),
                        ),
                      ),
                      onSubmitted: (val) => controller.fetchPublicPassport(val),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.orange,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.qr_code_scanner, color: Colors.white),
                    onPressed: () async {
                      final result = await Get.to(() => const QRScannerView());
                      if (result != null && result is String) {
                        searchController.text = result;
                        controller.fetchPublicPassport(result);
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: controller.obx(
              (passport) => SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildPassportHeader(passport!),
                    const SizedBox(height: 24),
                    _buildSafetyBadge(passport),
                    const SizedBox(height: 20),
                    _buildCountdownSection(passport),
                    const SizedBox(height: 20),
                    _buildDetailCard(passport),
                  ],
                ),
              ),
              onLoading: const Center(child: CircularProgressIndicator()),
              onEmpty: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.qr_code_2, size: 100, color: Colors.grey),
                    SizedBox(height: 16),
                    Text('Scan an ear-tag QR to verify safety.', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ),
              onError: (err) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Text('Error: $err', style: const TextStyle(color: Colors.red), textAlign: TextAlign.center),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPassportHeader(dynamic passport) {
    return Column(
      children: [
        Container(
          width: 120,
          height: 120,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 4),
            boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10)],
            image: passport.imageUrl != null
                ? DecorationImage(image: NetworkImage(passport.imageUrl!), fit: BoxFit.cover)
                : null,
          ),
          child: passport.imageUrl == null
              ? const Icon(Icons.pets, size: 60, color: Colors.grey)
              : null,
        ),
        const SizedBox(height: 16),
        Text(
          passport.animalCode ?? 'Unknown',
          style: GoogleFonts.poppins(fontSize: 26, fontWeight: FontWeight.bold),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.grey.shade200,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Text(
            '${passport.species?.toUpperCase()} • ${passport.breed}',
            style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w500, fontSize: 12),
          ),
        ),
      ],
    );
  }

  Widget _buildSafetyBadge(dynamic passport) {
    final bool isSafe = passport.isMilkSafe ?? false;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
      decoration: BoxDecoration(
        color: isSafe ? Colors.green.shade50 : Colors.red.shade50,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isSafe ? Colors.green : Colors.red, width: 1.5),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(isSafe ? Icons.verified : Icons.warning_rounded, color: isSafe ? Colors.green : Colors.red, size: 36),
          const SizedBox(width: 12),
          Text(
            isSafe ? '🟢 CLEARED FOR MILK' : '🔴 WITHDRAWAL ACTIVE',
            style: GoogleFonts.poppins(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: isSafe ? Colors.green.shade800 : Colors.red.shade800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCountdownSection(dynamic passport) {
    if (passport.isMilkSafe == true) return const SizedBox.shrink();

    final remainingHours = passport.remainingWithdrawalHours ?? 0;
    return Column(
      children: [
        Text(
          'REMAINING WITHDRAWAL PERIOD',
          style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade600, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 8),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildTimeSegment(remainingHours.toString(), 'HOURS'),
          ],
        ),
        const SizedBox(height: 12),
        if (passport.safeDate != null)
          Text(
            'Safe for human consumption after: ${DateFormat('MMM dd, yyyy HH:mm').format(passport.safeDate!)}',
            style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black54),
          ),
      ],
    );
  }

  Widget _buildTimeSegment(String value, String label) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.black87,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            value,
            style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
          ),
        ),
        const SizedBox(height: 4),
        Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
      ],
    );
  }

  Widget _buildDetailCard(dynamic passport) {
    return Card(
      elevation: 0,
      color: Colors.grey.shade50,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: BorderSide(color: Colors.grey.shade200)),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Health & Compliance Audit', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16)),
            const Divider(height: 24),
            _buildInfoRow(Icons.health_and_safety, 'Health Status', passport.healthStatus ?? 'N/A'),
            _buildInfoRow(Icons.medical_services, 'Medical History', passport.withdrawalStatus ?? 'Clear'),
            _buildInfoRow(Icons.event_available, 'Last Treatment', passport.isMilkSafe == true ? 'Completed' : 'Ongoing'),
            const SizedBox(height: 16),
            const Text(
              'Verified via FarmShield Secure Blockchain Ledger (FSSAI/WHO Compliance)',
              style: TextStyle(fontSize: 10, color: Colors.grey, fontStyle: FontStyle.italic),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.green.shade600),
          const SizedBox(width: 12),
          Text(label, style: const TextStyle(color: Colors.black54)),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600, color: Colors.black87)),
        ],
      ),
    );
  }
}
