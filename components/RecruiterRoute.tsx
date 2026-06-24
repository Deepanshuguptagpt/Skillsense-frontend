'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { APP_ROUTES } from '@/lib/constants';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function RecruiterRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Give localStorage time to hydrate
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mounted && !isChecking) {
      if (!isAuthenticated) {
        router.push(APP_ROUTES.SIGNIN);
      } else if (user?.role !== 'recruiter') {
        router.push(APP_ROUTES.DASHBOARD);
      }
    }
  }, [mounted, isChecking, isAuthenticated, user, router]);

  if (!mounted || isChecking || !isAuthenticated || user?.role !== 'recruiter') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto" />
          <p className="mt-4 text-slate-500 font-medium">Verifying recruiter access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
