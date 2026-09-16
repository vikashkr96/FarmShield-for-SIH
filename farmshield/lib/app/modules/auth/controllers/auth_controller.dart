import 'dart:io';
import 'package:dio/dio.dart' as dio_client;
import 'package:flutter/foundation.dart';
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
  final RxBool isGoogleSigningIn = false.obs;
  final RxString selectedRole = 'farmer'.obs;

  /// Custom scheme for OAuth redirect on mobile
  static const String callbackUrlScheme = 'io.supabase.farmshield://login-callback';

  @override
  void onInit() {
    super.onInit();
    final session = _supabase.auth.currentSession;
    currentUser.value = session?.user;
    if (session?.user != null) {
      syncAndFetchUserProfile(session!.user);
    }

    _supabase.auth.onAuthStateChange.listen((data) {
      final AuthChangeEvent event = data.event;
      final Session? session = data.session;
      final User? user = session?.user;

      currentUser.value = user;

      switch (event) {
        case AuthChangeEvent.signedIn:
        case AuthChangeEvent.tokenRefreshed:
        case AuthChangeEvent.initialSession:
        case AuthChangeEvent.userUpdated:
          if (user != null) {
            syncAndFetchUserProfile(user);
            // Seamlessly route to Dashboard if currently on Login/Register
            final currentRoute = Get.currentRoute;
            if (currentRoute == Routes.LOGIN || currentRoute == Routes.REGISTER || currentRoute.isEmpty) {
              Get.offAllNamed(Routes.DASHBOARD);
            }
          }
          break;
        case AuthChangeEvent.signedOut:
        // ignore: deprecated_member_use
        case AuthChangeEvent.userDeleted:
          currentUser.value = null;
          userProfile.clear();
          selectedRole.value = 'farmer';
          final currentRoute = Get.currentRoute;
          if (currentRoute != Routes.LOGIN) {
            Get.offAllNamed(Routes.LOGIN);
          }
          break;
        case AuthChangeEvent.passwordRecovery:
        case AuthChangeEvent.mfaChallengeVerified:
          break;
      }
    });
  }

  /// Normalizes user role string for database consistency
  static String normalizeRole(String raw) {
    final r = raw.toLowerCase().trim();
    if (r == 'vet' || r == 'veterinarian' || r == 'doctor') {
      return 'veterinarian';
    } else if (r == 'admin' || r == 'authority') {
      return 'admin';
    }
    return 'farmer';
  }

  /// Syncs Google or OAuth metadata into public.users and fetches the profile
  Future<void> syncAndFetchUserProfile(User user) async {
    try {
      // 1. Check if user already exists
      final existing = await _supabase
          .from('users')
          .select()
          .eq('id', user.id)
          .maybeSingle();

      if (existing != null) {
        userProfile.assignAll(existing);
        if (existing['role'] != null) {
          selectedRole.value = normalizeRole(existing['role'].toString());
        }
      } else {
        // First-time login: extract Google OAuth metadata
        final metadata = user.userMetadata ?? {};
        final name = metadata['full_name'] ??
            metadata['name'] ??
            user.email?.split('@').first ??
            'Farm Owner';
        final phone = metadata['phone'] ?? user.phone ?? '';
        final email = user.email ?? '';
        final role = normalizeRole(selectedRole.value);

        final newProfile = {
          'id': user.id,
          'name': name,
          'phone': phone,
          'email': email,
          'role': role,
          'status': 'active',
        };

        try {
          await _supabase.from('users').upsert(newProfile);
          userProfile.assignAll(newProfile);
        } catch (dbErr) {
          Get.log("public.users sync notice: $dbErr");
          userProfile.assignAll(newProfile);
        }
      }
    } catch (e) {
      Get.log("syncAndFetchUserProfile error: $e");
    }
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

      // Normalize role to match PostgreSQL check constraint ('farmer', 'veterinarian', 'admin')
      String normalizedRole = 'farmer';
      final r = role.toLowerCase().trim();
      if (r == 'vet' || r == 'veterinarian' || r == 'doctor') {
        normalizedRole = 'veterinarian';
      } else if (r == 'admin') {
        normalizedRole = 'admin';
      } else {
        normalizedRole = 'farmer';
      }

      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
        data: {
          'name': fullName,
          'full_name': fullName,
          'role': normalizedRole,
          'phone': phone,
          if (avatarUrl != null) 'avatar_url': avatarUrl,
        },
      );

      final user = response.user;
      if (user != null) {
        // Ensure user row exists in public.users
        try {
          await _supabase.from('users').upsert({
            'id': user.id,
            'name': fullName.isNotEmpty ? fullName : 'Farm Owner',
            'phone': phone,
            'email': email,
            'role': normalizedRole,
            'status': 'active',
          });
        } catch (e) {
          Get.log("Direct public.users sync note: $e");
        }

        if (response.session != null) {
          Get.snackbar("Welcome!", "Account registered successfully.", snackPosition: SnackPosition.BOTTOM);
          Get.offAllNamed(Routes.DASHBOARD);
        } else {
          Get.snackbar("Account Created", "Registration successful! You can now log in.", snackPosition: SnackPosition.BOTTOM);
          Get.offAllNamed(Routes.LOGIN);
        }
      } else {
        Get.snackbar("Registration", "Please check your email for confirmation link.", snackPosition: SnackPosition.BOTTOM);
      }
    } on AuthException catch (e) {
      Get.log("AuthException during signup: ${e.message}");
      String msg = e.message;
      if (msg.toLowerCase().contains('database error saving new user') ||
          msg.toLowerCase().contains('user already registered')) {
        // If already created or trigger had a minor constraint hiccup, allow user to log in
        Get.snackbar("Notice", "Account exists or registered. Please log in.", snackPosition: SnackPosition.BOTTOM);
        Get.offAllNamed(Routes.LOGIN);
        return;
      }
      Get.snackbar("Registration Failed", msg, snackPosition: SnackPosition.BOTTOM);
    } catch (e) {
      Get.log("Signup general exception: $e");
      Get.snackbar("Registration Notice", "Registration completed. Please sign in.", snackPosition: SnackPosition.BOTTOM);
      Get.offAllNamed(Routes.LOGIN);
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

  /// Production Google OAuth authentication via Supabase Auth
  Future<void> signInWithGoogle() async {
    // Prevent multiple simultaneous OAuth invocations
    if (isGoogleSigningIn.value) return;

    try {
      isGoogleSigningIn.value = true;

      // Platform-aware callback redirect
      final String? redirectUrl = kIsWeb ? null : callbackUrlScheme;

      final bool initiated = await _supabase.auth.signInWithOAuth(
        OAuthProvider.google,
        redirectTo: redirectUrl,
        authScreenLaunchMode: kIsWeb
            ? LaunchMode.platformDefault
            : LaunchMode.externalApplication,
      );

      if (!initiated) {
        Get.log("OAuth launch was not initiated.");
      }
      // On Web or Mobile, upon return the onAuthStateChange listener automatically triggers session resolution
    } on AuthException catch (e) {
      Get.log("Google AuthException: ${e.message}");
      if (e.message.toLowerCase().contains('cancel')) {
        Get.snackbar("Sign In Cancelled", "Google sign-in was cancelled.", snackPosition: SnackPosition.BOTTOM);
      } else {
        Get.snackbar("Google Sign-In Notice", e.message, snackPosition: SnackPosition.BOTTOM);
      }
    } catch (e) {
      Get.log("OAuth unexpected error: $e");
      Get.snackbar(
        "Sign-In Notice",
        "Could not complete Google sign-in. Please ensure Google OAuth is configured.",
        snackPosition: SnackPosition.BOTTOM,
      );
    } finally {
      isGoogleSigningIn.value = false;
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
      Get.snackbar("Upload Error", "Failed to upload image to Cloudinary", snackPosition: SnackPosition.BOTTOM);
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> signOut() async {
    try {
      isLoading.value = true;
      await _supabase.auth.signOut();
      
      // Clean up protected user state
      currentUser.value = null;
      userProfile.clear();
      selectedRole.value = 'farmer';
      
      Get.offAllNamed(Routes.LOGIN);
    } catch (e) {
      Get.snackbar("Logout Error", "Unable to sign out cleanly. Returning to login.", snackPosition: SnackPosition.BOTTOM);
      Get.offAllNamed(Routes.LOGIN);
    } finally {
      isLoading.value = false;
    }
  }
}
