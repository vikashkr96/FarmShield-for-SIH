'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  const { signInWithEmail, signInWithOtp, verifyOtp, signInWithGoogle, login } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone form state
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Missing fields', 'Please enter both your email and password');
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    setLoading(false);
    if (error) {
      toast.error('Authentication failed', error);
    } else {
      toast.success('Welcome back!', 'Successfully signed in to FarmShield');
      router.push(redirectUrl);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      toast.error('Invalid phone', 'Please enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
    const { error } = await signInWithOtp(formattedPhone);
    setLoading(false);
    if (error) {
      toast.error('OTP Failed', error);
    } else {
      setOtpSent(true);
      setResendCountdown(60);
      toast.info('OTP Sent', `Verification code sent to ${formattedPhone} (Demo OTP: 123456)`);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('Invalid OTP', 'Please enter the 6-digit code');
      return;
    }
    setLoading(true);
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`;
    const { error } = await verifyOtp(formattedPhone, otp);
    setLoading(false);
    if (error) {
      toast.error('Verification failed', error);
    } else {
      toast.success('Verified', 'Successfully authenticated via Mobile OTP');
      router.push(redirectUrl);
    }
  };

  // Instant demo personas for evaluators
  const handleQuickDemoLogin = (role: 'farmer' | 'veterinarian' | 'admin') => {
    if (role === 'farmer') {
      login({
        id: 'demo-farmer-01',
        name: 'Sukhwinder Singh',
        phone: '+91 98765 43210',
        email: 'sukhwinder.singh@farmshield.gov.in',
        role: 'farmer',
        state: 'Punjab',
        district: 'Ludhiana',
        farmId: 'PB-LDH-2024-001',
        farmType: 'Dairy Cattle (Sahiwal & HF Cross)',
      });
    } else if (role === 'veterinarian') {
      login({
        id: 'demo-vet-01',
        name: 'Dr. Ramesh Kumar, B.V.Sc & A.H.',
        phone: '+91 98123 45678',
        email: 'dr.ramesh@vci.gov.in',
        role: 'vet',
        state: 'Punjab',
        district: 'Ludhiana',
        licenseNo: 'VCI/PB/2018/04921',
        farmType: 'Veterinary Hospital & Mobile Clinic',
      });
    } else {
      login({
        id: 'demo-admin-01',
        name: 'Dr. Anita Desai, Director DAHD',
        phone: '+91 94111 22233',
        email: 'anita.desai@nic.in',
        role: 'admin',
        state: 'National',
        district: 'New Delhi HQ',
        farmType: 'Central Surveillance Unit',
      });
    }
    toast.success('Demo Session Active', `Signed in as ${role.toUpperCase()}`);
    router.push(redirectUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1B5E20] flex items-center justify-center text-white shadow-xl shadow-green-900/10 text-3xl">
            🛡️
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Sign in to FarmShield
        </h2>
        <p className="mt-1.5 text-center text-sm text-gray-600">
          Department of Animal Husbandry & Dairying (DAHD) Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-gray-200/50 border border-gray-100 rounded-3xl">
          <Tabs
            variant="pills"
            fullWidth
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'email' | 'phone')}
            tabs={[
              { id: 'email', label: 'Email & Password' },
              { id: 'phone', label: 'Mobile OTP (+91)' },
            ]}
            className="mb-6"
          />

          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="farmer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div>
                <Input
                  label="Password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="flex items-center justify-end mt-1.5">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-[#1B5E20] hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button type="submit" variant="primary" fullWidth loading={loading} className="mt-2">
                Sign In with Email
              </Button>
            </form>
          )}

          {activeTab === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <Input
                    label="Mobile Number (India)"
                    type="tel"
                    required
                    placeholder="98765 43210"
                    prefixText="+91"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    helperText="We will send an instant 6-digit OTP verification code."
                  />
                  <Button type="submit" variant="primary" fullWidth loading={loading}>
                    Send OTP SMS
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <Input
                    label="Enter 6-Digit Verification Code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    helperText="Demo test code is 123456"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" fullWidth loading={loading}>
                      Verify & Sign In
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        if (resendCountdown === 0) {
                          handleSendOtp(e);
                        }
                      }}
                      disabled={loading || resendCountdown > 0}
                    >
                      {resendCountdown > 0 ? `Resend (${resendCountdown}s)` : 'Resend'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-white px-3 text-gray-500 font-semibold">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => signInWithGoogle()}
                className="flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google Account</span>
              </Button>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5 text-center">
              ⚡ Evaluation Quick-Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('farmer')}
                className="py-2 px-2 text-xs font-bold rounded-xl border border-green-200 bg-green-50/60 text-[#1B5E20] hover:bg-green-100 transition-colors text-center"
              >
                🐄 Farmer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('veterinarian')}
                className="py-2 px-2 text-xs font-bold rounded-xl border border-blue-200 bg-blue-50/60 text-blue-700 hover:bg-blue-100 transition-colors text-center"
              >
                🩺 Vet Officer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="py-2 px-2 text-xs font-bold rounded-xl border border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100 transition-colors text-center"
              >
                🏛️ State Admin
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-bold text-[#1B5E20] hover:underline">
                Create new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
