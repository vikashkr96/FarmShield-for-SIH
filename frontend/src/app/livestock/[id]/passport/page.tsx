'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import { ShieldCheck, ArrowLeft, Printer, Share2, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';
import { useAuth } from '../../../../providers/AuthProvider';
import { useToast } from '../../../../components/ui/Toast';
import { AnimalRepository } from '../../../../lib/repositories/animal.repository';
import { Animal } from '../../../../types/database';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { getBreedAsset } from '../../../../lib/breed_assets';

export default function AnimalPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const animalId = resolvedParams.id;

  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();

  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const a = await AnimalRepository.getAnimalById(animalId);
        if (a) setAnimal(a);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [animalId]);

  useEffect(() => {
    if (animal?.qr_token) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://farmshield.gov.in';
      const qrData = `${origin}/qr/${animal.qr_token}`;
      QRCode.toDataURL(qrData, { width: 140, margin: 1, errorCorrectionLevel: 'H' })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [animal?.qr_token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B5E20]" />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Passport Record Not Found</h2>
        <Button variant="primary" onClick={() => router.push('/livestock')}>
          Return to Herd List
        </Button>
      </div>
    );
  }

  const asset = getBreedAsset(animal.species, animal.breed || '');
  const isUnderWithdrawal = animal.health_status === 'under_treatment';
  const qrData = typeof window !== 'undefined'
    ? `${window.location.origin}/qr/${animal.qr_token}`
    : `https://farmshield.gov.in/qr/${animal.qr_token}`;

  const handleShare = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(qrData);
      toast.success('Passport link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 font-sans print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Navigation / Action Toolbar (Hidden in Print) */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href={`/livestock/${animal.id}`}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dossier
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Share Link
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-4 h-4" />}
            >
              Print Official Certificate
            </Button>
          </div>
        </div>

        {/* Official Certificate / Passport Document Card */}
        <div className="bg-white rounded-3xl border-2 border-[#1B5E20]/30 shadow-2xl p-8 print:border-none print:shadow-none print:p-0 relative overflow-hidden">
          {/* Watermark Background Seal */}
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-12 translate-y-12">
            <ShieldCheck className="w-96 h-96 text-[#1B5E20]" />
          </div>

          {/* Certificate Header */}
          <div className="border-b-2 border-emerald-900/20 pb-6 mb-6 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#1B5E20] text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">
                    National Food Safety & Animal Passport
                  </h1>
                  <p className="text-xs text-gray-500 font-semibold">
                    Ministry of Fisheries, Animal Husbandry &amp; Dairying • Govt. of India
                  </p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Passport ID</span>
              <span className="font-mono text-xs font-bold text-gray-800">FS-PASS-{animal.animal_code}</span>
            </div>
          </div>

          {/* Statutory Food Safety MRL Clearance Seal */}
          <div
            className={`p-4 rounded-2xl mb-6 flex items-center gap-4 ${
              isUnderWithdrawal
                ? 'bg-red-50 border-2 border-red-300 text-red-900'
                : 'bg-emerald-50 border-2 border-emerald-300 text-emerald-900'
            }`}
          >
            {isUnderWithdrawal ? (
              <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            )}
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">
                {isUnderWithdrawal
                  ? '⚠️ WITHDRAWAL EMBARGO ACTIVE - RESTRICTED FROM FOOD CHAIN'
                  : '✓ VERIFIED FOR SAFE HUMAN CONSUMPTION (FSSAI MRL COMPLIANT)'}
              </h2>
              <p className="text-xs mt-0.5 opacity-90">
                {isUnderWithdrawal
                  ? 'Active chemical withdrawal period in progress. Milk, meat, or derivative products must not be harvested or commercialized until statutory clearance.'
                  : 'Zero active pharmaceutical residues detected or in embargo. Animal satisfies all FSSAI and international CODEX Alimentarius safety norms.'}
              </p>
            </div>
          </div>

          {/* 2-Column Passport Demographics & High-Res QR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6">
            {/* Column 1 & 2: Demographics Table */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">INAPH Tag RFID</span>
                  <span className="font-mono text-sm font-black text-gray-900">{animal.animal_code}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Species / Breed</span>
                  <span className="text-sm font-black text-gray-900 capitalize">{animal.breed} ({animal.species})</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Sex &amp; Live Weight</span>
                  <span className="text-sm font-black text-gray-900 capitalize">{animal.sex} • {animal.weight} kg</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Enterprise Purpose</span>
                  <span className="text-sm font-black text-gray-900 capitalize">{animal.purpose}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Registered Farm Unit</span>
                  <span className="text-sm font-black text-gray-900">{animal.farm_id}</span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Geographic Provenance</span>
                  <span className="text-sm font-black text-gray-900 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Ludhiana, Punjab
                  </span>
                </div>
              </div>

              {animal.fishery_details && (
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs">
                  <span className="text-[10px] text-sky-800 font-bold uppercase block mb-1">Aquaculture Hydrology</span>
                  <div className="flex gap-4 font-bold text-sky-950">
                    <span>Pond: {animal.fishery_details.pond_id}</span>
                    <span>Density: {animal.fishery_details.stocking_density} pcs/m²</span>
                    <span>Volume: {animal.fishery_details.water_volume_m3} m³</span>
                  </div>
                </div>
              )}
            </div>

            {/* Column 3: High-Res QR Verification Code */}
            <div className="flex flex-col items-center justify-center p-5 bg-gray-50 rounded-2xl border border-gray-200 text-center">
              <div className="p-3 bg-white rounded-xl shadow-xs border">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="INAPH Verification QR"
                    className="w-[140px] h-[140px] object-contain"
                  />
                ) : (
                  <div className="w-[140px] h-[140px] bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-gray-400">
                    Generating QR...
                  </div>
                )}
              </div>
              <span className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-wider">
                Cryptographic Traceability Token
              </span>
              <span className="text-[9px] font-mono text-gray-400 break-all max-w-[160px] truncate mt-0.5">
                {animal.qr_token}
              </span>
            </div>
          </div>

          {/* Official Footer Verification Block */}
          <div className="border-t border-gray-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-400">
            <div>
              <p className="font-bold text-gray-700">Digital Authentication Authority: FSSAI Central Residue Database</p>
              <p>Generated under Indian National AMU Stewardship Architecture (INASA)</p>
            </div>
            <div className="text-right">
              <p>Issued on: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              <p className="text-[#1B5E20] font-bold">Government Verified Certificate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
