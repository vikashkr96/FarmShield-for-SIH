import 'package:get/get.dart';
import '../controllers/syndromic_report_controller.dart';

class SyndromicReportBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<SyndromicReportController>(() => SyndromicReportController());
  }
}
