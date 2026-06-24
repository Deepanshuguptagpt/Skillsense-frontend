import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { useNotificationStore } from '@/lib/notifications';
import { API_ROUTES, CACHE_TIMES } from '@/lib/constants';
import { SkillStatus, SkillSource } from '@/types';
import type { SkillGraph, SkillNode } from '@/types';
import type { ApiResponse, AddSkillRequest } from '@/types/api';

export function useSkillGraph() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  // Fetch Skill Graph
  const skillGraphQuery = useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<SkillGraph>>(
        API_ROUTES.SKILLS
      );
      const data = response.data.data!;
      
      // Deduplicate skills by name (case-insensitive) to handle backend duplicates
      const uniqueMap = new Map<string, SkillNode>();
      data.skills.forEach((skill) => {
        const key = skill.name.toLowerCase();
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, skill);
        } else {
          const existing = uniqueMap.get(key)!;
          const isNewVerified = skill.status === SkillStatus.VERIFIED;
          const isExistingVerified = existing.status === SkillStatus.VERIFIED;
          
          // Preserve specific category over 'tool'
          const newCategory = skill.category !== 'tool' ? skill.category : existing.category;
          const existingCategory = existing.category !== 'tool' ? existing.category : skill.category;
          
          if (isNewVerified && !isExistingVerified) {
            uniqueMap.set(key, { ...skill, category: newCategory });
          } else if (!isNewVerified && isExistingVerified) {
            uniqueMap.set(key, { ...existing, category: existingCategory });
          } else {
            // Both same status, prefer higher proficiency
            if (skill.proficiencyLevel > existing.proficiencyLevel) {
              uniqueMap.set(key, { ...skill, category: newCategory });
            } else {
              uniqueMap.set(key, { ...existing, category: existingCategory });
            }
          }
        }
      });
      
      const dedupedSkills = Array.from(uniqueMap.values());
      
      return {
        ...data,
        skills: dedupedSkills,
        totalSkills: dedupedSkills.length,
        verifiedSkills: dedupedSkills.filter(s => s.status === SkillStatus.VERIFIED).length
      };
    },
    staleTime: CACHE_TIMES.SKILLS,
  });

  // Add Skill
  const addSkillMutation = useMutation({
    mutationFn: async (data: AddSkillRequest) => {
      const response = await api.post<ApiResponse<SkillNode>>(
        API_ROUTES.SKILLS,
        data
      );
      return response.data.data!;
    },
    onSuccess: (newSkill) => {
      // Optimistic update
      queryClient.setQueryData(['skills'], (old: SkillGraph | undefined) => {
        if (!old) return old;
        return {
          ...old,
          skills: [...old.skills, newSkill],
          totalSkills: old.totalSkills + 1,
        };
      });
      addNotification('success', 'Skill added successfully');
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  // Delete Skill
  const deleteSkillMutation = useMutation({
    mutationFn: async (skillId: string) => {
      await api.delete(`${API_ROUTES.SKILLS}/${skillId}`);
      return skillId;
    },
    onMutate: async (skillId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['skills'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData<SkillGraph>(['skills']);

      // Optimistic remove
      queryClient.setQueryData(['skills'], (old: SkillGraph | undefined) => {
        if (!old) return old;
        const filtered = old.skills.filter(s => s.skillId !== skillId);
        return {
          ...old,
          skills: filtered,
          totalSkills: filtered.length,
          verifiedSkills: filtered.filter(s => s.status === SkillStatus.VERIFIED).length,
        };
      });

      return { previous };
    },
    onError: (_err, _skillId, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['skills'], context.previous);
      }
      addNotification('error', 'Failed to delete skill');
    },
    onSuccess: () => {
      addNotification('success', 'Skill removed successfully');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
    },
  });

  return {
    skillGraph: skillGraphQuery.data,
    skills: skillGraphQuery.data?.skills || [],
    totalSkills: skillGraphQuery.data?.totalSkills || 0,
    verifiedSkills: skillGraphQuery.data?.verifiedSkills || 0,
    isLoading: skillGraphQuery.isLoading,
    isError: skillGraphQuery.isError,
    error: skillGraphQuery.error,
    addSkill: addSkillMutation.mutate,
    isAddingSkill: addSkillMutation.isPending,
    deleteSkill: deleteSkillMutation.mutate,
    isDeletingSkill: deleteSkillMutation.isPending,
  };
}

