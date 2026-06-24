import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';
import { notify } from '@/hooks/useNotifications';

export interface Application {
  id: string;
  internshipId: string;
  internshipTitle: string;
  company: string;
  status: 'saved' | 'applied' | 'shortlisted' | 'rejected' | 'withdrawn';
  notes?: string;
  applicationUrl?: string;
  appliedAt?: string;
  updatedAt?: string;
}

export interface ApplicationStats {
  saved: number;
  applied: number;
  shortlisted: number;
  rejected: number;
  withdrawn: number;
  total: number;
}

export function useApplications() {
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: Application[] }>(API_ROUTES.APPLICATIONS);
      return res.data.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const { data: stats } = useQuery({
    queryKey: ['application-stats'],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: ApplicationStats }>(API_ROUTES.APPLICATION_STATS);
      return res.data.data;
    },
    staleTime: 2 * 60 * 1000,
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: {
      internship_id: string;
      internship_title: string;
      company: string;
      status: string;
      notes?: string;
      application_url?: string;
    }) => {
      const res = await api.post(API_ROUTES.APPLICATIONS, data);
      return res.data;
    },
    onSuccess: (_, vars) => {
      const statusLabel: Record<string, string> = {
        saved: 'Saved to tracker!',
        applied: 'Marked as Applied!',
        shortlisted: 'Marked as Shortlisted!',
        rejected: 'Marked as Rejected.',
        withdrawn: 'Application withdrawn.',
      };
      notify.success(statusLabel[vars.status] || 'Application updated!');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
    },
    onError: () => notify.error('Failed to update application. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(API_ROUTES.APPLICATION_DELETE(id));
    },
    onSuccess: () => {
      notify.success('Application removed from tracker.');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
    },
    onError: () => notify.error('Failed to remove application.'),
  });

  const getStatusForInternship = (internshipId: string): Application['status'] | null => {
    const app = applications.find(a => a.internshipId === internshipId);
    return app?.status ?? null;
  };

  return {
    applications,
    stats,
    isLoading,
    upsertApplication: upsertMutation.mutate,
    deleteApplication: deleteMutation.mutate,
    isUpserting: upsertMutation.isPending,
    getStatusForInternship,
  };
}
