import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../data/models/risk_models.dart';
import '../controllers/risk_assessment_controller.dart';

class RiskAssessmentView extends GetView<RiskAssessmentController> {
  const RiskAssessmentView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          title: Text(
            'ML Diagnostic Risk Engine',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 18),
          ),
          backgroundColor: const Color(0xFF0F172A),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Colors.white),
            onPressed: () => Get.back(),
          ),
          bottom: TabBar(
            labelColor: Colors.greenAccent,
            unselectedLabelColor: Colors.white60,
            indicatorColor: Colors.greenAccent,
            indicatorWeight: 3,
            labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13),
            unselectedLabelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 13),
            tabs: const [
              Tab(icon: Icon(Icons.analytics_outlined), text: 'Model A: AMU Overuse'),
              Tab(icon: Icon(Icons.verified_outlined), text: 'Model B: MRL Compliance'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildOveruseForm(),
            _buildComplianceForm(),
          ],
        ),
      ),
    );
  }

  Widget _buildOveruseForm() {
    final species = 'cow'.obs;
    final treatments7d = TextEditingController(text: '2');
    final treatments30d = TextEditingController(text: '4');
    final amuMg30d = TextEditingController(text: '240');
    final duration = TextEditingController(text: '6');
    final drugClass = 'Fluoroquinolones (CIA)'.obs;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCockpitCard(
            title: 'Animal & Farm Parameters',
            icon: Icons.pets,
            children: [
              _buildDropdown('Species Category', species, ['cow', 'buffalo', 'goat', 'sheep', 'fishery']),
              const SizedBox(height: 12),
              _buildDropdown('Antimicrobial Class', drugClass, [
                'Fluoroquinolones (CIA)',
                '3rd Gen Cephalosporins (CIA)',
                'Tetracyclines',
                'Penicillins',
                'Aminoglycosides',
              ]),
            ],
          ),
          const SizedBox(height: 16),
          _buildCockpitCard(
            title: 'Clinical Exposure History',
            icon: Icons.history_edu,
            children: [
              Row(
                children: [
                  Expanded(child: _buildTextField('Treatments (7d)', treatments7d)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildTextField('Treatments (30d)', treatments30d)),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _buildTextField('Total AMU (mg in 30d)', amuMg30d)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildTextField('Duration (Days)', duration)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          Obx(() => controller.isLoading.value 
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF1B5E20)))
            : Container(
                width: double.infinity,
                height: 54,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1B5E20), Color(0xFF2E7D32)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF1B5E20).withOpacity(0.35),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () {
                    controller.checkOveruseRisk(OveruseRiskRequest(
                      species: species.value,
                      primaryAntimicrobialClass: drugClass.value,
                      treatmentsLast7d: int.tryParse(treatments7d.text) ?? 2,
                      treatmentsLast30d: int.tryParse(treatments30d.text) ?? 4,
                      totalAmuMgLast30d: double.tryParse(amuMg30d.text) ?? 240,
                      treatmentDurationDays: int.tryParse(duration.text) ?? 6,
                    ));
                  },
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.bolt, color: Colors.greenAccent),
                      const SizedBox(width: 8),
                      Text('RUN OVERUSE INFERENCE', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
                    ],
                  ),
                ),
              )),
          const SizedBox(height: 24),
          Obx(() => _buildDiagnosticResult(controller.overuseRisk.value, 'Model A • AMU Risk Analysis')),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildComplianceForm() {
    final species = 'cow'.obs;
    final drugName = TextEditingController(text: 'Enrofloxacin 10%');
    final weight = TextEditingController(text: '420');
    final dose = TextEditingController(text: '5.0');
    final officialWd = TextEditingController(text: '7');
    final daysElapsed = TextEditingController(text: '3');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildCockpitCard(
            title: 'Subject & Drug Profile',
            icon: Icons.medication,
            children: [
              _buildDropdown('Animal Species', species, ['cow', 'buffalo', 'goat', 'sheep', 'fishery']),
              const SizedBox(height: 12),
              _buildTextField('Antimicrobial Drug Name', drugName, isNumeric: false),
            ],
          ),
          const SizedBox(height: 16),
          _buildCockpitCard(
            title: 'Dosage & Withdrawal Metrics',
            icon: Icons.timer_outlined,
            children: [
              Row(
                children: [
                  Expanded(child: _buildTextField('Animal Weight (kg)', weight)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildTextField('Actual Dose (mg/kg)', dose)),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(child: _buildTextField('Required W/D (Days)', officialWd)),
                  const SizedBox(width: 12),
                  Expanded(child: _buildTextField('Days Elapsed', daysElapsed)),
                ],
              ),
            ],
          ),
          const SizedBox(height: 20),
          Obx(() => controller.isLoading.value 
            ? const Center(child: CircularProgressIndicator(color: Color(0xFF0F172A)))
            : Container(
                width: double.infinity,
                height: 54,
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFF0F172A).withOpacity(0.35),
                      blurRadius: 16,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                  onPressed: () {
                    controller.checkComplianceRisk(ComplianceRiskRequest(
                      species: species.value,
                      drugName: drugName.text,
                      weightKg: double.tryParse(weight.text) ?? 420.0,
                      actualDoseMgPerKg: double.tryParse(dose.text) ?? 5.0,
                      officialWithdrawalPeriodDays: double.tryParse(officialWd.text) ?? 7.0,
                      daysElapsedSinceTreatment: double.tryParse(daysElapsed.text) ?? 3.0,
                    ));
                  },
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.security, color: Colors.cyanAccent),
                      const SizedBox(width: 8),
                      Text('RUN COMPLIANCE INFERENCE', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
                    ],
                  ),
                ),
              )),
          const SizedBox(height: 24),
          Obx(() => _buildDiagnosticResult(controller.complianceRisk.value, 'Model B • MRL Residue Risk')),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildCockpitCard({required String title, required IconData icon, required List<Widget> children}) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F172A).withOpacity(0.08),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, size: 18, color: const Color(0xFF0F172A)),
              ),
              const SizedBox(width: 10),
              Text(
                title,
                style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 14, color: const Color(0xFF0F172A)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController ctrl, {bool isNumeric = true}) {
    return TextField(
      controller: ctrl,
      keyboardType: isNumeric ? const TextInputType.numberWithOptions(decimal: true) : TextInputType.text,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF1B5E20), width: 1.5),
        ),
      ),
    );
  }

  Widget _buildDropdown(String label, RxString value, List<String> items) {
    return Obx(() => DropdownButtonFormField<String>(
      value: value.value,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade600),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade200),
        ),
      ),
      items: items.map((e) => DropdownMenuItem(value: e, child: Text(e, style: GoogleFonts.poppins(fontSize: 13)))).toList(),
      onChanged: (val) {
        if (val != null) value.value = val;
      },
    ));
  }

  Widget _buildDiagnosticResult(RiskResponse? risk, String engineHeader) {
    if (risk == null) return const SizedBox.shrink();
    
    final level = risk.riskLevel?.toUpperCase() ?? 'LOW';
    Color themeColor;
    Color bgColor;
    if (level == 'HIGH') {
      themeColor = const Color(0xFFDC2626);
      bgColor = const Color(0xFFFEF2F2);
    } else if (level == 'MEDIUM') {
      themeColor = const Color(0xFFD97706);
      bgColor = const Color(0xFFFFFBEB);
    } else {
      themeColor = const Color(0xFF16A34A);
      bgColor = const Color(0xFFF0FDF4);
    }

    final score = risk.riskScore ?? (level == 'HIGH' ? 0.85 : (level == 'MEDIUM' ? 0.45 : 0.12));

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: themeColor.withOpacity(0.3), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: themeColor.withOpacity(0.12),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
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
                      style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12, color: themeColor),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: themeColor,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '$level RISK',
                    style: GoogleFonts.poppins(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        SizedBox(
                          width: 80,
                          height: 80,
                          child: CircularProgressIndicator(
                            value: score.clamp(0.0, 1.0),
                            backgroundColor: Colors.grey.shade100,
                            valueColor: AlwaysStoppedAnimation<Color>(themeColor),
                            strokeWidth: 8,
                          ),
                        ),
                        Text(
                          '${(score * 100).toInt()}%',
                          style: GoogleFonts.poppins(fontSize: 18, fontWeight: FontWeight.bold, color: themeColor),
                        ),
                      ],
                    ),
                    const SizedBox(width: 20),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            risk.clearanceBadge ?? (level == 'HIGH' ? 'WITHHOLD ALL PRODUCTS' : 'CLEARED FOR USE'),
                            style: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold, color: themeColor),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Risk Metric: ${score.toStringAsFixed(4)} (Threshold: 0.500)',
                            style: GoogleFonts.poppins(fontSize: 11, color: Colors.blueGrey.shade600),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const Divider(height: 32),
                Text('Diagnostic Reason Codes:', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13)),
                const SizedBox(height: 8),
                ...(risk.reasonCodes ?? ['Normal clinical parameters within therapeutic tolerances']).map((code) => Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Padding(
                        padding: const EdgeInsets.only(top: 2),
                        child: Icon(Icons.check_circle, size: 14, color: themeColor),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          code,
                          style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade800),
                        ),
                      ),
                    ],
                  ),
                )),
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF8FAFC),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(Icons.medical_services_outlined, size: 20, color: Color(0xFF1B5E20)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Action Protocol',
                              style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12, color: const Color(0xFF1B5E20)),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              risk.recommendedAction ?? 'Follow standard withdrawal periods.',
                              style: GoogleFonts.poppins(fontSize: 12, color: Colors.blueGrey.shade700),
                            ),
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
    ).animate().fadeIn(duration: const Duration(milliseconds: 350)).scale(begin: const Offset(0.95, 0.95));
  }
}
