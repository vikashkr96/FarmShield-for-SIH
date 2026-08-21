import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/ToastContainer';
import { RoleSwitcherModal } from './components/common/RoleSwitcherModal';
import { QRScannerModal } from './components/common/QRScannerModal';
import { AnimalPassportModal } from './components/common/AnimalPassportModal';
import { AuthPage } from './components/auth/AuthPage';
import { FarmerDashboard } from './components/farmer/FarmerDashboard';
import { VetDashboard } from './components/vet/VetDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

export const App: React.FC = () => {
  const { currentUser, setCurrentUser, showToast, t } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleLogout = () => {
    setIsAuthenticated(false);
    showToast('Signed Out', 'You have been securely logged out.', 'info');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <>
        <AuthPage onLoginSuccess={handleLoginSuccess} />
        <ToastContainer />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900">
      
      {/* Top Government Navigation Header */}
      <Header onLogout={handleLogout} />

      {/* Main Content Area Routed by User Role */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentUser.role === 'farmer' && <FarmerDashboard />}
        {currentUser.role === 'vet' && <VetDashboard />}
        {currentUser.role === 'admin' && <AdminDashboard />}
      </main>

      {/* Relevant Government of India Footer (Strictly NO bottom health check banner) */}
      <Footer />

      {/* Universal Modals & Overlays */}
      <RoleSwitcherModal />
      <QRScannerModal />
      <AnimalPassportModal />
      <ToastContainer />

    </div>
  );
};
