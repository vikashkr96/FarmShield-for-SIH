'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ArrowLeft, AlertTriangle, CheckCircle2, ShieldAlert, Bell, RefreshCw } from 'lucide-react';

interface WarningsListProps {
  onBack: () => void;
}

interface AlertItem {
  id: string;
  farm_id: string;
  animal_id?: string;
  type: 'critical' | 'warning' | 'info';
  severity: 'high' | 'medium' | 'low';
  message: string;
  message_hi?: string;
  status: 'active' | 'resolved';
  created_at: string;
}

export const WarningsList: React.FC<WarningsListProps> = ({ onBack }) => {
  const { t, language } = useLanguage();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/alerts');
      const json = await res.json();
      if (json.status === 'success') {
        setAlerts(json.data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/alerts/${id}`, { method: 'PATCH' });
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a)));
    } catch {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'resolved' } : a)));
    }
  };

  const activeAlerts = alerts.filter((a) => a.status === 'active');

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-6 font-sans">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          {t('common.backToHome')}
        </Button>
        <Button variant="ghost" size="sm" onClick={fetchAlerts} leftIcon={<RefreshCw className="w-4 h-4 text-[#1B5E20]" />}>
          {t('common.refresh')}
        </Button>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B5E20] flex items-center gap-2">
          <Bell className="w-7 h-7 text-[#1B5E20]" />
          <span>{t('alerts.title')}</span>
        </h1>
        <p className="text-xs text-gray-600 font-bold">{t('alerts.subtitle')}</p>
      </div>

      {loading ? (
        <Card variant="glass" className="py-12 text-center text-gray-500 font-bold text-sm">
          {t('common.loading')}
        </Card>
      ) : activeAlerts.length === 0 ? (
        <Card variant="glass" className="py-12 text-center space-y-3 border-2 border-[#1B5E20] bg-white p-6">
          <div className="w-16 h-16 rounded-full bg-[#E8F5E9] border-2 border-[#1B5E20] flex items-center justify-center text-[#1B5E20] mx-auto text-2xl">
            <CheckCircle2 className="w-8 h-8 text-[#1B5E20]" />
          </div>
          <h3 className="text-xl font-black text-[#1B5E20]">{t('alerts.noAlerts')}</h3>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-3xl border-2 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-bold ${
                alert.type === 'critical'
                  ? 'bg-[#FFEBEE] border-[#D32F2F] text-[#D32F2F]'
                  : 'bg-[#FFF8E1] border-[#FFC107] text-[#B78103]'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-3 rounded-2xl bg-white border border-current shrink-0 mt-0.5 shadow-sm">
                  {alert.type === 'critical' ? (
                    <ShieldAlert className="w-6 h-6 text-[#D32F2F]" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-[#B78103]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant={alert.type === 'critical' ? 'error' : 'warning'}>
                      {alert.type === 'critical' ? t('alerts.critical') : t('alerts.warning')}
                    </Badge>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-base font-black text-gray-900 leading-snug">
                    {language === 'hi' ? alert.message_hi || alert.message : alert.message}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleResolve(alert.id)}
                className="self-end sm:self-center shrink-0 border-current font-black"
              >
                {t('alerts.resolveAlert')}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
