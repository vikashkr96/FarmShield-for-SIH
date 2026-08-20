import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';
import '../controllers/reports_controller.dart';

class ReportsView extends GetView<ReportsController> {
  const ReportsView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Reporting Engine', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
        backgroundColor: Colors.indigo,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () => controller.shareReport(),
          ),
          IconButton(
            icon: const Icon(Icons.grid_on),
            onPressed: () => controller.exportCsv(),
            tooltip: 'Export CSV',
          ),
        ],
      ),
      body: Column(
        children: [
          _buildSelectors(context),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }
              if (controller.pdfBytes.value == null) {
                return const Center(child: Text("No data available for this report type."));
              }
              return PdfPreview(
                build: (format) => controller.pdfBytes.value!,
                useActions: false,
                allowPrinting: true,
                allowSharing: false,
              );
            }),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => controller.shareReport(),
        label: const Text('Download / Share'),
        icon: const Icon(Icons.download),
        backgroundColor: Colors.indigo,
      ),
    );
  }

  Widget _buildSelectors(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        children: [
          Obx(() => DropdownButtonFormField<ReportType>(
                value: controller.selectedReportType.value,
                decoration: InputDecoration(
                  labelText: 'Select Report Type',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.description),
                ),
                items: [
                  DropdownMenuItem(
                      value: ReportType.passport,
                      child: Text('📄 Official Animal Food Safety Passport', style: GoogleFonts.poppins())),
                  DropdownMenuItem(
                      value: ReportType.amuAudit,
                      child: Text('📊 Monthly Farm AMU Compliance Audit', style: GoogleFonts.poppins())),
                  DropdownMenuItem(
                      value: ReportType.labResidue,
                      child: Text('📜 Analytical Lab Residue Report', style: GoogleFonts.poppins())),
                ],
                onChanged: (val) {
                  if (val != null) {
                    controller.selectedReportType.value = val;
                    controller.generatePreview();
                  }
                },
              )),
          const SizedBox(height: 12),
          Obx(() => InkWell(
                onTap: () async {
                  final range = await showDateRangePicker(
                    context: context,
                    firstDate: DateTime(2020),
                    lastDate: DateTime.now(),
                    initialDateRange: controller.dateRange.value,
                  );
                  if (range != null) {
                    controller.updateDateRange(range);
                  }
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 15),
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade400),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.date_range, color: Colors.indigo),
                      const SizedBox(width: 10),
                      Text(
                        "Date Range: ${DateFormat('MMM dd, yyyy').format(controller.dateRange.value.start)} - ${DateFormat('MMM dd, yyyy').format(controller.dateRange.value.end)}",
                        style: GoogleFonts.poppins(),
                      ),
                      const Spacer(),
                      const Icon(Icons.edit, size: 18),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }
}
