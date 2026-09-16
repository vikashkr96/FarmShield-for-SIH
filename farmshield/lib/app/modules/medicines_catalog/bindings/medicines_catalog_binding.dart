import 'package:get/get.dart';
import '../controllers/medicines_catalog_controller.dart';

class MedicinesCatalogBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<MedicinesCatalogController>(
      () => MedicinesCatalogController(),
    );
  }
}
