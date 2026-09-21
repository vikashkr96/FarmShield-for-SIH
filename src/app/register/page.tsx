'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { UserRoleMode } from '../../components/ui/Navbar';

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
  const toast = useToast();

  const [role, setRole] = useState<UserRoleMode>('farmer');
  const [loading, setLoading] = useState(false);

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Punjab');
  const [district, setDistrict] = useState('Ludhiana');

  // Farmer specific
  const [farmType, setFarmType] = useState('Dairy Cattle');
  const [herdSize, setHerdSize] = useState('25');

  // Vet specific
  const [licenseNo, setLicenseNo] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');

  const indianStates = [
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'West Bengal', label: 'West Bengal' },
  ];

  const farmTypes = [
    { value: 'Dairy Cattle', label: 'Dairy Cattle (Bovine)' },
    { value: 'Buffalo Farming', label: 'Buffalo Farm (Murrah/Nili-Ravi)' },
    { value: 'Aquaculture Shrimp', label: 'Aquaculture (Vannamei Shrimp)' },
    { value: 'Aquaculture Fish', label: 'Aquaculture (Carp/Pangasius)' },
    { value: 'Poultry Broiler', label: 'Commercial Poultry (Broiler)' },
    { value: 'Poultry Layer', label: 'Commercial Poultry (Layer)' },
    { value: 'Goat & Sheep', label: 'Caprine/Ovine (Goat & Sheep)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      toast.error('Missing fields', 'Please complete all required fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Weak password', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUpWithEmail(email, password, {
      name,
      phone: phone.startsWith('+91') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`,
      role,
      state,
      district,
      farmType: role === 'farmer' ? farmType : undefined,
      licenseNo: role === 'veterinarian' || role === 'vet' ? licenseNo : undefined,
    });
    setLoading(false);

    if (error) {
      toast.error('Registration failed', error);
    } else {
      toast.success('Registration successful', 'Your account has been created');
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-gray-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1B5E20] flex items-center justify-center text-white shadow-xl shadow-green-900/10 text-3xl">
            🛡️
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Create FarmShield Account
        </h2>
        <p className="mt-1.5 text-center text-sm text-gray-600">
          Register with National Digital Animal Health & MRL Tracking Network
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-gray-200/50 border border-gray-100 rounded-3xl">
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Select Your Official Role *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('farmer')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'farmer'
                    ? 'border-[#1B5E20] bg-green-50/60 ring-2 ring-[#1B5E20]'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">🐄</div>
                <p className="text-sm font-bold text-gray-900">Farmer / Producer</p>
                <p className="text-xs text-gray-500 mt-0.5">Livestock & aquaculture herd records</p>
              </button>

              <button
                type="button"
                onClick={() => setRole('vet')}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  role === 'veterinarian' || role === 'vet'
                    ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">🩺</div>
                <p className="text-sm font-bold text-gray-900">Veterinarian</p>
                <p className="text-xs text-gray-500 mt-0.5">VCI practitioner & prescriptions</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                required
                placeholder="e.g. Gurpreet Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Input
                label="Mobile Phone (+91)"
                type="tel"
                required
                placeholder="98765 43210"
                prefixText="+91"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="State / Union Territory"
                options={indianStates}
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              <Input
                label="District / Block"
                required
                placeholder="e.g. Ludhiana West"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              />
            </div>

            {role === 'farmer' && (
              <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100 space-y-3">
                <p className="text-xs font-bold text-[#1B5E20] uppercase tracking-wider">
                  Farm & Herd Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Select
                    label="Primary Enterprise"
                    options={farmTypes}
                    value={farmType}
                    onChange={(e) => setFarmType(e.target.value)}
                  />
                  <Input
                    label="Approximate Herd Size"
                    type="number"
                    value={herdSize}
                    onChange={(e) => setHerdSize(e.target.value)}
                  />
                </div>
              </div>
            )}

            {(role === 'veterinarian' || role === 'vet') && (
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  VCI Credentials
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="State/VCI Registration No."
                    required
                    placeholder="VCI/PB/2020/0123"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                  />
                  <Input
                    label="Hospital / Clinic Affiliation"
                    placeholder="Civil Vet Hospital / Private"
                    value={hospitalAffiliation}
                    onChange={(e) => setHospitalAffiliation(e.target.value)}
                  />
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" fullWidth loading={loading} className="mt-4">
              Register for FarmShield
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-[#1B5E20] hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
