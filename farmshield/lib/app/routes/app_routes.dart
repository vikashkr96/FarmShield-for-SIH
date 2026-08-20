part of 'app_pages.dart';

abstract class Routes {
  static const DASHBOARD = _Paths.DASHBOARD;
  static const RISK_ASSESSMENT = _Paths.RISK_ASSESSMENT;
  static const ANIMAL_PASSPORT = _Paths.ANIMAL_PASSPORT;
  static const ADD_TREATMENT = _Paths.ADD_TREATMENT;
  static const LAB_RESULTS = _Paths.LAB_RESULTS;
  static const MODELS_INFO = _Paths.MODELS_INFO;
  static const LIVESTOCK = _Paths.LIVESTOCK;
}

abstract class _Paths {
  static const DASHBOARD = '/dashboard';
  static const RISK_ASSESSMENT = '/risk-assessment';
  static const ANIMAL_PASSPORT = '/animal-passport';
  static const ADD_TREATMENT = '/add-treatment';
  static const LAB_RESULTS = '/lab-results';
  static const MODELS_INFO = '/models-info';
  static const LIVESTOCK = '/livestock';
}
