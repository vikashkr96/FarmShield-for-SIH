import 'package:get/get.dart';
import '../../../data/providers/api_provider.dart';
import '../../../data/repositories/farm_repository.dart';
import '../controllers/dashboard_controller.dart';
import '../../../controllers/nav_controller.dart';
import '../../livestock/controllers/livestock_controller.dart';
import '../../calendar/controllers/withdrawal_calendar_controller.dart';
import '../../reports/controllers/reports_controller.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ApiProvider>(() => ApiProvider());
    Get.lazyPut<FarmRepository>(() => FarmRepository(apiProvider: Get.find()));
    Get.lazyPut<NavController>(() => NavController());
    Get.lazyPut<DashboardController>(
      () => DashboardController(repository: Get.find()),
    );
    Get.lazyPut<LivestockController>(
      () => LivestockController(repository: Get.find()),
    );
    Get.lazyPut<WithdrawalCalendarController>(
      () => WithdrawalCalendarController(),
    );
    Get.lazyPut<ReportsController>(
      () => ReportsController(repository: Get.find()),
    );
  }
}
