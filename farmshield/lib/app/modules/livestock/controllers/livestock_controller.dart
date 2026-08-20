import 'package:get/get.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/repositories/farm_repository.dart';

class LivestockController extends GetxController with StateMixin<List<Animal>> {
  final FarmRepository repository;
  LivestockController({required this.repository});

  final selectedSpecies = 'all'.obs;

  @override
  void onInit() {
    super.onInit();
    fetchAnimals();
  }

  Future<void> fetchAnimals() async {
    change(null, status: RxStatus.loading());
    try {
      final species = selectedSpecies.value == 'all' ? null : selectedSpecies.value;
      final animals = await repository.getAnimals(species: species);
      change(animals, status: RxStatus.success());
    } catch (e) {
      change(null, status: RxStatus.error(e.toString()));
    }
  }

  Future<void> registerAnimal(Animal animal) async {
    try {
      await repository.registerAnimal(animal);
      fetchAnimals();
      Get.back();
      Get.snackbar('Success', 'Animal registered successfully');
    } catch (e) {
      Get.snackbar('Error', 'Failed to register animal: $e');
    }
  }
}
