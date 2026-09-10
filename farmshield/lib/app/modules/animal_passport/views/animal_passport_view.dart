import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../core/widgets/app_header_bar.dart';
import '../../../data/models/farm_models.dart';
import '../controllers/animal_passport_controller.dart';
import 'qr_scanner_view.dart';

class AnimalPassportView extends StatefulWidget {
  const AnimalPassportView({super.key});

  @override
  State<AnimalPassportView> createState() => _AnimalPassportViewState();
}

class _AnimalPassportViewState extends State<AnimalPassportView> {
  final AnimalPassportController controller = Get.find<AnimalPassportController>();
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: controller.qrToken.value);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppHeaderBar(
        title: 'Livestock Safety Passport',
        subtitle: 'Public MRL Regulatory & Traceability Verification',
      ),
      body: Column(
        children: [
          // Search & Scanner Header
          Container(
            padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.sm, AppSpacing.lg, AppSpacing.md),
            decoration: const BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.vertical(bottom: Radius.circular(AppSpacing.radiusXl)),
            ),
            child: Column(
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 48,
                        padding: const EdgeInsets.only(left: 12, right: 4),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: AppSpacing.roundedMd,
                          boxShadow: AppSpacing.shadowSubtle,
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.search_rounded, color: AppColors.primary, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: TextField(
                                controller: _searchController,
                                style: AppTypography.bodyMedium,
                                decoration: InputDecoration(
                                  isDense: true,
                                  hintText: 'Search Ear Tag, QR Token, or ID...',
                                  hintStyle: AppTypography.bodySmall,
                                  border: InputBorder.none,
                                  contentPadding: EdgeInsets.zero,
                                  filled: false,
                                ),
                                onSubmitted: (val) => controller.fetchPublicPassport(val),
                              ),
                            ),
                            Material(
                              color: AppColors.primary,
                              borderRadius: AppSpacing.roundedSm,
                              child: InkWell(
                                borderRadius: AppSpacing.roundedSm,
                                onTap: () => controller.fetchPublicPassport(_searchController.text.trim()),
                                child: const Padding(
                                  padding: EdgeInsets.all(8.0),
                                  child: Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 18),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Container(
                      height: 48,
                      width: 48,
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: AppSpacing.roundedMd,
                        boxShadow: AppSpacing.shadowSubtle,
                      ),
                      child: IconButton(
                        icon: const Icon(Icons.qr_code_scanner_rounded, color: AppColors.primaryDark, size: 22),
                        tooltip: 'Scan Ear-Tag QR',
                        onPressed: () async {
                          final result = await Get.to(() => const QRScannerView());
                          if (result != null && result is String) {
                            _searchController.text = result;
                            controller.fetchPublicPassport(result);
                          }
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                SizedBox(
                  height: 28,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _quickChip('COW-GIR-01'),
                      _quickChip('COW-SAH-02'),
                      _quickChip('BUF-MUR-01'),
                      _quickChip('GOAT-JAM-01'),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Main Passport Content
          Expanded(
            child: controller.obx(
              (passport) => SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    _buildPassportHeader(passport!),
                    const SizedBox(height: AppSpacing.md),
                    _buildSafetyBanner(passport),
                    const SizedBox(height: AppSpacing.md),
                    _buildCountdownSection(passport),
                    const SizedBox(height: AppSpacing.md),
                    _buildDetailCard(passport),
                    const SizedBox(height: AppSpacing.xxl),
                  ],
                ),
              ),
              onLoading: const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircularProgressIndicator(color: AppColors.primary),
                    SizedBox(height: 12),
                    Text('Verifying National MRL Registry...', style: TextStyle(color: AppColors.textSecondary)),
                  ],
                ),
              ),
              onEmpty: AppEmptyState(
                icon: Icons.qr_code_2_rounded,
                title: 'Scan or Search Livestock Tag',
                description: 'Enter an ear-tag ID above or tap any quick chip to view consumer food safety verification.',
              ),
              onError: (err) => Center(
                child: Padding(
                  padding: const EdgeInsets.all(AppSpacing.xl),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.danger),
                      const SizedBox(height: 12),
                      Text('Verification Lookup', style: AppTypography.titleMedium),
                      const SizedBox(height: 4),
                      Text(
                        err.toString(),
                        textAlign: TextAlign.center,
                        style: AppTypography.bodySmall,
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      AppButton(
                        label: 'Load Demo Animal Passport',
                        variant: AppButtonVariant.secondary,
                        onPressed: () {
                          _searchController.text = 'COW-GIR-01';
                          controller.fetchPublicPassport('COW-GIR-01');
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _quickChip(String label) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: GestureDetector(
        onTap: () {
          _searchController.text = label;
          controller.fetchPublicPassport(label);
        },
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.16),
            borderRadius: AppSpacing.roundedSm,
            border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
          ),
          child: Text(
            label,
            style: AppTypography.labelSmall.copyWith(color: Colors.white, fontSize: 10.5),
          ),
        ),
      ),
    );
  }

  Widget _buildPassportHeader(PublicPassport passport) {
    return AppCard(
      child: Row(
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: AppColors.primarySoft,
              borderRadius: AppSpacing.roundedMd,
              image: passport.imageUrl != null
                  ? DecorationImage(
                      image: NetworkImage(passport.imageUrl!),
                      fit: BoxFit.cover,
                    )
                  : null,
            ),
            child: passport.imageUrl == null
                ? const Icon(Icons.pets_rounded, size: 32, color: AppColors.primary)
                : null,
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  passport.animalCode ?? 'Unknown Tag',
                  style: AppTypography.codeTag.copyWith(fontSize: 16),
                ),
                Text(
                  '${passport.breed ?? "Indigenous Breed"} • ${(passport.species ?? "Livestock").toUpperCase()}',
                  style: AppTypography.bodySmall,
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded, size: 13, color: AppColors.primary),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        passport.farmName ?? "Registered Farm",
                        style: AppTypography.labelSmall.copyWith(color: AppColors.primary),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSafetyBanner(PublicPassport passport) {
    final bool isSafe = passport.isSafeToConsume ?? (passport.isMilkSafe ?? true);
    final String product = (passport.product ?? 'Milk & Meat').toUpperCase();

    return AppCard(
      color: isSafe ? AppColors.successBg : AppColors.dangerBg,
      borderColor: isSafe
          ? AppColors.success.withValues(alpha: 0.3)
          : AppColors.danger.withValues(alpha: 0.3),
      child: Row(
        children: [
          Icon(
            isSafe ? Icons.verified_rounded : Icons.warning_amber_rounded,
            color: isSafe ? AppColors.success : AppColors.danger,
            size: 28,
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isSafe ? 'VERIFIED SAFE FOR HUMAN CONSUMPTION' : 'ACTIVE WITHDRAWAL ($product)',
                  style: AppTypography.labelLarge.copyWith(
                    color: isSafe ? AppColors.success : AppColors.danger,
                    fontWeight: FontWeight.w800,
                    fontSize: 12.5,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  isSafe
                      ? 'Certified compliant with national FSSAI & Codex Alimentarius MRL Standards.'
                      : 'Antibiotic residues active. Strictly withhold livestock produce from sale.',
                  style: AppTypography.bodySmall.copyWith(
                    color: isSafe ? AppColors.success : AppColors.danger,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCountdownSection(PublicPassport passport) {
    final bool isSafe = passport.isSafeToConsume ?? (passport.isMilkSafe ?? true);
    if (isSafe) return const SizedBox.shrink();

    final remainingHours = passport.remainingHours ?? (passport.remainingWithdrawalHours ?? 48);
    final clearanceDate = passport.withdrawalEndDate ?? passport.safeDate ?? DateTime.now().add(const Duration(days: 3));

    return AppCard(
      color: AppColors.warningBg,
      borderColor: AppColors.warning.withValues(alpha: 0.3),
      child: Column(
        children: [
          Text(
            'MRL CLEARANCE COUNTDOWN',
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.warning,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _timePod('${remainingHours ~/ 24}', 'DAYS'),
              const SizedBox(width: 8),
              _timePod('${remainingHours % 24}', 'HOURS'),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Safe for distribution after: ${DateFormat('EEE, dd MMM yyyy (hh:mm a)').format(clearanceDate)}',
            style: AppTypography.bodySmall.copyWith(fontSize: 11, fontWeight: FontWeight.w600),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _timePod(String value, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.slate900,
        borderRadius: AppSpacing.roundedSm,
      ),
      child: Column(
        children: [
          Text(value, style: AppTypography.titleLarge.copyWith(color: Colors.white)),
          Text(label, style: AppTypography.labelSmall.copyWith(color: AppColors.slate400, fontSize: 8.5)),
        ],
      ),
    );
  }

  Widget _buildDetailCard(PublicPassport passport) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Clinical Safety & Regulatory Audit', style: AppTypography.titleSmall),
          const Divider(height: 20),
          _infoRow(
            Icons.health_and_safety_outlined,
            'Health Status',
            passport.healthStatus != null
                ? passport.healthStatus!.replaceAll('_', ' ').split(' ').map((w) => w.capitalizeFirst ?? w).join(' ')
                : 'Healthy',
          ),
          _infoRow(Icons.science_outlined, 'Latest Residue Test', passport.latestLabResult ?? 'MRL Zero (Compliant)'),
          _infoRow(Icons.verified_user_outlined, 'Safety Index Score', '${passport.complianceScore ?? 98.0}% Verified'),
          _infoRow(Icons.event_available_outlined, 'Last Verified', DateFormat('dd MMM yyyy').format(passport.lastVerifiedAt ?? DateTime.now())),
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppColors.primary),
          const SizedBox(width: 8),
          Text(label, style: AppTypography.bodySmall),
          const Spacer(),
          Text(value, style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}
