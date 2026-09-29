'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLanguage } from '../../../providers/LanguageProvider';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { ShieldCheck, CheckCircle2, AlertTriangle, ShieldAlert, Milk, Fish, Check } from 'lucide-react';
import { API_BASE_URL } from '../../../lib/config';

export default function PublicQRPage() {
  const params = useParams();
  const qrToken = (params?.qr_token as string) || '';
  const { t, language } = useLanguage();

  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!qrToken) return;

    fetch(`${API_BASE_URL}/api/animals/qr/${encodeURIComponent(qrToken)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success') {
          setProfile(json.data);
        } else {
          setError(json.message || 'Animal QR Profile not found');
        }
      })
      .catch(() => setError('Server connection error'))
      .finally(() => setLoading(false));
  }, [qrToken]);

  const isDairyCattle = profile?.species === 'cow' || profile?.species === 'buffalo' || profile?.species === 'cattle';
  const isFishery = profile?.species === 'fishery' || profile?.species === 'fish';

  return (
    <div className="min-h-screen bg-[#FFFDF5] py-12 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg">
        <Card variant="glass" className="space-y-6 shadow-2xl border-2 border-[#1B5E20]/40 bg-white p-8 rounded-3xl relative overflow-hidden">
          {/* Top Brand Header */}
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
            <div className="w-12 h-12 rounded-2xl bg-[#1B5E20] text-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#1B5E20]">{t('qr.publicProfileTitle')}</h1>
              <p className="text-xs text-gray-600 font-bold">{t('qr.publicNotice')}</p>
            </div>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500 font-bold text-sm">{t('common.loading')}</div>
          ) : error ? (
            <div className="p-6 bg-[#FFEBEE] border border-[#D32F2F] rounded-2xl text-[#D32F2F] text-center text-xs font-bold">
              {error}
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Overall Withdrawal Status Banner */}
              <div className="text-center space-y-3 py-5 bg-[#FFFDF5] rounded-3xl border-2 border-gray-200">
                <span className="text-xs text-gray-500 font-bold block">{t('qr.safetyStatus')}</span>
                <Badge
                  variant={profile.withdrawalStatus.includes('CLEARED') ? 'success' : 'error'}
                  size="lg"
                  pulse
                  className="px-6 py-2.5 text-base font-black"
                >
                  {profile.withdrawalStatus}
                </Badge>
              </div>

              {/* Species-Specific Food Safety Cards (NO MEAT STATUS FOR CATTLE/BUFFALO) */}
              {isDairyCattle ? (
                <div className="p-4 bg-[#E8F5E9] rounded-2xl border-2 border-[#2E7D32]/30 text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-600 font-bold">
                    <Milk className="w-4 h-4 text-[#1B5E20]" />
                    <span>DAIRY MILK SAFETY STATUS</span>
                  </div>
                  <span className="text-base font-black text-[#2E7D32] block">
                    {profile.milkStatus || profile.withdrawalStatus}
                  </span>
                  <span className="text-[11px] text-[#1B5E20] font-semibold block">
                    {profile.withdrawalStatus.includes('CLEARED')
                      ? '✓ Tested and cleared under FSSAI MRL standards'
                      : '⚠️ Active antibiotic withdrawal period in progress'}
                  </span>
                </div>
              ) : isFishery ? (
                <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-blue-900 font-bold">
                    <Fish className="w-4 h-4 text-blue-700" />
                    <span>AQUACULTURE HARVEST SAFETY STATUS</span>
                  </div>
                  <span className="text-base font-black text-blue-800 block">
                    {profile.withdrawalStatus}
                  </span>
                  <span className="text-[11px] text-blue-700 font-semibold block">
                    {profile.withdrawalStatus.includes('CLEARED')
                      ? '✓ Pond biomass cleared for safe harvesting & export'
                      : '⚠️ Active chemical withdrawal in pond biomass'}
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-[#E8F5E9] rounded-2xl border-2 border-[#2E7D32]/30 text-center space-y-1.5">
                  <span className="text-xs text-gray-600 font-bold block">FOOD SAFETY WITHDRAWAL STATUS</span>
                  <span className="text-base font-black text-[#2E7D32] block">
                    {profile.withdrawalStatus}
                  </span>
                </div>
              )}

              {/* Tag & Species Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-gray-200">
                  <span className="text-gray-500 font-bold block">{t('qr.tagCode')}</span>
                  <span className="text-xl font-black text-[#1B5E20]">{profile.animalCode}</span>
                </div>

                <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-gray-200">
                  <span className="text-gray-500 font-bold block">{t('qr.speciesBreed')}</span>
                  <span className="text-sm font-black text-gray-900 capitalize">{profile.species} ({profile.breed})</span>
                </div>
              </div>

              {/* Safe Date Countdown */}
              <div className="bg-[#FFFDF5] p-4 rounded-2xl border border-gray-200 text-xs flex justify-between items-center">
                <span className="text-gray-700 font-bold">
                  {isDairyCattle ? 'Safe Milk Date:' : 'Safe Market Date:'}
                </span>
                <span className="text-base font-black text-[#1B5E20]">
                  {new Date(profile.safeDate).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <p className="text-[11px] text-gray-500 text-center font-bold leading-relaxed border-t border-gray-200 pt-3">
                🔒 Privacy-Safe Food Safety Certificate • Certified by FarmShield MRL Engine
              </p>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
