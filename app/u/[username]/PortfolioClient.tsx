'use client';

import { useState } from 'react';
import {
  Github, Linkedin, ExternalLink, CheckCircle, Copy, Check,
  GraduationCap, Zap, Star, BarChart3, Globe, Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortfolioData {
  profile: {
    fullName: string; username: string; bio: string;
    college: string; graduationYear: number | null;
    githubUrl: string; linkedinUrl: string; codingProfileUrl: string;
    avatarInitials: string;
  };
  stats: {
    totalSkills: number; verifiedSkills: number; avgProficiency: number;
    quizzesTaken: number; githubProjects: number; completenessPercent: number;
  };
  topSkills: SkillItem[];
  verifiedSkills: SkillItem[];
  allSkills: SkillItem[];
  categoryBreakdown: Record<string, number>;
  quizScores: Array<{ skillName: string; proficiency: number; lastUpdated: string | null }>;
  githubProjects: Array<{ name: string; description: string; url: string; stars: number; language: string }>;
  completenessItems: Array<{ label: string; done: boolean }>;
}

interface SkillItem {
  name: string; category: string; proficiencyLevel: number;
  verified: boolean; source: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  programming_language: 'bg-blue-100 text-blue-700',
  ml_framework: 'bg-rose-100 text-rose-700',
  framework: 'bg-violet-100 text-violet-700',
  tool: 'bg-slate-100 text-slate-700',
  vector_db: 'bg-teal-100 text-teal-700',
  database: 'bg-cyan-100 text-cyan-700',
  domain_knowledge: 'bg-amber-100 text-amber-700',
  methodology: 'bg-emerald-100 text-emerald-700',
  certification: 'bg-yellow-100 text-yellow-700',
  soft_skill: 'bg-pink-100 text-pink-700',
  devops_infra: 'bg-orange-100 text-orange-700',
  web_tech: 'bg-sky-100 text-sky-700',
  misc: 'bg-slate-100 text-slate-600',
};

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  github:    { label: 'GitHub',    color: 'bg-slate-800 text-white' },
  quiz:      { label: 'Quiz',      color: 'bg-indigo-100 text-indigo-700' },
  resume:    { label: 'Resume',    color: 'bg-blue-100 text-blue-700' },
  project:   { label: 'Project',  color: 'bg-emerald-100 text-emerald-700' },
  milestone: { label: 'Milestone',color: 'bg-amber-100 text-amber-700' },
  manual:    { label: 'Self',      color: 'bg-slate-100 text-slate-600' },
};

function ProficiencyBar({ value, verified }: { value: number; verified: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-slate-100">
        <div
          className={cn('h-1.5 rounded-full transition-all', verified ? 'bg-emerald-500' : 'bg-indigo-400')}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-8 text-right text-xs text-slate-500">{value}%</span>
    </div>
  );
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-1 rounded-xl border p-4 text-center', color)}>
      <div className="mb-1">{icon}</div>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs font-medium opacity-80">{label}</span>
    </div>
  );
}

export default function PortfolioClient({ data }: { data: PortfolioData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { profile, stats, verifiedSkills, allSkills, categoryBreakdown, quizScores, githubProjects, completenessItems } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      {/* Sticky topbar */}
      <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">SkillSense</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm text-slate-500">{profile.username}</span>
          </div>
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-8 px-6 py-8">
        {/* Hero */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <div className="px-6 pb-6">
            <div className="-mt-10 mb-4 flex items-end justify-between">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-indigo-100 to-indigo-200 text-2xl font-bold text-indigo-700 shadow-md">
                {profile.avatarInitials}
              </div>
              <div className="mb-1 flex gap-2">
                {profile.githubUrl && (
                  <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50">
                    <Github className="h-3.5 w-3.5" /> GitHub
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100">
                    <Linkedin className="h-3.5 w-3.5" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
            {profile.college && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <GraduationCap className="h-4 w-4" />
                {profile.college}{profile.graduationYear && ` · Class of ${profile.graduationYear}`}
              </p>
            )}
            {profile.bio && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{profile.bio}</p>}
            {/* Completeness bar */}
            <div className="mt-4 flex items-center gap-3">
              <div className="max-w-xs flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Profile completeness</span>
                  <span className="text-xs font-semibold text-indigo-600">{stats.completenessPercent}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-indigo-500 transition-all" style={{ width: `${stats.completenessPercent}%` }} />
                </div>
              </div>
              <div className="flex gap-1">
                {completenessItems.map((item, i) => (
                  <div key={i} title={item.label} className={cn('h-2 w-2 rounded-full', item.done ? 'bg-emerald-400' : 'bg-slate-200')} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={<BarChart3 className="h-5 w-5 text-indigo-500" />} value={stats.totalSkills} label="Total Skills" color="bg-white border-slate-200 text-slate-700" />
          <StatCard icon={<CheckCircle className="h-5 w-5 text-emerald-500" />} value={stats.verifiedSkills} label="Verified Skills" color="bg-emerald-50 border-emerald-200 text-emerald-800" />
          <StatCard icon={<Award className="h-5 w-5 text-indigo-500" />} value={stats.quizzesTaken} label="Quizzes Taken" color="bg-indigo-50 border-indigo-200 text-indigo-800" />
          <StatCard icon={<Github className="h-5 w-5 text-slate-600" />} value={stats.githubProjects} label="GitHub Projects" color="bg-white border-slate-200 text-slate-700" />
        </div>

        {/* Main 2/3 + 1/3 grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 lg:col-span-2">
            {/* Verified Skills */}
            {verifiedSkills.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Verified Skills
                  <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">{verifiedSkills.length}</span>
                </h2>
                <div className="space-y-3">
                  {verifiedSkills.map((skill) => (
                    <div key={skill.name} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-800">{skill.name}</span>
                          <span className={cn('rounded-full px-1.5 py-0.5 text-xs font-medium', CATEGORY_COLORS[skill.category] || 'bg-slate-100 text-slate-600')}>
                            {skill.category?.replace('_', ' ')}
                          </span>
                          <span className={cn('rounded-full px-1.5 py-0.5 text-xs font-medium', SOURCE_LABELS[skill.source]?.color || 'bg-slate-100 text-slate-600')}>
                            {SOURCE_LABELS[skill.source]?.label || skill.source}
                          </span>
                        </div>
                        <ProficiencyBar value={skill.proficiencyLevel} verified={skill.verified} />
                      </div>
                      <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Skills */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                <BarChart3 className="h-4 w-4 text-indigo-500" /> All Skills
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{allSkills.length}</span>
              </h2>
              <div className="space-y-2.5">
                {allSkills.map((skill) => (
                  <div key={skill.name} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-sm text-slate-700">{skill.name}</span>
                        {skill.verified && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                      </div>
                      <ProficiencyBar value={skill.proficiencyLevel} verified={skill.verified} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* GitHub Projects */}
            {githubProjects.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Github className="h-4 w-4 text-slate-700" /> GitHub Projects
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {githubProjects.map((project, i) => (
                    <a key={i} href={project.url} target="_blank" rel="noopener noreferrer"
                      className="group rounded-xl border border-slate-200 p-4 transition-all hover:border-indigo-200 hover:shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-700 truncate">{project.name}</span>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-indigo-500" />
                      </div>
                      {project.description && <p className="mt-1 line-clamp-2 text-xs text-slate-500">{project.description}</p>}
                      <div className="mt-2 flex items-center gap-3">
                        {project.language && <span className="text-xs text-slate-500">{project.language}</span>}
                        {project.stars > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {project.stars}
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Quiz scores */}
            {quizScores.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Award className="h-4 w-4 text-indigo-500" /> Quiz Scores
                </h3>
                <div className="space-y-3">
                  {quizScores.slice(0, 6).map((score) => (
                    <div key={score.skillName}>
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-700">{score.skillName}</span>
                        <span className="text-xs font-bold text-indigo-600">{score.proficiency}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100">
                        <div className="h-1.5 rounded-full bg-indigo-400" style={{ width: `${score.proficiency}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category breakdown */}
            {Object.keys(categoryBreakdown).length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Globe className="h-4 w-4 text-indigo-500" /> Skill Categories
                </h3>
                <div className="space-y-2">
                  {Object.entries(categoryBreakdown)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', CATEGORY_COLORS[cat] || 'bg-slate-100 text-slate-600')}>
                          {cat.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-semibold text-slate-600">{count as number}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Share CTA */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-5 text-white">
              <h3 className="mb-1 text-sm font-semibold">Share this portfolio</h3>
              <p className="mb-3 text-xs text-indigo-200">One link to share with recruiters, professors, or on LinkedIn.</p>
              <button onClick={handleCopy}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-xs font-semibold transition-colors hover:bg-white/30">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Portfolio Link'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 py-4 text-center">
          <p className="text-xs text-slate-400">
            Powered by{' '}
            <a href="/" className="font-medium text-indigo-500 hover:underline">SkillSense</a>
            {' '}— Evidence-based skill verification platform
          </p>
        </div>
      </div>
    </div>
  );
}
