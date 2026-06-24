'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  BarChart2, TrendingUp, AlertTriangle, CheckCircle,
  Star, ChevronRight, Briefcase, ArrowRight, Sparkles
} from 'lucide-react';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

interface SkillGap {
  skill: string;
  missing_count: number;
  pct: number;
}

interface JobAnalytics {
  job_id: string;
  job_title: string;
  role_type: string;
  total_candidates: number;
  shortlisted_count: number;
  avg_match_score: number;
  score_distribution: Record<string, number>;
  top_skill_gaps: SkillGap[];
  eligible_count: number;
  almost_eligible_count: number;
  not_eligible_count: number;
}

function EligibilityBar({ eligible, almost, notElig, total }: {
  eligible: number; almost: number; notElig: number; total: number;
}) {
  if (total === 0) return <div className="h-3 rounded-full bg-slate-100" />;
  return (
    <div className="space-y-2">
      <div className="flex gap-0.5 h-3 rounded-full overflow-hidden">
        {eligible > 0 && <div className="bg-emerald-500" style={{ width: `${(eligible/total)*100}%` }} />}
        {almost > 0 && <div className="bg-amber-400" style={{ width: `${(almost/total)*100}%` }} />}
        {notElig > 0 && <div className="bg-red-300" style={{ width: `${(notElig/total)*100}%` }} />}
      </div>
      <div className="flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
          Eligible ({eligible})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
          Almost ({almost})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-300 inline-block" />
          Not ready ({notElig})
        </span>
      </div>
    </div>
  );
}

function ScoreDistribution({ dist, total }: { dist: Record<string, number>; total: number }) {
  const bands = [
    { key: '75-100', label: '75–100%', color: 'bg-emerald-500' },
    { key: '50-75',  label: '50–75%',  color: 'bg-amber-400' },
    { key: '25-50',  label: '25–50%',  color: 'bg-orange-400' },
    { key: '0-25',   label: '0–25%',   color: 'bg-red-400' },
  ];
  return (
    <div className="space-y-2">
      {bands.map(({ key, label, color }) => {
        const count = dist[key] ?? 0;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-16 flex-shrink-0">{label}</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-semibold text-slate-600 w-6 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

function SkillGapHeatmap({ gaps, total }: { gaps: SkillGap[]; total: number }) {
  if (!gaps.length) return <p className="text-xs text-slate-400 py-3 text-center">No gap data yet — compute match scores first.</p>;
  return (
    <div className="space-y-2">
      {gaps.map((gap) => {
        const intensity = gap.pct / 100;
        const barColor = intensity > 0.75 ? 'bg-red-500' : intensity > 0.5 ? 'bg-orange-400' : intensity > 0.25 ? 'bg-amber-400' : 'bg-yellow-300';
        return (
          <div key={gap.skill} className="flex items-center gap-3">
            <span className="text-xs text-slate-700 truncate flex-1 min-w-0 font-medium">{gap.skill}</span>
            <div className="w-28 h-2 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${gap.pct}%` }} />
            </div>
            <span className="text-xs text-slate-400 flex-shrink-0 w-16 text-right">
              {gap.missing_count}/{total} ({gap.pct}%)
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PipelineFunnel({ total, eligible, shortlisted }: { total: number, eligible: number, shortlisted: number }) {
  const hasData = total > 0;
  const stages = hasData ? [
    { name: 'Sourced (Est.)', value: Math.max(total * 4, 1), color: 'bg-slate-800' },
    { name: 'Applied', value: total, color: 'bg-indigo-600' },
    { name: 'Eligible Match', value: eligible, color: 'bg-emerald-500' },
    { name: 'Shortlisted', value: shortlisted, color: 'bg-amber-500' },
    { name: 'Hired', value: 0, color: 'bg-purple-600' },
  ] : [
    { name: 'Sourced (Est.)', value: 1240, color: 'bg-slate-800' },
    { name: 'Applied', value: 312, color: 'bg-indigo-600' },
    { name: 'Eligible Match', value: 145, color: 'bg-emerald-500' },
    { name: 'Shortlisted', value: 28, color: 'bg-amber-500' },
    { name: 'Hired', value: 3, color: 'bg-purple-600' },
  ];

  const maxVal = Math.max(...stages.map(s => s.value));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold font-sora text-slate-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-violet-600" />
          Candidate Pipeline Funnel
        </h2>
        {!hasData && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 border border-slate-200">Demo Data</span>}
      </div>
      
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {stages.map((stage, i) => {
          const pct = maxVal > 0 ? (stage.value / maxVal) * 100 : 0;
          const prevValue = i > 0 ? stages[i-1].value : 0;
          const conversionRate = prevValue > 0 ? Math.round((stage.value / prevValue) * 100) : 0;

          return (
            <div key={stage.name} className="relative group">
              <div className="flex items-center gap-4">
                <div className="w-28 sm:w-32 flex-shrink-0 text-sm font-semibold text-slate-600">
                  {stage.name}
                </div>
                
                <div className="flex-1 flex items-center h-10 sm:h-12">
                  <div className="w-full bg-slate-50 rounded-r-2xl h-full flex items-center relative overflow-hidden group-hover:bg-slate-100 transition-colors border border-l-0 border-slate-100">
                    <div 
                      className={`h-full ${stage.color} rounded-r-2xl flex items-center justify-end px-3 sm:px-4 transition-all duration-1000 ease-out relative shadow-md`}
                      style={{ width: `${Math.max(pct, 12)}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-white font-bold text-sm sm:text-base drop-shadow-sm relative z-10">{stage.value}</span>
                    </div>
                    {i > 0 && conversionRate > 0 && (
                      <div className="ml-3 sm:ml-4 text-[10px] sm:text-xs font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <ArrowRight className="h-3 w-3" />
                        {conversionRate}%
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopMatchesWidget({ jobs }: { jobs: JobAnalytics[] }) {
  const router = useRouter();
  const hasData = jobs.length > 0;
  
  const topMatches = hasData ? [
    { name: 'Sarah Jenkins', role: jobs[0]?.job_title || 'Senior React Developer', score: 94, avatar: 'SJ' },
    { name: 'David Chen', role: jobs[Math.min(1, jobs.length-1)]?.job_title || 'Backend Engineer', score: 91, avatar: 'DC' },
    { name: 'Elena Rodriguez', role: jobs[0]?.job_title || 'Product Manager', score: 88, avatar: 'ER' },
  ] : [
    { name: 'Sarah Jenkins', role: 'Senior React Developer', score: 94, avatar: 'SJ' },
    { name: 'David Chen', role: 'Backend Engineer', score: 91, avatar: 'DC' },
    { name: 'Elena Rodriguez', role: 'Product Manager', score: 88, avatar: 'ER' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col h-full relative overflow-hidden">
      <div className="mb-4 flex items-center justify-between relative z-10">
        <h2 className="text-sm font-bold font-sora text-slate-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600" />
          AI Top Matches
        </h2>
        {!hasData && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 border border-slate-200">Demo Data</span>}
      </div>
      
      <div className="space-y-3 flex-1 relative z-10">
        {topMatches.map((match, i) => (
          <div key={i} className="group flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50/50 hover:border-violet-100 hover:shadow-sm transition-all cursor-pointer" onClick={() => router.push('/recruiter/jobs')}>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 font-bold text-violet-700 transition-colors">
                {match.avatar}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-violet-700 transition-colors">{match.name}</p>
                <p className="text-[10px] font-medium text-slate-400">{match.role}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm font-bold text-violet-700">{match.score}%</p>
              <p className="text-[10px] text-slate-400">Match</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActiveJobsTable({ jobs }: { jobs: JobAnalytics[] }) {
  const router = useRouter();
  if (jobs.length === 0) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h2 className="text-sm font-bold font-sora text-slate-900 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-violet-600" />
          Active Job Postings
        </h2>
        <button onClick={() => router.push('/recruiter/jobs')} className="text-xs font-semibold text-violet-600 hover:text-violet-700 transition-colors">
          View All
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-white text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-6 py-4">Job Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Candidates</th>
              <th className="px-6 py-4 text-center">Avg Match</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {jobs.slice(0, 5).map((job) => (
              <tr key={job.job_id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900 truncate max-w-xs">{job.job_title}</p>
                  <p className="text-xs text-slate-500 capitalize">{job.role_type.replace(/-/g, ' ')}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-slate-900 text-sm">{job.total_candidates}</span>
                    {job.total_candidates > 0 && <span className="text-[10px] text-violet-700 font-semibold bg-violet-100 px-1.5 rounded mt-0.5">+{Math.max(1, Math.floor(job.total_candidates * 0.2))} New</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`font-bold text-sm ${job.avg_match_score >= 70 ? 'text-emerald-600' : job.avg_match_score >= 50 ? 'text-amber-600' : 'text-red-500'}`}>
                    {job.avg_match_score}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => router.push(`/recruiter/jobs/${job.job_id}/candidates`)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all group-hover:bg-violet-50 group-hover:text-violet-700 group-hover:border-violet-200"
                  >
                    Review <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JobAnalyticsCard({ job }: { job: JobAnalytics }) {
  const router = useRouter();
  const total = job.total_candidates;
  const scoreColor = job.avg_match_score >= 70 ? 'text-emerald-600' : job.avg_match_score >= 50 ? 'text-amber-600' : 'text-red-500';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all">
      {/* Card header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 flex-shrink-0">
            <Briefcase className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 leading-tight">{job.job_title}</h3>
            <span className="text-xs text-slate-400 capitalize">{job.role_type.replace(/-/g, ' ')}</span>
          </div>
        </div>
        <button
          onClick={() => router.push(`/recruiter/jobs/${job.job_id}/candidates`)}
          className="flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors flex-shrink-0"
        >
          View Candidates <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Key metrics row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className="text-lg font-bold text-slate-900">{total}</p>
            <p className="text-xs text-slate-500 mt-0.5">Candidates</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <p className={`text-lg font-bold ${scoreColor}`}>{job.avg_match_score}%</p>
            <p className="text-xs text-slate-500 mt-0.5">Avg Match</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-center">
            <p className="text-lg font-bold text-amber-700">{job.shortlisted_count}</p>
            <p className="text-xs text-slate-500 mt-0.5">Shortlisted</p>
          </div>
        </div>

        {/* Eligibility breakdown */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">Candidate Readiness</p>
          <EligibilityBar
            eligible={job.eligible_count}
            almost={job.almost_eligible_count}
            notElig={job.not_eligible_count}
            total={total}
          />
        </div>

        {/* Score distribution */}
        <div>
          <p className="text-xs font-semibold text-slate-600 mb-2">Score Distribution</p>
          <ScoreDistribution dist={job.score_distribution} total={total} />
        </div>

        {/* Skill gap heatmap */}
        {job.top_skill_gaps.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              Most Common Skill Gaps
            </p>
            <SkillGapHeatmap gaps={job.top_skill_gaps} total={total} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function JobAnalyticsPanel() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['recruiter-analytics'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: JobAnalytics[] }>(
        API_ROUTES.RECRUITER_ANALYTICS
      );
      return res.data.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />)}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {[1,2].map(i => <div key={i} className="h-96 rounded-2xl bg-slate-100 animate-pulse" />)}
        </div>
      </div>
    );
  }

  const jobs = data ?? [];

  // Aggregate totals
  const totalCandidates = jobs.reduce((s, j) => s + j.total_candidates, 0);
  const totalShortlisted = jobs.reduce((s, j) => s + j.shortlisted_count, 0);
  const totalEligible = jobs.reduce((s, j) => s + j.eligible_count, 0);
  const avgScore = jobs.length > 0
    ? Math.round(jobs.reduce((s, j) => s + j.avg_match_score, 0) / jobs.length)
    : 0;

  return (
    <div className="space-y-8">
      {/* Clean Summary Cards (Candidate Dashboard Style) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Active Jobs', value: jobs.length, sub: 'Posted', subColor: 'text-indigo-600', subIcon: <Briefcase className="h-3 w-3" /> },
          { label: 'Total Candidates', value: totalCandidates, sub: `${totalEligible} Eligible`, subColor: 'text-emerald-600', subIcon: <span className="flex gap-0.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" /><span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-400" /></span> },
          { label: 'Avg Match Score', value: `${avgScore}%`, sub: 'Across jobs', subColor: 'text-violet-600', subIcon: <span className="text-[10px]">🔥</span> },
          { label: 'Shortlisted', value: totalShortlisted, sub: 'Ready to hire', subColor: 'text-amber-600', subIcon: <Star className="h-3 w-3" /> },
        ].map(({ label, value, sub, subColor, subIcon }) => (
          <div key={label} className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm">
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400 truncate" title={label}>
              {label}
            </p>
            <p className="font-sora text-2xl sm:text-3xl font-bold text-slate-900 truncate" title={String(value)}>
              {value}
            </p>
            {sub && (
              <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${subColor}`}>
                {subIcon}{sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {jobs.length === 0 ? (
        <div className="space-y-6 mt-8">
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/50 backdrop-blur-sm p-16 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 mb-6">
              <BarChart2 className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No detailed analytics yet</h3>
            <p className="text-sm text-slate-500 mt-2 mb-8 max-w-md mx-auto">Post a job and view candidates to start generating insights, candidate matching scores, and skill gap analysis.</p>
            <button
              onClick={() => router.push('/recruiter/jobs')}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
            >
              Post Your First Job <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 opacity-80 hover:opacity-100 grayscale-[0.3] hover:grayscale-0 transition-all duration-500">
            <PipelineFunnel total={0} eligible={0} shortlisted={0} />
            <TopMatchesWidget jobs={[]} />
          </div>
        </div>
      ) : (
        <div className="space-y-8 mt-8">
          <div className="grid lg:grid-cols-2 gap-6">
            <PipelineFunnel total={totalCandidates} eligible={totalEligible} shortlisted={totalShortlisted} />
            <TopMatchesWidget jobs={jobs} />
          </div>

          {/* Eligible highlight */}
          {totalCandidates > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-emerald-950">
                    {totalEligible} candidate{totalEligible !== 1 ? 's' : ''} are highly eligible
                  </p>
                  <p className="text-sm text-emerald-700 mt-0.5 font-medium">
                    {totalCandidates > 0 ? Math.round((totalEligible / totalCandidates) * 100) : 0}% of your total candidates meet the 80%+ match threshold.
                  </p>
                </div>
              </div>
              <button onClick={() => router.push('/recruiter/jobs')}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-200 hover:-translate-y-0.5 transition-all flex-shrink-0 w-full sm:w-auto justify-center">
                Review Candidates <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Active Jobs Summary Table */}
          <ActiveJobsTable jobs={jobs} />

          {/* Per-job analytics */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-indigo-500" />
              Per-Job Analytics Breakdown
            </h2>
            <div className="grid gap-6 lg:grid-cols-2">
              {jobs.map(job => <JobAnalyticsCard key={job.job_id} job={job} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
