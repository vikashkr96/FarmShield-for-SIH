import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../../data/models/farm_models.dart';
import '../controllers/livestock_controller.dart';

class LivestockView extends GetView<LivestockController> {
  const LivestockView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Livestock Inventory', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.green.shade700,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_a_photo),
            onPressed: () => _showAddAnimalDialog(context),
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSpeciesFilter(),
          Expanded(
            child: controller.obx(
              (animals) => ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: animals?.length ?? 0,
                itemBuilder: (context, index) {
                  final animal = animals![index];
                  return Card(
                    elevation: 2,
                    margin: const EdgeInsets.only(bottom: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: ListTile(
                      contentPadding: const EdgeInsets.all(12),
                      leading: Container(
                        width: 60,
                        height: 60,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(8),
                          image: animal.imageUrl != null
                              ? DecorationImage(image: NetworkImage(animal.imageUrl!), fit: BoxFit.cover)
                              : null,
                        ),
                        child: animal.imageUrl == null
                            ? Icon(_getSpeciesIcon(animal.species), color: _getSpeciesColor(animal.species))
                            : null,
                      ),
                      title: Text(animal.animalCode ?? 'Unknown ID',
                          style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
                      subtitle: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('${animal.species?.capitalizeFirst} • ${animal.breed}'),
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: animal.healthStatus == 'Healthy' ? Colors.green.shade100 : Colors.orange.shade100,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              animal.healthStatus ?? 'Unknown',
                              style: TextStyle(
                                fontSize: 10,
                                color: animal.healthStatus == 'Healthy' ? Colors.green.shade800 : Colors.orange.shade800,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () {
                        // Navigate to detail if needed
                      },
                    ),
                  );
                },
              ),
              onLoading: const Center(child: CircularProgressIndicator()),
              onEmpty: const Center(child: Text('No animals found')),
              onError: (err) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSpeciesFilter() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Obx(() => Row(
            children: [
              'all',
              'cow',
              'buffalo',
              'goat',
              'sheep',
              'fishery'
            ].map((species) {
              final isSelected = controller.selectedSpecies.value == species;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(species.capitalizeFirst!),
                  selected: isSelected,
                  selectedColor: Colors.green.shade700,
                  labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black),
                  onSelected: (val) {
                    controller.selectedSpecies.value = species;
                    controller.fetchAnimals();
                  },
                ),
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
      default: return Colors.green;
    }
  }

  IconData _getSpeciesIcon(String? species) {
    switch (species?.toLowerCase()) {
      case 'fishery': return Icons.water;
      default: return Icons.pets;
    }
  }

  void _showAddAnimalDialog(BuildContext context) {
    final codeCtrl = TextEditingController();
    final breedCtrl = TextEditingController();
    final weightCtrl = TextEditingController();
    final species = 'cow'.obs;
    final purpose = 'milk'.obs;

    Get.dialog(
      AlertDialog(
        title: Text('Register New Animal', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              GestureDetector(
                onTap: () => _showImageSourceSheet(context),
                child: Obx(() => Container(
                  height: 150,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: controller.selectedImage.value != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.file(controller.selectedImage.value!, fit: BoxFit.cover),
                        )
                      : const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.add_a_photo, size: 40, color: Colors.grey),
                            SizedBox(height: 8),
                            Text('Add Animal Photo', style: TextStyle(color: Colors.grey)),
                          ],
                        ),
                )),
              ),
              const SizedBox(height: 16),
              Obx(() => DropdownButtonFormField<String>(
                value: species.value,
                decoration: const InputDecoration(labelText: 'Species', border: OutlineInputBorder()),
                items: ['cow', 'buffalo', 'goat', 'sheep', 'fishery']
                    .map((e) => DropdownMenuItem(value: e, child: Text(e.capitalizeFirst!)))
                    .toList(),
                onChanged: (val) => species.value = val!,
              )),
              const SizedBox(height: 12),
              TextField(controller: codeCtrl, decoration: const InputDecoration(labelText: 'Animal Code (Tag #)', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: breedCtrl, decoration: const InputDecoration(labelText: 'Breed', border: OutlineInputBorder())),
              const SizedBox(height: 12),
              TextField(controller: weightCtrl, decoration: const InputDecoration(labelText: 'Weight (kg)', border: OutlineInputBorder()), keyboardType: TextInputType.number),
              const SizedBox(height: 12),
              Obx(() => DropdownButtonFormField<String>(
                value: purpose.value,
                decoration: const InputDecoration(labelText: 'Purpose', border: OutlineInputBorder()),
                items: ['milk', 'draught', 'breeding', 'aquaculture']
                    .map((e) => DropdownMenuItem(value: e, child: Text(e.capitalizeFirst!)))
                    .toList(),
                onChanged: (val) => purpose.value = val!,
              )),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () {
            controller.selectedImage.value = null;
            Get.back();
          }, child: const Text('Cancel')),
          Obx(() => ElevatedButton(
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
                ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Register Animal'),
          )),
        ],
      ),
    );
  }

  void _showImageSourceSheet(BuildContext context) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(16),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Select Image Source', style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () {
                Get.back();
                controller.pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Gallery'),
              onTap: () {
                Get.back();
                controller.pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }
}
