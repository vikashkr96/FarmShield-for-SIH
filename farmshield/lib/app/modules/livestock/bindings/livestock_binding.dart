import 'package:get/get.dart';
import '../controllers/livestock_controller.dart';

class LivestockBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<LivestockController>(
      () => LivestockController(repository: Get.find()),
    );
  }
}
