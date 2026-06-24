'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Briefcase, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { APP_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface InternshipMatchChartProps {
  eligible: number;
  almostEligible: number;
  notEligible: number;
}

export default function InternshipMatchChart({
  eligible,
  almostEligible,
  notEligible,
}: InternshipMatchChartProps) {
  const total = eligible + almostEligible + notEligible || 1;

  const data = [
    {
      label: 'Eligible Now',
      count: eligible,
      percentage: (eligible / total) * 100,
      color: 'bg-emerald-500',
      icon: Briefcase,
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      description: 'Ready to apply',
    },
    {
      label: 'Almost There',
      count: almostEligible,
      percentage: (almostEligible / total) * 100,
      color: 'bg-amber-500',
      icon: TrendingUp,
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      description: 'Few skills away',
    },
    {
      label: 'Build Skills',
      count: notEligible,
      percentage: (notEligible / total) * 100,
      color: 'bg-slate-400',
      icon: AlertCircle,
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-50',
      description: 'Use SkillGenie',
    },
  ];

  return (
    <div className="card bg-gradient-to-br from-indigo-50/50 to-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Internship Opportunities
        </h3>
        <Link
          href={APP_ROUTES.INTERNSHIPS}
          className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.label} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn("rounded-lg p-2", item.bgColor)}>
                  <item.icon className={cn("h-4 w-4", item.textColor)} />
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900 block">
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-500">{item.description}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">{item.count}</div>
                <div className="text-xs text-gray-500">
                  {item.percentage.toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn("h-full rounded-full transition-all duration-700 group-hover:scale-x-105", item.color)}
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-50">
          <Briefcase className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-600">Total Opportunities:</span>
          <span className="text-2xl font-bold text-gray-900">
            {eligible + almostEligible + notEligible}
          </span>
        </div>
      </div>
    </div>
  );
}
