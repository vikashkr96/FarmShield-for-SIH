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
    final doseController = TextEditingController(text: '10.0');
    final indicationController = TextEditingController(text: 'Clinical Mastitis');
    final notesController = TextEditingController();
    final doseUnit = 'mg/kg'.obs;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Record Clinical Treatment',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 17, color: Colors.white),
            ),
            Text(
              'Live AMU Logging & ML Compliance Check',
              style: GoogleFonts.poppins(fontSize: 11, color: Colors.white.withOpacity(0.85)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1B5E20),
        elevation: 0,
      ),
      body: Obx(() => controller.isLoading.value && controller.medicines.isEmpty
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF1B5E20)))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 1. Livestock & Medicine Section
                  _buildSectionHeader('1. Patient & Medication', Icons.pets_rounded),
                  const SizedBox(height: 10),
                  _buildAnimalDropdown(),
                  const SizedBox(height: 12),
                  _buildMedicineDropdown(),
                  const SizedBox(height: 8),
                  _buildLiveDrugDetailsBadge(),

                  const SizedBox(height: 20),

                  // 2. Dosage & Administration
                  _buildSectionHeader('2. Dosage & Administration', Icons.vaccines_rounded),
                  const SizedBox(height: 10),
                  
                  // Dose & Unit Row
                  Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: _buildInputField(
                          controller: doseController,
                          label: 'Dose Amount',
                          hint: '10.0',
                          icon: Icons.scale_rounded,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 2,
                        child: Obx(() => DropdownButtonFormField<String>(
                              value: doseUnit.value,
                              decoration: InputDecoration(
                                labelText: 'Unit',
                                labelStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600),
                                filled: true,
                                fillColor: Colors.white,
                                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade300)),
                                enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade200)),
                              ),
                              items: ['mg/kg', 'ml', 'g', 'IU']
                                  .map((e) => DropdownMenuItem(value: e, child: Text(e, style: GoogleFonts.poppins(fontSize: 12.5))))
                                  .toList(),
                              onChanged: (val) {
                                if (val != null) doseUnit.value = val;
                              },
                            )),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Route Selector
                  _buildRouteSelector(),
                  const SizedBox(height: 12),

                  // Duration Selector Chips
                  _buildDurationSelector(),
                  const SizedBox(height: 12),

                  // Indication & Notes
                  _buildInputField(
                    controller: indicationController,
                    label: 'Diagnosis / Indication',
                    hint: 'e.g. Acute Mastitis in Right Quarter',
                    icon: Icons.medical_services_outlined,
                  ),
                  const SizedBox(height: 12),

                  _buildInputField(
                    controller: notesController,
                    label: 'Veterinary Notes / Instructions (Optional)',
                    hint: 'e.g. Administer after morning milking cycle',
                    icon: Icons.note_alt_outlined,
                    maxLines: 2,
                  ),

                  const SizedBox(height: 20),

                  // 3. Product Affected & Regulatory Withhold Preview
                  _buildSectionHeader('3. Product Affected & Safety Preview', Icons.verified_user_rounded),
                  const SizedBox(height: 10),
                  _buildProductAffectedSelector(),
                  const SizedBox(height: 12),

                  // Start Date Picker
                  Obx(() => InkWell(
                        onTap: () async {
                          final date = await showDatePicker(
                            context: context,
                            initialDate: controller.selectedStartDate.value,
                            firstDate: DateTime(2022),
                            lastDate: DateTime.now().add(const Duration(days: 14)),
                          );
                          if (date != null) controller.selectedStartDate.value = date;
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.grey.shade200),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  const Icon(Icons.calendar_month_rounded, color: Color(0xFF1B5E20), size: 20),
                                  const SizedBox(width: 10),
                                  Text('Treatment Start Date', style: GoogleFonts.poppins(fontSize: 12.5, color: Colors.blueGrey.shade800)),
                                ],
                              ),
                              Text(
                                DateFormat('MMM dd, yyyy').format(controller.selectedStartDate.value),
                                style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13, color: const Color(0xFF1B5E20)),
                              ),
                            ],
                          ),
                        ),
                      )),

                  const SizedBox(height: 12),

                  // Live Calculated Safety Card
                  _buildLiveSafetyCalculationCard(),

                  const SizedBox(height: 24),

                  // 4. Submit Button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1B5E20),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      onPressed: () {
                        if (controller.selectedAnimalId.value.isEmpty || controller.selectedMedicineId.value.isEmpty) {
                          Get.snackbar('Selection Required', 'Please select an animal and medication', snackPosition: SnackPosition.BOTTOM);
                          return;
                        }

                        final dose = double.tryParse(doseController.text.trim()) ?? 10.0;
                        final duration = controller.selectedDuration.value;
                        final start = controller.selectedStartDate.value;
                        final end = start.add(Duration(days: duration));

                        controller.submitTreatment(Treatment(
                          animalId: controller.selectedAnimalId.value,
                          medicineId: controller.selectedMedicineId.value,
                          doseAmount: dose,
                          doseUnit: doseUnit.value,
                          route: controller.selectedRoute.value,
                          frequency: controller.selectedFrequency.value,
                          durationDays: duration,
                          startDate: start,
                          endDate: end,
                          indication: indicationController.text.trim(),
                          productAffected: controller.selectedProduct.value,
                          notes: notesController.text.trim(),
                        ));
                      },
                      child: Obx(() => controller.isLoading.value
                          ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.shield_rounded, size: 20, color: Colors.greenAccent),
                                const SizedBox(width: 8),
                                Text(
                                  'SAVE TREATMENT & START WITHHOLD',
                                  style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, letterSpacing: 0.3),
                                ),
                              ],
                            )),
                    ),
                  ),

                  const SizedBox(height: 24),
                ],
              ),
            )),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 18, color: const Color(0xFF1B5E20)),
        const SizedBox(width: 8),
        Text(
          title,
          style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13.5, color: const Color(0xFF0F172A)),
        ),
      ],
    );
  }

  Widget _buildAnimalDropdown() {
    return Obx(() => Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: DropdownButtonFormField<String>(
            value: controller.selectedAnimalId.value.isEmpty ? null : controller.selectedAnimalId.value,
            decoration: InputDecoration(
              labelText: 'Select Animal (Tag / Breed)',
              labelStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600),
              prefixIcon: const Icon(Icons.pets_rounded, color: Color(0xFF1B5E20), size: 20),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            ),
            items: controller.animals
                .map((a) => DropdownMenuItem(
                      value: a.id ?? a.animalCode ?? '',
                      child: Text(
                        '${a.animalCode ?? "Tag"} • ${a.breed ?? a.species?.capitalizeFirst ?? "Cattle"}',
                        style: GoogleFonts.poppins(fontSize: 12.5, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
                      ),
                    ))
                .toList(),
            onChanged: (val) {
              if (val != null) controller.selectedAnimalId.value = val;
            },
          ),
        ));
  }

  Widget _buildMedicineDropdown() {
    return Obx(() => Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: DropdownButtonFormField<String>(
            value: controller.selectedMedicineId.value.isEmpty ? null : controller.selectedMedicineId.value,
            decoration: InputDecoration(
              labelText: 'Select Prescribed Medicine',
              labelStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600),
              prefixIcon: const Icon(Icons.medication_liquid_rounded, color: Color(0xFF1B5E20), size: 20),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            ),
            items: controller.medicines
                .map((m) => DropdownMenuItem(
                      value: m.id ?? m.name ?? '',
                      child: Text(
                        '${m.name ?? "Drug"} (${m.activeIngredient ?? ""})',
                        style: GoogleFonts.poppins(fontSize: 12.5, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ))
                .toList(),
            onChanged: (val) {
              if (val != null) controller.selectedMedicineId.value = val;
            },
          ),
        ));
  }

  Widget _buildLiveDrugDetailsBadge() {
    return Obx(() {
      final med = controller.selectedMedicine.value;
      if (med == null) return const SizedBox.shrink();

      return Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: const Color(0xFFF0FDF4),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.green.shade200),
        ),
        child: Row(
          children: [
            const Icon(Icons.info_outline_rounded, color: Color(0xFF1B5E20), size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Class: ${med.antimicrobialClass ?? "Beta-lactam"} • Strength: ${med.strength ?? "150mg/ml"}',
                    style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.bold, color: const Color(0xFF1B5E20)),
                  ),
                  Text(
                    'Regulatory standard withhold duration applies.',
                    style: GoogleFonts.poppins(fontSize: 10, color: Colors.blueGrey.shade600),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildRouteSelector() {
    final routes = ['Injection (IM/SC)', 'Oral / Drench', 'Intramammary', 'Topical / Dip'];
    return Obx(() => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Administration Route', style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade700, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              runSpacing: 6,
              children: routes.map((r) {
                final isSelected = controller.selectedRoute.value == r;
                return ChoiceChip(
                  label: Text(r, style: GoogleFonts.poppins(fontSize: 11.5, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500)),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) controller.selectedRoute.value = r;
                  },
                  selectedColor: const Color(0xFF1B5E20),
                  backgroundColor: Colors.white,
                  side: BorderSide(color: isSelected ? const Color(0xFF1B5E20) : Colors.grey.shade300),
                  labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.blueGrey.shade800),
                );
              }).toList(),
            ),
          ],
        ));
  }

  Widget _buildDurationSelector() {
    final durations = [1, 3, 5, 7, 10];
    return Obx(() => Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Course Duration (Days)', style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade700, fontWeight: FontWeight.w600)),
            const SizedBox(height: 6),
            Row(
              children: durations.map((d) {
                final isSelected = controller.selectedDuration.value == d;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(right: 6),
                    child: ChoiceChip(
                      label: Text('$d Day${d > 1 ? "s" : ""}', style: GoogleFonts.poppins(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500)),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) controller.selectedDuration.value = d;
                      },
                      selectedColor: const Color(0xFF1B5E20),
                      backgroundColor: Colors.white,
                      side: BorderSide(color: isSelected ? const Color(0xFF1B5E20) : Colors.grey.shade300),
                      labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.blueGrey.shade800),
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ));
  }

  Widget _buildProductAffectedSelector() {
    final products = [
      {'key': 'milk', 'label': 'Milk (दूध)', 'icon': '🥛'},
      {'key': 'meat', 'label': 'Meat (मांस)', 'icon': '🥩'},
      {'key': 'all', 'label': 'All Produce', 'icon': '📦'},
    ];

    return Obx(() => Row(
          children: products.map((p) {
            final isSelected = controller.selectedProduct.value == p['key'];
            return Expanded(
              child: GestureDetector(
                onTap: () => controller.selectedProduct.value = p['key']!,
                child: Container(
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF1B5E20).withOpacity(0.08) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF1B5E20) : Colors.grey.shade200,
                      width: isSelected ? 1.8 : 1,
                    ),
                  ),
                  child: Column(
                    children: [
                      Text(p['icon']!, style: const TextStyle(fontSize: 18)),
                      const SizedBox(height: 2),
                      Text(
                        p['label']!,
                        style: GoogleFonts.poppins(
                          fontSize: 10.5,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          color: isSelected ? const Color(0xFF1B5E20) : Colors.blueGrey.shade700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ));
  }

  Widget _buildLiveSafetyCalculationCard() {
    return Obx(() {
      final days = controller.estimatedWithdrawalDays;
      final clearanceDate = controller.estimatedClearanceDate;
      final formattedClearance = DateFormat('EEE, MMM dd, yyyy').format(clearanceDate);

      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFFFFBEB),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.amber.shade300, width: 1.2),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.lock_clock_rounded, color: Colors.amber.shade900, size: 18),
                    const SizedBox(width: 6),
                    Text(
                      'AI Withhold Calculator',
                      style: GoogleFonts.poppins(fontSize: 12.5, fontWeight: FontWeight.bold, color: Colors.amber.shade900),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade100,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'FSSAI / Codex MRL',
                    style: GoogleFonts.poppins(fontSize: 9.5, fontWeight: FontWeight.bold, color: Colors.amber.shade900),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              'Required Withhold: $days Days post-course completion.',
              style: GoogleFonts.poppins(fontSize: 11.5, fontWeight: FontWeight.w600, color: const Color(0xFF0F172A)),
            ),
            Text(
              'Projected Safe Harvest Date: $formattedClearance',
              style: GoogleFonts.poppins(fontSize: 11.5, fontWeight: FontWeight.bold, color: const Color(0xFF1B5E20)),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: GoogleFonts.poppins(fontSize: 13, color: Colors.blueGrey.shade900),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600),
        hintText: hint,
        hintStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade300),
        filled: true,
        fillColor: Colors.white,
        prefixIcon: Icon(icon, color: const Color(0xFF1B5E20), size: 18),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade300)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade200)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF1B5E20), width: 1.5)),
      ),
    );
  }
}
