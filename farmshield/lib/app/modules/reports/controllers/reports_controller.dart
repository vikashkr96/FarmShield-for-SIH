import 'dart:convert';
import 'dart:typed_data';
import 'package:csv/csv.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:share_plus/share_plus.dart';
import 'package:image_picker/image_picker.dart'; // To get XFile
import '../../../data/repositories/farm_repository.dart';
import '../services/pdf_generator_service.dart';

enum ReportType { passport, amuAudit, labResidue }

class ReportsController extends GetxController {
  final FarmRepository repository;
  ReportsController({required this.repository});

  final selectedReportType = ReportType.passport.obs;
  final dateRange = DateTimeRange(
    start: DateTime.now().subtract(const Duration(days: 30)),
    end: DateTime.now(),
  ).obs;

  final Rx<Uint8List?> pdfBytes = Rx<Uint8List?>(null);
  final isLoading = false.obs;

  @override
  void onInit() {
    super.onInit();
    generatePreview();
  }

  Future<void> generatePreview() async {
    isLoading.value = true;
    try {
      switch (selectedReportType.value) {
        case ReportType.passport:
          final animals = await repository.getAnimals();
          if (animals.isNotEmpty) {
            final animal = animals.first;
            pdfBytes.value = await PdfGeneratorService.generateAnimalPassport(animal.toJson());
          }
          break;
        case ReportType.amuAudit:
          final summary = await repository.getAmuSummary();
          pdfBytes.value = await PdfGeneratorService.generateComplianceAudit({
            'farm_id': 'FARM-9988',
            'period': '${dateRange.value.start.year}-${dateRange.value.start.month}',
            'total_amu': summary.totalBiomassTreatedKg?.toDouble() ?? 0.0,
            'cia_index': 12.5,
            'compliance_rate': 98.2,
            'animal_details': [
              ['Animal ID', 'Treatments', 'Compliance'],
              ['A-101', '3', 'Pass'],
              ['A-102', '1', 'Pass'],
            ]
          });
          break;
        case ReportType.labResidue:
          pdfBytes.value = await PdfGeneratorService.generateComplianceAudit({
            'farm_id': 'LAB-RPT-001',
            'period': 'Residue Analysis',
            'total_amu': 0.0,
            'cia_index': 0.0,
            'compliance_rate': 100,
            'findings': 'All tested samples were below MRL thresholds.'
          });
          break;
      }
    } catch (e) {
      Get.snackbar('Error', 'Failed to generate report preview: $e');
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> shareReport() async {
    if (pdfBytes.value == null) return;
    try {
      final XFile xFile = XFile.fromData(
        pdfBytes.value!,
        name: 'FarmShield_Report.pdf',
        mimeType: 'application/pdf',
      );
      await Share.shareXFiles([xFile], text: 'Sharing FarmShield Report');
    } catch (e) {
      Get.snackbar('Share Error', e.toString());
    }
  }

  Future<void> exportCsv() async {
    try {
      List<List<dynamic>> csvData = [
        ['Date', 'Type', 'Value', 'Unit'],
        [DateTime.now().toIso8601String(), 'AMU Usage', '45.2', 'mg/PCU'],
        [DateTime.now().toIso8601String(), 'Compliance', '98', '%'],
      ];
      String csv = ListToCsvConverter().convert(csvData);
      final bytes = utf8.encode(csv);
      final XFile xFile = XFile.fromData(
        Uint8List.fromList(bytes),
        name: 'FarmShield_Data.csv',
        mimeType: 'text/csv',
      );
      await Share.shareXFiles([xFile], text: 'Exporting CSV Data');
    } catch (e) {
      Get.snackbar('Export Error', e.toString());
    }
  }

  void updateDateRange(DateTimeRange range) {
    dateRange.value = range;
    generatePreview();
  }
}
