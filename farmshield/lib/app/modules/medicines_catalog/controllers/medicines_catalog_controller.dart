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
    final strengthController = TextEditingController();
    final classController = TextEditingController();
    final withdrawalController = TextEditingController();
    final mrlController = TextEditingController();
    File? selectedImage;

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Add New Medicine & Rule', 
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              TextField(controller: nameController, decoration: const InputDecoration(labelText: 'Brand Name')),
              TextField(controller: ingredientController, decoration: const InputDecoration(labelText: 'Active Ingredient')),
              TextField(controller: classController, decoration: const InputDecoration(labelText: 'Antimicrobial Class')),
              TextField(controller: strengthController, decoration: const InputDecoration(labelText: 'Strength')),
              TextField(controller: withdrawalController, decoration: const InputDecoration(labelText: 'Withdrawal Days (Milk)'), keyboardType: TextInputType.number),
              TextField(controller: mrlController, decoration: const InputDecoration(labelText: 'MRL (µg/kg)'), keyboardType: TextInputType.number),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () async {
                  final XFile? image = await _picker.pickImage(source: ImageSource.gallery);
                  if (image != null) {
                    selectedImage = File(image.path);
                  }
                },
                icon: const Icon(Icons.image),
                label: const Text('Select Package Image'),
              ),
              const SizedBox(height: 20),
              Obx(() => ElevatedButton(
                onPressed: isLoading.value ? null : () async {
                  await _saveMedicine(
                    nameController.text,
                    ingredientController.text,
                    classController.text,
                    strengthController.text,
                    int.tryParse(withdrawalController.text) ?? 0,
                    double.tryParse(mrlController.text) ?? 0,
                    selectedImage,
                  );
                  Get.back();
                },
                child: isLoading.value 
                  ? const CircularProgressIndicator() 
                  : const Text('Save & Publish Rule'),
              )),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
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
      String cloudName = "dvk9n7bnd"; // Example/Placeholder cloud name
      String uploadPreset = "farmshield_preset";
      
      final formData = dio.FormData.fromMap({
        "file": await dio.MultipartFile.fromFile(file.path),
        "upload_preset": uploadPreset,
      });

      final response = await dio.Dio().post(
        "https://api.cloudinary.com/v1_1/$cloudName/image/upload",
        data: formData,
      );

      return response.data["secure_url"];
    } catch (e) {
      print("Cloudinary Upload Error: $e");
      return null;
    }
  }
}
