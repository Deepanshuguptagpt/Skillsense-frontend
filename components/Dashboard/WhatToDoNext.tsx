'use client';

import { ArrowRight, Zap, Github, Target, CheckCircle, BookOpen, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { APP_ROUTES } from '@/lib/constants';
import type { StudentProfile } from '@/types';

interface Action {
  id: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle: string;
  cta: string;
  href?: string;
  impact: 'high' | 'medium';
  impactLabel: string;
}

function getActions(
  profile: StudentProfile | null | undefined,
  skillCount: number,
  verifiedSkills: number,
  eligibleCount: number,
  topGap?: string,
): Action[] {
  const actions: Action[] = [];

  // No resume uploaded
  if (!profile?.resumeS3Uri && !profile?.resumeUploadedAt) {
    actions.push({
      id: 'resume',
      icon: Upload,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-100',
      title: 'Upload your resume',
      subtitle: 'AI extracts your skills automatically — takes 30 seconds',
      cta: 'Upload now',
      href: APP_ROUTES.PROFILE,
      impact: 'high',
      impactLabel: '+20 profile points',
    });
  }

  // No target role
  if (!profile?.targetRoleId) {
    actions.push({
      id: 'role',
      icon: Target,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100',
      title: 'Set your target role',
      subtitle: 'Required to calculate your readiness score and match internships',
      cta: 'Set role',
      href: APP_ROUTES.PROFILE,
      impact: 'high',
      impactLabel: 'Unlocks readiness score',
    });
  }

  // Has skills but none verified
  if (skillCount > 0 && verifiedSkills === 0) {
    actions.push({
      id: 'verify',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      title: 'Verify a skill with SkillGenie',
      subtitle: `You have ${skillCount} unverified skills. Verified skills boost your score significantly.`,
      cta: 'Start quiz',
      href: APP_ROUTES.SKILLGENIE,
      impact: 'high',
      impactLabel: 'Boosts readiness score',
    });
  }

  // Top skill gap — almost eligible
  if (topGap && eligibleCount < 10) {
    actions.push({
      id: 'gap',
      icon: Zap,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      title: `Learn ${topGap} to unlock more internships`,
      subtitle: 'This skill gap is blocking you from several eligible positions.',
      cta: 'Start learning',
      href: `/skillgenie?mode=unlock&skill=${encodeURIComponent(topGap)}`,
      impact: 'high',
      impactLabel: 'Unlocks internships',
    });
  }

  // No GitHub connected
  if (!profile?.personalInfo?.githubUsername) {
    actions.push({
      id: 'github',
      icon: Github,
      iconColor: 'text-slate-700',
      iconBg: 'bg-slate-100',
      title: 'Connect GitHub',
      subtitle: 'Automatically extract skills from your repos — public + private with OAuth.',
      cta: 'Connect',
      href: APP_ROUTES.PROFILE,
      impact: 'medium',
      impactLabel: '+15 profile points',
    });
  }

  // Generate a learning project
  if (skillCount >= 3 && verifiedSkills < 2) {
    actions.push({
      id: 'project',
      icon: BookOpen,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      title: 'Build a project to verify skills',
      subtitle: 'AI generates a personalized project. Completing it gives you the highest confidence boost.',
      cta: 'Generate project',
      href: APP_ROUTES.PROJECTS,
      impact: 'medium',
      impactLabel: 'Weight: 0.9',
    });
  }

  return actions.slice(0, 3); // show top 3 most relevant
}

interface WhatToDoNextProps {
  profile: StudentProfile | null | undefined;
  skillCount: number;
  verifiedSkills: number;
  eligibleCount: number;
  topGap?: string;
}

export default function WhatToDoNext({
  profile,
  skillCount,
  verifiedSkills,
  eligibleCount,
  topGap,
}: WhatToDoNextProps) {
  const router = useRouter();
  const actions = getActions(profile, skillCount, verifiedSkills, eligibleCount, topGap);

  if (actions.length === 0) return null;

  return (
    <div className="card-glass p-6 border border-slate-200">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <h3 className="font-sora text-base font-bold text-slate-900">What to do next</h3>
        <span className="ml-auto text-xs font-medium text-slate-400">
          {actions.length} action{actions.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          const content = (
            <div className={cn(
              'group flex items-start gap-3 rounded-xl border-2 p-3.5 transition-all',
              i === 0
                ? 'border-indigo-200 bg-indigo-50/60 hover:border-indigo-300 hover:bg-indigo-50'
                : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
            )}>
              <div className={cn('mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg', action.iconBg)}>
                <Icon className={cn('h-5 w-5', action.iconColor)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn(
                    'text-sm font-bold',
                    i === 0 ? 'text-indigo-900' : 'text-slate-800'
                  )}>
                    {action.title}
                  </p>
                  {action.impact === 'high' && (
                    <span className="flex-shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {action.impactLabel}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-slate-500">{action.subtitle}</p>
                <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">
                  {action.cta}
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          );

          return action.href ? (
            <Link key={action.id} href={action.href}>
              {content}
            </Link>
          ) : (
            <div key={action.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
