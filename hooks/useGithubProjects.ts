import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { useNotificationStore } from '@/lib/notifications';

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  language: string | null;
  languages: string[];
  stars: number;
  forks: number;
  open_issues: number;
  topics: string[];
  visibility: string;
  updated_at: string | null;
  created_at: string | null;
  is_fork: boolean;
  homepage: string;
  // AI-enriched
  ai_summary: string;
  tech_stack: string[];
  skills: { name: string; category: string }[];
  project_type: string;
  has_ai_analysis: boolean;
}

export interface GithubProjectsData {
  connected: boolean;
  github_url: string | null;
  repos: GithubRepo[];
  project_summaries: {
    repo_name: string;
    repo_url: string;
    summary: string;
    tech_stack: string[];
    skills: { name: string; category: string }[];
    project_type: string;
    stars: number;
  }[];
  contribution_stats: {
    consistency_score?: number;
    active_weeks?: number;
    total_commits?: number;
  };
  last_ingested: string | null;
}

export function useGithubProjects() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  const query = useQuery<GithubProjectsData>({
    queryKey: ['github-projects'],
    queryFn: async () => {
      const res = await api.get('/candidates/github/projects');
      return res.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/candidates/github/refresh');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['github-projects'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      const added = data.skills_added?.length ?? 0;
      addNotification(
        'success',
        added > 0
          ? `GitHub synced! ${data.skills_extracted} skills found across your repos.`
          : 'GitHub synced — no new skills found.'
      );
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    repos: query.data?.repos ?? [],
    connected: query.data?.connected ?? false,
    githubUrl: query.data?.github_url ?? null,
    contributionStats: query.data?.contribution_stats ?? {},
    lastIngested: query.data?.last_ingested ?? null,
    refresh: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
  };
}
