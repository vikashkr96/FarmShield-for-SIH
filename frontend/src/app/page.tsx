'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, UserRoleMode } from '../components/ui/Navbar';
import { FarmerHome } from '../components/farmer/FarmerHome';
import { AnimalList, AnimalItem } from '../components/farmer/AnimalList';
import { TreatmentModal } from '../components/farmer/TreatmentModal';
import { MilkSafetyCheck } from '../components/farmer/MilkSafetyCheck';
import { WarningsList } from '../components/farmer/WarningsList';
import { QRScannerModal } from '../components/farmer/QRScannerModal';
import { VetDashboard } from '../components/vet/VetDashboard';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { Footer } from '../components/ui/Footer';
import { AuthModal } from '../components/auth/AuthModal';
import { useAuth } from '../providers/AuthProvider';
import { useLanguage } from '../providers/LanguageProvider';
import { API_BASE_URL } from '../lib/config';

export default function Home() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();

  const [roleMode, setRoleMode] = useState<UserRoleMode | undefined>(undefined);
  const [farmerView, setFarmerView] = useState<'home' | 'animals' | 'treatment' | 'milk_safety' | 'alerts' | 'history' | 'qr_scan'>('home');
  const [selectedQrToken, setSelectedQrToken] = useState<string>('');
  const [autoOpenRegisterForm, setAutoOpenRegisterForm] = useState<boolean>(false);

  // Sync roleMode when user logs in or out
  useEffect(() => {
    if (isAuthenticated && user) {
      setRoleMode(user.role);
    } else {
      setRoleMode(undefined);
    }
  }, [isAuthenticated, user]);

  // Initial Livestock & Fishery Pond Units State
  const [animals, setAnimals] = useState<AnimalItem[]>([
    {
      id: 'a101',
      animal_code: 'COW-101',
      species: 'cow',
      breed: 'Gir High-Yield',
      dob: '2022-03-15',
      sex: 'female',
      weight: 380,
      purpose: 'milk',
      health_status: 'healthy',
      qr_token: 'QR-COW-101',
    },
    {
      id: 'a102',
      animal_code: 'COW-102',
      species: 'cow',
      breed: 'HF Cross',
      dob: '2021-08-10',
      sex: 'female',
      weight: 430,
      purpose: 'milk',
      health_status: 'under_treatment',
      qr_token: 'QR-COW-102',
    },
    {
      id: 'a103',
      animal_code: 'BUF-201',
      species: 'buffalo',
      breed: 'Murrah Buffalo',
      dob: '2020-05-20',
      sex: 'female',
      weight: 510,
      purpose: 'milk',
      health_status: 'healthy',
      qr_token: 'QR-BUF-201',
    },
    {
      id: 'a104',
      animal_code: 'POND-01',
      species: 'fishery',
      breed: 'Rohu & Catla Poly-culture',
      dob: '2023-02-01',
      sex: 'collective',
      weight: 2500, // 2,500 kg Biomass
      purpose: 'aquaculture',
      health_status: 'healthy',
      qr_token: 'QR-POND-01',
      fishery_details: {
        pond_id: 'POND-01',
        water_type: 'freshwater',
        biomass_kg: 2500,
      },
    },
  ]);

  const fetchAnimals = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/animals`);
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data) && json.data.length > 0) {
        setAnimals(json.data);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  const handleAddAnimal = async (newAnimalData: Omit<AnimalItem, 'id' | 'qr_token' | 'health_status'>) => {
    const qrToken = `QR-${newAnimalData.animal_code.toUpperCase().replace(/\s+/g, '-')}`;
    const newAnimal: AnimalItem = {
      ...newAnimalData,
      id: `a_${Date.now()}`,
      qr_token: qrToken,
      health_status: 'healthy',
    };

    setAnimals((prev) => [newAnimal, ...prev]);

    try {
      await fetch(`${API_BASE_URL}/api/animals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnimalData),
      });
    } catch {
      // Offline fallback
    }

    return newAnimal;
  };

  const handleSelectAnimalForQr = (token: string) => {
    setSelectedQrToken(token);
    setFarmerView('qr_scan');
  };

  // Live Stats calculation
  const totalAnimals = animals.length;
  const underTreatment = animals.filter((a) => a.health_status === 'under_treatment' || a.health_status === 'sick').length;
  const underWithdrawal = animals.filter((a) => a.health_status === 'under_treatment').length;
  const clearedCount = totalAnimals - underWithdrawal;

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 flex flex-col justify-between selection:bg-[#1B5E20] selection:text-white font-sans">
      <div>
        <Navbar
          currentRole={roleMode}
          onRoleChange={(newRole) => {
            setRoleMode(newRole);
            if (newRole === 'farmer') setFarmerView('home');
          }}
        />

        {/* Global VASUDHA / FarmShield Auth Modal */}
        <AuthModal
          onSuccessRoleChange={(authenticatedRole) => {
            setRoleMode(authenticatedRole);
            if (authenticatedRole === 'farmer') setFarmerView('home');
          }}
        />

        <main className="py-6">
          {/* ========================================================================= */}
          {/* PUBLIC LANDING OVERVIEW OR FARMER HOME */}
          {/* ========================================================================= */}
          {(!isAuthenticated || roleMode === 'farmer' || roleMode === undefined) && (
            <>
              {farmerView === 'home' && (
                <div className="space-y-12">
                  <FarmerHome
                    onNavigate={(view) => {
                      setAutoOpenRegisterForm(false);
                      setFarmerView(view);
                    }}
                    onOpenRegisterAnimal={() => {
                      setAutoOpenRegisterForm(true);
                      setFarmerView('animals');
                    }}
                    stats={{
                      totalAnimals,
                      underTreatment,
                      underWithdrawal,
                      clearedCount,
                    }}
                  />
                </div>
              )}

              {farmerView === 'animals' && (
                <AnimalList
                  animals={animals}
                  onAddAnimal={handleAddAnimal}
                  onSelectAnimalForQr={handleSelectAnimalForQr}
                  onBack={() => {
                    setAutoOpenRegisterForm(false);
                    setFarmerView('home');
                  }}
                  autoOpenRegister={autoOpenRegisterForm}
                />
              )}

              {farmerView === 'treatment' && (
                <TreatmentModal
                  animals={animals}
                  onBack={() => setFarmerView('home')}
                  onSuccess={() => {
                    fetchAnimals();
                    setFarmerView('milk_safety');
                  }}
                />
              )}

              {farmerView === 'milk_safety' && (
                <MilkSafetyCheck onBack={() => setFarmerView('home')} />
              )}

              {farmerView === 'alerts' && (
                <WarningsList onBack={() => setFarmerView('home')} />
              )}

              {farmerView === 'history' && (
                <TreatmentModal
                  animals={animals}
                  onBack={() => setFarmerView('home')}
                  onSuccess={() => setFarmerView('home')}
                />
              )}

              {farmerView === 'qr_scan' && (
                <QRScannerModal
                  initialToken={selectedQrToken}
                  onBack={() => setFarmerView('home')}
                />
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* VETERINARIAN ROLE MODE */}
          {/* ========================================================================= */}
          {isAuthenticated && roleMode === 'vet' && <VetDashboard />}

          {/* ========================================================================= */}
          {/* ADMIN / GOVT BODY ROLE MODE */}
          {/* ========================================================================= */}
          {isAuthenticated && roleMode === 'admin' && <AdminDashboard />}
        </main>
      </div>

      <Footer
        onNavigateFarmerView={(view) => {
          setFarmerView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
