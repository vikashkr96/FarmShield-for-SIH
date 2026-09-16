'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, ExternalLink, X, AlertTriangle, Info, ShieldAlert } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

export interface AppNotification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timeAgo: string;
  read: boolean;
  link?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'critical',
    title: 'FMD Containment Warning',
    message: 'Active epidemiological alert in Ludhiana district. 5 km quarantine perimeter established.',
    timeAgo: '15m ago',
    read: false,
    link: '/surveillance/map',
  },
  {
    id: 'notif-2',
    type: 'warning',
    title: 'Withdrawal Approaching Clearance',
    message: 'Animal FS-IND-2024-001 (Sahiwal #101) milk withdrawal clears in 4 hours.',
    timeAgo: '1h ago',
    read: false,
    link: '/calendar',
  },
  {
    id: 'notif-3',
    type: 'info',
    title: 'Weather THI Advisory',
    message: 'Moderate heat stress detected (THI 82). Increase ventilation and electrolyte provision in shed.',
    timeAgo: '3h ago',
    read: true,
    link: '/',
  },
];

export const NotificationDrawer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    // Supabase Realtime subscription to alerts
    const supabase = createClient();
    const channel = supabase
      .channel('public:alerts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          const newRec = payload.new as any;
          if (newRec) {
            const newNotif: AppNotification = {
              id: newRec.id || `notif-${Date.now()}`,
              type: newRec.severity === 'high' ? 'critical' : 'warning',
              title: newRec.type === 'critical' ? 'Urgent Disease Alert' : 'Livestock Health Notification',
              message: newRec.message || 'New epidemiological alert broadcasted.',
              timeAgo: 'Just now',
              read: false,
              link: '/surveillance/map',
            };
            setNotifications((prev) => [newNotif, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 border border-gray-200 transition-colors cursor-pointer"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden font-sans">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-gray-900">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-bold text-[#1B5E20] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-500">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3.5 hover:bg-gray-50 transition-colors flex gap-3 cursor-pointer ${
                      !n.read ? 'bg-emerald-50/40' : ''
                    }`}
                  >
                    <div className="shrink-0 pt-0.5">
                      {n.type === 'critical' ? (
                        <div className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      ) : n.type === 'warning' ? (
                        <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-xs text-gray-900 truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {n.timeAgo}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-snug">
                        {n.message}
                      </p>
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-[#1B5E20] hover:underline"
                        >
                          <span>Take action</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                    {!n.read && (
                      <div className="shrink-0 self-center">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 block" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-gray-50 border-t border-gray-200 text-center">
              <Link
                href="/surveillance/map"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-[#1B5E20] hover:underline"
              >
                View Outbreak Surveillance Map →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
