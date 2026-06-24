'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Lock,
  User,
  Loader2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getErrorMessage } from '@/lib/api';
import { APP_ROUTES } from '@/lib/constants';

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {message}
    </p>
  );
}

function inputCls(hasError: boolean) {
  return `input w-full pl-10 ${hasError ? 'border-red-400 focus:ring-red-400 bg-red-50' : ''}`;
}

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');

  // Touched state for inline validation
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState('');

  const { signUp, isSigningUp, signUpError, resetSignUpError } = useAuth();

  // Inline validation
  const errors: Record<string, string> = {};
  if (touched.name && !name.trim()) errors.name = 'Full name is required';
  if (touched.email && !email.trim()) errors.email = 'Email is required';
  if (touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Enter a valid email address';
  if (touched.password && password.length < 8)
    errors.password = 'Password must be at least 8 characters';
  if (touched.confirmPassword && confirmPassword !== password)
    errors.confirmPassword = 'Passwords do not match';

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    resetSignUpError();

    // Touch all fields to show errors
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (
      !name.trim() ||
      !email.trim() ||
      password.length < 8 ||
      confirmPassword !== password
    )
      return;

    try {
      await signUp({ name: name.trim(), email: email.trim(), password, role });
    } catch {
      // handled by useAuth
    }
  };

  const displayError =
    submitError || (signUpError ? getErrorMessage(signUpError) : '');
  const passwordStrength =
    password.length === 0
      ? 0
      : password.length < 8
        ? 1
        : password.length < 12
          ? 2
          : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];

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
            Join the evidence-based career revolution.
          </h2>
          <p className="mb-8 text-base leading-relaxed text-indigo-100">
            Stop guessing what skills you need. Start building a verified
            profile that matches you with actual internships.
          </p>
          <div className="space-y-4">
            {[
              'Upload resume for instant skill extraction',
              'Take technical quizzes to verify abilities',
              'Get matched with FAANG and top startups',
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
      <div className="z-10 flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 lg:p-12">
        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="mb-8 animate-fade-in text-center lg:hidden">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-violet-600">
              <img src="/logo.png" alt="Logo" className="h-7 w-7 brightness-200" />
            </div>
            <h1 className="font-sora text-2xl font-bold text-slate-900">
              Create Account
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Join SkillSense to unlock opportunities
            </p>
          </div>

          {/* Desktop Heading */}
          <div className="mb-8 hidden lg:block">
            <h1 className="font-sora text-2xl font-bold text-slate-900">
              Create Account
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Join SkillSense to unlock opportunities
            </p>
          </div>

          {/* Error Alert */}
          {displayError && (
            <div className="mb-6 animate-fade-in rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full bg-red-100 p-1">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
                <p className="pt-0.5 text-sm font-bold text-red-800">
                  {displayError}
                </p>
              </div>
            </div>
          )}

          {/* Sign Up Form */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Role selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['candidate', 'recruiter'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex items-center gap-2 rounded-xl border-2 p-3 text-sm font-bold transition-all ${
                        role === r
                          ? 'border-violet-600 bg-violet-50 text-violet-700'
                          : 'border-slate-100 bg-white text-slate-500 hover:border-violet-200 hover:bg-slate-50'
                      }`}
                    >
                      {r === 'candidate' ? (
                        <GraduationCap
                          className={`h-4 w-4 ${role === r ? 'text-violet-600' : 'text-slate-400'}`}
                        />
                      ) : (
                        <Briefcase
                          className={`h-4 w-4 ${role === r ? 'text-violet-600' : 'text-slate-400'}`}
                        />
                      )}
                      {r === 'candidate' ? 'Candidate' : 'Recruiter'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full Name
                </label>
                <div className="group relative">
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors ${errors.name ? 'text-red-500' : 'text-slate-400 group-focus-within:text-violet-500'}`}
                  >
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => touch('name')}
                    className={`${inputCls(!!errors.name)} pl-11`}
                    placeholder="John Doe"
                  />
                </div>
                <FieldError message={errors.name} />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <div className="group relative">
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors ${errors.email ? 'text-red-500' : 'text-slate-400 group-focus-within:text-violet-500'}`}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => touch('email')}
                    className={`${inputCls(!!errors.email)} pl-11`}
                    placeholder="you@example.com"
                  />
                </div>
                <FieldError message={errors.email} />
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="group relative">
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors ${errors.password ? 'text-red-500' : 'text-slate-400 group-focus-within:text-violet-500'}`}
                  >
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => touch('password')}
                    className={`${inputCls(!!errors.password)} pl-11 pr-11`}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-violet-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex flex-1 gap-1">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all ${
                            i <= passwordStrength
                              ? strengthColor[passwordStrength]
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        passwordStrength === 1
                          ? 'text-red-500'
                          : passwordStrength === 2
                            ? 'text-amber-500'
                            : 'text-emerald-600'
                      }`}
                    >
                      {strengthLabel[passwordStrength]}
                    </span>
                  </div>
                )}
                <FieldError message={errors.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="group relative">
                  <div
                    className={`pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 transition-colors ${errors.confirmPassword ? 'text-red-500' : 'text-slate-400 group-focus-within:text-violet-500'}`}
                  >
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => touch('confirmPassword')}
                    className={`${inputCls(!!errors.confirmPassword)} pl-11 pr-11`}
                    placeholder="Repeat password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-violet-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <FieldError message={errors.confirmPassword} />
              </div>

              <button
                type="submit"
                disabled={isSigningUp}
                className="btn-primary mt-4 w-full py-3.5 text-base"
              >
                {isSigningUp ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                Already have an account?{' '}
                <Link
                  href={APP_ROUTES.SIGNIN}
                  className="font-bold text-violet-600 transition-all hover:text-violet-700 hover:underline"
                >
                  Sign in
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
