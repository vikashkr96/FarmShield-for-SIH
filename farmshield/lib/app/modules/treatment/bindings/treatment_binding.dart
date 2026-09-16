import 'package:get/get.dart';
import '../controllers/treatment_controller.dart';

class TreatmentBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<TreatmentController>(
      () => TreatmentController(repository: Get.find()),
    );
  }
}
