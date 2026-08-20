import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../controllers/animal_detail_controller.dart';

class AnimalDetailView extends GetView<AnimalDetailController> {
  const AnimalDetailView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: Text('Animal Profile', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.green.shade700,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: controller.obx(
        (data) => SingleChildScrollView(
          child: Column(
            children: [
              _buildHeroHeader(data!),
              _buildSafetyBanner(data),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    _buildQRCodeSection(data),
                    const SizedBox(height: 24),
                    _buildMedicalTimeline(data['treatments'] ?? []),
                  ],
                ),
              ),
            ],
          ),
        ),
        onLoading: const Center(child: CircularProgressIndicator()),
        onError: (err) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildHeroHeader(Map<String, dynamic> animal) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 30),
      decoration: BoxDecoration(
        color: Colors.green.shade700,
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
      ),
      child: Column(
        children: [
          Stack(
            alignment: Alignment.bottomRight,
            children: [
              Container(
                width: 140,
                height: 140,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 4),
                  boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 10)],
                  image: animal['image_url'] != null
                      ? DecorationImage(image: NetworkImage(animal['image_url']), fit: BoxFit.cover)
                      : null,
                ),
                child: animal['image_url'] == null
                    ? const Icon(Icons.pets, size: 70, color: Colors.white70)
                    : null,
              ),
              CircleAvatar(
                backgroundColor: Colors.orange,
                child: IconButton(
                  icon: const Icon(Icons.camera_alt, color: Colors.white, size: 20),
                  onPressed: () => _pickImage(ImageSource.camera),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(
            animal['animal_code'] ?? 'N/A',
            style: GoogleFonts.poppins(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          Text(
            '${animal['breed']} • ${animal['species']?.toString().toUpperCase()}',
            style: const TextStyle(color: Colors.white70, letterSpacing: 1.1),
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildHeaderStat('DOB', _formatDate(animal['dob'])),
              _buildHeaderStat('Weight', '${animal['weight'] ?? 0} kg'),
              _buildHeaderStat('Status', animal['health_status'] ?? 'Healthy', isBadge: true),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHeaderStat(String label, String value, {bool isBadge = false}) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 12)),
        const SizedBox(height: 4),
        if (isBadge)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: value == 'Healthy' ? Colors.green.shade400 : Colors.orange,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
          )
        else
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
      ],
    );
  }

  Widget _buildSafetyBanner(Map<String, dynamic> data) {
    final bool isActive = controller.isWithdrawalActive(data['withdrawals'] ?? []);
    final int hours = controller.getRemainingHours(data['withdrawals'] ?? []);

    return Transform.translate(
      offset: const Offset(0, -20),
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 24),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 10, offset: const Offset(0, 4))],
        ),
        child: Row(
          children: [
            Icon(isActive ? Icons.warning_rounded : Icons.check_circle, 
                 color: isActive ? Colors.red : Colors.green, size: 40),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isActive ? 'WITHDRAWAL ACTIVE' : 'CLEARED',
                    style: GoogleFonts.poppins(
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                      color: isActive ? Colors.red.shade700 : Colors.green.shade700,
                    ),
                  ),
                  if (isActive)
                    Text('Safe to harvest in $hours hours', style: const TextStyle(fontSize: 12, color: Colors.grey))
                  else
                    const Text('Product safe for consumption', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
            if (isActive)
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.red.shade50, shape: BoxShape.circle),
                child: Text('$hours', style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildQRCodeSection(Map<String, dynamic> animal) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            Row(
              children: [
                const Icon(Icons.qr_code_2, color: Colors.green),
                const SizedBox(width: 12),
                Text('Digital Ear Tag', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 18)),
                const Spacer(),
                IconButton(icon: const Icon(Icons.share), onPressed: () {}),
              ],
            ),
            const Divider(height: 32),
            QrImageView(
              data: animal['qr_token'] ?? 'NO_TOKEN',
              version: QrVersions.auto,
              size: 200.0,
              gapless: false,
              eyeStyle: const QrEyeStyle(eyeShape: QrEyeShape.square, color: Colors.black87),
              dataModuleStyle: const QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: Colors.black87),
            ),
            const SizedBox(height: 12),
            Text(animal['qr_token'] ?? '', style: const TextStyle(color: Colors.grey, letterSpacing: 2)),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.print),
              label: const Text('Print Physical Tag'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 45),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMedicalTimeline(List<dynamic> treatments) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: Text('Medical History', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 20)),
        ),
        const SizedBox(height: 16),
        if (treatments.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32.0),
              child: Text('No treatment history found.', style: TextStyle(color: Colors.grey)),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: treatments.length,
            itemBuilder: (context, index) {
              final t = treatments[index];
              final medicine = t['medicine'] ?? {};
              return IntrinsicHeight(
                child: Row(
                  children: [
                    Column(
                      children: [
                        Container(
                          width: 12,
                          height: 12,
                          decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle),
                        ),
                        Expanded(
                          child: Container(width: 2, color: index == treatments.length - 1 ? Colors.transparent : Colors.green.shade200),
                        ),
                      ],
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              DateFormat('MMM dd, yyyy').format(DateTime.parse(t['start_date'])),
                              style: TextStyle(color: Colors.green.shade800, fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                            const SizedBox(height: 8),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: Colors.grey.shade200),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(medicine['name'] ?? 'Unknown Medicine', 
                                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                                  Text('${medicine['active_ingredient']} • ${medicine['antimicrobial_class']}',
                                      style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                  const Divider(height: 20),
                                  _buildTimelineDetail(Icons.scale, 'Dose', '${t['dose']} ${t['dose_unit']}'),
                                  _buildTimelineDetail(Icons.person, 'Vet', t['veterinarian_id'] ?? 'Self-Administered'),
                                  _buildTimelineDetail(Icons.healing, 'Indication', t['indication'] ?? 'Routine'),
                                  if (t['attachment_url'] != null) ...[
                                    const SizedBox(height: 12),
                                    InkWell(
                                      onTap: () {},
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                        decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(8)),
                                        child: const Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(Icons.attachment, size: 16, color: Colors.blue),
                                            SizedBox(width: 8),
                                            Text('View Prescription', style: TextStyle(color: Colors.blue, fontSize: 12, fontWeight: FontWeight.bold)),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  Widget _buildTimelineDetail(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 14, color: Colors.grey),
          const SizedBox(width: 8),
          Text('$label: ', style: const TextStyle(fontSize: 12, color: Colors.grey)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  String _formatDate(dynamic date) {
    if (date == null) return 'N/A';
    try {
      return DateFormat('MMM dd, yyyy').format(DateTime.parse(date.toString()));
    } catch (e) {
      return date.toString();
    }
  }

  void _pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 50);
    if (pickedFile != null) {
      controller.uploadAnimalPhoto(File(pickedFile.path));
    }
  }
}
