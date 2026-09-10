import 'package:hive_flutter/hive_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class OfflineStorageService {
  static final OfflineStorageService _instance = OfflineStorageService._internal();
  factory OfflineStorageService() => _instance;
  OfflineStorageService._internal();

  late Box animalsBox;
  late Box treatmentsBox;
  late Box offlineReportsBox;
  late Box offlineVaccinationsBox;
  late Box offlineQueueBox;

  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'http://10.0.2.2:5000/api',
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 5),
  ));

  Future<void> init() async {
    await Hive.initFlutter();
    animalsBox = await Hive.openBox('animalsBox');
    treatmentsBox = await Hive.openBox('treatmentsBox');
    offlineReportsBox = await Hive.openBox('offlineReportsBox');
    offlineVaccinationsBox = await Hive.openBox('offlineVaccinationsBox');
    offlineQueueBox = await Hive.openBox('offlineQueueBox');
    
    _listenToConnectivity();
  }

  /// Cache Animal profile locally in Hive
  Future<void> cacheAnimal(Map<String, dynamic> animalData) async {
    try {
      final id = animalData['id']?.toString();
      final code = animalData['animal_code']?.toString();
      final qr = animalData['qr_token']?.toString();

      if (id != null && id.isNotEmpty) {
        await animalsBox.put(id, animalData);
      }
      if (code != null && code.isNotEmpty) {
        await animalsBox.put('code_$code', animalData);
      }
      if (qr != null && qr.isNotEmpty) {
        await animalsBox.put('qr_$qr', animalData);
      }
    } catch (_) {}
  }

  /// Retrieve cached Animal profile from Hive
  Map<String, dynamic>? getCachedAnimal(String identifier) {
    try {
      final direct = animalsBox.get(identifier);
      if (direct is Map) return Map<String, dynamic>.from(direct);

      final byCode = animalsBox.get('code_$identifier');
      if (byCode is Map) return Map<String, dynamic>.from(byCode);

      final byQr = animalsBox.get('qr_$identifier');
      if (byQr is Map) return Map<String, dynamic>.from(byQr);

      // Search values
      for (var val in animalsBox.values) {
        if (val is Map) {
          if (val['id'] == identifier ||
              val['animal_code'] == identifier ||
              val['qr_token'] == identifier) {
            return Map<String, dynamic>.from(val);
          }
        }
      }
    } catch (_) {}
    return null;
  }

  /// Save Treatment locally when offline (for MRL/AMU compliance)
  Future<void> saveTreatmentLocally(Map<String, dynamic> treatment) async {
    await treatmentsBox.add(treatment);
    await offlineQueueBox.add({'type': 'treatment', 'data': treatment});
    syncOfflineData();
  }

  /// Save Syndromic Disease Report locally when offline
  Future<void> saveDiseaseReportLocally(Map<String, dynamic> reportData) async {
    final clientReportId = reportData['client_report_id'] ?? 'offline_${DateTime.now().millisecondsSinceEpoch}';
    reportData['client_report_id'] = clientReportId;
    reportData['is_synced'] = false;
    reportData['created_at'] = reportData['created_at'] ?? DateTime.now().toIso8601String();

    await offlineReportsBox.put(clientReportId, reportData);
    await offlineQueueBox.add({'type': 'disease_report', 'client_id': clientReportId, 'data': reportData});

    syncOfflineData();
  }

  /// Save Vaccination Record locally
  Future<void> saveVaccinationLocally(Map<String, dynamic> vacData) async {
    final clientVacId = 'vac_${DateTime.now().millisecondsSinceEpoch}';
    vacData['id'] = clientVacId;
    vacData['is_synced'] = false;

    await offlineVaccinationsBox.put(clientVacId, vacData);
    await offlineQueueBox.add({'type': 'vaccination', 'client_id': clientVacId, 'data': vacData});

    syncOfflineData();
  }

  /// Synchronize all pending offline queues when internet connection is restored
  Future<void> syncOfflineData() async {
    final connectivityResults = await Connectivity().checkConnectivity();
    if (connectivityResults.contains(ConnectivityResult.none)) return;
    if (offlineQueueBox.isEmpty) return;

    final supabase = Supabase.instance.client;
    final keys = List.from(offlineQueueBox.keys);
    int syncedCount = 0;

    for (var key in keys) {
      final item = offlineQueueBox.get(key);
      try {
        if (item['type'] == 'treatment') {
          await supabase.from('treatments').insert(item['data']);
          await offlineQueueBox.delete(key);
          syncedCount++;
        } else if (item['type'] == 'disease_report') {
          final res = await _dio.post('/v1/surveillance/report', data: item['data']);
          if (res.statusCode == 200 || res.statusCode == 201) {
            final clientId = item['client_id'];
            final cached = offlineReportsBox.get(clientId);
            if (cached != null) {
              cached['is_synced'] = true;
              await offlineReportsBox.put(clientId, cached);
            }
            await offlineQueueBox.delete(key);
            syncedCount++;
          }
        } else if (item['type'] == 'vaccination') {
          await supabase.from('vaccinations').insert(item['data']);
          await offlineQueueBox.delete(key);
          syncedCount++;
        }
      } catch (e) {
        // Retain in queue for retry
        break;
      }
    }

    if (syncedCount > 0) {
      Get.snackbar(
        'Offline Sync Completed',
        'Successfully uploaded $syncedCount pending field record(s) to National Livestock Portal.',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  void _listenToConnectivity() {
    Connectivity().onConnectivityChanged.listen((List<ConnectivityResult> results) {
      if (!results.contains(ConnectivityResult.none)) {
        syncOfflineData();
      }
    });
  }
}
