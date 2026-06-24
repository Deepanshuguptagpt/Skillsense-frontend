'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Loader2, AlertCircle, ArrowLeft, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { APP_ROUTES } from '@/lib/constants';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { forgotPassword, resetPassword, isRequestingReset, isResettingPassword } = useAuth();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    try {
      await forgotPassword(email);
      setStep(2);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to send reset code');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (code.length < 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      await resetPassword({ email, code, new_password: newPassword });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Failed to reset password');
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      <div className="blob-violet absolute left-[-10%] top-[-10%] opacity-40"></div>
      <div className="blob-pink absolute bottom-[-10%] right-[-10%] opacity-40"></div>

      <div className="z-10 flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-md py-8">
          
          <div className="mb-8 text-center animate-fade-in">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-sora text-3xl font-bold text-slate-900">
              Reset Password
            </h1>
            <p className="mt-2 font-medium text-slate-500">
              {step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code and your new password'}
            </p>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
            {error && (
              <div className="mb-6 animate-fade-in rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-full bg-red-100 p-1">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="pt-0.5 text-sm font-bold text-red-800">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Email address
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-violet-500">
                      <Mail className="h-5 w-5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input w-full pl-11"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRequestingReset}
                  className="btn-primary w-full py-3.5 text-base shadow-sm"
                >
                  {isRequestingReset ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    'Send Reset Code'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').substring(0, 6))}
                    className="input w-full"
                    placeholder="6-digit code"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    New Password
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-violet-500">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input w-full pl-11 pr-11"
                      placeholder="Min. 8 characters"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-violet-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isResettingPassword}
                  className="btn-primary w-full py-3.5 text-base shadow-sm"
                >
                  {isResettingPassword ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-8 text-center">
            <Link
              href={APP_ROUTES.SIGNIN}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

