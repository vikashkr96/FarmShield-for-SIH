import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/models_info_controller.dart';

class ModelsInfoView extends GetView<ModelsInfoController> {
  const ModelsInfoView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('ML Model Benchmarks', style: GoogleFonts.poppins()),
      ),
      body: controller.obx(
        (data) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _buildProjectHeader(data!['project']),
            const SizedBox(height: 20),
            _buildModelCard('Model A: Overuse Risk', data['model_a']),
            const SizedBox(height: 16),
            _buildModelCard('Model B: Compliance Risk', data['model_b']),
          ],
        ),
        onLoading: const Center(child: CircularProgressIndicator()),
        onError: (err) => Center(child: Text('Error: $err')),
      ),
    );
  }

  Widget _buildProjectHeader(String? title) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Text(
        title ?? 'Digital Farm Management Portal',
        style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.blue.shade800),
      ),
    );
  }

  Widget _buildModelCard(String title, Map<String, dynamic> model) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
            const Divider(),
            _buildMetricRow('Algorithm', model['algorithm']),
            _buildMetricRow('Macro F1 Score', model['macro_f1']?.toString()),
            _buildMetricRow('ROC-AUC (OvR)', model['roc_auc_ovr']?.toString()),
            const SizedBox(height: 8),
            Text('Classes:', style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12)),
            Wrap(
              spacing: 8,
              children: (model['classes'] as List? ?? []).map((c) => Chip(
                label: Text(c.toString(), style: const TextStyle(fontSize: 10)),
                padding: EdgeInsets.zero,
                visualDensity: VisualDensity.compact,
              )).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMetricRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey)),
          Text(value ?? 'N/A', style: const TextStyle(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
