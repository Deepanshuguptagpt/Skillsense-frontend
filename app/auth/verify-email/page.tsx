'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/api';
import { APP_ROUTES } from '@/lib/constants';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(60); // 60 seconds resend cooldown
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { verifyEmail, resendCode, isVerifyingEmail } = useAuth();

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  // Sync email search parameter
  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [emailParam]);

  // Focus the first input field on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Focus next input if a number is entered
    if (val && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      
      // If current field is empty, delete previous field value and focus previous field
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();
    
    // Check if it is a 6-digit number
    if (/^\d{6}$/.test(pasteData)) {
      const pasteArray = pasteData.split('');
      setOtp(pasteArray);
      
      // Focus the last input
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter all 6 digits of the verification code.');
      return;
    }

    if (!email) {
      setError('Email address is missing. Please return to signup.');
      return;
    }

    try {
      await verifyEmail({ email, code });
      setSuccess(true);
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    
    setIsResending(true);
    setError('');
    
    try {
      await resendCode(email);
      setCooldown(60); // Reset 60s cooldown
    } catch (err: any) {
      setError(getErrorMessage(err) || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* Decorative background blobs */}
      <div className="blob-violet absolute left-[-10%] top-[-10%] opacity-40"></div>
      <div className="blob-pink absolute bottom-[-10%] right-[-10%] opacity-40"></div>

      <div className="z-10 flex flex-1 flex-col items-center justify-center p-6">
        <div className="w-full max-w-md py-8">
          
          {/* Header */}
          <div className="mb-8 text-center animate-fade-in">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>
            <h1 className="font-sora text-3xl font-bold text-slate-900">
              Verify Your Email
            </h1>
            <p className="mt-2 font-medium text-slate-500">
              We sent a 6-digit verification code to
            </p>
            {email && (
              <p className="mt-1 font-bold text-violet-600 truncate max-w-full px-4">
                {email}
              </p>
            )}
          </div>

          {/* Success State */}
          {success ? (
            <div className="rounded-3xl border border-emerald-100 bg-white/90 p-8 text-center shadow-xl backdrop-blur-xl animate-scale-up">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h2 className="font-sora text-xl font-bold text-slate-900">Email Verified!</h2>
              <p className="mt-2 text-sm text-slate-500">
                Your account has been verified and activated. Redirecting you to onboarding...
              </p>
              <div className="mt-6">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-violet-600" />
              </div>
            </div>
          ) : (
            /* Code Entry Form */
            <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-xl">
              
              {/* Error Alert */}
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

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email entry field if not prefilled */}
                {!emailParam && (
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
                )}

                {/* 6-Digit OTP inputs */}
                <div>
                  <label className="mb-3 block text-center text-sm font-bold text-slate-700">
                    Enter Verification Code
                  </label>
                  <div className="flex justify-between gap-2 md:gap-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        onChange={(e) => handleChange(e.target, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        onPaste={idx === 0 ? handlePaste : undefined}
                        className="h-12 w-12 rounded-xl border border-slate-200 bg-white text-center text-xl font-bold text-slate-800 shadow-sm transition-all focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 md:h-14 md:w-14"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingEmail || otp.join('').length < 6}
                  className="btn-primary w-full py-3.5 text-base shadow-sm"
                >
                  {isVerifyingEmail ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    'Verify Account'
                  )}
                </button>
              </form>

              {/* Resend Actions */}
              <div className="mt-8 text-center border-t border-slate-100 pt-6">
                <p className="text-sm font-medium text-slate-500">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0 || isResending || !email}
                  className={`mt-2 inline-flex items-center gap-2 font-bold text-sm transition-all ${
                    cooldown > 0 || isResending || !email
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-violet-600 hover:text-violet-700 hover:underline'
                  }`}
                >
                  {isResending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4" />
                  )}
                  {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Verification Code'}
                </button>
              </div>

            </div>
          )}

          {/* Navigation Links */}
          <div className="mt-8 text-center">
            <Link
              href={APP_ROUTES.SIGNUP}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Sign Up
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}

