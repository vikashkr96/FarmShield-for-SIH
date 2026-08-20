import 'package:hive_flutter/hive_flutter.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

class OfflineStorageService {
  static final OfflineStorageService _instance = OfflineStorageService._internal();
  factory OfflineStorageService() => _instance;
  OfflineStorageService._internal();

  late Box animalsBox;
  late Box treatmentsBox;
  late Box offlineQueueBox;

  Future<void> init() async {
    await Hive.initFlutter();
    animalsBox = await Hive.openBox('animalsBox');
    treatmentsBox = await Hive.openBox('treatmentsBox');
    offlineQueueBox = await Hive.openBox('offlineQueueBox');
    
    _listenToConnectivity();
  }

  Future<void> saveTreatmentLocally(Map<String, dynamic> treatment) async {
    await treatmentsBox.add(treatment);
    await offlineQueueBox.add({'type': 'treatment', 'data': treatment});
    syncOfflineData();
  }

  Future<void> syncOfflineData() async {
    final connectivityResults = await Connectivity().checkConnectivity();
    if (connectivityResults.contains(ConnectivityResult.none)) return;

    if (offlineQueueBox.isEmpty) return;

    final supabase = Supabase.instance.client;
    
    // We iterate through a copy of the keys to avoid concurrent modification issues
    final keys = List.from(offlineQueueBox.keys);
    
    for (var key in keys) {
      final item = offlineQueueBox.get(key);
      try {
        if (item['type'] == 'treatment') {
          await supabase.from('treatments').insert(item['data']);
        }
        await offlineQueueBox.delete(key);
      } catch (e) {
        print("Sync error for key $key: $e");
        // Keep in queue to retry later if it's a transient error, 
        // or handle specific errors that shouldn't be retried.
        break; 
      }
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
