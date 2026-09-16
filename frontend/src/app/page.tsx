'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../providers/AuthProvider';
import { GovHeader } from '../components/ui/GovHeader';
import { Navbar } from '../components/ui/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { MobileNav } from '../components/layout/MobileNav';
import { AnimalRepository } from '../lib/repositories/animal.repository';
import { TreatmentRepository } from '../lib/repositories/treatment.repository';
import { SyndromicRepository } from '../lib/repositories/syndromic.repository';
import { Animal, Withdrawal, DiseaseAlert } from '../types/database';
import { WithdrawalCountdownCard, ActiveWithdrawalItem } from '../components/dashboard/WithdrawalCountdownCard';
import { WeatherRiskCard } from '../components/dashboard/WeatherRiskCard';
import { DiseaseTrendChart } from '../components/dashboard/DiseaseTrendChart';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { AmuAnalyticsModal } from '../components/dashboard/AmuAnalyticsModal';

export default function Home() {
  const { user } = useAuth();

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [alerts, setAlerts] = useState<DiseaseAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAmuModal, setShowAmuModal] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [aList, wList, altList] = await Promise.all([
          AnimalRepository.getAnimals(),
          TreatmentRepository.getActiveWithdrawals(),
          SyndromicRepository.getActiveAlerts(),
        ]);
        setAnimals(aList);
        setWithdrawals(wList);
        setAlerts(altList);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const underTreatmentCount = animals.filter((a) => a.health_status === 'under_treatment').length;
  const healthyCount = animals.filter((a) => a.health_status === 'healthy').length;

  const activeWithdrawalItems: ActiveWithdrawalItem[] = useMemo(() => {
    return withdrawals.map((w) => ({
      id: w.id,
      animal_code: w.animal?.animal_code || 'ANIMAL',
      product: w.product,
      medicine_name: w.treatment?.medicine?.name || 'Veterinary Antibiotic',
      end_date: w.end_date,
    }));
  }, [withdrawals]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50 font-sans">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8 space-y-6">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  National Animal Health & MRL Portal
                </h1>
                <Badge variant={user?.role === 'vet' ? 'info' : user?.role === 'admin' ? 'warning' : 'success'}>
                  {user?.role?.toUpperCase() || 'FARMER PORTAL'}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Welcome back, <strong>{user?.name || 'Livestock Producer'}</strong> • {user?.district || 'Ludhiana'}, {user?.state || 'Punjab'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAmuModal(true)}
                className="py-2.5 px-3.5 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>📊</span> AMU Analytics
              </button>
              <Link
                href="/treatments/new"
                className="py-2.5 px-4 bg-[#1B5E20] hover:bg-[#144716] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
              >
                <span>💊</span> Log Treatment
              </Link>
              <Link
                href="/livestock"
                className="py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl shadow-xs transition-colors"
              >
                View Herd
              </Link>
            </div>
          </div>

          {/* District Emergency Alert Banner */}
          {alerts.length > 0 && (
            <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-3">
                <span className="text-2xl animate-bounce">🚨</span>
                <div>
                  <h4 className="text-sm font-black text-red-900">
                    Active Epidemiological Alert: {alerts[0].disease_name}
                  </h4>
                  <p className="text-xs text-red-700">
                    Containment zone of {alerts[0].containment_zone_radius_km} km declared in {alerts[0].district} district. Biosecurity protocols in effect.
                  </p>
                </div>
              </div>
              <Link
                href="/surveillance/map"
                className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap"
              >
                Inspect GIS Map
              </Link>
            </div>
          )}

          {/* Top KPI Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Total Herd Registered</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900">{animals.length}</span>
                <span className="text-xs font-bold text-[#1B5E20]">Heads</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Unique INAPH RFID tags active</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Active MRL Embargoes</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-red-600">{underTreatmentCount}</span>
                <span className="text-xs font-bold text-red-700">Restricted</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Milk & meat harvest paused</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Safe to Harvest</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#1B5E20]">{healthyCount}</span>
                <span className="text-xs font-bold text-green-700">Clean Stock</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">MRL residue clearance verified</p>
            </Card>

            <Card className="p-4">
              <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Syndromic Outbreaks</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-amber-600">{alerts.length}</span>
                <span className="text-xs font-bold text-amber-700">District Alerts</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">SLA dispatch active</p>
            </Card>
          </div>

          {/* Real-time Ticking Countdown & Weather Telemetry */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Real Ticking Withdrawal Countdown Card */}
            <div>
              <WithdrawalCountdownCard
                withdrawals={activeWithdrawalItems}
                onSelectAnimal={(code) => {
                  const a = animals.find((item) => item.animal_code === code);
                  if (a) window.location.href = `/livestock/${a.id}`;
                }}
              />
            </div>

            {/* Satellite Live Weather Risk Card */}
            <div>
              <WeatherRiskCard
                latitude={30.901}
                longitude={75.8573}
              />
            </div>
          </div>

          {/* Morbidity Trend Curves */}
          <div className="w-full">
            <DiseaseTrendChart />
          </div>

          {/* Quick Action Navigation Grid */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              One-Health Management Modules
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <Link
                href="/livestock"
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#1B5E20] hover:shadow-md transition-all text-center group"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">🐄</span>
                <span className="text-xs font-bold text-gray-900 block">Livestock List</span>
                <span className="text-[10px] text-gray-500">RFID Herd Roster</span>
              </Link>

              <Link
                href="/calendar"
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#1B5E20] hover:shadow-md transition-all text-center group"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">🗓️</span>
                <span className="text-xs font-bold text-gray-900 block">Withdrawals</span>
                <span className="text-[10px] text-gray-500">Embargo Calendar</span>
              </Link>

              <Link
                href="/treatments/new"
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#1B5E20] hover:shadow-md transition-all text-center group"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">💊</span>
                <span className="text-xs font-bold text-gray-900 block">Log Treatment</span>
                <span className="text-[10px] text-gray-500">MRL Calculator</span>
              </Link>

              <Link
                href="/syndromic-report"
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#1B5E20] hover:shadow-md transition-all text-center group"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">🚨</span>
                <span className="text-xs font-bold text-gray-900 block">Report Outbreak</span>
                <span className="text-[10px] text-gray-500">WOAH Triage SLA</span>
              </Link>

              <Link
                href="/lab-results"
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#1B5E20] hover:shadow-md transition-all text-center group"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">🔬</span>
                <span className="text-xs font-bold text-gray-900 block">Lab Residues</span>
                <span className="text-[10px] text-gray-500">NABL Certificates</span>
              </Link>

              <Link
                href="/scan"
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#1B5E20] hover:shadow-md transition-all text-center group"
              >
                <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">📷</span>
                <span className="text-xs font-bold text-gray-900 block">Scan QR Code</span>
                <span className="text-[10px] text-gray-500">Food Safety Passport</span>
              </Link>
            </div>
          </div>

          {showAmuModal && <AmuAnalyticsModal onClose={() => setShowAmuModal(false)} />}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
