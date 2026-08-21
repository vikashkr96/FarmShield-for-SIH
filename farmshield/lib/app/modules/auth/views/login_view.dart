import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
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
    final RxBool isPasswordHidden = true.obs;
    final RxInt activeTabIndex = 0.obs;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              physics: const ClampingScrollPhysics(),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: (Get.width * 0.06).clamp(18.0, 26.0),
                    vertical: 12.0,
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 8),
                      // 1. Lowered & Refined Brand Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1B5E20),
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF1B5E20).withOpacity(0.25),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Icon(Icons.shield_rounded, color: Colors.greenAccent, size: 40),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                "FarmShield",
                                style: GoogleFonts.poppins(
                                  fontSize: 35,
                                  fontWeight: FontWeight.w800,
                                  color: const Color(0xFF0F172A),
                                  letterSpacing: 0.2,
                                ),
                              ),
                              Text(
                                "Livestock Safety & AMU Portal",
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  color: Colors.blueGrey.shade600,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(height: 50),

                      // 2. Role Selection Section
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Padding(
                          padding: const EdgeInsets.only(left: 4, bottom: 6),
                          child: Text(
                            "Select Your Role",
                            style: GoogleFonts.poppins(
                              fontWeight: FontWeight.w700,
                              fontSize: 12.5,
                              color: Colors.blueGrey.shade800,
                            ),
                          ),
                        ),
                      ),
                      Obx(() => Row(
                            children: [
                              Expanded(child: _buildRoleCard('farmer', 'Farmer', '👨‍🌾')),
                              const SizedBox(width: 8),
                              Expanded(child: _buildRoleCard('veterinarian', 'Vet', '🩺')),
                              const SizedBox(width: 8),
                              Expanded(child: _buildRoleCard('admin', 'Admin', '🏢')),
                            ],
                          )),
                      const SizedBox(height: 14),

                      // 3. Main Auth Card
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(22),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withOpacity(0.04),
                              blurRadius: 18,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            // Segmented Switcher
                            Obx(() => Container(
                                  height: 38,
                                  padding: const EdgeInsets.all(3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFF1F5F9),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Row(
                                    children: [
                                      Expanded(
                                        child: _buildTabButton(
                                          title: "Email & Password",
                                          isSelected: activeTabIndex.value == 0,
                                          onTap: () => activeTabIndex.value = 0,
                                        ),
                                      ),
                                      Expanded(
                                        child: _buildTabButton(
                                          title: "Mobile OTP",
                                          isSelected: activeTabIndex.value == 1,
                                          onTap: () => activeTabIndex.value = 1,
                                        ),
                                      ),
                                    ],
                                  ),
                                )),
                            const SizedBox(height: 12),

                            // Tab Form Content
                            Obx(() {
                              if (activeTabIndex.value == 0) {
                                return Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    _buildInputField(
                                      controller: emailController,
                                      label: "Email Address",
                                      hint: "e.g. farmer.ramesh@farmshield.gov.in",
                                      icon: Icons.email_outlined,
                                      keyboardType: TextInputType.emailAddress,
                                    ),
                                    const SizedBox(height: 8),
                                    Obx(() => _buildInputField(
                                          controller: passwordController,
                                          label: "Password",
                                          hint: "••••••••",
                                          icon: Icons.lock_outline_rounded,
                                          isPassword: isPasswordHidden.value,
                                          suffixIcon: IconButton(
                                            icon: Icon(
                                              isPasswordHidden.value ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                              size: 18,
                                              color: Colors.blueGrey,
                                            ),
                                            onPressed: () => isPasswordHidden.toggle(),
                                          ),
                                        )),
                                    const SizedBox(height: 12),
                                    Obx(() => _buildPrimaryButton(
                                          context,
                                          label: "Sign In",
                                          isLoading: controller.isLoading.value,
                                          onPressed: () => controller.signInWithEmail(
                                            emailController.text.trim(),
                                            passwordController.text.trim(),
                                          ),
                                        )),
                                  ],
                                );
                              } else {
                                return Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    _buildInputField(
                                      controller: phoneController,
                                      label: "Mobile Number",
                                      hint: "+91 9876543210",
                                      icon: Icons.phone_android_rounded,
                                      keyboardType: TextInputType.phone,
                                    ),
                                    const SizedBox(height: 8),
                                    Obx(() => otpSent.value
                                        ? _buildInputField(
                                            controller: otpController,
                                            label: "6-digit OTP",
                                            hint: "123456",
                                            icon: Icons.verified_user_outlined,
                                            keyboardType: TextInputType.number,
                                          )
                                        : const SizedBox.shrink()),
                                    if (otpSent.value) const SizedBox(height: 8),
                                    Obx(() => _buildPrimaryButton(
                                          context,
                                          label: otpSent.value ? "Verify & Sign In" : "Send Login OTP",
                                          isLoading: controller.isLoading.value,
                                          onPressed: () async {
                                            if (!otpSent.value) {
                                              await controller.signInWithPhoneOTP(phoneController.text.trim());
                                              otpSent.value = true;
                                            } else {
                                              await controller.verifyPhoneOTP(
                                                phoneController.text.trim(),
                                                otpController.text.trim(),
                                              );
                                            }
                                          },
                                        )),
                                  ],
                                );
                              }
                            }),

                            const SizedBox(height: 12),

                            // Divider
                            Row(
                              children: [
                                Expanded(child: Divider(color: Colors.grey.shade200, thickness: 1)),
                                Padding(
                                  padding: const EdgeInsets.symmetric(horizontal: 10),
                                  child: Text(
                                    "OR",
                                    style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.blueGrey.shade400),
                                  ),
                                ),
                                Expanded(child: Divider(color: Colors.grey.shade200, thickness: 1)),
                              ],
                            ),

                            const SizedBox(height: 12),

                            // Google Sign In Button
                            _buildGoogleSignInButton(
                              onPressed: () => controller.signInWithGoogle(),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),

                      // 4. Fixed Bottom Registration Link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "New to FarmShield? ",
                            style: GoogleFonts.poppins(color: Colors.blueGrey.shade600, fontSize: 13),
                          ),
                          GestureDetector(
                            onTap: () => Get.toNamed(Routes.REGISTER),
                            child: Text(
                              "Register Now",
                              style: GoogleFonts.poppins(
                                color: const Color(0xFF1B5E20),
                                fontWeight: FontWeight.bold,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildTabButton({required String title, required bool isSelected, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ]
              : null,
        ),
        child: Text(
          title,
          style: GoogleFonts.poppins(
            fontSize: 11.5,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? const Color(0xFF1B5E20) : Colors.blueGrey.shade600,
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool isPassword = false,
    Widget? suffixIcon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      obscureText: isPassword,
      keyboardType: keyboardType,
      style: GoogleFonts.poppins(fontSize: 13, color: Colors.blueGrey.shade900),
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(fontSize: 11.5, color: Colors.blueGrey.shade500),
        hintText: hint,
        hintStyle: GoogleFonts.poppins(fontSize: 11.5, color: Colors.blueGrey.shade300),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        prefixIcon: Icon(icon, color: const Color(0xFF1B5E20), size: 18),
        suffixIcon: suffixIcon,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        isDense: true,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF1B5E20), width: 1.5),
        ),
      ),
    );
  }

  Widget _buildRoleCard(String role, String label, String emoji) {
    final isSelected = controller.selectedRole.value == role;
    return GestureDetector(
      onTap: () => controller.selectedRole.value = role,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1B5E20).withOpacity(0.08) : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? const Color(0xFF1B5E20) : Colors.grey.shade200,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: const Color(0xFF1B5E20).withOpacity(0.1),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Column(
          children: [
            Text(emoji, style: const TextStyle(fontSize: 20)),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.poppins(
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? const Color(0xFF1B5E20) : Colors.blueGrey.shade700,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPrimaryButton(
    BuildContext context, {
    required String label,
    required bool isLoading,
    required VoidCallback onPressed,
  }) {
    return SizedBox(
      width: double.infinity,
      height: 44,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF1B5E20),
          foregroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        child: isLoading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.2),
              )
            : Text(label, style: GoogleFonts.poppins(fontSize: 13.5, fontWeight: FontWeight.bold)),
      ),
    );
  }

  Widget _buildGoogleSignInButton({required VoidCallback onPressed}) {
    return SizedBox(
      width: double.infinity,
      height: 44,
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white,
          side: BorderSide(color: Colors.grey.shade300),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          padding: const EdgeInsets.symmetric(horizontal: 14),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.network(
              'https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png',
              width: 20,
              height: 20,
              errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata, size: 24, color: Colors.red),
            ),
            const SizedBox(width: 10),
            Text(
              "Continue with Google",
              style: GoogleFonts.poppins(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: Colors.blueGrey.shade900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
