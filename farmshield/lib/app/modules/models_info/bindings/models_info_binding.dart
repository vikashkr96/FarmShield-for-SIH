import 'package:get/get.dart';
import '../controllers/models_info_controller.dart';

class ModelsInfoBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<ModelsInfoController>(
      () => ModelsInfoController(repository: Get.find()),
    );
  }
}
