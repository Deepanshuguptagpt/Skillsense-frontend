'use client';

import { useRouter } from 'next/navigation';
import { Plus, Briefcase, BarChart2, Users, TrendingUp } from 'lucide-react';
import RecruiterLayout from '@/components/Layout/RecruiterLayout';
import JobAnalyticsPanel from '@/components/Recruiter/JobAnalyticsPanel';
import { APP_ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/lib/auth';

export default function RecruiterDashboardPage() {
  const router = useRouter();

  const { user } = useAuthStore();
  const firstName = user?.name?.split(' ')[0] || 'Recruiter';

  return (
    <RecruiterLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="font-sora text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Here's how your hiring pipeline is shaping up today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Dashboard
            </span>
            <button
              onClick={() => router.push(APP_ROUTES.RECRUITER_JOBS)}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-violet-700 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Post New Job
            </button>
          </div>
        </div>

        {/* Analytics */}
        <JobAnalyticsPanel />
      </div>
    </RecruiterLayout>
  );
}
