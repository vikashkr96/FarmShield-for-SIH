import 'dart:io';
import 'package:dio/dio.dart' as dio_client;
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/repositories/farm_repository.dart';
import '../../../core/values/constants.dart';

class LivestockController extends GetxController with StateMixin<List<Animal>> {
  final FarmRepository repository;
  LivestockController({required this.repository});

  final selectedSpecies = 'all'.obs;
  final Rx<File?> selectedImage = Rx<File?>(null);
  final RxBool isUploading = false.obs;
  final dio_client.Dio _dio = dio_client.Dio();

  @override
  void onInit() {
    super.onInit();
    fetchAnimals();
  }

  Future<void> fetchAnimals() async {
    change(null, status: RxStatus.loading());
    try {
      final species = selectedSpecies.value == 'all' ? null : selectedSpecies.value;
      final animals = await repository.getAnimals(species: species);
      change(animals, status: RxStatus.success());
    } catch (e) {
      change(null, status: RxStatus.error(e.toString()));
    }
  }

  Future<void> pickImage(ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: source, imageQuality: 50);
    if (pickedFile != null) {
      selectedImage.value = File(pickedFile.path);
    }
  }

  Future<String?> uploadToCloudinary(File file) async {
    try {
      isUploading.value = true;
      String url = "https://api.cloudinary.com/v1_1/${constants.cloudName}/image/upload";
      
      dio_client.FormData formData = dio_client.FormData.fromMap({
        "file": await dio_client.MultipartFile.fromFile(file.path),
        "upload_preset": constants.uploadPreset,
      });

      final response = await _dio.post(url, data: formData);
      return response.data['secure_url'];
    } catch (e) {
      Get.snackbar("Upload Error", "Failed to upload image to Cloudinary");
      return null;
    } finally {
      isUploading.value = false;
    }
  }

  Future<void> registerAnimal(Animal animal) async {
    try {
      if (selectedImage.value != null) {
        final imageUrl = await uploadToCloudinary(selectedImage.value!);
        animal.imageUrl = imageUrl;
      }
      
      await repository.registerAnimal(animal);
      fetchAnimals();
      selectedImage.value = null;
      Get.back();
      Get.snackbar('Success', 'Animal registered successfully');
    } catch (e) {
      Get.snackbar('Error', 'Failed to register animal: $e');
    }
  }
}
