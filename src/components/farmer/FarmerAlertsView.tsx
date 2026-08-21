import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Package, 
  CheckCircle2,
  Calendar,
  Sparkles
} from 'lucide-react';

export const FarmerAlertsView: React.FC = () => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, t } = useApp();

  const farmerNotifs = notifications.filter(n => n.targetRole === 'farmer' || n.targetRole === 'all');

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-700" />
            Farm Regulatory Advisories & Action Items
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Urgent withdrawal countdowns, medicine stock expirations, and repeated treatment flags.
          </p>
        </div>

        <button
          onClick={markAllNotificationsAsRead}
          className="px-3.5 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50 border border-teal-200 rounded-xl transition"
        >
          Mark All as Read
        </button>
      </div>

      {/* Alert Items */}
      <div className="space-y-3">
        {farmerNotifs.map(notif => (
          <div
            key={notif.id}
            onClick={() => markNotificationAsRead(notif.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              notif.isRead 
                ? 'bg-white border-slate-200 opacity-80' 
                : 'bg-gradient-to-r from-amber-50/70 to-white border-amber-300 shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                notif.severity === 'error' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {notif.type === 'STOCK_EXPIRY' ? (
                  <Package className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{notif.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>
                {!notif.isRead && (
                  <span className="inline-block mt-2 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Action Required
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
