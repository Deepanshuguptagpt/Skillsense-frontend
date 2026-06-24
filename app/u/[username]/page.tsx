import {
  Github, Linkedin, ExternalLink, CheckCircle, Copy, Check,
  AlertCircle, GraduationCap, Zap, Star, BarChart3, Globe, Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import PortfolioClient from './PortfolioClient';

export const dynamic = 'force-dynamic';

async function fetchPortfolio(username: string): Promise<PortfolioData> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const res = await fetch(`${baseUrl}/portfolio/${username}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Portfolio not found (${res.status})`);
  const json = await res.json();
  return json.data as PortfolioData;
}

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

export default async function PublicPortfolioPage({
  params,
}: {
  params: { username: string };
}) {
  let data: PortfolioData | null = null;
  let error: string | null = null;

  try {
    data = await fetchPortfolio(params.username);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load portfolio';
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="max-w-sm space-y-4 px-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h1 className="text-xl font-semibold text-slate-700">Portfolio not found</h1>
          <p className="text-sm text-slate-500">
            No candidate with username <strong>{params.username}</strong> exists on SkillSense.
          </p>
          <a href="/" className="inline-block text-sm text-indigo-600 hover:underline">← Go to SkillSense</a>
        </div>
      </div>
    );
  }

  return <PortfolioClient data={data} />;
}
