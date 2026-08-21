import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  const bgColors = {
    success: 'bg-emerald-900/95 text-emerald-50 border-emerald-700',
    error: 'bg-rose-900/95 text-rose-50 border-rose-700',
    info: 'bg-slate-900/95 text-slate-50 border-slate-700'
  }[toastMessage.type || 'success'];

  const Icon = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info
  }[toastMessage.type || 'success'];

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-short">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${bgColors}`}>
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 pr-2">
          <h4 className="font-semibold text-sm leading-tight">{toastMessage.title}</h4>
          {toastMessage.desc && (
            <p className="text-xs mt-1 text-slate-300 leading-relaxed">{toastMessage.desc}</p>
          )}
        </div>
      </div>
    </div>
  );
};
