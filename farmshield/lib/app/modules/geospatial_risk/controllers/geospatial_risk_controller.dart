import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../data/models/geo_risk_model.dart';
import '../../../data/models/health_models.dart';
import '../../../data/repositories/farm_repository.dart';
import '../../../routes/app_pages.dart';

class GeospatialRiskController extends GetxController {
  final FarmRepository repository = Get.find<FarmRepository>();

  // State Observables
  final selectedTimeRange = RiskTimeRange.thirtyDays.obs;
  final selectedStatuses = <String>{'critical', 'high', 'moderate', 'low', 'healthy'}.obs;
  final selectedDisease = 'All'.obs;
  final showWeatherOverlay = false.obs;
  final weatherData = Rxn<WeatherRiskData>();
  final layerMode = RiskLayerMode.hybrid.obs;

  final allRiskPoints = <AnimalRiskPoint>[].obs;
  final filteredPoints = <AnimalRiskPoint>[].obs;
  final selectedPoint = Rxn<AnimalRiskPoint>();
  final metricsSummary = const RiskMetricsSummary().obs;

  final isLoading = false.obs;
  final hasError = false.obs;
  final errorMessage = ''.obs;

  // Map elements
  final markers = <Marker>{}.obs;
  final circles = <Circle>{}.obs;

  GoogleMapController? _mapController;
  static const LatLng defaultCenter = LatLng(18.5793, 73.9824); // Pune agro-surveillance cluster locus

  @override
  void onInit() {
    super.onInit();
    fetchRiskData();
  }

  @override
  void onClose() {
    _mapController?.dispose();
    super.onClose();
  }

  void onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    if (filteredPoints.isNotEmpty) {
      fitMapToBounds();
    }
  }

  /// Fetch risk records from database with database-side time filtering
  Future<void> fetchRiskData() async {
    isLoading.value = true;
    hasError.value = false;
    errorMessage.value = '';

    try {
      final points = await repository.getGeospatialRiskPoints(
        timeRange: selectedTimeRange.value,
      );

      allRiskPoints.assignAll(points);
      _applyLocalStatusFilters();
    } catch (e) {
      hasError.value = true;
      errorMessage.value = 'Unable to load geospatial risk data. Please check your connection and retry.';
    } finally {
      isLoading.value = false;
    }
  }

  /// Filter points by selected statuses, disease, and rebuild map markers & heat halos
  void _applyLocalStatusFilters() {
    final statusSet = selectedStatuses;
    final disease = selectedDisease.value;
    final List<AnimalRiskPoint> result = [];

    for (final p in allRiskPoints) {
      if (disease != 'All') {
        final dis = p.suspectedDisease?.toLowerCase() ?? '';
        if (!dis.contains(disease.toLowerCase())) {
          continue;
        }
      }

      final isCrit = statusSet.contains('critical') && (p.severity == RiskSeverity.critical || p.mortalityCount > 0);
      final isHigh = statusSet.contains('high') && p.severity == RiskSeverity.high;
      final isMod = statusSet.contains('moderate') && p.severity == RiskSeverity.moderate;
      final isLow = statusSet.contains('low') && p.severity == RiskSeverity.low;
      final isHealthy = statusSet.contains('healthy') && p.severity == RiskSeverity.healthy;

      if (isCrit || isHigh || isMod || isLow || isHealthy) {
        result.add(p);
      }
    }

    filteredPoints.assignAll(result);
    metricsSummary.value = RiskMetricsSummary.fromPoints(result);
    _buildMapOverlays();

    // Auto-fit bounds if we have points and a live controller
    if (_mapController != null && result.isNotEmpty) {
      fitMapToBounds();
    }
  }

  void setDisease(String disease) {
    selectedDisease.value = disease;
    _applyLocalStatusFilters();
  }

  Future<void> toggleWeatherOverlay() async {
    showWeatherOverlay.toggle();
    if (showWeatherOverlay.value && weatherData.value == null) {
      try {
        final data = await repository.getWeatherRisk();
        weatherData.value = data;
      } catch (_) {}
    }
  }

  void setTimeRange(RiskTimeRange range) {
    selectedTimeRange.value = range;
    selectedPoint.value = null;
    fetchRiskData();
  }

  void toggleStatus(String statusKey) {
    if (selectedStatuses.contains(statusKey)) {
      if (selectedStatuses.length > 1) {
        selectedStatuses.remove(statusKey);
      }
    } else {
      selectedStatuses.add(statusKey);
    }
    _applyLocalStatusFilters();
  }

  void setLayerMode(RiskLayerMode mode) {
    layerMode.value = mode;
    _buildMapOverlays();
  }

  void resetFilters() {
    selectedTimeRange.value = RiskTimeRange.allTime;
    selectedStatuses.assignAll(['critical', 'high', 'moderate', 'low', 'healthy']);
    selectedPoint.value = null;
    fetchRiskData();
  }

  void selectPoint(AnimalRiskPoint? point) {
    selectedPoint.value = point;
    if (point != null && _mapController != null) {
      _mapController!.animateCamera(
        CameraUpdate.newLatLngZoom(LatLng(point.latitude, point.longitude), 15.5),
      );
    }
  }

  /// Navigate seamlessly into the existing Animal Detail Profile screen
  void viewAnimalProfile(AnimalRiskPoint point) {
    final identifier = point.animalId ?? point.animalCode;
    if (identifier != null && identifier.isNotEmpty) {
      Get.toNamed(Routes.ANIMAL_DETAIL, arguments: identifier);
    } else {
      Get.snackbar(
        'Animal Record',
        'Tag details: ${point.species.toUpperCase()} (${point.status})',
        snackPosition: SnackPosition.BOTTOM,
      );
    }
  }

  /// Build Google Map Markers and Heatmap Concentration Circles
  void _buildMapOverlays() {
    final Set<Marker> newMarkers = {};
    final Set<Circle> newCircles = {};

    final showMarkers = layerMode.value == RiskLayerMode.markers || layerMode.value == RiskLayerMode.hybrid;
    final showHeatmap = layerMode.value == RiskLayerMode.heatmap || layerMode.value == RiskLayerMode.hybrid;

    for (final p in filteredPoints) {
      final latLng = LatLng(p.latitude, p.longitude);

      // 1. Markers
      if (showMarkers) {
        double markerHue;
        switch (p.severity) {
          case RiskSeverity.critical:
            markerHue = BitmapDescriptor.hueRed;
            break;
          case RiskSeverity.high:
            markerHue = BitmapDescriptor.hueOrange;
            break;
          case RiskSeverity.moderate:
            markerHue = BitmapDescriptor.hueYellow;
            break;
          case RiskSeverity.low:
            markerHue = BitmapDescriptor.hueAzure;
            break;
          case RiskSeverity.healthy:
            markerHue = BitmapDescriptor.hueGreen;
            break;
        }

        newMarkers.add(
          Marker(
            markerId: MarkerId(p.id),
            position: latLng,
            icon: BitmapDescriptor.defaultMarkerWithHue(markerHue),
            infoWindow: InfoWindow(
              title: p.animalCode ?? (p.suspectedDisease ?? '${p.species.toUpperCase()} Incident'),
              snippet: '${p.affectedCount} affected • Status: ${p.status}',
              onTap: () => selectPoint(p),
            ),
            onTap: () => selectPoint(p),
          ),
        );
      }

      // 2. Heatmap Density Halos
      if (showHeatmap) {
        Color baseColor;
        switch (p.severity) {
          case RiskSeverity.critical:
            baseColor = const Color(0xFFDC2626);
            break;
          case RiskSeverity.high:
            baseColor = const Color(0xFFEA580C);
            break;
          case RiskSeverity.moderate:
            baseColor = const Color(0xFFF59E0B);
            break;
          case RiskSeverity.low:
            baseColor = const Color(0xFF0284C7);
            break;
          case RiskSeverity.healthy:
            baseColor = const Color(0xFF16A34A);
            break;
        }

        final double radiusMeters = (p.riskWeight * 35.0).clamp(180.0, 950.0);

        newCircles.add(
          Circle(
            circleId: CircleId('heat_${p.id}'),
            center: latLng,
            radius: radiusMeters,
            fillColor: baseColor.withValues(alpha: p.severity == RiskSeverity.critical ? 0.32 : 0.22),
            strokeColor: baseColor.withValues(alpha: 0.65),
            strokeWidth: 1,
            consumeTapEvents: true,
            onTap: () => selectPoint(p),
          ),
        );
      }
    }

    markers.assignAll(newMarkers);
    circles.assignAll(newCircles);
  }

  /// Automatically fits camera to encompass all active risk points
  void fitMapToBounds() {
    if (_mapController == null || filteredPoints.isEmpty) return;

    if (filteredPoints.length == 1) {
      final p = filteredPoints.first;
      _mapController!.animateCamera(
        CameraUpdate.newLatLngZoom(LatLng(p.latitude, p.longitude), 14.0),
      );
      return;
    }

    double minLat = filteredPoints.first.latitude;
    double maxLat = filteredPoints.first.latitude;
    double minLng = filteredPoints.first.longitude;
    double maxLng = filteredPoints.first.longitude;

    for (final p in filteredPoints) {
      if (p.latitude < minLat) minLat = p.latitude;
      if (p.latitude > maxLat) maxLat = p.latitude;
      if (p.longitude < minLng) minLng = p.longitude;
      if (p.longitude > maxLng) maxLng = p.longitude;
    }

    // Guard against identical coordinates
    if (minLat == maxLat && minLng == maxLng) {
      _mapController!.animateCamera(
        CameraUpdate.newLatLngZoom(LatLng(minLat, minLng), 14.0),
      );
      return;
    }

    final bounds = LatLngBounds(
      southwest: LatLng(minLat - 0.005, minLng - 0.005),
      northeast: LatLng(maxLat + 0.005, maxLng + 0.005),
    );

    _mapController!.animateCamera(
      CameraUpdate.newLatLngBounds(bounds, 48),
    );
  }

  void recenterToDefault() {
    if (_mapController == null) return;
    _mapController!.animateCamera(
      CameraUpdate.newLatLngZoom(defaultCenter, 13.5),
    );
  }
}
