import 'package:get/get.dart';
import '../../../data/providers/api_provider.dart';
import '../../../data/repositories/farm_repository.dart';
import '../controllers/dashboard_controller.dart';

class DashboardBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ApiProvider>(() => ApiProvider());
    Get.lazyPut<FarmRepository>(() => FarmRepository(apiProvider: Get.find()));
    Get.lazyPut<DashboardController>(
      () => DashboardController(repository: Get.find()),
    );
  }
}
