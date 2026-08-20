import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../controllers/auth_controller.dart';
import '../../../routes/app_pages.dart';

class LoginView extends GetView<AuthController> {
  const LoginView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    final phoneController = TextEditingController();
    final otpController = TextEditingController();
    final RxBool otpSent = false.obs;
    final Rx<String?> avatarUrl = Rx<String?>(null);

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 40.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Column(
                    children: [
                      Obx(() => Stack(
                            children: [
                              CircleAvatar(
                                radius: 50,
                                backgroundColor: Colors.grey[200],
                                backgroundImage: (avatarUrl.value != null && avatarUrl.value!.isNotEmpty)
                                    ? NetworkImage(avatarUrl.value!)
                                    : null,
                                child: (avatarUrl.value == null || avatarUrl.value!.isEmpty)
                                    ? const Icon(Icons.person, size: 50, color: Colors.grey)
                                    : null,
                              ),
                              Positioned(
                                bottom: 0,
                                right: 0,
                                child: CircleAvatar(
                                  backgroundColor: Theme.of(context).primaryColor,
                                  radius: 18,
                                  child: IconButton(
                                    icon: const Icon(Icons.camera_alt, size: 18, color: Colors.white),
                                    onPressed: () async {
                                      final ImagePicker picker = ImagePicker();
                                      final XFile? image = await picker.pickImage(source: ImageSource.gallery);
                                      if (image != null) {
                                        final url = await controller.uploadProfileAvatar(File(image.path));
                                        if (url != null) avatarUrl.value = url;
                                      }
                                    },
                                  ),
                                ),
                              ),
                            ],
                          )),
                      const SizedBox(height: 16),
                      Text(
                        "FarmShield",
                        style: GoogleFonts.poppins(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                      Text(
                        "Digital Livestock Management",
                        style: GoogleFonts.poppins(
                          fontSize: 14,
                          color: Colors.grey[600],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                Text(
                  "Select Your Role",
                  style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 16),
                ),
                const SizedBox(height: 12),
                Obx(() => Row(
                      children: [
                        Expanded(child: _buildRoleCard('farmer', 'Farmer', '👨‍🌾')),
                        const SizedBox(width: 8),
                        Expanded(child: _buildRoleCard('vet', 'Vet', '🩺')),
                        const SizedBox(width: 8),
                        Expanded(child: _buildRoleCard('admin', 'Admin', '🏢')),
                      ],
                    )),
                const SizedBox(height: 24),
                TabBar(
                  labelColor: Theme.of(context).primaryColor,
                  unselectedLabelColor: Colors.grey,
                  indicatorColor: Theme.of(context).primaryColor,
                  indicatorWeight: 3,
                  labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                  tabs: const [
                    Tab(text: "Email"),
                    Tab(text: "OTP"),
                    Tab(text: "SSO"),
                  ],
                ),
                const SizedBox(height: 20),
                SizedBox(
                  height: 350,
                  child: TabBarView(
                    children: [
                      // Email Tab
                      Column(
                        children: [
                          TextField(
                            controller: emailController,
                            decoration: InputDecoration(
                              labelText: "Email Address",
                              prefixIcon: const Icon(Icons.email_outlined),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                          const SizedBox(height: 16),
                          TextField(
                            controller: passwordController,
                            obscureText: true,
                            decoration: InputDecoration(
                              labelText: "Password",
                              prefixIcon: const Icon(Icons.lock_outline),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                          const SizedBox(height: 24),
                          Obx(() => _buildPrimaryButton(
                                context,
                                label: "Sign In",
                                isLoading: controller.isLoading.value,
                                onPressed: () => controller.signInWithEmail(
                                    emailController.text.trim(), passwordController.text.trim()),
                              )),
                        ],
                      ),
                      // OTP Tab
                      Column(
                        children: [
                          TextField(
                            controller: phoneController,
                            decoration: InputDecoration(
                              labelText: "Mobile Number",
                              prefixIcon: const Icon(Icons.phone_android),
                              hintText: "+91 XXXXXXXXXX",
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Obx(() => otpSent.value
                              ? TextField(
                                  controller: otpController,
                                  decoration: InputDecoration(
                                    labelText: "Enter 6-digit OTP",
                                    prefixIcon: const Icon(Icons.verified_user_outlined),
                                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                  ),
                                )
                              : const SizedBox()),
                          const SizedBox(height: 24),
                          Obx(() => _buildPrimaryButton(
                                context,
                                label: otpSent.value ? "Verify & Login" : "Send OTP",
                                isLoading: controller.isLoading.value,
                                onPressed: () async {
                                  if (!otpSent.value) {
                                    await controller.signInWithPhoneOTP(phoneController.text.trim());
                                    otpSent.value = true;
                                  } else {
                                    await controller.verifyPhoneOTP(
                                        phoneController.text.trim(), otpController.text.trim());
                                  }
                                },
                              )),
                        ],
                      ),
                      // SSO Tab
                      Column(
                        children: [
                          _buildSSOButton(
                            icon: Icons.g_mobiledata,
                            label: "Sign in with Google",
                            onPressed: () {},
                          ),
                          const SizedBox(height: 16),
                          _buildSSOButton(
                            icon: Icons.account_balance,
                            label: "Sign in with DigiLocker",
                            onPressed: () {},
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text("New to FarmShield? ", style: GoogleFonts.poppins()),
                    GestureDetector(
                      onTap: () => Get.toNamed(Routes.REGISTER),
                      child: Text(
                        "Register Now",
                        style: GoogleFonts.poppins(
                          color: Theme.of(context).primaryColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildRoleCard(String role, String label, String emoji) {
    final isSelected = controller.selectedRole.value == role;
    return GestureDetector(
      onTap: () => controller.selectedRole.value = role,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? Theme.of(Get.context!).primaryColor.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? Theme.of(Get.context!).primaryColor : Colors.grey[300]!,
            width: 2,
          ),
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 24)),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? Theme.of(Get.context!).primaryColor : Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPrimaryButton(BuildContext context,
      {required String label, required bool isLoading, required VoidCallback onPressed}) {
    return SizedBox(
      width: double.infinity,
      height: 55,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Theme.of(context).primaryColor,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: isLoading
            ? const CircularProgressIndicator(color: Colors.white)
            : Text(label, style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildSSOButton({required IconData icon, required String label, required VoidCallback onPressed}) {
    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 28),
      label: Text(label, style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.w500)),
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(double.infinity, 55),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
