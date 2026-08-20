import 'package:get/get.dart';
import '../../../data/models/farm_models.dart';
import '../../../data/repositories/farm_repository.dart';

class AnimalPassportController extends GetxController with StateMixin<PublicPassport> {
  final FarmRepository repository;
  AnimalPassportController({required this.repository});

  final qrToken = ''.obs;

  Future<void> fetchPublicPassport(String token) async {
    qrToken.value = token;
    change(null, status: RxStatus.loading());
    try {
      final passport = await repository.getPublicPassport(token);
      change(passport, status: RxStatus.success());
    } catch (e) {
      change(null, status: RxStatus.error(e.toString()));
    }
  }
}
