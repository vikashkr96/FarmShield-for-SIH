'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, Server, Database, Monitor, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { fetchBackendHealth, HealthCheckResponse } from '../lib/api';

export const ConnectionStatus: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [healthData, setHealthData] = useState<HealthCheckResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string | null>(null);

  const runHealthCheck = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    const response = await fetchBackendHealth();

    if (response.success && response.data) {
      setHealthData(response.data);
    } else {
      setErrorMsg(response.error || 'Failed to connect to backend server.');
      setHealthData(null);
    }

    setLastCheckTime(new Date().toLocaleTimeString());
    setLoading(false);
  }, []);

  useEffect(() => {
    runHealthCheck();
  }, [runHealthCheck]);

  const expressStatus = healthData?.services.expressApi.status === 'healthy';
  const supabaseConnected = healthData?.services.supabase.connected ?? false;
  const supabaseConfigured = healthData?.services.supabase.configured ?? false;

  return (
    <Card variant="glass" className="w-full max-w-4xl mx-auto shadow-2xl relative overflow-hidden border-2 border-[#1B5E20] bg-white p-6 sm:p-8 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b-2 border-[#1B5E20]/20 gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#E8F5E9] border border-[#1B5E20]/30 rounded-2xl text-[#1B5E20]">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#1B5E20] flex items-center gap-2">
              System Architecture & Health Verification
            </h3>
            <p className="text-xs text-gray-600 font-bold">
              Live status pinging: <span className="text-[#1B5E20] font-black">Frontend</span> → <span className="text-[#1B5E20] font-black">Express API</span> → <span className="text-[#1B5E20] font-black">Supabase DB</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-center">
          {lastCheckTime && (
            <span className="text-xs text-gray-500 font-bold hidden md:inline">
              Last checked: {lastCheckTime}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={runHealthCheck}
            isLoading={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            className="border-[#1B5E20]"
          >
            Re-test Connectivity
          </Button>
        </div>
      </div>

      {/* Connection Flow Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Node 1: Next.js Frontend */}
        <div className="bg-[#E8F5E9] border-2 border-[#1B5E20]/30 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-[#1B5E20]">
              <Monitor className="w-5 h-5" />
              <span className="font-black text-sm">Frontend</span>
            </div>
            <Badge variant="success" pulse>
              Active
            </Badge>
          </div>
          <p className="text-xs text-gray-700 font-bold mb-2">Next.js 14 App Router (Client & Server Components)</p>
          <div className="text-[11px] text-[#1B5E20] font-mono bg-white p-2.5 rounded-xl border border-[#1B5E20]/30 font-bold">
            http://localhost:3000
          </div>
        </div>

        {/* Arrow / Connector 1 */}
        <div className="hidden md:flex items-center justify-center -mx-2 z-10 pointer-events-none">
          <div className="w-9 h-9 rounded-full bg-[#E8F5E9] border-2 border-[#1B5E20] flex items-center justify-center text-[#1B5E20]">
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>

        {/* Node 2: Express API */}
        <div className="bg-[#E8F5E9] border-2 border-[#1B5E20]/30 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-[#1B5E20]">
              <Server className="w-5 h-5" />
              <span className="font-black text-sm">Express REST API</span>
            </div>
            {loading ? (
              <Badge variant="neutral">Checking...</Badge>
            ) : expressStatus ? (
              <Badge variant="success" pulse>
                Online
              </Badge>
            ) : (
              <Badge variant="error">Offline</Badge>
            )}
          </div>
          <p className="text-xs text-gray-700 font-bold mb-2">Express.js TypeScript Server with CORS & Helmet</p>
          <div className="text-[11px] text-[#1B5E20] font-mono bg-white p-2.5 rounded-xl border border-[#1B5E20]/30 font-bold truncate">
            {healthData ? `${healthData.appName} (${healthData.services.expressApi.uptimeSeconds}s uptime)` : 'http://localhost:5000/api/health'}
          </div>
        </div>

        {/* Node 3: Supabase Database */}
        <div className="bg-[#E8F5E9] border-2 border-[#1B5E20]/30 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-[#1B5E20]">
              <Database className="w-5 h-5" />
              <span className="font-black text-sm">Supabase DB</span>
            </div>
            {loading ? (
              <Badge variant="neutral">Checking...</Badge>
            ) : supabaseConnected ? (
              <Badge variant="success" pulse>
                Connected
              </Badge>
            ) : supabaseConfigured ? (
              <Badge variant="warning">Unreachable</Badge>
            ) : (
              <Badge variant="info">Config Required</Badge>
            )}
          </div>
          <p className="text-xs text-gray-700 font-bold mb-2">PostgreSQL Database & Auth Client</p>
          <div className="text-[11px] text-[#1B5E20] font-mono bg-white p-2.5 rounded-xl border border-[#1B5E20]/30 font-bold truncate">
            {supabaseConnected
              ? 'PostgreSQL Query Verified'
              : supabaseConfigured
              ? 'Credentials configured, awaiting live connection'
              : 'Provide SUPABASE_URL in backend .env'}
          </div>
        </div>
      </div>

      {/* Detailed Status & Logs Box */}
      <div className="bg-[#FFFDF5] rounded-2xl border-2 border-gray-200 p-5">
        <h4 className="text-xs font-black text-[#1B5E20] uppercase tracking-wider mb-3">
          Diagnostic Endpoint Logs & Payload
        </h4>

        {errorMsg ? (
          <div className="flex items-start space-x-3 p-4 bg-[#FFEBEE] border border-[#D32F2F] rounded-xl text-[#D32F2F] text-xs font-bold">
            <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-black block mb-1">Backend Connection Error</span>
              <p>{errorMsg}</p>
            </div>
          </div>
        ) : healthData ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-gray-200 pb-2 font-bold">
              <span className="text-gray-600">API Endpoint:</span>
              <code className="text-[#1B5E20] bg-[#E8F5E9] px-2.5 py-1 rounded-lg border border-[#1B5E20]/30 font-black">
                GET /api/health
              </code>
            </div>
            <div className="flex items-center justify-between text-xs border-b border-gray-200 pb-2 font-bold">
              <span className="text-gray-600">Supabase Connection Message:</span>
              <span className="text-gray-900 flex items-center gap-1.5 font-black">
                {supabaseConnected ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1B5E20]" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#B78103]" />
                )}
                {healthData.services.supabase.message}
              </span>
            </div>
            <pre className="text-[11px] font-mono bg-white p-4 rounded-xl text-[#1B5E20] font-black overflow-x-auto border-2 border-[#1B5E20]/20 shadow-inner">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 font-bold text-xs">
            Running system diagnostics...
          </div>
        )}
      </div>
    </Card>
  );
};
