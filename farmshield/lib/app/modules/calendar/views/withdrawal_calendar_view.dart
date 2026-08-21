import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';
import '../controllers/withdrawal_calendar_controller.dart';
import '../../../data/models/farm_models.dart';
import '../../../routes/app_pages.dart';

class WithdrawalCalendarView extends GetView<WithdrawalCalendarController> {
  const WithdrawalCalendarView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Withdrawal Calendar',
              style: GoogleFonts.poppins(fontWeight: FontWeight.w700, fontSize: 18, color: Colors.white),
            ),
            Text(
              'MRL Compliance & Safe Harvest Tracker',
              style: GoogleFonts.poppins(fontSize: 11, color: Colors.white.withOpacity(0.85)),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1B5E20),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: Colors.white),
            onPressed: () => controller.fetchWithdrawals(),
            tooltip: 'Refresh Calendar',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => controller.fetchWithdrawals(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 1. Stats KPI Strip
              _buildStatsKpiStrip(),

              // 2. High-Contrast Species Filters
              _buildFilterChips(),

              // 3. Calendar Container with Legend
              _buildCalendarSection(),

              const SizedBox(height: 8),

              // 4. Daily Withholds & Clearances List
              _buildWithdrawalDetailList(),
              
              const SizedBox(height: 32),
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

      return Container(
        margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 10,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: _buildKpiTile(
                icon: Icons.warning_amber_rounded,
                iconColor: Colors.amber.shade800,
                bgColor: Colors.amber.shade50,
                label: 'Active Withholds',
                value: '$activeCount Animals',
                sublabel: 'Zero Sale Active',
              ),
            ),
            Container(width: 1, height: 40, color: Colors.grey.shade200),
            Expanded(
              child: _buildKpiTile(
                icon: Icons.check_circle_outline_rounded,
                iconColor: const Color(0xFF1B5E20),
                bgColor: const Color(0xFFE8F5E9),
                label: 'Safe Clearances',
                value: '$upcomingCount Scheduled',
                sublabel: 'Next 7 Days',
              ),
            ),
          ],
        ),
      );
    });
  }

  Widget _buildKpiTile({
    required IconData icon,
    required Color iconColor,
    required Color bgColor,
    required String label,
    required String value,
    required String sublabel,
  }) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: GoogleFonts.poppins(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF0F172A),
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              Text(
                sublabel,
                style: GoogleFonts.poppins(fontSize: 10, color: Colors.blueGrey.shade600),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 48,
      margin: const EdgeInsets.symmetric(vertical: 4),
      child: Obx(() => ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: controller.filters.map((filter) {
              final isSelected = controller.selectedFilter.value == filter;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Text(
                    filter,
                    style: GoogleFonts.poppins(
                      fontSize: 11.5,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                    ),
                  ),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) controller.selectedFilter.value = filter;
                  },
                  selectedColor: const Color(0xFF1B5E20),
                  backgroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  side: BorderSide(
                    color: isSelected ? const Color(0xFF1B5E20) : Colors.grey.shade300,
                    width: isSelected ? 1.5 : 1,
                  ),
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : Colors.blueGrey.shade800,
                  ),
                ),
              );
            }).toList(),
          )),
    );
  }

  Widget _buildCalendarSection() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Obx(() => TableCalendar(
                firstDay: DateTime.utc(2020, 1, 1),
                lastDay: DateTime.utc(2030, 12, 31),
                focusedDay: controller.focusedDay.value,
                selectedDayPredicate: (day) => isSameDay(controller.selectedDay.value, day),
                calendarFormat: controller.calendarFormat.value,
                rowHeight: 46,
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
                    color: Colors.green.shade100,
                    shape: BoxShape.circle,
                  ),
                  todayTextStyle: GoogleFonts.poppins(
                    color: const Color(0xFF1B5E20),
                    fontWeight: FontWeight.bold,
                  ),
                  selectedDecoration: const BoxDecoration(
                    color: Color(0xFF1B5E20),
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
                  titleTextStyle: GoogleFonts.poppins(fontSize: 15, fontWeight: FontWeight.bold),
                  formatButtonDecoration: BoxDecoration(
                    color: const Color(0xFF1B5E20),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  formatButtonTextStyle: GoogleFonts.poppins(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold),
                ),
                calendarBuilders: CalendarBuilders(
                  markerBuilder: (context, day, events) {
                    if (events.isEmpty) return null;
                    return Positioned(
                      bottom: 4,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: events.map((event) {
                          if (event == 'active') {
                            return Container(
                              margin: const EdgeInsets.symmetric(horizontal: 1.5),
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Colors.redAccent,
                                shape: BoxShape.circle,
                              ),
                            );
                          } else if (event == 'clearance') {
                            return Container(
                              margin: const EdgeInsets.symmetric(horizontal: 1.5),
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: Color(0xFF1B5E20),
                                shape: BoxShape.circle,
                              ),
                            );
                          }
                          return const SizedBox.shrink();
                        }).toList(),
                      ),
                    );
                  },
                ),
              )),

          // Legend Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: const Color(0xFFF8FAFC),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(20),
              ),
              border: Border(top: BorderSide(color: Colors.grey.shade100)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildLegendItem(Colors.redAccent, "Active Withhold (Do Not Sell)"),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildLegendItem(const Color(0xFF1B5E20), "Safe Clearance (MRL 0)"),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 7,
          height: 7,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 5),
        Flexible(
          child: Text(
            label,
            style: GoogleFonts.poppins(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.blueGrey.shade700),
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
      final formattedDate = DateFormat('EEEE, MMM dd, yyyy').format(selectedDate);

      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Schedule for $formattedDate',
                    style: GoogleFonts.poppins(fontSize: 14, fontWeight: FontWeight.w700, color: const Color(0xFF0F172A)),
                  ),
                  Text(
                    '${dailyWithdrawals.length} Event(s)',
                    style: GoogleFonts.poppins(fontSize: 11.5, fontWeight: FontWeight.bold, color: const Color(0xFF1B5E20)),
                  ),
                ],
              ),
            ),
            if (dailyWithdrawals.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  children: [
                    Icon(Icons.verified_outlined, size: 36, color: Colors.green.shade400),
                    const SizedBox(height: 8),
                    Text(
                      'No Active Withholds on this Day',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.bold, fontSize: 13.5, color: const Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'All livestock produce (Milk / Meat) is safe for human consumption and commercial sale.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.poppins(fontSize: 11, color: Colors.blueGrey.shade500),
                    ),
                  ],
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
                  final isUnderWithhold = controller.isDayInWithhold(w, selectedDate);

                  return _buildWithdrawalCard(context, w, isClearanceDay, isUnderWithhold);
                },
              ),
          ],
        ),
      );
    });
  }

  Widget _buildWithdrawalCard(BuildContext context, Withdrawal w, bool isClearanceDay, bool isUnderWithhold) {
    final animalCode = w.animal?.animalCode ?? 'Unknown Tag';
    final species = w.animal?.species ?? 'Livestock';
    final breed = w.animal?.breed ?? 'Indigenous Breed';
    final medName = w.medicineName ?? 'Antimicrobial Therapy';
    final indication = w.indication ?? 'Routine Treatment';
    final dosage = w.dosage ?? 'Prescribed Dose';
    final product = w.product.toUpperCase();

    final cardColor = isClearanceDay ? const Color(0xFFF0FDF4) : const Color(0xFFFFFBEB);
    final borderColor = isClearanceDay ? Colors.green.shade300 : Colors.amber.shade400;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: () {
            if (w.animal != null) {
              Get.toNamed(Routes.ANIMAL_DETAIL, arguments: w.animal);
            }
          },
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header Row: Animal Code + Product Status Pill
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(7),
                          decoration: BoxDecoration(
                            color: isClearanceDay ? Colors.green.shade50 : Colors.amber.shade50,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(
                            isClearanceDay ? Icons.check_circle_rounded : Icons.lock_clock_rounded,
                            color: isClearanceDay ? const Color(0xFF1B5E20) : Colors.amber.shade900,
                            size: 18,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              animalCode,
                              style: GoogleFonts.poppins(
                                fontWeight: FontWeight.w700,
                                fontSize: 13.5,
                                color: const Color(0xFF0F172A),
                              ),
                            ),
                            Text(
                              '$breed • ${species.toUpperCase()}',
                              style: GoogleFonts.poppins(fontSize: 10.5, color: Colors.blueGrey.shade600),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isClearanceDay ? const Color(0xFF1B5E20) : Colors.red.shade700,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        isClearanceDay ? 'SAFE TO HARVEST' : 'WITHHOLD $product',
                        style: GoogleFonts.poppins(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                const Divider(height: 1),
                const SizedBox(height: 10),

                // Medicine & Treatment Specs
                Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Prescribed Drug',
                            style: GoogleFonts.poppins(fontSize: 10, color: Colors.blueGrey.shade400),
                          ),
                          Text(
                            medName,
                            style: GoogleFonts.poppins(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF0F172A),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Indication / Dose',
                            style: GoogleFonts.poppins(fontSize: 10, color: Colors.blueGrey.shade400),
                          ),
                          Text(
                            '$indication ($dosage)',
                            style: GoogleFonts.poppins(
                              fontSize: 11.5,
                              fontWeight: FontWeight.w500,
                              color: Colors.blueGrey.shade800,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),

                // Clearance Date & Inspect Action
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Clearance: ${DateFormat('MMM dd, yyyy (hh:mm a)').format(w.endDate)}',
                      style: GoogleFonts.poppins(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: isClearanceDay ? const Color(0xFF1B5E20) : Colors.redAccent.shade700,
                      ),
                    ),
                    Row(
                      children: [
                        Text(
                          'View Profile',
                          style: GoogleFonts.poppins(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: const Color(0xFF1B5E20),
                          ),
                        ),
                        const Icon(Icons.chevron_right_rounded, size: 16, color: Color(0xFF1B5E20)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
