import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/auth';
import api from '@/lib/api';

// Skill Priorities
export function useSkillPriorities(limit = 5) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['skill-priorities', user?.userId, limit],
    queryFn: async () => {
      if (!user?.userId) return null;

      const response = await api.get(
        `/api/v1/intelligence/skill-priorities/${user.userId}?limit=${limit}`
      );
      return response.data.data;
    },
    enabled: !!user?.userId,
    staleTime: 5 * 60 * 1000,
  });
}

// Profile Analysis
export function useProfileAnalysis(targetRoles?: string[], careerGoals?: string[]) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['profile-analysis', user?.userId, targetRoles, careerGoals],
    queryFn: async () => {
      if (!user?.userId) return null;

      const response = await api.post('/api/v1/intelligence/analyze-profile', {
        userId: user.userId,
        targetRoles: targetRoles || [],
        careerGoals: careerGoals || [],
        includePredictions: true,
      });
      return response.data.data;
    },
    enabled: !!user?.userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Internship Graph
export function useInternshipGraph(skillName?: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['internship-graph', user?.userId, skillName],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (skillName) params.append('skill_name', skillName);
      if (user?.userId) params.append('user_id', user.userId);

      const response = await api.get(
        `/api/v1/intelligence/internship-graph?${params.toString()}`
      );
      return response.data.data;
    },
    enabled: !!user?.userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Project Suggestions
export function useProjectSuggestions() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      targetSkills?: string[];
      careerGoals?: string[];
      timeAvailablePerWeek?: number;
      limit?: number;
    }) => {
      const response = await api.post('/api/v1/intelligence/suggest-projects', {
        userId: user?.userId,
        targetSkills: data.targetSkills || [],
        careerGoals: data.careerGoals || [],
        timeAvailablePerWeek: data.timeAvailablePerWeek || 14,
        limit: data.limit || 5,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

// Skill Progress Prediction
export function useSkillProgressPrediction(skillName: string, targetProficiency = 80) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['skill-progress', user?.userId, skillName, targetProficiency],
    queryFn: async () => {
      if (!user?.userId || !skillName) return null;

      const response = await api.get(
        `/api/v1/intelligence/predict/skill-progress/${user.userId}/${encodeURIComponent(skillName)}?target_proficiency=${targetProficiency}`
      );
      return response.data.data;
    },
    enabled: !!user?.userId && !!skillName,
    staleTime: 5 * 60 * 1000,
  });
}

// Career Roadmap
export function useCareerRoadmap() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (data: { targetRole: string; timelineMonths: number }) => {
      const response = await api.post('/api/v1/intelligence/career-roadmap', {
        userId: user?.userId,
        targetRole: data.targetRole,
        timelineMonths: data.timelineMonths,
      });
      return response.data.roadmap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async (data: {
      roadmapId: string;
      milestoneId: string;
      status: string;
      notes?: string;
    }) => {
      const response = await api.put(
        `/api/v1/intelligence/career-roadmap/${data.roadmapId}/progress`,
        {
          milestoneId: data.milestoneId,
          status: data.status,
          notes: data.notes,
        }
      );
      return response.data.roadmap;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });

  return {
    generateRoadmap: generateMutation.mutate,
    updateProgress: updateProgressMutation.mutate,
    isGenerating: generateMutation.isPending,
    isUpdating: updateProgressMutation.isPending,
  };
}

// Next Steps
export function useNextSteps(roadmapId?: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['next-steps', user?.userId, roadmapId],
    queryFn: async () => {
      if (!user?.userId || !roadmapId) return null;

      const response = await api.get(
        `/api/v1/intelligence/next-steps/${user.userId}/${roadmapId}`
      );
      return response.data.data;
    },
    enabled: !!user?.userId && !!roadmapId,
    staleTime: 5 * 60 * 1000,
  });
}

// Explanation System
export function useExplanation() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (data: {
      explanationType: string;
      context: Record<string, any>;
    }) => {
      const response = await api.post('/api/v1/intelligence/explain', {
        userId: user?.userId,
        explanationType: data.explanationType,
        context: data.context,
      });
      return response.data.explanation;
    },
  });
}
