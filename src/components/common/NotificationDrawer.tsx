import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  CheckCheck, 
  Bell, 
  AlertTriangle, 
  AlertOctagon, 
  Package, 
  FileCheck, 
  Info,
  Calendar
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, t } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter(n => filter === 'all' || !n.isRead);

  const getIcon = (type: string) => {
    switch (type) {
      case 'WITHDRAWAL_ALERT':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'STOCK_EXPIRY':
        return <Package className="w-4 h-4 text-rose-500" />;
      case 'VET_APPROVAL_REQ':
        return <FileCheck className="w-4 h-4 text-sky-500" />;
      case 'COMPLIANCE_VIOLATION':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'RISK_FLAG':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-teal-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          
          {/* Header */}
          <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center border border-teal-500/40">
                <Bell className="w-4 h-4 text-teal-300" />
              </div>
              <div>
                <h3 className="font-bold text-base">{t.notifications}</h3>
                <p className="text-xs text-slate-400">
                  {notifications.filter(n => !n.isRead).length} unread updates
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Filters */}
          <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filter === 'all' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-2.5 py-1 rounded-md font-semibold transition ${
                  filter === 'unread' ? 'bg-teal-700 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unread ({notifications.filter(n => !n.isRead).length})
              </button>
            </div>
            <button
              onClick={markAllNotificationsAsRead}
              className="text-teal-700 hover:text-teal-900 font-semibold flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Bell className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                <p className="text-sm font-medium">No notifications in this view</p>
              </div>
            ) : (
              filtered.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => markNotificationAsRead(notif.id)}
                  className={`pt-3 first:pt-0 p-3 rounded-xl transition cursor-pointer ${
                    notif.isRead ? 'bg-white hover:bg-slate-50 opacity-75' : 'bg-teal-50/70 hover:bg-teal-50 border border-teal-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-100 mt-0.5">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className={`text-xs font-bold ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      {!notif.isRead && (
                        <div className="mt-2 flex items-center justify-end">
                          <span className="text-[10px] font-bold text-teal-700 hover:underline">
                            Mark as read
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
