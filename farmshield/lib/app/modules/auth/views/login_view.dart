import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../routes/app_pages.dart';
import '../controllers/auth_controller.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final AuthController controller = Get.find<AuthController>();

  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;
  late final TextEditingController _phoneController;
  late final TextEditingController _otpController;

  bool _isPasswordHidden = true;
  bool _otpSent = false;
  int _activeTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    _phoneController = TextEditingController();
    _otpController = TextEditingController();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxl, vertical: AppSpacing.lg),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  _buildHeader(),
                  const SizedBox(height: AppSpacing.xxl),
                  _buildRoleSelector(),
                  const SizedBox(height: AppSpacing.lg),
                  _buildAuthCard(),
                  const SizedBox(height: AppSpacing.xl),
                  _buildRegisterPrompt(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          width: 72,
          height: 72,
          decoration: BoxDecoration(
            gradient: AppColors.primaryGradient,
            shape: BoxShape.circle,
            boxShadow: AppSpacing.shadowPrimary,
          ),
          child: const Center(
            child: Icon(Icons.shield_rounded, color: AppColors.accent, size: 38),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        Text(
          'FarmShield',
          style: AppTypography.displayLarge.copyWith(
            color: AppColors.primary,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          'Livestock Health & MRL Regulatory Portal',
          style: AppTypography.bodySmall.copyWith(
            color: AppColors.textSecondary,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildRoleSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.only(left: 4, bottom: 8),
          child: Text(
            'SELECT ACCOUNT ROLE',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.textSecondary,
              letterSpacing: 0.8,
            ),
          ),
        ),
        Obx(() => Row(
              children: [
                Expanded(
                  child: _roleOption(
                    role: 'farmer',
                    label: 'Farmer',
                    icon: Icons.agriculture_rounded,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: _roleOption(
                    role: 'veterinarian',
                    label: 'Veterinarian',
                    icon: Icons.medical_services_rounded,
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                Expanded(
                  child: _roleOption(
                    role: 'admin',
                    label: 'Authority',
                    icon: Icons.admin_panel_settings_rounded,
                  ),
                ),
              ],
            )),
      ],
    );
  }

  Widget _roleOption({
    required String role,
    required String label,
    required IconData icon,
  }) {
    final isSelected = controller.selectedRole.value == role;

    return GestureDetector(
      onTap: () => controller.selectedRole.value = role,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primarySoft : AppColors.surface,
          borderRadius: AppSpacing.roundedMd,
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 1.6 : 1.0,
          ),
          boxShadow: isSelected ? AppSpacing.shadowSubtle : null,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected ? AppColors.primary : AppColors.slate400,
            ),
            const SizedBox(height: 6),
            Text(
              label,
              style: AppTypography.labelSmall.copyWith(
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAuthCard() {
    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Segmented Tab Switcher
          Container(
            height: 42,
            padding: const EdgeInsets.all(3),
            decoration: BoxDecoration(
              color: AppColors.slate100,
              borderRadius: AppSpacing.roundedSm,
            ),
            child: Row(
              children: [
                Expanded(
                  child: _tabButton('Email & Password', _activeTabIndex == 0, () {
                    setState(() => _activeTabIndex = 0);
                  }),
                ),
                Expanded(
                  child: _tabButton('Mobile OTP', _activeTabIndex == 1, () {
                    setState(() => _activeTabIndex = 1);
                  }),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),

          if (_activeTabIndex == 0) ...[
            AppTextField(
              controller: _emailController,
              label: 'Email Address',
              hint: 'e.g. farmer@farmshield.gov.in',
              prefixIcon: Icons.email_outlined,
              keyboardType: TextInputType.emailAddress,
            ),
            const SizedBox(height: AppSpacing.md),
            AppTextField(
              controller: _passwordController,
              label: 'Password',
              hint: '••••••••',
              prefixIcon: Icons.lock_outline_rounded,
              obscureText: _isPasswordHidden,
              suffixIcon: IconButton(
                icon: Icon(
                  _isPasswordHidden ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  size: 20,
                  color: AppColors.slate400,
                ),
                onPressed: () => setState(() => _isPasswordHidden = !_isPasswordHidden),
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Obx(() => AppButton(
                  label: 'Sign In to Portal',
                  icon: Icons.login_rounded,
                  isLoading: controller.isLoading.value,
                  isFullWidth: true,
                  onPressed: () {
                    final email = _emailController.text.trim();
                    final password = _passwordController.text.trim();
                    if (email.isEmpty || password.isEmpty) {
                      Get.snackbar('Validation', 'Please enter email and password',
                          snackPosition: SnackPosition.BOTTOM);
                      return;
                    }
                    controller.signInWithEmail(email, password);
                  },
                )),
          ] else ...[
            AppTextField(
              controller: _phoneController,
              label: 'Mobile Number',
              hint: '+91 9876543210',
              prefixIcon: Icons.phone_iphone_rounded,
              keyboardType: TextInputType.phone,
            ),
            if (_otpSent) ...[
              const SizedBox(height: AppSpacing.md),
              AppTextField(
                controller: _otpController,
                label: 'Enter 6-Digit OTP',
                hint: '123456',
                prefixIcon: Icons.verified_user_outlined,
                keyboardType: TextInputType.number,
              ),
            ],
            const SizedBox(height: AppSpacing.lg),
            Obx(() => AppButton(
                  label: _otpSent ? 'Verify & Continue' : 'Send Verification OTP',
                  icon: _otpSent ? Icons.check_circle_outline_rounded : Icons.send_rounded,
                  isLoading: controller.isLoading.value,
                  isFullWidth: true,
                  onPressed: () async {
                    final phone = _phoneController.text.trim();
                    if (phone.isEmpty) {
                      Get.snackbar('Validation', 'Please enter mobile number',
                          snackPosition: SnackPosition.BOTTOM);
                      return;
                    }
                    if (!_otpSent) {
                      await controller.signInWithPhoneOTP(phone);
                      setState(() => _otpSent = true);
                    } else {
                      final otp = _otpController.text.trim();
                      if (otp.length < 4) {
                        Get.snackbar('Validation', 'Please enter valid OTP',
                            snackPosition: SnackPosition.BOTTOM);
                        return;
                      }
                      await controller.verifyPhoneOTP(phone, otp);
                    }
                  },
                )),
          ],

          const SizedBox(height: AppSpacing.lg),

          // Divider
          Row(
            children: [
              const Expanded(child: Divider(color: AppColors.border)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Text(
                  'OR',
                  style: AppTypography.labelSmall.copyWith(
                    color: AppColors.slate400,
                  ),
                ),
              ),
              const Expanded(child: Divider(color: AppColors.border)),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),

          // Google Sign-in Button
          AppButton(
            label: 'Continue with Google',
            variant: AppButtonVariant.outline,
            isFullWidth: true,
            icon: Icons.g_mobiledata_rounded,
            onPressed: () => controller.signInWithGoogle(),
          ),
        ],
      ),
    );
  }

  Widget _tabButton(String title, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(AppSpacing.radiusXs),
          boxShadow: isSelected ? AppSpacing.shadowSubtle : null,
        ),
        child: Text(
          title,
          style: AppTypography.labelSmall.copyWith(
            color: isSelected ? AppColors.primary : AppColors.textSecondary,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
      ),
    );
  }

  Widget _buildRegisterPrompt() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Don't have an account? ",
          style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
        ),
        GestureDetector(
          onTap: () => Get.toNamed(Routes.REGISTER),
          child: Text(
            'Register Now',
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}
