'use client';

import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Milk,
  Beef,
  Fish,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowLeft,
} from 'lucide-react';
import { TargetProduct } from '../../types/database';

export interface CalendarWithdrawalEntry {
  id: string;
  animal_code: string;
  species: string;
  breed?: string;
  product: TargetProduct;
  medicine_name: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed';
}

interface WithdrawalCalendarProps {
  onBack?: () => void;
  entries?: CalendarWithdrawalEntry[];
}

export const WithdrawalCalendar: React.FC<WithdrawalCalendarProps> = ({ onBack, entries }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const sampleEntries: CalendarWithdrawalEntry[] = entries && entries.length > 0 ? entries : [
    {
      id: 'w1',
      animal_code: 'COW-101',
      species: 'cow',
      breed: 'Gir High-Yield',
      product: 'milk',
      medicine_name: 'Amoxicillin 15%',
      start_date: new Date(Date.now() - 2 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 2 * 86400000).toISOString(),
      status: 'active',
    },
    {
      id: 'w2',
      animal_code: 'COW-102',
      species: 'cow',
      breed: 'HF Cross',
      product: 'milk',
      medicine_name: 'Oxytetracycline LA',
      start_date: new Date(Date.now() - 3 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 5 * 86400000).toISOString(),
      status: 'active',
    },
    {
      id: 'w3',
      animal_code: 'BUF-201',
      species: 'buffalo',
      breed: 'Murrah Buffalo',
      product: 'meat',
      medicine_name: 'Enrofloxacin 10%',
      start_date: new Date(Date.now() - 5 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 9 * 86400000).toISOString(),
      status: 'active',
    },
    {
      id: 'w4',
      animal_code: 'POND-01',
      species: 'fishery',
      breed: 'Rohu & Catla Biomass',
      product: 'fish',
      medicine_name: 'Oxytetracycline Aqua',
      start_date: new Date(Date.now() - 7 * 86400000).toISOString(),
      end_date: new Date(Date.now() + 3 * 86400000).toISOString(),
      status: 'active',
    },
  ];

  // Helper functions for month grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Find active withdrawals for a given calendar day
  const getDayEntries = (day: number) => {
    const dayDate = new Date(year, month, day, 12, 0, 0);
    return sampleEntries.filter((e) => {
      const start = new Date(e.start_date);
      const end = new Date(e.end_date);
      return dayDate >= start && dayDate <= end;
    });
  };

  // Selected date entries
  const selectedDayEntries = sampleEntries.filter((e) => {
    const start = new Date(e.start_date);
    const end = new Date(e.end_date);
    const sel = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12, 0, 0);
    return sel >= start && sel <= end;
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 font-sans space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 transition cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] text-white flex items-center justify-center shadow-lg">
            <CalendarIcon className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              Statutory Withdrawal Embargo Calendar
              <span className="text-xs bg-[#E8F5E9] text-[#1B5E20] px-2.5 py-0.5 rounded-full font-black border border-[#A5D6A7]">
                MRL SAFETY
              </span>
            </h1>
            <p className="text-xs text-gray-600 font-bold">
              Multi-Product Chemical Clearance Schedule • FSSAI & Codex Alimentarius
            </p>
          </div>
        </div>

        {/* Legend pills */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-black">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Milk Embargo
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-900 border border-red-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Meat Embargo
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Aqua Biomass
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Interactive Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-[#1B5E20]/20 p-3 sm:p-6 shadow-md space-y-4 sm:space-y-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-black text-gray-900">
              {monthNames[month]} {year}
            </h2>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={prevMonth}
                aria-label="Previous month"
                className="p-1.5 sm:p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={() => {
                  setCurrentDate(new Date());
                  setSelectedDate(new Date());
                }}
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black bg-[#E8F5E9] text-[#1B5E20] rounded-xl hover:bg-[#C8E6C9] transition cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={nextMonth}
                aria-label="Next month"
                className="p-1.5 sm:p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-black text-gray-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty offset days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[48px] sm:min-h-[70px] rounded-xl sm:rounded-2xl bg-gray-50/50" />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const isSelected =
                selectedDate.getDate() === dayNum &&
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

              const isToday =
                new Date().getDate() === dayNum &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;

              const dayEntries = getDayEntries(dayNum);
              const hasMilk = dayEntries.some((e) => e.product === 'milk');
              const hasMeat = dayEntries.some((e) => e.product === 'meat');
              const hasFish = dayEntries.some((e) => e.product === 'fish');

              return (
                <div
                  key={dayNum}
                  role="button"
                  tabIndex={0}
                  aria-label={`${monthNames[month]} ${dayNum}, ${year}${dayEntries.length ? `, ${dayEntries.length} active embargoes` : ''}`}
                  onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedDate(new Date(year, month, dayNum));
                    }
                  }}
                  className={`min-h-[50px] sm:min-h-[74px] p-1 sm:p-2 rounded-xl sm:rounded-2xl border transition cursor-pointer flex flex-col justify-between focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1B5E20] ${
                    isSelected
                      ? 'border-[#1B5E20] bg-[#E8F5E9]/50 shadow-md ring-2 ring-[#1B5E20]'
                      : isToday
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-gray-100 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black w-6 h-6 rounded-full flex items-center justify-center ${
                        isToday
                          ? 'bg-[#1B5E20] text-white'
                          : isSelected
                          ? 'text-[#1B5E20] font-black'
                          : 'text-gray-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEntries.length > 0 && (
                      <span className="text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded-md">
                        {dayEntries.length}
                      </span>
                    )}
                  </div>

                  {/* Product Embargo Indicator Dots */}
                  <div className="flex items-center gap-1 pt-1">
                    {hasMilk && <span className="w-2 h-2 rounded-full bg-amber-500" title="Milk Embargo" />}
                    {hasMeat && <span className="w-2 h-2 rounded-full bg-red-500" title="Meat Embargo" />}
                    {hasFish && <span className="w-2 h-2 rounded-full bg-blue-500" title="Fish Biomass Embargo" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Day Inspector Agenda Panel */}
        <div className="bg-white rounded-3xl border-2 border-[#1B5E20]/20 p-6 shadow-md space-y-6">
          <div className="pb-4 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Day Agenda Inspector
            </span>
            <h3 className="text-base font-black text-gray-900 mt-1">
              {selectedDate.toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </h3>
          </div>

          {selectedDayEntries.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-black text-gray-900">Zero Active Embargoes</h4>
              <p className="text-xs text-gray-500 font-medium">
                All animal milk and meat are completely cleared for human consumption on this date under FSSAI MRL standards.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  {selectedDayEntries.length} animal(s) under active chemical withdrawal embargo.
                </span>
              </div>

              {selectedDayEntries.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-gray-200 bg-[#FAFAFA] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1B5E20]">{item.animal_code}</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-300">
                      Withhold {item.product}
                    </span>
                  </div>

                  <div className="text-xs text-gray-700">
                    <span className="font-bold">Medicine: </span>
                    {item.medicine_name}
                  </div>

                  <div className="text-[11px] text-gray-500 font-medium flex justify-between">
                    <span>Clearance Target:</span>
                    <span className="font-bold text-gray-900">
                      {new Date(item.end_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
