import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  CheckCircle2, 
  AlertOctagon, 
  Clock, 
  Sparkles,
  Milk,
  Beef,
  Egg
} from 'lucide-react';

export const WithdrawalCalendar: React.FC = () => {
  const { animals, treatments, setSelectedAnimalForPassport, t } = useApp();

  const [currentMonth, setCurrentMonth] = useState(7); // 0-indexed, 7 = August
  const [currentYear, setCurrentYear] = useState(2026);
  const [productFilter, setProductFilter] = useState<'All' | 'Milk' | 'Meat' | 'Eggs'>('All');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Build calendar matrix
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Map treatments and clearances to dates
  const eventsByDate = React.useMemo(() => {
    const map: Record<number, Array<{
      animalTagId: string;
      species: string;
      medicineName: string;
      clearanceDate: string;
      isClearanceDay: boolean;
      affectedProducts: string[];
    }>> = {};

    treatments.forEach(trt => {
      if (!trt.calculatedClearanceDate) return;
      const cDate = new Date(trt.calculatedClearanceDate);
      if (cDate.getFullYear() === currentYear && cDate.getMonth() === currentMonth) {
        const day = cDate.getDate();
        if (!map[day]) map[day] = [];
        
        if (productFilter === 'All' || trt.affectedProducts.includes(productFilter as any)) {
          map[day].push({
            animalTagId: trt.animalTagId,
            species: trt.animalSpecies,
            medicineName: trt.medicineName,
            clearanceDate: trt.calculatedClearanceDate,
            isClearanceDay: true,
            affectedProducts: trt.affectedProducts
          });
        }
      }
    });

    return map;
  }, [treatments, currentYear, currentMonth, productFilter]);

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-teal-700" />
            Withdrawal & Food Clearance Calendar
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track daily clearance events and mandatory withholding deadlines across your livestock herd.
          </p>
        </div>

        {/* Product Filter & Month Controls */}
        <div className="flex items-center space-x-3">
          {/* Product Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['All', 'Milk', 'Meat', 'Eggs'] as const).map(p => (
              <button
                key={p}
                onClick={() => setProductFilter(p)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  productFilter === p ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Month Navigation */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-white text-slate-600 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-slate-800 whitespace-nowrap">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-white text-slate-600 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Days of Week */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-bold text-slate-600 py-3">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Month Day Cells */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
          
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-28 bg-slate-50/50 p-2 text-slate-300 text-xs font-semibold" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const events = eventsByDate[day] || [];
            const isToday = currentYear === 2026 && currentMonth === 7 && day === 21;

            return (
              <div
                key={`day-${day}`}
                className={`h-28 p-2 transition flex flex-col justify-between ${
                  isToday ? 'bg-teal-50/60 ring-2 ring-inset ring-teal-500' : 'hover:bg-slate-50/80 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-teal-700 text-white shadow-xs' : 'text-slate-700'
                  }`}>
                    {day}
                  </span>
                  {events.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                      {events.length} clear
                    </span>
                  )}
                </div>

                {/* Event Chips */}
                <div className="space-y-1 overflow-y-auto max-h-16 pr-0.5">
                  {events.map((ev, i) => (
                    <div
                      key={i}
                      className="p-1 rounded-md bg-emerald-50 border border-emerald-300 text-[10px] text-emerald-900 leading-tight flex items-center gap-1 shadow-xs cursor-pointer hover:bg-emerald-100"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold truncate">{ev.animalTagId}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[9px] text-slate-400 font-medium">
                  {isToday && 'Today'}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Legend & Guidance Note */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
        <div className="flex items-center gap-4">
          <span className="font-bold flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            🟢 Clearance Event (Food Safe)
          </span>
          <span className="font-bold flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            🔴 Active Withholding (Segregate Milk/Meat)
          </span>
        </div>
        <p className="text-[11px] text-slate-600">
          * Milk produced during active withdrawal must be safely discarded or withheld as per FSSAI regulations.
        </p>
      </div>

    </div>
  );
};
