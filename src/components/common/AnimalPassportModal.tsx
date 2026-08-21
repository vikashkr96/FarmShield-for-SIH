import React from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  ShieldCheck, 
  Download, 
  Printer, 
  ExternalLink, 
  Calendar, 
  MapPin, 
  Award,
  CheckCircle2,
  AlertOctagon,
  Info
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const AnimalPassportModal: React.FC = () => {
  const { selectedAnimalForPassport, setSelectedAnimalForPassport, t } = useApp();

  if (!selectedAnimalForPassport) return null;

  const animal = selectedAnimalForPassport;
  const isCleared = animal.currentStatus === 'CLEARED';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header with National Security Seal Style */}
        <div className={`px-6 py-4 text-white flex items-center justify-between ${
          isCleared ? 'bg-emerald-800' : 'bg-rose-900'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-wide">Food Safety Digital Passport</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20">
                  DAHD Verified
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 font-mono">
                Tag ID: {animal.tagId}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedAnimalForPassport(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-6">
          
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border flex items-center gap-4 ${
            isCleared 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCleared ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {isCleared ? <CheckCircle2 className="w-7 h-7" /> : <AlertOctagon className="w-7 h-7 animate-pulse" />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-base">
                {isCleared ? 'SAFE FOR FOOD SUPPLY CHAIN' : 'WITHDRAWAL ACTIVE - WITHHOLD HARVEST'}
              </h4>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">
                {isCleared 
                  ? 'All statutory MRL withdrawal periods have elapsed. Milk & meat are fully compliant with FSSAI MRL standards.'
                  : `Animal under antimicrobial withdrawal until ${animal.earliestClearanceDate} (${animal.daysRemainingInWithdrawal} days remaining). Do NOT sell milk/meat.`
                }
              </p>
            </div>
          </div>

          {/* QR Code & Essential Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-xs border border-slate-200">
              <QRCodeSVG
                value={`https://agritrace.gov.in/passport/${animal.tagId}`}
                size={140}
                level="H"
                includeMargin={true}
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 font-semibold">
                Scan for Live Public Verification
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Species & Breed:</span>
                <p className="font-bold text-slate-800 text-sm">{animal.species} • {animal.breed}</p>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Origin Farm:</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {animal.farmName}
                </p>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Production Purpose:</span>
                <p className="font-semibold text-slate-800">{animal.purpose}</p>
              </div>

              <div>
                <span className="text-slate-500 font-medium">Status Timestamp:</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {new Date().toISOString().split('T')[0]} (Synced with Central MRL Ledger)
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-teal-50/60 border border-teal-200 text-xs text-teal-900">
            <Info className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Public Safety Protocol:</strong> Public QR verification reveals only food clearance status and origin district. Private medical notes and dosages remain restricted to authorized veterinarians and regulatory inspectors.
            </p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Print Official Tag
            </button>
          </div>

          <button
            onClick={() => setSelectedAnimalForPassport(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Passport
          </button>
        </div>

      </div>
    </div>
  );
};
