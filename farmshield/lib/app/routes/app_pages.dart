import 'package:get/get.dart';
import '../modules/dashboard/bindings/dashboard_binding.dart';
import '../modules/dashboard/views/dashboard_view.dart';
import '../modules/risk_assessment/bindings/risk_assessment_binding.dart';
import '../modules/risk_assessment/views/risk_assessment_view.dart';
import '../modules/animal_passport/bindings/animal_passport_binding.dart';
import '../modules/animal_passport/views/animal_passport_view.dart';
import '../modules/treatment/bindings/treatment_binding.dart';
import '../modules/treatment/views/add_treatment_view.dart';
import '../modules/lab_results/bindings/lab_results_binding.dart';
import '../modules/lab_results/views/lab_results_view.dart';
import '../modules/models_info/bindings/models_info_binding.dart';
import '../modules/models_info/views/models_info_view.dart';
import '../modules/livestock/bindings/livestock_binding.dart';
import '../modules/livestock/views/livestock_view.dart';
import '../modules/auth/bindings/auth_binding.dart';
import '../modules/auth/views/login_view.dart';
import '../modules/auth/views/register_view.dart';
import '../modules/animal_detail/bindings/animal_detail_binding.dart';
import '../modules/animal_detail/views/animal_detail_view.dart';

part 'app_routes.dart';

class AppPages {
  static const INITIAL = Routes.LOGIN;

  static final routes = [
    GetPage(
      name: _Paths.LOGIN,
      page: () => const LoginView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: _Paths.REGISTER,
      page: () => const RegisterView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: _Paths.DASHBOARD,
      page: () => const DashboardView(),
      binding: DashboardBinding(),
    ),
    GetPage(
      name: _Paths.RISK_ASSESSMENT,
      page: () => const RiskAssessmentView(),
      binding: RiskAssessmentBinding(),
    ),
    GetPage(
      name: _Paths.ANIMAL_PASSPORT,
      page: () => const AnimalPassportView(),
      binding: AnimalPassportBinding(),
    ),
    GetPage(
      name: _Paths.ADD_TREATMENT,
      page: () => const AddTreatmentView(),
      binding: TreatmentBinding(),
    ),
    GetPage(
      name: _Paths.LAB_RESULTS,
      page: () => const LabResultsView(),
      binding: LabResultsBinding(),
    ),
    GetPage(
      name: _Paths.MODELS_INFO,
      page: () => const ModelsInfoView(),
      binding: ModelsInfoBinding(),
    ),
    GetPage(
      name: _Paths.LIVESTOCK,
      page: () => const LivestockView(),
      binding: LivestockBinding(),
    ),
    GetPage(
      name: _Paths.ANIMAL_DETAIL,
      page: () => const AnimalDetailView(),
      binding: AnimalDetailBinding(),
    ),
  ];
}
