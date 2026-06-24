'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  GraduationCap,
  Briefcase,
  Award,
  Calendar,
  Building,
  ExternalLink,
  Edit,
  User,
  FileText,
  Target,
  Code2,
  Terminal,
  Cpu,
  ChefHat,
  Star,
  BookOpen,
  RefreshCw,
  Sparkles,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import ResumeUpload from '@/components/Profile/ResumeUpload';
import SkillGraph from '@/components/Skills/SkillGraph';
import EditProfileModal from '@/components/Profile/EditProfileModal';
import DigitalResumeView from '@/components/Profile/DigitalResumeView';
import { useProfile } from '@/hooks/useProfile';
import { useSkillGraph } from '@/hooks/useSkillGraph';
import { useAuth } from '@/hooks/useAuth';
import { useTargetRoles, useSetTargetRole } from '@/hooks/useTargetRole';
import { notify } from '@/hooks/useNotifications';
import { getInitials } from '@/lib/utils';
import { API_ROUTES } from '@/lib/constants';
import api from '@/lib/api';
import ProfileCompleteness from '@/components/Profile/ProfileCompleteness';
import type { SkillCategory } from '@/types';

const isValidLink = (link?: string) => {
  if (!link) return false;
  const trimmed = link.trim();
  const lower = trimmed.toLowerCase();
  return (
    trimmed !== '' &&
    lower !== 'null' &&
    lower !== 'none' &&
    lower !== 'undefined'
  );
};


export default function ProfilePage() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [githubInput, setGithubInput] = useState('');
  const [showLegacyInput, setShowLegacyInput] = useState(false);
  const [githubResult, setGithubResult] = useState<{
    skills_added: string[];
    repos_found: number;
    message?: string;
  } | null>(null);
  const { profile, isLoading, updateProfile } = useProfile();
  const { skills, addSkill, skillGraph, deleteSkill, isDeletingSkill } =
    useSkillGraph();
  const { data: targetRoles = [] } = useTargetRoles();
  const setTargetRole = useSetTargetRole();
  const queryClient = useQueryClient();
  const { deleteAccount, isDeletingAccount } = useAuth();

  // Handle OAuth callback — check URL params for github_status
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const githubStatus = params.get('github_status');
    const username = params.get('username');
    if (githubStatus === 'connected' && username) {
      notify.success(`GitHub connected (@${username})! Extracting skills from your repos...`);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['github-status'] });
      // Clean URL
      window.history.replaceState({}, '', '/profile');
    } else if (githubStatus === 'denied') {
      notify.warning('GitHub connection was cancelled.');
      window.history.replaceState({}, '', '/profile');
    } else if (githubStatus === 'error') {
      const reason = params.get('reason') || 'unknown';
      notify.error(`GitHub connection failed: ${reason}`);
      window.history.replaceState({}, '', '/profile');
    }
  }, [queryClient]);

  // Initiate GitHub OAuth — navigates to backend which redirects to GitHub
  const handleGithubOAuth = () => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // Read JWT from Zustand persisted store
    let token = '';
    try {
      const stored = localStorage.getItem('skillsense-auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        token = parsed?.state?.accessToken || '';
      }
    } catch { /* ignore */ }
    window.location.href = `${apiBase}/candidates/github/oauth/authorize?token=${encodeURIComponent(token)}`;
  };

  const githubLinkMutation = useMutation({
    mutationFn: async (githubUrl: string) => {
      const res = await api.post(API_ROUTES.GITHUB_LINK, { githubUrl });
      return res.data;
    },
    onSuccess: (data) => {
      notify.success('GitHub connected! Skills extracted.');
      setGithubInput('');
      setShowLegacyInput(false);
      setGithubResult(data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['github-status'] });
    },
    onError: () => {
      notify.error('Failed to connect GitHub. Please try again.');
    },
  });

  // GitHub status — last ingested, contribution stats, needs_refresh
  const { data: githubStatus } = useQuery({
    queryKey: ['github-status'],
    queryFn: async () => {
      const res = await api.get(API_ROUTES.GITHUB_STATUS);
      return res.data;
    },
    enabled: !!profile?.personalInfo?.githubUsername,
  });

  // GitHub refresh mutation
  const githubRefreshMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(API_ROUTES.GITHUB_REFRESH);
      return res.data;
    },
    onSuccess: (data) => {
      notify.success(`GitHub refreshed! ${data?.skills_added?.length || 0} skills updated.`);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['github-status'] });
    },
    onError: () => {
      notify.error('Failed to refresh GitHub data. Please try again.');
    },
  });
  const handleAddSkill = async (skillName: string, category: SkillCategory) => {
    try {
      await addSkill({ skillName, category });
      notify.success('Skill added successfully!');
    } catch {
      notify.error('Failed to add skill. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="space-y-4 p-6">
          <div className="gradient-skeleton h-10 w-48 rounded-lg" />
          <div className="gradient-skeleton h-40 rounded-xl" />
          <div className="gradient-skeleton h-64 rounded-xl" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Profile Header */}
        <div className="card-glass relative overflow-hidden border-none p-0 shadow-strong">
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-800">
            <div className="absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-white opacity-10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 h-48 w-48 -translate-x-1/4 translate-y-1/3 rounded-full bg-pink-500 opacity-20 blur-3xl"></div>
          </div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
              {/* Avatar */}
              <div className="-mt-12 relative z-10 flex-shrink-0 sm:pt-0 pt-2">
                <div className="flex h-24 w-24 items-center justify-center rounded-xl border-4 border-white bg-violet-600 text-2xl font-bold text-white shadow-sm">
                  {profile?.personalInfo.name
                    ? getInitials(profile.personalInfo.name)
                    : 'U'}
                </div>
              </div>

              {/* Profile Info */}
              <div className="min-w-0 flex-1 pt-2">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate font-sora text-2xl font-bold text-slate-900">
                      {profile?.personalInfo.name || 'User'}
                    </h1>
                    {profile?.education && profile.education.length > 0 && (
                      <p className="mt-1 text-sm font-medium text-slate-600">
                        {profile.education[0].degree} in{' '}
                        {profile.education[0].field}
                      </p>
                    )}
                    {profile?.personalInfo.location && (
                      <div className="mt-2 flex items-center gap-1.5 font-medium text-slate-500">
                        <MapPin className="h-4 w-4 text-violet-500" />
                        <span className="text-sm">
                          {profile.personalInfo.location}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="btn-outline flex items-center gap-2 text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </button>
                    <a
                      href={`/u/${(profile?.personalInfo?.name || 'me').toLowerCase().replace(/\s+/g, '-')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline flex items-center gap-2 border-indigo-200 text-sm text-indigo-600 hover:bg-indigo-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Portfolio
                    </a>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 flex flex-wrap gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 sm:gap-8">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-sora text-xl font-bold leading-none text-slate-900">
                        {skillGraph?.totalSkills || 0}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Total Skills
                      </p>
                    </div>
                  </div>
                  <div className="hidden w-px bg-slate-200 sm:block"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-sora text-xl font-bold leading-none text-slate-900">
                        {skillGraph?.verifiedSkills || 0}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Verified
                      </p>
                    </div>
                  </div>
                  <div className="hidden w-px bg-slate-200 sm:block"></div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-sora text-xl font-bold leading-none text-slate-900">
                        {profile?.experience?.length || 0}
                      </p>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-4 lg:col-span-1">
            {/* Contact Information */}
            <div className="card-glass border border-slate-200">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                  <User className="h-4 w-4 text-violet-600" />
                </div>
                <h2 className="font-sora text-sm font-bold text-slate-900">
                  Contact
                </h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-400">
                      Email
                    </p>
                    <p className="truncate text-sm font-medium text-slate-900">
                      {profile?.personalInfo.email}
                    </p>
                  </div>
                </div>

                {profile?.personalInfo.phone && (
                  <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50">
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-400">
                        Phone
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {profile.personalInfo.phone}
                      </p>
                    </div>
                  </div>
                )}

                {profile?.personalInfo.location && (
                  <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-400">
                        Location
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {profile.personalInfo.location}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            {(isValidLink(profile?.personalInfo.linkedinUrl) ||
              isValidLink(profile?.personalInfo.githubUsername) ||
              isValidLink(profile?.personalInfo.portfolioUrl) ||
              isValidLink(profile?.personalInfo.leetcodeUrl) ||
              isValidLink(profile?.personalInfo.hackerrankUrl) ||
              isValidLink(profile?.personalInfo.codeforcesUrl) ||
              isValidLink(profile?.personalInfo.codechefUrl)) && (
              <div className="card-glass border border-slate-200">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Globe className="h-4 w-4 text-blue-600" />
                  </div>
                  <h2 className="font-sora text-sm font-bold text-slate-900">
                    Links
                  </h2>
                </div>
                <div className="space-y-2">
                  {isValidLink(profile?.personalInfo.linkedinUrl) && (
                    <a
                      href={profile?.personalInfo.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                          <Linkedin className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          LinkedIn
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                    </a>
                  )}

                  {isValidLink(profile?.personalInfo.githubUsername) && (
                    <a
                      href={`https://github.com/${profile?.personalInfo.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                          <Github className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          @{profile?.personalInfo.githubUsername}
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                    </a>
                  )}

                  {isValidLink(profile?.personalInfo.portfolioUrl) && (
                    <a
                      href={profile?.personalInfo.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600">
                          <Globe className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          Portfolio
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                    </a>
                  )}

                  {isValidLink(profile?.personalInfo.leetcodeUrl) && (
                    <a
                      href={profile?.personalInfo.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
                          <Code2 className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          LeetCode
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                    </a>
                  )}

                  {isValidLink(profile?.personalInfo.hackerrankUrl) && (
                    <a
                      href={profile?.personalInfo.hackerrankUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                          <Terminal className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          HackerRank
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                    </a>
                  )}

                  {isValidLink(profile?.personalInfo.codeforcesUrl) && (
                    <a
                      href={profile?.personalInfo.codeforcesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700">
                          <Cpu className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          Codeforces
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                    </a>
                  )}

                  {isValidLink(profile?.personalInfo.codechefUrl) && (
                    <a
                      href={profile?.personalInfo.codechefUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
                          <ChefHat className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          CodeChef
                        </span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Resume Section */}
            <div className="card-glass border border-slate-200">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="font-sora text-sm font-bold text-slate-900">
                  Resume
                </h2>
              </div>
              <ResumeUpload />
            </div>

            {/* Digital Resume — structured sections extracted from resume */}
            <div className="card-glass border border-slate-200">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                </div>
                <h2 className="font-sora text-sm font-bold text-slate-900">
                  Digital Resume
                </h2>
                <span className="ml-auto rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600">
                  AI Parsed
                </span>
              </div>
              <DigitalResumeView />
            </div>

            {/* GitHub Section — OAuth first, URL fallback */}
            <div className="card-glass border border-slate-200">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                  <Github className="h-4 w-4 text-slate-900" />
                </div>
                <h2 className="font-sora text-sm font-bold text-slate-900">
                  GitHub
                </h2>
                {profile?.personalInfo?.githubUsername && (
                  <span className="ml-auto rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Connected
                  </span>
                )}
              </div>

              {/* Ingestion result banner */}
              {githubResult && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-bold text-emerald-800">
                    ✓ {githubResult.repos_found} repos analyzed ·{' '}
                    {githubResult.skills_added.length} skills added
                  </p>
                  {githubResult.skills_added.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {githubResult.skills_added.slice(0, 8).map((s) => (
                        <span key={s} className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">{s}</span>
                      ))}
                      {githubResult.skills_added.length > 8 && (
                        <span className="text-xs font-medium text-emerald-600">+{githubResult.skills_added.length - 8} more</span>
                      )}
                    </div>
                  )}
                  <button onClick={() => setGithubResult(null)} className="mt-2 text-xs font-bold text-emerald-600 hover:underline">Dismiss</button>
                </div>
              )}

              {profile?.personalInfo?.githubUsername ? (
                /* ── Already connected ── */
                <div className="space-y-4">
                  {/* Connected badge */}
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <Github className="h-5 w-5 flex-shrink-0 text-emerald-700" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-emerald-800">
                        github.com/{profile.personalInfo.githubUsername}
                      </p>
                      {githubStatus?.oauth_connected && (
                        <p className="text-xs text-emerald-600 mt-0.5">✓ OAuth connected — private repos included</p>
                      )}
                    </div>
                    <a
                      href={`https://github.com/${profile.personalInfo.githubUsername}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 rounded-lg border border-emerald-300 bg-white px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                    >
                      View
                    </a>
                  </div>

                  {/* Contribution stats */}
                  {githubStatus?.contribution_stats && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Contribution Stats</p>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-lg bg-white border border-slate-200 p-2">
                          <p className="text-base font-bold text-indigo-600">{Math.round((githubStatus.contribution_stats.consistency_score || 0) * 100)}%</p>
                          <p className="text-xs text-slate-500">Consistency</p>
                        </div>
                        <div className="rounded-lg bg-white border border-slate-200 p-2">
                          <p className="text-base font-bold text-emerald-600">{githubStatus.contribution_stats.active_weeks || 0}</p>
                          <p className="text-xs text-slate-500">Active Weeks</p>
                        </div>
                        <div className="rounded-lg bg-white border border-slate-200 p-2">
                          <p className="text-base font-bold text-amber-600">{githubStatus.contribution_stats.total_commits || 0}</p>
                          <p className="text-xs text-slate-500">Commits</p>
                        </div>
                      </div>
                      {githubStatus.needs_refresh && (
                        <p className="mt-2 text-xs text-amber-600 font-medium">⚠ Data is over 30 days old — refresh recommended</p>
                      )}
                      {githubStatus.last_ingested && (
                        <p className="mt-1 text-xs text-slate-400">
                          Last updated: {new Date(githubStatus.last_ingested).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Upgrade to OAuth if only URL-connected */}
                  {!githubStatus?.oauth_connected && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-800 mb-1">🔒 Upgrade to OAuth for better analysis</p>
                      <p className="text-xs text-amber-700 mb-3">Connect via OAuth to include private repos and get more accurate skill detection.</p>
                      <button
                        onClick={handleGithubOAuth}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                      >
                        <Github className="h-4 w-4" />
                        Upgrade — Connect via GitHub OAuth
                      </button>
                    </div>
                  )}

                  {/* Refresh button */}
                  <button
                    onClick={() => githubRefreshMutation.mutate()}
                    disabled={githubRefreshMutation.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${githubRefreshMutation.isPending ? 'animate-spin' : ''}`} />
                    {githubRefreshMutation.isPending ? 'Re-analyzing repos...' : 'Refresh GitHub Data'}
                  </button>

                  {/* Legacy URL update — collapsed by default */}
                  <button
                    onClick={() => setShowLegacyInput(!showLegacyInput)}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors w-full text-center"
                  >
                    {showLegacyInput ? '▲ Hide' : 'Switch to a different GitHub account'}
                  </button>
                  {showLegacyInput && (
                    <form onSubmit={(e) => { e.preventDefault(); if (githubInput.trim()) githubLinkMutation.mutate(githubInput.trim()); }} className="flex gap-2">
                      <input type="url" placeholder="https://github.com/newusername" value={githubInput}
                        onChange={(e) => setGithubInput(e.target.value)} className="input flex-1 bg-white text-sm" />
                      <button type="submit" disabled={githubLinkMutation.isPending || !githubInput.trim()} className="btn-primary px-4 text-sm disabled:opacity-50">
                        {githubLinkMutation.isPending ? 'Updating...' : 'Update'}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                /* ── Not connected ── */
                <div className="space-y-4">
                  {/* Primary: OAuth button */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <Github className="h-10 w-10 mx-auto mb-3 text-slate-700" />
                    <p className="text-sm font-semibold text-slate-800 mb-1">Connect Your GitHub</p>
                    <p className="text-xs text-slate-500 mb-4">
                      Analyze your repos to automatically extract skills, detect technologies, and boost your readiness score.
                    </p>
                    <button
                      onClick={handleGithubOAuth}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-md hover:shadow-lg"
                    >
                      <Github className="h-5 w-5" />
                      Connect GitHub via OAuth
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">✓ Public + private repos</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">✓ Auto skill detection</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">✓ Weight: 0.6-0.7</span>
                    </div>
                  </div>

                  {/* Fallback: enter URL manually */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-xs text-slate-400">or enter URL manually (public repos only)</span>
                    </div>
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); if (githubInput.trim()) githubLinkMutation.mutate(githubInput.trim()); }} className="flex gap-2">
                    <input type="url" placeholder="https://github.com/username" value={githubInput}
                      onChange={(e) => setGithubInput(e.target.value)} className="input flex-1 bg-white text-sm" />
                    <button type="submit" disabled={githubLinkMutation.isPending || !githubInput.trim()} className="btn-primary px-4 text-sm disabled:opacity-50">
                      {githubLinkMutation.isPending ? 'Analyzing...' : 'Connect'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Profile Completeness */}
            <ProfileCompleteness
              profile={profile}
              skillCount={skillGraph?.totalSkills || 0}
            />

            {/* Target Role */}
            <div className="card-glass border border-slate-200">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                    <Target className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h2 className="font-sora text-sm font-bold text-slate-900">
                    Target Role
                  </h2>
                </div>
                <button
                  onClick={() => setShowRoleSelector(!showRoleSelector)}
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  {showRoleSelector ? 'Cancel' : 'Change'}
                </button>
              </div>
              {!showRoleSelector ? (
                <p className="rounded-lg border border-slate-100 bg-white p-3 text-sm font-medium text-slate-600">
                  {profile?.targetRoleName ||
                    'Not set — click Change to select'}
                </p>
              ) : (
                <div className="mt-3 space-y-2">
                  {targetRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={async () => {
                        await setTargetRole.mutateAsync(role.id);
                        setShowRoleSelector(false);
                        notify.success(`Target role set to ${role.name}`);
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-violet-300 hover:bg-violet-50"
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Account Settings / Danger Zone */}
            <div className="card-glass border border-red-200 bg-red-50/30">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <h2 className="font-sora text-sm font-bold text-red-900">
                  Danger Zone
                </h2>
              </div>
              <p className="text-xs text-red-700 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button
                onClick={async () => {
                  if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.')) {
                    try {
                      await deleteAccount();
                    } catch (error) {
                      // Error handled by hook
                    }
                  }
                }}
                disabled={isDeletingAccount}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-100 px-4 py-3 text-sm font-bold text-red-700 transition-colors hover:bg-red-200 hover:text-red-800 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {isDeletingAccount ? 'Deleting Account...' : 'Delete Account'}
              </button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Education */}
            {profile?.education && profile.education.length > 0 && (
              <div className="card-glass border border-slate-200">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-blue-100 shadow-inner">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="font-sora text-lg font-bold text-slate-900">
                    Education
                  </h2>
                </div>
                <div className="space-y-6">
                  {profile.education.map((edu, index) => (
                    <div
                      key={index}
                      className="relative border-l-2 border-indigo-100 pb-6 pl-8 last:pb-0"
                    >
                      <div className="absolute -left-2 top-1 h-4 w-4 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm ring-4 ring-white" />
                      <div className="rounded-2xl border border-slate-200 bg-white/50 p-5 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-base font-bold text-slate-900">
                              {edu.degree}
                            </h3>
                            <p className="mt-1 text-sm font-semibold text-violet-600">
                              {edu.field}
                            </p>
                            <div className="mt-2 flex w-fit items-center gap-2 rounded-lg border border-slate-100 bg-slate-100/50 px-3 py-1.5 font-medium text-slate-600">
                              <Building className="h-4 w-4 text-slate-400" />
                              <span className="text-sm">{edu.institution}</span>
                            </div>
                          </div>
                          {edu.cgpa && (
                            <div className="flex-shrink-0 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 px-4 py-2 text-center shadow-sm">
                              <div className="text-lg font-bold text-emerald-700">
                                {edu.cgpa}
                              </div>
                              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                CGPA
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(edu.startDate).getFullYear()} –{' '}
                            {edu.current
                              ? 'Present'
                              : edu.endDate
                                ? new Date(edu.endDate).getFullYear()
                                : 'Present'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {profile?.experience && profile.experience.length > 0 && (
              <div className="card-glass border border-slate-200">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 shadow-inner">
                    <Briefcase className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h2 className="font-sora text-lg font-bold text-slate-900">
                    Experience
                  </h2>
                </div>
                <div className="space-y-6">
                  {profile.experience.map((exp, index) => (
                    <div
                      key={index}
                      className="relative border-l-2 border-emerald-100 pb-6 pl-8 last:pb-0"
                    >
                      <div className="absolute -left-2 top-1 h-4 w-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm ring-4 ring-white" />
                      <div className="rounded-2xl border border-slate-200 bg-white/50 p-5 shadow-sm transition-shadow hover:shadow-md">
                        <h3 className="text-base font-bold text-slate-900">
                          {exp.role}
                        </h3>
                        <div className="mt-1 flex w-fit items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-1.5 font-medium text-emerald-700">
                          <Building className="h-4 w-4" />
                          <span className="text-sm">{exp.company}</span>
                        </div>
                        <p className="mt-3 rounded-xl border border-slate-100 bg-white p-3 text-sm font-medium leading-relaxed text-slate-600">
                          {exp.description}
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(exp.startDate).toLocaleDateString(
                              'en-IN',
                              { month: 'short', year: 'numeric' }
                            )}{' '}
                            –{' '}
                            {exp.current
                              ? 'Present'
                              : exp.endDate
                                ? new Date(exp.endDate).toLocaleDateString(
                                    'en-IN',
                                    { month: 'short', year: 'numeric' }
                                  )
                                : 'Present'}
                          </span>
                        </div>
                        {exp.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {exp.skills.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            <SkillGraph
              skills={skills}
              onAddSkill={handleAddSkill}
              onDeleteSkill={deleteSkill}
              isDeletingSkill={isDeletingSkill}
            />

            {/* GitHub Projects Section */}
            {profile?.githubProjects && profile.githubProjects.length > 0 && (
              <div className="card">
                <div className="mb-5 flex items-center gap-2">
                  <Github className="h-4 w-4 text-slate-400" />
                  <h2 className="text-sm font-semibold text-slate-900">
                    GitHub Projects
                  </h2>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {profile.githubProjects.length} analyzed
                  </span>
                </div>
                <div className="space-y-4">
                  {profile.githubProjects.map((proj) => (
                    <div
                      key={proj.repo_name}
                      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <a
                            href={proj.repo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-semibold text-slate-900 transition-colors hover:text-indigo-600"
                          >
                            <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{proj.repo_name}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0 text-slate-400" />
                          </a>
                          {proj.project_type &&
                            proj.project_type !== 'other' && (
                              <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium capitalize text-indigo-700">
                                {proj.project_type}
                              </span>
                            )}
                        </div>
                        {proj.stars > 0 && (
                          <div className="flex flex-shrink-0 items-center gap-1 text-xs text-amber-600">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            {proj.stars}
                          </div>
                        )}
                      </div>

                      {proj.summary && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {proj.summary}
                        </p>
                      )}

                      {proj.tech_stack && proj.tech_stack.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {proj.tech_stack.slice(0, 6).map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                            >
                              {tech}
                            </span>
                          ))}
                          {proj.tech_stack.length > 6 && (
                            <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs text-slate-500">
                              +{proj.tech_stack.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && profile && (
        <EditProfileModal
          profile={profile}
          onClose={() => setShowEditModal(false)}
          onSave={async (updates) => {
            await new Promise((resolve) => {
              updateProfile(updates, {
                onSuccess: resolve,
                onError: resolve,
              });
            });
          }}
        />
      )}
    </MainLayout>
  );
}
