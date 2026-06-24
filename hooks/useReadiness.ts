import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

export interface SkillGap {
  skill_name: string;
  gap_severity: 'critical' | 'moderate' | 'minor';
  current_proficiency: number;
  required_proficiency: number;
  current_confidence: number;
  required_confidence: number;
  priority_score: number;
}

export interface ReadinessData {
  score: number;
  classification: 'eligible' | 'almost-eligible' | 'not-eligible';
  role_name?: string;
  role_slug?: string;
  message?: string;
  gaps: SkillGap[];
}

export function useReadiness() {
  const query = useQuery({
    queryKey: ['readiness'],
    queryFn: async () => {
      const response = await api.get<{ success: boolean; data: ReadinessData }>(
        API_ROUTES.READINESS
      );
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    readiness: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
