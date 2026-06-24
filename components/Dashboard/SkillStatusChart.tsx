'use client';

import { useMemo } from 'react';
import { SkillNode, SkillStatus } from '@/types';
import { CheckCircle, Clock, Award, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SkillStatusChartProps {
  skills: SkillNode[];
}

export default function SkillStatusChart({ skills }: SkillStatusChartProps) {
  const statusData = useMemo(() => {
    const verified = skills.filter((s) => s.status === SkillStatus.VERIFIED).length;
    const inProgress = skills.filter((s) => s.status === SkillStatus.IN_PROGRESS).length;
    const claimed = skills.filter((s) => s.status === SkillStatus.CLAIMED).length;
    const total = skills.length || 1;

    return [
      {
        status: 'Verified',
        count: verified,
        percentage: (verified / total) * 100,
        color: 'bg-emerald-500',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        icon: CheckCircle,
      },
      {
        status: 'In Progress',
        count: inProgress,
        percentage: (inProgress / total) * 100,
        color: 'bg-amber-500',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        icon: Clock,
      },
      {
        status: 'Claimed',
        count: claimed,
        percentage: (claimed / total) * 100,
        color: 'bg-slate-500',
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-700',
        icon: Award,
      },
    ];
  }, [skills]);

  return (
    <div className="card bg-gradient-to-br from-purple-50/50 to-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Skill Status Distribution
        </h3>
        <Target className="h-5 w-5 text-purple-600" />
      </div>

      <div className="space-y-4">
        {statusData.map((data) => (
          <div key={data.status} className="group">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={cn("rounded-lg p-2", data.bgColor)}>
                  <data.icon className={cn("h-4 w-4", data.textColor)} />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  {data.status}
                </span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{data.count}</div>
                <div className="text-xs text-gray-500">
                  {data.percentage.toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn("h-full rounded-full transition-all duration-700", data.color)}
                style={{ width: `${data.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-50">
          <span className="text-sm text-gray-600">Total Skills:</span>
          <span className="text-2xl font-bold text-gray-900">{skills.length}</span>
        </div>
      </div>
    </div>
  );
}
