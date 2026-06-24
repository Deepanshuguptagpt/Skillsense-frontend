'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, User, Mail, Building, GraduationCap, Github, Linkedin,
  CheckCircle, AlertCircle, XCircle, Star, BarChart2, Briefcase,
  BookOpen, ExternalLink, Code2, Shield, Zap, Award, TrendingUp,
} from 'lucide-react';
import RecruiterLayout from '@/components/Layout/RecruiterLayout';
import { useRecruiter } from '@/hooks/useRecruiter';

interface SkillItem {
  name: string;
  source: string;
  confidence_weight: number;
  proficiency_level: number;
  verified: boolean;
  category: string;
}

interface GitHubProject {
  repo_name: string;
  repo_url: string;
  summary?: string;
  tech_stack?: string[];
  project_type?: string;
  stars?: number;
}

interface CandidateDetail {
  candidate_id: string;
  user_id: string;
  name: string;
  email: string;
  college?: string;
  graduation_year?: number;
  bio?: string;
  github_url?: string;
  linkedin_url?: string;
  skill_count: number;
  verified_skill_count: number;
  readiness_score?: number;
  readiness_classification?: string;
  match_score?: number;
  match_score_breakdown?: any;
  github_projects?: GitHubProject[];
  skills?: SkillItem[];
}

const SOURCE_CONFIG: Record<string, { label: string; color: string; weight: string }> = {
  milestone: { label: 'Milestone', color: 'bg-purple-100 text-purple-700', weight: '0.9' },
  quiz:      { label: 'Quiz',      color: 'bg-blue-100 text-blue-700',   weight: '0.8' },
  github:    { label: 'GitHub',    color: 'bg-slate-100 text-slate-700', weight: '0.6-0.7' },
  project:   { label: 'Project',   color: 'bg-amber-100 text-amber-700', weight: '0.5' },
  manual:    { label: 'Manual',    color: 'bg-green-100 text-green-700', weight: '0.4' },
  resume:    { label: 'Resume',    color: 'bg-orange-100 text-orange-700', weight: '0.3' },
};

function ClassificationBadge({ classification }: { classification?: string }) {
  if (!classification) return null;
  const map: Record<string, { label: string; cls: string; icon: typeof CheckCircle }> = {
    eligible:        { label: 'Eligible',        cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
    'almost-eligible': { label: 'Almost Eligible', cls: 'bg-amber-100 text-amber-700',   icon: AlertCircle },
    'not-eligible':  { label: 'Not Eligible',    cls: 'bg-red-100 text-red-700',         icon: XCircle },
  };
  const cfg = map[classification] ?? map['not-eligible'];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.cls}`}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
    </span>
  );
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const pct = Math.min(Math.round(score), 100);
  const r = size * 0.38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={size*0.1} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size*0.1}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.7s ease' }} />
    </svg>
  );
}

export default function CandidateDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const candidateId = params.id as string;
  const jobId = searchParams.get('job_id') ?? undefined;

  const { getCandidateDetail, isLoading } = useRecruiter();
  const [candidate, setCandidate] = useState<CandidateDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'github' | 'match'>('overview');

  useEffect(() => {
    if (candidateId) {
      getCandidateDetail(candidateId, jobId).then((d) => setCandidate(d as any));
    }
  }, [candidateId, jobId]);

  if (isLoading || !candidate) {
    return (
      <RecruiterLayout>
        <div className="p-6 max-w-5xl mx-auto space-y-4">
          <div className="h-8 w-48 rounded-lg bg-slate-100 animate-pulse" />
          <div className="h-48 rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
        </div>
      </RecruiterLayout>
    );
  }

  const skillDetails: any[] = candidate.match_score_breakdown?.skill_details ?? [];
  const skills = candidate.skills ?? [];
  const githubProjects = candidate.github_projects ?? [];
  const matchScore = candidate.match_score ?? 0;
  const readinessScore = candidate.readiness_score ?? 0;

  // Group skills by source
  const skillsBySource = skills.reduce((acc, s) => {
    const src = s.source || 'manual';
    if (!acc[src]) acc[src] = [];
    acc[src].push(s);
    return acc;
  }, {} as Record<string, SkillItem[]>);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'skills', label: `Skills (${skills.length})`, icon: Award },
    { id: 'github', label: `GitHub (${githubProjects.length})`, icon: Github },
    { id: 'match', label: 'Match Breakdown', icon: BarChart2 },
  ] as const;

  return (
    <RecruiterLayout>
      <div className="max-w-5xl mx-auto space-y-6 p-6">
        {/* Back */}
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to shortlist
        </button>

        {/* Hero card */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            {/* Avatar */}
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white flex-shrink-0">
              {candidate.name?.charAt(0).toUpperCase() ?? 'C'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-xl font-semibold text-slate-900">{candidate.name}</h1>
                <ClassificationBadge classification={candidate.readiness_classification ?? undefined} />
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{candidate.email}</span>
                {candidate.college && <span className="flex items-center gap-1.5"><Building className="h-3.5 w-3.5" />{candidate.college}</span>}
                {candidate.graduation_year && <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />{candidate.graduation_year}</span>}
              </div>

              <div className="mt-3 flex gap-3">
                {candidate.github_url && (
                  <a href={candidate.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Github className="h-3.5 w-3.5" />
                    GitHub Profile
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </a>
                )}
                {candidate.linkedin_url && (
                  <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                    <Linkedin className="h-3.5 w-3.5" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </a>
                )}
              </div>
            </div>

            {/* Score rings */}
            <div className="flex gap-6 flex-shrink-0">
              <div className="text-center">
                <div className="relative inline-flex">
                  <ScoreRing score={readinessScore} size={72} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-base font-bold text-slate-900">{Math.round(readinessScore)}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">Readiness</p>
              </div>
              {candidate.match_score != null && (
                <div className="text-center">
                  <div className="relative inline-flex">
                    <ScoreRing score={matchScore} size={72} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-bold text-slate-900">{Math.round(matchScore)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Match</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
            {[
              { label: 'Total Skills', value: candidate.skill_count, icon: Award, color: 'text-indigo-600' },
              { label: 'Verified', value: candidate.verified_skill_count, icon: CheckCircle, color: 'text-emerald-600' },
              { label: 'GitHub Projects', value: githubProjects.length, icon: Github, color: 'text-slate-700' },
              { label: 'Evidence Sources', value: Object.keys(skillsBySource).length, icon: Shield, color: 'text-purple-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center rounded-lg bg-slate-50 p-3">
                <Icon className={`h-4 w-4 mx-auto mb-1 ${color}`} />
                <p className="text-lg font-bold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                activeTab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}>
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {candidate.bio && (
              <div className="card">
                <h3 className="text-sm font-semibold text-slate-900 mb-2">About</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{candidate.bio}</p>
              </div>
            )}

            {/* Evidence breakdown */}
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Skill Evidence Sources</h3>
              <div className="space-y-3">
                {Object.entries(skillsBySource)
                  .sort((a, b) => {
                    const order = ['milestone', 'quiz', 'github', 'project', 'manual', 'resume'];
                    return order.indexOf(a[0]) - order.indexOf(b[0]);
                  })
                  .map(([source, sourceSkills]) => {
                    const cfg = SOURCE_CONFIG[source] || { label: source, color: 'bg-slate-100 text-slate-600', weight: '?' };
                    return (
                      <div key={source} className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full transition-all"
                            style={{ width: `${Math.min((sourceSkills.length / skills.length) * 100, 100)}%` }} />
                        </div>
                        <span className="text-xs text-slate-500 flex-shrink-0 w-16 text-right">
                          {sourceSkills.length} skills
                        </span>
                        <span className="text-xs text-slate-400 flex-shrink-0 w-12 text-right">
                          w={cfg.weight}
                        </span>
                      </div>
                    );
                  })}
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Higher weight = stronger evidence. Milestone (0.9) &gt; Quiz (0.8) &gt; GitHub (0.6-0.7) &gt; Project (0.5) &gt; Manual (0.4) &gt; Resume (0.3)
              </p>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">All Skills ({skills.length})</h3>
            {skills.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No skills recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {skills.map((skill) => {
                  const cfg = SOURCE_CONFIG[skill.source] || { label: skill.source, color: 'bg-slate-100 text-slate-600', weight: '?' };
                  const pct = Math.round(skill.confidence_weight * 100);
                  const barColor = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-slate-400';
                  return (
                    <div key={skill.name} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800 truncate">{skill.name}</span>
                          {skill.verified && <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />}
                        </div>
                        <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                      <span className="flex-shrink-0 text-xs text-slate-400 w-8 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'github' && (
          <div className="space-y-4">
            {candidate.github_url && (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Github className="h-5 w-5 text-slate-700" />
                <a href={candidate.github_url} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:underline">
                  {candidate.github_url}
                </a>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              </div>
            )}

            {githubProjects.length === 0 ? (
              <div className="card text-center py-10">
                <Github className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">No GitHub projects analyzed yet.</p>
                <p className="text-xs text-slate-400 mt-1">The candidate hasn't linked their GitHub profile.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {githubProjects.map((proj) => (
                  <div key={proj.repo_name} className="card hover:border-indigo-200 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <a href={proj.repo_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 font-semibold text-slate-900 hover:text-indigo-600 transition-colors text-sm">
                          <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                          <span className="truncate">{proj.repo_name}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0 text-slate-400" />
                        </a>
                        {proj.project_type && proj.project_type !== 'other' && (
                          <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 capitalize">
                            {proj.project_type}
                          </span>
                        )}
                      </div>
                      {(proj.stars ?? 0) > 0 && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 flex-shrink-0">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {proj.stars}
                        </div>
                      )}
                    </div>

                    {proj.summary && (
                      <p className="text-xs text-slate-600 leading-relaxed mb-3 line-clamp-3">{proj.summary}</p>
                    )}

                    {proj.tech_stack && proj.tech_stack.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {proj.tech_stack.slice(0, 5).map((tech) => (
                          <span key={tech} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {tech}
                          </span>
                        ))}
                        {proj.tech_stack.length > 5 && (
                          <span className="text-xs text-slate-400">+{proj.tech_stack.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'match' && (
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              Per-Skill Match Breakdown
              {candidate.match_score != null && (
                <span className="ml-2 text-indigo-600">— Overall: {Math.round(matchScore)}%</span>
              )}
            </h3>

            {skillDetails.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No match breakdown available. Select a job to compute match scores.
              </p>
            ) : (
              <div className="space-y-3">
                {skillDetails.map((s: any) => {
                  const severityConfig: Record<string, { cls: string; label: string }> = {
                    none:     { cls: 'text-emerald-600', label: 'Met' },
                    minor:    { cls: 'text-amber-600',   label: 'Minor gap' },
                    moderate: { cls: 'text-orange-600',  label: 'Moderate gap' },
                    critical: { cls: 'text-red-600',     label: 'Missing' },
                  };
                  const sev = severityConfig[s.severity] ?? severityConfig.critical;
                  const userPct = s.user_proficiency ?? 0;
                  const reqPct = s.required_proficiency ?? 60;
                  const barColor = s.severity === 'none' ? 'bg-emerald-500' : s.severity === 'minor' ? 'bg-amber-500' : 'bg-red-400';

                  return (
                    <div key={s.skill_name} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-medium text-slate-800 truncate">{s.skill_name}</span>
                          {s.mandatory && (
                            <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600 flex-shrink-0">Required</span>
                          )}
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0 ${sev.cls}`}>{sev.label}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Candidate: {userPct}%</span>
                          <span>Required: {reqPct}%</span>
                        </div>
                        <div className="relative h-2 w-full rounded-full bg-slate-200">
                          {/* Required marker */}
                          <div className="absolute top-0 h-2 w-0.5 bg-slate-500 rounded-full z-10"
                            style={{ left: `${Math.min(reqPct, 100)}%` }} />
                          {/* Candidate bar */}
                          <div className={`h-2 rounded-full transition-all ${barColor}`}
                            style={{ width: `${Math.min(userPct, 100)}%` }} />
                        </div>
                      </div>
                      <div className="mt-1.5 flex justify-between text-xs text-slate-400">
                        <span>Evidence weight: {Math.round((s.confidence_weight ?? 0) * 100)}%</span>
                        <span>Contribution: {Math.round((s.contribution ?? 0) * 100) / 100}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </RecruiterLayout>
  );
}
