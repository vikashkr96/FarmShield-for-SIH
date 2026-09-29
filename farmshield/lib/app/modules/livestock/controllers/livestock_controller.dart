import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../core/services/cloudinary_service.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/models/health_models.dart';
import '../../../data/repositories/farm_repository.dart';

class LivestockController extends GetxController with StateMixin<List<Animal>> {
  final FarmRepository repository;
  LivestockController({required this.repository});

  final selectedSpecies = 'all'.obs;
  final herdSummary = Rxn<HerdHealthSummary>();
  final Rx<Uint8List?> selectedImageBytes = Rx<Uint8List?>(null);
  String? selectedImageName;
  final RxBool isUploading = false.obs;
  final CloudinaryService _cloudinary = CloudinaryService();

  @override
  void onInit() {
    super.onInit();
    // Reactively fetch animals when selected species changes
    ever(selectedSpecies, (_) => fetchAnimals());
    fetchAnimals();
  }

  Future<void> fetchAnimals() async {
    change(null, status: RxStatus.loading());
    try {
      final selected = selectedSpecies.value.toLowerCase().trim();
      final allAnimals = await repository.getAnimals();
      List<Animal> animals;

      if (selected == 'all') {
        animals = allAnimals;
      } else if (selected == 'other') {
        final knownSpecies = ['cow', 'buffalo', 'goat', 'sheep', 'fishery'];
        animals = allAnimals.where((a) => 
          a.species == null || 
          a.species!.toLowerCase() == 'other' || 
          !knownSpecies.contains(a.species!.toLowerCase().trim())
        ).toList();
      } else {
        animals = allAnimals.where((a) => 
          a.species != null && 
          a.species!.toLowerCase().trim() == selected
        ).toList();
      }
      
      if (animals.isEmpty) {
        change([], status: RxStatus.empty());
      } else {
        change(animals, status: RxStatus.success());
      }

      // Fetch herd health analytics
      try {
        final summary = await repository.getHerdHealthSummary(
          species: selected == 'all' ? null : selected,
        );
        herdSummary.value = summary;
      } catch (_) {}
    } catch (e) {
      Get.log("Fetch Animals Error: $e");
      change(null, status: RxStatus.error(e.toString()));
    }
  }

  Future<void> pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 70);
    if (pickedFile != null) {
      final bytes = await pickedFile.readAsBytes();
      selectedImageBytes.value = bytes;
      selectedImageName = pickedFile.name;
    }
  }

  Future<String?> uploadToCloudinary(Uint8List bytes, String fileName) async {
    try {
      isUploading.value = true;
      final result = await _cloudinary.uploadImage(
        bytes: bytes,
        fileName: fileName,
        folder: 'animals',
      );
      return result.secureUrl;
    } catch (e) {
      Get.snackbar("Upload Error", "Failed to upload image to Cloudinary: $e");
      return null;
    } finally {
      isUploading.value = false;
    }
  }

  Future<void> registerAnimal(Animal animal) async {
    try {
      isUploading.value = true;
      if (selectedImageBytes.value != null && selectedImageName != null) {
        final imageUrl = await uploadToCloudinary(selectedImageBytes.value!, selectedImageName!);
        animal.imageUrl = imageUrl;
      }
      
      await repository.registerAnimal(animal);
      fetchAnimals(); // Refresh the list
      selectedImageBytes.value = null;
      selectedImageName = null;
      Get.back();
      Get.snackbar('Success', 'Animal registered successfully', 
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: Colors.green,
        colorText: Colors.white);
    } catch (e) {
      Get.snackbar('Error', 'Failed to register animal: $e');
    } finally {
      isUploading.value = false;
    }
  }
}
