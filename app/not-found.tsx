'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { APP_ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/lib/auth';

export default function NotFound() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const homeRoute = user?.role === 'recruiter' ? APP_ROUTES.RECRUITER_DASHBOARD : APP_ROUTES.DASHBOARD;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-indigo-100">
          <Search className="h-16 w-16 text-indigo-400" />
        </div>

        <h1 className="text-7xl font-bold text-indigo-600 mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-slate-900 mb-3">Page not found</h2>
        <p className="text-slate-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
          {isAuthenticated ? (
            <Link
              href={homeRoute}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href={APP_ROUTES.SIGNIN}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Home className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
