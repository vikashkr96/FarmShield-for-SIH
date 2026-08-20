import 'dart:io';
import 'package:dio/dio.dart' as dio_client;
import 'package:get/get.dart';
import 'package:image_picker/image_picker.dart';
import '../../../data/repositories/farm_repository.dart';

class LabResultsController extends GetxController {
  final FarmRepository repository;
  LabResultsController({required this.repository});

  final isLoading = false.obs;
  final Rx<File?> selectedFile = Rx<File?>(null);
  final dio_client.Dio _dio = dio_client.Dio();

  // Cloudinary constants - using placeholders as per project patterns
  final String cloudName = "dly88888"; // Replace with actual or pull from constants if available
  final String uploadPreset = "farmshield_preset";

  Future<void> pickCertificate() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery, imageQuality: 70);
    if (pickedFile != null) {
      selectedFile.value = File(pickedFile.path);
    }
  }

  Future<String?> _uploadToCloudinary(File file) async {
    try {
      String url = "https://api.cloudinary.com/v1_1/$cloudName/image/upload";
      dio_client.FormData formData = dio_client.FormData.fromMap({
        "file": await dio_client.MultipartFile.fromFile(file.path),
        "upload_preset": uploadPreset,
      });
      final response = await _dio.post(url, data: formData);
      return response.data['secure_url'];
    } catch (e) {
      Get.snackbar("Upload Error", "Failed to upload certificate to Cloudinary");
      return null;
    }
  }

  Future<void> submitLabResults(Map<String, dynamic> data) async {
    isLoading.value = true;
    try {
      String? fileUrl;
      if (selectedFile.value != null) {
        fileUrl = await _uploadToCloudinary(selectedFile.value!);
      }
      
      final payload = {
        ...data,
        'lab_report_pdf_url': fileUrl,
      };

      await repository.submitLabResults(payload);
      Get.back();
      Get.snackbar('Success', 'Lab results recorded successfully');
    } catch (e) {
      Get.snackbar('Error', 'Failed to record lab results: $e');
    } finally {
      isLoading.value = false;
    }
  }
}
