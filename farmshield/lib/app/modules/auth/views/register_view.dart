import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_header_bar.dart';
import '../../../core/widgets/app_text_field.dart';
import '../controllers/auth_controller.dart';

class RegisterView extends StatefulWidget {
  const RegisterView({super.key});

  @override
  State<RegisterView> createState() => _RegisterViewState();
}

class _RegisterViewState extends State<RegisterView> {
  final AuthController controller = Get.find<AuthController>();

  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;
  late final TextEditingController _stateController;
  late final TextEditingController _districtController;

  bool _isPasswordHidden = true;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _emailController = TextEditingController();
    _passwordController = TextEditingController();
    _stateController = TextEditingController();
    _districtController = TextEditingController();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _stateController.dispose();
    _districtController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppHeaderBar(
        title: 'Create Account',
        subtitle: 'Join the National Livestock Safety Network',
      ),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xxl, vertical: AppSpacing.lg),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 460),
              child: AppCard(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      'Account Credentials',
                      style: AppTypography.titleMedium.copyWith(color: AppColors.primary),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _nameController,
                      label: 'Full Name',
                      hint: 'e.g. Ramesh Kumar',
                      prefixIcon: Icons.person_outline_rounded,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _phoneController,
                      label: 'Phone Number',
                      hint: '+91 9876543210',
                      prefixIcon: Icons.phone_android_rounded,
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _emailController,
                      label: 'Email Address',
                      hint: 'ramesh@farmshield.gov.in',
                      prefixIcon: Icons.email_outlined,
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    AppTextField(
                      controller: _passwordController,
                      label: 'Password',
                      hint: 'Minimum 6 characters',
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
                    Text(
                      'Account Role',
                      style: AppTypography.titleMedium.copyWith(color: AppColors.primary),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Obx(() => Row(
                          children: [
                            Expanded(
                              child: _roleTile('farmer', 'Farmer', Icons.agriculture_rounded),
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: _roleTile('veterinarian', 'Vet', Icons.medical_services_rounded),
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: _roleTile('admin', 'Authority', Icons.admin_panel_settings_rounded),
                            ),
                          ],
                        )),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      'Jurisdiction / Location',
                      style: AppTypography.titleMedium.copyWith(color: AppColors.primary),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      children: [
                        Expanded(
                          child: AppTextField(
                            controller: _stateController,
                            label: 'State',
                            hint: 'e.g. Gujarat',
                            prefixIcon: Icons.map_outlined,
                          ),
                        ),
                        const SizedBox(width: AppSpacing.md),
                        Expanded(
                          child: AppTextField(
                            controller: _districtController,
                            label: 'District',
                            hint: 'e.g. Anand',
                            prefixIcon: Icons.location_city_outlined,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    Obx(() => AppButton(
                          label: 'Register & Launch Portal',
                          icon: Icons.check_circle_outline_rounded,
                          isLoading: controller.isLoading.value,
                          isFullWidth: true,
                          onPressed: () {
                            final email = _emailController.text.trim();
                            final password = _passwordController.text.trim();
                            final name = _nameController.text.trim();
                            final phone = _phoneController.text.trim();

                            if (name.isEmpty) {
                              Get.snackbar('Input Required', 'Please enter your full name',
                                  snackPosition: SnackPosition.BOTTOM);
                              return;
                            }
                            if (phone.isEmpty) {
                              Get.snackbar('Input Required', 'Please enter your phone number',
                                  snackPosition: SnackPosition.BOTTOM);
                              return;
                            }
                            if (email.isEmpty || !email.contains('@')) {
                              Get.snackbar('Input Required', 'Please enter a valid email address',
                                  snackPosition: SnackPosition.BOTTOM);
                              return;
                            }
                            if (password.length < 6) {
                              Get.snackbar('Input Required', 'Password must be at least 6 characters',
                                  snackPosition: SnackPosition.BOTTOM);
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
                        )),
                    const SizedBox(height: AppSpacing.lg),
                    Center(
                      child: GestureDetector(
                        onTap: () => Get.back(),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Already registered? ',
                              style: AppTypography.bodySmall.copyWith(color: AppColors.textSecondary),
                            ),
                            Text(
                              'Sign In',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _roleTile(String role, String label, IconData icon) {
    final isSelected = controller.selectedRole.value == role;

    return GestureDetector(
      onTap: () => controller.selectedRole.value = role,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primarySoft : AppColors.surfaceSubtle,
          borderRadius: AppSpacing.roundedSm,
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.border,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 20,
              color: isSelected ? AppColors.primary : AppColors.slate400,
            ),
            const SizedBox(height: 4),
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
}
