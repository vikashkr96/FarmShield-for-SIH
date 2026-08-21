import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/medicines_catalog_controller.dart';
import '../../../data/models/farm_models.dart';

class MedicinesCatalogView extends GetView<MedicinesCatalogController> {
  const MedicinesCatalogView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Veterinary Drug Formulary',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18),
        ),
        backgroundColor: const Color(0xFF1B5E20),
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(68),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.08),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: TextField(
                onChanged: (value) => controller.searchQuery.value = value,
                decoration: InputDecoration(
                  hintText: 'Search brand, molecule, or class...',
                  hintStyle: GoogleFonts.poppins(fontSize: 13, color: Colors.blueGrey.shade300),
                  prefixIcon: const Icon(Icons.search, color: Color(0xFF1B5E20)),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      body: Column(
        children: [
          _buildFilterChips(),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator(color: Color(0xFF1B5E20)));
              }
              final list = controller.filteredMedicines;
              if (list.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.medication_liquid_outlined, size: 64, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      Text(
                        'No medicines found',
                        style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.blueGrey.shade600),
                      ),
                    ],
                  ),
                );
              }
              return ListView.builder(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 80),
                itemCount: list.length,
                itemBuilder: (context, index) => _buildMedicineCard(list[index]),
              );
            }),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => controller.showAddMedicineSheet(),
        backgroundColor: const Color(0xFF1B5E20),
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_circle_outline),
        label: Text('Add Drug & MRL', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 54,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        children: controller.antimicrobialClasses.map((c) {
          return Obx(() {
            final isSelected = controller.selectedClass.value == c;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(c, style: GoogleFonts.poppins(fontSize: 12, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500)),
                selected: isSelected,
                onSelected: (val) => controller.selectedClass.value = c,
                selectedColor: const Color(0xFF1B5E20),
                backgroundColor: Colors.white,
                side: BorderSide(
                  color: isSelected ? const Color(0xFF1B5E20) : Colors.grey.shade300,
                ),
                labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.blueGrey.shade700),
              ),
            );
          });
        }).toList(),
      ),
    );
  }

  Widget _buildMedicineCard(Medicine medicine) {
    final isCia = controller.isCIA(medicine.antimicrobialClass);
    final rules = medicine.rules ?? [];

    final milkRule = rules.firstWhereOrNull((r) => r.product?.toLowerCase() == 'milk');
    final aquaRule = rules.firstWhereOrNull((r) => r.product?.toLowerCase() == 'aquaculture' || r.product?.toLowerCase() == 'fish');

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
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
        border: Border.all(
          color: isCia ? Colors.redAccent.withOpacity(0.3) : Colors.grey.shade100,
          width: isCia ? 1.5 : 1.0,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                color: const Color(0xFFE8F5E9),
                image: medicine.imageUrl != null
                    ? DecorationImage(image: NetworkImage(medicine.imageUrl!), fit: BoxFit.cover)
                    : null,
              ),
              child: medicine.imageUrl == null
                  ? const Icon(Icons.medication, size: 36, color: Color(0xFF2E7D32))
                  : null,
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          medicine.name ?? 'Unknown Medicine',
                          style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.blueGrey.shade900),
                        ),
                      ),
                      if (isCia)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.redAccent.withOpacity(0.5)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.warning_amber_rounded, size: 12, color: Colors.red),
                              const SizedBox(width: 4),
                              Text(
                                'WHO CIA',
                                style: GoogleFonts.poppins(color: Colors.red.shade700, fontSize: 10, fontWeight: FontWeight.bold),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${medicine.activeIngredient ?? "Active Ingredient"} • ${medicine.strength ?? ""}',
                    style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFF1B5E20).withOpacity(0.08),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      medicine.antimicrobialClass ?? 'Veterinary Therapeutic',
                      style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: const Color(0xFF1B5E20)),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      if (milkRule != null && milkRule.withdrawalDays != null)
                        _buildInfoTag('🥛 Milk W/D: ${milkRule.withdrawalDays}d', Colors.amber.shade800, Colors.amber.shade50),
                      if (aquaRule != null && aquaRule.withdrawalDays != null)
                        _buildInfoTag('🐟 Aqua W/D: ${aquaRule.withdrawalDays}d', Colors.blue.shade800, Colors.blue.shade50),
                      if (milkRule != null && milkRule.mrl != null)
                        _buildInfoTag('⚖️ MRL: ${milkRule.mrl} µg/kg', const Color(0xFF1B5E20), const Color(0xFFE8F5E9)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTag(String text, Color textColor, Color bgColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: textColor.withOpacity(0.25)),
      ),
      child: Text(
        text,
        style: GoogleFonts.poppins(color: textColor, fontSize: 10, fontWeight: FontWeight.w600),
      ),
    );
  }
}
