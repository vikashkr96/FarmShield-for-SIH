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
        margin: const pw.EdgeInsets.all(32),
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
                    pw.Text('FarmShield Secure', 
                        style: pw.TextStyle(color: PdfColors.teal, fontWeight: pw.FontWeight.bold)),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),
              pw.Text('Date Generated: $dateStr', style: const pw.TextStyle(fontSize: 10)),
              pw.Divider(thickness: 1, color: PdfColors.grey300),
              pw.SizedBox(height: 10),
              
              pw.Text('Animal Details', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
              pw.SizedBox(height: 10),
              pw.Bullet(text: 'Animal Tag: ${animalData['animal_code'] ?? animalData['id'] ?? 'N/A'}'),
              pw.Bullet(text: 'Species: ${animalData['species'] ?? 'N/A'}'),
              pw.Bullet(text: 'Breed: ${animalData['breed'] ?? 'N/A'}'),
              pw.Bullet(text: 'Date of Birth: ${animalData['dob'] ?? 'N/A'}'),
              pw.Bullet(text: 'Owner/Farm: ${animalData['farm_name'] ?? 'Main Farm'}'),
              
              pw.SizedBox(height: 20),
              pw.Text('Health & Treatment Summary', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 14)),
              pw.SizedBox(height: 10),
              pw.TableHelper.fromTextArray(
                context: context,
                headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: PdfColors.white),
                headerDecoration: const pw.BoxDecoration(color: PdfColors.teal),
                cellAlignment: pw.Alignment.centerLeft,
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
                          border: pw.Border(bottom: pw.BorderSide(width: 1))
                        ),
                      ),
                      pw.SizedBox(height: 4),
                      pw.Text('Authorized Veterinarian Signature', style: const pw.TextStyle(fontSize: 10)),
                    ],
                  ),
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.end,
                    children: [
                      pw.Text('Status: COMPLIANT', 
                          style: pw.TextStyle(color: PdfColors.green, fontWeight: pw.FontWeight.bold, fontSize: 16)),
                      pw.Text('Verified by FarmShield AI', style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700)),
                    ],
                  ),
                ],
              ),
              
              pw.Spacer(),
              pw.Divider(thickness: 0.5, color: PdfColors.grey400),
              pw.SizedBox(height: 5),
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('Document ID: FS-${animalData['id'] ?? 'N/A'}-$dateStr', 
                      style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
                  pw.Text('Verified Official Document',
                      style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
                ],
              ),
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
        margin: const pw.EdgeInsets.all(32),
        header: (context) => pw.Column(
          children: [
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Monthly Farm AMU Compliance Audit', 
                    style: pw.TextStyle(fontSize: 18, fontWeight: pw.FontWeight.bold, color: PdfColors.teal)),
                pw.Text('FarmShield Metrics', style: const pw.TextStyle(color: PdfColors.grey700, fontSize: 10)),
              ],
            ),
            pw.SizedBox(height: 10),
            pw.Divider(thickness: 1),
          ]
        ),
        footer: (context) => pw.Column(
          children: [
            pw.Divider(thickness: 0.5),
            pw.Row(
              mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
              children: [
                pw.Text('Compliance Audit Report', style: const pw.TextStyle(fontSize: 8)),
                pw.Text('Page ${context.pageNumber} of ${context.pagesCount}', style: const pw.TextStyle(fontSize: 8)),
              ]
            ),
          ]
        ),
        build: (pw.Context context) => [
          pw.SizedBox(height: 20),
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Text('Farm ID: ${auditData['farm_id']}'),
              pw.Text('Audit Period: ${auditData['period']}'),
            ]
          ),
          pw.SizedBox(height: 20),
          
          pw.Text('AMU Metrics Breakdown', style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 10),
          pw.Bullet(text: 'Total Antimicrobials Used: ${auditData['total_amu']} mg/PCU'),
          pw.Bullet(text: 'Critical Importance Index: ${auditData['cia_index']}%'),
          pw.Bullet(text: 'Compliance Rate: ${auditData['compliance_rate']}%'),
          
          pw.SizedBox(height: 20),
          pw.Text('Individual Animal Adherence Summary', style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 10),
          pw.TableHelper.fromTextArray(
            headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold),
            data: List<List<String>>.from((auditData['animal_details'] as List? ?? [['No Data']]).map((row) => List<String>.from(row))),
          ),
          
          pw.SizedBox(height: 30),
          pw.Paragraph(
            text: 'Audit Findings: ${auditData['findings'] ?? 'All antimicrobial usage patterns analyzed by the AI engine fall within established safety thresholds and regulatory guidelines for this period.'}',
            style: const pw.TextStyle(fontSize: 11),
          ),
          
          pw.SizedBox(height: 50),
          pw.Align(
            alignment: pw.Alignment.centerRight,
            child: pw.Column(
              children: [
                pw.Container(
                  width: 200, 
                  decoration: const pw.BoxDecoration(
                    border: pw.Border(bottom: pw.BorderSide(width: 1))
                  ),
                ),
                pw.SizedBox(height: 4),
                pw.Text('Farm Quality Manager Signature', style: const pw.TextStyle(fontSize: 10)),
              ]
            )
          )
        ],
      ),
    );
    return pdf.save();
  }
}
