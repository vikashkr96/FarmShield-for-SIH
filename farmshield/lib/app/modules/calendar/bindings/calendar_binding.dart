import 'package:get/get.dart';
import '../controllers/withdrawal_calendar_controller.dart';

class CalendarBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<WithdrawalCalendarController>(
      () => WithdrawalCalendarController(),
    );
  }
}
