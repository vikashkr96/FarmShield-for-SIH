import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../controllers/lab_results_controller.dart';

class LabResultsView extends GetView<LabResultsController> {
  const LabResultsView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final analyteController = TextEditingController(text: 'Amoxicillin Residue Assay');
    final resultController = TextEditingController(text: '12.5');
    final mrlController = TextEditingController(text: '50.0');
    final labNameController = TextEditingController(text: 'NDRI National Residue Testing Laboratory');

    // Run initial evaluation
    controller.evaluateCompliance(resultController.text, mrlController.text);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Record Lab Assay Result',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 17, color: Colors.white),
            ),
            Text(
              'Analytical Residue & MRL Compliance Verification',
              style: GoogleFonts.poppins(fontSize: 11, color: Colors.white.withOpacity(0.85)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1B5E20),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Patient & Sample Origin
            _buildSectionHeader('1. Patient & Sample Origin', Icons.pets_rounded),
            const SizedBox(height: 10),
            _buildAnimalDropdown(),
            const SizedBox(height: 12),
            _buildProductSelector(),

            const SizedBox(height: 20),

            // 2. Chemical Analyte & Assay
            _buildSectionHeader('2. Chemical Analyte & Concentration', Icons.biotech_rounded),
            const SizedBox(height: 10),
            _buildInputField(
              controller: analyteController,
              label: 'Target Analyte / Residue Molecule',
              hint: 'e.g. Amoxicillin, Enrofloxacin, Tetracycline',
              icon: Icons.science_outlined,
            ),
            const SizedBox(height: 8),
            _buildAnalyteSuggestionChips(analyteController),

            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: _buildInputField(
                    controller: resultController,
                    label: 'Measured (µg/kg)',
                    hint: '12.5',
                    icon: Icons.speed_rounded,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    onChanged: (val) => controller.evaluateCompliance(val, mrlController.text),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildInputField(
                    controller: mrlController,
                    label: 'MRL Limit (µg/kg)',
                    hint: '50.0',
                    icon: Icons.gavel_rounded,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    onChanged: (val) => controller.evaluateCompliance(resultController.text, val),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Live Compliance Status Banner
            _buildLiveComplianceBanner(),

            const SizedBox(height: 20),

            // 3. Laboratory & Testing Date
            _buildSectionHeader('3. Laboratory & Test Schedule', Icons.verified_rounded),
            const SizedBox(height: 10),
            _buildInputField(
              controller: labNameController,
              label: 'Testing Laboratory Name',
              hint: 'e.g. NDRI Central Animal Health Laboratory',
              icon: Icons.domain_rounded,
            ),
            const SizedBox(height: 12),

            // Date picker tile
            Obx(() => InkWell(
                  onTap: () async {
                    final date = await showDatePicker(
                      context: context,
                      initialDate: controller.selectedDate.value,
                      firstDate: DateTime(2020),
                      lastDate: DateTime.now(),
                    );
                    if (date != null) controller.selectedDate.value = date;
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
                            Text('Sample Collection Date', style: GoogleFonts.poppins(fontSize: 12.5, color: Colors.blueGrey.shade800)),
                          ],
                        ),
                        Text(
                          DateFormat('MMM dd, yyyy').format(controller.selectedDate.value),
                          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13, color: const Color(0xFF1B5E20)),
                        ),
                      ],
                    ),
                  ),
                )),

            const SizedBox(height: 20),

            // 4. Official Certificate Attachment
            _buildSectionHeader('4. Official Lab Certificate', Icons.attach_file_rounded),
            const SizedBox(height: 10),
            _buildCertificateAttachmentCard(),

            const SizedBox(height: 24),

            // 5. Submit Button
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
                  final resultVal = double.tryParse(resultController.text.trim()) ?? 0.0;
                  final mrlVal = double.tryParse(mrlController.text.trim()) ?? 50.0;

                  controller.submitLabResults(
                    animalIdOrTag: controller.selectedAnimalId.value,
                    product: controller.selectedProduct.value,
                    analyte: analyteController.text.trim(),
                    result: resultVal,
                    mrl: mrlVal,
                    laboratory: labNameController.text.trim(),
                  );
                },
                child: Obx(() => controller.isLoading.value
                    ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.verified_user_rounded, size: 20, color: Colors.greenAccent),
                          const SizedBox(width: 8),
                          Text(
                            'SAVE & SYNC LAB TEST RESULT',
                            style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 13, letterSpacing: 0.3),
                          ),
                        ],
                      )),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
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
              labelText: 'Select Tested Animal',
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

  Widget _buildProductSelector() {
    final products = [
      {'key': 'milk', 'label': 'Milk (दूध)', 'icon': '🥛'},
      {'key': 'meat', 'label': 'Meat (मांस)', 'icon': '🥩'},
      {'key': 'eggs', 'label': 'Eggs (अंडे)', 'icon': '🥚'},
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

  Widget _buildAnalyteSuggestionChips(TextEditingController controller) {
    final suggestions = ['Amoxicillin', 'Oxytetracycline', 'Enrofloxacin', 'Sulfadiazine'];
    return SizedBox(
      height: 28,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: suggestions.map((s) {
          return GestureDetector(
            onTap: () => controller.text = '$s Residue Assay',
            child: Container(
              margin: const EdgeInsets.only(right: 6),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Text(
                s,
                style: GoogleFonts.poppins(fontSize: 10.5, fontWeight: FontWeight.w600, color: Colors.blueGrey.shade800),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildLiveComplianceBanner() {
    return Obx(() {
      final isComp = controller.isCompliant.value;
      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isComp ? const Color(0xFFF0FDF4) : const Color(0xFFFEF2F2),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: isComp ? Colors.green.shade400 : Colors.red.shade400, width: 1.2),
        ),
        child: Row(
          children: [
            Icon(
              isComp ? Icons.check_circle_rounded : Icons.cancel_rounded,
              color: isComp ? const Color(0xFF1B5E20) : Colors.red.shade800,
              size: 22,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                controller.complianceMessage.value,
                style: GoogleFonts.poppins(
                  fontSize: 11.5,
                  fontWeight: FontWeight.bold,
                  color: isComp ? const Color(0xFF1B5E20) : Colors.red.shade900,
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildCertificateAttachmentCard() {
    return Obx(() => Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Row(
            children: [
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  color: const Color(0xFFF1F5F9),
                  borderRadius: BorderRadius.circular(12),
                  image: controller.selectedFile.value != null
                      ? DecorationImage(image: FileImage(controller.selectedFile.value!), fit: BoxFit.cover)
                      : null,
                ),
                child: controller.selectedFile.value == null
                    ? const Icon(Icons.picture_as_pdf_rounded, color: Color(0xFF1B5E20), size: 26)
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      controller.selectedFile.value != null ? 'Official Lab Certificate Attached' : 'Attach Official Certificate',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 12.5, color: const Color(0xFF0F172A)),
                    ),
                    Text(
                      controller.selectedFile.value != null
                          ? controller.selectedFile.value!.path.split(RegExp(r'[\\/]')).last
                          : 'Supports PDF or high-res photo scan',
                      style: GoogleFonts.poppins(fontSize: 10.5, color: Colors.blueGrey.shade500),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              ElevatedButton.icon(
                onPressed: () => controller.pickCertificate(),
                icon: const Icon(Icons.upload_file_rounded, size: 16),
                label: Text(controller.selectedFile.value == null ? 'Attach' : 'Change', style: GoogleFonts.poppins(fontSize: 11.5, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1B5E20).withOpacity(0.1),
                  foregroundColor: const Color(0xFF1B5E20),
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ));
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
    Function(String)? onChanged,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      onChanged: onChanged,
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
