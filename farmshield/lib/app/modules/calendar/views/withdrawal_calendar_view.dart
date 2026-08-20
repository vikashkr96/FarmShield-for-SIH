import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:intl/intl.dart';
import '../controllers/withdrawal_calendar_controller.dart';
import '../../../data/models/farm_models.dart';

class WithdrawalCalendarView extends GetView<WithdrawalCalendarController> {
  const WithdrawalCalendarView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F7FA),
      appBar: AppBar(
        title: Text(
          'Withdrawal Calendar',
          style: GoogleFonts.poppins(fontWeight: FontWeight.bold, color: Colors.white),
        ),
        backgroundColor: Colors.green.shade700,
        elevation: 0,
      ),
      body: Column(
        children: [
          _buildFilterChips(),
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator());
              }
              return Column(
                children: [
                  _buildCalendar(),
                  const Divider(),
                  Expanded(child: _buildWithdrawalList()),
                ],
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Obx(() => ListView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            children: controller.filters.map((filter) {
              final isSelected = controller.selectedFilter.value == filter;
              return Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: ChoiceChip(
                  label: Text(filter, style: GoogleFonts.poppins(fontSize: 12)),
                  selected: isSelected,
                  onSelected: (selected) {
                    if (selected) controller.selectedFilter.value = filter;
                  },
                  selectedColor: Colors.green.shade700,
                  labelStyle: TextStyle(
                    color: isSelected ? Colors.white : Colors.black87,
                  ),
                ),
              );
            }).toList(),
          )),
    );
  }

  Widget _buildCalendar() {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: TableCalendar(
        firstDay: DateTime.utc(2020, 1, 1),
        lastDay: DateTime.utc(2030, 12, 31),
        focusedDay: controller.focusedDay.value,
        selectedDayPredicate: (day) => isSameDay(controller.selectedDay.value, day),
        calendarFormat: controller.calendarFormat.value,
        onDaySelected: (selectedDay, focusedDay) {
          controller.selectedDay.value = selectedDay;
          controller.focusedDay.value = focusedDay;
        },
        onFormatChanged: (format) {
          controller.calendarFormat.value = format;
        },
        eventLoader: (day) {
          // We return dummy events just to trigger markers, 
          // but we will use calendarBuilders for custom markers.
          List<String> events = [];
          if (controller.hasActiveWithdrawal(day)) events.add('active');
          if (controller.isClearanceDay(day)) events.add('clearance');
          return events;
        },
        calendarStyle: CalendarStyle(
          todayDecoration: BoxDecoration(
            color: Colors.green.shade200,
            shape: BoxShape.circle,
          ),
          selectedDecoration: BoxDecoration(
            color: Colors.green.shade700,
            shape: BoxShape.circle,
          ),
        ),
        headerStyle: HeaderStyle(
          formatButtonVisible: true,
          titleCentered: true,
          formatButtonDecoration: BoxDecoration(
            color: Colors.green.shade700,
            borderRadius: BorderRadius.circular(20),
          ),
          formatButtonTextStyle: const TextStyle(color: Colors.white),
        ),
        calendarBuilders: CalendarBuilders(
          markerBuilder: (context, day, events) {
            if (events.isEmpty) return null;
            return Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: events.map((event) {
                if (event == 'active') {
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 1),
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                  );
                } else if (event == 'clearance') {
                  return const Icon(
                    Icons.check_circle,
                    color: Colors.green,
                    size: 12,
                  );
                }
                return const SizedBox.shrink();
              }).toList(),
            );
          },
        ),
      ),
    );
  }

  Widget _buildWithdrawalList() {
    final dailyWithdrawals = controller.getWithdrawalsForDay(controller.selectedDay.value);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          child: Text(
            'Clearance on ${DateFormat('MMM dd, yyyy').format(controller.selectedDay.value)}',
            style: GoogleFonts.poppins(fontSize: 16, fontWeight: FontWeight.bold),
          ),
        ),
        if (dailyWithdrawals.isEmpty)
          Expanded(
            child: Center(
              child: Text(
                'No animal clearances scheduled for this day.',
                style: GoogleFonts.poppins(color: Colors.grey),
              ),
            ),
          )
        else
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: dailyWithdrawals.length,
              itemBuilder: (context, index) {
                final w = dailyWithdrawals[index];
                return Card(
                  elevation: 0,
                  margin: const EdgeInsets.only(bottom: 8),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: BorderSide(color: Colors.grey.shade200),
                  ),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.green.shade50,
                      child: const Icon(Icons.check, color: Colors.green),
                    ),
                    title: Text(
                      '${w.animal?.animalCode ?? "Unknown Animal"} (${w.animal?.species ?? ""})',
                      style: GoogleFonts.poppins(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text(
                      'Product: ${w.product}',
                      style: GoogleFonts.poppins(fontSize: 12),
                    ),
                    trailing: const Icon(Icons.chevron_right),
                  ),
                );
              },
            ),
          ),
      ],
    );
  }
}
