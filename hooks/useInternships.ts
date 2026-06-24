import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES, CACHE_TIMES } from '@/lib/constants';
import type { ClassifiedInternships, Internship } from '@/types';
import type { ApiResponse } from '@/types/api';

export function useInternships() {
  // Fetch Classified Internships
  const classifiedQuery = useQuery({
    queryKey: ['internships', 'classified'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<ClassifiedInternships>>(
        API_ROUTES.INTERNSHIPS_CLASSIFY
      );
      return response.data.data!;
    },
    staleTime: CACHE_TIMES.INTERNSHIPS,
  });

  // Fetch All Internships
  const allInternshipsQuery = useQuery({
    queryKey: ['internships', 'all'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Internship[]>>(
        API_ROUTES.INTERNSHIPS
      );
      return response.data.data!;
    },
    staleTime: CACHE_TIMES.INTERNSHIPS,
  });

  return {
    classified: classifiedQuery.data,
    eligible: classifiedQuery.data?.eligible || [],
    almostEligible: classifiedQuery.data?.almostEligible || [],
    notEligible: classifiedQuery.data?.notEligible || [],
    allInternships: allInternshipsQuery.data || [],
    isLoading: classifiedQuery.isLoading,
    isError: classifiedQuery.isError,
    error: classifiedQuery.error,
  };
}

export function useInternship(internshipId: string) {
  return useQuery({
    queryKey: ['internships', internshipId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Internship>>(
        `${API_ROUTES.INTERNSHIPS}/${internshipId}`
      );
      return response.data.data!;
    },
    enabled: !!internshipId,
  });
}
