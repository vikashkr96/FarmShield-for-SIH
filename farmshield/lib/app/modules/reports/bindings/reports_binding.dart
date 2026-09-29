import 'package:get/get.dart';
import '../controllers/reports_controller.dart';
import '../../../data/repositories/farm_repository.dart';
import '../../../data/providers/api_provider.dart';

class ReportsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ReportsController>(
      () => ReportsController(
        repository: FarmRepository(apiProvider: ApiProvider()),
      ),
    );
  }
}
