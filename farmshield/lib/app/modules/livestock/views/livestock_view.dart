import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import '../../../data/models/farm_models.dart';
import '../../../routes/app_pages.dart';
import '../controllers/livestock_controller.dart';
import 'widgets/category_tile.dart';

class LivestockView extends GetView<LivestockController> {
  const LivestockView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text('Livestock Inventory', 
          style: GoogleFonts.poppins(fontWeight: FontWeight.w600, color: Colors.white)),
        backgroundColor: Colors.green.shade700,
        elevation: 0,
        centerTitle: true,
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 8),
            child: IconButton(
              icon: const Icon(Icons.add_circle_outline, color: Colors.white, size: 28),
              onPressed: () => _showAddAnimalDialog(context),
            ),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.only(top: 16, bottom: 8),
            color: Colors.green.shade700,
            child: _buildSpeciesFilter(),
          ),
          const SizedBox(height: 16),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Obx(() => Text(
              '${controller.selectedSpecies.value.capitalizeFirst} Herd',
              style: GoogleFonts.poppins(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.blueGrey.shade900,
              ),
            )),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: controller.obx(
              (animals) => ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                itemCount: animals?.length ?? 0,
                physics: const BouncingScrollPhysics(),
                itemBuilder: (context, index) {
                  final animal = animals![index];
                  return _buildAnimalCard(animal);
                },
              ),
              onLoading: const Center(child: CircularProgressIndicator()),
              onEmpty: _buildEmptyState(),
              onError: (err) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.pets_outlined, size: 80, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          Text(
            'No animals found in this category',
            style: GoogleFonts.poppins(color: Colors.grey.shade600, fontSize: 16),
          ),
        ],
      ),
    );
  }

  Widget _buildAnimalCard(Animal animal) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(24),
          onTap: () => Get.toNamed(Routes.ANIMAL_DETAIL, arguments: animal.id),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Hero(
                  tag: 'animal_image_${animal.id}',
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade100,
                      borderRadius: BorderRadius.circular(18),
                      image: animal.imageUrl != null
                          ? DecorationImage(image: NetworkImage(animal.imageUrl!), fit: BoxFit.cover)
                          : null,
                    ),
                    child: animal.imageUrl == null
                        ? Icon(_getSpeciesIcon(animal.species), 
                            color: _getSpeciesColor(animal.species), size: 36)
                        : null,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(animal.animalCode ?? 'TAG-000',
                              style: GoogleFonts.poppins(
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                                color: Colors.blueGrey.shade900,
                              )),
                          _buildStatusBadge(animal.healthStatus),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text('${animal.species?.capitalizeFirst} • ${animal.breed}',
                          style: GoogleFonts.poppins(
                            fontSize: 14,
                            color: Colors.blueGrey.shade600,
                          )),
                      const SizedBox(height: 6),
                      Row(
                        children: [
                          Icon(Icons.monitor_weight_outlined, size: 14, color: Colors.blueGrey.shade400),
                          const SizedBox(width: 4),
                          Text('${animal.weightKg ?? "N/A"} kg',
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: Colors.blueGrey.shade400,
                              )),
                          const SizedBox(width: 12),
                          Icon(Icons.calendar_today_outlined, size: 14, color: Colors.blueGrey.shade400),
                          const SizedBox(width: 4),
                          Text(animal.dob != null 
                            ? DateFormat('MMM yyyy').format(animal.dob!) 
                            : 'N/A',
                              style: GoogleFonts.poppins(
                                fontSize: 12,
                                color: Colors.blueGrey.shade400,
                              )),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String? status) {
    bool isHealthy = status?.toLowerCase() == 'healthy';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: isHealthy ? Colors.green.shade50 : Colors.orange.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isHealthy ? Colors.green.shade100 : Colors.orange.shade100),
      ),
      child: Text(
        status?.toUpperCase() ?? 'UNKNOWN',
        style: GoogleFonts.poppins(
          fontSize: 10,
          color: isHealthy ? Colors.green.shade700 : Colors.orange.shade800,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildSpeciesFilter() {
    final List<Map<String, dynamic>> categories = [
      {'id': 'all', 'label': 'All', 'icon': Icons.grid_view_rounded},
      {'id': 'cow', 'label': 'Cows', 'icon': Icons.pets_rounded},
      {'id': 'buffalo', 'label': 'Buffaloes', 'icon': Icons.pets_outlined},
      {'id': 'goat', 'label': 'Goats', 'icon': Icons.cruelty_free_rounded},
      {'id': 'sheep', 'label': 'Sheep', 'icon': Icons.cruelty_free_outlined},
      {'id': 'fishery', 'label': 'Fishery', 'icon': Icons.water_rounded},
      {'id': 'other', 'label': 'Others', 'icon': Icons.more_horiz_rounded},
    ];

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Obx(() => Row(
            children: categories.map<Widget>((cat) {
              return CategoryTile(
                label: cat['label'],
                icon: cat['icon'],
                isSelected: controller.selectedSpecies.value == cat['id'],
                onTap: () {
                  controller.selectedSpecies.value = cat['id'];
                },
                activeColor: Colors.white,
                textColor: controller.selectedSpecies.value == cat['id'] 
                  ? Colors.green.shade700 
                  : Colors.white.withOpacity(0.9),
                tileColor: controller.selectedSpecies.value == cat['id'] 
                  ? Colors.white 
                  : Colors.white.withOpacity(0.15),
              );
            }).toList(),
          )),
    );
  }

  Color _getSpeciesColor(String? species) {
    switch (species?.toLowerCase()) {
      case 'cow': return Colors.brown;
      case 'buffalo': return Colors.black87;
      case 'fishery': return Colors.blue;
      case 'goat': return Colors.orange.shade700;
      case 'sheep': return Colors.blueGrey;
      default: return Colors.green;
    }
  }

  IconData _getSpeciesIcon(String? species) {
    switch (species?.toLowerCase()) {
      case 'fishery': return Icons.water;
      case 'goat':
      case 'sheep': return Icons.cruelty_free;
      default: return Icons.pets;
    }
  }

  void _showAddAnimalDialog(BuildContext context) {
    final codeCtrl = TextEditingController();
    final breedCtrl = TextEditingController();
    final weightCtrl = TextEditingController();
    final species = 'cow'.obs;
    final purpose = 'milk'.obs;

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Register Animal', style: GoogleFonts.poppins(fontSize: 24, fontWeight: FontWeight.bold)),
              const SizedBox(height: 20),
              GestureDetector(
                onTap: () => _showImageSourceSheet(context),
                child: Obx(() => Container(
                  height: 120,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.grey.shade200, width: 2),
                  ),
                  child: controller.selectedImage.value != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(20),
                          child: Image.file(controller.selectedImage.value!, fit: BoxFit.cover),
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_a_photo_outlined, size: 32, color: Colors.green.shade700),
                            const SizedBox(height: 8),
                            Text('Upload Image', style: GoogleFonts.poppins(color: Colors.green.shade700, fontWeight: FontWeight.w500)),
                          ],
                        ),
                )),
              ),
              const SizedBox(height: 20),
              _buildFieldLabel('Species'),
              Obx(() => Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: species.value,
                    isExpanded: true,
                    items: ['cow', 'buffalo', 'goat', 'sheep', 'fishery', 'other']
                        .map((e) => DropdownMenuItem(value: e, child: Text(e.capitalizeFirst!)))
                        .toList(),
                    onChanged: (val) => species.value = val!,
                  ),
                ),
              )),
              const SizedBox(height: 16),
              _buildModernTextField(codeCtrl, 'Animal Code (Tag #)', Icons.tag),
              const SizedBox(height: 16),
              _buildModernTextField(breedCtrl, 'Breed', Icons.category_outlined),
              const SizedBox(height: 16),
              _buildModernTextField(weightCtrl, 'Weight (kg)', Icons.monitor_weight_outlined, isNumber: true),
              const SizedBox(height: 16),
              _buildFieldLabel('Purpose'),
              Obx(() => Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: purpose.value,
                    isExpanded: true,
                    items: ['milk', 'draught', 'breeding', 'aquaculture', 'other']
                        .map((e) => DropdownMenuItem(value: e, child: Text(e.capitalizeFirst!)))
                        .toList(),
                    onChanged: (val) => purpose.value = val!,
                  ),
                ),
              )),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: Obx(() => ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green.shade700,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                    elevation: 0,
                  ),
                  onPressed: controller.isUploading.value ? null : () {
                    controller.registerAnimal(Animal(
                      animalCode: codeCtrl.text,
                      species: species.value,
                      breed: breedCtrl.text,
                      weightKg: double.tryParse(weightCtrl.text),
                      purpose: purpose.value,
                      healthStatus: 'Healthy',
                      dob: DateTime.now(),
                    ));
                  },
                  child: controller.isUploading.value 
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text('Register Animal', style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
                )),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(label, style: GoogleFonts.poppins(fontWeight: FontWeight.w500, color: Colors.blueGrey.shade700)),
    );
  }

  Widget _buildModernTextField(TextEditingController ctrl, String hint, IconData icon, {bool isNumber = false}) {
    return TextField(
      controller: ctrl,
      keyboardType: isNumber ? TextInputType.number : TextInputType.text,
      decoration: InputDecoration(
        hintText: hint,
        prefixIcon: Icon(icon, color: Colors.green.shade700),
        filled: true,
        fillColor: Colors.grey.shade50,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: BorderSide(color: Colors.green.shade700, width: 2),
        ),
      ),
    );
  }

  void _showImageSourceSheet(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Select Image Source', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildSourceOption(Icons.camera_alt_rounded, 'Camera', () {
                  Get.back();
                  controller.pickImage(ImageSource.camera);
                }),
                _buildSourceOption(Icons.photo_library_rounded, 'Gallery', () {
                  Get.back();
                  controller.pickImage(ImageSource.gallery);
                }),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  Widget _buildSourceOption(IconData icon, String label, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, color: Colors.green.shade700, size: 32),
          ),
          const SizedBox(height: 8),
          Text(label, style: GoogleFonts.poppins(fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
