'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, TrendingUp, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InternshipMatch } from '@/types';

// Compute top skills that appear most as missing across almost+not-eligible internships
function getTopGaps(
  almostEligible: InternshipMatch[],
  notEligible: InternshipMatch[]
): { skill: string; count: number; companies: string[] }[] {
  const map = new Map<string, { count: number; companies: Set<string> }>();

  for (const m of [...almostEligible, ...notEligible]) {
    for (const s of m.missingSkills || []) {
      const name = typeof s === 'string' ? s : s.skillName;
      if (!name) continue;
      const key = name.toLowerCase();
      if (!map.has(key)) map.set(key, { count: 0, companies: new Set() });
      const entry = map.get(key)!;
      entry.count += 1;
      const co = m.internship.company;
      if (co && entry.companies.size < 4) entry.companies.add(co);
    }
  }

  return [...map.entries()]
    .map(([, v], i) => ({
      skill: [...map.keys()][i],
      count: v.count,
      companies: [...v.companies],
    }))
    // rebuild with correct skill name from original keys
    .map((_, i) => {
      const [key, val] = [...map.entries()][i];
      // Capitalize skill name from original data
      const originalEntry = [...almostEligible, ...notEligible]
        .flatMap((m) => m.missingSkills || [])
        .map((s) => (typeof s === 'string' ? s : s.skillName))
        .find((n) => n?.toLowerCase() === key);
      return {
        skill: originalEntry || key,
        count: val.count,
        companies: [...val.companies],
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

interface Props {
  almostEligible: InternshipMatch[];
  notEligible: InternshipMatch[];
  eligibleCount: number;
}

export default function SkillUnlockImpact({ almostEligible, notEligible, eligibleCount }: Props) {
  const router = useRouter();
  const gaps = getTopGaps(almostEligible, notEligible);

  if (gaps.length === 0) return null;

  const topGap = gaps[0];
  const rest = gaps.slice(1, 4);

  return (
    <div className="space-y-3">
      {/* Section heading */}
      <div className="flex items-center justify-between">
        <h2 className="font-sora text-base font-bold text-slate-900">Your Next Move</h2>
        <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
          Gap Analysis
        </span>
      </div>

      {/* Hero card — top skill */}
      <div
        onClick={() => router.push(`/skillgenie?mode=unlock&skill=${encodeURIComponent(topGap.skill)}`)}
        className="group cursor-pointer rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 transition-all hover:border-violet-300 hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-600 shadow-sm shadow-violet-200">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-500">
                Highest impact gap
              </p>
              <p className="mt-0.5 text-lg font-bold text-slate-900">{topGap.skill}</p>
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-col items-end">
            <p className="text-2xl font-extrabold text-violet-700 leading-none">+{topGap.count}</p>
            <p className="mt-0.5 text-[10px] font-medium text-slate-400">internships</p>
          </div>
        </div>

        {topGap.companies.length > 0 && (
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Required by{' '}
            <span className="font-semibold text-slate-700">
              {topGap.companies.slice(0, 3).join(', ')}
            </span>
            {topGap.companies.length > 3 && ` and ${topGap.count - 3} more`}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-violet-700 group-hover:text-violet-800">
            <Sparkles className="h-3.5 w-3.5" />
            Start learning with SkillGenie
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* Secondary skills — compact list */}
      {rest.length > 0 && (
        <div className="space-y-2">
          {rest.map((gap, i) => {
            const widthPct = Math.round((gap.count / topGap.count) * 100);
            return (
              <button
                key={gap.skill}
                onClick={() => router.push(`/skillgenie?mode=unlock&skill=${encodeURIComponent(gap.skill)}`)}
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-all hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-sm"
              >
                {/* Rank dot */}
                <span className={cn(
                  'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                  i === 0 ? 'bg-indigo-100 text-indigo-600' :
                  i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-500'
                )}>
                  {i + 2}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-bold text-slate-800">{gap.skill}</span>
                    <span className="flex-shrink-0 text-xs font-bold text-indigo-600">+{gap.count}</span>
                  </div>
                  {/* Impact bar */}
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500 transition-all duration-700"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  {gap.companies.length > 0 && (
                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {gap.companies.slice(0, 3).join(' · ')}
                    </p>
                  )}
                </div>

                <Lock className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 group-hover:text-violet-400 transition-colors" />
              </button>
            );
          })}
        </div>
      )}

      {/* CTA footer */}
      <button
        onClick={() => router.push('/internships')}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-600 transition-all hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      >
        View all internships
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
