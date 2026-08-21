import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/auth_controller.dart';
import '../../../routes/app_pages.dart';

class RegisterView extends GetView<AuthController> {
  const RegisterView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final nameController = TextEditingController();
    final phoneController = TextEditingController();
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    final stateController = TextEditingController();
    final districtController = TextEditingController();

    return Scaffold(
      appBar: AppBar(
        title: Text("Create Account", style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        centerTitle: true,
        elevation: 0,
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.black,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                "Join FarmShield 🛡️",
                style: GoogleFonts.poppins(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Theme.of(context).primaryColor,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                "Enter your details to register as a partner in livestock safety.",
                style: GoogleFonts.poppins(color: Colors.grey[600]),
              ),
              const SizedBox(height: 32),

              _buildTextField(
                controller: nameController,
                label: "Full Name",
                icon: Icons.person_outline,
              ),
              const SizedBox(height: 16),

              _buildTextField(
                controller: phoneController,
                label: "Phone Number",
                icon: Icons.phone_android,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),

              _buildTextField(
                controller: emailController,
                label: "Email Address",
                icon: Icons.email_outlined,
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),

              _buildTextField(
                controller: passwordController,
                label: "Password",
                icon: Icons.lock_outline,
                isPassword: true,
              ),
              const SizedBox(height: 24),

              Text(
                "Your Role",
                style: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 16),
              ),
              const SizedBox(height: 12),
              // Correct usage: The outer Obx listens to controller.selectedRole.value
              // accessed within the _buildRoleOption calls.
              Obx(() => Row(
                children: [
                  _buildRoleOption('farmer', 'Farmer 👨‍🌾'),
                  const SizedBox(width: 8),
                  _buildRoleOption('veterinarian', 'Vet 🩺'),
                  const SizedBox(width: 8),
                  _buildRoleOption('admin', 'Admin 🏢'),
                ],
              )),
              const SizedBox(height: 24),

              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: stateController,
                      label: "State",
                      icon: Icons.map_outlined,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildTextField(
                      controller: districtController,
                      label: "District",
                      icon: Icons.location_city_outlined,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              Obx(() => SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: controller.isLoading.value
                      ? null
                      : () {
                          final email = emailController.text.trim();
                          final password = passwordController.text.trim();
                          final name = nameController.text.trim();
                          final phone = phoneController.text.trim();

                          if (email.isEmpty || !email.contains('@')) {
                            Get.snackbar('Input Error', 'Please enter a valid email address', snackPosition: SnackPosition.BOTTOM);
                            return;
                          }
                          if (password.length < 6) {
                            Get.snackbar('Input Error', 'Password must be at least 6 characters', snackPosition: SnackPosition.BOTTOM);
                            return;
                          }
                          if (name.isEmpty) {
                            Get.snackbar('Input Error', 'Please enter your full name', snackPosition: SnackPosition.BOTTOM);
                            return;
                          }

                          controller.signUpWithEmail(
                            email: email,
                            password: password,
                            fullName: name,
                            role: controller.selectedRole.value,
                            phone: phone,
                          );
                        },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF1B5E20),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 0,
                  ),
                  child: controller.isLoading.value
                      ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                      : Text(
                          "CREATE ACCOUNT",
                          style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                        ),
                ),
              )),
              const SizedBox(height: 20),
              Center(
                child: GestureDetector(
                  onTap: () => Get.back(),
                  child: RichText(
                    text: TextSpan(
                      text: "Already have an account? ",
                      style: GoogleFonts.poppins(color: Colors.black),
                      children: [
                        TextSpan(
                          text: "Login",
                          style: GoogleFonts.poppins(
                            color: Theme.of(context).primaryColor,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool isPassword = false,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      keyboardType: keyboardType,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),
    );
  }

  Widget _buildRoleOption(String role, String label) {
    final isSelected = controller.selectedRole.value == role;
    final primaryColor = Theme.of(Get.context!).primaryColor;

    return Expanded(
      child: GestureDetector(
        onTap: () => controller.selectedRole.value = role,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? primaryColor.withOpacity(0.1) : Colors.grey[100],
            border: Border.all(
              color: isSelected ? primaryColor : Colors.transparent,
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? primaryColor : Colors.black,
              ),
            ),
          ),
        ),
      ),
    );
  }
}