import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../controllers/lab_results_controller.dart';

class LabResultsView extends GetView<LabResultsController> {
  const LabResultsView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final animalIdController = TextEditingController();
    final productController = TextEditingController();
    final analyteController = TextEditingController();
    final resultController = TextEditingController();
    final mrlController = TextEditingController();
    final labNameController = TextEditingController();
    
    final selectedDate = DateTime.now().obs;
    final resultStatus = 'COMPLIANT'.obs;

    return Scaffold(
      appBar: AppBar(
        title: Text('Record Lab Results', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.teal,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Analytical Residue Entry', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            _buildTextField('Animal ID', animalIdController, Icons.tag),
            _buildTextField('Product (e.g. Milk, Meat)', productController, Icons.inventory),
            _buildTextField('Analyte / Molecule', analyteController, Icons.science_outlined),
            Row(
              children: [
                Expanded(child: _buildTextField('Measured Result (ppb)', resultController, Icons.biotech, isNumber: true)),
                const SizedBox(width: 10),
                Expanded(child: _buildTextField('MRL Threshold (ppb)', mrlController, Icons.gavel, isNumber: true)),
              ],
            ),
            _buildTextField('Laboratory Name', labNameController, Icons.business),
            
            Obx(() => ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.calendar_today, color: Colors.teal),
              title: Text("Test Date: ${DateFormat('yyyy-MM-dd').format(selectedDate.value)}"),
              trailing: const Icon(Icons.edit),
              onTap: () async {
                final date = await showDatePicker(
                  context: context,
                  initialDate: selectedDate.value,
                  firstDate: DateTime(2000),
                  lastDate: DateTime.now(),
                );
                if (date != null) selectedDate.value = date;
              },
            )),

            const SizedBox(height: 12),
            Obx(() => DropdownButtonFormField<String>(
                  value: resultStatus.value,
                  decoration: InputDecoration(
                    labelText: 'Compliance Status',
                    prefixIcon: const Icon(Icons.check_circle_outline),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  items: ['COMPLIANT', 'NON_COMPLIANT']
                      .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                      .toList(),
                  onChanged: (val) => resultStatus.value = val!,
                )),
            
            const SizedBox(height: 20),
            Obx(() => Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey.shade300),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  if (controller.selectedFile.value != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 8.0),
                      child: Text("Attached: ${controller.selectedFile.value!.path.split('/').last}"),
                    ),
                  ElevatedButton.icon(
                    onPressed: () => controller.pickCertificate(),
                    icon: const Icon(Icons.upload_file),
                    label: Text(controller.selectedFile.value == null 
                        ? 'Attach Official Lab Certificate (PDF/Image)' 
                        : 'Change Certificate'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.blueGrey,
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            )),

            const SizedBox(height: 32),
            Obx(() => controller.isLoading.value
                ? const Center(child: CircularProgressIndicator())
                : SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.teal,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: () {
                        controller.submitLabResults({
                          'animal_id': animalIdController.text,
                          'product': productController.text,
                          'analyte': analyteController.text,
                          'result': double.tryParse(resultController.text),
                          'unit': 'ppb',
                          'mrl_threshold': double.tryParse(mrlController.text),
                          'laboratory': labNameController.text,
                          'status': resultStatus.value,
                          'test_date': selectedDate.value.toIso8601String(),
                        });
                      },
                      child: Text('Save Lab Record', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16)),
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
          prefixIcon: Icon(icon, color: Colors.teal),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Colors.teal, width: 2),
          ),
        ),
      ),
    );
  }
}
