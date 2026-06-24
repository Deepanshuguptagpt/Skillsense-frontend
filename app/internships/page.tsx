'use client';

import { useState } from 'react';
import { notify } from '@/hooks/useNotifications';

import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Building2,
  ExternalLink,
  Star,
  Clock,
  MapPin,
  IndianRupee,
  RefreshCw,
  X,
  Briefcase,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '@/components/Layout/MainLayout';
import InternshipCard from '@/components/Internships/InternshipCard';
import { useInternships } from '@/hooks/useInternships';
import { useOpportunities } from '@/hooks/useOpportunities';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';

type Tab =
  | 'eligible'
  | 'almostEligible'
  | 'notEligible'
  | 'recruiterJobs'
  | 'government';

interface GovtOpportunity {
  id: string;
  title: string;
  organization: string;
  category: string;
  subcategory: string;
  description: string;
  type: string;
  location: string;
  mode: string;
  duration: string;
  stipend: string;
  eligibility: string;
  application_url: string;
  deadline: string;
  benefits: string[];
  tags: string[];
  match_score?: number;
  classification?: string;
  matched_skills?: string[];
  missing_skills?: string[];
}

const CATEGORY_COLORS: Record<string, string> = {
  government: 'bg-blue-100 text-blue-700',
  psu: 'bg-orange-100 text-orange-700',
  academic: 'bg-purple-100 text-purple-700',
  platform: 'bg-slate-100 text-slate-700',
  faang: 'bg-rose-100 text-rose-700',
  mnc: 'bg-teal-100 text-teal-700',
  startup: 'bg-violet-100 text-violet-700',
};

const CATEGORY_LABELS: Record<string, string> = {
  government: 'Government',
  psu: 'PSU',
  academic: 'Academic',
  platform: 'Platform',
  faang: 'FAANG',
  mnc: 'MNC',
  startup: 'Startup',
};

// Category filter chips for the main internship tabs
const CATEGORY_CHIPS = [
  { value: 'all',        label: 'All',      color: 'text-slate-700  border-slate-200  bg-white' },
  { value: 'faang',      label: 'FAANG',    color: 'text-rose-700   border-rose-200   bg-rose-50' },
  { value: 'mnc',        label: 'MNC',      color: 'text-teal-700   border-teal-200   bg-teal-50' },
  { value: 'government', label: 'Govt',     color: 'text-blue-700   border-blue-200   bg-blue-50' },
  { value: 'psu',        label: 'PSU',      color: 'text-orange-700 border-orange-200 bg-orange-50' },
  { value: 'academic',   label: 'Academic', color: 'text-purple-700 border-purple-200 bg-purple-50' },
  { value: 'startup',    label: 'Startup',  color: 'text-violet-700 border-violet-200 bg-violet-50' },
];

function GovtOpportunityCard({ opp }: { opp: GovtOpportunity }) {
  const score = opp.match_score ?? 0;
  const scoreColor =
    score >= 70
      ? 'bg-emerald-100 text-emerald-700'
      : score >= 40
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';
  const classLabel =
    opp.classification === 'eligible'
      ? 'Eligible'
      : opp.classification === 'almost-eligible'
        ? 'Almost'
        : 'Not Eligible';
  const classColor =
    opp.classification === 'eligible'
      ? 'text-emerald-600'
      : opp.classification === 'almost-eligible'
        ? 'text-amber-600'
        : 'text-red-500';

  return (
    <div className="card h-full flex flex-col gap-4 transition-all hover:border-indigo-200 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                CATEGORY_COLORS[opp.category] || 'bg-slate-100 text-slate-600'
              )}
            >
              {CATEGORY_LABELS[opp.category] || opp.category}
            </span>
            {opp.tags.includes('flagship') && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{' '}
                Flagship
              </span>
            )}
          </div>
          <h3 className="font-semibold leading-tight text-slate-900">
            {opp.title}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
            <Building2 className="h-3 w-3" />
            {opp.organization}
          </p>
        </div>
        <div className="flex-shrink-0 text-center">
          <span
            className={cn(
              'block rounded-full px-2.5 py-1 text-xs font-bold',
              scoreColor
            )}
          >
            {Math.round(score)}%
          </span>
          <span className={cn('mt-0.5 block text-xs font-medium', classColor)}>
            {classLabel}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {opp.duration}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {opp.mode}
        </span>
        <span className="flex items-center gap-1">
          <IndianRupee className="h-3 w-3" />
          {opp.stipend}
        </span>
      </div>

      {/* Description */}
      <p className="line-clamp-2 text-xs leading-relaxed text-slate-600">
        {opp.description}
      </p>

      {/* Skill match */}
      {((opp.matched_skills?.length ?? 0) > 0 ||
        (opp.missing_skills?.length ?? 0) > 0) && (
        <div className="space-y-1.5">
          {(opp.matched_skills?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {opp.matched_skills!.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700"
                >
                  <CheckCircle className="h-3 w-3" />
                  {s}
                </span>
              ))}
            </div>
          )}
          {(opp.missing_skills?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1">
              {opp.missing_skills!.slice(0, 2).map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs text-red-600"
                >
                  <XCircle className="h-3 w-3" />
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deadline */}
      <p className="text-xs text-slate-400">Deadline: {opp.deadline}</p>

      {/* Benefits */}
      {opp.benefits.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {opp.benefits.slice(0, 2).map((b) => (
            <span
              key={b}
              className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600"
            >
              {b}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto">
        <a
          href={opp.application_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Apply Now <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

import { Opportunity } from '@/hooks/useOpportunities';

// ─── Job Detail Modal ─────────────────────────────────────────────────────────

function JobDetailModal({ job, onClose, onApply, isApplying }: { job: Opportunity; onClose: () => void; onApply: () => void; isApplying: boolean }) {
  const score = job.match_score ?? 0;
  const scoreColor =
    score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500';
  const scoreBg =
    score >= 80 ? 'bg-emerald-50 border-emerald-200' : score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-6 border-b border-slate-100">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{job.title}</h2>
            <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              {job.role_type}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {job.shortlisted && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                ✓ Shortlisted
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-5">
          {/* Match score */}
          <div className={cn('flex items-center justify-between rounded-xl border p-4', scoreBg)}>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Match Score</p>
              <p className={cn('text-3xl font-bold mt-0.5', scoreColor)}>{Math.round(score)}%</p>
            </div>
            {job.shortlisted && (
              <div className="text-right">
                <p className="text-xs text-slate-500">Status</p>
                <p className="text-sm font-bold text-emerald-600 mt-0.5">🎉 You've been shortlisted!</p>
              </div>
            )}
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            {job.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-400" />
                {job.duration}
              </span>
            )}
            {job.stipend && (
              <span className="flex items-center gap-1.5">
                <IndianRupee className="h-4 w-4 text-slate-400" />
                {job.stipend}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-slate-400" />
              {job.status === 'active' ? 'Actively Hiring' : 'Closed'}
            </span>
          </div>

          {/* Description */}
          {job.description && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About the Role</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>
          )}

          {/* Required Skills */}
          {(job.required_skills?.length ?? 0) > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</p>
              <div className="space-y-2">
                {job.required_skills!.map((skill) => {
                  const matched = job.matched_skills?.includes(skill.name);
                  const missing = job.missing_skills?.includes(skill.name);
                  return (
                    <div
                      key={skill.name}
                      className={cn(
                        'flex items-center justify-between rounded-lg border px-3 py-2 text-sm',
                        matched ? 'border-emerald-200 bg-emerald-50' :
                        missing ? 'border-red-200 bg-red-50' :
                        'border-slate-200 bg-slate-50'
                      )}
                    >
                      <span className={cn('font-medium', matched ? 'text-emerald-700' : missing ? 'text-red-700' : 'text-slate-700')}>
                        {skill.name}
                        {skill.mandatory && <span className="ml-1 text-xs opacity-60">*required</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Level {skill.proficiency_level}%</span>
                        {matched ? (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        ) : missing ? (
                          <XCircle className="h-4 w-4 text-red-400" />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
          {job.applied ? (
            <button
              disabled
              className="flex-1 rounded-xl bg-emerald-50 text-emerald-700 px-4 py-2.5 text-sm font-bold border border-emerald-200 cursor-not-allowed"
            >
              ✓ Applied
            </button>
          ) : (
            <button
              onClick={onApply}
              disabled={isApplying || job.status !== 'active'}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isApplying ? 'Applying...' : 'Apply Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InternshipsPage() {
  const { eligible, almostEligible, notEligible, isLoading } = useInternships();
  const { opportunities, isLoading: oppsLoading, applyToOpportunity, isApplying } = useOpportunities();
  const [activeTab, setActiveTab] = useState<Tab>('eligible');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [govtCategory, setGovtCategory] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Opportunity | null>(null);
  const queryClient = useQueryClient();

  // Fetch government opportunities
  const { data: govtOpps = [], isLoading: govtLoading } = useQuery({
    queryKey: ['govt-opportunities'],
    queryFn: async () => {
      const res = await api.get<GovtOpportunity[]>(
        API_ROUTES.GOVT_OPPORTUNITIES
      );
      return res.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Manual refresh mutation
  const refreshMutation = useMutation({
    mutationFn: () => api.post('/internships/refresh'),
    onSuccess: () => {
      notify.success('Refreshing internship data — new listings will appear shortly.');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['internships'] });
        queryClient.invalidateQueries({ queryKey: ['govt-opportunities'] });
      }, 3000); // give scrapers 3s head start
    },
    onError: () => notify.error('Failed to refresh internships. Please try again.'),
  });

  const govtEligibleCount = govtOpps.filter(
    (o) => o.classification === 'eligible'
  ).length;

  const tabs = [
    {
      id: 'eligible' as Tab,
      label: 'Eligible',
      count: eligible.length,
      color: 'text-emerald-600',
    },
    {
      id: 'almostEligible' as Tab,
      label: 'Almost Eligible',
      count: almostEligible.length,
      color: 'text-amber-600',
    },
    {
      id: 'notEligible' as Tab,
      label: 'Not Eligible',
      count: notEligible.length,
      color: 'text-red-500',
    },
    {
      id: 'recruiterJobs' as Tab,
      label: 'Recruiter Jobs',
      count: opportunities.length,
      color: 'text-indigo-600',
    },
    {
      id: 'government' as Tab,
      label: 'Govt & PSU',
      count: govtOpps.length,
      color: 'text-blue-600',
    },
  ];

  const getActiveInternships = () => {
    let internships =
      activeTab === 'eligible'
        ? eligible
        : activeTab === 'almostEligible'
          ? almostEligible
          : notEligible;

    if (searchQuery) {
      internships = internships.filter(
        (match) =>
          match.internship.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          match.internship.company
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }
    if (typeFilter !== 'all') {
      internships = internships.filter(
        (match) => match.internship.type === typeFilter
      );
    }
    if (categoryFilter !== 'all') {
      internships = internships.filter(
        (match) => match.internship.category === categoryFilter
      );
    }

    // Sort: deadline-soon items bubble to top within each eligibility bucket
    internships = [...internships].sort((a, b) => {
      const aUrgent = a.internship.isDeadlineSoon ? 0 : 1;
      const bUrgent = b.internship.isDeadlineSoon ? 0 : 1;
      if (aUrgent !== bUrgent) return aUrgent - bUrgent;
      // Within same urgency group, sort by match score descending
      return b.matchScore - a.matchScore;
    });

    return internships;
  };

  const filteredGovtOpps = govtOpps.filter((o) => {
    const matchesSearch =
      !searchQuery ||
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.organization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      govtCategory === 'all' || o.category === govtCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredInternships = getActiveInternships();
  const pageLoading =
    isLoading || oppsLoading || (activeTab === 'government' && govtLoading);

  if (pageLoading) {
    return (
      <MainLayout>
        <div className="space-y-4 p-6">
          <div className="gradient-skeleton h-10 w-56 rounded-lg" />
          <div className="gradient-skeleton h-10 w-full rounded-lg" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="gradient-skeleton h-40 rounded-xl" />
          ))}
        </div>
      </MainLayout>
    );
  }

  return (
    <>
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Page Header */}
        <div className="border-b border-slate-200/60 pb-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="font-sora text-2xl font-bold text-slate-900">
                Internship Opportunities
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                Discover opportunities matched to your skills — FAANG, MNC,
                Government, PSU, and more
              </p>
            </div>
            <button
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              title="Refresh internship data from all sources"
              className={cn(
                'btn-outline flex items-center gap-2 px-4 py-2 text-sm',
                refreshMutation.isPending && 'cursor-not-allowed opacity-70'
              )}
            >
              <RefreshCw
                className={cn(
                  'h-4 w-4',
                  refreshMutation.isPending && 'animate-spin'
                )}
              />
              {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">{eligible.length}</span> eligible
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
              <span className="font-semibold">{govtEligibleCount}</span> govt eligible
            </span>
            {(() => {
              const closingSoon = [...eligible, ...almostEligible].filter(
                (m) => m.internship.isDeadlineSoon
              ).length;
              return closingSoon > 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  <span className="font-semibold">{closingSoon}</span> closing soon
                </span>
              ) : null;
            })()}
            {refreshMutation.isSuccess && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                ✓ Data refreshing in background
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto border-b border-slate-200">
          <div className="flex min-w-max gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 whitespace-nowrap border-b-2 px-4 pb-3 text-sm font-bold transition-all',
                  activeTab === tab.id
                    ? 'border-violet-600 text-violet-700'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors',
                    activeTab === tab.id
                      ? 'bg-violet-100 text-violet-700 shadow-sm'
                      : 'bg-slate-100 text-slate-500'
                  )}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>


        {/* Filters */}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'government'
                    ? 'Search by name or organization...'
                    : 'Search by company or role...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-9"
              />
            </div>
            {activeTab === 'government' ? (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={govtCategory}
                  onChange={(e) => setGovtCategory(e.target.value)}
                  className="input pl-9 sm:w-44"
                >
                  <option value="all">All Categories</option>
                  <option value="government">Government</option>
                  <option value="psu">PSU</option>
                  <option value="academic">Academic</option>
                  <option value="platform">Platform</option>
                </select>
              </div>
            ) : (
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="input pl-9 sm:w-40"
                >
                  <option value="all">All Types</option>
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            )}
          </div>

          {/* Category filter chips — only for main internship tabs */}
          {activeTab !== 'government' && activeTab !== 'recruiterJobs' && (
            <div className="flex flex-wrap gap-2">
              {CATEGORY_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setCategoryFilter(chip.value)}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-xs font-medium transition-all',
                    categoryFilter === chip.value
                      ? chip.color + ' ring-1 ring-current/30'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Government Opportunities Tab */}
        {activeTab === 'government' && (
          <>
            {/* Govt banner */}
            <div className="relative flex items-start gap-4 overflow-hidden rounded-2xl border-none bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-5 shadow-sm">
              <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/3 rounded-full bg-blue-500 opacity-5 blur-2xl"></div>
              <div className="relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-white shadow-sm">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="relative z-10">
                <p className="font-sora text-base font-bold text-slate-900">
                  Government & Public Sector Opportunities
                </p>
                <p className="mt-1 max-w-3xl text-sm font-medium text-slate-600">
                  Real programs from ISRO, DRDO, CSIR, PM Internship Scheme,
                  AICTE, IITs, PSUs and more. Match scores are computed against
                  your actual skill evidence.
                </p>
              </div>
            </div>

            {filteredGovtOpps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                <p className="text-base font-medium text-slate-700">
                  No opportunities match your filter.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredGovtOpps.map((opp) => (
                  <GovtOpportunityCard key={opp.id} opp={opp} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Recruiter Jobs Tab */}
        {activeTab === 'recruiterJobs' &&
          (opportunities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <p className="text-base font-medium text-slate-700">
                No recruiter jobs yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Set your target role to see matches from recruiters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opp) => {
                const score = opp.match_score ?? 0;
                const matchedSkills = (opp.matched_skills || []).slice(0, 3);
                const missingSkills = (opp.missing_skills || []).slice(0, 3);
                const scoreColor =
                  score >= 80
                    ? 'bg-emerald-100 text-emerald-700'
                    : score >= 50
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700';
                return (
                  <div key={opp.id} className="card h-full flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold leading-tight text-slate-900">
                          {opp.title}
                        </h3>
                        <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                          {opp.role_type}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={cn(
                            'rounded-full px-2.5 py-1 text-xs font-semibold',
                            scoreColor
                          )}
                        >
                          {score}%
                        </span>
                        {opp.shortlisted && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                            ✓ Shortlisted
                          </span>
                        )}
                        {opp.applied && !opp.shortlisted && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                            ✓ Applied
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {matchedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                            >
                              <CheckCircle className="h-3 w-3" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                      {missingSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {missingSkills.map((skill) => (
                            <span
                              key={skill}
                              className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
                            >
                              <XCircle className="h-3 w-3" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-auto">
                      <button
                        onClick={() => setSelectedJob(opp)}
                        className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

        {/* Regular internship tabs */}
        {activeTab !== 'recruiterJobs' &&
          activeTab !== 'government' &&
          (filteredInternships.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <p className="text-base font-medium text-slate-700">
                No internships found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try adjusting your filters or check other tabs
              </p>
              {activeTab === 'notEligible' && (
                <a
                  href="/skillgenie"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Learn missing skills with SkillGenie
                </a>
              )}
              {activeTab === 'eligible' && (
                <a
                  href="/profile"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                >
                  Add skills to see matches →
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredInternships.map((match) => (
                <InternshipCard
                  key={match.internship.internshipId}
                  match={match}
                  category={
                    activeTab as 'eligible' | 'almostEligible' | 'notEligible'
                  }
                  allIneligible={
                    activeTab !== 'eligible'
                      ? [...almostEligible, ...notEligible]
                      : []
                  }
                />
              ))}
            </div>
          ))}
      </div>
    </MainLayout>
    {selectedJob && (
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onApply={() => {
          applyToOpportunity(selectedJob.id).then((res) => {
            if (res.success) {
              notify.success('Application submitted successfully!');
              setSelectedJob({ ...selectedJob, applied: true });
            } else {
              notify.error(res.message || 'Failed to apply');
            }
          }).catch((err) => {
            notify.error('An error occurred while applying.');
            console.error(err);
          });
        }}
        isApplying={isApplying}
      />
    )}
  </>
  );
}

