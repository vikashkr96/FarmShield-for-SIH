import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../data/models/farm_models.dart';

class FcmAlertService extends GetxService {
  static FcmAlertService get to => Get.find<FcmAlertService>();

  final _supabase = Supabase.instance.client;
  final RxList<Alert> liveAlerts = <Alert>[].obs;
  RealtimeChannel? _alertChannel;

  @override
  void onInit() {
    super.onInit();
    initAlertListeners();
  }

  void initAlertListeners() {
    try {
      _alertChannel = _supabase
          .channel('public:alerts')
          .onPostgresChanges(
            event: PostgresChangeEvent.insert,
            schema: 'public',
            table: 'alerts',
            callback: (payload) {
              final newRecord = payload.newRecord;
              final alert = Alert.fromJson(newRecord);
              liveAlerts.insert(0, alert);
              showInAppAlertBanner(alert);
            },
          )
          .subscribe();
    } catch (e) {
      Get.log("Realtime Alert channel init exception: $e");
    }
  }

  void showInAppAlertBanner(Alert alert) {
    final isCritical = alert.type?.toUpperCase() == 'CRITICAL';
    final isWarning = alert.type?.toUpperCase() == 'WARNING';
    
    final bannerColor = isCritical 
        ? const Color(0xFFDC2626) 
        : (isWarning ? const Color(0xFFD97706) : const Color(0xFF1B5E20));

    Get.rawSnackbar(
      titleText: Row(
        children: [
          Icon(
            isCritical ? Icons.warning_rounded : Icons.info_outline, 
            color: Colors.white, 
            size: 20
          ),
          const SizedBox(width: 8),
          Text(
            alert.title ?? 'Safety Alert Notification',
            style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
          ),
        ],
      ),
      messageText: Text(
        alert.message ?? '',
        style: GoogleFonts.poppins(color: Colors.white.withOpacity(0.9), fontSize: 12),
      ),
      backgroundColor: bannerColor,
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.all(16),
      borderRadius: 16,
      duration: const Duration(seconds: 5),
      boxShadows: [
        BoxShadow(
          color: bannerColor.withOpacity(0.4),
          blurRadius: 16,
          offset: const Offset(0, 4),
        ),
      ],
    );
  }

  @override
  void onClose() {
    _alertChannel?.unsubscribe();
    super.onClose();
  }
}
