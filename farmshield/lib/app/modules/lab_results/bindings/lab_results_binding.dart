import 'package:get/get.dart';
import '../controllers/lab_results_controller.dart';

class LabResultsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<LabResultsController>(
      () => LabResultsController(repository: Get.find()),
    );
  }
}
