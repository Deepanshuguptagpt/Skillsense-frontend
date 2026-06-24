'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/api';
import { APP_ROUTES } from '@/lib/constants';

function SignInContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === 'true';
  const { signIn, isSigningIn, signInError, resetSignInError } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resetSignInError();
    signIn({ email, password });
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* Decorative background blobs for mobile */}
      <div className="blob-violet absolute left-[-10%] top-[-10%] md:hidden"></div>
      <div className="blob-pink absolute bottom-[-10%] right-[-10%] md:hidden"></div>

      {/* Left Panel - Hero Gradient (hidden on mobile) */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 p-12 lg:flex lg:w-1/2">
        <div className="absolute right-0 top-0 h-[800px] w-[800px] -translate-y-1/2 translate-x-1/3 rounded-full bg-white opacity-5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/4 translate-y-1/3 rounded-full bg-pink-500 opacity-20 blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-3">
          <img
            src="/logo.png"
            alt="SkillSense Logo"
            className="h-10 w-10 brightness-200"
          />
          <span className="font-sora text-xl font-bold text-white">
            SkillSense
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="mb-6 font-sora text-3xl font-bold leading-tight text-white">
            Welcome back to your career intelligence hub.
          </h2>
          <p className="mb-8 text-base leading-relaxed text-indigo-100">
            Access your evidence-based skill profile, view updated internship
            matches, and continue your personalized learning journey.
          </p>
          <div className="space-y-4">
            {[
              'Real-time internship eligibility tracking',
              'AI-powered skill verification',
              'Personalized learning pathways',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-indigo-50">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm font-medium text-indigo-200">
            © {new Date().getFullYear()} SkillSense Inc.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="z-10 flex flex-1 flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 animate-fade-in text-center lg:hidden">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
              <img src="/logo.png" alt="Logo" className="h-7 w-7 brightness-200" />
            </div>
            <h1 className="font-sora text-2xl font-bold text-slate-900">
              Welcome Back
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to continue to SkillSense
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="mb-8 hidden lg:block">
            <h1 className="font-sora text-2xl font-bold text-slate-900">
              Sign In
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your details to access your account.
            </p>
          </div>

          {/* Registration success message */}
          {registered && (
            <div className="mb-6 animate-fade-in rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-100 p-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                </div>
                <p className="pt-0.5 text-sm font-bold text-emerald-800">
                  Account created successfully! Sign in below.
                </p>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {signInError && (
            <div className="mb-6 animate-fade-in rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full bg-red-100 p-1">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <p className="pt-0.5 text-sm font-bold text-red-800">
                  {getErrorMessage(signInError)}
                </p>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-violet-500">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-11"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link
                    href={APP_ROUTES.FORGOT_PASSWORD}
                    className="text-xs font-bold text-violet-600 hover:text-violet-700"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 transition-colors group-focus-within:text-violet-500">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input pl-11 pr-11"
                    placeholder="••••••••"
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
                disabled={isSigningIn}
                className="btn-primary mt-2 w-full py-3.5 text-base"
              >
                {isSigningIn ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                Don't have an account?{' '}
                <Link
                  href={APP_ROUTES.SIGNUP}
                  className="font-bold text-violet-600 transition-all hover:text-violet-700 hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Landing */}
          <div className="mt-8 text-center lg:hidden">
            <Link
              href="/landing"
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-slate-800"
            >
              <ArrowLeft className="h-4 w-4" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
