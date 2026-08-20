import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../data/models/farm_models.dart';
import '../controllers/livestock_controller.dart';

class LivestockView extends GetView<LivestockController> {
  const LivestockView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Livestock Inventory', style: GoogleFonts.poppins()),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
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
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: CircleAvatar(
                        backgroundColor: _getSpeciesColor(animal.species),
                        child: Icon(_getSpeciesIcon(animal.species), color: Colors.white),
                      ),
                      title: Text(animal.animalCode ?? 'Unknown ID',
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text('${animal.breed} • ${animal.healthStatus}'),
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
        title: const Text('Register New Animal'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Obx(() => DropdownButtonFormField<String>(
                value: species.value,
                decoration: const InputDecoration(labelText: 'Species'),
                items: ['cow', 'buffalo', 'goat', 'sheep', 'fishery']
                    .map((e) => DropdownMenuItem(value: e, child: Text(e.capitalizeFirst!)))
                    .toList(),
                onChanged: (val) => species.value = val!,
              )),
              TextField(controller: codeCtrl, decoration: const InputDecoration(labelText: 'Animal Code (Tag #)')),
              TextField(controller: breedCtrl, decoration: const InputDecoration(labelText: 'Breed')),
              TextField(controller: weightCtrl, decoration: const InputDecoration(labelText: 'Weight (kg)'), keyboardType: TextInputType.number),
              Obx(() => DropdownButtonFormField<String>(
                value: purpose.value,
                decoration: const InputDecoration(labelText: 'Purpose'),
                items: ['milk', 'draught', 'breeding', 'aquaculture']
                    .map((e) => DropdownMenuItem(value: e, child: Text(e.capitalizeFirst!)))
                    .toList(),
                onChanged: (val) => purpose.value = val!,
              )),
            ],
          ),
        ),
        actions: [
          TextButton(onPressed: () => Get.back(), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              controller.registerAnimal(Animal(
                animalCode: codeCtrl.text,
                species: species.value,
                breed: breedCtrl.text,
                weightKg: double.tryParse(weightCtrl.text),
                purpose: purpose.value,
                dob: DateTime.now(), // Simplified
              ));
            },
            child: const Text('Register'),
          ),
        ],
      ),
    );
  }
}
