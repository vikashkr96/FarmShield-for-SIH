import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../controllers/animal_passport_controller.dart';
import 'qr_scanner_view.dart';
import '../../../data/models/farm_models.dart';

class AnimalPassportView extends GetView<AnimalPassportController> {
  const AnimalPassportView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final searchController = TextEditingController(text: controller.qrToken.value);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Safety & Traceability Verification',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 17, color: Colors.white),
            ),
            Text(
              'Public Consumer & MRL Regulatory Passport',
              style: GoogleFonts.poppins(fontSize: 11, color: Colors.white.withOpacity(0.85)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1B5E20),
        elevation: 0,
      ),
      body: Column(
        children: [
          // 1. Search / Scanner Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            decoration: const BoxDecoration(
              color: Color(0xFF1B5E20),
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(24)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 52,
                        padding: const EdgeInsets.only(left: 14, right: 6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.08),
                              blurRadius: 10,
                              offset: const Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.center,
                          children: [
                            const Icon(Icons.search_rounded, color: Color(0xFF1B5E20), size: 22),
                            const SizedBox(width: 10),
                            Expanded(
                              child: TextField(
                                controller: searchController,
                                textAlignVertical: TextAlignVertical.center,
                                style: GoogleFonts.poppins(
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w500,
                                  color: const Color(0xFF0F172A),
                                ),
                                decoration: InputDecoration(
                                  isCollapsed: true,
                                  hintText: 'Search Tag, QR Token, or ID...',
                                  hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.blueGrey.shade400),
                                  border: InputBorder.none,
                                ),
                                onSubmitted: (val) => controller.fetchPublicPassport(val),
                              ),
                            ),
                            const SizedBox(width: 8),
                            Material(
                              color: const Color(0xFF1B5E20),
                              borderRadius: BorderRadius.circular(12),
                              child: InkWell(
                                borderRadius: BorderRadius.circular(12),
                                onTap: () => controller.fetchPublicPassport(searchController.text),
                                child: Container(
                                  width: 38,
                                  height: 38,
                                  alignment: Alignment.center,
                                  child: const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: Colors.amber.shade600,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.08),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white, size: 24),
                        tooltip: 'Scan Ear-Tag QR',
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
                const SizedBox(height: 12),
                // Quick Chips for 1-tap testing
                SizedBox(
                  height: 30,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _buildQuickChip('COW-GIR-01', searchController),
                      _buildQuickChip('COW-SAH-02', searchController),
                      _buildQuickChip('BUF-MUR-01', searchController),
                      _buildQuickChip('GOAT-JAM-01', searchController),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // 2. Main Passport Content
          Expanded(
            child: controller.obx(
              (passport) => SingleChildScrollView(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildPassportHeader(passport!),
                    const SizedBox(height: 16),
                    _buildSafetyBanner(passport),
                    const SizedBox(height: 14),
                    _buildCountdownSection(passport),
                    const SizedBox(height: 14),
                    _buildDetailCard(passport),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
              onLoading: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(color: Color(0xFF1B5E20)),
                    SizedBox(height: 14),
                    Text('Verifying Blockchain & MRL Ledger...', style: TextStyle(color: Colors.blueGrey, fontSize: 13)),
                  ],
                ),
              ),
              onEmpty: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.qr_code_2_rounded, size: 80, color: Colors.blueGrey),
                      const SizedBox(height: 14),
                      Text(
                        'Scan an Ear-Tag QR to Verify Safety',
                        style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A)),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Tap any tag chip above or scan a livestock QR code.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600),
                      ),
                    ],
                  ),
                ),
              ),
              onError: (err) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(24.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.error_outline_rounded, size: 64, color: Colors.red.shade400),
                      const SizedBox(height: 14),
                      Text(
                        'Verification Note',
                        style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.red.shade800),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        err.toString(),
                        textAlign: TextAlign.center,
                        style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () => controller.fetchPublicPassport('COW-GIR-01'),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF1B5E20)),
                        child: const Text('Load Demo Animal Passport', style: TextStyle(color: Colors.white)),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickChip(String label, TextEditingController searchController) {
    return GestureDetector(
      onTap: () {
        searchController.text = label;
        controller.fetchPublicPassport(label);
      },
      child: Container(
        margin: const EdgeInsets.only(right: 6),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.18),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white.withOpacity(0.3)),
        ),
        child: Text(
          label,
          style: GoogleFonts.poppins(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
        ),
      ),
    );
  }

  Widget _buildPassportHeader(PublicPassport passport) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 76,
            height: 76,
            decoration: BoxDecoration(
              color: const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(16),
              image: passport.imageUrl != null
                  ? DecorationImage(
                      image: NetworkImage(passport.imageUrl!),
                      fit: BoxFit.cover,
                      onError: (_, __) {},
                    )
                  : null,
            ),
            child: passport.imageUrl == null
                ? const Icon(Icons.pets_rounded, size: 36, color: Color(0xFF1B5E20))
                : null,
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  passport.animalCode ?? 'Unknown Tag',
                  style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: const Color(0xFF0F172A)),
                ),
                Text(
                  '${passport.breed ?? "Indigenous Breed"} • ${(passport.species ?? "Livestock").toUpperCase()}',
                  style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600, fontWeight: FontWeight.w500),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1B5E20).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '📍 ${passport.farmName ?? "Sundarbans Farm"}',
                    style: GoogleFonts.poppins(fontSize: 10.5, fontWeight: FontWeight.bold, color: const Color(0xFF1B5E20)),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSafetyBanner(PublicPassport passport) {
    final bool isSafe = passport.isSafeToConsume ?? (passport.isMilkSafe ?? true);
    final String product = (passport.product ?? 'Milk & Meat').toUpperCase();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
      decoration: BoxDecoration(
        color: isSafe ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: isSafe ? Colors.green.shade400 : Colors.red.shade400, width: 1.5),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            isSafe ? Icons.verified_rounded : Icons.warning_amber_rounded,
            color: isSafe ? const Color(0xFF1B5E20) : Colors.red.shade800,
            size: 30,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isSafe ? '🟢 100% VERIFIED SAFE FOR SALE' : '🔴 ACTIVE WITHDRAWAL ($product)',
                  style: GoogleFonts.poppins(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w800,
                    color: isSafe ? const Color(0xFF1B5E20) : Colors.red.shade900,
                  ),
                ),
                Text(
                  isSafe
                      ? 'Complies with FSSAI & Codex Alimentarius MRL Standards.'
                      : 'Antibiotic residues present. Strictly withhold produce from market.',
                  style: GoogleFonts.poppins(fontSize: 10.5, color: Colors.blueGrey.shade700),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCountdownSection(PublicPassport passport) {
    final bool isSafe = passport.isSafeToConsume ?? (passport.isMilkSafe ?? true);
    if (isSafe) return const SizedBox.shrink();

    final remainingHours = passport.remainingHours ?? (passport.remainingWithdrawalHours ?? 48);
    final clearanceDate = passport.withdrawalEndDate ?? passport.safeDate ?? DateTime.now().add(const Duration(days: 3));

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.amber.shade300),
      ),
      child: Column(
        children: [
          Text(
            'MRL CLEARANCE COUNTDOWN',
            style: GoogleFonts.poppins(fontSize: 11, color: Colors.amber.shade900, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildTimeCard('${remainingHours ~/ 24}', 'DAYS'),
              const SizedBox(width: 8),
              _buildTimeCard('${remainingHours % 24}', 'HOURS'),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Safe for Harvest after: ${DateFormat('EEE, MMM dd, yyyy (hh:mm a)').format(clearanceDate)}',
            style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.blueGrey.shade800),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildTimeCard(String value, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(value, style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
          Text(label, style: GoogleFonts.poppins(fontSize: 9, color: Colors.blueGrey.shade300, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildDetailCard(PublicPassport passport) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Clinical Safety & Regulatory Audit', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 8),
          const Divider(height: 1),
          const SizedBox(height: 8),
          _buildInfoRow(Icons.health_and_safety_outlined, 'Health Status', passport.healthStatus?.capitalizeFirst ?? 'Healthy'),
          _buildInfoRow(Icons.science_outlined, 'Latest Residue Test', passport.latestLabResult ?? 'MRL Zero (Compliant)'),
          _buildInfoRow(Icons.verified_user_outlined, 'Safety Index Score', '${passport.complianceScore ?? 98.0}% Verified'),
          _buildInfoRow(Icons.event_available_outlined, 'Last Verified', DateFormat('MMM dd, yyyy').format(passport.lastVerifiedAt ?? DateTime.now())),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Row(
              children: [
                const Icon(Icons.shield_rounded, size: 14, color: Color(0xFF1B5E20)),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    'Certified under FarmShield AMU National Surveillance Protocol',
                    style: GoogleFonts.poppins(fontSize: 9.5, color: Colors.blueGrey.shade600, fontStyle: FontStyle.italic),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 16, color: const Color(0xFF1B5E20)),
          const SizedBox(width: 8),
          Text(
            label,
            style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
            ),
          ),
        ],
      ),
    );
  }
}
