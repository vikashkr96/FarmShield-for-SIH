'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { GovHeader } from '../../components/ui/GovHeader';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { LabResultsModal } from '../../components/lab/LabResultsModal';

export default function LabResultsPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          <LabResultsModal onBack={() => router.push('/')} />
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
