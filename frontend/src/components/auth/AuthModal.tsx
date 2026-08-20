'use client';

import React, { useState } from 'react';
import { useAuth, UserProfile } from '../../providers/AuthProvider';
import { UserRoleMode } from '../ui/Navbar';
import { useLanguage } from '../../providers/LanguageProvider';
import {
  X,
  Phone,
  Lock,
  KeyRound,
  User,
  MapPin,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
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

  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [role, setRole] = useState<UserRoleMode>(authModalDefaultRole);

  // Form State
  const [phone, setPhone] = useState<string>('9876543210');
  const [password, setPassword] = useState<string>('vasudha123');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);

  // Registration Specific Fields
  const [name, setName] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('Uttar Pradesh');
  const [district, setDistrict] = useState<string>('Varanasi');
  const [farmType, setFarmType] = useState<string>('Dairy Cattle & Buffaloes');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isAuthModalOpen) return null;

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
    'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
    'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir',
    'Ladakh', 'Puducherry', 'Chandigarh', 'Andaman & Nicobar', 'Dadra & Nagar Haveli', 'Lakshadweep'
  ];

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError(null);
    setOtpSent(true);
    setOtpTimer(30);
    setOtp('584291'); // Auto-fill demo OTP for evaluator convenience
  };

  const handleQuickDemoLogin = (demoRole: UserRoleMode) => {
    let demoUser: UserProfile;
    switch (demoRole) {
      case 'farmer':
        demoUser = {
          id: 'u_farmer_01',
          name: 'Ramesh Patel',
          phone: '9876543210',
          role: 'farmer',
          state: 'Uttar Pradesh',
          district: 'Varanasi',
          farmId: 'IND-UP-8842',
          farmType: 'Dairy Cattle & Aquaculture',
        };
        break;
      case 'vet':
        demoUser = {
          id: 'u_vet_02',
          name: 'Dr. Priya Sharma, MVSc',
          phone: '9876543211',
          role: 'vet',
          state: 'Gujarat',
          district: 'Anand',
          licenseNo: 'VCI-GUJ-4091',
        };
        break;
      case 'admin':
        demoUser = {
          id: 'u_admin_03',
          name: 'Sh. Rajesh Verma (Joint Secy, DAH&D)',
          phone: '9876543212',
          role: 'admin',
          state: 'New Delhi',
          district: 'Central Delhi',
          licenseNo: 'DAHD-ADM-001',
        };
        break;
      case 'qr_scanner':
        demoUser = {
          id: 'u_insp_04',
          name: 'Anand District Milk Cooperative Union',
          phone: '9876543213',
          role: 'qr_scanner',
          state: 'Gujarat',
          district: 'Anand',
          licenseNo: 'FSSAI-INSP-9921',
        };
        break;
    }

    login(demoUser);
    if (onSuccessRoleChange) onSuccessRoleChange(demoRole);
    closeAuthModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phone || phone.length < 10) {
      setError('Please provide a valid 10-digit phone number.');
      return;
    }

    if (mode === 'login') {
      if (loginMethod === 'password' && !password) {
        setError('Please enter your password.');
        return;
      }
      if (loginMethod === 'otp' && (!otp || otp.length < 6)) {
        setError('Please enter the 6-digit OTP sent to your phone.');
        return;
      }

      const userProfile: UserProfile = {
        id: `u_${Date.now()}`,
        name: phone === '9876543210' ? 'Ramesh Patel' : 'Registered User',
        phone,
        role,
        state: selectedState,
        district,
        farmId: role === 'farmer' ? 'IND-FARM-9021' : undefined,
        licenseNo: role === 'vet' ? 'VCI-REG-882' : role === 'admin' ? 'DAHD-GOV-01' : undefined,
      };

      login(userProfile);
      if (onSuccessRoleChange) onSuccessRoleChange(role);
      closeAuthModal();
    } else {
      // Register Mode
      if (!name) {
        setError('Please enter your full name.');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      const newProfile: UserProfile = {
        id: `u_${Date.now()}`,
        name,
        phone,
        role,
        state: selectedState,
        district,
        farmType,
        farmId: role === 'farmer' ? `IND-${selectedState.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        licenseNo: role === 'vet' ? `VCI-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      };

      login(newProfile);
      if (onSuccessRoleChange) onSuccessRoleChange(role);
      closeAuthModal();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto font-sans">
      <div className="bg-white border-2 border-[#1B5E20] rounded-3xl p-6 sm:p-8 w-full max-w-lg max-h-[92vh] overflow-y-auto space-y-6 shadow-2xl my-auto relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Ministry Banner */}
        <div className="text-center space-y-2 pt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[11px] font-black text-[#1B5E20]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ministry of Fisheries, Animal Husbandry & Dairying</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B5E20] tracking-tight">
            {mode === 'login' ? 'Portal Authentication' : 'Create New User Account'}
          </h1>
          <p className="text-xs text-gray-600 font-bold max-w-sm mx-auto">
            {mode === 'login'
              ? 'Sign in to access MRL monitoring, AMU stewardship, and livestock QR passports.'
              : 'Register your farm, veterinary license, or inspection center on the National Portal.'}
          </p>
        </div>

        {/* 1-Click Quick Demo Evaluator Accounts Bar */}
        <div className="p-3.5 bg-[#FFFDF5] border-2 border-[#1B5E20]/30 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-black text-gray-700">
            <span className="flex items-center gap-1.5 text-[#1B5E20]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SIH Evaluator Quick 1-Click Login:</span>
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('farmer')}
              className="px-2.5 py-1.5 rounded-xl bg-[#E8F5E9] hover:bg-[#C8E6C9] border border-[#A5D6A7] text-[11px] font-black text-[#1B5E20] text-left transition-colors flex items-center gap-1.5"
            >
              <span>👨‍🌾</span>
              <span className="truncate">Farmer (UP)</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('vet')}
              className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[11px] font-black text-blue-800 text-left transition-colors flex items-center gap-1.5"
            >
              <span>🩺</span>
              <span className="truncate">Veterinary Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[11px] font-black text-amber-800 text-left transition-colors flex items-center gap-1.5"
            >
              <span>🏛️</span>
              <span className="truncate">DAH&D Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('qr_scanner')}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-black text-emerald-800 text-left transition-colors flex items-center gap-1.5"
            >
              <span>🥛</span>
              <span className="truncate">Milk Inspector</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl gap-1 text-xs font-black">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'login' ? 'bg-[#1B5E20] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In (लॉग इन)
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'register' ? 'bg-[#1B5E20] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Register Account (पंजीकरण)
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-gray-800">
          {/* Role Selection Dropdown */}
          <div>
            <label className="block text-gray-700 mb-1">Select Role (आपकी भूमिका) *</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRoleMode)}
              className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-4 py-3 text-sm text-gray-900 font-bold focus:border-[#1B5E20] focus:outline-none"
            >
              <option value="farmer">👨‍🌾 Farmer / Livestock & Aquaculture Owner</option>
              <option value="vet">🩺 Veterinary Medical Officer (VO / MVU)</option>
              <option value="admin">🏛️ Government Official / DAH&D Auditor</option>
              <option value="qr_scanner">🥛 Milk Cooperative / Food Safety Inspector</option>
            </select>
          </div>

          {/* Registration Extra Fields */}
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-gray-700 mb-1">Full Name (पूरा नाम) *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">State / UT (राज्य) *</label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-3 py-3 text-xs text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                  >
                    {indianStates.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">District (ज़िला) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Varanasi"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-3 py-3 text-xs text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                  />
                </div>
              </div>

              {role === 'farmer' && (
                <div>
                  <label className="block text-gray-700 mb-1">Primary Unit Category *</label>
                  <select
                    value={farmType}
                    onChange={(e) => setFarmType(e.target.value)}
                    className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl px-3 py-3 text-xs text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                  >
                    <option value="Dairy Cattle & Buffaloes">🐄 Dairy Cattle & Buffaloes</option>
                    <option value="Goat & Sheep Unit">🐐 Goat & Sheep Herd</option>
                    <option value="Aquaculture Fishery Pond">🐟 Aquaculture Fishery Pond Biomass</option>
                    <option value="Poultry Flock">🐔 Poultry Flock</option>
                  </select>
                </div>
              )}
            </>
          )}

          {/* Mobile Number Input */}
          <div>
            <label className="block text-gray-700 mb-1">Mobile Number (मोबाइल नंबर) *</label>
            <div className="relative">
              <div className="absolute left-4 top-3.5 flex items-center gap-1 text-gray-500 font-bold text-xs">
                <span>+91</span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl pl-14 pr-4 py-3 text-sm text-gray-900 font-black tracking-wider focus:border-[#1B5E20] focus:outline-none"
              />
            </div>
          </div>

          {/* Mode Switch: Password vs OTP for Login */}
          {mode === 'login' && (
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="text-[11px] text-gray-500">Choose Sign-in Method:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('password'); setError(null); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${
                    loginMethod === 'password' ? 'bg-[#1B5E20] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('otp'); setError(null); }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black ${
                    loginMethod === 'otp' ? 'bg-[#1B5E20] text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  OTP SMS
                </button>
              </div>
            </div>
          )}

          {/* Password Input */}
          {(mode === 'register' || (mode === 'login' && loginMethod === 'password')) && (
            <div>
              <label className="block text-gray-700 mb-1">
                {mode === 'register' ? 'Set Password (पासवर्ड बनाएं) *' : 'Password (पासवर्ड) *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* OTP Input & Send Button */}
          {mode === 'login' && loginMethod === 'otp' && (
            <div className="space-y-2">
              <label className="block text-gray-700 mb-1">6-Digit OTP Code *</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="584291"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#FFFDF5] border-2 border-gray-300 rounded-2xl pl-11 pr-4 py-3 text-sm font-black tracking-widest text-gray-900 focus:border-[#1B5E20] focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="px-4 py-3 bg-[#E8F5E9] hover:bg-[#C8E6C9] border-2 border-[#1B5E20]/30 rounded-2xl text-[#1B5E20] text-xs font-black whitespace-nowrap transition-colors"
                >
                  {otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
              {otpSent && (
                <span className="text-[11px] text-[#1B5E20] font-bold block">
                  ✓ Demo OTP sent & auto-filled for instant verification.
                </span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-black text-sm shadow-xl transition-all flex items-center justify-center gap-2 mt-4"
          >
            <span>{mode === 'login' ? 'Secure Login to Portal' : 'Register & Enter Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-[10px] text-gray-500 font-bold border-t border-gray-100 pt-3">
          🔒 Certified by Ministry of Fisheries, Animal Husbandry & Dairying • Smart India Hackathon
        </p>
      </div>
    </div>
  );
};
