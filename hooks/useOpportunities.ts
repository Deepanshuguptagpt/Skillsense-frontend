import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

export interface Opportunity {
  id: string;
  title: string;
  description?: string;
  role_type: string;
  required_skills?: Array<{ name: string; proficiency_level: number; mandatory: boolean }>;
  status: string;
  created_at: string;
  duration?: string;
  stipend?: string;
  match_score?: number;
  matched_skills?: string[];
  missing_skills?: string[];
  shortlisted?: boolean;
  applied?: boolean;
  applied_at?: string;
}

export function useOpportunities() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: Opportunity[] } | Opportunity[]>(
        API_ROUTES.OPPORTUNITIES
      );
      const raw = response.data as any;
      if (Array.isArray(raw)) return raw as Opportunity[];
      return (raw?.data || []) as Opportunity[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const applyMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.post<{ success: boolean; message: string }>(
        `${API_ROUTES.OPPORTUNITIES}/${jobId}/apply`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });

  return {
    opportunities: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    applyToOpportunity: applyMutation.mutateAsync,
    isApplying: applyMutation.isPending,
  };
}
