import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import { 
  ShieldCheck, 
  Phone, 
  KeyRound, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Tractor, 
  Stethoscope, 
  Building2, 
  Upload, 
  AlertCircle,
  Clock,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const { setCurrentUser, users, showToast, t, language, setLanguage } = useApp();

  // Auth Modes
  const [loginMode, setLoginMode] = useState<'otp' | 'password'>('otp');
  const [authStep, setAuthStep] = useState<'phone_input' | 'otp_verify' | 'onboarding' | 'password_input' | 'forgot_password'>('phone_input');
  
  // Inputs
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Timer for OTP
  const [resendCooldown, setResendCooldown] = useState(30);
  const [otpExpiryMinutes, setOtpExpiryMinutes] = useState(5);
  
  // Selected Role during Registration
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  
  // Onboarding Form States
  const [fullName, setFullName] = useState('');
  // Farmer
  const [farmName, setFarmName] = useState('');
  const [state, setState] = useState('Haryana');
  const [district, setDistrict] = useState('Karnal');
  const [village, setVillage] = useState('');
  const [productionType, setProductionType] = useState<'dairy' | 'meat' | 'poultry' | 'aquaculture' | 'mixed'>('dairy');
  const [speciesReared, setSpeciesReared] = useState<string[]>(['Cattle', 'Buffalo']);
  // Vet
  const [licenseNumber, setLicenseNumber] = useState('');
  const [council, setCouncil] = useState('Veterinary Council of India (VCI)');
  const [clinicAffiliation, setClinicAffiliation] = useState('');
  const [uploadedDocName, setUploadedDocName] = useState('');
  // Admin
  const [department, setDepartment] = useState('Department of Animal Husbandry & Dairying (DAHD)');
  const [designation, setDesignation] = useState('MRL Surveillance Inspector');
  const [jurisdiction, setJurisdiction] = useState('Northern Region (Zone A)');
  const [inviteCode, setInviteCode] = useState('');

  // Handle Resend Cooldown
  useEffect(() => {
    let interval: any = null;
    if (authStep === 'otp_verify' && resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, resendCooldown]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      showToast('Invalid Phone Number', 'Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    if (loginMode === 'password') {
      setAuthStep('password_input');
    } else {
      setAuthStep('otp_verify');
      setResendCooldown(30);
      showToast('OTP Dispatched', 'Demo OTP is 123456 (valid for 5 minutes).', 'info');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      showToast('Incomplete OTP', 'Please enter all 6 digits of the verification code.', 'error');
      return;
    }

    // Check if phone matches an existing user
    const existing = users.find(u => u.phone.includes(phone.replace(/\s+/g, '')));
    if (existing) {
      setCurrentUser(existing);
      showToast('Welcome back!', `Logged in as ${existing.name} (${existing.role.toUpperCase()})`, 'success');
      onLoginSuccess();
    } else {
      // Proceed to Role Selection and Onboarding
      setAuthStep('onboarding');
      showToast('Phone Verified', 'Please complete your stakeholder profile registration.', 'success');
    }
  };

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = users.find(u => u.phone.includes(phone.replace(/\s+/g, '')));
    if (existing) {
      setCurrentUser(existing);
      showToast('Authentication Successful', `Welcome back, ${existing.name}!`, 'success');
      onLoginSuccess();
    } else {
      // Fallback
      const target = users[0];
      setCurrentUser(target);
      onLoginSuccess();
    }
  };

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName) {
      showToast('Required Field', 'Please enter your full name.', 'error');
      return;
    }

    const newUserId = `usr-${selectedRole}-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      phone: `+91 ${phone}`,
      name: fullName,
      role: selectedRole,
      status: selectedRole === 'vet' ? 'pending_verification' : 'active',
      avatar: selectedRole === 'farmer' 
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' 
        : selectedRole === 'vet' 
        ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150' 
        : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      farmName: selectedRole === 'farmer' ? farmName : undefined,
      farmId: selectedRole === 'farmer' ? `farm-custom-${Date.now()}` : undefined,
      state: selectedRole === 'farmer' ? state : undefined,
      district: selectedRole === 'farmer' ? district : undefined,
      village: selectedRole === 'farmer' ? village : undefined,
      productionType: selectedRole === 'farmer' ? productionType : undefined,
      speciesReared: selectedRole === 'farmer' ? speciesReared : undefined,
      licenseNumber: selectedRole === 'vet' ? licenseNumber : undefined,
      council: selectedRole === 'vet' ? council : undefined,
      clinicAffiliation: selectedRole === 'vet' ? clinicAffiliation : undefined,
      verificationRequestedAt: selectedRole === 'vet' ? new Date().toISOString().split('T')[0] : undefined,
      department: selectedRole === 'admin' ? department : undefined,
      designation: selectedRole === 'admin' ? designation : undefined,
      jurisdiction: selectedRole === 'admin' ? jurisdiction : undefined
    };

    setCurrentUser(newUser);

    if (selectedRole === 'vet') {
      showToast(
        'Registration Submitted for Approval',
        'Your veterinarian account is in "Pending Verification" status awaiting regulatory review.',
        'info'
      );
    } else {
      showToast('Onboarding Complete', `Welcome to AgriTrace, ${fullName}!`, 'success');
    }

    onLoginSuccess();
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const user = users.find(u => u.role === role) || users[0];
    setCurrentUser(user);
    showToast('Demo Access Granted', `Logged in as ${user.name} (${user.role.toUpperCase()})`, 'success');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex flex-col justify-between text-slate-100">
      
      {/* Top Bar */}
      <div className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">AgriTrace</span>
            <span className="text-[10px] text-teal-300 ml-2 font-mono uppercase bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
              National Portal
            </span>
          </div>
        </div>

        <button
          onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-teal-200 border border-white/10 transition"
        >
          {language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
        </button>
      </div>

      {/* Main Container */}
      <div className="max-w-xl w-full mx-auto px-4 py-8">
        
        {/* Quick Demo Login Pill Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-teal-500/30 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Demo Login:
            </span>
            <span className="text-[10px] text-slate-400">Pre-seeded accounts</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('farmer')}
              className="px-3 py-2 rounded-xl bg-emerald-600/80 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Tractor className="w-3.5 h-3.5" />
              Farmer
            </button>
            <button
              onClick={() => handleQuickDemoLogin('vet')}
              className="px-3 py-2 rounded-xl bg-teal-600/80 hover:bg-teal-600 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Veterinarian
            </button>
            <button
              onClick={() => handleQuickDemoLogin('admin')}
              className="px-3 py-2 rounded-xl bg-sky-700/80 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Building2 className="w-3.5 h-3.5" />
              Admin / DAHD
            </button>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200">
          
          {/* STEP 1: Phone Number & Mode Selection */}
          {authStep === 'phone_input' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                  National Livestock Portal Login
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Single digital gateway for Farmers, Veterinarians, and Regulatory Authorities.
                </p>
              </div>

              {/* Login Mode Tabs: OTP vs Password */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setLoginMode('otp')}
                  className={`py-2 rounded-lg transition ${
                    loginMode === 'otp' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Phone + OTP Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode('password')}
                  className={`py-2 rounded-lg transition ${
                    loginMode === 'password' ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Password Login
                </button>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="98120 45678"
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 font-mono text-sm tracking-wide"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Universal entry: If unregistered, we'll verify via OTP and guide you to role onboarding.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>{loginMode === 'otp' ? 'Send 6-Digit OTP' : 'Continue to Password'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {authStep === 'otp_verify' && (
            <div className="space-y-6">
              <div>
                <button
                  onClick={() => setAuthStep('phone_input')}
                  className="text-xs text-teal-700 hover:underline font-semibold mb-2 block"
                >
                  ← Change Mobile Number
                </button>
                <h2 className="text-2xl font-black text-slate-900">Enter Verification Code</h2>
                <p className="text-xs text-slate-500 mt-1">
                  We've sent a 6-digit OTP to <strong className="text-slate-800">+91 {phone}</strong> (Demo code: <span className="font-mono font-bold text-teal-700">123456</span>)
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-600 font-mono"
                  />
                ))}
              </div>

              {/* Resend Cooldown & Expiry */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Code expires in 5:00
                </span>

                {resendCooldown > 0 ? (
                  <span className="text-slate-400">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    onClick={() => {
                      setResendCooldown(30);
                      showToast('OTP Resent', 'Demo OTP is 123456', 'info');
                    }}
                    className="text-teal-700 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resend Code
                  </button>
                )}
              </div>

              <button
                onClick={handleVerifyOtp}
                className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Verify & Proceed</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 3: Password Login */}
          {authStep === 'password_input' && (
            <div className="space-y-6">
              <div>
                <button
                  onClick={() => setAuthStep('phone_input')}
                  className="text-xs text-teal-700 hover:underline font-semibold mb-2 block"
                >
                  ← Back to Phone
                </button>
                <h2 className="text-2xl font-black text-slate-900">Enter Password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Logging in for mobile number: <strong className="text-slate-800">+91 {phone}</strong>
                </p>
              </div>

              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthStep('otp_verify');
                      showToast('OTP Verification', 'Reset password using Phone OTP.', 'info');
                    }}
                    className="text-xs text-teal-700 font-semibold hover:underline"
                  >
                    Forgot Password? (Reset via OTP)
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition"
                >
                  Sign In
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: Stakeholder Role Selection & Onboarding Flow */}
          {authStep === 'onboarding' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">Select Stakeholder Role</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose your role in the livestock value chain to configure your customized dashboard.
                </p>
              </div>

              {/* 3 Distinct Role Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                {/* Card 1: Farmer */}
                <div
                  onClick={() => setSelectedRole('farmer')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition text-center flex flex-col items-center ${
                    selectedRole === 'farmer'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-sm">
                    <Tractor className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Farmer</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                    Livestock owner, dairy/meat producer
                  </p>
                </div>

                {/* Card 2: Veterinarian */}
                <div
                  onClick={() => setSelectedRole('vet')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition text-center flex flex-col items-center ${
                    selectedRole === 'vet'
                      ? 'border-teal-600 bg-teal-50/70 shadow-md ring-2 ring-teal-500/20'
                      : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center mb-2 shadow-sm">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Veterinarian</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                    VCI registered doctor / polyclinic
                  </p>
                </div>

                {/* Card 3: Admin */}
                <div
                  onClick={() => setSelectedRole('admin')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition text-center flex flex-col items-center ${
                    selectedRole === 'admin'
                      ? 'border-sky-700 bg-sky-50/70 shadow-md ring-2 ring-sky-500/20'
                      : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-800 text-white flex items-center justify-center mb-2 shadow-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900">Regulator / Govt</h4>
                  <p className="text-[10px] text-slate-500 mt-1 leading-tight">
                    DAHD / FSSAI surveillance officer
                  </p>
                </div>

              </div>

              {/* Dynamic Onboarding Form */}
              <form onSubmit={handleCompleteOnboarding} className="space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar / Dr. Ananya Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                {/* Farmer Specific Fields */}
                {selectedRole === 'farmer' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Farm Name</label>
                        <input
                          type="text"
                          value={farmName}
                          onChange={(e) => setFarmName(e.target.value)}
                          placeholder="e.g. Green Meadows Farm"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Production Type</label>
                        <select
                          value={productionType}
                          onChange={(e: any) => setProductionType(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                        >
                          <option value="dairy">Dairy Farm</option>
                          <option value="meat">Meat / Cattle</option>
                          <option value="poultry">Poultry (Broiler/Layer)</option>
                          <option value="mixed">Mixed Livestock</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">State</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">District</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Village</label>
                        <input
                          type="text"
                          value={village}
                          onChange={(e) => setVillage(e.target.value)}
                          placeholder="Nilokheri"
                          className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Vet Specific Fields */}
                {selectedRole === 'vet' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">VCI / State License No. *</label>
                      <input
                        type="text"
                        required
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="e.g. VCI-HAR-2024-8819"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Affiliated Clinic / Polyclinic</label>
                        <input
                          type="text"
                          value={clinicAffiliation}
                          onChange={(e) => setClinicAffiliation(e.target.value)}
                          placeholder="Central Vet Hospital"
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Veterinary Council</label>
                        <input
                          type="text"
                          value={council}
                          onChange={(e) => setCouncil(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <AlertCircle className="w-4 h-4 text-amber-700" />
                        Verification Notice
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Veterinarian accounts are assigned <strong>"Pending Verification"</strong> status upon registration until verified by the District Animal Husbandry Officer.
                      </p>
                    </div>
                  </>
                )}

                {/* Admin Specific Fields */}
                {selectedRole === 'admin' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Super-Admin Provisioning / Invite Code</label>
                      <input
                        type="password"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Enter 8-digit government provisioning token"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 mt-4"
                >
                  <span>Complete Onboarding & Enter Portal</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

      {/* Subtle Footer Note */}
      <div className="text-center py-4 text-xs text-slate-500">
        AgriTrace Digital Livestock Portal • Aligned with Ministry of FAHD (VASUDHA Architecture)
      </div>

    </div>
  );
};
