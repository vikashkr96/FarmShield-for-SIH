import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:printing/printing.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../controllers/reports_controller.dart';

class ReportsView extends GetView<ReportsController> {
  const ReportsView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Compliance & Audit Reports',
          style: AppTypography.titleMedium.copyWith(color: Colors.white),
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.share_outlined, color: Colors.white),
            tooltip: 'Share Report',
            onPressed: () => controller.shareReport(),
          ),
          IconButton(
            icon: const Icon(Icons.table_chart_outlined, color: Colors.white),
            tooltip: 'Export CSV',
            onPressed: () => controller.exportCsv(),
          ),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: Column(
        children: [
          _buildSelectors(context),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator(color: AppColors.primary));
              }
              if (controller.pdfBytes.value == null) {
                return AppEmptyState(
                  icon: Icons.picture_as_pdf_outlined,
                  title: 'No Report Generated',
                  description: 'No data found matching the selected report criteria and timeframe.',
                  actionLabel: 'Generate Audit Report',
                  onAction: () => controller.generatePreview(),
                );
              }
              return Container(
                margin: const EdgeInsets.fromLTRB(AppSpacing.lg, 0, AppSpacing.lg, 80),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: AppSpacing.roundedLg,
                  boxShadow: AppSpacing.shadowCard,
                  border: Border.all(color: AppColors.border),
                ),
                child: ClipRRect(
                  borderRadius: AppSpacing.roundedLg,
                  child: PdfPreview(
                    build: (format) => controller.pdfBytes.value!,
                    useActions: false,
                    allowPrinting: true,
                    allowSharing: false,
                  ),
                ),
              );
            }),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => controller.shareReport(),
        label: Text(
          'Export / Share PDF',
          style: AppTypography.labelMedium.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        icon: const Icon(Icons.file_download_outlined, size: 20, color: Colors.white),
        backgroundColor: AppColors.primary,
      ),
    );
  }

  Widget _buildSelectors(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: AppCard(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Report Configuration & Range',
              style: AppTypography.titleSmall.copyWith(color: AppColors.primary, fontSize: 13),
            ),
            const SizedBox(height: AppSpacing.sm),
            Obx(() => DropdownButtonFormField<ReportType>(
                  initialValue: controller.selectedReportType.value,
                  isExpanded: true,
                  decoration: InputDecoration(
                    labelText: 'Report Type',
                    prefixIcon: const Icon(Icons.description_outlined, color: AppColors.primary, size: 20),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  ),
                  items: [
                    DropdownMenuItem(
                      value: ReportType.passport,
                      child: Text('Official Animal Food Safety Passport', style: AppTypography.bodySmall),
                    ),
                    DropdownMenuItem(
                      value: ReportType.amuAudit,
                      child: Text('Monthly Farm AMU Compliance Audit', style: AppTypography.bodySmall),
                    ),
                    DropdownMenuItem(
                      value: ReportType.labResidue,
                      child: Text('Analytical Lab Residue Report', style: AppTypography.bodySmall),
                    ),
                  ],
                  onChanged: (val) {
                    if (val != null) {
                      controller.selectedReportType.value = val;
                      controller.generatePreview();
                    }
                  },
                )),
            const SizedBox(height: AppSpacing.sm),
            Obx(() => InkWell(
                  borderRadius: AppSpacing.roundedMd,
                  onTap: () async {
                    final range = await showDateRangePicker(
                      context: context,
                      firstDate: DateTime(2020),
                      lastDate: DateTime.now(),
                      initialDateRange: controller.dateRange.value,
                      builder: (context, child) {
                        return Theme(
                          data: Theme.of(context).copyWith(
                            colorScheme: const ColorScheme.light(
                              primary: AppColors.primary,
                              onPrimary: Colors.white,
                            ),
                          ),
                          child: child!,
                        );
                      },
                    );
                    if (range != null) {
                      controller.updateDateRange(range);
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSubtle,
                      border: Border.all(color: AppColors.border),
                      borderRadius: AppSpacing.roundedMd,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.date_range_rounded, color: AppColors.primary, size: 18),
                            const SizedBox(width: 8),
                            Text('Audit Period', style: AppTypography.bodySmall),
                          ],
                        ),
                        Text(
                          '${DateFormat('dd MMM yy').format(controller.dateRange.value.start)} - ${DateFormat('dd MMM yy').format(controller.dateRange.value.end)}',
                          style: AppTypography.labelSmall.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ),
                )),
          ],
        ),
      ),
    );
  }
}
