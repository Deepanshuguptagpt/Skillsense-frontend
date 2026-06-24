'use client';

import React from 'react';
import { Users, CheckCircle, Target, TrendingUp } from 'lucide-react';

interface StatsProps {
  totalCandidates: number;
  shortlistedCount: number;
  avgMatchScore: number;
  activeJobs: number;
}

const AnalyticsCards: React.FC<StatsProps> = ({ totalCandidates, shortlistedCount, avgMatchScore, activeJobs }) => {
  const stats = [
    {
      label: 'Total Applicants',
      value: totalCandidates,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Shortlisted',
      value: shortlistedCount,
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Avg. Match Score',
      value: `${Math.round(avgMatchScore)}%`,
      icon: Target,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Active Jobs',
      value: activeJobs,
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
            <div className={`rounded-xl p-2.5 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsCards;
