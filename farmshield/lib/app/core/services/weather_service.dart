import 'package:dio/dio.dart';
import 'package:get/get.dart';
import '../../data/models/health_models.dart';

class WeatherService {
  static final WeatherService _instance = WeatherService._internal();
  factory WeatherService() => _instance;
  WeatherService._internal();

  final Dio _dio = Dio(BaseOptions(
    connectTimeout: const Duration(seconds: 4),
    receiveTimeout: const Duration(seconds: 4),
  ));

  // Local memory cache with 1-hour TTL
  final Map<String, _CachedWeather> _cache = {};

  /// Compute Temperature-Humidity Index (THI) for cattle/livestock:
  /// THI = (1.8 * T + 32) - (0.55 - 0.0055 * RH) * (1.8 * T - 26)
  static double computeThi(double tempC, double humidityPct) {
    final t = tempC;
    final rh = humidityPct.clamp(0.0, 100.0);
    final thi = (1.8 * t + 32.0) - (0.55 - 0.0055 * rh) * (1.8 * t - 26.0);
    return double.parse(thi.toStringAsFixed(1));
  }

  /// Classify THI heat stress level for ruminants
  static String classifyHeatStress(double thi) {
    if (thi >= 88.0) return 'Emergency';
    if (thi >= 79.0) return 'Danger';
    if (thi >= 72.0) return 'Alert';
    return 'Normal';
  }

  /// Fetch live weather from Open-Meteo or fall back gracefully
  Future<WeatherRiskData> getWeatherRisk({
    double latitude = 18.5793,
    double longitude = 73.9824,
    bool forceRefresh = false,
  }) async {
    // Round coords to 2 decimals for caching key
    final cacheKey = '${latitude.toStringAsFixed(2)}_${longitude.toStringAsFixed(2)}';
    if (!forceRefresh && _cache.containsKey(cacheKey)) {
      final cached = _cache[cacheKey]!;
      if (DateTime.now().difference(cached.timestamp).inHours < 1) {
        return cached.data;
      }
    }

    final url =
        'https://api.open-meteo.com/v1/forecast?latitude=$latitude&longitude=$longitude&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m';

    double tempC = 28.5;
    double humidityPct = 78.0;
    double precipMm = 12.0;
    double windKmh = 14.0;
    String source = 'climatological_baseline';

    try {
      final response = await _dio.get(url);
      if (response.statusCode == 200 && response.data != null) {
        final current = response.data['current'];
        if (current is Map) {
          tempC = (current['temperature_2m'] as num?)?.toDouble() ?? tempC;
          humidityPct = (current['relative_humidity_2m'] as num?)?.toDouble() ?? humidityPct;
          precipMm = (current['precipitation'] as num?)?.toDouble() ?? precipMm;
          windKmh = (current['wind_speed_10m'] as num?)?.toDouble() ?? windKmh;
          source = 'live_open_meteo';
        }
      }
    } catch (e) {
      Get.log('Open-Meteo fetch notice (using baseline): $e');
    }

    final thi = computeThi(tempC, humidityPct);
    final heatStress = classifyHeatStress(thi);

    // Vector-borne risk calculation
    String vectorRisk = 'LOW';
    double multiplier = 1.0;
    final List<String> vulnerableDiseases = [];

    // Conditions for vector proliferation (Culicoides midges, mosquitoes, ticks)
    if (tempC > 26.0 && humidityPct > 75.0 && precipMm > 8.0) {
      vectorRisk = 'EXTREME';
      multiplier = 2.4;
      vulnerableDiseases.addAll([
        'Hemorrhagic Septicemia (HS) - Wet soil spore wash & respiratory moisture stress',
        'Blue Tongue (BT) - Culicoides vector surge',
        'Theileriosis & Babesiosis - Intense tick activity',
      ]);
    } else if (tempC > 24.0 && humidityPct > 65.0) {
      vectorRisk = 'HIGH';
      multiplier = 1.8;
      vulnerableDiseases.addAll([
        'Lumpy Skin Disease (LSD) - Biting fly transmission vector',
        'Black Quarter (BQ) - Waterlogged pasture grazing',
      ]);
    } else if (tempC > 20.0 && humidityPct > 50.0) {
      vectorRisk = 'MODERATE';
      multiplier = 1.3;
      vulnerableDiseases.add('Subclinical respiratory infections & fungal spread');
    } else {
      vectorRisk = 'LOW';
      multiplier = 1.0;
    }

    final String climateAdvisory;
    if (vectorRisk == 'EXTREME' || vectorRisk == 'HIGH') {
      climateAdvisory =
          'High atmospheric moisture and heat accelerate vector breeding. Apply pyrethroid fly repellents, maintain cattle shed drainage, and avoid waterlogged pasture grazing.';
    } else if (heatStress == 'Danger' || heatStress == 'Emergency') {
      climateAdvisory =
          'Severe heat stress risk ($thi THI). Provide shaded loafing areas, increase cold water intake points, and operate fans or misting systems during midday.';
    } else {
      climateAdvisory =
          'Meteorological parameters within standard seasonal tolerances. Maintain standard barn ventilation and hygiene.';
    }

    final result = WeatherRiskData(
      latitude: latitude,
      longitude: longitude,
      temperatureC: tempC,
      humidityPct: humidityPct,
      precipitationMm: precipMm,
      windSpeedKmh: windKmh,
      thi: thi,
      heatStressCategory: heatStress,
      vectorRiskLevel: vectorRisk,
      epidemicMultiplier: multiplier,
      vulnerableDiseases: vulnerableDiseases,
      climateAdvisory: climateAdvisory,
      timestamp: DateTime.now(),
      source: source,
    );

    _cache[cacheKey] = _CachedWeather(result, DateTime.now());
    return result;
  }
}

class _CachedWeather {
  final WeatherRiskData data;
  final DateTime timestamp;
  _CachedWeather(this.data, this.timestamp);
}
