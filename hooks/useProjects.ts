import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { useNotificationStore } from '@/lib/notifications';
import { API_ROUTES, CACHE_TIMES } from '@/lib/constants';
import type { GeneratedProject, ProjectStatus } from '@/types';
import type {
  ApiResponse,
  GenerateProjectRequest,
  UpdateProjectStatusRequest,
} from '@/types/api';

export function useProjects(status?: ProjectStatus) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  // Fetch Projects
  const projectsQuery = useQuery({
    queryKey: ['projects', status],
    queryFn: async () => {
      const url = status
        ? `${API_ROUTES.PROJECTS}?status=${status}`
        : API_ROUTES.PROJECTS;
      const response = await api.get<ApiResponse<GeneratedProject[]>>(url);
      return response.data.data!;
    },
    staleTime: CACHE_TIMES.PROJECTS,
  });

  // Generate Project
  const generateProjectMutation = useMutation({
    mutationFn: async (data: GenerateProjectRequest) => {
      const response = await api.post<ApiResponse<GeneratedProject>>(
        API_ROUTES.GENERATE_PROJECT,
        data
      );
      return response.data.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      addNotification('success', 'Project generated successfully!');
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  // Update Project Status
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      projectId,
      status,
    }: {
      projectId: string;
      status: ProjectStatus;
    }) => {
      const response = await api.put<ApiResponse<GeneratedProject>>(
        API_ROUTES.PROJECT_STATUS(projectId),
        { status } as UpdateProjectStatusRequest
      );
      return response.data.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', data.projectId] });
      addNotification('success', 'Project status updated');
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  // Complete Project
  const completeProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await api.post(API_ROUTES.PROJECT_COMPLETE(projectId));
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      queryClient.invalidateQueries({ queryKey: ['internships'] });
      addNotification(
        'success',
        `Project completed! ${data.verifiedSkills.length} skills verified. ${data.newEligibleInternships} new internships unlocked!`
      );
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    error: projectsQuery.error,
    generateProject: generateProjectMutation.mutate,
    isGenerating: generateProjectMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    completeProject: completeProjectMutation.mutate,
    isCompleting: completeProjectMutation.isPending,
  };
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get<ApiResponse<GeneratedProject>>(
        `${API_ROUTES.PROJECTS}/${projectId}`
      );
      return response.data.data!;
    },
    enabled: !!projectId,
  });
}
