'use client';

import { CheckCircle, Circle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { APP_ROUTES } from '@/lib/constants';
import type { StudentProfile } from '@/types';

interface Step {
  label: string;
  done: boolean;
  href: string;
  hint: string;
  points: number;
}

function getSteps(profile: StudentProfile | null | undefined, skillCount: number): Step[] {
  const education = (profile as any)?.education;
  const hasEducation = Array.isArray(education) && education.length > 0 && education[0]?.institution;

  return [
    {
      label: 'Complete your profile',
      done: !!(profile?.personalInfo?.name && profile?.personalInfo?.email),
      href: APP_ROUTES.PROFILE,
      hint: 'Add your name and contact info',
      points: 10,
    },
    {
      label: 'Upload your resume',
      done: !!(profile?.resumeS3Uri || profile?.resumeUploadedAt),
      href: APP_ROUTES.PROFILE,
      hint: 'AI will extract your skills automatically',
      points: 20,
    },
    {
      label: 'Confirm your education',
      done: !!hasEducation,
      href: APP_ROUTES.PROFILE,
      hint: 'Verify your college and graduation year',
      points: 10,
    },
    {
      label: 'Link GitHub profile',
      done: !!(profile?.personalInfo?.githubUsername),
      href: APP_ROUTES.PROFILE,
      hint: 'Adds higher-confidence skill evidence',
      points: 15,
    },
    {
      label: 'Set target role',
      done: !!(profile?.targetRoleId),
      href: APP_ROUTES.PROFILE,
      hint: 'Required to compute your readiness score',
      points: 15,
    },
    {
      label: 'Add 5+ skills',
      done: skillCount >= 5,
      href: APP_ROUTES.PROFILE,
      hint: `You have ${skillCount} skill${skillCount === 1 ? '' : 's'}`,
      points: 15,
    },
    {
      label: 'Take a quiz',
      done: false,
      href: '/quiz',
      hint: 'Verify skills with a 5-question assessment',
      points: 15,
    },
  ];
}

interface ProfileCompletenessProps {
  profile: StudentProfile | null | undefined;
  skillCount: number;
}

export default function ProfileCompleteness({ profile, skillCount }: ProfileCompletenessProps) {
  const steps = getSteps(profile, skillCount);
  const completedPoints = steps.filter((s) => s.done).reduce((sum, s) => sum + s.points, 0);
  const totalPoints = steps.reduce((sum, s) => sum + s.points, 0);
  const pct = Math.round((completedPoints / totalPoints) * 100);
  const completedCount = steps.filter((s) => s.done).length;

  const nextStep = steps.find((s) => !s.done);

  const barColor =
    pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-indigo-500';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Completed so far</h3>
        <span className={`text-sm font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-indigo-600'}`}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs text-slate-500 mb-4">
        {completedCount} of {steps.length} steps completed
      </p>

      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.label} className="flex items-center gap-3">
            {step.done ? (
              <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="h-4 w-4 text-slate-300 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <span className={`text-xs font-medium ${step.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {step.label}
              </span>
              {!step.done && (
                <p className="text-xs text-slate-400">{step.hint}</p>
              )}
            </div>
            {!step.done && (
              <span className="text-xs text-slate-400 flex-shrink-0">+{step.points}pts</span>
            )}
          </div>
        ))}
      </div>

      {/* Next action CTA */}
      {nextStep && (
        <Link
          href={nextStep.href}
          className="mt-4 flex items-center justify-between rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2.5 hover:bg-indigo-100 transition-colors group"
        >
          <div>
            <p className="text-xs font-semibold text-indigo-700">Next: {nextStep.label}</p>
            <p className="text-xs text-indigo-500">{nextStep.hint}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}
    </div>
  );
}
