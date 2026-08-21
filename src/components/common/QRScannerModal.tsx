import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Camera, QrCode, Search, CheckCircle, AlertOctagon } from 'lucide-react';

export const QRScannerModal: React.FC = () => {
  const { isQRScannerOpen, setIsQRScannerOpen, animals, setSelectedAnimalForPassport, showToast, t } = useApp();
  const [searchTag, setSearchTag] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  if (!isQRScannerOpen) return null;

  const handleSelectAnimal = (tagId: string) => {
    const animal = animals.find(a => a.tagId.toLowerCase() === tagId.toLowerCase());
    if (animal) {
      setSelectedAnimalForPassport(animal);
      setIsQRScannerOpen(false);
      showToast('Passport Loaded', `Viewing food safety status for Tag ID: ${animal.tagId}`, 'info');
    } else {
      showToast('Tag Not Found', 'No animal found with this Tag ID in the national registry.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Animal Tag QR Scanner</h3>
              <p className="text-xs text-slate-400">Scan or search ear-tag for instant food safety verification</p>
            </div>
          </div>
          <button
            onClick={() => setIsQRScannerOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Simulated Camera Viewfinder */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-slate-800">
            <div className="absolute inset-0 bg-[radial-gradient(#0F766E_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            
            {/* Viewfinder Target */}
            <div className="w-48 h-48 border-2 border-emerald-400/80 rounded-2xl relative flex items-center justify-center animate-pulse">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br" />
              
              {/* Laser Line */}
              <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-bounce" />
            </div>

            <div className="absolute bottom-3 px-3 py-1 rounded-full bg-slate-900/80 text-emerald-300 text-[11px] font-mono border border-emerald-500/30 flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 animate-spin" />
              Optical Ear-Tag Scanner Active
            </div>
          </div>

          {/* Quick Select from Registered Animals */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Or Select Demo Livestock Ear Tag to Scan:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {animals.slice(0, 6).map(a => (
                <button
                  key={a.id}
                  onClick={() => handleSelectAnimal(a.tagId)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition group"
                >
                  <div>
                    <div className="font-mono font-bold text-xs text-slate-900 group-hover:text-teal-800">
                      {a.tagId}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {a.species} • {a.breed}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    a.currentStatus === 'CLEARED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {a.currentStatus === 'CLEARED' ? '🟢 Safe' : '🔴 Withhold'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Tag Lookup */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Enter Ear Tag ID Manually:
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="e.g. IN-HAR-2024-8842"
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                />
              </div>
              <button
                onClick={() => handleSelectAnimal(searchTag)}
                disabled={!searchTag}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition"
              >
                Inspect
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setIsQRScannerOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
