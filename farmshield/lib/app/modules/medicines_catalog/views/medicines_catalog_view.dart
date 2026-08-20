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
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: Text(
          'Veterinary Medicine Browser',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: Colors.green.shade700,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              onChanged: (value) => controller.searchQuery.value = value,
              decoration: InputDecoration(
                hintText: 'Search brand or active molecule...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(30),
                  borderSide: BorderSide.none,
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
                return const Center(child: CircularProgressIndicator());
              }
              final list = controller.filteredMedicines;
              if (list.isEmpty) {
                return const Center(child: Text('No medicines found.'));
              }
              return ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: list.length,
                itemBuilder: (context, index) => _buildMedicineCard(list[index]),
              );
            }),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => controller.showAddMedicineSheet(),
        backgroundColor: Colors.green.shade700,
        icon: const Icon(Icons.add),
        label: const Text('Add Medicine'),
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 50,
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
                label: Text(c, style: GoogleFonts.poppins(fontSize: 12)),
                selected: isSelected,
                onSelected: (val) => controller.selectedClass.value = c,
                selectedColor: Colors.green.shade700,
                labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black87),
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

    // Find milk and aquaculture rules specifically for the UI display
    final milkRule = rules.firstWhereOrNull((r) => r.product == 'Milk');
    final aquaRule = rules.firstWhereOrNull((r) => r.product == 'Aquaculture' || r.product == 'Fish');

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image Section
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Colors.grey.shade100,
                image: medicine.imageUrl != null
                    ? DecorationImage(image: NetworkImage(medicine.imageUrl!), fit: BoxFit.cover)
                    : null,
              ),
              child: medicine.imageUrl == null ? const Icon(Icons.medication, size: 40, color: Colors.grey) : null,
            ),
            const SizedBox(width: 16),
            // Details Section
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          medicine.name ?? 'Unknown',
                          style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                      ),
                      if (isCia)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(4)),
                          child: const Text('⚠️ CIA', style: TextStyle(color: Colors.red, fontSize: 10, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                  Text(
                    '${medicine.activeIngredient} | ${medicine.strength}',
                    style: GoogleFonts.poppins(fontSize: 12, color: Colors.grey.shade600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Class: ${medicine.antimicrobialClass}',
                    style: GoogleFonts.poppins(fontSize: 11, fontWeight: FontWeight.w500, color: Colors.blue.shade700),
                  ),
                  const Divider(height: 16),
                  // FSSAI Info
                  Row(
                    children: [
                      if (milkRule != null)
                        _buildInfoTag('🥛 Milk: ${milkRule.withdrawalDays}d', Colors.orange),
                      const SizedBox(width: 8),
                      if (aquaRule != null)
                        _buildInfoTag('🐟 Aqua: ${aquaRule.withdrawalDays}d', Colors.blue),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (milkRule != null && milkRule.mrl != null)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(6)),
                      child: Text(
                        'MRL: ${milkRule.mrl} µg/kg (FSSAI Gazette)',
                        style: GoogleFonts.poppins(fontSize: 10, color: Colors.green.shade800, fontWeight: FontWeight.w600),
                      ),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoTag(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        text,
        style: TextStyle(color: color, fontSize: 10, fontWeight: FontWeight.bold),
      ),
    );
  }
}
