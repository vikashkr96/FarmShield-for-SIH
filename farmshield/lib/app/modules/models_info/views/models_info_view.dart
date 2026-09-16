import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../core/widgets/app_header_bar.dart';
import '../../../core/widgets/app_loading_skeleton.dart';
import '../controllers/models_info_controller.dart';

class ModelsInfoView extends GetView<ModelsInfoController> {
  const ModelsInfoView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: const AppHeaderBar(
        title: 'ML Model Benchmarks',
        subtitle: 'Production Inference & Performance Metrics',
      ),
      body: controller.obx(
        (data) => ListView(
          physics: const BouncingScrollPhysics(),
          padding: const EdgeInsets.all(AppSpacing.lg),
          children: [
            _buildProjectHeader(data!['project']),
            const SizedBox(height: AppSpacing.lg),
            _buildModelCard('Model A: Overuse Risk Classifier', data['model_a']),
            const SizedBox(height: AppSpacing.lg),
            _buildModelCard('Model B: MRL Residue Compliance Engine', data['model_b']),
            const SizedBox(height: AppSpacing.xxl),
          ],
        ),
        onLoading: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            children: [
              AppLoadingSkeleton.card(height: 70),
              const SizedBox(height: AppSpacing.lg),
              AppLoadingSkeleton.card(height: 200),
              const SizedBox(height: AppSpacing.lg),
              AppLoadingSkeleton.card(height: 200),
            ],
          ),
        ),
        onError: (err) => AppEmptyState.error(
          message: err,
          onRetry: () => controller.fetchModelsInfo(),
        ),
      ),
    );
  }

  Widget _buildProjectHeader(String? title) {
    return AppCard(
      color: AppColors.primarySoft,
      borderColor: AppColors.accent.withValues(alpha: 0.3),
      child: Row(
        children: [
          const Icon(Icons.auto_awesome_rounded, color: AppColors.primary, size: 22),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              title ?? 'Digital Farm Livestock Surveillance Portal',
              style: AppTypography.titleSmall.copyWith(color: AppColors.primaryDark),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildModelCard(String title, Map<String, dynamic> model) {
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: AppColors.primarySoft,
                  borderRadius: AppSpacing.roundedSm,
                ),
                child: const Icon(Icons.analytics_rounded, size: 18, color: AppColors.primary),
              ),
              const SizedBox(width: 8),
              Text(title, style: AppTypography.titleSmall),
            ],
          ),
          const Divider(height: 24),
          _metricRow('Algorithm Architecture', model['algorithm']),
          _metricRow('Macro F1 Score', model['macro_f1']?.toString()),
          _metricRow('ROC-AUC (OvR)', model['roc_auc_ovr']?.toString()),
          _metricRow('Training Samples', model['n_samples']?.toString()),
          _metricRow('Model Precision', model['precision']?.toString()),
        ],
      ),
    );
  }

  Widget _metricRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: AppTypography.bodySmall),
          Text(
            value ?? 'N/A',
            style: AppTypography.labelSmall.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}
