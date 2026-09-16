'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword } = useAuth();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('Weak password', 'Password must be at least 6 characters long');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mismatch', 'Passwords do not match');
      return;
    }

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);

    if (error) {
      toast.error('Reset failed', error);
    } else {
      toast.success('Password updated', 'Your password has been changed successfully');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/50 via-white to-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1B5E20] flex items-center justify-center text-white shadow-xl shadow-green-900/10 text-3xl">
            🛡️
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-extrabold text-gray-900 tracking-tight">
          Create New Password
        </h2>
        <p className="mt-1.5 text-center text-sm text-gray-600">
          Enter your new secure password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-gray-200/50 border border-gray-100 rounded-3xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              required
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Update Password & Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-xs font-semibold text-[#1B5E20] hover:underline">
              ← Return to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
