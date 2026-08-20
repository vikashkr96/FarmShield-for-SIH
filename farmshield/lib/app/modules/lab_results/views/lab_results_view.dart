import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/lab_results_controller.dart';

class LabResultsView extends GetView<LabResultsController> {
  const LabResultsView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final animalIdController = TextEditingController();
    final testTypeController = TextEditingController();
    final residueLevelController = TextEditingController();
    final resultStatus = 'Negative'.obs;

    return Scaffold(
      appBar: AppBar(
        title: Text('Record Lab Results', style: GoogleFonts.poppins()),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildTextField('Animal ID', animalIdController, Icons.tag),
            _buildTextField('Test Type / Molecule', testTypeController, Icons.science_outlined),
            _buildTextField('Residue Level (ppb)', residueLevelController, Icons.biotech, isNumber: true),
            const SizedBox(height: 12),
            Obx(() => DropdownButtonFormField<String>(
                  value: resultStatus.value,
                  decoration: InputDecoration(
                    labelText: 'Result Status',
                    prefixIcon: const Icon(Icons.check_circle_outline),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  items: ['Negative', 'Positive', 'Trace']
                      .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                      .toList(),
                  onChanged: (val) => resultStatus.value = val!,
                )),
            const SizedBox(height: 32),
            Obx(() => controller.isLoading.value
                ? const CircularProgressIndicator()
                : SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.purple,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        controller.submitLabResults({
                          'animal_id': animalIdController.text,
                          'test_type': testTypeController.text,
                          'residue_level_ppb': double.tryParse(residueLevelController.text),
                          'status': resultStatus.value,
                          'timestamp': DateTime.now().toIso8601String(),
                        });
                      },
                      child: Text('Submit Lab Report', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
                    ),
                  )),
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController ctrl, IconData icon, {bool isNumber = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextField(
        controller: ctrl,
        keyboardType: isNumber ? TextInputType.number : TextInputType.text,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}
