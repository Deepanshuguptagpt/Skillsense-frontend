'use client';

import {
  Target,
  Briefcase,
  BookOpen,
  User,
  ArrowRight,
  Upload,
  Plus,
  Sparkles,
  Clock,
  Flag,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import MainLayout from '@/components/Layout/MainLayout';
import { useProfile } from '@/hooks/useProfile';
import { useProjects } from '@/hooks/useProjects';
import { useInternships } from '@/hooks/useInternships';
import { useSkillGraph } from '@/hooks/useSkillGraph';
import { useReadiness } from '@/hooks/useReadiness';
import { useDashboard } from '@/hooks/useDashboard';
import { useGithubProjects } from '@/hooks/useGithubProjects';
import { APP_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import JobRoleRadarChart from '@/components/Dashboard/JobRoleRadarChart';
import SkillSpiderChart from '@/components/Dashboard/SkillSpiderChart';
import SkillGapsPanel from '@/components/Dashboard/SkillGapsPanel';
import WhatToDoNext from '@/components/Dashboard/WhatToDoNext';
import SkillUnlockImpact from '@/components/Internships/SkillUnlockImpact';

// ── New User Setup Guide ──────────────────────────────────────────────────────
function NewUserGuide({ name }: { name: string }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 p-7 text-white shadow-lg shadow-violet-500/20">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-violet-200" />
          <span className="text-sm font-semibold text-violet-200">Getting started</span>
        </div>
        <h2 className="font-sora text-2xl font-bold">Welcome, {name}!</h2>
        <p className="mt-1.5 text-sm text-indigo-200">
          Complete your profile setup to unlock internship matches and career insights.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="mb-4 font-sora text-sm font-bold text-slate-900">Get started in 3 steps</h3>
        <div className="space-y-3">
          {[
            { icon: Upload, color: 'text-violet-600', bg: 'bg-violet-50', href: APP_ROUTES.PROFILE, title: 'Upload your resume', sub: 'AI will extract your skills automatically' },
            { icon: Plus, color: 'text-emerald-600', bg: 'bg-emerald-50', href: APP_ROUTES.PROFILE, title: 'Add your skills manually', sub: 'Tell us what you know — programming, tools, frameworks' },
            { icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50', href: APP_ROUTES.PROJECTS, title: 'Connect GitHub or add a project', sub: 'Show real evidence of your skills' },
          ].map(({ icon: Icon, color, bg, href, title, sub }) => (
            <Link
              key={title}
              href={href}
              className="group flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition-all hover:border-violet-200 hover:shadow-sm"
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500">{sub}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-violet-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, subIcon, subColor = 'text-slate-500', accent, href,
}: {
  label: string; value: React.ReactNode; sub?: React.ReactNode;
  subIcon?: React.ReactNode; subColor?: string; accent?: string; href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
    >
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-slate-400 truncate" title={label}>
        {label}
      </p>
      <p className="font-sora text-2xl sm:text-3xl font-bold text-slate-900 truncate" title={typeof value === 'string' ? value : undefined}>{value}</p>
      {sub && (
        <div className={cn('mt-2 flex items-center gap-1.5 text-xs font-medium', subColor)}>
          {subIcon}{sub}
        </div>
      )}
    </Link>
  );
}

// ── Top Matches (right sidebar) ───────────────────────────────────────────────
function TopMatchesPanel({ skills }: { skills: any[] }) {
  // Reuse the same role map logic from JobRoleRadarChart
  const ROLE_SKILL_MAP: Record<string, string[]> = {
    'Data Scientist': ['python', 'machine learning', 'pandas', 'sql', 'tensorflow', 'statistics'],
    'Backend Dev': ['python', 'node.js', 'sql', 'docker', 'rest', 'api', 'postgresql'],
    'Full Stack Dev': ['react', 'node.js', 'javascript', 'sql', 'html', 'css', 'git'],
    'Frontend Dev': ['react', 'javascript', 'typescript', 'html', 'css', 'tailwind'],
    'DevOps Eng': ['docker', 'kubernetes', 'aws', 'ci/cd', 'linux', 'bash'],
    'Software Eng': ['python', 'java', 'algorithms', 'system design', 'git', 'testing'],
  };

  const matches = Object.entries(ROLE_SKILL_MAP)
    .map(([role, keywords]) => {
      let score = 0, total = keywords.length;
      for (const kw of keywords) {
        const found = skills.find(
          (s) => s.name.toLowerCase().includes(kw) || kw.includes(s.name.toLowerCase())
        );
        if (found) score += found.proficiencyLevel / 100;
      }
      const breadth = Math.min(skills.length * 1.5, 20);
      return { role, pct: Math.min(Math.round((score / total) * 100 + breadth), 100) };
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  const ROLE_ICONS: Record<string, string> = {
    'Data Scientist': 'DS', 'Backend Dev': 'BE', 'Full Stack Dev': 'FS',
    'Frontend Dev': 'FE', 'DevOps Eng': 'DO', 'Software Eng': 'SE',
  };
  const BG = ['bg-violet-100 text-violet-700', 'bg-indigo-100 text-indigo-700', 'bg-blue-100 text-blue-700'];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 font-sora text-sm font-bold text-slate-900">Top Matches</h3>
      <div className="space-y-2.5">
        {matches.map(({ role, pct }, i) => (
          <div key={role} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:border-violet-100 hover:bg-violet-50/40">
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold', BG[i])}>
              {ROLE_ICONS[role] ?? role.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800 truncate">{role}</p>
              <p className="text-[10px] text-slate-400">
                {Math.max(0, Math.ceil((100 - pct) / 10))} skills to learn
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-violet-700">{pct}%</p>
              <p className="text-[10px] text-slate-400">Ready</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Active Milestones ─────────────────────────────────────────────────────────
function ActiveMilestonesPanel({ milestones }: { milestones: any[] }) {
  if (!milestones || milestones.length === 0) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-4 flex items-center gap-2">
        <Flag className="h-4 w-4 text-violet-600" />
        <h3 className="font-sora text-sm font-bold text-slate-900">Active Milestones</h3>
      </div>
      <div className="space-y-3">
        {milestones.slice(0, 3).map((m) => (
          <div key={m.id} className="rounded-xl border border-slate-100 p-3">
            <p className="text-xs font-bold text-slate-800 truncate">{m.title}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-1/3 rounded-full bg-violet-500" />
              </div>
              <p className="text-[10px] font-medium text-slate-400">Step 2 of 4</p>
            </div>
          </div>
        ))}
      </div>
      <Link href={APP_ROUTES.LEARNING} className="mt-3 flex items-center justify-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700">
        View all <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded-lg bg-slate-200" />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100" />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <div className="h-80 rounded-2xl bg-slate-100" />
          <div className="h-80 rounded-2xl bg-slate-100" />
        </div>
        <div className="space-y-5">
          <div className="h-60 rounded-2xl bg-slate-100" />
          <div className="h-60 rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { profile, isLoading: profileLoading } = useProfile();
  const { projects } = useProjects();
  const { eligible, almostEligible, notEligible } = useInternships();
  const { skills, totalSkills, verifiedSkills } = useSkillGraph();
  const { readiness } = useReadiness();
  const { dashboard } = useDashboard();
  const { repos } = useGithubProjects();

  if (profileLoading) {
    return (
      <MainLayout>
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  const firstName = profile?.personalInfo?.name?.split(' ')[0] || 'there';
  const hasSkills = totalSkills > 0;

  // New user — no skills yet
  if (!hasSkills) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-2xl">
          <NewUserGuide name={firstName} />
        </div>
      </MainLayout>
    );
  }

  const eligibleCount = eligible?.length ?? 0;
  const almostEligibleCount = almostEligible?.length ?? 0;
  const githubCount = repos?.length ?? 0;
  const verificationRate = totalSkills > 0 ? Math.round((verifiedSkills / totalSkills) * 100) : 0;

  // Profile strength score
  const completedProjects = projects?.filter((p) => p.status === 'completed').length ?? 0;
  const profileStrength = Math.min(
    Math.round((verifiedSkills * 0.4 + completedProjects * 0.3 + eligibleCount * 0.3) * 2),
    100
  );

  return (
    <MainLayout>
      <div className="space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-sora text-2xl font-bold text-slate-900">
              Welcome back, {firstName}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Here's how your engineering career path is shaping up today.
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Profile Synced
          </span>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Skills"
            value={totalSkills}
            sub={`${verifiedSkills} Verified`}
            subColor="text-violet-600"
            subIcon={<CheckCircle className="h-3 w-3" />}
            accent="bg-violet-400"
            href={APP_ROUTES.PROFILE}
          />
          <StatCard
            label="Internships"
            value={eligibleCount}
            sub="Eligible"
            subColor="text-emerald-600"
            subIcon={
              <span className="flex gap-0.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-emerald-400" />
              </span>
            }
            accent="bg-emerald-400"
            href={APP_ROUTES.INTERNSHIPS}
          />
          <StatCard
            label="Projects"
            value={githubCount}
            sub="Synced"
            subColor="text-blue-600"
            subIcon={<span className="text-[10px]">⟳</span>}
            accent="bg-blue-400"
            href={APP_ROUTES.PROJECTS}
          />
          <StatCard
            label="Career Readiness"
            value={readiness?.score !== undefined ? `${Math.round(readiness.score)}%` : '—'}
            sub={readiness?.role_name || 'Set target role'}
            subColor="text-pink-600"
            subIcon={<span className="text-[10px]">🎯</span>}
            accent="bg-pink-400"
            href={APP_ROUTES.PROFILE}
          />
        </div>

        {/* ── Main 2/3 + 1/3 grid ── */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Left column — charts */}
          <div className="space-y-6 lg:col-span-2">

            {/* Proficiency Radar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <h2 className="font-sora text-base font-bold text-slate-900">Proficiency Radar</h2>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Detailed technical skill distribution across categories
                  </p>
                </div>
                <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-violet-700">
                  Comprehensive View
                </span>
              </div>
              <SkillSpiderChart skills={skills} />
            </div>

            {/* AI-Preferred Job Roles */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="mb-1 flex items-center justify-between">
                <div>
                  <h2 className="font-sora text-base font-bold text-slate-900">AI-Preferred Job Roles</h2>
                  <p className="text-xs font-medium text-slate-400 mt-0.5">
                    Personalized role readiness scores based on your skill profile
                  </p>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  AI Insight
                </span>
              </div>
              <JobRoleRadarChart skills={skills} />
            </div>

            {/* Skill Unlock Impact */}
            {(almostEligible.length > 0 || notEligible.length > 0) && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <SkillUnlockImpact
                  almostEligible={almostEligible}
                  notEligible={notEligible}
                  eligibleCount={eligibleCount}
                />
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-5">

            {/* Skill Gaps */}
            <SkillGapsPanel />

            {/* Top Role Matches */}
            {skills.length >= 3 && <TopMatchesPanel skills={skills} />}

            {/* Active Milestones */}
            {dashboard?.active_milestones && dashboard.active_milestones.length > 0 && (
              <ActiveMilestonesPanel milestones={dashboard.active_milestones} />
            )}

            {/* What to do next */}
            <WhatToDoNext
              profile={profile}
              skillCount={totalSkills}
              verifiedSkills={verifiedSkills}
              eligibleCount={eligibleCount}
              topGap={readiness?.gaps?.[0]?.skill_name}
            />

            {/* Quick Actions */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 font-sora text-sm font-bold text-slate-900">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: User, label: 'Profile', href: APP_ROUTES.PROFILE, color: 'text-violet-600', bg: 'bg-violet-50' },
                  { icon: Briefcase, label: 'Internships', href: APP_ROUTES.INTERNSHIPS, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { icon: BookOpen, label: 'Learning', href: APP_ROUTES.LEARNING, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { icon: Sparkles, label: 'SkillGenie', href: APP_ROUTES.SKILLGENIE, color: 'text-amber-500', bg: 'bg-amber-50' },
                ].map(({ icon: Icon, label, href, color, bg }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-3 text-center transition-all hover:border-violet-200 hover:shadow-sm"
                  >
                    <div className={`rounded-lg p-2 ${bg}`}>
                      <Icon className={`h-5 w-5 ${color}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="font-sora text-sm font-bold text-violet-600">SkillSense</p>
            <p className="text-xs text-slate-400">
              © {new Date().getFullYear()} SkillSense. Built for the next generation of engineers.
            </p>
            <div className="flex gap-4 text-xs font-semibold text-slate-400">
              {['Privacy Policy', 'Terms of Service', 'Help Center', 'Contact Us'].map((t) => (
                <span key={t} className="cursor-pointer hover:text-slate-600">{t}</span>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}

