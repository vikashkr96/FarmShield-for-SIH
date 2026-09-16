'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Activity } from 'lucide-react';

export interface TrendDataPoint {
  date: string;
  cases: number;
  recovered: number;
}

interface DiseaseTrendChartProps {
  data?: TrendDataPoint[];
}

export const DiseaseTrendChart: React.FC<DiseaseTrendChartProps> = ({ data }) => {
  const defaultData: TrendDataPoint[] = [
    { date: 'Sep 01', cases: 2, recovered: 1 },
    { date: 'Sep 04', cases: 5, recovered: 2 },
    { date: 'Sep 07', cases: 3, recovered: 4 },
    { date: 'Sep 10', cases: 8, recovered: 3 },
    { date: 'Sep 12', cases: 4, recovered: 6 },
    { date: 'Sep 14', cases: 1, recovered: 5 },
    { date: 'Sep 15', cases: 2, recovered: 3 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="p-6 bg-white rounded-3xl border-2 border-[#1B5E20]/20 shadow-md font-sans space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center shadow-sm">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">
              Syndromic Herd Morbidity Trends
            </h3>
            <p className="text-[11px] text-gray-500 font-semibold">
              30-Day Clinical Incident Curve & Recovery Trajectory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1.5 text-red-600">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Active Cases
          </span>
          <span className="flex items-center gap-1.5 text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Recovered
          </span>
        </div>
      </div>

      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16A34A" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#16A34A" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold',
              }}
            />
            <Area type="monotone" dataKey="cases" stroke="#DC2626" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCases)" />
            <Area type="monotone" dataKey="recovered" stroke="#16A34A" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRecovered)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
