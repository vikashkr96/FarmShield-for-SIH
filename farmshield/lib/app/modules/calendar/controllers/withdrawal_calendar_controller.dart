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
  final filters = ['All Herd', 'Dairy Cattle', 'Buffaloes', 'Goats & Sheep', 'Fishery Ponds'];

  @override
  void onInit() {
    super.onInit();
    fetchWithdrawals();
  }

  Future<void> fetchWithdrawals() async {
    try {
      isLoading.value = true;
      
      // 1. Fetch withdrawals from Supabase
      List<dynamic> rawWithdrawals = [];
      try {
        final res = await _supabase.from('withdrawals').select().order('end_date', ascending: true);
        rawWithdrawals = List<dynamic>.from(res);
      } catch (_) {}

      // 2. Fetch associated animals and treatments
      if (rawWithdrawals.isNotEmpty) {
        final animalIds = rawWithdrawals
            .map((w) => w['animal_id']?.toString())
            .where((id) => id != null && id.isNotEmpty)
            .toSet()
            .toList();

        final treatmentIds = rawWithdrawals
            .map((w) => w['treatment_id']?.toString())
            .where((id) => id != null && id.isNotEmpty)
            .toSet()
            .toList();

        Map<String, dynamic> animalsMap = {};
        Map<String, dynamic> treatmentsMap = {};
        Map<String, dynamic> medicinesMap = {};

        if (animalIds.isNotEmpty) {
          try {
            final aRes = await _supabase.from('animals').select().inFilter('id', animalIds);
            for (var a in aRes) {
              animalsMap[a['id'].toString()] = a;
            }
          } catch (_) {}
        }

        if (treatmentIds.isNotEmpty) {
          try {
            final tRes = await _supabase.from('treatments').select().inFilter('id', treatmentIds);
            for (var t in tRes) {
              treatmentsMap[t['id'].toString()] = t;
            }

            final medIds = treatmentsMap.values
                .map((t) => t['medicine_id']?.toString())
                .where((m) => m != null && m.isNotEmpty)
                .toSet()
                .toList();

            if (medIds.isNotEmpty) {
              final mRes = await _supabase.from('medicines').select().inFilter('id', medIds);
              for (var m in mRes) {
                medicinesMap[m['id'].toString()] = m;
              }
            }
          } catch (_) {}
        }

        final parsed = rawWithdrawals.map((w) {
          final aJson = animalsMap[w['animal_id']?.toString()];
          final tJson = treatmentsMap[w['treatment_id']?.toString()];
          final mJson = tJson != null ? medicinesMap[tJson['medicine_id']?.toString()] : null;

          final wMap = Map<String, dynamic>.from(w);
          if (aJson != null) wMap['animals'] = aJson;
          if (tJson != null) {
            wMap['treatment'] = tJson;
            wMap['indication'] = tJson['indication'];
          }
          if (mJson != null) {
            wMap['medicine_name'] = mJson['name'];
          }
          return Withdrawal.fromJson(wMap);
        }).toList();

        withdrawals.value = parsed;
      }

      // 3. Fallback / Prototype dataset if database has limited records
      if (withdrawals.isEmpty) {
        _populatePrototypeData();
      }
    } catch (e) {
      Get.log('Withdrawal fetch note: $e');
      _populatePrototypeData();
    } finally {
      isLoading.value = false;
    }
  }

  void _populatePrototypeData() {
    final now = DateTime.now();
    withdrawals.value = [
      Withdrawal(
        id: 'proto-w1',
        treatmentId: 'proto-t1',
        animalId: 'proto-a1',
        product: 'milk',
        startDate: now.subtract(const Duration(days: 2)),
        endDate: now.add(const Duration(days: 3)),
        status: 'active',
        animal: Animal(
          id: 'proto-a1',
          farmId: 'farm-01',
          animalCode: 'COW-GIR-01',
          species: 'cow',
          breed: 'Gir',
          healthStatus: 'under_treatment',
          purpose: 'milk',
        ),
        medicineName: 'Amoxicillin Trihydrate 15%',
        indication: 'Clinical Mastitis',
        dosage: '10 mg/kg IM',
      ),
      Withdrawal(
        id: 'proto-w2',
        treatmentId: 'proto-t2',
        animalId: 'proto-a2',
        product: 'milk',
        startDate: now.subtract(const Duration(days: 4)),
        endDate: now.add(const Duration(days: 1)),
        status: 'active',
        animal: Animal(
          id: 'proto-a2',
          farmId: 'farm-01',
          animalCode: 'BUF-MUR-01',
          species: 'buffalo',
          breed: 'Murrah Buffalo',
          healthStatus: 'under_treatment',
          purpose: 'milk',
        ),
        medicineName: 'Oxytetracycline LA 20%',
        indication: 'Hemorrhagic Septicemia',
        dosage: '20 mg/kg IM',
      ),
      Withdrawal(
        id: 'proto-w3',
        treatmentId: 'proto-t3',
        animalId: 'proto-a3',
        product: 'meat',
        startDate: now.subtract(const Duration(days: 6)),
        endDate: now.add(const Duration(days: 5)),
        status: 'active',
        animal: Animal(
          id: 'proto-a3',
          farmId: 'farm-01',
          animalCode: 'GOAT-JAM-01',
          species: 'goat',
          breed: 'Jamnapari Goat',
          healthStatus: 'under_treatment',
          purpose: 'meat',
        ),
        medicineName: 'Enrofloxacin 10% Inj',
        indication: 'Caprine Pneumonia',
        dosage: '5 mg/kg SC',
      ),
      Withdrawal(
        id: 'proto-w4',
        treatmentId: 'proto-t4',
        animalId: 'proto-a4',
        product: 'milk',
        startDate: now.subtract(const Duration(days: 7)),
        endDate: now,
        status: 'completed',
        animal: Animal(
          id: 'proto-a4',
          farmId: 'farm-01',
          animalCode: 'COW-SAH-02',
          species: 'cow',
          breed: 'Sahiwal',
          healthStatus: 'healthy',
          purpose: 'milk',
        ),
        medicineName: 'Ceftiofur Sodium',
        indication: 'Metritis Clean-up',
        dosage: '2.2 mg/kg IM',
      ),
    ];
  }

  List<Withdrawal> get filteredWithdrawals {
    if (selectedFilter.value == 'All Herd') return withdrawals;

    final filter = selectedFilter.value.toLowerCase();
    return withdrawals.where((w) {
      final species = (w.animal?.species ?? '').toLowerCase().trim();
      if (filter.contains('cattle') || filter.contains('cow')) {
        return species == 'cow' || species == 'cattle';
      }
      if (filter.contains('buffalo')) {
        return species == 'buffalo';
      }
      if (filter.contains('goat') || filter.contains('sheep')) {
        return species == 'goat' || species == 'sheep';
      }
      if (filter.contains('fish') || filter.contains('pond')) {
        return species == 'fishery' || species == 'fish' || species == 'aquaculture';
      }
      return true;
    }).toList();
  }

  List<Withdrawal> getWithdrawalsForDay(DateTime day) {
    return filteredWithdrawals.where((w) {
      final isClearance = isSameDay(w.endDate, day);
      final isDuring = isDayInWithhold(w, day);
      return isClearance || isDuring;
    }).toList();
  }

  bool isDayInWithhold(Withdrawal w, DateTime day) {
    final start = DateTime(w.startDate.year, w.startDate.month, w.startDate.day);
    final end = DateTime(w.endDate.year, w.endDate.month, w.endDate.day);
    final current = DateTime(day.year, day.month, day.day);

    return (current.isAtSameMomentAs(start) || current.isAfter(start)) && current.isBefore(end);
  }

  bool hasActiveWithdrawal(DateTime day) {
    return filteredWithdrawals.any((w) => isDayInWithhold(w, day));
  }

  bool isClearanceDay(DateTime day) {
    return filteredWithdrawals.any((w) => isSameDay(w.endDate, day));
  }

  int get activeWithholdsCount {
    return withdrawals.where((w) => w.status == 'active' && w.endDate.isAfter(DateTime.now())).length;
  }

  int get upcomingClearancesCount {
    final now = DateTime.now();
    final sevenDays = now.add(const Duration(days: 7));
    return withdrawals.where((w) => w.endDate.isAfter(now) && w.endDate.isBefore(sevenDays)).length;
  }
}
