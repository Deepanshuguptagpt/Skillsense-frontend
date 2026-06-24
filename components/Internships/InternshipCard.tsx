'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin, IndianRupee, Clock, AlertTriangle,
  ExternalLink, Sparkles, Zap, TrendingUp, Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InternshipMatch } from '@/types';
import InternshipDetailModal from './InternshipDetailModal';

interface InternshipCardProps {
  match: InternshipMatch;
  category: 'eligible' | 'almostEligible' | 'notEligible';
  allIneligible?: InternshipMatch[];
}

// ── Company tier system — the visual USP ─────────────────────────────────────
type Tier = 'faang' | 'mnc' | 'unicorn' | 'enterprise' | 'startup' | 'default';

interface TierConfig {
  tier: Tier;
  label: string;
  // Card background gradient (top portion)
  headerGradient: string;
  // Accent bar at top
  accentBar: string;
  // Avatar bg
  avatarBg: string;
  // Badge bg/text
  badgeBg: string;
  badgeText: string;
  // Border
  border: string;
  // Glow on hover
  hoverGlow: string;
}

const TIER_MAP: { keywords: string[]; config: Omit<TierConfig, 'tier'> & { tier: Tier } }[] = [
  {
    keywords: ['google', 'amazon', 'microsoft', 'meta', 'apple', 'netflix'],
    config: {
      tier: 'faang',
      label: 'FAANG',
      headerGradient: 'from-slate-800 to-slate-900',
      accentBar: 'bg-gradient-to-r from-slate-500 via-slate-300 to-slate-500',
      avatarBg: 'bg-slate-700',
      badgeBg: 'bg-slate-800',
      badgeText: 'text-slate-100',
      border: 'border-slate-200',
      hoverGlow: 'hover:shadow-slate-200/60',
    },
  },
  {
    keywords: ['nvidia', 'salesforce', 'adobe', 'oracle', 'ibm', 'intel', 'cisco', 'sap', 'vmware'],
    config: {
      tier: 'mnc',
      label: 'Top MNC',
      headerGradient: 'from-blue-700 to-indigo-800',
      accentBar: 'bg-gradient-to-r from-blue-400 via-sky-300 to-blue-400',
      avatarBg: 'bg-blue-700',
      badgeBg: 'bg-blue-700',
      badgeText: 'text-white',
      border: 'border-blue-200',
      hoverGlow: 'hover:shadow-blue-200/60',
    },
  },
  {
    keywords: ['flipkart', 'swiggy', 'zomato', 'ola', 'paytm', 'phonepe', 'razorpay', 'myntra', 'dream11', 'unacademy', 'meesho', 'cred', 'zepto', 'groww'],
    config: {
      tier: 'unicorn',
      label: 'Unicorn',
      headerGradient: 'from-amber-600 to-orange-700',
      accentBar: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400',
      avatarBg: 'bg-amber-600',
      badgeBg: 'bg-amber-600',
      badgeText: 'text-white',
      border: 'border-amber-200',
      hoverGlow: 'hover:shadow-amber-200/60',
    },
  },
  {
    keywords: ['tcs', 'infosys', 'wipro', 'accenture', 'jio', 'bosch', 'mahindra', 'l&t', 'hcl', 'tech mahindra'],
    config: {
      tier: 'enterprise',
      label: 'Enterprise',
      headerGradient: 'from-indigo-700 to-violet-800',
      accentBar: 'bg-gradient-to-r from-indigo-400 via-violet-300 to-indigo-400',
      avatarBg: 'bg-indigo-700',
      badgeBg: 'bg-indigo-700',
      badgeText: 'text-white',
      border: 'border-indigo-200',
      hoverGlow: 'hover:shadow-indigo-200/60',
    },
  },
  {
    keywords: ['polygon', 'freshworks', 'browserstack', 'postman', 'chargebee', 'clevertap', 'moengage', 'lenskart', 'sharechat'],
    config: {
      tier: 'startup',
      label: 'Startup',
      headerGradient: 'from-emerald-600 to-teal-700',
      accentBar: 'bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400',
      avatarBg: 'bg-emerald-600',
      badgeBg: 'bg-emerald-600',
      badgeText: 'text-white',
      border: 'border-emerald-200',
      hoverGlow: 'hover:shadow-emerald-200/60',
    },
  },
];

const DEFAULT_TIER: TierConfig = {
  tier: 'default',
  label: 'Company',
  headerGradient: 'from-violet-600 to-indigo-700',
  accentBar: 'bg-gradient-to-r from-violet-400 via-indigo-300 to-violet-400',
  avatarBg: 'bg-violet-600',
  badgeBg: 'bg-violet-600',
  badgeText: 'text-white',
  border: 'border-violet-200',
  hoverGlow: 'hover:shadow-violet-200/60',
};

function getTierConfig(company: string): TierConfig {
  const lower = company.toLowerCase();
  for (const { keywords, config } of TIER_MAP) {
    if (keywords.some((k) => lower.includes(k))) return config;
  }
  return DEFAULT_TIER;
}

// ── Eligibility config ───────────────────────────────────────────────────────
function getEligibility(score: number) {
  if (score >= 80) return { label: 'Eligible', icon: '✓', bg: 'bg-emerald-500', text: 'text-white', ring: 'ring-emerald-400' };
  if (score >= 55) return { label: 'Close',    icon: '≈', bg: 'bg-amber-400',   text: 'text-white', ring: 'ring-amber-300' };
  return               { label: `${score}%`,  icon: '✗', bg: 'bg-red-500',     text: 'text-white', ring: 'ring-red-400' };
}

// ── Deadline pill ────────────────────────────────────────────────────────────
function deadlinePill(days: number | null) {
  if (days === null) return { label: 'Rolling', cls: 'bg-slate-100 text-slate-500' };
  if (days === 0)    return { label: 'Today!',  cls: 'bg-red-600 text-white animate-pulse' };
  if (days <= 3)     return { label: `${days}d`, cls: 'bg-red-500 text-white' };
  if (days <= 7)     return { label: `${days}d`, cls: 'bg-orange-500 text-white' };
  if (days <= 14)    return { label: `${days}d`, cls: 'bg-amber-400 text-white' };
  return               { label: `${days}d`,  cls: 'bg-slate-100 text-slate-500' };
}

// ── Card component ───────────────────────────────────────────────────────────
export default function InternshipCard({ match, category, allIneligible = [] }: InternshipCardProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const { internship, matchScore, missingSkills = [], matchedSkills = [] } = match;

  const tier        = getTierConfig(internship.company);
  const eligibility = getEligibility(matchScore);
  const deadline    = deadlinePill(internship.daysUntilDeadline);

  // How many extra internships unlock if student learns missing skills
  const missingNames = missingSkills.map((s) => (typeof s === 'string' ? s : s.skillName).toLowerCase());
  const additionalUnlocks = allIneligible.filter((other) => {
    if (other.internship.internshipId === internship.internshipId) return false;
    const otherMissing = (other.missingSkills || []).map((s) =>
      (typeof s === 'string' ? s : s.skillName).toLowerCase()
    );
    return otherMissing.length > 0 && otherMissing.every((s) => missingNames.includes(s));
  }).length;

  const primaryMissingSkill = missingSkills.length > 0
    ? (typeof missingSkills[0] === 'string' ? missingSkills[0] : missingSkills[0].skillName)
    : '';

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/skillgenie/assessment?skills=${encodeURIComponent(primaryMissingSkill)}&mode=unlock&internship=${encodeURIComponent(internship.internshipId)}&unlocks=${additionalUnlocks}`);
  };
  const handleDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/internships/${internship.internshipId}`);
  };

  // Skill bar width
  const skillPct = internship.requiredSkills.length > 0
    ? Math.round((matchedSkills.length / internship.requiredSkills.length) * 100)
    : matchScore;

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className={cn(
          'group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300',
          'hover:-translate-y-1 hover:shadow-xl',
          tier.border,
          tier.hoverGlow
        )}
      >
        {/* ── Colored header with gradient bg ── */}
        <div className={cn('relative overflow-hidden px-4 pb-4 pt-4 bg-gradient-to-br', tier.headerGradient)}>
          {/* Subtle shimmer accent bar */}
          <div className={cn('absolute top-0 left-0 right-0 h-[3px]', tier.accentBar)} />

          {/* Decorative blurred circle */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

          {/* Top row: tier badge + eligibility badge */}
          <div className="mb-3 flex items-center justify-between">
            <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest', tier.badgeBg, tier.badgeText)}>
              {tier.label}
            </span>
            {/* Eligibility pill */}
            <span className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ring-2 ring-offset-1',
              eligibility.bg, eligibility.text, eligibility.ring
            )}>
              {eligibility.icon} {eligibility.label}
            </span>
          </div>

          {/* Company avatar + title */}
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold text-white shadow-lg',
              tier.avatarBg
            )}>
              {internship.company.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-sm font-extrabold text-white leading-tight">
                {internship.title}
              </h3>
              <p className="mt-0.5 truncate text-xs font-semibold text-white/70">
                {internship.company}
              </p>
            </div>
          </div>

          {/* Deadline urgency banner — only when soon */}
          {internship.isDeadlineSoon && (
            <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 backdrop-blur-sm">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-yellow-300" />
              <span className="text-xs font-bold text-yellow-100">
                Closes in {deadline.label === 'Today!' ? 'today' : deadline.label}
              </span>
            </div>
          )}
        </div>

        {/* ── Card body ── */}
        <div className="flex flex-1 flex-col gap-3 p-4">

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center rounded-xl bg-slate-50 px-2 py-2.5 text-center">
              <IndianRupee className="mb-1 h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-extrabold text-slate-800 leading-none">
                {internship.stipend?.display
                  ? internship.stipend.display.replace('/month', '/mo').replace('per month', '/mo')
                  : internship.stipend?.amount
                    ? `₹${Math.round(internship.stipend.amount / 1000)}K/mo`
                    : '—'}
              </span>
              <span className="mt-0.5 text-[9px] font-medium text-slate-400">Stipend</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-slate-50 px-2 py-2.5 text-center">
              <Clock className="mb-1 h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-extrabold text-slate-800 leading-none truncate max-w-full">
                {internship.duration || '—'}
              </span>
              <span className="mt-0.5 text-[9px] font-medium text-slate-400">Duration</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-slate-50 px-2 py-2.5 text-center">
              <MapPin className="mb-1 h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-extrabold text-slate-800 leading-none truncate max-w-full">
                {internship.location.split(',')[0]}
              </span>
              <span className="mt-0.5 text-[9px] font-medium text-slate-400">Location</span>
            </div>
          </div>

          {/* Mode + category chips */}
          <div className="flex flex-wrap gap-1.5">
            <span className={cn(
              'rounded-full px-2.5 py-0.5 text-[10px] font-bold capitalize border',
              internship.type === 'remote'  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              internship.type === 'hybrid'  ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                              'bg-slate-100 text-slate-600 border-slate-200'
            )}>
              {internship.type}
            </span>
            {internship.category && (
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 capitalize">
                {internship.category === 'faang' ? 'FAANG' : internship.category}
              </span>
            )}
            {/* Deadline pill */}
            <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold', deadline.cls)}>
              {deadline.label}
            </span>
          </div>

          {/* Skills match bar */}
          <div className="mt-auto space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className="text-slate-500">Skills match</span>
              <span className={cn(
                matchScore >= 80 ? 'text-emerald-600' :
                matchScore >= 55 ? 'text-amber-600' : 'text-red-500'
              )}>
                {matchedSkills.length}/{internship.requiredSkills.length} skills
              </span>
            </div>
            {/* Segmented progress bar */}
            <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full">
              {internship.requiredSkills.length > 0
                ? internship.requiredSkills.map((s, i) => {
                    const matched = matchedSkills.includes(s.name);
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex-1 rounded-full transition-all duration-500',
                          matched
                            ? matchScore >= 80 ? 'bg-emerald-500' : matchScore >= 55 ? 'bg-amber-400' : 'bg-red-400'
                            : 'bg-slate-200'
                        )}
                      />
                    );
                  })
                : (
                  <div className={cn('h-full rounded-full transition-all', matchScore >= 80 ? 'bg-emerald-500' : matchScore >= 55 ? 'bg-amber-400' : 'bg-red-400')}
                    style={{ width: `${matchScore}%` }} />
                )
              }
            </div>

            {/* Skill chips — matched + missing */}
            <div className="flex flex-wrap gap-1 pt-0.5">
              {matchedSkills.slice(0, 3).map((s) => (
                <span key={s} className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                  ✓ {s}
                </span>
              ))}
              {matchedSkills.length > 3 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500">+{matchedSkills.length - 3}</span>
              )}
              {missingSkills.slice(0, 2).map((s) => {
                const name = typeof s === 'string' ? s : s.skillName;
                const req  = typeof s === 'string' ? false : !!s.required;
                return (
                  <span key={name} className={cn('rounded-full border px-2 py-0.5 text-[9px] font-bold',
                    req ? 'bg-red-50 border-red-200 text-red-600' : 'bg-amber-50 border-amber-200 text-amber-600'
                  )}>
                    ✗ {name}{req ? '*' : ''}
                  </span>
                );
              })}
              {missingSkills.length > 2 && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-400">+{missingSkills.length - 2} needed</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-2 space-y-2">
            {missingSkills.length > 0 ? (
              <>
                <button onClick={handleUnlock}
                  className="flex w-full flex-col items-center justify-center gap-0.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-md">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Unlock with SkillGenie
                  </span>
                  {additionalUnlocks > 0 && (
                    <span className="text-[9px] font-semibold text-indigo-200 flex items-center gap-1">
                      <Zap className="h-2.5 w-2.5" />
                      +{additionalUnlocks} more internship{additionalUnlocks > 1 ? 's' : ''} unlock too
                    </span>
                  )}
                </button>
                <button onClick={handleDetails}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50">
                  <ExternalLink className="h-3.5 w-3.5" /> View Details
                </button>
              </>
            ) : (
              <button onClick={handleDetails}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-md">
                <TrendingUp className="h-3.5 w-3.5" />
                You're Eligible — View & Apply
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <InternshipDetailModal match={match} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
