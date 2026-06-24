import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export interface DashboardMilestone {
  id: string;
  title: string;
  type: string;
  status: string;
  skill_name: string;
}

export interface DashboardOpportunity {
  id: string;
  title: string;
  role_type: string;
  created_at: string;
}

export interface DashboardData {
  readiness_score: number;
  top_gaps: Array<{
    skill_name: string;
    gap_severity: string;
    priority_score: number;
  }>;
  active_milestones: DashboardMilestone[];
  recent_opportunities: DashboardOpportunity[];
  skill_summary: { total: number; verified: number };
}

export function useDashboard() {
  const query = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get<{ success?: boolean } & DashboardData>('/profile/dashboard');
      return res.data as DashboardData;
    },
    staleTime: 2 * 60 * 1000,
  });

  return {
    dashboard: query.data,
    isLoading: query.isLoading,
  };
}
