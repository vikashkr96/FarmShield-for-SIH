import 'dart:typed_data';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:intl/intl.dart';

class PdfGeneratorService {
  static Future<Uint8List> generateAnimalPassport(Map<String, dynamic> animalData) async {
    final pdf = pw.Document();
    final dateStr = DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now());

    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Header(
                level: 0,
                child: pw.Row(
                  mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                  children: [
                    pw.Text('OFFICIAL ANIMAL FOOD SAFETY PASSPORT', 
                        style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 18)),
                    pw.Text('FarmShield Secure', style: const pw.TextStyle(color: PdfColors.teal)),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),
              pw.Text('Date Generated: $dateStr'),
              pw.Divider(),
              pw.SizedBox(height: 10),
              pw.Text('Animal Details', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
              pw.Bullet(text: 'Animal ID: ${animalData['animal_code'] ?? animalData['id'] ?? 'N/A'}'),
              pw.Bullet(text: 'Species: ${animalData['species'] ?? 'N/A'}'),
              pw.Bullet(text: 'Breed: ${animalData['breed'] ?? 'N/A'}'),
              pw.Bullet(text: 'Date of Birth: ${animalData['dob'] ?? 'N/A'}'),
              pw.Bullet(text: 'Owner/Farm: ${animalData['farm_name'] ?? 'Main Farm'}'),
              pw.SizedBox(height: 20),
              pw.Text('Health & Treatment Summary', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
              pw.TableHelper.fromTextArray(
                context: context,
                data: <List<String>>[
                  <String>['Date', 'Treatment', 'Medicine', 'Withdrawal End'],
                  ...((animalData['treatments'] as List? ?? []).map((t) => [
                        t['date']?.toString() ?? '',
                        t['type']?.toString() ?? '',
                        t['medicine']?.toString() ?? '',
                        t['withdrawal_end']?.toString() ?? 'CLEARED'
                      ])),
                ],
              ),
              pw.SizedBox(height: 40),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Container(
                        width: 150, 
                        decoration: const pw.BoxDecoration(
                          border: pw.Border(bottom: pw.BorderSide())
                        )
                      ),
                      pw.Text('Authorized Veterinarian Signature'),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('Status: COMPLIANT', style: pw.TextStyle(color: PdfColors.green, fontWeight: pw.FontWeight.bold)),
                    ],
                  ),
                ],
              ),
              pw.Footer(
                padding: const pw.EdgeInsets.only(top: 20),
                leading: pw.Text('Document ID: FS-${animalData['id']}-$dateStr'),
              )
            ],
          );
        },
      ),
    );

    return pdf.save();
  }

  static Future<Uint8List> generateComplianceAudit(Map<String, dynamic> auditData) async {
    final pdf = pw.Document();
    
    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        header: (context) => pw.Text('Monthly Farm AMU Compliance Audit', style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold)),
        build: (pw.Context context) => [
          pw.SizedBox(height: 20),
          pw.Text('Farm ID: ${auditData['farm_id']}'),
          pw.Text('Audit Period: ${auditData['period']}'),
          pw.SizedBox(height: 10),
          pw.Divider(),
          pw.SizedBox(height: 20),
          pw.Text('AMU Metrics Breakdown', style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
          pw.Bullet(text: 'Total Antimicrobials Used: ${auditData['total_amu']} mg/PCU'),
          pw.Bullet(text: 'Critical Importance Index: ${auditData['cia_index']}%'),
          pw.Bullet(text: 'Compliance Rate: ${auditData['compliance_rate']}%'),
          pw.SizedBox(height: 20),
          pw.Text('Individual Animal Adherence'),
          pw.TableHelper.fromTextArray(
            data: List<List<String>>.from((auditData['animal_details'] as List? ?? [['No Data']]).map((row) => List<String>.from(row))),
          ),
          pw.SizedBox(height: 30),
          pw.Paragraph(text: 'Audit Findings: ${auditData['findings'] ?? 'No significant deviations detected.'}'),
          pw.SizedBox(height: 50),
          pw.Align(
            alignment: pw.Alignment.centerRight,
            child: pw.Column(
              children: [
                pw.Container(
                  width: 200, 
                  decoration: const pw.BoxDecoration(
                    border: pw.Border(bottom: pw.BorderSide())
                  )
                ),
                pw.Text('Farm Quality Manager Signature'),
              ]
            )
          )
        ],
      ),
    );
    return pdf.save();
  }
}
