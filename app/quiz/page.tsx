'use client';

import { Brain, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES, APP_ROUTES } from '@/lib/constants';

interface TopicScore {
  skill_name: string;
  proficiency: number;
  last_updated: string | null;
}

function ProficiencyBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-700 w-10 text-right">{pct}%</span>
    </div>
  );
}

function ProficiencyBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  if (pct >= 80) return <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Proficient</span>;
  if (pct >= 50) return <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Developing</span>;
  return <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Needs Work</span>;
}

function formatDate(iso: string | null) {
  if (!iso) return 'Never';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return iso; }
}

export default function QuizProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['quiz-profile'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: TopicScore[] }>(
        API_ROUTES.QUIZ_PROFILE
      );
      return res.data.data || [];
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center p-12">
          <p className="text-sm text-slate-500">Loading quiz history...</p>
        </div>
      </MainLayout>
    );
  }

  const scores = data || [];

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6 p-6">
        {/* Header */}
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-semibold text-slate-900">Quiz History</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your proficiency scores across all attempted topics
          </p>
        </div>

        {scores.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <Brain className="mx-auto h-10 w-10 text-slate-300 mb-4" />
            <h2 className="text-base font-semibold text-slate-700 mb-1">
              No quiz attempts yet
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Take a SkillGenie assessment to verify your skills and build your
              profile.
            </p>
            <Link
              href={APP_ROUTES.SKILLGENIE}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              Go to SkillGenie
            </Link>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="card text-center">
                <p className="text-2xl font-bold text-slate-900">{scores.length}</p>
                <p className="text-xs text-slate-500 mt-1">Topics Attempted</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {scores.filter((s) => s.proficiency >= 0.8).length}
                </p>
                <p className="text-xs text-slate-500 mt-1">Proficient</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-indigo-600">
                  {Math.round((scores.reduce((sum, s) => sum + s.proficiency, 0) / scores.length) * 100)}%
                </p>
                <p className="text-xs text-slate-500 mt-1">Avg Proficiency</p>
              </div>
            </div>

            {/* Topic list */}
            <div className="space-y-3">
              {scores
                .slice()
                .sort((a, b) => b.proficiency - a.proficiency)
                .map((topic) => (
                  <div key={topic.skill_name} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 flex-shrink-0">
                          <Brain className="h-4 w-4 text-indigo-600" />
                        </div>
                        <p className="text-sm font-medium text-slate-900 capitalize">{topic.skill_name}</p>
                      </div>
                      <ProficiencyBadge score={topic.proficiency} />
                    </div>

                    <ProficiencyBar score={topic.proficiency} />

                    <div className="mt-3 flex items-center text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Last attempted: {formatDate(topic.last_updated)}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="text-center pt-2">
              <Link
                href={APP_ROUTES.SKILLGENIE}
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Take another assessment
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
