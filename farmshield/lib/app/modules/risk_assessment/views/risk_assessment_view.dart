import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_button.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../data/models/risk_models.dart';
import '../controllers/risk_assessment_controller.dart';

class RiskAssessmentView extends StatefulWidget {
  const RiskAssessmentView({super.key});

  @override
  State<RiskAssessmentView> createState() => _RiskAssessmentViewState();
}

class _RiskAssessmentViewState extends State<RiskAssessmentView> with SingleTickerProviderStateMixin {
  final RiskAssessmentController controller = Get.find<RiskAssessmentController>();

  late final TabController _tabController;

  // Model A Form Controllers
  late final TextEditingController _treatments7dCtrl;
  late final TextEditingController _treatments30dCtrl;
  late final TextEditingController _amuMg30dCtrl;
  late final TextEditingController _durationCtrl;
  final RxString _speciesA = 'cow'.obs;
  final RxString _drugClassA = 'Fluoroquinolones (CIA)'.obs;

  // Model B Form Controllers
  late final TextEditingController _drugNameBCtrl;
  late final TextEditingController _weightBCtrl;
  late final TextEditingController _doseBCtrl;
  late final TextEditingController _officialWdBCtrl;
  late final TextEditingController _daysElapsedBCtrl;
  final RxString _speciesB = 'cow'.obs;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);

    _treatments7dCtrl = TextEditingController(text: '2');
    _treatments30dCtrl = TextEditingController(text: '4');
    _amuMg30dCtrl = TextEditingController(text: '240');
    _durationCtrl = TextEditingController(text: '6');

    _drugNameBCtrl = TextEditingController(text: 'Enrofloxacin 10%');
    _weightBCtrl = TextEditingController(text: '420');
    _doseBCtrl = TextEditingController(text: '5.0');
    _officialWdBCtrl = TextEditingController(text: '7');
    _daysElapsedBCtrl = TextEditingController(text: '3');
  }

  @override
  void dispose() {
    _tabController.dispose();
    _treatments7dCtrl.dispose();
    _treatments30dCtrl.dispose();
    _amuMg30dCtrl.dispose();
    _durationCtrl.dispose();
    _drugNameBCtrl.dispose();
    _weightBCtrl.dispose();
    _doseBCtrl.dispose();
    _officialWdBCtrl.dispose();
    _daysElapsedBCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'ML Diagnostic Risk Engine',
          style: AppTypography.titleMedium.copyWith(color: Colors.white),
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: Colors.white),
          onPressed: () => Get.back(),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.accent,
          unselectedLabelColor: Colors.white70,
          indicatorColor: AppColors.accent,
          indicatorWeight: 3,
          labelStyle: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.bold),
          unselectedLabelStyle: AppTypography.labelSmall,
          tabs: const [
            Tab(icon: Icon(Icons.analytics_outlined, size: 18), text: 'Model A: AMU Overuse'),
            Tab(icon: Icon(Icons.verified_outlined, size: 18), text: 'Model B: MRL Compliance'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOveruseTab(),
          _buildComplianceTab(),
        ],
      ),
    );
  }

  Widget _buildOveruseTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _formHeader('Animal & Drug Category', Icons.pets_rounded),
                const SizedBox(height: AppSpacing.md),
                _dropdown('Species Category', _speciesA, ['cow', 'buffalo', 'goat', 'sheep', 'fishery']),
                const SizedBox(height: AppSpacing.md),
                _dropdown('Antimicrobial Class', _drugClassA, [
                  'Fluoroquinolones (CIA)',
                  '3rd Gen Cephalosporins (CIA)',
                  'Tetracyclines',
                  'Penicillins',
                  'Aminoglycosides',
                ]),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _formHeader('Clinical Exposure History', Icons.history_edu_rounded),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        controller: _treatments7dCtrl,
                        label: 'Treatments (7d)',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: AppTextField(
                        controller: _treatments30dCtrl,
                        label: 'Treatments (30d)',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        controller: _amuMg30dCtrl,
                        label: 'Total AMU (mg 30d)',
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: AppTextField(
                        controller: _durationCtrl,
                        label: 'Duration (Days)',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Obx(() => AppButton(
                label: 'Run Overuse Risk Inference',
                icon: Icons.auto_awesome_rounded,
                isLoading: controller.isLoading.value,
                isFullWidth: true,
                height: 52,
                onPressed: () {
                  controller.checkOveruseRisk(OveruseRiskRequest(
                    species: _speciesA.value,
                    primaryAntimicrobialClass: _drugClassA.value,
                    treatmentsLast7d: int.tryParse(_treatments7dCtrl.text) ?? 2,
                    treatmentsLast30d: int.tryParse(_treatments30dCtrl.text) ?? 4,
                    totalAmuMgLast30d: double.tryParse(_amuMg30dCtrl.text) ?? 240,
                    treatmentDurationDays: int.tryParse(_durationCtrl.text) ?? 6,
                  ));
                },
              )),
          const SizedBox(height: AppSpacing.xl),
          Obx(() => _buildDiagnosticResult(controller.overuseRisk.value, 'Model A • AMU Risk Analysis')),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _buildComplianceTab() {
    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _formHeader('Subject & Drug Profile', Icons.medication_rounded),
                const SizedBox(height: AppSpacing.md),
                _dropdown('Animal Species', _speciesB, ['cow', 'buffalo', 'goat', 'sheep', 'fishery']),
                const SizedBox(height: AppSpacing.md),
                AppTextField(
                  controller: _drugNameBCtrl,
                  label: 'Antimicrobial Drug Name',
                  hint: 'e.g. Enrofloxacin 10%',
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _formHeader('Dosage & Withdrawal Metrics', Icons.timer_outlined),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        controller: _weightBCtrl,
                        label: 'Weight (kg)',
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: AppTextField(
                        controller: _doseBCtrl,
                        label: 'Dose (mg/kg)',
                        keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: AppTextField(
                        controller: _officialWdBCtrl,
                        label: 'Official W/D (Days)',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: AppTextField(
                        controller: _daysElapsedBCtrl,
                        label: 'Days Elapsed',
                        keyboardType: TextInputType.number,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Obx(() => AppButton(
                label: 'Run MRL Compliance Inference',
                icon: Icons.security_rounded,
                isLoading: controller.isLoading.value,
                isFullWidth: true,
                height: 52,
                onPressed: () {
                  controller.checkComplianceRisk(ComplianceRiskRequest(
                    species: _speciesB.value,
                    drugName: _drugNameBCtrl.text,
                    weightKg: double.tryParse(_weightBCtrl.text) ?? 420.0,
                    actualDoseMgPerKg: double.tryParse(_doseBCtrl.text) ?? 5.0,
                    officialWithdrawalPeriodDays: double.tryParse(_officialWdBCtrl.text) ?? 7.0,
                    daysElapsedSinceTreatment: double.tryParse(_daysElapsedBCtrl.text) ?? 3.0,
                  ));
                },
              )),
          const SizedBox(height: AppSpacing.xl),
          Obx(() => _buildDiagnosticResult(controller.complianceRisk.value, 'Model B • MRL Residue Risk')),
          const SizedBox(height: AppSpacing.xxl),
        ],
      ),
    );
  }

  Widget _formHeader(String title, IconData icon) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: AppColors.primarySoft,
            borderRadius: AppSpacing.roundedSm,
          ),
          child: Icon(icon, size: 16, color: AppColors.primary),
        ),
        const SizedBox(width: 8),
        Text(title, style: AppTypography.titleSmall),
      ],
    );
  }

  Widget _dropdown(String label, RxString value, List<String> items) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppTypography.labelSmall),
        const SizedBox(height: 6),
        Obx(() => Container(
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppSpacing.roundedMd,
                border: Border.all(color: AppColors.border),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: value.value,
                  isExpanded: true,
                  items: items
                      .map((e) => DropdownMenuItem(
                            value: e,
                            child: Text(
                              e.contains('_')
                                  ? e.split('_').map((w) => w.capitalizeFirst ?? w).join(' ')
                                  : (e.capitalizeFirst ?? e),
                              style: AppTypography.bodySmall,
                            ),
                          ))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) value.value = val;
                  },
                ),
              ),
            )),
      ],
    );
  }

  Widget _buildDiagnosticResult(RiskResponse? risk, String engineHeader) {
    if (risk == null) return const SizedBox.shrink();

    final level = risk.riskLevel?.toUpperCase() ?? 'LOW';
    Color themeColor;
    Color bgColor;
    if (level == 'HIGH') {
      themeColor = AppColors.danger;
      bgColor = AppColors.dangerBg;
    } else if (level == 'MEDIUM') {
      themeColor = AppColors.warning;
      bgColor = AppColors.warningBg;
    } else {
      themeColor = AppColors.success;
      bgColor = AppColors.successBg;
    }

    final score = risk.riskScore ?? (level == 'HIGH' ? 0.85 : (level == 'MEDIUM' ? 0.45 : 0.12));

    return AppCard(
      padding: EdgeInsets.zero,
      borderColor: themeColor.withValues(alpha: 0.35),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.md),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(AppSpacing.radiusLg)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.auto_awesome, color: themeColor, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      engineHeader,
                      style: AppTypography.labelSmall.copyWith(color: themeColor, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: themeColor,
                    borderRadius: AppSpacing.roundedFull,
                  ),
                  child: Text(
                    '$level RISK',
                    style: AppTypography.labelSmall.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 72,
                          height: 72,
                          child: CircularProgressIndicator(
                            value: score.clamp(0.0, 1.0),
                            backgroundColor: AppColors.slate200,
                            valueColor: AlwaysStoppedAnimation<Color>(themeColor),
                            strokeWidth: 7,
                          ),
                        ),
                        Text(
                          '${(score * 100).toInt()}%',
                          style: AppTypography.titleMedium.copyWith(color: themeColor, fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(width: AppSpacing.lg),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            risk.clearanceBadge ?? (level == 'HIGH' ? 'WITHHOLD ALL PRODUCTS' : 'CLEARED FOR USE'),
                            style: AppTypography.titleSmall.copyWith(color: themeColor, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Confidence Metric: ${score.toStringAsFixed(4)} (Threshold: 0.500)',
                            style: AppTypography.bodySmall,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const Divider(height: 28),
                Text('Diagnostic Reason Codes:', style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.bold)),
                const SizedBox(height: 6),
                ...(risk.reasonCodes ?? ['Normal clinical parameters within therapeutic tolerances']).map((code) => Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Icon(Icons.check_circle_rounded, size: 14, color: themeColor),
                          const SizedBox(width: 8),
                          Expanded(child: Text(code, style: AppTypography.bodySmall)),
                        ],
                      ),
                    )),
                const SizedBox(height: AppSpacing.md),
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSubtle,
                    borderRadius: AppSpacing.roundedMd,
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.shield_outlined, size: 18, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Action Protocol', style: AppTypography.labelSmall.copyWith(color: AppColors.primary, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 2),
                            Text(risk.recommendedAction ?? 'Follow standard withdrawal periods.', style: AppTypography.bodySmall),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    ).animate().fadeIn(duration: const Duration(milliseconds: 300)).scale(begin: const Offset(0.96, 0.96));
  }
}
