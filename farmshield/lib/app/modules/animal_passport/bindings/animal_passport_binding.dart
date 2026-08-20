import 'package:get/get.dart';
import '../controllers/animal_passport_controller.dart';

class AnimalPassportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AnimalPassportController>(
      () => AnimalPassportController(repository: Get.find()),
    );
  }
}
