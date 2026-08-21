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
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(
          'Compliance & Audit Reports',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18),
        ),
        backgroundColor: const Color(0xFF1B5E20),
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
          const SizedBox(width: 6),
        ],
      ),
      body: Column(
        children: [
          _buildSelectors(context),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator(color: Color(0xFF1B5E20)));
              }
              if (controller.pdfBytes.value == null) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.picture_as_pdf_outlined, size: 64, color: Colors.blueGrey.shade200),
                      const SizedBox(height: 12),
                      Text(
                        "No data available for this report criteria.",
                        style: GoogleFonts.poppins(color: Colors.blueGrey.shade500, fontSize: 14),
                      ),
                    ],
                  ),
                );
              }
              return Container(
                margin: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.04),
                      blurRadius: 16,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(20),
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
          'Download / Share PDF',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13),
        ),
        icon: const Icon(Icons.file_download_outlined, size: 20),
        backgroundColor: const Color(0xFF1B5E20),
        foregroundColor: Colors.white,
      ),
    );
  }

  Widget _buildSelectors(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.symmetric(horizontal: (Get.width * 0.04).clamp(12.0, 20.0), vertical: 14),
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Report Configuration',
            style: GoogleFonts.poppins(fontSize: 13, fontWeight: FontWeight.bold, color: const Color(0xFF1B5E20)),
          ),
          const SizedBox(height: 10),
          Obx(() => DropdownButtonFormField<ReportType>(
                value: controller.selectedReportType.value,
                isExpanded: true,
                decoration: InputDecoration(
                  labelText: 'Report Type',
                  labelStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600),
                  filled: true,
                  fillColor: const Color(0xFFF8FAFC),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade300)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade200)),
                  prefixIcon: const Icon(Icons.description_outlined, color: Color(0xFF1B5E20)),
                ),
                items: [
                  DropdownMenuItem(
                    value: ReportType.passport,
                    child: Text(
                      '📄 Official Animal Food Safety Passport',
                      style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  DropdownMenuItem(
                    value: ReportType.amuAudit,
                    child: Text(
                      '📊 Monthly Farm AMU Compliance Audit',
                      style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  DropdownMenuItem(
                    value: ReportType.labResidue,
                    child: Text(
                      '📜 Analytical Lab Residue Report',
                      style: GoogleFonts.poppins(fontSize: 12, fontWeight: FontWeight.w500),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
                onChanged: (val) {
                  if (val != null) {
                    controller.selectedReportType.value = val;
                    controller.generatePreview();
                  }
                },
              )),
          const SizedBox(height: 10),
          Obx(() => InkWell(
                borderRadius: BorderRadius.circular(14),
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
                            primary: Color(0xFF1B5E20),
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
                    color: const Color(0xFFF8FAFC),
                    border: Border.all(color: Colors.grey.shade200),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.date_range_outlined, color: Color(0xFF1B5E20), size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          "${DateFormat('dd MMM yyyy').format(controller.dateRange.value.start)} - ${DateFormat('dd MMM yyyy').format(controller.dateRange.value.end)}",
                          style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade800, fontWeight: FontWeight.w500),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const Icon(Icons.edit_calendar_outlined, size: 18, color: Colors.blueGrey),
                    ],
                  ),
                ),
              )),
        ],
      ),
    );
  }
}
