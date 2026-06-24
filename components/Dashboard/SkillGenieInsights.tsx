'use client';

import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export default function SkillGenieInsights() {
  const { data, isLoading } = useQuery({
    queryKey: ['skillgenie-suggestions', 'dashboard'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: { suggestions: string[] } }>(
        `${API_ROUTES.SKILLGENIE_SUGGESTIONS}?page=dashboard`
      );
      return res.data.data.suggestions || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const suggestions = data || [];

  if (isLoading) {
    return (
      <div className="card-glass p-6 animate-pulse border border-slate-200">
        <div className="mb-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-slate-200" />
          <div className="h-4 w-32 rounded bg-slate-200" />
        </div>
        {[1, 2].map((i) => (
          <div key={i} className="mb-2 h-12 rounded-lg bg-slate-100" />
        ))}
      </div>
    );
  }

  if (!suggestions.length) return null;

  return (
    <div className="card-glass p-6 border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-violet-50/40">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-sora text-sm font-bold text-slate-900">SkillGenie Insights</h3>
            <p className="text-xs text-slate-500">Personalized for you</p>
          </div>
        </div>
        <Link
          href="/skillgenie"
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Open SkillGenie
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Suggestion cards */}
      <div className="space-y-2">
        {suggestions.slice(0, 3).map((suggestion, i) => (
          <Link
            key={i}
            href={`/skillgenie?q=${encodeURIComponent(suggestion)}`}
            className="flex items-center justify-between rounded-xl border border-white/80 bg-white/70 px-3 py-2.5 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-sm group"
          >
            <p className="text-xs font-medium text-slate-700 group-hover:text-indigo-700 transition-colors">
              {suggestion}
            </p>
            <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-300 group-hover:text-indigo-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Ask anything prompt */}
      <Link
        href="/skillgenie"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-200 py-2.5 text-xs font-semibold text-indigo-600 transition-all hover:border-indigo-300 hover:bg-indigo-50"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Ask SkillGenie anything...
      </Link>
    </div>
  );
}
