import 'package:dio/dio.dart';
import '../../core/values/strings.dart';

class ApiProvider {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: AppStrings.baseUrl,
    connectTimeout: const Duration(seconds: 60),
    receiveTimeout: const Duration(seconds: 60),
  ));

  Future<Response> postOveruseRisk(Map<String, dynamic> data) async {
    return await _dio.post('ml/overuse-risk', data: data);
  }

  Future<Response> postComplianceRisk(Map<String, dynamic> data) async {
    return await _dio.post('ml/compliance-risk', data: data);
  }

  Future<Response> getModelsInfo() async {
    return await _dio.get('ml/models-info');
  }

  Future<Response> getHealth() async {
    return await _dio.get('health'); 
  }

  Future<Response> getAnimals({String? species, String? status}) async {
    return await _dio.get('animals', queryParameters: {
      if (species != null) 'species': species,
      if (status != null) 'status': status,
    });
  }

  Future<Response> postAnimal(Map<String, dynamic> data) async {
    return await _dio.post('animals', data: data);
  }

  Future<Response> getPublicPassport(String qrToken) async {
    return await _dio.get('animals/qr/$qrToken');
  }

  Future<Response> postTreatment(Map<String, dynamic> data) async {
    return await _dio.post('treatments', data: data);
  }

  Future<Response> getAmuSummary() async {
    return await _dio.get('amu/summary');
  }

  Future<Response> getAmuRecords() async {
    return await _dio.get('amu/records');
  }

  Future<Response> getWithdrawals() async {
    return await _dio.get('withdrawals');
  }

  Future<Response> getMedicines() async {
    return await _dio.get('medicines');
  }

  Future<Response> getWithdrawal(String id) async {
    return await _dio.get('animals/$id/withdrawal');
  }

  Future<Response> postLabResults(Map<String, dynamic> data) async {
    return await _dio.post('lab-results', data: data);
  }

  Future<Response> getAlerts() async {
    return await _dio.get('alerts');
  }
}
