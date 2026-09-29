'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { GovHeader } from '../../components/ui/GovHeader';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { WithdrawalCalendar, CalendarWithdrawalEntry } from '../../components/calendar/WithdrawalCalendar';
import { TreatmentRepository } from '../../lib/repositories/treatment.repository';

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [entries, setEntries] = useState<CalendarWithdrawalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const active = await TreatmentRepository.getActiveWithdrawals();
        const mapped: CalendarWithdrawalEntry[] = active.map((w) => ({
          id: w.id,
          animal_code: w.animal?.animal_code || 'ANIMAL',
          species: w.animal?.species || 'cow',
          breed: w.animal?.breed || undefined,
          product: w.product,
          medicine_name: w.treatment?.medicine?.name || 'Veterinary Antibiotic',
          start_date: w.start_date,
          end_date: w.end_date,
          status: w.status === 'active' ? 'active' : 'completed',
        }));
        setEntries(mapped);
      } catch (err) {
        console.error('Error loading calendar withdrawals:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          <WithdrawalCalendar
            onBack={() => router.push('/')}
            entries={entries}
          />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
