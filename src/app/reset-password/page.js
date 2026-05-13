'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { forgotPassword, resetPassword } from '@/lib/api';
import toast from 'react-hot-toast';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await forgotPassword(email);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Password reset link sent to your email!');
      }
    } catch {
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, password);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Password reset successful! Please login.');
        router.push('/login');
      }
    } catch {
      toast.error('Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <Image src="/images/alameen.jpeg" alt="Logo" width={130} height={50} />
        </div>

        {token ? (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Reset Password
            </h1>
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Confirm new password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Forgot Password
            </h1>
            <form onSubmit={handleForgot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <div className="mt-4 text-center">
          <Link href="/login" className="text-sm text-amber-600 hover:text-amber-700">
            Back to login
          </Link>
        </div>

        <div className="mt-2 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

