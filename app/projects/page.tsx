'use client';

import { useState, useMemo } from 'react';
import {
  Github,
  RefreshCw,
  Star,
  GitFork,
  ExternalLink,
  Globe,
  Clock,
  Code2,
  Search,
  Filter,
  TrendingUp,
  Zap,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import { useGithubProjects, type GithubRepo } from '@/hooks/useGithubProjects';
import { cn } from '@/lib/utils';
import { SkeletonList } from '@/components/GradientSkeleton';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// ─── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

const LANGUAGE_COLORS: Record<string, string> = {
  Python: 'bg-blue-100 text-blue-700',
  JavaScript: 'bg-yellow-100 text-yellow-700',
  TypeScript: 'bg-blue-100 text-blue-800',
  Java: 'bg-orange-100 text-orange-700',
  'C++': 'bg-pink-100 text-pink-700',
  C: 'bg-slate-100 text-slate-700',
  Go: 'bg-cyan-100 text-cyan-700',
  Rust: 'bg-orange-100 text-orange-800',
  Ruby: 'bg-red-100 text-red-700',
  PHP: 'bg-purple-100 text-purple-700',
  Swift: 'bg-orange-100 text-orange-600',
  Kotlin: 'bg-violet-100 text-violet-700',
  Dart: 'bg-sky-100 text-sky-700',
  HTML: 'bg-red-100 text-red-600',
  CSS: 'bg-blue-100 text-blue-600',
  Shell: 'bg-green-100 text-green-700',
};

function langColor(lang: string) {
  return LANGUAGE_COLORS[lang] ?? 'bg-slate-100 text-slate-600';
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  'web app': 'Web App',
  api: 'API',
  'data science': 'Data Science',
  'cli tool': 'CLI Tool',
  library: 'Library',
  other: 'Project',
};

// ─── RepoCard ────────────────────────────────────────────────────────────────

function RepoCard({ repo }: { repo: GithubRepo }) {
  const label = PROJECT_TYPE_LABELS[repo.project_type] ?? 'Project';
  const allTech = Array.from(
    new Set([
      ...(repo.language ? [repo.language] : []),
      ...repo.tech_stack.filter((t) => t !== repo.language),
    ])
  ).slice(0, 6);

  const allSkills = repo.skills?.map((s) => s.name) ?? [];

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors truncate"
            >
              {repo.name}
            </a>
            {repo.visibility === 'private' && (
              <span className="shrink-0 rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                Private
              </span>
            )}
            {repo.has_ai_analysis && (
              <span className="shrink-0 flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-xs text-violet-600 border border-violet-100">
                <Zap className="h-3 w-3" />
                AI Analysed
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-slate-500 line-clamp-2">
            {repo.ai_summary || repo.description || (
              <span className="italic text-slate-400">No description</span>
            )}
          </p>
        </div>

        {/* Stats */}
        <div className="shrink-0 flex flex-col items-end gap-1.5 text-sm text-slate-500">
          {repo.stars > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              {repo.stars}
            </span>
          )}
          {repo.forks > 0 && (
            <span className="flex items-center gap-1">
              <GitFork className="h-3.5 w-3.5" />
              {repo.forks}
            </span>
          )}
        </div>
      </div>

      {/* Tech stack badges */}
      {allTech.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {allTech.map((tech) => (
            <span
              key={tech}
              className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', langColor(tech))}
            >
              {tech}
            </span>
          ))}
        </div>
      )}

      {/* Topics */}
      {repo.topics?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {repo.topics.slice(0, 5).map((topic) => (
            <span
              key={topic}
              className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600 border border-indigo-100"
            >
              #{topic}
            </span>
          ))}
        </div>
      )}

      {/* AI-extracted skills */}
      {allSkills.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-slate-400 mb-1.5">Skills detected</p>
          <div className="flex flex-wrap gap-1.5">
            {allSkills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-100"
              >
                {skill}
              </span>
            ))}
            {allSkills.length > 6 && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                +{allSkills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo(repo.updated_at)}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">
            {label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {repo.homepage && (
            <a
              href={repo.homepage.startsWith('http') ? repo.homepage : `https://${repo.homepage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <Globe className="h-3.5 w-3.5" />
              Live
            </a>
          )}
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            View Repo
            <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Contribution Stats Bar ──────────────────────────────────────────────────

function ContributionStats({
  stats,
  reposCount,
}: {
  stats: { consistency_score?: number; active_weeks?: number; total_commits?: number };
  reposCount: number;
}) {
  const consistency = Math.round((stats.consistency_score ?? 0) * 100);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-2xl font-bold text-slate-900">{reposCount}</p>
        <p className="mt-0.5 text-xs text-slate-500">Repositories</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-2xl font-bold text-slate-900">{stats.total_commits ?? 0}</p>
        <p className="mt-0.5 text-xs text-slate-500">Recent Commits</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-2xl font-bold text-slate-900">{stats.active_weeks ?? 0}</p>
        <p className="mt-0.5 text-xs text-slate-500">Active Weeks</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-slate-900">{consistency}%</p>
          <TrendingUp
            className={cn(
              'h-5 w-5',
              consistency >= 70 ? 'text-emerald-500' : consistency >= 30 ? 'text-amber-500' : 'text-slate-400'
            )}
          />
        </div>
        <p className="mt-0.5 text-xs text-slate-500">Consistency</p>
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              consistency >= 70 ? 'bg-emerald-500' : consistency >= 30 ? 'bg-amber-400' : 'bg-slate-300'
            )}
            style={{ width: `${consistency}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Empty / Not Connected States ────────────────────────────────────────────

function NotConnectedState() {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <Github className="h-8 w-8 text-slate-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Connect your GitHub</h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
        Link your GitHub account to import your repositories, get AI-powered project analysis, and have your skills automatically detected from your code.
      </p>
      <Link
        href="/profile"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
      >
        <Github className="h-4 w-4" />
        Connect GitHub in Profile
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function NoReposState({ onSync }: { onSync: () => void }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
        <Code2 className="h-8 w-8 text-indigo-400" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">No repositories found</h2>
      <p className="mt-2 text-sm text-slate-500">
        We couldn't find any public repositories. Try syncing again or check your GitHub profile.
      </p>
      <button
        onClick={onSync}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Sync Now
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type FilterType = 'all' | string;
const SORT_OPTIONS = ['Updated', 'Stars', 'Name'] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

export default function ProjectsPage() {
  const { repos, connected, githubUrl, contributionStats, lastIngested, isLoading, refresh, isRefreshing } =
    useGithubProjects();

  const [search, setSearch] = useState('');
  const [langFilter, setLangFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('Updated');

  // Derive unique languages for filter
  const languages = useMemo(() => {
    const langs = repos.map((r) => r.language).filter(Boolean) as string[];
    return Array.from(new Set(langs)).sort();
  }, [repos]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = repos;

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.ai_summary.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.topics?.some((t) => t.toLowerCase().includes(q)) ||
          r.tech_stack?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (langFilter !== 'all') {
      list = list.filter((r) => r.language === langFilter);
    }

    if (sortBy === 'Stars') {
      list = [...list].sort((a, b) => b.stars - a.stars);
    } else if (sortBy === 'Name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Updated (default)
      list = [...list].sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      });
    }

    return list;
  }, [repos, search, langFilter, sortBy]);

  const githubUsername = githubUrl?.replace('https://github.com/', '').replace(/\/$/, '');

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-slate-50 p-6">
          <SkeletonList count={4} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">GitHub Projects</h1>
              <p className="mt-1 text-sm text-slate-500">
                {connected && githubUsername ? (
                  <span className="flex items-center gap-1.5">
                    <Github className="h-3.5 w-3.5" />
                    <a
                      href={githubUrl ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-indigo-600 transition-colors"
                    >
                      @{githubUsername}
                    </a>
                    {lastIngested && (
                      <span className="text-slate-400">
                        · Last synced {timeAgo(lastIngested)}
                      </span>
                    )}
                  </span>
                ) : (
                  'Connect GitHub to see your repositories'
                )}
              </p>
            </div>

            {connected && (
              <button
                onClick={() => refresh()}
                disabled={isRefreshing}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60 transition-colors"
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                {isRefreshing ? 'Syncing…' : 'Sync GitHub'}
              </button>
            )}
          </div>

          {/* Main content */}
          {!connected ? (
            <NotConnectedState />
          ) : repos.length === 0 ? (
            <NoReposState onSync={() => refresh()} />
          ) : (
            <>
              {/* Stats */}
              <ContributionStats stats={contributionStats} reposCount={repos.length} />

              {/* Search + Filters */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search projects…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  {/* Language filter */}
                  <div className="flex items-center gap-1.5">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <select
                      value={langFilter}
                      onChange={(e) => setLangFilter(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Languages</option>
                      {languages.map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        Sort: {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Results count */}
              <p className="text-sm text-slate-500">
                {filtered.length === repos.length
                  ? `${repos.length} repositories`
                  : `${filtered.length} of ${repos.length} repositories`}
              </p>

              {/* Cards */}
              {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
                  <AlertCircle className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">No repositories match your filters.</p>
                  <button
                    onClick={() => {
                      setSearch('');
                      setLangFilter('all');
                    }}
                    className="mt-3 text-sm text-indigo-600 hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filtered.map((repo) => (
                    <RepoCard key={repo.id ?? repo.name} repo={repo} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
