import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_spacing.dart';
import '../../../core/theme/app_typography.dart';
import '../../../core/widgets/app_badge.dart';
import '../../../core/widgets/app_card.dart';
import '../../../data/models/farm_models.dart';
import '../../../routes/app_pages.dart';
import '../controllers/withdrawal_calendar_controller.dart';

class WithdrawalCalendarView extends GetView<WithdrawalCalendarController> {
  const WithdrawalCalendarView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Withdrawal Calendar',
              style: AppTypography.titleMedium.copyWith(color: Colors.white),
            ),
            Text(
              'MRL Compliance & Safe Harvest Tracker',
              style: AppTypography.bodySmall.copyWith(
                color: Colors.white.withValues(alpha: 0.8),
                fontSize: 10.5,
              ),
            ),
          ],
        ),
        backgroundColor: AppColors.primary,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            tooltip: 'Refresh Calendar',
            onPressed: () => controller.fetchWithdrawals(),
          ),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: () => controller.fetchWithdrawals(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(parent: BouncingScrollPhysics()),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildStatsKpiStrip(),
              _buildFilterChips(),
              _buildCalendarSection(),
              const SizedBox(height: AppSpacing.md),
              _buildWithdrawalDetailList(),
              const SizedBox(height: AppSpacing.xxxl),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatsKpiStrip() {
    return Obx(() {
      final activeCount = controller.activeWithholdsCount;
      final upcomingCount = controller.upcomingClearancesCount;

      return Padding(
        padding: const EdgeInsets.fromLTRB(AppSpacing.lg, AppSpacing.md, AppSpacing.lg, AppSpacing.xs),
        child: AppCard(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Row(
            children: [
              Expanded(
                child: _kpiTile(
                  icon: Icons.warning_amber_rounded,
                  iconColor: AppColors.danger,
                  bgColor: AppColors.dangerBg,
                  label: 'Active Withholds',
                  value: '$activeCount Animals',
                  sublabel: 'Do Not Harvest',
                ),
              ),
              Container(width: 1, height: 42, color: AppColors.border),
              Expanded(
                child: _kpiTile(
                  icon: Icons.verified_rounded,
                  iconColor: AppColors.success,
                  bgColor: AppColors.successBg,
                  label: 'Safe Clearances',
                  value: '$upcomingCount Scheduled',
                  sublabel: 'Next 7 Days',
                ),
              ),
            ],
          ),
        ),
      );
    });
  }

  Widget _kpiTile({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String label,
    required String value,
    required String sublabel,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: bgColor, shape: BoxShape.circle),
            child: Icon(icon, color: iconColor, size: 18),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  value,
                  style: AppTypography.titleSmall.copyWith(fontSize: 13),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  sublabel,
                  style: AppTypography.labelSmall.copyWith(
                    color: AppColors.textMuted,
                    fontSize: 9.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 48,
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Obx(() => ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            children: controller.filters.map((filter) {
              final isSelected = controller.selectedFilter.value == filter;
              return Padding(
                padding: const EdgeInsets.only(right: AppSpacing.sm),
                child: ChoiceChip(
                  label: Text(
                    filter,
                    style: AppTypography.labelSmall.copyWith(
                      color: isSelected ? Colors.white : AppColors.textSecondary,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                    ),
                  ),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) controller.selectedFilter.value = filter;
                  },
                  selectedColor: AppColors.primary,
                  backgroundColor: AppColors.surface,
                  side: BorderSide(
                    color: isSelected ? AppColors.primary : AppColors.border,
                    width: 1.0,
                  ),
                ),
              );
            }).toList(),
          )),
    );
  }

  Widget _buildCalendarSection() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg, vertical: AppSpacing.xs),
      child: AppCard(
        padding: EdgeInsets.zero,
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(AppSpacing.md),
              child: Obx(() => TableCalendar(
                    firstDay: DateTime.utc(2020, 1, 1),
                    lastDay: DateTime.utc(2030, 12, 31),
                    focusedDay: controller.focusedDay.value,
                    selectedDayPredicate: (day) => isSameDay(controller.selectedDay.value, day),
                    calendarFormat: controller.calendarFormat.value,
                    rowHeight: 44,
                    onDaySelected: (selectedDay, focusedDay) {
                      controller.selectedDay.value = selectedDay;
                      controller.focusedDay.value = focusedDay;
                    },
                    onFormatChanged: (format) {
                      controller.calendarFormat.value = format;
                    },
                    eventLoader: (day) {
                      List<String> events = [];
                      if (controller.hasActiveWithdrawal(day)) events.add('active');
                      if (controller.isClearanceDay(day)) events.add('clearance');
                      return events;
                    },
                    calendarStyle: CalendarStyle(
                      todayDecoration: BoxDecoration(
                        color: AppColors.primarySoft,
                        shape: BoxShape.circle,
                      ),
                      todayTextStyle: GoogleFonts.poppins(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                      selectedDecoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                      selectedTextStyle: GoogleFonts.poppins(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                      outsideDaysVisible: false,
                    ),
                    headerStyle: HeaderStyle(
                      formatButtonVisible: true,
                      titleCentered: true,
                      formatButtonShowsNext: false,
                      titleTextStyle: AppTypography.titleSmall,
                      formatButtonDecoration: BoxDecoration(
                        color: AppColors.primarySoft,
                        borderRadius: AppSpacing.roundedSm,
                      ),
                      formatButtonTextStyle: AppTypography.labelSmall.copyWith(color: AppColors.primary),
                    ),
                    calendarBuilders: CalendarBuilders(
                      markerBuilder: (context, day, events) {
                        if (events.isEmpty) return null;
                        return Positioned(
                          bottom: 4,
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: events.map((event) {
                              final color = event == 'active' ? AppColors.danger : AppColors.success;
                              return Container(
                                margin: const EdgeInsets.symmetric(horizontal: 1.5),
                                width: 5,
                                height: 5,
                                decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                              );
                            }).toList(),
                          ),
                        );
                      },
                    ),
                  )),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md, vertical: AppSpacing.sm),
              decoration: const BoxDecoration(
                color: AppColors.surfaceSubtle,
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(AppSpacing.radiusLg)),
                border: Border(top: BorderSide(color: AppColors.border)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: _legendItem(AppColors.danger, 'Withhold (Do Not Sell)'),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    child: _legendItem(AppColors.success, 'Safe Clearance'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _legendItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 7,
          height: 7,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 6),
        Flexible(
          child: Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: AppColors.textSecondary,
              fontSize: 10.5,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildWithdrawalDetailList() {
    return Obx(() {
      final selectedDate = controller.selectedDay.value;
      final dailyWithdrawals = controller.getWithdrawalsForDay(selectedDate);
      final formattedDate = DateFormat('EEEE, dd MMM yyyy').format(selectedDate);

      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm, horizontal: 2),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Schedule for $formattedDate',
                    style: AppTypography.titleSmall,
                  ),
                  Text(
                    '${dailyWithdrawals.length} Event(s)',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            if (dailyWithdrawals.isEmpty)
              AppCard(
                padding: const EdgeInsets.all(AppSpacing.xl),
                child: Center(
                  child: Column(
                    children: [
                      const Icon(Icons.verified_outlined, size: 36, color: AppColors.success),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        'No Active Withholds on this Day',
                        style: AppTypography.titleSmall,
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'All livestock produce (Milk / Meat) is safe for human consumption and commercial distribution.',
                        textAlign: TextAlign.center,
                        style: AppTypography.bodySmall,
                      ),
                    ],
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: dailyWithdrawals.length,
                itemBuilder: (context, index) {
                  final w = dailyWithdrawals[index];
                  final isClearanceDay = isSameDay(w.endDate, selectedDate);
                  return _buildWithdrawalCard(w, isClearanceDay);
                },
              ),
          ],
        ),
      );
    });
  }

  Widget _buildWithdrawalCard(Withdrawal w, bool isClearanceDay) {
    final animalCode = w.animal?.animalCode ?? 'Unknown Tag';
    final species = w.animal?.species ?? 'Livestock';
    final breed = w.animal?.breed ?? 'Indigenous';
    final medName = w.medicineName ?? 'Antimicrobial Drug';
    final product = w.product.toUpperCase();

    return AppCard(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      borderColor: isClearanceDay
          ? AppColors.success.withValues(alpha: 0.3)
          : AppColors.danger.withValues(alpha: 0.3),
      onTap: () {
        if (w.animal != null) {
          Get.toNamed(Routes.ANIMAL_DETAIL, arguments: w.animal);
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: isClearanceDay ? AppColors.successBg : AppColors.dangerBg,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      isClearanceDay ? Icons.check_circle_rounded : Icons.lock_clock_rounded,
                      color: isClearanceDay ? AppColors.success : AppColors.danger,
                      size: 16,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    animalCode,
                    style: AppTypography.codeTag.copyWith(fontSize: 13.5),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    '• ${species.capitalizeFirst} ($breed)',
                    style: AppTypography.bodySmall,
                  ),
                ],
              ),
              AppBadge(
                label: isClearanceDay ? 'SAFE TO HARVEST' : 'WITHHOLD $product',
                variant: isClearanceDay ? AppBadgeVariant.success : AppBadgeVariant.danger,
                isSmall: true,
              ),
            ],
          ),
          const Divider(height: 20),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Medication', style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted)),
                    Text(medName, style: AppTypography.titleSmall.copyWith(fontSize: 12.5)),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Clearance Time', style: AppTypography.labelSmall.copyWith(color: AppColors.textMuted)),
                    Text(
                      DateFormat('MMM dd, hh:mm a').format(w.endDate),
                      style: AppTypography.labelSmall.copyWith(
                        color: isClearanceDay ? AppColors.success : AppColors.danger,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
