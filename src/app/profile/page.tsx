'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Navbar } from '../../components/ui/Navbar';
import { GovHeader } from '../../components/ui/GovHeader';
import { Sidebar } from '../../components/layout/Sidebar';
import { MobileNav } from '../../components/layout/MobileNav';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, switchRole, permissions } = useAuth();
  const toast = useToast();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || '');

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out', 'You have been signed out of FarmShield');
    router.push('/login');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    toast.success('Profile Saved', 'Your demographic updates have been stored');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <GovHeader />
      <Navbar currentRole={user?.role || 'farmer'} />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-8 max-w-5xl mx-auto w-full pb-24 lg:pb-8">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Account & Credentials
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                National Livestock Health ID & Role Permissions Profile
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
              <Button
                variant="danger"
                onClick={handleLogout}
              >
                Sign Out
              </Button>
            </div>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <Avatar name={user?.name || 'User'} size="xl" status="online" />

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900">
                    {user?.name || 'Guest Evaluator'}
                  </h2>
                  <Badge variant={user?.role === 'veterinarian' || user?.role === 'vet' ? 'info' : user?.role === 'admin' ? 'warning' : 'success'}>
                    {user?.role?.toUpperCase() || 'FARMER'}
                  </Badge>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-mono">
                    ID: {user?.id?.slice(0, 12) || 'DEMO-USER'}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  {user?.farmType || 'Livestock Farm Enterprise'} • {user?.district || 'District'}, {user?.state || 'Punjab'}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {user?.email || 'authenticated@farmshield.gov.in'} • {user?.phone || '+91 98765 43210'}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200/80 flex flex-col gap-1.5 self-stretch sm:self-center">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Quick Switch Role
                </span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => switchRole('farmer')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      user?.role === 'farmer' ? 'bg-[#1B5E20] text-white' : 'bg-white border text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Farmer
                  </button>
                  <button
                    onClick={() => switchRole('veterinarian')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      user?.role === 'veterinarian' || user?.role === 'vet' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Vet
                  </button>
                  <button
                    onClick={() => switchRole('admin')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors ${
                      user?.role === 'admin' ? 'bg-amber-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📍</span> Demographic & Location
              </h3>
              {editing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Input
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <Input
                    label="District / Block"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    Save Changes
                  </Button>
                </form>
              ) : (
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <dt className="text-gray-500">State / Territory</dt>
                    <dd className="font-semibold text-gray-900">{user?.state || 'Punjab'}</dd>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <dt className="text-gray-500">District / Tehsil</dt>
                    <dd className="font-semibold text-gray-900">{user?.district || 'Ludhiana'}</dd>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-100">
                    <dt className="text-gray-500">Farm / Clinic ID</dt>
                    <dd className="font-mono font-semibold text-[#1B5E20]">
                      {user?.farmId || user?.licenseNo || 'PB-LDH-2024-001'}
                    </dd>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <dt className="text-gray-500">Security Provider</dt>
                    <dd className="font-medium text-gray-700 capitalize">
                      {user?.authProvider || 'Supabase Auth (PBKDF2)'}
                    </dd>
                  </div>
                </dl>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🔐</span> Access Permissions Matrix
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <span className="text-sm font-medium text-gray-800">Prescription Authoring</span>
                  {permissions.canPrescribe ? (
                    <Badge variant="success">Authorized (VCI)</Badge>
                  ) : (
                    <Badge variant="error">Restricted (Vet Only)</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <span className="text-sm font-medium text-gray-800">Official Lab Verification</span>
                  {permissions.canVerifyLab ? (
                    <Badge variant="success">Authorized</Badge>
                  ) : (
                    <Badge variant="error">Restricted</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <span className="text-sm font-medium text-gray-800">Syndromic Outbreak Reporting</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50">
                  <span className="text-sm font-medium text-gray-800">MRL Withdrawal Tracking</span>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </Card>
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
