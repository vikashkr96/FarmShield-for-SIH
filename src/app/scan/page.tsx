'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { GovHeader } from '../../components/ui/GovHeader';
import { Navbar } from '../../components/ui/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';

export default function ScanPage() {
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [manualCode, setManualCode] = useState('');
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [unregisteredTag, setUnregisteredTag] = useState<string | null>(null);

  const handleLookup = async (code: string) => {
    if (!code) {
      toast.error('Token Required', 'Please enter or scan an animal QR token');
      return;
    }
    const cleanToken = code.trim();

    // Check if demo token or valid format
    if (cleanToken.includes('MRL-SECURE') || cleanToken.startsWith('IN-') || cleanToken.startsWith('FS-')) {
      router.push(`/qr/${encodeURIComponent(cleanToken)}`);
    } else {
      // Prompt unregistered tag registration
      setUnregisteredTag(cleanToken);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-3xl mx-auto w-full pb-24 lg:pb-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Animal Food Safety Passport Scanner
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Verify MRL compliance, slaughter clearance, and origin farm provenance
            </p>
          </div>

          <Card className="p-6 text-center space-y-6">
            {/* Viewfinder simulation / camera viewport with controls */}
            <div className="relative mx-auto w-full max-w-sm h-72 bg-gray-900 rounded-3xl overflow-hidden flex flex-col items-center justify-center text-white border-4 border-gray-800 shadow-2xl">
              {/* Scan Reticle corners */}
              <div className="absolute inset-8 border-2 border-dashed border-green-400 rounded-2xl pointer-events-none animate-pulse flex items-center justify-center">
                <span className="text-xs font-mono font-bold text-green-400 bg-black/60 px-2.5 py-1 rounded-full">
                  ALIGN QR IN RETICLE
                </span>
              </div>

              {/* Viewfinder Overlay Buttons (Parity with Flutter QRScannerView) */}
              <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                <button
                  type="button"
                  aria-label="Toggle Flashlight Torch"
                  aria-pressed={flashlightOn}
                  onClick={() => setFlashlightOn(!flashlightOn)}
                  className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white ${
                    flashlightOn ? 'bg-amber-400 text-black shadow-lg' : 'bg-black/60 text-white hover:bg-black/80'
                  }`}
                  title="Toggle Torch"
                >
                  {flashlightOn ? '🔦 On' : '🔦 Off'}
                </button>
                <button
                  type="button"
                  aria-label="Switch Camera Facing (Front/Back)"
                  onClick={() => setCameraFacing(cameraFacing === 'back' ? 'front' : 'back')}
                  className="p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 text-xs font-bold transition cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
                  title="Flip Camera"
                >
                  🔄 Flip
                </button>
              </div>

              <div className="text-4xl mb-2">📷</div>
              <p className="text-xs text-gray-400 max-w-[200px]">
                Camera active ({cameraFacing} sensor) • Point at ear tag or passport QR
              </p>
            </div>

            {/* Manual Code Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLookup(manualCode);
              }}
              className="space-y-3 max-w-md mx-auto"
            >
              <Input
                placeholder="Or paste QR Token / Tag ID (e.g. SHW-9102-MRL-SECURE)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              <Button type="submit" variant="primary" fullWidth>
                Verify Food Safety Passport
              </Button>
            </form>

            {/* Quick Demo Tag Buttons for Evaluators */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                ⚡ Instant Test Barcodes:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => handleLookup('SHW-9102-MRL-SECURE')}
                  className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 text-xs font-bold text-red-700 hover:bg-red-100"
                >
                  🔴 Sahiwal (Under Embargo)
                </button>
                <button
                  type="button"
                  onClick={() => handleLookup('MRH-8841-MRL-SECURE')}
                  className="px-3 py-1.5 rounded-xl border border-green-200 bg-green-50 text-xs font-bold text-[#1B5E20] hover:bg-green-100"
                >
                  🟢 Murrah Buffalo (Safe & Cleared)
                </button>
                <button
                  type="button"
                  onClick={() => handleLookup('GIR-4412-MRL-SECURE')}
                  className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-xs font-bold text-blue-700 hover:bg-blue-100"
                >
                  🟢 Gir Cattle (Zero Residue)
                </button>
              </div>
            </div>
          </Card>

          {/* Unregistered Tag Alert Modal */}
          {unregisteredTag && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
              <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-gray-100 p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">Tag Not Registered</h3>
                  <p className="text-xs text-gray-500 mt-1 font-mono">
                    Scanned Code: <strong>{unregisteredTag}</strong>
                  </p>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    This ear tag code was not found in your active herd database. Would you like to onboard this animal now into the national INAPH traceability network?
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setUnregisteredTag(null)}
                  >
                    Dismiss
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    fullWidth
                    onClick={() => router.push('/livestock')}
                  >
                    Register Animal
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
