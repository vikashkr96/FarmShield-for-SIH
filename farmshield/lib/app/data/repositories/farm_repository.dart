import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/farm_models.dart';
import '../models/risk_models.dart';
import '../providers/api_provider.dart';

class FarmRepository {
  final ApiProvider apiProvider;

  FarmRepository({required this.apiProvider});

  // ML Endpoints
  Future<RiskResponse> getOveruseRisk(OveruseRiskRequest request) async {
    final response = await apiProvider.postOveruseRisk(request.toJson());
    return RiskResponse.fromJson(response.data);
  }

  Future<RiskResponse> getComplianceRisk(ComplianceRiskRequest request) async {
    final response = await apiProvider.postComplianceRisk(request.toJson());
    return RiskResponse.fromJson(response.data);
  }

  Future<Map<String, dynamic>> getModelsInfo() async {
    final response = await apiProvider.getModelsInfo();
    return response.data;
  }

  // Backend Core Endpoints - Supabase First with API Fallback
  Future<List<Animal>> getAnimals({String? species, String? status}) async {
    try {
      var query = Supabase.instance.client.from('animals').select();
      if (species != null && species != 'all') {
        query = query.eq('species', species);
      }
      if (status != null) {
        query = query.eq('health_status', status);
      }
      final supaList = await query;
      if (supaList.isNotEmpty) {
        return (supaList as List).map((e) => Animal.fromJson(e)).toList();
      }
    } catch (_) {}

    final response = await apiProvider.getAnimals(species: species, status: status);
    return (response.data['data'] as List).map((e) => Animal.fromJson(e)).toList();
  }

  Future<Animal> registerAnimal(Animal animal) async {
    try {
      final res = await Supabase.instance.client.from('animals').insert(animal.toJson()).select().single();
      return Animal.fromJson(res);
    } catch (_) {}

    final response = await apiProvider.postAnimal(animal.toJson());
    return Animal.fromJson(response.data['data']);
  }

  Future<PublicPassport> getPublicPassport(String qrToken) async {
    final response = await apiProvider.getPublicPassport(qrToken);
    return PublicPassport.fromJson(response.data['data']);
  }

  Future<Map<String, dynamic>> addTreatment(Treatment treatment) async {
    try {
      final res = await Supabase.instance.client.from('treatments').insert(treatment.toJson()).select().single();
      return res;
    } catch (_) {}

    final response = await apiProvider.postTreatment(treatment.toJson());
    return response.data['data'];
  }

  Future<List<Medicine>> getMedicines() async {
    try {
      final supaList = await Supabase.instance.client.from('medicines').select();
      if (supaList.isNotEmpty) {
        return (supaList as List).map((e) => Medicine.fromJson(e)).toList();
      }
    } catch (_) {}

    final response = await apiProvider.getMedicines();
    return (response.data['data'] as List).map((e) => Medicine.fromJson(e)).toList();
  }

  Future<AmuSummary> getAmuSummary() async {
    try {
      final treatments = await Supabase.instance.client.from('treatments').select();
      final withdrawals = await Supabase.instance.client.from('withdrawals').select().eq('status', 'active');
      
      if (treatments.isNotEmpty) {
        return AmuSummary(
          totalTreatments: treatments.length,
          activeWithdrawals: withdrawals.length,
          averageWithdrawalDays: 5.5,
          classBreakdown: [
            {'drugClass': 'Penicillins', 'percentage': 45.0},
            {'drugClass': 'Tetracyclines', 'percentage': 30.0},
            {'drugClass': 'Fluoroquinolones', 'percentage': 25.0},
          ],
        );
      }
    } catch (_) {}

    final response = await apiProvider.getAmuSummary();
    return AmuSummary.fromJson(response.data['data']);
  }

  Future<List<Map<String, dynamic>>> getAmuRecords() async {
    try {
      final supaList = await Supabase.instance.client.from('amu_records').select();
      if (supaList.isNotEmpty) {
        return List<Map<String, dynamic>>.from(supaList);
      }
    } catch (_) {}

    final response = await apiProvider.getAmuRecords();
    return List<Map<String, dynamic>>.from(response.data['data']);
  }

  Future<List<Withdrawal>> getWithdrawals() async {
    try {
      final supaList = await Supabase.instance.client.from('withdrawals').select();
      if (supaList.isNotEmpty) {
        return (supaList as List).map((e) => Withdrawal.fromJson(e)).toList();
      }
    } catch (_) {}

    final response = await apiProvider.getWithdrawals();
    return (response.data['data'] as List).map((e) => Withdrawal.fromJson(e)).toList();
  }

  Future<List<Alert>> getAlerts() async {
    try {
      final supaList = await Supabase.instance.client.from('alerts').select().order('created_at', ascending: false);
      if (supaList.isNotEmpty) {
        return (supaList as List).map((e) => Alert.fromJson(e)).toList();
      }
    } catch (_) {}

    final response = await apiProvider.getAlerts();
    return (response.data['data'] as List).map((e) => Alert.fromJson(e)).toList();
  }

  // Additional
  Future<Map<String, dynamic>> getWithdrawalStatus(String id) async {
    final response = await apiProvider.getWithdrawal(id);
    return response.data;
  }

  Future<void> submitLabResults(Map<String, dynamic> data) async {
    await apiProvider.postLabResults(data);
  }
}
