import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../data/models/risk_models.dart';
import '../controllers/risk_assessment_controller.dart';

class RiskAssessmentView extends GetView<RiskAssessmentController> {
  const RiskAssessmentView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text('ML Risk Engine', style: GoogleFonts.poppins(fontWeight: FontWeight.bold)),
          backgroundColor: Colors.blue.shade800,
          foregroundColor: Colors.white,
          bottom: const TabBar(
            labelColor: Colors.white,
            unselectedLabelColor: Colors.white70,
            indicatorColor: Colors.white,
            tabs: [
              Tab(text: 'Overuse Risk'),
              Tab(text: 'Compliance Risk'),
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
    final treatments30d = TextEditingController(text: '5');
    final amuMg30d = TextEditingController(text: '150');
    final duration = TextEditingController(text: '5');
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('Animal Profile'),
          _buildDropdown('Species', species, ['cow', 'buffalo', 'goat', 'sheep', 'fishery']),
          const SizedBox(height: 16),
          _buildSectionTitle('Treatment History'),
          _buildTextField('Treatments (Last 7 Days)', treatments7d),
          _buildTextField('Treatments (Last 30 Days)', treatments30d),
          _buildTextField('Total AMU (mg) Last 30 Days', amuMg30d),
          _buildTextField('Planned Duration (Days)', duration),
          const SizedBox(height: 24),
          Obx(() => controller.isLoading.value 
            ? const Center(child: CircularProgressIndicator())
            : SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue.shade800,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    controller.checkOveruseRisk(OveruseRiskRequest(
                      species: species.value,
                      treatmentsLast7d: int.tryParse(treatments7d.text),
                      treatmentsLast30d: int.tryParse(treatments30d.text),
                      totalAmuMgLast30d: double.tryParse(amuMg30d.text),
                      treatmentDurationDays: int.tryParse(duration.text),
                    ));
                  },
                  child: const Text('RUN OVERUSE INFERENCE', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              )),
          const SizedBox(height: 24),
          Obx(() => _buildRiskResult(controller.overuseRisk.value)),
        ],
      ),
    );
  }

  Widget _buildComplianceForm() {
    final drugName = TextEditingController(text: 'Enrofloxacin');
    final weight = TextEditingController(text: '400');
    final dose = TextEditingController(text: '10');
    final daysElapsed = TextEditingController(text: '3');

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildSectionTitle('Medication Data'),
          _buildTextField('Antimicrobial Name', drugName),
          _buildTextField('Animal Weight (kg)', weight),
          _buildTextField('Actual Dose (mg/kg)', dose),
          _buildTextField('Days Elapsed Since Treatment', daysElapsed),
          const SizedBox(height: 24),
          Obx(() => controller.isLoading.value 
            ? const Center(child: CircularProgressIndicator())
            : SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.indigo.shade800,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    controller.checkComplianceRisk(ComplianceRiskRequest(
                      drugName: drugName.text,
                      weightKg: double.tryParse(weight.text),
                      actualDoseMgPerKg: double.tryParse(dose.text),
                      daysElapsedSinceTreatment: double.tryParse(daysElapsed.text),
                    ));
                  },
                  child: const Text('RUN COMPLIANCE INFERENCE', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              )),
          const SizedBox(height: 24),
          Obx(() => _buildRiskResult(controller.complianceRisk.value)),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(title, style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.grey.shade700)),
    );
  }

  Widget _buildTextField(String label, TextEditingController ctrl) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: TextField(
        controller: ctrl,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
          fillColor: Colors.grey.shade50,
        ),
        keyboardType: const TextInputType.numberWithOptions(decimal: true),
      ),
    );
  }

  Widget _buildDropdown(String label, RxString value, List<String> items) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: DropdownButtonFormField<String>(
        value: value.value,
        decoration: InputDecoration(
          labelText: label,
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          filled: true,
          fillColor: Colors.grey.shade50,
        ),
        items: items.map((e) => DropdownMenuItem(value: e, child: Text(e.capitalizeFirst!))).toList(),
        onChanged: (val) => value.value = val!,
      ),
    );
  }

  Widget _buildRiskResult(RiskResponse? risk) {
    if (risk == null) return const SizedBox();
    
    Color riskColor = Colors.green;
    if (risk.riskLevel == 'HIGH') riskColor = Colors.red;
    if (risk.riskLevel == 'MEDIUM') riskColor = Colors.orange;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
        border: Border.all(color: riskColor.withOpacity(0.3), width: 2),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('INFERENCE RESULT', style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: riskColor, borderRadius: BorderRadius.circular(20)),
                child: Text(risk.riskLevel ?? 'UNKNOWN', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (risk.clearanceBadge != null)
            Text(risk.clearanceBadge!, style: GoogleFonts.poppins(fontSize: 20, fontWeight: FontWeight.bold, color: riskColor)),
          const SizedBox(height: 8),
          Text('Risk Score: ${risk.riskScore?.toStringAsFixed(4) ?? "N/A"}', style: const TextStyle(fontWeight: FontWeight.bold)),
          const Divider(height: 24),
          Text('Clinical Indicators:', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          ...(risk.reasonCodes ?? ['Normal parameters detected']).map((e) => Padding(
            padding: const EdgeInsets.only(top: 4),
            child: Row(
              children: [
                Icon(Icons.info_outline, size: 14, color: riskColor),
                const SizedBox(width: 8),
                Expanded(child: Text(e, style: const TextStyle(fontSize: 13))),
              ],
            ),
          )),
          const SizedBox(height: 16),
          Text('Action Protocol:', style: GoogleFonts.poppins(fontWeight: FontWeight.w600)),
          Text(risk.recommendedAction ?? 'Follow standard withdrawal guidelines.'),
        ],
      ),
    );
  }
}
