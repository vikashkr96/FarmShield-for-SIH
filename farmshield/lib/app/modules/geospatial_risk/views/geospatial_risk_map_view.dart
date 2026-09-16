import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_card.dart';
import '../../../core/widgets/app_empty_state.dart';
import '../../../data/models/geo_risk_model.dart';
import '../../../data/models/health_models.dart';
import '../controllers/geospatial_risk_controller.dart';
import '../widgets/risk_point_detail_card.dart';
import '../widgets/risk_summary_card.dart';

class GeospatialRiskMapView extends StatelessWidget {
  const GeospatialRiskMapView({super.key});

  @override
  Widget build(BuildContext context) {
    // Ensure controller is registered
    final controller = Get.put(GeospatialRiskController());

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(context, controller),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final isTabletOrDesktop = constraints.maxWidth >= 800;

          if (isTabletOrDesktop) {
            return _buildWideLayout(context, controller);
          } else {
            return _buildMobileLayout(context, controller);
          }
        },
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context, GeospatialRiskController controller) {
    return AppBar(
      titleSpacing: 12,
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: AppSpacing.roundedSm,
            ),
            child: const Icon(Icons.travel_explore_rounded, color: AppColors.accent, size: 18),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Risk Map',
                  style: GoogleFonts.poppins(
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    fontSize: 16,
                    letterSpacing: 0.2,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Geospatial Surveillance',
                  style: GoogleFonts.inter(
                    fontSize: 10,
                    color: Colors.white.withValues(alpha: 0.8),
                    fontWeight: FontWeight.w500,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        // Weather Overlay toggle
        Obx(() {
          final isWeatherActive = controller.showWeatherOverlay.value;
          return IconButton(
            padding: const EdgeInsets.all(6),
            constraints: const BoxConstraints(),
            icon: Container(
              padding: const EdgeInsets.all(5),
              decoration: BoxDecoration(
                color: isWeatherActive ? AppColors.accent : Colors.white.withValues(alpha: 0.15),
                borderRadius: AppSpacing.roundedSm,
              ),
              child: Icon(
                Icons.cloud_outlined,
                color: isWeatherActive ? AppColors.primaryDark : Colors.white,
                size: 16,
              ),
            ),
            tooltip: 'Toggle Weather Risk',
            onPressed: controller.toggleWeatherOverlay,
          );
        }),
        const SizedBox(width: 4),
        // Layer mode toggle button
        PopupMenuButton<RiskLayerMode>(
          padding: EdgeInsets.zero,
          constraints: const BoxConstraints(),
          icon: Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: AppSpacing.roundedSm,
            ),
            child: const Icon(Icons.layers_rounded, color: Colors.white, size: 16),
          ),
          tooltip: 'Layer Mode',
          onSelected: controller.setLayerMode,
          itemBuilder: (context) => [
            _layerMenuItem(RiskLayerMode.hybrid, Icons.dashboard_outlined, 'Hybrid (Heatmap + Pins)', controller.layerMode.value),
            _layerMenuItem(RiskLayerMode.heatmap, Icons.radar_rounded, 'Risk Heatmap Halos', controller.layerMode.value),
            _layerMenuItem(RiskLayerMode.markers, Icons.location_on_outlined, 'Animal / Incident Pins', controller.layerMode.value),
          ],
        ),
        const SizedBox(width: 4),
        // Fit camera / Recentering
        IconButton(
          padding: const EdgeInsets.all(6),
          constraints: const BoxConstraints(),
          icon: Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: AppSpacing.roundedSm,
            ),
            child: const Icon(Icons.crop_free_rounded, color: Colors.white, size: 16),
          ),
          tooltip: 'Fit All Points',
          onPressed: controller.fitMapToBounds,
        ),
        const SizedBox(width: 4),
        // Refresh button
        IconButton(
          padding: const EdgeInsets.all(6),
          constraints: const BoxConstraints(),
          icon: Container(
            padding: const EdgeInsets.all(5),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              borderRadius: AppSpacing.roundedSm,
            ),
            child: const Icon(Icons.refresh_rounded, color: Colors.white, size: 16),
          ),
          tooltip: 'Refresh Intelligence',
          onPressed: controller.fetchRiskData,
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  PopupMenuItem<RiskLayerMode> _layerMenuItem(
    RiskLayerMode mode,
    IconData icon,
    String label,
    RiskLayerMode current,
  ) {
    final isSelected = mode == current;
    return PopupMenuItem<RiskLayerMode>(
      value: mode,
      child: Row(
        children: [
          Icon(icon, size: 18, color: isSelected ? AppColors.primary : AppColors.slate600),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              label,
              style: AppTypography.bodySmall.copyWith(
                color: isSelected ? AppColors.primary : AppColors.slate700,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ),
          if (isSelected) const Icon(Icons.check_rounded, size: 16, color: AppColors.primary),
        ],
      ),
    );
  }

  // --- Mobile Stack Layout ---
  Widget _buildMobileLayout(BuildContext context, GeospatialRiskController controller) {
    return Stack(
      children: [
        // 1. Fullscreen Google Map
        _buildMapCanvas(controller),

        // 2. Top Floating Filter Bars
        Positioned(
          top: 10,
          left: 12,
          right: 12,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildTimeRangeSelector(controller),
              const SizedBox(height: 6),
              _buildDiseaseFilterRow(controller),
              const SizedBox(height: 6),
              _buildStatusFilterRow(controller),
              _buildWeatherOverlayCard(controller),
            ],
          ),
        ),

        // 3. Subtle Loading Indicator Overlay
        Positioned(
          top: 110,
          left: 0,
          right: 0,
          child: Obx(() {
            if (!controller.isLoading.value) return const SizedBox.shrink();
            return Center(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.slate900.withValues(alpha: 0.85),
                  borderRadius: AppSpacing.roundedFull,
                  boxShadow: AppSpacing.shadowCard,
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const SizedBox(
                      width: 14,
                      height: 14,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.accent),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Refreshing Geographic Risk...',
                      style: AppTypography.labelSmall.copyWith(color: Colors.white, fontSize: 11),
                    ),
                  ],
                ),
              ),
            );
          }),
        ),

        // 4. Empty State Floating Card
        Positioned(
          top: 160,
          left: 20,
          right: 20,
          child: Obx(() {
            if (controller.isLoading.value || controller.filteredPoints.isNotEmpty) {
              return const SizedBox.shrink();
            }
            return Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: AppSpacing.roundedLg,
                boxShadow: AppSpacing.shadowElevated,
                border: Border.all(color: AppColors.border),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppEmptyState(
                    icon: Icons.map_outlined,
                    title: 'No Animal Risk Activity Found',
                    description: 'There are no reported disease incidents or high-risk animal events for ${controller.selectedTimeRange.value.label}.',
                    actionLabel: 'Reset Filters to All Time',
                    onAction: controller.resetFilters,
                  ),
                ],
              ),
            );
          }),
        ),

        // 5. Bottom Sliding Card (Detail Card when selected, or Risk Summary)
        Positioned(
          bottom: 12,
          left: 12,
          right: 12,
          child: Obx(() {
            final selected = controller.selectedPoint.value;
            if (selected != null) {
              return RiskPointDetailCard(
                point: selected,
                onClose: () => controller.selectPoint(null),
                onViewProfile: () => controller.viewAnimalProfile(selected),
              );
            }

            return RiskSummaryCard(
              summary: controller.metricsSummary.value,
              timeRange: controller.selectedTimeRange.value,
            );
          }),
        ),
      ],
    );
  }

  // --- Wide Tablet / Desktop Split Layout ---
  Widget _buildWideLayout(BuildContext context, GeospatialRiskController controller) {
    return Row(
      children: [
        // Left: Interactive Google Map Canvas
        Expanded(
          flex: 6,
          child: Stack(
            children: [
              _buildMapCanvas(controller),
              Positioned(
                top: 12,
                left: 12,
                child: _buildTimeRangeSelector(controller),
              ),
              Positioned(
                top: 54,
                left: 12,
                child: _buildDiseaseFilterRow(controller),
              ),
              Positioned(
                top: 96,
                left: 12,
                child: _buildStatusFilterRow(controller),
              ),
              Positioned(
                top: 138,
                left: 12,
                child: _buildWeatherOverlayCard(controller),
              ),
            ],
          ),
        ),

        // Right Panel: Intelligence Side Sheet
        Expanded(
          flex: 4,
          child: Container(
            decoration: const BoxDecoration(
              color: AppColors.surface,
              border: Border(left: BorderSide(color: AppColors.border, width: 1.0)),
            ),
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Geographic Intelligence', style: AppTypography.titleMedium),
                  const SizedBox(height: 12),
                  Obx(() => RiskSummaryCard(
                        summary: controller.metricsSummary.value,
                        timeRange: controller.selectedTimeRange.value,
                      )),
                  const SizedBox(height: 16),
                  Obx(() {
                    final selected = controller.selectedPoint.value;
                    if (selected == null) {
                      return AppCard(
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        child: Center(
                          child: Column(
                            children: [
                              const Icon(Icons.touch_app_rounded, size: 36, color: AppColors.slate400),
                              const SizedBox(height: 8),
                              Text(
                                'Select Any Map Marker or Cluster',
                                style: AppTypography.titleSmall.copyWith(color: AppColors.slate700),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Tap any marker on the map to inspect animal health history, disease diagnosis, and access their official profile.',
                                textAlign: TextAlign.center,
                                style: AppTypography.bodySmall.copyWith(color: AppColors.slate500),
                              ),
                            ],
                          ),
                        ),
                      );
                    }

                    return RiskPointDetailCard(
                      point: selected,
                      onClose: () => controller.selectPoint(null),
                      onViewProfile: () => controller.viewAnimalProfile(selected),
                    );
                  }),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMapCanvas(GeospatialRiskController controller) {
    return Obx(() {
      final markers = controller.markers.toSet();
      final circles = controller.circles.toSet();

      return GoogleMap(
        initialCameraPosition: const CameraPosition(
          target: GeospatialRiskController.defaultCenter,
          zoom: 13.5,
        ),
        onMapCreated: controller.onMapCreated,
        markers: markers,
        circles: circles,
        myLocationEnabled: false,
        myLocationButtonEnabled: false,
        zoomControlsEnabled: false,
        mapToolbarEnabled: false,
        compassEnabled: true,
        onTap: (_) => controller.selectPoint(null),
      );
    });
  }

  // Horizontal scrollable time range pills
  Widget _buildTimeRangeSelector(GeospatialRiskController controller) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Obx(() {
        final current = controller.selectedTimeRange.value;
        return Row(
          children: RiskTimeRange.values.map((range) {
            final isSelected = range == current;
            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: GestureDetector(
                onTap: () => controller.setTimeRange(range),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primaryDark : Colors.white,
                    borderRadius: AppSpacing.roundedFull,
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.slate200,
                      width: 1.2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFF0F172A).withValues(alpha: 0.12),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Text(
                    range.label,
                    style: AppTypography.labelSmall.copyWith(
                      color: isSelected ? Colors.white : AppColors.slate700,
                      fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                      fontSize: 11,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        );
      }),
    );
  }

  // Status Filter Chips
  Widget _buildStatusFilterRow(GeospatialRiskController controller) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Obx(() {
        final selectedSet = controller.selectedStatuses.toSet();

        return Row(
          children: [
            _statusChip('critical', 'Died / Critical', const Color(0xFFDC2626), selectedSet.contains('critical'), () => controller.toggleStatus('critical')),
            _statusChip('high', 'Under Treatment', const Color(0xFFEA580C), selectedSet.contains('high'), () => controller.toggleStatus('high')),
            _statusChip('moderate', 'Moderate', const Color(0xFFD97706), selectedSet.contains('moderate'), () => controller.toggleStatus('moderate')),
            _statusChip('low', 'Monitored', const Color(0xFF0284C7), selectedSet.contains('low'), () => controller.toggleStatus('low')),
            _statusChip('healthy', 'Healthy', const Color(0xFF16A34A), selectedSet.contains('healthy'), () => controller.toggleStatus('healthy')),
          ],
        );
      }),
    );
  }

  Widget _statusChip(
    String key,
    String label,
    Color color,
    bool isSelected,
    VoidCallback onTap,
  ) {
    return Padding(
      padding: const EdgeInsets.only(right: 6),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: isSelected ? color.withValues(alpha: 0.14) : Colors.white.withValues(alpha: 0.85),
            borderRadius: AppSpacing.roundedFull,
            border: Border.all(
              color: isSelected ? color : AppColors.slate300,
              width: isSelected ? 1.4 : 1.0,
            ),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF0F172A).withValues(alpha: 0.08),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 7,
                height: 7,
                decoration: BoxDecoration(
                  color: isSelected ? color : AppColors.slate400,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 5),
              Text(
                label,
                style: AppTypography.labelSmall.copyWith(
                  color: isSelected ? color : AppColors.slate600,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  fontSize: 10.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDiseaseFilterRow(GeospatialRiskController controller) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      physics: const BouncingScrollPhysics(),
      child: Obx(() {
        final current = controller.selectedDisease.value;
        final list = ['All', 'FMD', 'LSD', 'HS', 'Mastitis', 'Anthrax'];
        return Row(
          children: list.map((d) {
            final isSelected = current == d;
            return Padding(
              padding: const EdgeInsets.only(right: 6),
              child: GestureDetector(
                onTap: () => controller.setDisease(d),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : Colors.white,
                    borderRadius: AppSpacing.roundedFull,
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.slate200,
                      width: 1.0,
                    ),
                    boxShadow: AppSpacing.shadowSubtle,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.coronavirus_outlined,
                        size: 11,
                        color: isSelected ? Colors.white : AppColors.primary,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        d == 'All' ? 'All Pathogens' : d,
                        style: TextStyle(
                          fontSize: 10.5,
                          fontWeight: isSelected ? FontWeight.w800 : FontWeight.w600,
                          color: isSelected ? Colors.white : AppColors.slate700,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        );
      }),
    );
  }

  Widget _buildWeatherOverlayCard(GeospatialRiskController controller) {
    return Obx(() {
      if (!controller.showWeatherOverlay.value) return const SizedBox.shrink();
      final weather = controller.weatherData.value ?? WeatherRiskData.fallback();
      return Container(
        margin: const EdgeInsets.only(top: 6),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: AppSpacing.roundedMd,
          boxShadow: AppSpacing.shadowElevated,
          border: Border.all(color: AppColors.border),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.cloud_outlined, color: AppColors.primary, size: 18),
            const SizedBox(width: 8),
            Text(
              '${weather.temperatureC.toStringAsFixed(1)}°C  •  ${weather.humidityPct.toStringAsFixed(0)}% RH  •  THI: ${weather.thi.toStringAsFixed(0)} (${weather.heatStressCategory})',
              style: AppTypography.labelSmall.copyWith(fontWeight: FontWeight.w700, fontSize: 11),
            ),
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: weather.vectorRiskLevel == 'EXTREME' || weather.vectorRiskLevel == 'HIGH'
                    ? AppColors.dangerBg
                    : AppColors.successBg,
                borderRadius: AppSpacing.roundedXs,
              ),
              child: Text(
                'Vector: ${weather.vectorRiskLevel}',
                style: TextStyle(
                  fontSize: 9,
                  fontWeight: FontWeight.bold,
                  color: weather.vectorRiskLevel == 'EXTREME' || weather.vectorRiskLevel == 'HIGH'
                      ? AppColors.danger
                      : AppColors.success,
                ),
              ),
            ),
          ],
        ),
      );
    });
  }
}
