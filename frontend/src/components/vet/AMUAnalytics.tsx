'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Activity, TrendingUp, PieChart as PieIcon, BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AMUAnalytics: React.FC = () => {
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/amu/summary')
      .then((res) => res.json())
      .then((json) => {
        if (json.status === 'success') {
          setData(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return <Card variant="glass" className="py-12 text-center text-gray-600 font-bold text-sm">{t('common.loading')}</Card>;
  }

  return (
    <div className="space-y-6 font-sans">
      {/* 4 Summary Stat Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-5 shadow-md">
          <span className="text-xs text-gray-600 font-bold">Total Antimicrobial Treatments</span>
          <span className="text-4xl font-black text-[#1B5E20] block mt-1">{data.metrics.totalTreatments}</span>
        </div>

        <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-5 shadow-md">
          <span className="text-xs text-gray-600 font-bold">Treated Livestock Animals</span>
          <span className="text-4xl font-black text-[#1B5E20] block mt-1">{data.metrics.treatedAnimalsCount}</span>
        </div>

        <div className="bg-white border-2 border-[#FFC107] rounded-3xl p-5 shadow-md">
          <span className="text-xs text-[#B78103] font-bold">Repeated Treatments Alert</span>
          <span className="text-4xl font-black text-[#B78103] block mt-1">{data.metrics.repeatedTreatmentsCount}</span>
        </div>

        <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-5 shadow-md">
          <span className="text-xs text-gray-600 font-bold">FSSAI Compliance Rate</span>
          <span className="text-4xl font-black text-[#1B5E20] block mt-1">{data.metrics.complianceRate}</span>
        </div>
      </div>

      {/* Monthly Trend Chart */}
      <Card variant="glass" className="space-y-4 border-2 border-[#1B5E20] bg-white p-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-[#1B5E20]" />
          <h3 className="text-xl font-black text-[#1B5E20]">{t('vet.amuTrend')}</h3>
        </div>

        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5E9" />
              <XAxis dataKey="month" stroke="#1B5E20" fontSize={12} fontWeight="bold" />
              <YAxis stroke="#1B5E20" fontSize={12} fontWeight="bold" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#1B5E20', borderRadius: '16px', fontSize: '12px', color: '#111827', fontWeight: 'bold' }}
              />
              <Bar dataKey="amoxicillin" name="Amoxicillin (mg)" fill="#1B5E20" radius={[6, 6, 0, 0]} />
              <Bar dataKey="oxytetracycline" name="Oxytetracycline (mg)" fill="#2E7D32" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Usage by Class & Species */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="glass" className="space-y-4 border-2 border-[#1B5E20] bg-white p-6">
          <div className="flex items-center space-x-2">
            <PieIcon className="w-6 h-6 text-[#1B5E20]" />
            <h3 className="text-xl font-black text-[#1B5E20]">{t('vet.topMedicines')}</h3>
          </div>

          <div className="space-y-4 pt-2 text-xs font-bold">
            {data.usageByClass.map((item: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-gray-900">
                  <span>{item.name}</span>
                  <span className="font-black text-[#1B5E20]">{item.percentage}%</span>
                </div>
                <div className="w-full bg-[#E8F5E9] h-3 rounded-full overflow-hidden border border-[#A5D6A7]">
                  <div
                    className="bg-[#1B5E20] h-full rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card variant="glass" className="space-y-4 border-2 border-[#1B5E20] bg-white p-6">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-6 h-6 text-[#1B5E20]" />
            <h3 className="text-xl font-black text-[#1B5E20]">AMU by Species</h3>
          </div>

          <div className="space-y-3 pt-2 text-xs font-bold">
            {data.usageBySpecies.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center bg-[#E8F5E9] p-4 rounded-2xl border border-[#A5D6A7]">
                <span className="font-black text-gray-900 text-sm">{item.species}</span>
                <Badge variant="success" className="bg-white text-[#1B5E20] border-[#1B5E20]">{item.treatments} Treatments</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
