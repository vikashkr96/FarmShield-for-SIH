import 'package:get/get.dart';

class NavController extends GetxController {
  final selectedIndex = 0.obs;

  void changePage(int index) {
    selectedIndex.value = index;
  }
}
