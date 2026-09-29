'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { Button } from '../../components/ui/Button';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, switchRole } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-xl shadow-gray-200/50 space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
          ⛔
        </div>

        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-widest mt-1">
            HTTP 403 • Role Authorization Required
          </p>
        </div>

        <p className="text-sm text-gray-600 leading-relaxed">
          Your current active role (<strong className="text-gray-900">{user?.role?.toUpperCase() || 'ANONYMOUS'}</strong>) does not have official clearance to access this module.
        </p>

        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-left">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
            Evaluation Quick Switch:
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                switchRole('vet');
                router.back();
              }}
              className="flex-1 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors text-center"
            >
              Switch to Vet
            </button>
            <button
              onClick={() => {
                switchRole('admin');
                router.back();
              }}
              className="flex-1 py-2 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors text-center"
            >
              Switch to Admin
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button variant="primary" fullWidth onClick={() => router.push('/')}>
            Return to Dashboard
          </Button>
          <Button variant="outline" fullWidth onClick={() => router.push('/login')}>
            Sign in with Another Account
          </Button>
        </div>
      </div>
    </div>
  );
}
