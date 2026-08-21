import 'dart:io';
import 'package:dio/dio.dart' as dio_client;
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../routes/app_pages.dart';
import '../../../core/values/constants.dart';

class AuthController extends GetxController {
  final SupabaseClient _supabase = Supabase.instance.client;
  final dio_client.Dio _dio = dio_client.Dio();

  final Rx<User?> currentUser = Rx<User?>(null);
  final RxMap<String, dynamic> userProfile = <String, dynamic>{}.obs;
  final RxBool isLoading = false.obs;
  final RxString selectedRole = 'farmer'.obs;

  @override
  void onInit() {
    super.onInit();
    currentUser.value = _supabase.auth.currentUser;
    _supabase.auth.onAuthStateChange.listen((data) {
      currentUser.value = data.session?.user;
      if (data.session?.user != null) {
        fetchUserProfile(data.session!.user.id);
      } else {
        userProfile.clear();
      }
    });
  }

  Future<void> fetchUserProfile(String userId) async {
    try {
      final data = await _supabase
          .from('users')
          .select()
          .eq('id', userId)
          .single();
      userProfile.assignAll(data);
    } catch (e) {
      Get.log("Error fetching profile: $e");
    }
  }

  Future<void> signUpWithEmail({
    required String email,
    required String password,
    required String fullName,
    required String role,
    required String phone,
    String? avatarUrl,
  }) async {
    try {
      isLoading.value = true;
      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {
          'full_name': fullName,
          'role': role,
          'phone': phone,
          'avatar_url': avatarUrl,
        },
      );

      if (response.user != null) {
        Get.snackbar("Success", "Account created! Please verify your email.");
        Get.offAllNamed(Routes.LOGIN);
      }
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signInWithEmail(String email, String password) async {
    try {
      isLoading.value = true;
      await _supabase.auth.signInWithPassword(email: email, password: password);
      Get.offAllNamed(Routes.DASHBOARD);
    } catch (e) {
      Get.snackbar("Login Failed", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signInWithPhoneOTP(String phone) async {
    try {
      isLoading.value = true;
      await _supabase.auth.signInWithOtp(phone: phone);
      Get.snackbar("OTP Sent", "Check your messages for the verification code.");
    } catch (e) {
      Get.snackbar("Error", e.toString());
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> verifyPhoneOTP(String phone, String token) async {
    try {
      isLoading.value = true;
      await _supabase.auth.verifyOTP(
        phone: phone,
        token: token,
        type: OtpType.sms,
      );
      Get.offAllNamed(Routes.DASHBOARD);
    } catch (e) {
      Get.snackbar("Verification Failed", e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signInWithGoogle() async {
    try {
      isLoading.value = true;
      await _supabase.auth.signInWithOAuth(OAuthProvider.google);
      Get.offAllNamed(Routes.DASHBOARD);
    } catch (e) {
      Get.log("OAuth Note: $e");
      Get.offAllNamed(Routes.DASHBOARD);
    } finally {
      isLoading.value = false;
    }
  }

  Future<String?> uploadProfileAvatar(File imageFile) async {
    try {
      isLoading.value = true;
      String url = "https://api.cloudinary.com/v1_1/${constants.cloudName}/image/upload";
      
      dio_client.FormData formData = dio_client.FormData.fromMap({
        "file": await dio_client.MultipartFile.fromFile(imageFile.path),
        "upload_preset": constants.uploadPreset,
      });

      final response = await _dio.post(url, data: formData);
      String imageUrl = response.data['secure_url'];

      if (currentUser.value != null) {
        await _supabase
            .from('users')
            .update({'avatar_url': imageUrl})
            .eq('id', currentUser.value!.id);
        userProfile['avatar_url'] = imageUrl;
      }
      
      return imageUrl;
    } catch (e) {
      Get.snackbar("Upload Error", "Failed to upload image to Cloudinary");
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signOut() async {
    try {
      isLoading.value = true;
      await _supabase.auth.signOut();
      
      // Clear all state
      currentUser.value = null;
      userProfile.clear();
      selectedRole.value = 'farmer';
      
      Get.offAllNamed(Routes.LOGIN);
    } catch (e) {
      Get.snackbar("Logout Error", e.toString(), snackPosition: SnackPosition.BOTTOM);
    } finally {
      isLoading.value = false;
    }
  }
}
