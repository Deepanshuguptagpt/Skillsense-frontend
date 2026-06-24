'use client';

import { Briefcase, CheckCircle, XCircle, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';
import { useOpportunities } from '@/hooks/useOpportunities';
import { APP_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

function MatchScoreBar({ score }: { score: number }) {
  const color =
    score >= 80
      ? 'bg-emerald-500'
      : score >= 50
        ? 'bg-amber-500'
        : 'bg-red-500';
  const label =
    score >= 80
      ? 'text-emerald-700 bg-emerald-100'
      : score >= 50
        ? 'text-amber-700 bg-amber-100'
        : 'text-red-700 bg-red-100';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Match score</span>
        <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', label)}>
          {score}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  const { opportunities, isLoading, isError } = useOpportunities();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4 p-6">
          <div className="gradient-skeleton h-10 w-56 rounded-lg" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="gradient-skeleton h-40 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-semibold text-slate-900">Opportunities</h1>
          <p className="mt-1 text-sm text-slate-500">
            Jobs matched to your skills by recruiters
          </p>
          <div className="mt-2">
            <span className="text-sm text-slate-600">
              <span className="font-semibold text-indigo-600">{opportunities.length}</span> total matches
            </span>
          </div>
        </div>

        {/* Content */}
        {isError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm font-medium text-red-700">Failed to load opportunities.</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <Briefcase className="mx-auto h-10 w-10 text-slate-300 mb-4" />
            <p className="text-base font-medium text-slate-700">No matching opportunities yet.</p>
            <p className="mt-1 text-sm text-slate-500">
              Set your target role to see matches.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opp) => {
              const matchedSkills = (opp.matched_skills || []).slice(0, 3);
              const missingSkills = (opp.missing_skills || []).slice(0, 3);
              const score = opp.match_score ?? 0;

              return (
                <div key={opp.id} className="card flex flex-col gap-4">
                  {/* Title + role type + shortlisted badge */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-slate-900 leading-tight truncate">
                        {opp.title}
                      </h3>
                      {(opp as any).shortlisted && (
                        <span className="flex-shrink-0 flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          Shortlisted
                        </span>
                      )}
                    </div>
                    <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                      {opp.role_type}
                    </span>
                  </div>

                  {/* Match score bar */}
                  <MatchScoreBar score={score} />

                  {/* Skills */}
                  <div className="space-y-2">
                    {matchedSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {matchedSkills.map((skill) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    {missingSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {missingSkills.map((skill) => (
                          <span
                            key={skill}
                            className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                          >
                            <XCircle className="h-3 w-3" />
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="mt-auto flex gap-2">
                    <Link
                      href={`/opportunities/${opp.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
