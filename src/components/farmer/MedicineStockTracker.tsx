import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  TrendingDown, 
  ArrowUpRight, 
  Clock,
  Pill,
  X
} from 'lucide-react';

export const MedicineStockTracker: React.FC = () => {
  const { medicineStocks, medicines, updateStockQuantity, addStockItem, currentUser, t } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedMedId, setSelectedMedId] = useState(medicines[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState(`BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [quantity, setQuantity] = useState(5);
  const [unit, setUnit] = useState('Vials (100ml)');
  const [minThreshold, setMinThreshold] = useState(2);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  const handleAddStock = (e: React.FormEvent) => {
    e.preventDefault();
    const med = medicines.find(m => m.id === selectedMedId);
    if (!med) return;

    addStockItem({
      farmId: currentUser.farmId || 'farm-hr-01',
      medicineId: med.id,
      medicineName: med.brandName,
      batchNumber,
      quantity: Number(quantity),
      unit,
      minThreshold: Number(minThreshold),
      expiryDate,
      receivedDate: new Date().toISOString().split('T')[0]
    });

    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-700" />
            On-Farm Veterinary Medicine Inventory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track batch lot numbers, expiration countdowns, and automated dose deduction logs.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Medicine Restock
        </button>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {medicineStocks.map(stock => {
          const med = medicines.find(m => m.id === stock.medicineId);
          const isLow = stock.quantity <= stock.minThreshold;
          const expiryTime = new Date(stock.expiryDate).getTime() - Date.now();
          const isExpiringSoon = expiryTime < 30 * 24 * 60 * 60 * 1000;

          return (
            <div
              key={stock.id}
              className={`p-5 rounded-2xl bg-white border transition-all duration-200 shadow-xs space-y-4 ${
                isLow ? 'border-amber-300 ring-2 ring-amber-400/20' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                    {stock.batchNumber}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{stock.medicineName}</h4>
                  <p className="text-[11px] text-slate-500">
                    {med?.activeIngredient} {med?.isCIA && <span className="text-rose-600 font-bold">• [CIA]</span>}
                  </p>
                </div>

                {isLow ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-700" />
                    Low Stock
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    In Stock
                  </span>
                )}
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Available</span>
                  <div className="text-xl font-extrabold text-slate-900 font-mono">
                    {stock.quantity} <span className="text-xs font-normal text-slate-500">{stock.unit}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => updateStockQuantity(stock.id, -1)}
                    disabled={stock.quantity <= 0}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center disabled:opacity-40 transition"
                  >
                    -
                  </button>
                  <button
                    onClick={() => updateStockQuantity(stock.id, 1)}
                    className="w-8 h-8 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm flex items-center justify-center transition shadow-xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Expiry Details */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Expires: <strong className={isExpiringSoon ? 'text-rose-600 font-mono' : 'text-slate-700 font-mono'}>{stock.expiryDate}</strong>
                </span>
                <span className="text-[10px] text-slate-400">
                  Threshold: {stock.minThreshold}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restock Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Record Medicine Restock / Batch Lot</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-teal-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStock} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Medicine *</label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold"
                >
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.brandName} ({m.activeIngredient})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Batch / Lot No. *</label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity Received</label>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Packaging Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Vials (100ml)"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Save Stock Record
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
