import 'dart:convert';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart' hide FormData, MultipartFile;
import '../values/constants.dart';

class CloudinaryUploadResult {
  final String secureUrl;
  final String publicId;
  final String? format;
  final int? bytes;

  CloudinaryUploadResult({
    required this.secureUrl,
    required this.publicId,
    this.format,
    this.bytes,
  });
}

class CloudinaryService {
  static final CloudinaryService _instance = CloudinaryService._internal();
  factory CloudinaryService() => _instance;
  CloudinaryService._internal();

  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 45),
    receiveTimeout: const Duration(seconds: 45),
  ));

  static const int maxFileSizeInBytes = 10 * 1024 * 1024; // 10 MB limit
  static const List<String> supportedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

  /// Validates image file extension and size. Returns error string if invalid, null if valid.
  String? validateImage({
    required Uint8List bytes,
    required String fileName,
  }) {
    if (bytes.isEmpty) {
      return 'The selected image file is empty.';
    }

    if (bytes.lengthInBytes > maxFileSizeInBytes) {
      final sizeMb = (bytes.lengthInBytes / (1024 * 1024)).toStringAsFixed(1);
      return 'Image size ($sizeMb MB) exceeds the maximum allowed 10 MB limit.';
    }

    final ext = fileName.split('.').last.toLowerCase();
    if (!supportedExtensions.contains(ext)) {
      return 'Unsupported file format (.$ext). Please select a valid JPG, PNG, or WebP image.';
    }

    return null;
  }

  /// Uploads image bytes to Cloudinary using unsigned preset.
  /// Works across Mobile, Web, and Desktop.
  Future<CloudinaryUploadResult> uploadImage({
    required Uint8List bytes,
    required String fileName,
    String? folder,
  }) async {
    final validationError = validateImage(bytes: bytes, fileName: fileName);
    if (validationError != null) {
      throw Exception(validationError);
    }

    final uploadUrl = 'https://api.cloudinary.com/v1_1/${constants.cloudName}/image/upload';

    final formDataMap = <String, dynamic>{
      'file': MultipartFile.fromBytes(bytes, filename: fileName),
      'upload_preset': constants.uploadPreset,
    };

    if (folder != null && folder.isNotEmpty) {
      formDataMap['folder'] = folder;
    }

    final formData = FormData.fromMap(formDataMap);

    try {
      final response = await _dio.post(
        uploadUrl,
        data: formData,
        options: Options(
          contentType: 'multipart/form-data',
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data;
        return CloudinaryUploadResult(
          secureUrl: data['secure_url']?.toString() ?? '',
          publicId: data['public_id']?.toString() ?? '',
          format: data['format']?.toString(),
          bytes: data['bytes'] is int ? data['bytes'] : null,
        );
      } else {
        throw Exception('Cloudinary upload responded with status ${response.statusCode}');
      }
    } on DioException catch (dioErr) {
      Get.log('Cloudinary DioException: ${dioErr.response?.data ?? dioErr.message}');
      final msg = dioErr.response?.data?['error']?['message'] ?? dioErr.message;
      throw Exception('Failed to upload image to Cloudinary: $msg');
    } catch (e) {
      Get.log('Cloudinary upload error: $e');
      throw Exception('Failed to upload photo: $e');
    }
  }

  /// Safely destroys an asset in Cloudinary using signed destroy endpoint.
  /// Generates timestamp & SHA-1 signature.
  Future<bool> deleteImage({required String publicId}) async {
    final trimmedId = publicId.trim();
    if (trimmedId.isEmpty) return false;

    final timestamp = (DateTime.now().toUtc().millisecondsSinceEpoch ~/ 1000).toString();
    final toSign = 'public_id=$trimmedId&timestamp=$timestamp${constants.cloudinaryApiSecret}';
    final signature = sha1.convert(utf8.encode(toSign)).toString();

    final destroyUrl = 'https://api.cloudinary.com/v1_1/${constants.cloudName}/image/destroy';

    final formData = FormData.fromMap({
      'public_id': trimmedId,
      'timestamp': timestamp,
      'api_key': constants.cloudinaryApiKey,
      'signature': signature,
    });

    try {
      final response = await _dio.post(destroyUrl, data: formData);
      if (response.statusCode == 200) {
        final result = response.data?['result'];
        Get.log('Cloudinary delete result for $trimmedId: $result');
        return result == 'ok' || result == 'not found';
      }
      return false;
    } catch (e) {
      // Non-fatal: Log deletion failure so user flow is not broken
      Get.log('Cloudinary destroy warning (non-fatal): Could not delete old asset $trimmedId: $e');
      return false;
    }
  }

  /// Extracts the Cloudinary public_id from a Cloudinary URL if available.
  String? extractPublicIdFromUrl(String? url) {
    if (url == null || url.isEmpty || !url.contains('cloudinary.com')) {
      return null;
    }

    try {
      final uri = Uri.parse(url);
      final pathSegments = uri.pathSegments;
      final uploadIndex = pathSegments.indexOf('upload');
      if (uploadIndex == -1 || uploadIndex >= pathSegments.length - 1) {
        return null;
      }

      // Collect everything after 'upload' (and optional version /v12345/ and transform flags)
      final relevantSegments = pathSegments.sublist(uploadIndex + 1);
      final idSegments = relevantSegments.where((s) => !RegExp(r'^v\d+$').hasMatch(s)).toList();

      if (idSegments.isEmpty) return null;

      final fullIdWithExt = idSegments.join('/');
      // Strip file extension
      final lastDotIndex = fullIdWithExt.lastIndexOf('.');
      if (lastDotIndex != -1) {
        return fullIdWithExt.substring(0, lastDotIndex);
      }
      return fullIdWithExt;
    } catch (_) {
      return null;
    }
  }
}
