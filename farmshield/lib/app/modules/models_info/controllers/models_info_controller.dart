import 'package:get/get.dart';
import '../../../data/repositories/farm_repository.dart';

class ModelsInfoController extends GetxController with StateMixin<Map<String, dynamic>> {
  final FarmRepository repository;
  ModelsInfoController({required this.repository});

  @override
  void onInit() {
    super.onInit();
    fetchModelsInfo();
  }

  Future<void> fetchModelsInfo() async {
    change(null, status: RxStatus.loading());
    try {
      final data = await repository.getModelsInfo();
      change(data, status: RxStatus.success());
    } catch (e) {
      change(null, status: RxStatus.error(e.toString()));
    }
  }
}
