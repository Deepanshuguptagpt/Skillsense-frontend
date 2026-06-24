'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, ExternalLink, MapPin, Clock, IndianRupee, Calendar,
  CheckCircle, AlertTriangle, BookOpen, Zap, Award, Star,
  AlertCircle, TrendingUp, Target,
} from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import ApplicationTracker from '@/components/Internships/ApplicationTracker';

interface LearningResource {
  title: string; url: string; type: string; platform: string; duration: string; free: boolean;
}
interface LearningStep {
  step: number; skillName: string; currentProficiency: number; targetProficiency: number;
  gap: number; mandatory: boolean; priority: 'high' | 'medium' | 'low'; estimatedWeeks: number;
  resources: LearningResource[];
}
interface InternshipDetail {
  internshipId: string; title: string; company: string; description: string; location: string;
  type: string; duration: string; stipend?: { display: string; amount: number };
  category: string; subcategory: string; tags: string[]; benefits: string[];
  eligibilityCriteria: string; applicationUrl: string; applicationDeadline?: string;
  requiredSkills: Array<{ name: string; proficiencyLevel: number; mandatory: boolean; weight: number }>;
  matchScore?: number; matchedSkills?: string[];
  missingSkills?: Array<{ skillName: string; required: boolean; currentProficiency: number; targetProficiency: number; priority: string; gap: number }>;
  learningPath?: LearningStep[];
}

const CATEGORY_COLORS: Record<string, string> = {
  faang: 'bg-rose-100 text-rose-700 border-rose-200',
  mnc: 'bg-teal-100 text-teal-700 border-teal-200',
  government: 'bg-blue-100 text-blue-700 border-blue-200',
  psu: 'bg-orange-100 text-orange-700 border-orange-200',
  academic: 'bg-purple-100 text-purple-700 border-purple-200',
  startup: 'bg-violet-100 text-violet-700 border-violet-200',
};
const PERK_COLORS = ['bg-violet-100 text-violet-600','bg-emerald-100 text-emerald-600','bg-amber-100 text-amber-600','bg-blue-100 text-blue-600'];

function MatchScoreRing({ score }: { score: number }) {
  const r = 40; const circ = 2 * Math.PI * r; const offset = circ * (1 - score / 100);
  const strokeColor = score >= 80 ? '#7c3aed' : score >= 55 ? '#f59e0b' : '#ef4444';
  const scoreTextColor = score >= 80 ? 'text-violet-700' : score >= 55 ? 'text-amber-600' : 'text-red-500';
  const eligibilityLabel = score >= 80 ? 'Eligible' : score >= 55 ? 'Almost' : 'Not Eligible';
  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle cx="48" cy="48" r={r} fill="none" stroke={strokeColor} strokeWidth="8" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-sora text-xl font-extrabold', scoreTextColor)}>{Math.round(score)}%</span>
        </div>
      </div>
      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">MATCH SCORE</span>
      <span className={cn('text-xs font-semibold', scoreTextColor)}>{eligibilityLabel}</span>
    </div>
  );
}

export default function InternshipDetailPage() {
  const params = useParams(); const router = useRouter(); const id = params.id as string;
  const { data, isLoading, error } = useQuery({
    queryKey: ['internship-detail', id],
    queryFn: async () => { const res = await api.get<{ success: boolean; data: InternshipDetail }>(API_ROUTES.INTERNSHIP_DETAIL(id)); return res.data.data; },
    enabled: !!id, staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <MainLayout><div className="max-w-5xl mx-auto p-6 space-y-4"><div className="gradient-skeleton h-6 w-44 rounded-xl" /><div className="gradient-skeleton h-44 rounded-2xl" /><div className="gradient-skeleton h-72 rounded-2xl" /></div></MainLayout>;
  if (error || !data) return <MainLayout><div className="max-w-5xl mx-auto p-6 text-center py-20"><AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" /><p className="text-lg font-medium text-slate-700">Internship not found</p><button onClick={() => router.back()} className="mt-4 text-violet-600 hover:underline text-sm">← Go back</button></div></MainLayout>;

  const matchScore = data.matchScore ?? 0;
  const matchedSkills = data.matchedSkills ?? [];
  const missingSkills = data.missingSkills ?? [];
  const learningPath = data.learningPath ?? [];
  const totalWeeks = learningPath.reduce((sum, s) => sum + s.estimatedWeeks, 0);
  const isEligible = matchScore >= 80 && missingSkills.length === 0;

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Back + Quick Apply */}
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Internships
          </button>
          {data.applicationUrl && (
            <a href={data.applicationUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-violet-700 hover:-translate-y-0.5 transition-all">
              <Zap className="h-4 w-4" /> Quick Apply
            </a>
          )}
        </div>

        {/* Header card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-extrabold text-white shadow-md">
              {data.company.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-semibold', CATEGORY_COLORS[data.category] || 'bg-slate-100 text-slate-600 border-slate-200')}>{data.category?.toUpperCase()}</span>
                {data.tags?.includes('flagship') && <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700"><Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Flagship</span>}
                {data.tags?.includes('prestigious') && <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700"><Award className="h-3 w-3" /> Prestigious</span>}
              </div>
              <h1 className="font-sora text-2xl font-extrabold text-slate-900 leading-tight">{data.title}</h1>
              <p className="text-sm text-slate-500 mt-0.5">{data.company}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                {data.stipend?.display && <span className="flex items-center gap-1 text-sm font-semibold text-emerald-600"><IndianRupee className="h-3.5 w-3.5" />{data.stipend.display}</span>}
                {data.duration && <span className="flex items-center gap-1 text-sm text-slate-500"><Clock className="h-3.5 w-3.5" />{data.duration}</span>}
                {data.applicationDeadline && <span className="flex items-center gap-1 text-sm text-slate-500"><Calendar className="h-3.5 w-3.5" />Starts {new Date(data.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                {data.location && <span className="flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5" />{data.location}{data.type === 'remote' && <span className="text-slate-400"> (Remote)</span>}</span>}
              </div>
              {data.applicationUrl && <div className="mt-4"><ApplicationTracker internshipId={data.internshipId} internshipTitle={data.title} company={data.company} applicationUrl={data.applicationUrl} /></div>}
            </div>
            {matchScore > 0 && <div className="flex-shrink-0 self-center sm:self-start"><MatchScoreRing score={matchScore} /></div>}
          </div>
        </div>

        {/* Two-column body */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
              <h2 className="font-sora text-lg font-bold text-slate-900 mb-3">About the Role</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{data.description}</p>
              {data.eligibilityCriteria && (
                <div className="mt-5 rounded-xl bg-blue-50 border border-blue-100 p-4 flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center"><Target className="h-3.5 w-3.5 text-blue-600" /></div>
                  <div><p className="text-xs font-bold text-blue-700 mb-1">Eligibility Criteria</p><p className="text-sm text-blue-800">{data.eligibilityCriteria}</p></div>
                </div>
              )}
            </div>

            {/* Skill Match */}
            {(matchedSkills.length > 0 || missingSkills.length > 0) ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-sora text-lg font-bold text-slate-900">Your Skill Match</h2>
                  <a href="/profile" className="text-xs font-semibold text-violet-600 hover:underline">View detailed analysis →</a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-3"><CheckCircle className="h-3.5 w-3.5" /> Skills You Have ({matchedSkills.length})</p>
                    <div className="flex flex-wrap gap-2">{matchedSkills.map(skill => <span key={skill} className="rounded-full bg-emerald-100 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">{skill}</span>)}</div>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-3"><AlertTriangle className="h-3.5 w-3.5" /> Critical Gaps ({missingSkills.length})</p>
                    <div className="space-y-3">
                      {missingSkills.map(skill => (
                        <div key={skill.skillName}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-slate-800">{skill.skillName}</span>
                            <span className={cn('rounded-full px-1.5 py-0.5 text-xs font-bold', skill.priority === 'high' ? 'bg-red-100 text-red-700' : skill.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600')}>{skill.priority}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-red-100"><div className="h-1.5 rounded-full bg-red-400 transition-all" style={{ width: `${skill.currentProficiency}%` }} /></div>
                          <p className="text-xs text-slate-500 mt-0.5">{skill.currentProficiency}% → {skill.targetProficiency}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                  <Target className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700">No skill match data yet</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Add your skills to see how well you match this internship.</p>
                  <a href="/profile" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">Add Skills →</a>
                </div>
              </div>
            )}

            {/* Learning Path */}
            {learningPath.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-sora text-lg font-bold text-slate-900 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-violet-500" />Learning Path to Eligibility</h2>
                  {totalWeeks > 0 && <span className="rounded-full bg-violet-100 border border-violet-200 px-3 py-1 text-xs font-bold text-violet-700">~{totalWeeks} weeks total</span>}
                </div>
                <div className="relative space-y-0">
                  {learningPath.map((step, idx) => (
                    <div key={step.skillName} className="relative flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn('flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold z-10', idx === 0 ? 'bg-violet-600 text-white shadow-md' : 'bg-white border-2 border-violet-300 text-violet-600')}>{step.step}</div>
                        {idx < learningPath.length - 1 && <div className="w-0.5 flex-1 bg-violet-200 my-1" />}
                      </div>
                      <div className={cn('flex-1 rounded-xl border p-4 mb-4', idx === 0 ? 'border-violet-200 bg-violet-50' : 'border-slate-200 bg-slate-50')}>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="font-bold text-slate-900">{step.skillName}</span>
                          {step.mandatory && <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600">Mandatory</span>}
                          <span className="text-xs text-slate-500 ml-auto">~{step.estimatedWeeks} week{step.estimatedWeeks !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex-1 h-1.5 rounded-full bg-slate-200"><div className="h-1.5 rounded-full bg-violet-400 transition-all" style={{ width: `${step.currentProficiency}%` }} /></div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{step.currentProficiency}% → {step.targetProficiency}%</span>
                        </div>
                        {step.resources.length > 0 && (
                          <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mb-2"><BookOpen className="h-3 w-3" /> Resources</p>
                            {step.resources.map((res, ri) => (
                              <a key={ri} href={res.url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:border-violet-200 hover:shadow-sm transition-all group">
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><BookOpen className="h-3.5 w-3.5 text-violet-500" /></div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-800 group-hover:text-violet-700 truncate">{res.title}</p>
                                  <p className="text-xs text-slate-400">{res.platform} · {res.duration}</p>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {res.free && <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-xs font-bold text-emerald-700">Free</span>}
                                  <ExternalLink className="h-3 w-3 text-slate-400 group-hover:text-violet-500" />
                                </div>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 rounded-xl bg-violet-50 border border-violet-100 px-5 py-4 flex items-center gap-4">
                  <Zap className="h-5 w-5 text-violet-500 flex-shrink-0" />
                  <div className="flex-1"><p className="text-sm font-bold text-violet-900">Ready to start?</p><p className="text-xs text-violet-700 mt-0.5">~{totalWeeks} weeks to eligibility</p></div>
                  {data.applicationUrl && <a href={data.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 transition-colors">Apply <ExternalLink className="h-3 w-3" /></a>}
                </div>
              </div>
            )}

            {/* Eligible banner */}
            {isEligible && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-6 py-4 flex items-center gap-4">
                <CheckCircle className="h-7 w-7 text-emerald-500 flex-shrink-0" />
                <div className="flex-1"><p className="text-sm font-bold text-emerald-900">You&apos;re eligible!</p><p className="text-xs text-emerald-700 mt-0.5">Your skills match all requirements.</p></div>
                {data.applicationUrl && <a href={data.applicationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors">Apply Now <ExternalLink className="h-3 w-3" /></a>}
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
              <h3 className="font-sora text-sm font-bold text-slate-900 mb-4">Required Skills</h3>
              <div className="space-y-2.5">
                {data.requiredSkills?.map(skill => {
                  const isMatched = matchedSkills.includes(skill.name);
                  return (
                    <div key={skill.name} className="flex items-center gap-2">
                      <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', isMatched ? 'bg-emerald-500' : 'border-2 border-slate-300')} />
                      <span className={cn('flex-1 text-xs', isMatched ? 'font-semibold text-slate-800' : 'text-slate-400')}>{skill.name}{skill.mandatory && <span className="text-red-400 ml-0.5">*</span>}</span>
                      <span className={cn('text-xs', isMatched ? 'text-slate-500' : 'text-slate-300')}>{skill.proficiencyLevel}%</span>
                    </div>
                  );
                })}
              </div>
              {data.requiredSkills?.some(s => s.mandatory) && <p className="text-xs text-slate-400 mt-3">* mandatory</p>}
            </div>
            {data.benefits && data.benefits.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                <h3 className="font-sora text-sm font-bold text-slate-900 mb-4">Intern Perks</h3>
                <ul className="space-y-2.5">
                  {data.benefits.map((b, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className={cn('flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs', PERK_COLORS[i % PERK_COLORS.length])}>✦</div>
                      <span className="text-xs text-slate-600 leading-relaxed">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.tags && data.tags.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
                <h3 className="font-sora text-sm font-bold text-slate-900 mb-4">You might also like</h3>
                <div className="space-y-2.5">
                  {data.tags.slice(0, 3).map(tag => (
                    <div key={tag} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-slate-900 flex-shrink-0" />
                      <span className="flex-1 text-xs text-slate-700">{tag}</span>
                      <a href={`/internships?tag=${encodeURIComponent(tag)}`} className="text-xs font-semibold text-violet-600 hover:underline whitespace-nowrap">View →</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
