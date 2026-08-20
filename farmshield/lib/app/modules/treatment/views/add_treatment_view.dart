import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../data/models/farm_models.dart';
import '../controllers/treatment_controller.dart';

class AddTreatmentView extends GetView<TreatmentController> {
  const AddTreatmentView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final doseController = TextEditingController();
    final durationController = TextEditingController();
    final indicationController = TextEditingController();
    final selectedDate = DateTime.now().obs;
    final productAffected = 'milk'.obs;

    return Scaffold(
      appBar: AppBar(
        title: Text('Record Treatment', style: GoogleFonts.poppins()),
        backgroundColor: Colors.red.shade700,
        foregroundColor: Colors.white,
      ),
      body: Obx(() => controller.isLoading.value && controller.medicines.isEmpty
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Animal & Medication', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  _buildAnimalDropdown(),
                  const SizedBox(height: 12),
                  _buildMedicineDropdown(),
                  const Divider(height: 32),
                  Text('Administration Details', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _buildTextField('Dose Amount', doseController, Icons.scale, isNumber: true)),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: 'mg/kg',
                          decoration: InputDecoration(
                            labelText: 'Unit',
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          items: ['mg/kg', 'ml', 'g/ton', 'IU']
                              .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                              .toList(),
                          onChanged: (val) {},
                        ),
                      ),
                    ],
                  ),
                  _buildTextField('Duration (Days)', durationController, Icons.timer, isNumber: true),
                  _buildTextField('Indication (e.g. Mastitis)', indicationController, Icons.description),
                  
                  DropdownButtonFormField<String>(
                    value: productAffected.value,
                    decoration: InputDecoration(
                      labelText: 'Product Affected',
                      prefixIcon: const Icon(Icons.shopping_basket),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    items: ['milk', 'aquaculture_biomass', 'egg', 'all']
                        .map((e) => DropdownMenuItem(value: e, child: Text(e.capitalizeFirst!)))
                        .toList(),
                    onChanged: (val) => productAffected.value = val!,
                  ),
                  
                  const SizedBox(height: 12),
                  Obx(() => ListTile(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                          side: BorderSide(color: Colors.grey.shade300),
                        ),
                        title: const Text('Start Date'),
                        subtitle: Text(DateFormat('yyyy-MM-dd').format(selectedDate.value)),
                        leading: const Icon(Icons.calendar_today),
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: selectedDate.value,
                            firstDate: DateTime(2020),
                            lastDate: DateTime.now(),
                          );
                          if (date != null) selectedDate.value = date;
                        },
                      )),
                  const SizedBox(height: 32),
                  SizedBox(
                    width: double.infinity,
                    height: 55,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red.shade700,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        elevation: 4,
                      ),
                      onPressed: () {
                        if (controller.selectedAnimalId.isEmpty || controller.selectedMedicineId.isEmpty) {
                          Get.snackbar('Input Error', 'Please select animal and medicine');
                          return;
                        }
                        controller.submitTreatment(Treatment(
                          animalId: controller.selectedAnimalId.value,
                          medicineId: controller.selectedMedicineId.value,
                          doseAmount: double.tryParse(doseController.text),
                          doseUnit: 'mg/kg',
                          durationDays: int.tryParse(durationController.text),
                          startDate: selectedDate.value,
                          indication: indicationController.text,
                          productAffected: productAffected.value,
                        ));
                      },
                      child: Text('SUBMIT TREATMENT & ANALYZE RISK',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, letterSpacing: 1.1)),
                    ),
                  ),
                ],
              ),
            )),
    );
  }

  Widget _buildAnimalDropdown() {
    return Obx(() => DropdownButtonFormField<String>(
          value: controller.selectedAnimalId.value.isEmpty ? null : controller.selectedAnimalId.value,
          decoration: InputDecoration(
            labelText: 'Select Animal (Tag ID)',
            prefixIcon: const Icon(Icons.pets),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          items: controller.animals
              .map((a) => DropdownMenuItem(
                    value: a.id ?? '',
                    child: Text('${a.animalCode ?? 'Unknown'} (${a.species ?? 'N/A'})'),
                  ))
              .toList(),
          onChanged: (val) => controller.selectedAnimalId.value = val ?? '',
        ));
  }

  Widget _buildMedicineDropdown() {
    return Obx(() => DropdownButtonFormField<String>(
          value: controller.selectedMedicineId.value.isEmpty ? null : controller.selectedMedicineId.value,
          decoration: InputDecoration(
            labelText: 'Select Medication',
            prefixIcon: const Icon(Icons.medication),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          items: controller.medicines
              .map((m) => DropdownMenuItem(
                    value: m.id ?? '',
                    child: Text('${m.brandName ?? 'Unknown'} (${m.activeIngredient ?? 'N/A'})'),
                  ))
              .toList(),
          onChanged: (val) => controller.selectedMedicineId.value = val ?? '',
        ));
  }

  Widget _buildTextField(String label, TextEditingController ctrl, IconData icon, {bool isNumber = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextField(
        controller: ctrl,
        keyboardType: isNumber ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.text,
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: Icon(icon),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}
