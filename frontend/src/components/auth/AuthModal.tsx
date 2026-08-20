'use client';

import React, { useState, useEffect } from 'react';
import { useAuth, UserProfile } from '../../providers/AuthProvider';
import { UserRoleMode } from '../ui/Navbar';
import { useLanguage } from '../../providers/LanguageProvider';
import {
  X,
  Phone,
  Lock,
  KeyRound,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
  BarChart3,
  Users2,
  Check,
  Building2,
  Stethoscope,
  UserCheck,
} from 'lucide-react';

interface AuthModalProps {
  onSuccessRoleChange?: (role: UserRoleMode) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccessRoleChange }) => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    authModalDefaultRole,
    login,
  } = useAuth();
  const { language } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [role, setRole] = useState<UserRoleMode>('farmer');

  // Form State
  const [phone, setPhone] = useState<string>('9876543210');
  const [password, setPassword] = useState<string>('password123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCountdown, setOtpCountdown] = useState<number>(0);

  // Registration Extra Fields
  const [name, setName] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('Uttar Pradesh');
  const [district, setDistrict] = useState<string>('Varanasi');
  const [farmType, setFarmType] = useState<string>('Dairy Cattle & Buffaloes');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setRole(authModalDefaultRole);
      setError(null);
    }
  }, [isAuthModalOpen, authModalMode, authModalDefaultRole]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        setOtpSent(true);
        setOtpCountdown(30);
        setOtp('584291'); // Auto-fill demo OTP
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch {
      // Offline fallback
      setOtpSent(true);
      setOtpCountdown(30);
      setOtp('584291');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (provider: 'DigiLocker' | 'Bharat Pashudhan' | 'AgriStack' | 'Google') => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: provider === 'Google' ? 'google' : 'sso',
          ssoProvider: provider,
          role,
          phone: '9876543210',
          googleUser: provider === 'Google' ? { name: 'Verified Google Citizen', email: 'citizen@gmail.com' } : undefined,
        }),
      });
      const json = await res.json();

      if (json.status === 'success' && json.data?.user) {
        login(json.data.user);
        if (onSuccessRoleChange) onSuccessRoleChange(role);
        closeAuthModal();
      } else {
        performLocalLogin(role, provider);
      }
    } catch {
      performLocalLogin(role, provider);
    } finally {
      setLoading(false);
    }
  };

  const performLocalLogin = (selectedRole: UserRoleMode, providerName?: string) => {
    const userProfile: UserProfile = {
      id: `u_${Date.now()}`,
      name:
        selectedRole === 'farmer'
          ? 'Ramesh Patel'
          : selectedRole === 'vet'
          ? 'Dr. Priya Sharma, MVSc'
          : 'Sh. Rajesh Verma (DAH&D)',
      phone: phone || '9876543210',
      role: selectedRole,
      state: selectedState,
      district,
      farmId: selectedRole === 'farmer' ? 'IND-UP-8842' : undefined,
      licenseNo: selectedRole === 'vet' ? 'VCI-GUJ-4091' : selectedRole === 'admin' ? 'DAHD-ADM-001' : undefined,
      authProvider: providerName || 'local',
    };

    login(userProfile);
    if (onSuccessRoleChange) onSuccessRoleChange(selectedRole);
    closeAuthModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone || phone.length < 10) {
      setError('Please provide a valid 10-digit phone number.');
      return;
    }

    setLoading(true);

    if (mode === 'login') {
      try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: loginMethod,
            phone,
            password: loginMethod === 'password' ? password : undefined,
            otp: loginMethod === 'otp' ? otp : undefined,
            role,
          }),
        });

        const json = await res.json();
        if (json.status === 'success' && json.data?.user) {
          login(json.data.user);
          if (onSuccessRoleChange) onSuccessRoleChange(role);
          closeAuthModal();
        } else {
          setError(json.message || 'Login failed. Please check your credentials.');
        }
      } catch {
        // Fallback for offline testing
        performLocalLogin(role);
      } finally {
        setLoading(false);
      }
    } else {
      // Register Mode
      if (!name) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            password,
            role,
            state: selectedState,
            district,
            farmType,
          }),
        });

        const json = await res.json();
        if (json.status === 'success' && json.data?.user) {
          login(json.data.user);
          if (onSuccessRoleChange) onSuccessRoleChange(role);
          closeAuthModal();
        } else {
          setError(json.message || 'Registration failed.');
        }
      } catch {
        performLocalLogin(role);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-gray-200 my-auto relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold z-30 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ========================================================================= */}
        {/* LEFT COLUMN: OFFICIAL MINISTRY BRANDING & HIGHLIGHTS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#00382B] via-[#002820] to-[#0A192F] p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-8 relative z-10">
            {/* Gov Header / Emblem */}
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-inner">
                🏛️
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white block">
                  VASUDHA / FarmShield
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300">
                  Digital Farm Management Portal
                </span>
              </div>
            </div>

            {/* Ministry Titles */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Ministry of Fisheries, Animal Husbandry & Dairying
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 font-medium leading-relaxed">
                Government of India Initiative for Livestock Safety & Compliance (SIH25007)
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold text-gray-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <span>MRL & AMU Monitoring</span>
              </div>

              <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold text-gray-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span>Real-time Compliance Tracking</span>
              </div>

              <div className="flex items-center space-x-3 text-xs sm:text-sm font-semibold text-gray-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
                  <Users2 className="w-4 h-4" />
                </div>
                <span>Multi-stakeholder Platform</span>
              </div>
            </div>
          </div>

          <div className="pt-8 text-[10px] text-gray-400 font-medium border-t border-white/10 mt-6 relative z-10">
            FSSAI MRL Standards • FAO/WHO Codex Alimentarius • National Digital Livestock Mission
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: AUTHENTICATION FORM & SSO PROVIDERS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-10 bg-white flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            {/* Header */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                {mode === 'login'
                  ? 'Sign in to your VASUDHA account'
                  : 'Register for FarmShield National Portal'}
              </p>
            </div>

            {/* Stakeholder Role Picker */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-gray-700 uppercase tracking-wider text-center">
                Select Your Role / भूमिका चुनें
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('farmer')}
                  className={`py-2 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center gap-1 ${
                    role === 'farmer'
                      ? 'bg-[#E8F5E9] border-[#1B5E20] text-[#1B5E20] shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Farmer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('vet')}
                  className={`py-2 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center gap-1 ${
                    role === 'vet'
                      ? 'bg-blue-50 border-blue-600 text-blue-800 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>Veterinarian</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center gap-1 ${
                    role === 'admin'
                      ? 'bg-amber-50 border-amber-600 text-amber-900 shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Admin / Govt</span>
                </button>
              </div>
            </div>

            {/* SSO Quick Login Grid (4 Buttons) */}
            <div className="space-y-2">
              <span className="block text-[11px] font-bold text-gray-500 text-center">
                Sign in with
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSSOLogin('DigiLocker')}
                  className="py-2.5 px-3 border border-gray-200 hover:border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span className="text-sm">🇮🇳</span>
                  <span>DigiLocker</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSSOLogin('Bharat Pashudhan')}
                  className="py-2.5 px-3 border border-gray-200 hover:border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span className="text-sm">🐄</span>
                  <span>Bharat Pashudhan</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSSOLogin('AgriStack')}
                  className="py-2.5 px-3 border border-gray-200 hover:border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span className="text-sm">🌾</span>
                  <span>AgriStack</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSSOLogin('Google')}
                  className="py-2.5 px-3 border border-gray-200 hover:border-gray-300 rounded-xl bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span className="text-sm font-black text-red-500">G</span>
                  <span>Google</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-gray-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-gray-400 font-medium whitespace-nowrap">
                Or continue with
              </span>
              <div className="border-t border-gray-200 w-full" />
            </div>

            {/* Sign-in Method Tabs (Password vs OTP) */}
            {mode === 'login' && (
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setError(null); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    loginMethod === 'password'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Mobile Number + Password
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); setError(null); }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    loginMethod === 'otp'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  Mobile Number + OTP
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Register Extra: Full Name */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 font-medium focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Mobile Number Input */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Number</label>
                <div className="flex rounded-xl border border-gray-300 overflow-hidden focus-within:border-[#1B5E20] focus-within:ring-1 focus-within:ring-[#1B5E20]">
                  <span className="inline-flex items-center px-3.5 bg-gray-50 text-gray-600 font-bold text-xs border-r border-gray-300">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 text-sm text-gray-900 font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              {(mode === 'register' || (mode === 'login' && loginMethod === 'password')) && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-700">Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => alert('Demo password is: password123')}
                        className="text-[11px] font-bold text-[#1B5E20] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl pl-4 pr-11 py-2.5 text-sm text-gray-900 font-medium focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Input */}
              {mode === 'login' && loginMethod === 'otp' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">6-Digit OTP Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="584291"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-black tracking-widest text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading || otpCountdown > 0}
                      className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-black whitespace-nowrap transition-colors disabled:opacity-50"
                    >
                      {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                  {otpSent && (
                    <span className="text-[11px] text-[#1B5E20] font-bold block">
                      ✓ Demo OTP sent: <span className="font-mono font-black">584291</span>
                    </span>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Register Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Mode Switch Link */}
            <div className="text-center pt-2">
              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-xs font-bold text-gray-600 hover:text-[#1B5E20]"
                >
                  Need an account? <span className="text-[#1B5E20] underline">Register</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-xs font-bold text-gray-600 hover:text-[#1B5E20]"
                >
                  Already have an account? <span className="text-[#1B5E20] underline">Sign In</span>
                </button>
              )}
            </div>
          </div>

          {/* Back to Overview Link */}
          <div className="text-center pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={closeAuthModal}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
            >
              ← Back to Overview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
