import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '@/lib/api';
import { useNotificationStore } from '@/lib/notifications';
import { API_ROUTES, CACHE_TIMES } from '@/lib/constants';
import type { StudentProfile } from '@/types';
import type { ApiResponse, UploadResumeResponse } from '@/types/api';

export function useProfile() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotificationStore();

  // Fetch Profile
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<StudentProfile>>(
        API_ROUTES.PROFILE
      );
      return response.data.data ?? null;
    },
    staleTime: CACHE_TIMES.PROFILE,
  });

  // Update Profile
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<StudentProfile>) => {
      const response = await api.put<ApiResponse<StudentProfile>>(
        API_ROUTES.PROFILE,
        data
      );
      return response.data.data!;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      addNotification('success', 'Profile updated successfully');
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  // Upload Resume
  const uploadResumeMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<UploadResumeResponse>(
        API_ROUTES.UPLOAD_RESUME,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      
      // Show notification
      addNotification(
        'success',
        'Resume uploaded successfully'
      );
    },
    onError: (error) => {
      addNotification('error', getErrorMessage(error));
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    uploadResume: async (file: File) => {
      const result = await uploadResumeMutation.mutateAsync(file);
      return result;
    },
    isUploading: uploadResumeMutation.isPending,
    uploadProgress: uploadResumeMutation.isPending ? 50 : 0,
  };
}
