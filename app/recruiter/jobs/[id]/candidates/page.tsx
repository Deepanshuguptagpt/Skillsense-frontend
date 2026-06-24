'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Users, Search, Star, CheckCircle, AlertCircle, XCircle,
  Download, ChevronRight, Briefcase, Clock, Award
} from 'lucide-react';
import RecruiterLayout from '@/components/Layout/RecruiterLayout';
import { useRecruiter } from '@/hooks/useRecruiter';
import { CandidateMatch, RecruiterJob } from '@/types';

function ClassificationBadge({ score }: { score: number }) {
  if (score >= 80) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
      <CheckCircle className="h-3 w-3" /> Eligible
    </span>
  );
  if (score >= 50) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
      <AlertCircle className="h-3 w-3" /> Almost
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
      <XCircle className="h-3 w-3" /> Not Eligible
    </span>
  );
}

function ScoreRing({ score }: { score: number }) {
  const pct = Math.min(Math.round(score), 100);
  const r = 22;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex-shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="rotate-[-90deg]">
        <circle cx="28" cy="28" r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-800">{pct}%</span>
      </div>
    </div>
  );
}

function CandidateCard({
  candidate, rank, jobId, onShortlist
}: {
  candidate: CandidateMatch;
  rank: number;
  jobId: string;
  onShortlist: (id: string) => void;
}) {
  const router = useRouter();
  const breakdown = candidate.score_breakdown?.skill_details ?? [];
  const matched = breakdown.filter((s: Record<string, unknown>) => s.severity === 'none').length;
  const missing = breakdown.filter((s: Record<string, unknown>) => s.severity === 'critical').length;

  return (
    <div className="card hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group"
      onClick={() => router.push(`/recruiter/candidates/${candidate.candidate_id}?job_id=${jobId}`)}>
      <div className="flex items-start gap-4">
        {/* Rank + Avatar */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
            #{rank}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {candidate.name}
              </h3>
              <p className="text-xs text-slate-400 truncate">{candidate.email}</p>
            </div>
            <ScoreRing score={candidate.match_score} />
          </div>

          {/* Classification + shortlisted */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <ClassificationBadge score={candidate.match_score} />
            {candidate.shortlisted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Shortlisted
              </span>
            )}
            {candidate.applied && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                <CheckCircle className="h-3 w-3" /> Applied
              </span>
            )}
          </div>

          {/* Skill summary */}
          {breakdown.length > 0 && (
            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                {matched} skills matched
              </span>
              {missing > 0 && (
                <span className="flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5 text-red-400" />
                  {missing} missing
                </span>
              )}
            </div>
          )}

          {/* Top matched skills */}
          {breakdown.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {breakdown
                .filter((s: Record<string, unknown>) => s.severity === 'none')
                .slice(0, 4)
                .map((s: Record<string, unknown>) => (
                  <span key={s.skill_name as string} className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-700">
                    {s.skill_name as string}
                  </span>
                ))}
              {breakdown.filter((s: Record<string, unknown>) => s.severity === 'critical').slice(0, 2).map((s: Record<string, unknown>) => (
                <span key={s.skill_name as string} className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs text-red-600">
                  -{s.skill_name as string}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={(e) => { e.stopPropagation(); onShortlist(candidate.candidate_id); }}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${
            candidate.shortlisted
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${candidate.shortlisted ? 'fill-amber-400 text-amber-400' : ''}`} />
          {candidate.shortlisted ? 'Shortlisted' : 'Shortlist'}
        </button>
        <span className="flex items-center gap-1 text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">
          View full profile <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </div>
  );
}

export default function JobCandidatesPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { getJobDetail, getJobCandidates, shortlistCandidate, isLoading } = useRecruiter();
  const [job, setJob] = useState<RecruiterJob | null>(null);
  const [candidates, setCandidates] = useState<CandidateMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'eligible' | 'shortlisted' | 'applied'>('all');

  useEffect(() => {
    if (!jobId) return;
    getJobDetail(jobId).then(setJob);
    getJobCandidates(jobId).then(setCandidates);
  }, [jobId]);

  const handleShortlist = async (candidateId: string) => {
    const success = await shortlistCandidate(jobId, candidateId);
    if (success) {
      setCandidates(prev => prev.map(c =>
        c.candidate_id === candidateId ? { ...c, shortlisted: true } : c
      ));
    }
  };

  const handleExport = () => {
    const shortlisted = candidates.filter(c => c.shortlisted);
    if (!shortlisted.length) return;
    const csv = [
      ['Name', 'Email', 'Match Score %', 'Status'],
      ...shortlisted.map(c => [c.name, c.email, Math.round(c.match_score), 'Shortlisted'])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `shortlist_${jobId}.csv`;
    a.click();
  };

  const filtered = candidates
    .filter(c => {
      const q = searchQuery.toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
      if (filter === 'eligible' && c.match_score < 50) return false;
      if (filter === 'shortlisted' && !c.shortlisted) return false;
      if (filter === 'applied' && !c.applied) return false;
      return true;
    });

  const shortlistedCount = candidates.filter(c => c.shortlisted).length;
  const appliedCount = candidates.filter(c => c.applied).length;
  const eligibleCount = candidates.filter(c => c.match_score >= 80).length;
  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((s, c) => s + c.match_score, 0) / candidates.length)
    : 0;

  return (
    <RecruiterLayout>
      <div className="max-w-6xl mx-auto space-y-6 p-6">
        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </button>

        {/* Job header */}
        {job && (
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 flex-shrink-0">
                  <Briefcase className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">{job.title}</h1>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-slate-500">
                    <span className="capitalize">{job.role_type.replace(/-/g, ' ')}</span>
                    {job.duration && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{job.duration}</span>}
                    {job.stipend && <span>{job.stipend}</span>}
                  </div>
                </div>
              </div>
              <button onClick={handleExport} disabled={shortlistedCount === 0}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors flex-shrink-0">
                <Download className="h-4 w-4" />
                Export Shortlist ({shortlistedCount})
              </button>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5 border-t border-slate-100">
              {[
                { label: 'Total Candidates', value: candidates.length, icon: Users, color: 'text-indigo-600' },
                { label: 'Applied', value: appliedCount, icon: Clock, color: 'text-blue-600' },
                { label: 'Eligible (≥80%)', value: eligibleCount, icon: CheckCircle, color: 'text-emerald-600' },
                { label: 'Avg Match Score', value: `${avgScore}%`, icon: Award, color: 'text-amber-600' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="text-center">
                  <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
                  <p className="text-lg font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search by name or email..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 overflow-x-auto">
            {(['all', 'applied', 'eligible', 'shortlisted'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Candidates grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">
              {candidates.length === 0 ? 'No candidates yet for this job.' : 'No candidates match your filter.'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-500">{filtered.length} candidate{filtered.length !== 1 ? 's' : ''} shown</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((c, i) => (
                <CandidateCard key={c.candidate_id} candidate={c} rank={i + 1} jobId={jobId} onShortlist={handleShortlist} />
              ))}
            </div>
          </>
        )}
      </div>
    </RecruiterLayout>
  );
}
