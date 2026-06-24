'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Briefcase, CheckCircle, XCircle, Clock, Star, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

interface OpportunityDetail {
  id: string;
  title: string;
  description?: string;
  role_type: string;
  required_skills?: Array<{ name: string; proficiency_level: number; mandatory: boolean }>;
  status: string;
  created_at: string;
  duration?: string;
  stipend?: string;
  match_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  shortlisted?: boolean;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-400';
  const label = score >= 80 ? 'text-emerald-700 bg-emerald-100' : score >= 50 ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100';
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">Your match score</span>
        <span className={`rounded-full px-3 py-1 text-sm font-bold ${label}`}>{score}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export default function OpportunityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: opp, isLoading, isError } = useQuery({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const res = await api.get<OpportunityDetail>(API_ROUTES.OPPORTUNITY_DETAIL(id));
      return res.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6 space-y-4">
          <div className="h-8 w-48 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-40 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </MainLayout>
    );
  }

  if (isError || !opp) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
            <p className="text-sm font-medium text-red-700">Opportunity not found or no longer active.</p>
            <button onClick={() => router.back()} className="mt-4 text-sm text-red-600 hover:underline">
              ← Go back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const score = opp.match_score ?? 0;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6 p-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to opportunities
        </button>

        {/* Header */}
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 flex-shrink-0">
                <Briefcase className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-semibold text-slate-900">{opp.title}</h1>
                  {opp.shortlisted && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      Shortlisted
                    </span>
                  )}
                </div>
                <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 capitalize">
                  {opp.role_type.replace(/-/g, ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
            {opp.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {opp.duration}
              </span>
            )}
            {opp.stipend && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" />
                {opp.stipend}
              </span>
            )}
          </div>

          {opp.description && (
            <p className="mt-4 text-sm text-slate-600 leading-relaxed">{opp.description}</p>
          )}
        </div>

        {/* Match score */}
        <div className="card">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Your Match</h2>
          <ScoreBar score={score} />

          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* Matched skills */}
            {(opp.matched_skills?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-emerald-700 mb-2">Skills you have</p>
                <div className="flex flex-wrap gap-1.5">
                  {opp.matched_skills!.map((s) => (
                    <span key={s} className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      <CheckCircle className="h-3 w-3" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing skills */}
            {(opp.missing_skills?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-700 mb-2">Skills to develop</p>
                <div className="flex flex-wrap gap-1.5">
                  {opp.missing_skills!.map((s) => (
                    <span key={s} className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      <XCircle className="h-3 w-3" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Required skills */}
        {(opp.required_skills?.length ?? 0) > 0 && (
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Required Skills</h2>
            <div className="space-y-2">
              {opp.required_skills!.map((skill) => (
                <div key={skill.name} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{skill.name}</span>
                    {skill.mandatory && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">Required</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">Level {skill.proficiency_level}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
