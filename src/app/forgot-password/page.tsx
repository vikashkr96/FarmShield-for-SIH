'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../providers/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email required', 'Please enter your registered email address');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);

    if (error) {
      toast.error('Failed to send link', error);
    } else {
      setSubmitted(true);
      toast.success('Check your email', 'Password reset instructions have been sent');
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
          Reset your password
        </h2>
        <p className="mt-1.5 text-center text-sm text-gray-600">
          Enter your email to receive secure recovery credentials
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-gray-200/50 border border-gray-100 rounded-3xl">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                required
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                helperText="We will send you a one-time cryptographic reset link."
              />

              <Button type="submit" variant="primary" fullWidth loading={loading}>
                Send Password Reset Link
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-[#1B5E20] flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <h3 className="text-base font-bold text-gray-900">Reset Email Dispatched</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                If an account exists for <strong className="text-gray-900">{email}</strong>, you will receive an email shortly with instructions to reset your password.
              </p>
              <Button variant="outline" fullWidth onClick={() => setSubmitted(false)}>
                Resend to another email
              </Button>
            </div>
          )}

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
