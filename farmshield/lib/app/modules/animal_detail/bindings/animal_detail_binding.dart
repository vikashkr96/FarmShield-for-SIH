import 'package:get/get.dart';
import '../controllers/animal_detail_controller.dart';
import '../../../data/repositories/farm_repository.dart';
import '../../../data/providers/api_provider.dart';

class AnimalDetailBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<AnimalDetailController>(
      () => AnimalDetailController(
        repository: FarmRepository(apiProvider: ApiProvider()),
      ),
    );
  }
}
