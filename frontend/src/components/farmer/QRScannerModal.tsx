'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  ArrowLeft,
  QrCode,
  Search,
  Camera,
  X,
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

interface QRScannerModalProps {
  initialToken?: string;
  onBack: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  initialToken = '',
  onBack,
}) => {
  const { t, language } = useLanguage();

  // -----------------------------
  // States
  // -----------------------------

  const [token, setToken] = useState<string>(initialToken || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [profile, setProfile] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [scanning, setScanning] = useState<boolean>(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // -----------------------------
  // Scanner reference
  // -----------------------------

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Prevent multiple scans
  const scanProcessedRef = useRef<boolean>(false);

  // -----------------------------
  // Lookup cattle by QR / ID
  // -----------------------------

  const handleLookup = async (tokenToUse?: string) => {
    const searchToken = (tokenToUse ?? token).trim();

    if (!searchToken) {
      setErrorMsg(language === 'en' ? 'Please enter an animal Tag or QR code.' : 'कृपया पशु का QR नंबर डालें।');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setProfile(null);

    try {
      const res = await fetch(
        `http://localhost:5000/api/animals/qr/${encodeURIComponent(
          searchToken
        )}`
      );

      const json = await res.json();

      if (json.status === 'success') {
        setProfile(json.data);
      } else {
        setErrorMsg(json.message || 'No record found');
      }
    } catch (error) {
      console.error('Lookup error:', error);
      setErrorMsg('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Start QR scanner
  // -----------------------------

  const startScanner = () => {
    setScannerError(null);
    setErrorMsg(null);
    setProfile(null);

    scanProcessedRef.current = false;
    setScanning(true);
  };

  // -----------------------------
  // Stop QR scanner
  // -----------------------------

  const stopScanner = async () => {
    const scanner = scannerRef.current;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }

        scanner.clear();
      } catch (error) {
        console.error('Error stopping scanner:', error);
      }

      scannerRef.current = null;
    }

    setScanning(false);
  };

  // -----------------------------
  // Initialize scanner
  // -----------------------------

  useEffect(() => {
    if (!scanning) {
      return;
    }

    let mounted = true;

    const initializeScanner = async () => {
      try {
        // Small delay so #qr-reader is mounted
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (!mounted) return;

        const readerElement = document.getElementById('qr-reader');

        if (!readerElement) {
          setScannerError('Scanner could not be initialized.');
          setScanning(false);
          return;
        }

        const scanner = new Html5Qrcode('qr-reader');

        scannerRef.current = scanner;

        await scanner.start(
          {
            facingMode: 'environment',
          },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
            aspectRatio: 1.0,
          },
          async (decodedText) => {
            // Prevent multiple callbacks from firing
            if (scanProcessedRef.current) {
              return;
            }

            scanProcessedRef.current = true;

            console.log('QR Code Scanned:', decodedText);

            // Put scanned value into input
            setToken(decodedText);

            // Stop camera
            try {
              if (scanner.isScanning) {
                await scanner.stop();
              }

              scanner.clear();
            } catch (error) {
              console.error('Scanner stop error:', error);
            }

            scannerRef.current = null;

            if (mounted) {
              setScanning(false);

              // Automatically lookup cattle
              handleLookup(decodedText);
            }
          },
          () => {
            // QR code not detected.
            // This callback runs continuously, so don't show errors here.
          }
        );
      } catch (error) {
        console.error('Scanner initialization error:', error);

        if (!mounted) return;

        setScannerError(
          'Camera could not be started. Please allow camera permission and try again.'
        );

        setScanning(false);
        scannerRef.current = null;
      }
    };

    initializeScanner();

    // Cleanup when component unmounts
    return () => {
      mounted = false;

      const cleanupScanner = async () => {
        const scanner = scannerRef.current;

        if (!scanner) return;

        try {
          if (scanner.isScanning) {
            await scanner.stop();
          }

          scanner.clear();
        } catch (error) {
          console.error('Scanner cleanup error:', error);
        }

        scannerRef.current = null;
      };

      cleanupScanner();
    };
  }, [scanning]);

  // -----------------------------
  // Back button
  // -----------------------------

  const handleBack = async () => {
    await stopScanner();
    onBack();
  };

  // -----------------------------
  // Render
  // -----------------------------

  return (
    <div className="space-y-6 max-w-3xl mx-auto px-4 py-6">
      {/* Back Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleBack}
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        {t('common.backToHome')}
      </Button>

      <Card
        variant="glass"
        className="space-y-6 border-2 border-[#1B5E20]/30 shadow-xl p-6 sm:p-8"
      >
        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#E8F5E9] border border-[#1B5E20]/30 rounded-2xl text-[#1B5E20]">
            <QrCode className="w-7 h-7" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-[#1B5E20]">
              {t('qr.scannerTitle')}
            </h1>

            <p className="text-xs text-gray-600 font-bold">
              {t('qr.scanSubtitle')}
            </p>
          </div>
        </div>

        {/* -------------------------------- */}
        {/* QR Camera Scanner */}
        {/* -------------------------------- */}

        {!scanning ? (
          <div className="space-y-3">
            <Button
              variant="outline"
              onClick={startScanner}
              leftIcon={<Camera className="w-5 h-5" />}
              className="w-full border-2 border-[#1B5E20] text-[#1B5E20] hover:bg-[#E8F5E9]"
            >
              📷 {language === 'en' ? 'Scan QR with Camera' : 'QR स्कैन करें'}
            </Button>

            <p className="text-center text-xs text-gray-500 font-semibold">
              {language === 'en' ? 'Scan cattle QR ear tag with device camera' : 'कैमरे से पशु का QR कोड स्कैन करें'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Scanner container */}

            <div className="relative">
              <div
                id="qr-reader"
                className="w-full overflow-hidden rounded-3xl border-2 border-[#1B5E20] bg-black"
              />

              {/* Scanner instruction overlay */}

              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-xs font-bold z-10">
                {language === 'en' ? 'Align QR code within camera frame' : 'QR को कैमरे के सामने रखें'}
              </div>
            </div>

            {/* Scanner Error */}

            {scannerError && (
              <div className="p-4 bg-[#FFEBEE] border border-[#D32F2F]/40 rounded-2xl text-[#D32F2F] text-xs font-bold">
                {scannerError}
              </div>
            )}

            {/* Stop scanner */}

            <Button
              variant="outline"
              onClick={stopScanner}
              leftIcon={<X className="w-4 h-4" />}
              className="w-full"
            >
              {language === 'en' ? 'Stop Scanner' : 'स्कैन बंद करें'}
            </Button>
          </div>
        )}

        {/* -------------------------------- */}
        {/* Divider */}
        {/* -------------------------------- */}

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-xs font-bold text-gray-400">
            {language === 'en' ? 'Or Enter ID Manually' : 'या नंबर डालें'}
          </span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* -------------------------------- */}
        {/* Manual Input & Lookup */}
        {/* -------------------------------- */}

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />

            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLookup();
                }
              }}
              placeholder={t('qr.enterTokenPlaceholder')}
              className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl pl-10 pr-4 py-3 text-sm text-gray-900 font-mono focus:border-[#1B5E20] focus:outline-none font-bold"
            />
          </div>

          <Button
            variant="primary"
            onClick={() => handleLookup()}
            isLoading={loading}
            className="bg-[#1B5E20]"
          >
            {t('qr.lookupBtn')}
          </Button>
        </div>

        {/* -------------------------------- */}
        {/* Presets */}
        {/* -------------------------------- */}

        <div className="flex flex-wrap gap-2 text-xs font-bold">
          <span className="text-gray-500 self-center">
            {language === 'en' ? 'Quick Demo Presets:' : 'उदा (Presets):'}
          </span>

          {/* Cleared preset */}

          <button
            onClick={() => {
              setToken('QR-COW-101');
              handleLookup('QR-COW-101');
            }}
            className="px-3 py-1.5 bg-[#E8F5E9] border border-[#1B5E20]/30 rounded-xl text-[#1B5E20] hover:bg-[#C8E6C9] transition"
          >
            QR-COW-101 (🟢 CLEARED)
          </button>

          {/* Withdrawal preset */}

          <button
            onClick={() => {
              setToken('QR-COW-102');
              handleLookup('QR-COW-102');
            }}
            className="px-3 py-1.5 bg-[#FFEBEE] border border-[#D32F2F]/30 rounded-xl text-[#D32F2F] hover:bg-[#FFCDD2] transition"
          >
            QR-COW-102 (🔴 WITHDRAWAL ACTIVE)
          </button>
        </div>

        {/* -------------------------------- */}
        {/* Error message */}
        {/* -------------------------------- */}

        {errorMsg && (
          <div className="p-4 bg-[#FFEBEE] border border-[#D32F2F]/40 rounded-2xl text-[#D32F2F] text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* -------------------------------- */}
        {/* Loading message */}
        {/* -------------------------------- */}

        {loading && (
          <div className="p-4 bg-[#E8F5E9] border border-[#1B5E20]/20 rounded-2xl text-[#1B5E20] text-xs font-bold text-center">
            {language === 'en' ? 'Retrieving cattle safety passport...' : 'पशु की जानकारी खोजी जा रही है...'}
          </div>
        )}

        {/* -------------------------------- */}
        {/* Animal Profile */}
        {/* -------------------------------- */}

        {profile && (
          <div className="bg-[#FFFDF5] border-2 border-[#1B5E20]/40 rounded-3xl p-6 space-y-6 shadow-md">
            {/* Animal ID + Status */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
              <div>
                <span className="text-xs text-gray-500 font-bold block">
                  ANIMAL ID
                </span>

                <span className="text-3xl font-black text-[#1B5E20]">
                  {profile.animalCode}
                </span>
              </div>

              <Badge
                variant={
                  profile.withdrawalStatus?.includes('CLEARED')
                    ? 'success'
                    : 'error'
                }
                size="lg"
                pulse
                className="px-5 py-2 text-sm"
              >
                {profile.withdrawalStatus}
              </Badge>
            </div>

            {/* -------------------------------- */}
            {/* Species-Appropriate Safety Status */}
            {/* -------------------------------- */}

            {profile.species === 'cow' || profile.species === 'buffalo' || profile.species === 'cattle' ? (
              <div className="p-4 bg-white rounded-2xl border-2 border-[#2E7D32]/30 text-center space-y-1.5">
                <span className="text-xs text-gray-500 font-bold block">
                  🥛 DAIRY MILK SAFETY STATUS
                </span>
                <span className="text-base font-black text-[#2E7D32] block">
                  {profile.milkStatus || profile.withdrawalStatus}
                </span>
                <span className="text-[11px] text-[#1B5E20] font-semibold block">
                  {profile.withdrawalStatus?.includes('CLEARED')
                    ? '✓ 100% Free from drug residues • Certified under FSSAI MRL Standards'
                    : '⚠️ Active antibiotic withdrawal period in progress • Do not sell milk'}
                </span>
              </div>
            ) : profile.species === 'fishery' || profile.species === 'fish' ? (
              <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 text-center space-y-1.5">
                <span className="text-xs text-blue-900 font-bold block">
                  🐟 AQUACULTURE HARVEST SAFETY STATUS
                </span>
                <span className="text-base font-black text-blue-800 block">
                  {profile.withdrawalStatus}
                </span>
                <span className="text-[11px] text-blue-700 font-semibold block">
                  {profile.withdrawalStatus?.includes('CLEARED')
                    ? '✓ Pond biomass cleared for safe harvesting & export'
                    : '⚠️ Active chemical withdrawal in pond biomass'}
                </span>
              </div>
            ) : (
              <div className="p-4 bg-white rounded-2xl border-2 border-[#2E7D32]/30 text-center space-y-1.5">
                <span className="text-xs text-gray-500 font-bold block">
                  FOOD SAFETY WITHDRAWAL STATUS
                </span>
                <span className="text-base font-black text-[#2E7D32] block">
                  {profile.withdrawalStatus}
                </span>
              </div>
            )}

            {/* -------------------------------- */}
            {/* Species + Safe Date */}
            {/* -------------------------------- */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-4 rounded-2xl border border-gray-200">
              {/* Species */}

              <div>
                <span className="text-gray-500 font-bold block">
                  {language === 'en' ? 'Species & Breed:' : 'Species (प्रजाति):'}
                </span>

                <span className="font-extrabold text-gray-900 capitalize">
                  {profile.species} ({profile.breed})
                </span>
              </div>

              {/* Safe Date */}

              <div>
                <span className="text-gray-500 font-bold block">
                  {language === 'en' ? 'Safe Clearance Date:' : 'Safe Date (सुरक्षित तारीख):'}
                </span>

                <span className="font-extrabold text-[#1B5E20]">
                  {profile.safeDate
                    ? new Date(profile.safeDate).toLocaleDateString(
                        language === 'hi' ? 'hi-IN' : 'en-IN',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )
                    : 'N/A'}
                </span>
              </div>
            </div>

            {/* -------------------------------- */}
            {/* Privacy Note */}
            {/* -------------------------------- */}

            <p className="text-[11px] text-gray-500 text-center font-semibold leading-relaxed border-t border-gray-200 pt-3">
              🔒 Privacy-Safe Certificate • No private owner or medical notes
              exposed • FSSAI Regulatory Support
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};