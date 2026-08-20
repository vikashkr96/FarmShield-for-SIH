import 'package:get/get.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../data/models/farm_models.dart';

class WithdrawalCalendarController extends GetxController {
  final _supabase = Supabase.instance.client;

  var focusedDay = DateTime.now().obs;
  var selectedDay = DateTime.now().obs;
  var calendarFormat = CalendarFormat.month.obs;

  var withdrawals = <Withdrawal>[].obs;
  var isLoading = false.obs;

  var selectedFilter = 'All Herd'.obs;
  final filters = ['All Herd', 'Dairy Cows', 'Buffaloes', 'Fishery Ponds'];

  @override
  void onInit() {
    super.onInit();
    fetchWithdrawals();
  }

  Future<void> fetchWithdrawals() async {
    try {
      isLoading.value = true;
      final response = await _supabase
          .from('withdrawals')
          .select('*, animals(*)')
          .order('end_date', ascending: true);

      final List data = response as List;
      withdrawals.value = data.map((e) => Withdrawal.fromJson(e)).toList();
    } catch (e) {
      Get.snackbar('Error', 'Failed to fetch withdrawals: $e');
    } finally {
      isLoading.value = false;
    }
  }

  List<Withdrawal> get filteredWithdrawals {
    if (selectedFilter.value == 'All Herd') return withdrawals;

    // Mapping display filters to database species values
    String speciesTarget = '';
    if (selectedFilter.value == 'Dairy Cows') speciesTarget = 'Cattle';
    if (selectedFilter.value == 'Buffaloes') speciesTarget = 'Buffalo';
    if (selectedFilter.value == 'Fishery Ponds') speciesTarget = 'Fish';

    return withdrawals.where((w) => w.animal?.species == speciesTarget).toList();
  }

  List<Withdrawal> getWithdrawalsForDay(DateTime day) {
    return filteredWithdrawals.where((w) {
      return isSameDay(w.endDate, day);
    }).toList();
  }

  bool hasActiveWithdrawal(DateTime day) {
    return filteredWithdrawals.any((w) {
      // Check if day is between start and end (inclusive of start, but maybe red dot only before end_date?)
      // Prompt says: "Days with active withdrawals marked with RED dots; clearance dates marked with GREEN checkmarks"
      // Usually, active means start_date <= day < end_date? Or start_date <= day <= end_date?
      // Let's assume active is from start to day before end.
      final start = DateTime(w.startDate.year, w.startDate.month, w.startDate.day);
      final end = DateTime(w.endDate.year, w.endDate.month, w.endDate.day);
      final current = DateTime(day.year, day.month, day.day);

      return current.isAtSameMomentAs(start) || (current.isAfter(start) && current.isBefore(end));
    });
  }

  bool isClearanceDay(DateTime day) {
    return filteredWithdrawals.any((w) => isSameDay(w.endDate, day));
  }
}
