'use client';

import { TrendingUp, Target, Zap } from 'lucide-react';
import { useSkillPriorities } from '@/hooks/useIntelligence';

interface SkillPriority {
  skillName: string;
  mandatory: boolean;
  reasoning?: string;
  priorityScore?: number;
  internshipsUnlocked: number;
}

export default function SkillPrioritiesWidget() {
  const { data: priorities, isLoading } = useSkillPriorities(5);

  if (isLoading) {
    return (
      <div className="card">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Skills to Focus On
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            Loading recommendations...
          </p>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!priorities || priorities.length === 0) {
    return (
      <div className="card-glass p-6 flex flex-col border border-slate-200">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
            <Target className="h-4 w-4 text-indigo-600" />
          </div>
          <h3 className="font-sora text-sm font-bold text-slate-900">
            Skills to Focus On
          </h3>
        </div>
        <p className="flex-1 text-sm font-medium text-slate-500">
          Complete your profile to get personalized recommendations
        </p>
      </div>
    );
  }

  return (
    <div className="card-glass p-6 flex flex-col border border-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-indigo-200 bg-indigo-100 shadow-inner">
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-sora text-base font-bold text-slate-900">
              Skills to Focus On
            </h3>
            <p className="text-xs font-medium text-slate-500">
              AI-prioritized learning path
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {priorities.map((skill: SkillPriority, index: number) => (
          <div
            key={skill.skillName}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
          >
            <div className="absolute right-0 top-0 h-full w-1.5 bg-gradient-to-b from-indigo-500 to-violet-500 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 text-base font-bold text-indigo-700 shadow-sm">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900">
                    {skill.skillName}
                  </h4>
                  {skill.mandatory && (
                    <span className="rounded-lg border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
                      Required
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-600">
                  {skill.reasoning || 'High impact skill for your career goals'}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50 px-2 py-1 text-amber-700">
                    <Zap className="h-3.5 w-3.5" />
                    <span>Priority {skill.priorityScore || 0}</span>
                  </div>
                  {skill.internshipsUnlocked > 0 && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-emerald-700">
                      <TrendingUp className="h-3.5 w-3.5" />
                      <span>{skill.internshipsUnlocked} internships</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
