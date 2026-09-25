import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:dio/dio.dart' as dio;
import '../../../data/models/farm_models.dart';
import '../../../core/values/constants.dart';

class MedicinesCatalogController extends GetxController {
  final _supabase = Supabase.instance.client;
  final _picker = ImagePicker();
  
  var isLoading = false.obs;
  var medicines = <Medicine>[].obs;
  
  var searchQuery = ''.obs;
  var selectedClass = 'All'.obs;
  final antimicrobialClasses = ['All', 'Penicillins', 'Tetracyclines', 'Fluoroquinolones (CIA)'];

  @override
  void onInit() {
    super.onInit();
    fetchMedicines();
  }

  Future<void> fetchMedicines() async {
    try {
      isLoading.value = true;
      final response = await _supabase
          .from('medicines')
          .select('*, regulatory_rules(*)')
          .order('name', ascending: true);

      final List data = response as List;
      medicines.value = data.map((e) => Medicine.fromJson(e)).toList();
    } catch (e) {
      Get.snackbar('Error', 'Failed to fetch medicines: $e');
    } finally {
      isLoading.value = false;
    }
  }

  List<Medicine> get filteredMedicines {
    return medicines.where((m) {
      final matchesSearch = (m.name?.toLowerCase().contains(searchQuery.value.toLowerCase()) ?? false) ||
          (m.activeIngredient?.toLowerCase().contains(searchQuery.value.toLowerCase()) ?? false);
      
      final matchesClass = selectedClass.value == 'All' || 
          m.antimicrobialClass == selectedClass.value;
          
      return matchesSearch && matchesClass;
    }).toList();
  }

  bool isCIA(String? drugClass) {
    if (drugClass == null) return false;
    return drugClass.contains('(CIA)') || 
           drugClass.toLowerCase().contains('fluoroquinolones') ||
           drugClass.toLowerCase().contains('3rd generation cephalosporins');
  }

  Future<void> showAddMedicineSheet() async {
    final nameController = TextEditingController();
    final ingredientController = TextEditingController();
    final strengthController = TextEditingController(text: '100 mg/ml');
    final withdrawalController = TextEditingController(text: '3');
    final mrlController = TextEditingController(text: '50.0');
    final selectedClassLocal = 'Penicillins'.obs;
    final Rx<File?> selectedImage = Rx<File?>(null);

    final classesList = [
      'Penicillins',
      'Tetracyclines',
      'Fluoroquinolones (CIA)',
      '3rd Gen Cephalosporins',
      'Macrolides / Aminoglycosides',
    ];

    Get.bottomSheet(
      Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag bar
              Center(
                child: Container(
                  width: 44,
                  height: 4.5,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Title Header
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(Icons.add_moderator_rounded, color: Color(0xFF1B5E20), size: 22),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        'Add Medicine & MRL Rule',
                        style: TextStyle(fontSize: 16.5, fontWeight: FontWeight.bold, color: Colors.blueGrey.shade900),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () => Get.back(),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // 1. Formulation
              _buildSheetInput(nameController, 'Brand Name', 'e.g. VetMox Forte 15%', Icons.medication_rounded),
              const SizedBox(height: 10),
              _buildSheetInput(ingredientController, 'Active Ingredient / Molecule', 'e.g. Amoxicillin Trihydrate', Icons.science_outlined),
              const SizedBox(height: 10),
              _buildSheetInput(strengthController, 'Strength / Concentration', 'e.g. 150 mg/ml or 20% LA', Icons.speed_rounded),
              const SizedBox(height: 14),

              // Antimicrobial Class Chips
              Text('Antimicrobial Category', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.blueGrey.shade700)),
              const SizedBox(height: 6),
              Obx(() => Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: classesList.map((c) {
                      final isSelected = selectedClassLocal.value == c;
                      return ChoiceChip(
                        label: Text(c, style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.w500)),
                        selected: isSelected,
                        onSelected: (val) {
                          if (val) selectedClassLocal.value = c;
                        },
                        selectedColor: const Color(0xFF1B5E20),
                        backgroundColor: const Color(0xFFF8FAFC),
                        side: BorderSide(color: isSelected ? const Color(0xFF1B5E20) : Colors.grey.shade300),
                        labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.blueGrey.shade800),
                      );
                    }).toList(),
                  )),
              const SizedBox(height: 14),

              // 2. Withdrawal & MRL Row
              Row(
                children: [
                  Expanded(
                    child: _buildSheetInput(
                      withdrawalController,
                      'Withdrawal (Days)',
                      '3',
                      Icons.timer_outlined,
                      keyboardType: TextInputType.number,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildSheetInput(
                      mrlController,
                      'MRL (µg/kg)',
                      '50.0',
                      Icons.gavel_rounded,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 14),

              // 3. Image Picker Tile
              Obx(() => Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF8FAFC),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade200,
                            borderRadius: BorderRadius.circular(10),
                            image: selectedImage.value != null
                                ? DecorationImage(image: FileImage(selectedImage.value!), fit: BoxFit.cover)
                                : null,
                          ),
                          child: selectedImage.value == null
                              ? const Icon(Icons.image_outlined, color: Colors.blueGrey, size: 24)
                              : null,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                selectedImage.value != null ? 'Package Photo Selected' : 'Medicine Package Photo',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                              ),
                              Text(
                                selectedImage.value != null ? 'Ready to upload' : 'Optional label & box photo',
                                style: TextStyle(color: Colors.blueGrey.shade500, fontSize: 10.5),
                              ),
                            ],
                          ),
                        ),
                        TextButton.icon(
                          onPressed: () async {
                            final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
                            if (image != null) {
                              selectedImage.value = File(image.path);
                            }
                          },
                          icon: const Icon(Icons.upload_rounded, size: 16),
                          label: Text(selectedImage.value == null ? 'Select' : 'Change', style: const TextStyle(fontSize: 12)),
                          style: TextButton.styleFrom(foregroundColor: const Color(0xFF1B5E20)),
                        ),
                      ],
                    ),
                  )),
              const SizedBox(height: 20),

              // 4. Submit Button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: Obx(() => ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF1B5E20),
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        elevation: 0,
                      ),
                      onPressed: isLoading.value
                          ? null
                          : () async {
                              if (nameController.text.trim().isEmpty || ingredientController.text.trim().isEmpty) {
                                Get.snackbar('Error', 'Brand name and active ingredient are required');
                                return;
                              }
                              await _saveMedicine(
                                nameController.text.trim(),
                                ingredientController.text.trim(),
                                selectedClassLocal.value,
                                strengthController.text.trim(),
                                int.tryParse(withdrawalController.text.trim()) ?? 3,
                                double.tryParse(mrlController.text.trim()) ?? 50.0,
                                selectedImage.value,
                              );
                              Get.back();
                            },
                      child: isLoading.value
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                          : const Text('SAVE & PUBLISH REGULATORY RULE', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 0.3)),
                    )),
              ),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  Widget _buildSheetInput(
    TextEditingController controller,
    String label,
    String hint,
    IconData icon, {
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      style: const TextStyle(fontSize: 13),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(fontSize: 12, color: Colors.blueGrey.shade600),
        hintText: hint,
        hintStyle: TextStyle(fontSize: 12, color: Colors.blueGrey.shade300),
        prefixIcon: Icon(icon, color: const Color(0xFF1B5E20), size: 18),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF1B5E20), width: 1.5)),
      ),
    );
  }

  Future<void> _saveMedicine(
    String name, 
    String ingredient, 
    String drugClass, 
    String strength,
    int withdrawalDays,
    double mrl,
    File? imageFile,
  ) async {
    try {
      isLoading.value = true;
      String? imageUrl;

      if (imageFile != null) {
        imageUrl = await _uploadToCloudinary(imageFile);
      }

      // 1. Insert Medicine
      final medicineResponse = await _supabase.from('medicines').insert({
        'name': name,
        'active_ingredient': ingredient,
        'antimicrobial_class': drugClass,
        'strength': strength,
        'status': 'Approved',
        'image_url': imageUrl,
      }).select().single();

      final medicineId = medicineResponse['id'];

      // 2. Insert Regulatory Rule (FSSAI Default)
      await _supabase.from('regulatory_rules').insert({
        'medicine_id': medicineId,
        'species': 'Cattle',
        'product': 'Milk',
        'mrl': mrl,
        'withdrawal_days': withdrawalDays,
        'jurisdiction': 'FSSAI',
        'source': 'FSSAI Gazette Notification',
        'version': '2024.1',
        'approval_status': 'Active',
      });

      await fetchMedicines();
      Get.snackbar('Success', 'Medicine and Rule published successfully');
    } catch (e) {
      Get.snackbar('Error', 'Failed to save: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<String?> _uploadToCloudinary(File file) async {
    try {
      final formData = dio.FormData.fromMap({
        "file": await dio.MultipartFile.fromFile(file.path),
        "upload_preset": constants.uploadPreset,
      });

      final response = await dio.Dio().post(
        "https://api.cloudinary.com/v1_1/${constants.cloudName}/image/upload",
        data: formData,
      );

      return response.data["secure_url"];
    } catch (e) {
      Get.log("Cloudinary Upload Error: $e");
      return null;
    }
  }
}
