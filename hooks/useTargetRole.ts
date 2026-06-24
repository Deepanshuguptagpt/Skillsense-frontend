import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { API_ROUTES } from '@/lib/constants';

export interface TargetRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export function useTargetRoles() {
  return useQuery({
    queryKey: ['target-roles'],
    queryFn: async () => {
      const res = await api.get<TargetRole[]>(API_ROUTES.TARGET_ROLES);
      return res.data;
    },
    staleTime: Infinity, // roles don't change
  });
}

export function useSetTargetRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (roleId: string) => {
      const res = await api.put(API_ROUTES.SET_TARGET_ROLE, { roleId });
      return res.data;
    },
    onSuccess: (data, roleId) => {
      // Optimistically update the profile cache with the new role so
      // dependents like hasTargetRole on the learning page reflect the
      // change immediately — without waiting for the background refetch.
      const roleName = data?.role?.name;
      queryClient.setQueryData(['profile'], (old: Record<string, unknown> | undefined) => {
        if (!old) return old;
        return {
          ...old,
          targetRoleId: roleId,
          targetRoleName: roleName ?? old.targetRoleName,
        };
      });

      // Invalidate to get fresh data from the server
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['readiness'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['learning-paths'] });
      queryClient.invalidateQueries({ queryKey: ['learning-milestones'] });
    },
  });
}
