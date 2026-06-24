'use client';

import {
  Target,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import { useReadiness } from '@/hooks/useReadiness';

const CLASSIFICATION_CONFIG = {
  eligible: {
    label: 'Eligible',
    icon: CheckCircle,
    badgeCls: 'bg-emerald-50/80 text-emerald-700 border-emerald-200 shadow-sm',
    ringCls: 'stroke-emerald-400',
    scoreCls: 'text-emerald-500',
    desc: 'You meet the requirements for your target role.',
  },
  'almost-eligible': {
    label: 'Almost Eligible',
    icon: AlertCircle,
    badgeCls: 'bg-amber-50/80 text-amber-700 border-amber-200 shadow-sm',
    ringCls: 'stroke-amber-400',
    scoreCls: 'text-amber-500',
    desc: "A few more skills and you'll be ready.",
  },
  'not-eligible': {
    label: 'Not Eligible',
    icon: XCircle,
    badgeCls: 'bg-red-50/80 text-red-700 border-red-200 shadow-sm',
    ringCls: 'stroke-red-400',
    scoreCls: 'text-red-500',
    desc: 'Keep building your skills to reach eligibility.',
  },
};

function ScoreRing({ score, ringCls }: { score: number; ringCls: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
      {/* Background ring */}
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="8"
      />
      {/* Progress ring */}
      <circle
        cx="48"
        cy="48"
        r={r}
        fill="none"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className={`transition-all duration-700 ${ringCls}`}
      />
    </svg>
  );
}

export default function ReadinessCard() {
  const { readiness, isLoading } = useReadiness();

  if (isLoading) {
    return (
      <div className="card animate-pulse">
        <div className="mb-4 h-4 w-32 rounded bg-slate-100" />
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-slate-100" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-20 rounded bg-slate-100" />
            <div className="h-4 w-40 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!readiness) {
    return (
      <div className="card-glass p-6 border border-slate-200">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
            <Target className="h-4 w-4 text-violet-600" />
          </div>
          <h3 className="font-sora text-sm font-bold text-slate-900">
            Career Readiness
          </h3>
        </div>
        <p className="text-sm text-slate-500">
          Set a target role to see your readiness score.
        </p>
      </div>
    );
  }

  const score = Math.round(readiness.score);
  const cfg =
    CLASSIFICATION_CONFIG[readiness.classification] ??
    CLASSIFICATION_CONFIG['not-eligible'];
  const Icon = cfg.icon;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[24px] bg-white/70 p-8 shadow-xl ring-1 ring-slate-200/50 backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_8px_40px_rgba(139,92,246,0.15)] hover:ring-violet-200/50">
      {/* Background glowing effects */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-400/10 blur-[80px] transition-all duration-700 group-hover:scale-110 group-hover:bg-violet-400/20" />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[80px] transition-all duration-700 group-hover:scale-110 group-hover:bg-cyan-400/20" />
      
      {/* Grid Pattern overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.4]" 
        style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #e2e8f0 1px, transparent 0)', backgroundSize: '24px 24px' }} 
      />

      <div className="relative z-10 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-indigo-50 shadow-inner border border-violet-100">
            <Target className="h-5 w-5 text-violet-600" />
          </div>
          <h3 className="font-sora text-lg font-bold tracking-wide text-slate-800">
            Career Readiness
          </h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold backdrop-blur-md ${cfg.badgeCls}`}
        >
          <Icon className="h-4 w-4" />
          {cfg.label}
        </span>
      </div>

      <div className="relative z-10 flex items-center gap-8">
        {/* Score ring */}
        <div className="relative flex-shrink-0 drop-shadow-[0_0_15px_rgba(139,92,246,0.1)]">
          <ScoreRing score={score} ringCls={cfg.ringCls} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-sora text-3xl font-bold ${cfg.scoreCls}`}>
              {score}
            </span>
            <span className="text-xs font-medium text-slate-400">/ 100</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {readiness.role_name && (
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-400">
              Target Role:{' '}
              <span className="ml-1 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                {readiness.role_name}
              </span>
            </p>
          )}
          <p className="mt-1 text-base font-medium text-slate-600">{cfg.desc}</p>

          {/* Score bar */}
          <div className="mt-5">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
              <div
                className={`relative h-full rounded-full transition-all duration-1000 ${
                  score >= 80
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                    : score >= 50
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                      : 'bg-gradient-to-r from-red-400 to-rose-400 shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
