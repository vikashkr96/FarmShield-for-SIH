'use client';

import React, { Suspense } from 'react';
import { AuthView } from '../../components/auth/AuthView';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Loading FarmShield Portal...</div>}>
      <AuthView initialMode="login" />
    </Suspense>
  );
}
