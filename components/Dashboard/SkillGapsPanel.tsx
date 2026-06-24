'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReadiness, SkillGap } from '@/hooks/useReadiness';

const SEVERITY_CONFIG = {
  critical: {
    label: 'Critical',
    icon: AlertTriangle,
    badgeCls: 'bg-red-100 text-red-700',
    textCls: 'text-red-700',
    borderCls: 'border-red-200',
    bgCls: 'bg-red-50',
  },
  moderate: {
    label: 'Moderate',
    icon: AlertCircle,
    badgeCls: 'bg-amber-100 text-amber-700',
    textCls: 'text-amber-700',
    borderCls: 'border-amber-200',
    bgCls: 'bg-amber-50',
  },
  minor: {
    label: 'Minor',
    icon: Info,
    badgeCls: 'bg-blue-100 text-blue-700',
    textCls: 'text-blue-700',
    borderCls: 'border-blue-200',
    bgCls: 'bg-blue-50',
  },
};

function GapRow({ gap }: { gap: SkillGap }) {
  const cfg = SEVERITY_CONFIG[gap.gap_severity] ?? SEVERITY_CONFIG.minor;
  const Icon = cfg.icon;
  const currentPct = gap.current_proficiency;
  const requiredPct = gap.required_proficiency;

  return (
    <div
      className={`rounded-xl border ${cfg.borderCls} ${cfg.bgCls}/50 p-4 transition-all hover:bg-white hover:shadow-sm`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <div className={`rounded-lg p-1.5 ${cfg.badgeCls}`}>
            <Icon className="h-4 w-4 flex-shrink-0" />
          </div>
          <span className="truncate text-sm font-bold text-slate-800">
            {gap.skill_name}
          </span>
        </div>
        <span
          className={cn(`flex-shrink-0 rounded-lg border px-2.5 py-1 text-xs font-bold bg-white shadow-sm`, cfg.borderCls, cfg.textCls)}
        >
          {cfg.label}
        </span>
      </div>

      {/* Confidence bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
          <span>
            Current: <span className="text-slate-800">{currentPct}%</span>
          </span>
          <span>
            Need: <span className="text-slate-800">{requiredPct}%</span>
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200/50 shadow-inner">
          {/* Required marker */}
          <div
            className="absolute top-0 z-10 h-full w-1 bg-slate-400"
            style={{ left: `${requiredPct}%` }}
          />
          {/* Current progress */}
          <div
            className={`h-full rounded-full transition-all ${gap.gap_severity === 'critical' ? 'bg-gradient-to-r from-red-400 to-red-500' : gap.gap_severity === 'moderate' ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}
            style={{ width: `${Math.min(currentPct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function SkillGapsPanel() {
  const { readiness, isLoading } = useReadiness();
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className="card animate-pulse space-y-3">
        <div className="h-4 w-32 rounded bg-slate-100" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  const gaps = readiness?.gaps ?? [];

  if (gaps.length === 0) {
    return (
      <div className="card-glass p-6 flex flex-col border border-slate-200">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <h3 className="font-sora text-sm font-bold text-slate-900">
            Skill Gaps
          </h3>
        </div>
        <p className="flex-1 text-sm font-medium text-slate-500">
          {readiness
            ? 'No skill gaps detected — great work!'
            : 'Set a target role to see your skill gaps.'}
        </p>
      </div>
    );
  }

  // Sort: critical first, then moderate, then minor
  const order = { critical: 0, moderate: 1, minor: 2 };
  const sorted = [...gaps].sort(
    (a, b) => (order[a.gap_severity] ?? 3) - (order[b.gap_severity] ?? 3)
  );

  const shown = isExpanded ? sorted : sorted.slice(0, 5);
  const criticalCount = gaps.filter(
    (g) => g.gap_severity === 'critical'
  ).length;
  const moderateCount = gaps.filter(
    (g) => g.gap_severity === 'moderate'
  ).length;

  return (
    <div className="card-glass p-6 flex flex-col border border-slate-200">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-200 bg-amber-100 shadow-inner">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <h3 className="font-sora text-base font-bold text-slate-900">
            Skill Gaps
          </h3>
        </div>
        <div className="flex gap-2">
          {criticalCount > 0 && (
            <span className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 shadow-sm">
              {criticalCount} critical
            </span>
          )}
          {moderateCount > 0 && (
            <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm">
              {moderateCount} moderate
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {shown.map((gap) => (
          <GapRow key={gap.skill_name} gap={gap} />
        ))}
      </div>

      {gaps.length > 5 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              View all {gaps.length} gaps <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </div>
  );
}
